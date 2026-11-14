// Prueba visual del modelo 3D (WebGL2) y de las pestañas A/B.
// Nota: las capturas de Chromium sobre SwiftShader emiten avisos de rendimiento
// "GPU stall due to ReadPixels". Son ruido del driver de pruebas, no de la app.
import { chromium } from "playwright";

const b = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
p.on("console", (m) => {
  if (m.text().includes("GPU stall due to ReadPixels")) return; // ruido del driver de capturas
  if (m.type() === "error" || m.type() === "warning") errs.push(`${m.type()}: ${m.text().slice(0, 220)}`);
});

await p.goto("http://localhost:4173/#/habitacion/estrellas");
await p.waitForSelector("h1");
await p.click('button[aria-label="Maqueta del sistema"]');
await p.waitForSelector("dialog[open]");
await p.waitForTimeout(2200);

const canvas = p.locator("dialog[open] canvas");
console.log("canvas", await canvas.count());
const box = await canvas.first().boundingBox();
console.log("size", box && Math.round(box.width), box && Math.round(box.height));

const pixels = await p.evaluate(() => {
  const c = document.querySelector("dialog[open] canvas");
  if (!c) return "sin canvas";
  const gl = c.getContext("webgl2");
  if (!gl) return "sin webgl2";
  const px = new Uint8Array(4);
  const samples = [];
  for (const [x, y] of [[c.width / 2, c.height / 2], [c.width * 0.3, c.height * 0.5], [c.width * 0.7, c.height * 0.5]]) {
    gl.readPixels(Math.floor(x), Math.floor(y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    samples.push([...px]);
  }
  return samples;
});
console.log("pixels", JSON.stringify(pixels));
await p.screenshot({ path: "shots/modelo3d.png" });

const d1 = await p.locator("dialog[open] .tabular-nums").first().innerText();
await p.waitForTimeout(1600);
const d2 = await p.locator("dialog[open] .tabular-nums").first().innerText();
console.log("fecha", d1, "->", d2);

await p.locator('button:has-text("Júpiter")').first().click();
await p.waitForTimeout(1200);
console.log("info", (await p.locator('dialog[open] [aria-live="polite"]').innerText()).replace(/\n+/g, " | ").slice(0, 200));
await p.screenshot({ path: "shots/modelo3d-jupiter.png" });

await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await p.mouse.down();
await p.mouse.move(box.x + box.width / 2 + 130, box.y + box.height / 2 + 50, { steps: 8 });
await p.mouse.up();
await p.locator('button[aria-label="Acercar"]').click();
await p.locator('button[aria-label="Girar a la izquierda"]').click();
await p.waitForTimeout(400);

await p.keyboard.press("Escape");
await p.click('button[aria-label="Planetario"]');
await p.waitForSelector("dialog[open]");
await p.locator("#tab-mapa").click();
console.log("tab A", await p.locator("#tab-mapa").getAttribute("aria-selected"));
await p.locator("#tab-modelo").click();
await p.waitForTimeout(1200);
console.log("tab B", await p.locator("#tab-modelo").getAttribute("aria-selected"), "canvas", await p.locator("dialog[open] canvas").count());
console.log("errores", errs.length, errs.slice(0, 8));
await b.close();
