// Prueba de humo en navegador: abre cada objeto y ejercita las experiencias clave.
// Uso: npm run build && servir dist/ en :4173 && node scripts/e2e.mjs
// Requiere Playwright instalado en el proyecto (npm install --no-save playwright).
import { chromium } from "playwright";

const errors = [];
const browser = await chromium.launch();
const U = "http://localhost:4173/";
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on("console", (m) => {
  // Ruido del driver SwiftShader de Chromium headless al componer un canvas WebGL.
  if (m.text().includes("GPU stall due to ReadPixels")) return;
  if (m.type() === "error" || m.type() === "warning") errors.push(`console.${m.type()}: ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
const log = (...a) => console.log(...a);
const openObj = async (slug, label) => {
  await page.goto(U + `#/habitacion/${slug}`);
  await page.waitForSelector("h1");
  await page.click(`button[aria-label="${label}"]`);
  await page.waitForSelector("dialog[open]", { timeout: 3000 });
  await page.waitForTimeout(250);
  return page.locator("dialog[open]");
};
const close = async () => { await page.keyboard.press("Escape"); await page.waitForTimeout(150); };

const slugs = ["vestibulo", "peluches", "instrumentos", "cocina", "creatividad", "lectura", "respiracion", "jardin", "movimiento", "estrellas"];
let opened = 0;
const missing = [];
for (const slug of slugs) {
  await page.goto(U + `#/habitacion/${slug}`);
  await page.waitForSelector("h1");
  const labels = await page.locator(".scene-object").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  for (const label of labels) {
    await page.click(`button[aria-label="${label}"]`);
    try {
      await page.waitForSelector("dialog[open]", { timeout: 2000 });
      opened++;
      await page.waitForTimeout(350);
      await close();
    } catch {
      missing.push(`${slug}/${label}`);
    }
  }
}
log("opened", opened, "missing", missing);

let d = await openObj("creatividad", "Tangram");
const piece = d.locator('g[role="button"][aria-label^="Cuadrado"]');
await piece.focus();
await page.keyboard.press("r");
log("tangram rot label:", await piece.getAttribute("aria-label"));
const bb = await piece.boundingBox();
await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
await page.mouse.down();
await page.mouse.move(bb.x + 100, bb.y - 120, { steps: 10 });
await page.mouse.up();
const bb2 = await piece.boundingBox();
log("tangram drag moved", Math.round(bb2.x - bb.x), Math.round(bb2.y - bb.y));
await close();

d = await openObj("peluches", "Oso de peluche");
const svg = d.locator('svg[aria-label="El oso de peluche"]');
const sb = await svg.boundingBox();
await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
await page.mouse.down();
for (let i = 0; i < 12; i++) { await page.mouse.move(sb.x + sb.width / 2 + i * 8, sb.y + sb.height / 2 + (i % 2) * 10); await page.waitForTimeout(60); }
await page.mouse.up();
await d.locator('button:has-text("Estoy contento")').click();
await page.waitForTimeout(1500);
log("companion:", await d.locator('p[role="status"]').innerText(), "|", await d.locator(".rounded-2xl.bg-soft").last().innerText());
await close();

d = await openObj("lectura", "Estante de libros");
await d.locator('button:has-text("El faro y la niebla")').click();
await d.locator('button:has-text("Pasar página")').click();
await d.locator('button:has-text("Pasar página")').click();
log("reader page:", await d.locator("article p.text-center").innerText());
await close();
d = await openObj("lectura", "Marcapáginas");
log("bookmark resume:", await d.locator("article p.text-center").innerText(), await d.locator("article p.uppercase").innerText());
await close();

d = await openObj("estrellas", "Telescopio");
await page.waitForTimeout(300);
const sky = d.locator('svg[aria-label^="Cielo"]');
const kb = await sky.boundingBox();
await page.mouse.move(kb.x + kb.width * 0.3, kb.y + kb.height * 0.4);
await page.waitForTimeout(200);
for (const id of ["1000", "1001"]) {
  const st = await page.locator(`circle[data-star="${id}"]`).boundingBox();
  await page.mouse.click(st.x + st.width / 2, st.y + st.height / 2);
}
log("sky save visible:", await d.locator('input[aria-label="Nombre de tu constelación"]').count());
await d.locator('input[aria-label="Nombre de tu constelación"]').fill("La cuchara");
await d.locator('button:has-text("Guardar")').click();
log("saved constellations:", await d.locator('li:has-text("La cuchara")').count());
await close();
d = await openObj("estrellas", "Planetario");
await page.waitForTimeout(300);
await d.locator('li button:has-text("Saturno")').click();
log("planet:", await d.locator('[aria-live="polite"] p.text-xl').innerText());
await close();
d = await openObj("estrellas", "Luna");
log("moon:", await d.locator("p.text-2xl").innerText());
await close();

d = await openObj("jardin", "Semilla");
await d.locator('button:has-text("Girasol")').click();
for (let i = 0; i < 3; i++) await d.locator('button:has-text("Regar")').click();
log("garden:", await d.locator("p.font-bold").first().innerText(), "|", await d.locator('p[role="status"]').innerText());
await close();
await page.reload();
await page.waitForSelector("h1");
d = await openObj("jardin", "Maceta");
log("garden persisted:", await d.locator("p.font-bold").first().innerText());
await close();

d = await openObj("instrumentos", "Xilófono");
await d.locator('[aria-label="Teclas del xilófono"]').focus();
await page.keyboard.press("1");
await page.keyboard.press("5");
await d.locator('button:has-text("Grabar")').click();
await d.locator('button[aria-label^="Mi"]').click();
await d.locator('button:has-text("Terminar grabación")').click();
log("xylo playback enabled:", await d.locator('button:has-text("Escuchar la mía")').isEnabled());
await close();
d = await openObj("instrumentos", "Flauta");
await d.locator('button[aria-label="Agujero 1"]').click();
await d.locator('button[aria-label="Agujero 2"]').click();
log("flute note:", await d.locator("span.text-lg").innerText());
await close();

d = await openObj("creatividad", "Hojas de papel");
await d.locator('button:has-text("estoy bien")').click();
await d.locator('button:has-text("Arrugarlo")').click();
await page.waitForTimeout(1700);
log("paper after crumple:", "(palabras)", "|", await d.locator('p[role="status"]').innerText());
await close();

d = await openObj("cocina", "Taza");
await d.locator('button:has-text("Té negro")').click();
await d.locator('button:has-text("Dejar reposar")').click();
await page.waitForTimeout(1200);
log("tea timer:", await d.locator("p.text-4xl").innerText());
await close();
d = await openObj("cocina", "Delantal");
await d.locator('button:has-text("Tostada")').click();
await d.locator('button:has-text("Siguiente")').click();
log("recipe step:", await d.locator("p.uppercase").innerText());
await close();

d = await openObj("respiracion", "Vela");
await d.locator('button:has-text("Bajar la luz")').click();
await page.waitForTimeout(100);
log("dim overlay:", await page.locator("div.fixed.inset-0").count());
await close();
await page.waitForTimeout(100);
log("dim after close:", await page.locator("div.fixed.inset-0").count());

d = await openObj("vestibulo", "Perchero");
await d.locator('button:has-text("Una tarea pendiente")').click();
await close();
await page.reload();
d = await openObj("vestibulo", "Perchero");
log("coats:", await d.locator("summary").count());
await close();

await ctx.close();
const m = await browser.newContext({ viewport: { width: 375, height: 740 }, hasTouch: true, isMobile: true });
const mp = await m.newPage();
mp.on("console", (x) => { if (x.type() === "error") errors.push("m console: " + x.text()); });
mp.on("pageerror", (e) => errors.push(`m pageerror: ${e.message}`));
await mp.goto(U + "#/habitacion/creatividad");
await mp.waitForSelector("h1");
await mp.tap('button[aria-label="Tangram"]');
await mp.waitForSelector("dialog[open]");
await mp.waitForTimeout(400);
log("mobile overflow:", await mp.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));
await mp.keyboard.press("Escape");
await mp.goto(U + "#/habitacion/peluches");
await mp.tap('button[aria-label="Oso de peluche"]');
await mp.waitForSelector("dialog[open]");
await mp.waitForTimeout(400);
await m.close();
console.log("ERRORS", errors.length);
errors.slice(0, 15).forEach((e) => console.log(e));
await browser.close();
