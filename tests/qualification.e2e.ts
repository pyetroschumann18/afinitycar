import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function choose(page: Page, label: string) {
  await page.locator(".choice-card").filter({ hasText: label }).click();
}

async function reachContact(page: Page) {
  await choose(page, "Carro");
  await choose(page, "À vista");
  await choose(page, "R$20.000 – R$30.000");
  await page.getByLabel("Sua cidade").fill("Cidade exemplo");
  await page.getByRole("button", { name: "Continuar" }).click();
  await choose(page, "Não");
}

test("conclui a demonstração sem enviar dados", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/")) requests.push(request.url());
  });

  await page.goto("/");
  await reachContact(page);
  await page.getByLabel("Seu nome").fill("Visitante");
  await page.getByLabel("Seu WhatsApp").fill("(11) 99999-9999");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Concluir demonstração" }).click();

  await expect(page.getByRole("heading", { name: "Demonstração concluída." })).toBeVisible();
  await expect(page.getByText("Nenhum dado foi enviado ou armazenado.")).toBeVisible();
  expect(requests).toHaveLength(0);
});

test("campo do veículo aceita texto livre", async ({ page }) => {
  await page.goto("/");
  await choose(page, "Carro");
  await choose(page, "Financiamento");
  await choose(page, "R$20.000 – R$30.000");
  await choose(page, "R$3.000 – R$5.000");
  await page.getByLabel("Valor em reais (R$)").fill("850");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Sua cidade").fill("Cidade exemplo");
  await page.getByRole("button", { name: "Continuar" }).click();
  await choose(page, "Sim");

  const vehicle = page.getByLabel("Modelo, anúncio ou link");
  await vehicle.fill("Veículo visto em um anúncio");
  await expect(vehicle).toHaveValue("Veículo visto em um anúncio");
});

test("catálogo mobile mantém duas colunas sem rolagem horizontal", async ({ page }) => {
  for (const width of [320, 375, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const layout = await page.locator(".vehicles-grid").evaluate((grid) => ({
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    expect(layout.columns, `columns at ${width}px`).toBe(2);
    expect(layout.overflow, `overflow at ${width}px`).toBe(false);
  }
});
