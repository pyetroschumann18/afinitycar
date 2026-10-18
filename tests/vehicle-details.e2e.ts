import { expect, test } from "@playwright/test";

const vehicles = [
  { id: "onix-plus-2021", name: "Chevrolet Onix Plus LT Turbo Manual", year: "2021", mileage: "59.000 km" },
  { id: "corolla-2013", name: "Toyota Corolla XEi 2.0 Automático", year: "2013", mileage: "113.000 km" },
  { id: "hb20-2015", name: "Hyundai HB20 Flex Manual", year: "2015", mileage: "85.970 km" },
  { id: "civic-g8-2008", name: "Honda Civic G8 LXS 1.8 Automático", year: "2008", mileage: "135.000 km" },
];

for (const vehicle of vehicles) {
  test(`Ver mais abre a página do ${vehicle.name}`, async ({ page }) => {
    await page.goto("/");
    const card = page.locator(".vehicle-card").filter({ hasText: vehicle.name.split(" ").slice(-2).join(" ") });
    await card.getByRole("link", { name: /Ver mais sobre/ }).click();
    await expect(page).toHaveURL(new RegExp(`/veiculos/${vehicle.id}$`));
    await expect(page.getByRole("heading", { level: 1, name: vehicle.name })).toBeVisible();
    await expect(page.locator(".vehicle-detail-facts dd").filter({ hasText: vehicle.mileage })).toBeVisible();
    await expect(page.locator(".vehicle-detail-facts dd").filter({ hasText: new RegExp(`^${vehicle.year}$`) })).toBeVisible();
    await expect(page.locator(".vehicle-detail-photo img").first()).toBeVisible();
    await expect(page.getByText(/\d+ fotos? disponíveis/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Tenho interesse neste veículo/i })).toHaveAttribute("href", new RegExp(`veiculo=${vehicle.id}`));
  });
}

test("the detail CTA returns to the form with the vehicle selected", async ({ page }) => {
  await page.goto("/veiculos/onix-plus-2021");
  await page.getByRole("link", { name: /Tenho interesse neste veículo/i }).click();
  await expect(page).toHaveURL(/veiculo=onix-plus-2021/);
  await expect(page.getByText(/Interesse: Chevrolet Onix Plus/i)).toBeVisible();
});

test("detail has a single return link and fits a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/veiculos/civic-g8-2008");
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Voltar aos veículos/ })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  await expect(page.getByRole("link", { name: "Ver mais" })).toHaveCount(0);
});

test("compact cards keep the photo clear, highlight interest, and footer sends buyers to the form", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/#veiculos");
  const cards = page.locator(".vehicle-card");
  await expect(cards).toHaveCount(4);
  const height = await cards.first().evaluate((card) => card.getBoundingClientRect().height);
  expect(height).toBeLessThan(290);
  await expect(cards.first().locator(".vehicle-photo-tags")).toHaveCount(0);
  const interestColor = await cards.first().getByRole("button", { name: /Selecionar Chevrolet Onix Plus/ }).evaluate((button) => getComputedStyle(button).backgroundColor);
  expect(interestColor).toBe("rgb(255, 107, 44)");
  await expect(page.getByRole("link", { name: /Conversar pelo WhatsApp/ })).toHaveCount(0);
  await expect(page.locator("footer a[href*='wa.me']")).toHaveCount(0);
  await page.getByRole("link", { name: /Preencher formulário/ }).click();
  await expect(page).toHaveURL(/#qualificacao$/);
});
