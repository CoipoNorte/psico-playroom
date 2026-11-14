// Prueba exhaustiva: abre cada objeto y pulsa todos sus botones, mantiene los de «mantén pulsado»
// y arrastra sobre lienzos/escenas. Informa errores de consola y botones que rompen la experiencia.
import { chromium } from "playwright";

const U = "http://localhost:4173/";
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("console", (m) => { if (m.type() === "error") errors.push(`[${current}] console: ${m.text()}`); });
page.on("pageerror", (e) => errors.push(`[${current}] pageerror: ${e.message}`));
page.on("dialog", (d) => d.accept());
let current = "";
const T0 = Date.now();

const SKIP = /^(cerrar(?! el paraguas)|×)|diario|creciera|unirías|cómo estuvo|escribirlo|anotarlo|guardarlo/i;
const ALL = ["vestibulo", "peluches", "instrumentos", "cocina", "creatividad", "lectura", "respiracion", "jardin", "movimiento", "estrellas"];
const slugs = process.env.SLUGS ? process.env.SLUGS.split(",") : ALL;
const summary = [];

async function openObject(slug, label) {
  await page.goto(U + `#/habitacion/${slug}`);
  await page.waitForSelector("h1");
  await page.click(`button[aria-label="${label}"]`);
  await page.waitForSelector("dialog[open]", { timeout: 3000 });
  await page.waitForTimeout(200);
}

for (const slug of slugs) {
  await page.goto(U + `#/habitacion/${slug}`);
  await page.waitForSelector("h1");
  const labels = await page.locator(".scene-object").evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  for (const label of labels) {
    current = `${slug}/${label}`;
    await openObject(slug, label);
    let clicked = 0;
    let held = 0;
    let dragged = 0;
    const seen = new Set();
    for (let round = 0; round < 2; round++) {
      const buttons = page.locator("dialog[open] button:visible, dialog[open] [role=button]:visible");
      const n = Math.min(await buttons.count(), 45);
      for (let i = 0; i < n; i++) {
        const b = buttons.nth(i);
        let text = "";
        try {
          text = ((await b.getAttribute("aria-label")) || (await b.innerText({ timeout: 300 })) || "").trim();
        } catch { continue; }
        if (SKIP.test(text) || seen.has(text + i)) continue;
        seen.add(text + i);
        if (process.env.TRACE) console.error("  >", ((Date.now() - T0) / 1000).toFixed(1), current, i, text.slice(0, 30).replace(/\n/g, " "));
        try {
          if (!(await b.isEnabled({ timeout: 200 }))) continue;
          if (/mantén pulsado/i.test(text)) {
            const box = await b.boundingBox();
            if (!box) continue;
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.waitForTimeout(1300);
            await page.mouse.up();
            held++;
          } else {
            await b.click({ timeout: 800, force: true });
            clicked++;
          }
          await page.waitForTimeout(60);
        } catch { /* elementos que se mueven (planetas) o desaparecen */ }
        if (!(await page.locator("dialog[open]").count())) {
          await openObject(slug, label);
        }
      }
    }
    // Arrastre sobre lienzos, svgs y canvas grandes
    const surfaces = page.locator("dialog[open] canvas:visible, dialog[open] svg.touch-none:visible, dialog[open] svg[role=img]:visible, dialog[open] [role=img].touch-none:visible");
    const sc = await surfaces.count();
    for (let i = 0; i < Math.min(sc, 2); i++) {
      const box = await surfaces.nth(i).boundingBox();
      if (!box || box.width < 120) continue;
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4);
      await page.mouse.down();
      for (let k = 0; k < 14; k++) await page.mouse.move(box.x + box.width * (0.3 + k * 0.03), box.y + box.height * (0.4 + Math.sin(k) * 0.1));
      await page.mouse.up();
      dragged++;
    }
    const alive = await page.locator("dialog[open]").count();
    const line = `${current}: ${clicked} toques, ${held} pulsaciones largas, ${dragged} arrastres${alive ? "" : " (cerrada)"}`;
    summary.push(line);
    console.error("·", line);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
  }
}

// Navegación: instructivo y casa
current = "home";
await page.goto(U);
await page.waitForSelector("h1");
const entrance = await page.locator('a[href="#/casa"]').count();
await page.goto(U + "#/casa");
await page.waitForSelector("h1");
await page.click('button:has-text("Calmarme")');
const suggested = await page.locator('a[aria-describedby="map-suggested"]').count();
await page.fill("#buscar-habitacion", "musica");
const searchCount = await page.locator('nav[aria-label="Lista de habitaciones"] li').count().catch(() => -1);
await page.fill("#buscar-habitacion", "");
await page.click('button:has-text("Lista")');
const listItems = await page.locator('nav[aria-label="Lista de habitaciones"] li').count();
const continueBtn = await page.locator('a:has-text("Seguir en")').count();
console.log(summary.join("\n"));
console.log(`\ninstructivo: entradas a la casa=${entrance}; casa: sugeridas en mapa=${suggested}, búsqueda="musica"→${searchCount}, elementos en lista=${listItems}, botón continuar=${continueBtn}`);
console.log(`ERRORES: ${errors.length}`);
errors.slice(0, 20).forEach((e) => console.log(e));
await browser.close();
