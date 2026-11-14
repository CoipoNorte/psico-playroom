// Captura la escena de cada habitación (para revisar decoración y colocación).
import { chromium } from "playwright";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const slugs = ["vestibulo", "peluches", "instrumentos", "cocina", "creatividad", "lectura", "respiracion", "jardin", "movimiento", "estrellas"];
for (const s of slugs) {
  await p.goto(`http://localhost:4173/#/habitacion/${s}`);
  await p.waitForSelector("h1");
  await p.waitForTimeout(400);
  await p.locator('[role="group"][aria-label^="Escena"]').screenshot({ path: `shots/room-${s}.png` });
}
await b.close();
