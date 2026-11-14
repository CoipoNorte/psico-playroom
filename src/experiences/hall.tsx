import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { startRain } from "../lib/audio";
import { useComfort } from "../lib/comfort";
import { ageShort, ROOMS } from "../lib/rooms-data";
import { roomHref } from "../lib/router";
import { Caption, Note, type ExperienceProps } from "./shared";

/* ====================================================================== */
/* Paraguas: quedarse un rato bajo la lluvia, a resguardo.                   */
/* ====================================================================== */

export function Rain(_p: ExperienceProps) {
  const { comfort } = useComfort();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [level, setLevel] = useState(0.5);
  const levelRef = useRef(level);
  levelRef.current = level;
  const [open, setOpen] = useState(true);
  const rain = useRef<ReturnType<typeof startRain> | null>(null);

  useEffect(() => {
    if (comfort.sound) rain.current = startRain(level);
    return () => rain.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comfort.sound]);
  useEffect(() => rain.current?.setLevel(level), [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const W = canvas.width;
    const H = canvas.height;
    const drops = Array.from({ length: 220 }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 8 + Math.random() * 14, v: 4 + Math.random() * 6 }));
    let raf = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const k = Math.min(2.5, (now - last) / 16.67);
      last = now;
      g.fillStyle = "#6f7f93";
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#4f5a6b";
      g.fillRect(0, H - 30, W, 30);
      const n = Math.floor(40 + levelRef.current * 180);
      g.strokeStyle = "rgba(220,230,245,0.7)";
      g.lineWidth = 1.5;
      for (let i = 0; i < n; i++) {
        const d = drops[i];
        g.beginPath();
        g.moveTo(d.x, d.y);
        g.lineTo(d.x - 2, d.y + d.l);
        g.stroke();
        d.y += d.v * (0.6 + levelRef.current) * (comfort.reduceMotion ? 0.3 : 1) * k;
        d.x -= 0.6 * k;
        if (d.y > H - 30) {
          d.y = -20;
          d.x = Math.random() * (W + 40);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [comfort.reduceMotion]);

  return (
    <div className="space-y-4">
      <Caption>Afuera llueve. Puedes regular cuánto, abrir o cerrar el paraguas, y quedarte el rato que quieras escuchando. {comfort.sound ? "" : "Con el sonido activado también se oye."}</Caption>
      <div className="relative overflow-hidden rounded-2xl">
        <canvas ref={canvasRef} width={640} height={400} role="img" aria-label="Lluvia" className="block aspect-[8/5] w-full" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <span className="text-8xl drop-shadow-lg transition-transform duration-500" style={{ transform: open ? "scale(1)" : "scale(0.6) translateY(30px) rotate(20deg)" }}>
            {open ? "☂️" : "🌂"}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="btn btn-quiet" onClick={() => setOpen((v) => !v)}>
          {open ? "Cerrar el paraguas" : "Abrir el paraguas"}
        </button>
        <div role="group" aria-label="Intensidad de la lluvia" className="flex flex-wrap gap-2">
          {[
            { v: 0.15, t: "🌦️ Llovizna" },
            { v: 0.5, t: "🌧️ Lluvia" },
            { v: 0.95, t: "⛈️ Aguacero" },
          ].map((o) => (
            <button key={o.v} type="button" aria-pressed={level === o.v} className={`btn min-h-9 text-sm ${level === o.v ? "btn-primary" : "btn-quiet"}`} onClick={() => setLevel(o.v)}>
              {o.t}
            </button>
          ))}
        </div>
      </div>
      <Note>{open ? "Bajo el paraguas se oye más fuerte, y aun así se está seco. Hay días de lluvia. También pasan." : "Sin paraguas, un rato. A veces mojarse un poco también está bien."}</Note>
    </div>
  );
}

/* ====================================================================== */
/* Llaves: todas las puertas, y una idea de a dónde ir según cómo llegas.    */
/* ====================================================================== */

const SUGGEST: { label: string; slugs: string[] }[] = [
  { label: "Vengo con mucha energía", slugs: ["movimiento", "instrumentos", "creatividad"] },
  { label: "Vengo cansado", slugs: ["peluches", "lectura", "estrellas"] },
  { label: "Vengo nervioso", slugs: ["respiracion", "jardin", "cocina"] },
  { label: "No sé cómo vengo", slugs: ["peluches", "jardin", "estrellas"] },
];

export function Keys(_p: ExperienceProps) {
  const [pick, setPick] = useState<number | null>(null);
  const highlighted = pick === null ? null : new Set(SUGGEST[pick].slugs);
  return (
    <div className="space-y-4">
      <Caption>Estas llaves abren todas las puertas de la casa; ninguna está cerrada. Si no sabes a dónde ir, di cómo llegas y te señalo tres.</Caption>
      <div className="flex flex-wrap gap-2">
        {SUGGEST.map((s, i) => (
          <button key={s.label} type="button" aria-pressed={pick === i} className={`btn min-h-9 text-sm ${pick === i ? "btn-primary" : "btn-quiet"}`} onClick={() => setPick(pick === i ? null : i)}>
            {s.label}
          </button>
        ))}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ROOMS.filter((r) => r.slug !== "vestibulo").map((r) => {
          const hl = highlighted?.has(r.slug);
          return (
            <li key={r.slug}>
              <a href={roomHref(r.slug)} className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-opacity ${hl ? "border-primary bg-soft" : "border-line bg-surface"} ${highlighted && !hl ? "opacity-50" : ""}`}>
                <span aria-hidden="true" className="inline-block text-2xl">
                  🗝️
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block font-extrabold">
                    {r.emoji} {r.name}
                  </span>
                  <span className="text-sm text-muted">
                    {r.category} · {ageShort(r.minAge)}
                  </span>
                </span>
                <Icon name="arrow-right" size={16} className="ml-auto shrink-0" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
