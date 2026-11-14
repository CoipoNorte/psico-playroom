import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import {
  DAY, D2R, ELEMENTS, SPEEDS, SYNODIC, BODIES, RADIUS2D as RADIUS,
  dist3, fmt, moonAgeAt, phaseName, planetVec, type Vec,
} from "../lib/astronomy";
import { useComfort, useSound } from "../lib/comfort";
import { Caption, Note, seeded, svgPoint, usePersistent, type ExperienceProps } from "./shared";
import { Solar3D } from "./solar3d";

const SKY_W = 800;
const SKY_H = 500;

/* ====================================================================== */
/* Luna: fase real, con transición animada entre fases.                    */
/* ====================================================================== */

const PHASE_THOUGHTS: Record<string, string> = {
  "Luna nueva": "No se ve, pero está ahí. Hay días así: de estar sin brillar, y no pasa nada.",
  "Luna creciente": "Apenas un hilo de luz. Las cosas que empiezan suelen verse así de pequeñas.",
  "Cuarto creciente": "Mitad luz, mitad sombra. Las dos partes son la misma luna.",
  "Gibosa creciente": "Casi llena, todavía no. Lo que falta no le quita lo que ya tiene.",
  "Luna llena": "Toda la cara iluminada. Dura poco y vuelve siempre.",
  "Gibosa menguante": "Empieza a soltar luz, sin apuro. Menguar también es parte del ciclo.",
  "Cuarto menguante": "Otra vez a la mitad, pero del otro lado. No es un retroceso: es el camino de vuelta.",
  "Luna menguante": "Un hilo de luz otra vez, antes de descansar. Después vuelve a empezar.",
};

export function MoonPhases() {
  const { comfort } = useComfort();
  const [nowMs] = useState(() => Date.now());
  const todayAge = useMemo(() => moonAgeAt(nowMs), [nowMs]);
  const [target, setTarget] = useState<number | null>(null);
  const [auto, setAuto] = useState(false);
  const goal = target ?? todayAge;
  const [shown, setShown] = useState(todayAge);
  const shownRef = useRef(todayAge);

  // Transición suave hasta la fase elegida, por el camino más corto del ciclo.
  useEffect(() => {
    if (auto) return;
    const from = shownRef.current;
    let d = goal - from;
    if (d > SYNODIC / 2) d -= SYNODIC;
    if (d < -SYNODIC / 2) d += SYNODIC;
    const dur = comfort.reduceMotion ? 0 : 900;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = dur === 0 ? 1 : Math.min(1, (t - start) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = (((from + d * e) % SYNODIC) + SYNODIC) % SYNODIC;
      shownRef.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [goal, auto, comfort.reduceMotion]);

  // «Ver un mes entero»: recorre el ciclo completo en 16 segundos y vuelve a hoy.
  useEffect(() => {
    if (!auto) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 16000);
      shownRef.current = k * SYNODIC;
      setShown(k * SYNODIC);
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        setTarget(null);
        setAuto(false);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const age = shown;
  const p = age / SYNODIC;
  const name = phaseName(age);
  const r = 110;
  const waxing = p <= 0.5;
  const gibbous = p > 0.25 && p < 0.75;
  const rx = Math.abs(Math.cos(2 * Math.PI * p)) * r;
  const light = "#f4ecc8";
  const dark = "#1f2340";

  const nextOf = (phaseAge: number) => {
    const d = (((phaseAge - todayAge) % SYNODIC) + SYNODIC) % SYNODIC;
    return new Date(nowMs + d * DAY).toLocaleDateString("es", { day: "numeric", month: "long" });
  };
  const shift = (n: number) => setTarget((((goal + n) % SYNODIC) + SYNODIC) % SYNODIC);
  const isToday = target === null && !auto;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <svg viewBox="0 0 260 260" role="img" aria-label={`${name}, día ${Math.round(age)} del ciclo`} className="mx-auto block size-56 rounded-full bg-[#0d1024]">
          <circle cx="130" cy="130" r={r} fill={dark} />
          <path d={waxing ? `M130 ${130 - r} A${r} ${r} 0 0 1 130 ${130 + r}Z` : `M130 ${130 - r} A${r} ${r} 0 0 0 130 ${130 + r}Z`} fill={light} />
          <ellipse cx="130" cy="130" rx={rx} ry={r} fill={gibbous ? light : dark} />
          <g fill="#000" opacity="0.1">
            <circle cx="100" cy="95" r="12" />
            <circle cx="150" cy="150" r="18" />
            <circle cx="90" cy="170" r="8" />
            <circle cx="170" cy="85" r="7" />
          </g>
        </svg>
        <div>
          <p className="text-2xl font-extrabold">{name}</p>
          <Caption>
            {auto ? "Un mes lunar en unos 16 segundos." : isToday ? `Así está la luna hoy: día ${Math.floor(age) + 1} del ciclo.` : `Día ${Math.floor(age) + 1} del ciclo.`}
          </Caption>
          <p className="mt-3">{PHASE_THOUGHTS[name]}</p>
          <p className="mt-3 text-sm text-muted">
            Próxima luna llena: <b className="text-ink">{nextOf(SYNODIC / 2)}</b> · próxima luna nueva:{" "}
            <b className="text-ink">{nextOf(0)}</b>
          </p>
        </div>
      </div>

      <div role="group" aria-label="Elegir la fase" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={isToday} disabled={auto} className={`btn min-h-9 text-sm ${isToday ? "btn-primary" : "btn-quiet"}`} onClick={() => setTarget(null)}>
          Hoy
        </button>
        <button type="button" aria-pressed={!auto && target === 0} disabled={auto} className={`btn min-h-9 text-sm ${!auto && target === 0 ? "btn-primary" : "btn-quiet"}`} onClick={() => setTarget(0)}>
          Luna nueva
        </button>
        <button type="button" aria-pressed={!auto && target !== null && Math.abs(target - SYNODIC * 0.25) < 0.01} disabled={auto} className="btn btn-quiet min-h-9 text-sm" onClick={() => setTarget(SYNODIC * 0.25)}>
          Cuarto creciente
        </button>
        <button type="button" aria-pressed={!auto && target !== null && Math.abs(target - SYNODIC / 2) < 0.01} disabled={auto} className="btn btn-quiet min-h-9 text-sm" onClick={() => setTarget(SYNODIC / 2)}>
          Luna llena
        </button>
        <button type="button" aria-pressed={!auto && target !== null && Math.abs(target - SYNODIC * 0.75) < 0.01} disabled={auto} className="btn btn-quiet min-h-9 text-sm" onClick={() => setTarget(SYNODIC * 0.75)}>
          Cuarto menguante
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={auto} className="btn btn-quiet min-h-9 text-sm" onClick={() => shift(-1)}>
          <Icon name="arrow-left" size={14} /> Un día antes
        </button>
        <button type="button" disabled={auto} className="btn btn-quiet min-h-9 text-sm" onClick={() => shift(1)}>
          Un día después <Icon name="arrow-right" size={14} />
        </button>
        <button type="button" disabled={auto} className="btn btn-primary min-h-9 text-sm" onClick={() => setAuto(true)}>
          <Icon name="play" size={14} /> Ver un mes entero
        </button>
      </div>
      <Note>
        Cálculo con un ciclo medio de 29,53 días. La luna real puede adelantarse o retrasarse hasta medio día respecto a este cálculo.
      </Note>
    </div>
  );
}

/* ====================================================================== */
/* Telescopio y constelaciones: estrellas con posiciones reales (AR/Dec).  */
/* ====================================================================== */

interface Star {
  name: string;
  ra: number;
  dec: number;
  mag: number;
}

interface Constellation {
  name: string;
  /** Cuadro donde se dibuja: centro x, centro y, ancho y alto en el cielo. */
  box: [number, number, number, number];
  stars: Star[];
  /** Pares de índices de estrellas unidas por una línea (figura tradicional, simplificada). */
  lines: [number, number][];
  note: string;
}

const CONSTELLATIONS: Constellation[] = [
  {
    name: "Osa Mayor",
    box: [170, 150, 240, 150],
    stars: [
      { name: "Dubhe", ra: 165.93, dec: 61.75, mag: 1.8 },
      { name: "Merak", ra: 165.46, dec: 56.38, mag: 2.4 },
      { name: "Phecda", ra: 178.46, dec: 53.69, mag: 2.4 },
      { name: "Megrez", ra: 183.86, dec: 57.03, mag: 3.3 },
      { name: "Alioth", ra: 193.51, dec: 55.96, mag: 1.8 },
      { name: "Mizar", ra: 200.98, dec: 54.93, mag: 2.2 },
      { name: "Alkaid", ra: 206.89, dec: 49.31, mag: 1.9 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [4, 5],
      [5, 6],
    ],
    note: "Siete estrellas en forma de cazo. Las dos del borde del cazo (Dubhe y Merak) apuntan hacia la Polar, la estrella que casi no se mueve en el cielo nocturno.",
  },
  {
    name: "Casiopea",
    box: [640, 120, 200, 100],
    stars: [
      { name: "Caph", ra: 2.29, dec: 59.15, mag: 2.3 },
      { name: "Schedar", ra: 10.13, dec: 56.54, mag: 2.2 },
      { name: "Gamma Cas", ra: 14.18, dec: 60.72, mag: 2.2 },
      { name: "Ruchbah", ra: 21.45, dec: 60.24, mag: 2.7 },
      { name: "Segin", ra: 28.6, dec: 63.67, mag: 3.4 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
    note: "Tiene forma de W (o de M, según la hora y la época del año). Está siempre al otro lado de la Polar respecto a la Osa Mayor.",
  },
  {
    name: "Orión",
    box: [560, 340, 210, 150],
    stars: [
      { name: "Betelgeuse", ra: 88.79, dec: 7.41, mag: 0.5 },
      { name: "Bellatrix", ra: 81.28, dec: 6.35, mag: 1.6 },
      { name: "Mintaka", ra: 83.0, dec: -0.3, mag: 2.2 },
      { name: "Alnilam", ra: 84.05, dec: -1.2, mag: 1.7 },
      { name: "Alnitak", ra: 85.19, dec: -1.94, mag: 1.8 },
      { name: "Saiph", ra: 86.94, dec: -9.67, mag: 2.1 },
      { name: "Rigel", ra: 78.63, dec: -8.2, mag: 0.1 },
    ],
    lines: [
      [0, 1],
      [0, 4],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [2, 6],
    ],
    note: "El cazador. Sus tres estrellas alineadas son el cinturón. Bajo el cinturón se ve una mancha borrosa: la Nebulosa de Orión, una zona donde están naciendo estrellas.",
  },
];

interface SkyStar {
  id: number;
  x: number;
  y: number;
  r: number;
  warm: boolean;
}

/**
 * Proyección local: cada constelación conserva su forma real (ascensión recta y declinación),
 * escalada para caber en su cuadro. El este va a la izquierda, como en una carta celeste.
 */
function layoutConstellation(c: Constellation): { x: number; y: number }[] {
  const ra0 = c.stars.reduce((a, s) => a + s.ra, 0) / c.stars.length;
  const dec0 = c.stars.reduce((a, s) => a + s.dec, 0) / c.stars.length;
  const k = Math.cos(dec0 * D2R);
  const raw = c.stars.map((s) => ({ x: -(s.ra - ra0) * k, y: s.dec - dec0 }));
  const minX = Math.min(...raw.map((p) => p.x));
  const maxX = Math.max(...raw.map((p) => p.x));
  const minY = Math.min(...raw.map((p) => p.y));
  const maxY = Math.max(...raw.map((p) => p.y));
  const [cx, cy, w, h] = c.box;
  const scale = Math.min(w / Math.max(0.001, maxX - minX), h / Math.max(0.001, maxY - minY));
  const mx = (minX + maxX) / 2;
  const my = (minY + maxY) / 2;
  return raw.map((p) => ({ x: cx + (p.x - mx) * scale, y: cy - (p.y - my) * scale }));
}

const BACKGROUND: SkyStar[] = (() => {
  const rnd = seeded(7);
  return Array.from({ length: 150 }, (_, i) => ({
    id: i,
    x: Math.round(rnd() * SKY_W),
    y: Math.round(rnd() * SKY_H),
    r: 0.6 + rnd() * 1.5,
    warm: false,
  }));
})();

const CONST_POS = CONSTELLATIONS.map(layoutConstellation);

const CONST_STARS: SkyStar[] = CONSTELLATIONS.flatMap((c, ci) =>
  c.stars.map((s, si) => ({
    id: 1000 + ci * 100 + si,
    x: CONST_POS[ci][si].x,
    y: CONST_POS[ci][si].y,
    r: Math.max(1.6, 4.4 - s.mag * 0.9),
    warm: true,
  })),
);

const ALL_STARS: SkyStar[] = [...BACKGROUND, ...CONST_STARS];
const STAR_BY_ID = new Map<number, SkyStar>(ALL_STARS.map((s) => [s.id, s]));

interface SavedConstellation {
  name: string;
  ids: number[];
}

export function StarSky({ kind, onOpenJournal }: ExperienceProps) {
  const { comfort } = useComfort();
  const play = useSound();
  const svgRef = useRef<SVGSVGElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [lensOn, setLensOn] = useState(kind === "telescopio");
  const [showLines, setShowLines] = useState(true);
  const [selected, setSelected] = useState<number>(kind === "constelacion" ? -1 : 0);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [saved, setSaved] = usePersistent<SavedConstellation[]>("sky:constellations", []);
  const [viewing, setViewing] = useState<SavedConstellation | null>(null);
  const [shoot, setShoot] = useState<{ key: number; x: number; y: number } | null>(null);

  // Estrellas fugaces de vez en cuando.
  useEffect(() => {
    if (comfort.reduceMotion) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setShoot({ key: Date.now(), x: 300 + Math.random() * 450, y: 20 + Math.random() * 180 });
        schedule();
      }, 5000 + Math.random() * 7000);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [comfort.reduceMotion]);

  const twinkle = useMemo(() => {
    const rnd = seeded(3);
    return ALL_STARS.map(() => `${(rnd() * 4).toFixed(2)}s`);
  }, []);

  function handleStar(id: number) {
    setViewing(null);
    setDrawn((d) => (d[d.length - 1] === id ? d.slice(0, -1) : [...d, id]));
    play(523.25 + (id % 7) * 55, "bell");
  }

  function saveDrawn() {
    const clean = name.trim().slice(0, 30);
    if (drawn.length < 2) return;
    const entry = { name: clean || `Constelación ${saved.length + 1}`, ids: drawn };
    setSaved((s) => [...s, entry]);
    setDrawn([]);
    setName("");
    setViewing(entry);
  }

  const pathOf = (ids: number[]) =>
    ids
      .map((id, i) => {
        const s = STAR_BY_ID.get(id);
        return s ? `${i === 0 ? "M" : "L"}${s.x} ${s.y}` : "";
      })
      .join(" ");

  const skyLayer = (interactive: boolean) => (
    <g>
      {ALL_STARS.map((s, i) => (
        <circle
          key={s.id}
          data-star={interactive ? s.id : undefined}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.warm ? "#fff6d5" : "#e9ecff"}
          className={s.r > 1.4 ? "twinkle" : undefined}
          style={{ animationDelay: twinkle[i] }}
          pointerEvents={interactive ? undefined : "none"}
        />
      ))}
      {showLines &&
        CONSTELLATIONS.map((c, ci) => {
          const pts = CONST_POS[ci];
          const on = selected === ci;
          const top = pts.reduce((best, p, i) => (p.y < pts[best].y ? i : best), 0);
          return (
            <g key={c.name} stroke={on ? "#f6e7a6" : "#8e95c7"} strokeOpacity={on ? 0.95 : 0.5} strokeWidth={on ? 1.8 : 1}>
              {c.lines.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} />
              ))}
              {on && (
                <text x={pts[top].x} y={pts[top].y - 16} fill="#f6e7a6" fontSize="15" fontWeight="700" stroke="none" textAnchor="middle">
                  {c.name}
                </text>
              )}
              {on &&
                c.stars.map((s, si) => (
                  <text key={s.name} x={pts[si].x} y={pts[si].y + 14} fill="#f6e7a6" fontSize="9" opacity="0.85" stroke="none" textAnchor="middle">
                    {s.name}
                  </text>
                ))}
            </g>
          );
        })}
      {viewing && <path d={pathOf(viewing.ids)} fill="none" stroke="#9fd3c7" strokeWidth="2" strokeLinejoin="round" />}
      {drawn.length > 0 && <path d={pathOf(drawn)} fill="none" stroke="#f3b6c8" strokeWidth="2.2" strokeLinejoin="round" />}
      {drawn.map((id) => {
        const s = STAR_BY_ID.get(id);
        return s ? <circle key={`d${id}`} cx={s.x} cy={s.y} r="6" fill="none" stroke="#f3b6c8" strokeWidth="1.5" /> : null;
      })}
    </g>
  );

  return (
    <div className="space-y-4">
      <Caption>
        {lensOn
          ? "Mueve el puntero por el cielo: el telescopio aumenta lo que hay debajo. Toca estrellas para unirlas con una línea."
          : "Toca estrellas una tras otra para unirlas y crear tu propia constelación. Toca la última otra vez para deshacer."}
      </Caption>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SKY_W} ${SKY_H}`}
        role="img"
        aria-label="Cielo nocturno con estrellas y constelaciones"
        className="block aspect-[8/5] w-full touch-none rounded-2xl bg-[#0d1024]"
        style={{ cursor: lensOn ? "none" : "crosshair" }}
        onPointerMove={(e) => {
          if (!svgRef.current) return;
          setLens(svgPoint(svgRef.current, e.clientX, e.clientY));
        }}
        onPointerLeave={() => setLens(null)}
        onClick={(e) => {
          if (!svgRef.current) return;
          const p = svgPoint(svgRef.current, e.clientX, e.clientY);
          let best: SkyStar | null = null;
          let bestD = 14;
          for (const s of ALL_STARS) {
            const d = Math.hypot(s.x - p.x, s.y - p.y);
            if (d < bestD) {
              bestD = d;
              best = s;
            }
          }
          if (best) handleStar(best.id);
        }}
      >
        <defs>
          <radialGradient id="skyglow" cx="50%" cy="110%" r="80%">
            <stop offset="0" stopColor="#2a2f5c" />
            <stop offset="1" stopColor="#0d1024" />
          </radialGradient>
          {lens && (
            <clipPath id="lensclip">
              <circle cx={lens.x} cy={lens.y} r="92" />
            </clipPath>
          )}
        </defs>
        <rect width={SKY_W} height={SKY_H} fill="url(#skyglow)" />
        {skyLayer(true)}
        {shoot && (
          <line key={shoot.key} x1={shoot.x} y1={shoot.y} x2={shoot.x + 60} y2={shoot.y - 32} stroke="#fff" strokeWidth="2" strokeLinecap="round" className="shoot" />
        )}
        <path d={`M0 ${SKY_H} L0 440 Q120 400 240 430 T480 420 T720 440 L${SKY_W} 425 L${SKY_W} ${SKY_H}Z`} fill="#070912" />

        {lensOn && lens && (
          <g pointerEvents="none">
            <g clipPath="url(#lensclip)">
              <rect width={SKY_W} height={SKY_H} fill="#0a0c1e" />
              <g transform={`translate(${lens.x} ${lens.y}) scale(1.9) translate(${-lens.x} ${-lens.y})`}>{skyLayer(false)}</g>
            </g>
            <circle cx={lens.x} cy={lens.y} r="92" fill="none" stroke="#cfd6ff" strokeWidth="3" />
            <circle cx={lens.x} cy={lens.y} r="98" fill="none" stroke="#3a4170" strokeWidth="6" />
          </g>
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={`btn ${lensOn ? "btn-primary" : "btn-quiet"}`} aria-pressed={lensOn} onClick={() => setLensOn((v) => !v)}>
          🔭 Telescopio
        </button>
        <button type="button" className={`btn ${showLines ? "btn-primary" : "btn-quiet"}`} aria-pressed={showLines} onClick={() => setShowLines((v) => !v)}>
          Líneas de constelaciones
        </button>
        {drawn.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setDrawn([])}>
            <Icon name="eraser" size={16} /> Borrar mi trazo
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section aria-label="Constelaciones conocidas" className="space-y-2">
          <p className="font-bold">Constelaciones que puedes buscar</p>
          <div className="flex flex-wrap gap-2">
            {CONSTELLATIONS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                aria-pressed={selected === i}
                className={`btn min-h-9 text-sm ${selected === i ? "btn-primary" : "btn-quiet"}`}
                onClick={() => {
                  setSelected(selected === i ? -1 : i);
                  setShowLines(true);
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
          {selected >= 0 && <Note>{CONSTELLATIONS[selected].note}</Note>}
        </section>

        <section aria-label="Tu constelación" className="space-y-2">
          <p className="font-bold">Tu constelación</p>
          {drawn.length >= 2 ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="Ponle un nombre"
                aria-label="Nombre de tu constelación"
                className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2"
              />
              <button type="button" className="btn btn-primary" onClick={saveDrawn}>
                Guardar
              </button>
            </div>
          ) : (
            <Caption>Une al menos dos estrellas y podrás guardarla con un nombre.</Caption>
          )}
          {saved.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {saved.map((c, i) => (
                <li key={`${c.name}-${i}`} className="flex items-center gap-1 rounded-full border border-line bg-soft pl-3">
                  <button type="button" className="cursor-pointer py-1.5 text-sm font-bold" aria-pressed={viewing === c} onClick={() => setViewing(viewing === c ? null : c)}>
                    ✨ {c.name}
                  </button>
                  <button
                    type="button"
                    aria-label={`Borrar ${c.name}`}
                    className="grid size-8 cursor-pointer place-items-center rounded-full text-muted hover:text-ink"
                    onClick={() => {
                      setSaved((s) => s.filter((_, j) => j !== i));
                      if (viewing === c) setViewing(null);
                    }}
                  >
                    <Icon name="close" size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn btn-ghost -ml-2 text-sm" onClick={onOpenJournal}>
            <Icon name="journal" size={15} /> ¿Qué momentos de hoy unirías con una línea?
          </button>
        </section>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Planetario: posiciones reales de los planetas para la fecha que elijas.  */
/* ====================================================================== */

const FIELD = (() => {
  const rnd = seeded(21);
  return Array.from({ length: 70 }, (_, i) => ({ x: rnd() * 540, y: rnd() * 540, r: 0.5 + rnd() * 1.1, d: (i % 6) * 0.7 }));
})();

function OrbitalMap() {
  const { comfort } = useComfort();
  const play = useSound();
  const [simMs, setSimMs] = useState(() => Date.now());
  const [playing, setPlaying] = useState(!comfort.reduceMotion);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [chosen, setChosen] = useState<string>("Tierra");

  // El tiempo simulado avanza con el reloj real: cada fotograma suma lo que corresponde.
  useEffect(() => {
    if (!playing) return;
    const simSecPerSec = SPEEDS[speedIdx].days * 86400;
    let raf = 0;
    let last = performance.now();
    const step = (t: number) => {
      const dt = t - last;
      last = t;
      setSimMs((ms) => ms + dt * simSecPerSec);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, speedIdx]);

  const pos = Object.fromEntries(BODIES.map((b) => [b.key, planetVec(simMs, b.key)])) as Record<string, Vec>;
  const E = pos.Tierra;
  const sunAngle = Math.atan2(-E[1], -E[0]);
  const moonLon = sunAngle + (2 * Math.PI * moonAgeAt(simMs)) / SYNODIC;

  const toXY = (v: Vec) => {
    const r = Math.hypot(v[0], v[1]);
    const th = Math.atan2(v[1], v[0]);
    const R = RADIUS(r);
    return { x: 270 + R * Math.cos(th), y: 270 - R * Math.sin(th) };
  };
  const earthXY = toXY(E);
  const moonXY = { x: earthXY.x + 16 * Math.cos(moonLon), y: earthXY.y - 16 * Math.sin(moonLon) };

  const select = (key: string) => {
    setChosen(key);
    play(key === "Luna" ? 330 : 220 + (BODIES.findIndex((b) => b.key === key) + 1) * 40, "bell");
  };

  const isMoon = chosen === "Luna";
  const body = BODIES.find((b) => b.key === chosen);
  const sunDist = !isMoon ? Math.hypot(...pos[chosen]) : 0;
  const earthDist = !isMoon && chosen !== "Tierra" ? dist3(pos[chosen], E) : 0;
  const dateLabel = new Date(simMs).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <Caption>
        Los planetas están donde estarían de verdad en la fecha que se muestra. Las distancias y tamaños del dibujo no están a escala; los giros sobre sí mismos tampoco, para que siempre se vea movimiento.
      </Caption>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-start">
        <svg viewBox="0 0 540 540" role="group" aria-label={`Sistema solar el ${dateLabel}`} className="mx-auto block w-full max-w-xl rounded-2xl bg-[#0d1024]">
          <defs>
            <radialGradient id="sunglow">
              <stop offset="0" stopColor="#fff2b0" />
              <stop offset="0.5" stopColor="#f7c75c" />
              <stop offset="1" stopColor="#f7c75c" stopOpacity="0" />
            </radialGradient>
          </defs>
          {FIELD.map((f, i) => (
            <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#fff" opacity="0.6" className="twinkle" style={{ animationDelay: `${f.d}s` }} />
          ))}
          {BODIES.map((b) => (
            <circle key={`o-${b.key}`} cx="270" cy="270" r={RADIUS(ELEMENTS[b.key].a)} fill="none" stroke="#fff" strokeOpacity={chosen === b.key ? 0.35 : 0.12} />
          ))}
          <circle cx="270" cy="270" r="34" fill="url(#sunglow)" className="breathe" style={{ transformOrigin: "270px 270px", transformBox: "view-box" }} />
          <circle cx="270" cy="270" r="14" fill="#ffd978" />

          {BODIES.map((b) => {
            const p = toXY(pos[b.key]);
            const sel = chosen === b.key;
            const play_ = playing ? "running" : "paused";
            return (
              <g
                key={b.key}
                role="button"
                tabIndex={0}
                aria-label={b.key}
                aria-pressed={sel}
                className="cursor-pointer outline-none"
                onClick={() => select(b.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(b.key);
                  }
                }}
              >
                <circle cx={p.x} cy={p.y} r={b.size + 10} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={b.size} fill={b.color} stroke={sel ? "#fff" : "none"} strokeWidth="2" />
                <g style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "view-box", animation: `orbit ${b.spin}s linear infinite`, animationPlayState: play_ }}>
                  <circle cx={p.x + b.size * 0.55} cy={p.y} r={Math.max(1, b.size * 0.22)} fill={b.spot} opacity="0.7" />
                </g>
                {b.ring && (
                  <ellipse cx={p.x} cy={p.y} rx={b.size * 1.9} ry={b.size * 0.5} transform={`rotate(-18 ${p.x} ${p.y})`} fill="none" stroke="#e6d3a3" strokeWidth="2" opacity="0.85" />
                )}
              </g>
            );
          })}

          <circle cx={earthXY.x} cy={earthXY.y} r="16" fill="none" stroke="#fff" strokeOpacity="0.14" />
          <g role="button" tabIndex={0} aria-label="Luna" aria-pressed={isMoon} className="cursor-pointer outline-none" onClick={() => select("Luna")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select("Luna"); } }}>
            <circle cx={moonXY.x} cy={moonXY.y} r="9" fill="transparent" />
            <circle cx={moonXY.x} cy={moonXY.y} r="2.6" fill={isMoon ? "#fff" : "#d8d4c6"} />
          </g>
        </svg>

        <div className="space-y-3">
          <div className="rounded-2xl border border-line bg-soft p-4" aria-live="polite">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="inline-block size-8 rounded-full" style={{ background: isMoon ? "#d8d4c6" : body?.color }} />
              <p className="text-xl font-extrabold">{chosen}</p>
            </div>
            {isMoon ? (
              <>
                <p className="mt-2 text-sm">
                  Fase de hoy: <b>{phaseName(moonAgeAt(simMs))}</b>. Está a unos 384 400 km de la Tierra, de media.
                </p>
                <p className="mt-3 border-t border-line pt-3">
                  Siempre muestra la misma cara hacia nosotros: su giro y su órbita duran lo mismo. No tiene luz propia.
                </p>
              </>
            ) : (
              body && (
                <>
                  <p className="mt-2 text-sm">
                    {chosen === "Tierra" ? (
                      <>Tú estás aquí. Estamos a <b>{fmt(sunDist, 2)} UA</b> del Sol.</>
                    ) : (
                      <>
                        Ahora mismo está a <b>{fmt(sunDist, 2)} UA</b> del Sol y a <b>{fmt(earthDist, 2)} UA</b> de la Tierra (unos{" "}
                        {fmt(earthDist * 149.6, 0)} millones de km).
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted">Tarda {body.period} en dar la vuelta al Sol. {body.fact}</p>
                  <p className="mt-3 border-t border-line pt-3">{body.thought}</p>
                </>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-primary min-h-9 text-sm" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
              <Icon name={playing ? "stop" : "play"} size={14} /> {playing ? "Pausar" : "Seguir"}
            </button>
            <button type="button" className="btn btn-quiet min-h-9 text-sm" onClick={() => setSimMs(Date.now())}>
              Ir a hoy
            </button>
          </div>
          <p className="text-sm font-bold tabular-nums">{dateLabel}</p>
          <div role="group" aria-label="Velocidad" className="flex flex-wrap gap-2">
            {SPEEDS.map((s, i) => (
              <button key={s.label} type="button" aria-pressed={speedIdx === i} className={`btn min-h-9 text-sm ${speedIdx === i ? "btn-primary" : "btn-quiet"}`} onClick={() => setSpeedIdx(i)}>
                {s.label}
              </button>
            ))}
          </div>
          <ul className="grid grid-cols-3 gap-1 text-xs">
            {[...BODIES.map((b) => b.key), "Luna"].map((k) => (
              <li key={k}>
                <button type="button" className={`w-full cursor-pointer rounded-xl px-1 py-1.5 font-bold ${chosen === k ? "bg-accent text-accent-ink" : "bg-surface"}`} onClick={() => select(k)}>
                  {k}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Note>
        Para ver avanzar los planetas exteriores, sube a 1 año por segundo. Posiciones calculadas con elementos orbitales medios: precisión de aproximadamente un grado.
      </Note>
    </div>
  );
}


/** Planetario: A = mapa orbital preciso; B = modelo 3D con lunas. */
export function Planetarium(props: ExperienceProps) {
  const [mode, setMode] = useState<"A" | "B">("A");
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Vistas del planetario" className="flex flex-wrap gap-2">
        <button
          type="button"
          role="tab"
          id="tab-mapa"
          aria-selected={mode === "A"}
          aria-controls="panel-planetario"
          className={`btn min-h-9 text-sm ${mode === "A" ? "btn-primary" : "btn-quiet"}`}
          onClick={() => setMode("A")}
        >
          A · Mapa orbital
        </button>
        <button
          type="button"
          role="tab"
          id="tab-modelo"
          aria-selected={mode === "B"}
          aria-controls="panel-planetario"
          className={`btn min-h-9 text-sm ${mode === "B" ? "btn-primary" : "btn-quiet"}`}
          onClick={() => setMode("B")}
        >
          �� B · Modelo 3D
        </button>
      </div>
      <div id="panel-planetario" role="tabpanel" aria-labelledby={mode === "A" ? "tab-mapa" : "tab-modelo"}>
        {mode === "A" ? <OrbitalMap /> : <Solar3D {...props} />}
      </div>
    </div>
  );
}
