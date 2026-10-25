// Mede o peso e o LCP das páginas principais num celular simulado (4G lento + CPU 4x).
// Uso: npm run build && npm start (porta 3200) e, em outro terminal, node scripts/measure-performance.mjs
import { chromium, devices } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3200";
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/veiculos/strada-endurance-2022"];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
for (const path of paths) {
  const context = await browser.newContext({ ...devices["Pixel 7"] });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const bytes = { script: 0, image: 0, font: 0, stylesheet: 0, document: 0, other: 0 };
  const thirdParty = new Set();
  page.on("response", async (response) => {
    const type = response.request().resourceType();
    const url = new URL(response.url());
    if (!url.host.includes("127.0.0.1") && !url.host.includes("localhost")) thirdParty.add(url.host);
    try {
      const size = (await response.body()).length;
      bytes[type in bytes ? type : "other"] += size;
    } catch { /* redirects have no body */ }
  });

  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__lcp = e.startTime; })
      .observe({ type: "largest-contentful-paint", buffered: true });
    window.__cls = 0;
    new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
      .observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(base + path, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const metrics = await page.evaluate(() => ({
    lcp: Math.round(window.__lcp),
    cls: Number(window.__cls.toFixed(3)),
    fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  const kb = Object.fromEntries(Object.entries(bytes).map(([k, v]) => [k, Math.round(v / 1024)]));
  const total = Object.values(kb).reduce((a, b) => a + b, 0);
  console.log(JSON.stringify({ path, ...metrics, totalKB: total, kb, thirdParty: [...thirdParty] }));
  await context.close();
}
await browser.close();
