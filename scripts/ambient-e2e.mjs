// Run against `npm run dev -- --host 127.0.0.1`; Playwright is optional tooling.
import { chromium } from "playwright";

const browser = await chromium.launch();
const errors = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const slugs = ["vestibulo", "peluches", "instrumentos", "cocina", "creatividad", "lectura", "respiracion", "jardin", "movimiento", "estrellas"];
const base = "http://127.0.0.1:5173";

for (const slug of slugs) {
  await page.goto(`${base}/#/habitacion/${slug}`);
  await page.locator(".room-atmosphere").waitFor();
  const scene = page.locator('[role="group"][aria-label^="Escena de"]');
  const initial = await scene.locator(".room-atmosphere").getAttribute("class");
  if (!initial) throw new Error(`Sin ambiente: ${slug}`);
  const controls = page.locator(".ambient-control");
  if ((await controls.count()) !== 2) throw new Error(`Faltan controles: ${slug}`);
  await controls.nth(1).click();
  if ((await controls.nth(1).getAttribute("aria-pressed")) !== "false") throw new Error(`El ambiente no responde: ${slug}`);
  await controls.nth(0).click();
  if ((await controls.nth(0).getAttribute("aria-pressed")) !== "false") throw new Error(`La ventana no responde: ${slug}`);
  await page.reload();
  if ((await page.locator(".ambient-control").nth(0).getAttribute("aria-pressed")) !== "false") throw new Error(`No persiste la ventana: ${slug}`);
  if ((await page.locator(".ambient-control").nth(1).getAttribute("aria-pressed")) !== "false") throw new Error(`No persiste el ambiente: ${slug}`);
  await page.locator(".scene-window").click();
  if ((await page.locator(".scene-window").getAttribute("aria-pressed")) !== "true") throw new Error(`La ventana visual no responde: ${slug}`);

  if (slug !== "vestibulo") {
    const guide = page.locator("section").filter({ has: page.getByText("Actividad opcional", { exact: true }) }).first();
    const action = guide.locator(".guide-object");
    await action.waitFor();
    await action.click();
    await page.locator("dialog[open]").waitFor();
    await page.keyboard.press("Escape");
    await guide.getByRole("button", { name: "Siguiente" }).click();
    if (!(await guide.getByText("Etapa 2 de", { exact: false }).count())) throw new Error(`La guía no avanza: ${slug}`);
    await guide.getByRole("button", { name: /Volver a la etapa 1/ }).click();
    await page.reload();
    if (!(await page.getByText("Etapa 1 de", { exact: false }).count())) throw new Error(`La guía no persiste: ${slug}`);
  }
}

await page.goto(`${base}/#/habitacion/jardin`);
await page.locator('button[aria-label="Semilla"]').click();
await page.locator("dialog[open]").waitFor();
await page.getByRole("button", { name: /Girasol/ }).click();
await page.keyboard.press("Escape");
if (!(await page.locator('button[aria-label="Maceta"]').innerText()).includes("🌱")) {
  throw new Error("La planta de la escena no refleja la semilla que se plantó");
}
await page.reload();
if (!(await page.locator('button[aria-label="Maceta"]').innerText()).includes("🌱")) {
  throw new Error("La planta visible no persiste al recargar");
}

const mobile = await browser.newPage({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
mobile.on("pageerror", (error) => errors.push(error.message));
await mobile.goto(`${base}/#/habitacion/peluches`);
await mobile.locator(".ambient-control").first().tap();
const scroll = await mobile.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
if (scroll.document > scroll.viewport) throw new Error(`Desbordamiento móvil: ${JSON.stringify(scroll)}`);

const reduced = await browser.newPage({ reducedMotion: "reduce" });
await reduced.goto(`${base}/#/habitacion/respiracion`);
await reduced.locator(".room-atmosphere").waitFor();
const motion = await reduced.locator(".atmosphere-breath").first().evaluate((el) => getComputedStyle(el).animationName);
if (motion !== "none") throw new Error(`No respeta reduced motion: ${motion}`);

console.log(`Ambientes verificados: ${slugs.length}; guía, persistencia, móvil y movimiento reducido: OK`);
console.log(`Errores de consola: ${errors.length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
await browser.close();