import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useComfort, useSound } from "../lib/comfort";
import { Caption, Note, useTween, usePersistent, type ExperienceProps } from "./shared";

/* ====================================================================== */
/* Jardín: una planta que crece con agua, luz y, sobre todo, tiempo.        */
/* ====================================================================== */

interface GardenState {
  seed: string | null;
  water: number; // 0-100
  light: number; // 0-100
  growth: number; // 0-100
  lastVisit: number;
  waterings: number;
}

const SEEDS = [
  { id: "girasol", name: "Girasol", emoji: "🌻", flower: "#f2c14e", note: "Sigue al sol durante el día y, de noche, vuelve a mirar al este para esperarlo." },
  { id: "lavanda", name: "Lavanda", emoji: "💜", flower: "#a291b4", note: "Huele más cuando la rozas. No hace falta hacerle nada más." },
  { id: "tomate", name: "Tomate", emoji: "🍅", flower: "#e05a4f", note: "Primero flor amarilla, después fruto verde, después rojo. Nunca al revés." },
];

const INITIAL: GardenState = { seed: null, water: 40, light: 60, growth: 0, lastVisit: Date.now(), waterings: 0 };

/** Crecimiento pasivo: cada hora real, si hay agua, la planta avanza. */
function settle(s: GardenState): GardenState {
  const hours = Math.min(72, (Date.now() - s.lastVisit) / 3600000);
  if (hours < 0.25 || !s.seed) return { ...s, lastVisit: Date.now() };
  const canGrow = s.water > 15 && s.light > 20;
  const growth = Math.min(100, s.growth + (canGrow ? hours * 2.5 : 0));
  const water = Math.max(0, s.water - hours * 3);
  return { ...s, growth, water, lastVisit: Date.now() };
}

function stageLabel(g: number): string {
  if (g < 5) return "tierra con una semilla";
  if (g < 25) return "un brote";
  if (g < 50) return "una planta joven";
  if (g < 80) return "una planta con hojas";
  if (g < 100) return "una planta a punto de florecer";
  return "una planta en flor";
}

export function Garden({ kind, onOpenJournal }: ExperienceProps) {
  const play = useSound();
  const [state, setState] = usePersistent<GardenState>("garden:main", INITIAL);
  const [splash, setSplash] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    setState((s) => settle(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seed = SEEDS.find((s) => s.id === state.seed) ?? null;

  function water() {
    setSplash((n) => n + 1);
    play(783.99, "pluck");
    setState((s) => {
      const over = s.water > 85;
      const growth = s.seed && !over && s.light > 20 ? Math.min(100, s.growth + 4) : s.growth;
      setNote(over ? "Ya tiene bastante agua. Demasiada tampoco ayuda: ahora toca esperar." : s.seed ? "Un poco de agua. La planta toma lo que necesita." : "Riegas la tierra. Aún no hay semilla, pero la tierra húmeda ya está lista.");
      return { ...s, water: Math.min(100, s.water + 25), growth, waterings: s.waterings + 1, lastVisit: Date.now() };
    });
  }

  function plant(id: string) {
    play(523.25, "bell");
    setNote("Sembrada. Por fuera no parece que pase nada. Por dentro, sí.");
    setState((s) => ({ ...s, seed: id, growth: 1, lastVisit: Date.now() }));
  }

  const g = useTween(state.growth, 900);
  const stem = Math.min(120, g * 1.25);
  const leaves = Math.floor(g / 18);

  return (
    <div className="space-y-4">
      <Caption>
        {kind === "semilla"
          ? "Elige una semilla y siémbrala. Luego riega, dale luz y vuelve otro día: crece con tiempo real, aunque no estés mirando."
          : kind === "sol"
            ? "Mueve el sol para darle más o menos luz. Sin luz no crece; con demasiada, se cansa. Como casi todo."
            : "Riega, regula la luz y espera. La planta avanza un poco con cada riego y sigue creciendo sola entre visita y visita."}
      </Caption>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="relative mx-auto overflow-hidden rounded-3xl" style={{ background: `linear-gradient(180deg, hsl(200, ${30 + state.light * 0.5}%, ${70 + state.light * 0.2}%), #e2efd9)` }}>
          <svg viewBox="0 0 220 260" className="block h-72 w-60" role="img" aria-label={`Maceta con ${stageLabel(g)}`}>
            <circle cx="180" cy="40" r={14 + state.light * 0.14} fill="#f7c75c" opacity={0.3 + state.light / 140} />
            {/* tallo */}
            {seed && g > 2 && (
              <path d={`M110 200 Q ${110 + Math.sin(g) * 6} ${200 - stem / 2} 110 ${200 - stem}`} stroke="#5f8f4e" strokeWidth={3 + g / 25} fill="none" strokeLinecap="round" />
            )}
            {/* hojas */}
            {seed &&
              Array.from({ length: leaves }, (_, i) => {
                const y = 200 - (stem * (i + 1)) / (leaves + 1);
                const dir = i % 2 === 0 ? -1 : 1;
                return <ellipse key={i} cx={110 + dir * 16} cy={y} rx="18" ry="8" fill="#7fae6f" transform={`rotate(${dir * -25} ${110 + dir * 16} ${y})`} />;
              })}
            {/* flor */}
            {seed && g >= 100 && (
              <g>
                {Array.from({ length: 8 }, (_, i) => (
                  <ellipse key={i} cx="110" cy={200 - stem - 14} rx="7" ry="16" fill={seed.flower} transform={`rotate(${i * 45} 110 ${200 - stem})`} />
                ))}
                <circle cx="110" cy={200 - stem} r="9" fill="#6b4b2a" />
              </g>
            )}
            {seed && g >= 80 && g < 100 && <circle cx="110" cy={200 - stem} r="8" fill={seed.flower} opacity="0.8" />}
            {/* brote */}
            {seed && g > 0 && g < 25 && <ellipse cx="110" cy={200 - stem - 4} rx="7" ry="4" fill="#9ccf8f" />}
            {/* maceta */}
            <path d="M60 195h100l-10 55H70z" fill="#bd9079" stroke="#8f6c5a" strokeWidth="3" />
            <rect x="54" y="186" width="112" height="14" rx="4" fill="#c99a6b" stroke="#8f6c5a" strokeWidth="3" />
            <ellipse cx="110" cy="195" rx="48" ry="6" fill={state.water > 50 ? "#4e3b2b" : "#7a5c42"} />
            {!seed && <ellipse cx="110" cy="194" rx="5" ry="3" fill="#3b2f2a" />}
            {splash > 0 && (
              <g key={splash} fill="#8fbccb" opacity="0.8">
                <circle cx="95" cy="160" r="3" className="drop-fall" />
                <circle cx="110" cy="150" r="3" className="drop-fall" />
                <circle cx="125" cy="162" r="3" className="drop-fall" />
              </g>
            )}
          </svg>
        </div>

        <div className="space-y-3">
          {!seed ? (
            <div>
              <p className="font-bold">Elige qué sembrar</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {SEEDS.map((s) => (
                  <button key={s.id} type="button" onClick={() => plant(s.id)} className="cursor-pointer rounded-2xl border border-line bg-surface p-3 text-left hover:border-primary">
                    <span aria-hidden="true" className="text-2xl">
                      {s.emoji}
                    </span>
                    <span className="block font-extrabold">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="font-bold">
              {seed.emoji} {seed.name}: {stageLabel(g)}.
            </p>
          )}

          <Meter label="Agua" value={state.water} color="#8fbccb" hint={state.water < 20 ? "tiene sed" : state.water > 85 ? "encharcada" : "bien"} />
          <Meter label="Luz" value={state.light} color="#f2c14e" hint={state.light < 25 ? "poca" : state.light > 90 ? "mucha" : "bien"} />
          <Meter label="Crecimiento" value={g} color="#7fae6f" hint={`${Math.round(g)} %`} />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">Sol</span>
            <button type="button" className="btn btn-quiet min-h-9 text-sm" disabled={state.light <= 0} onClick={() => setState((s) => ({ ...s, light: Math.max(0, s.light - 20) }))}>
              − Menos sol
            </button>
            <button type="button" className="btn btn-quiet min-h-9 text-sm" disabled={state.light >= 100} onClick={() => setState((s) => ({ ...s, light: Math.min(100, s.light + 20) }))}>
              + Más sol
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={water}>
              🚿 Regar
            </button>
            {seed && (
              <button type="button" className="btn btn-ghost" onClick={() => { if (window.confirm("¿Empezar de cero con otra semilla?")) setState({ ...INITIAL, lastVisit: Date.now() }); }}>
                Empezar de nuevo
              </button>
            )}
          </div>
        </div>
      </div>
      <p role="status" className="min-h-6 font-bold">
        {note}
      </p>
      <Note>
        {seed ? seed.note : "Las plantas crecen de noche, cuando nadie las mira. Esta también: avanza con las horas reales entre tus visitas, siempre que tenga agua y luz."}{" "}
        <button type="button" className="cursor-pointer font-bold text-primary underline underline-offset-4" onClick={onOpenJournal}>
          ¿Qué te gustaría que creciera en tu vida, poco a poco?
        </button>
      </Note>
    </div>
  );
}

function Meter({ label, value, color, hint }: { label: string; value: number; color: string; hint: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-bold">{label}</span>
        <span className="text-muted">{hint}</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-line" role="meter" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Mariposa: si te quedas quieto cerca, se posa en tu dedo.                 */
/* ====================================================================== */

export function Butterfly(_p: ExperienceProps) {
  const play = useSound();
  const { comfort } = useComfort();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef<{ x: number; y: number; since: number } | null>(null);
  const [landed, setLanded] = useState(false);
  const [landings, setLandings] = useState(0);
  const landedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const W = canvas.width;
    const H = canvas.height;
    const b = { x: W * 0.3, y: H * 0.4, vx: 1, vy: 0.3, t: 0, tx: W * 0.6, ty: H * 0.5 };
    let raf = 0;
    const step = () => {
      b.t += 1;
      const p = pointer.current;
      const still = p && performance.now() - p.since > 2200;
      if (still && p) {
        // se acerca despacio al dedo quieto
        b.vx += (p.x - b.x) * 0.002;
        b.vy += (p.y - 30 - b.y) * 0.002;
        const d = Math.hypot(p.x - b.x, p.y - 30 - b.y);
        if (d < 10 && !landedRef.current) {
          landedRef.current = true;
          setLanded(true);
          setLandings((n) => n + 1);
          play(1046.5, "bell");
        }
      } else {
        if (landedRef.current) {
          landedRef.current = false;
          setLanded(false);
          b.vx = (Math.random() - 0.5) * 4;
          b.vy = -2;
        }
        if (b.t % 90 === 0) {
          b.tx = 40 + Math.random() * (W - 80);
          b.ty = 40 + Math.random() * (H - 120);
        }
        b.vx += (b.tx - b.x) * 0.0015 + (Math.random() - 0.5) * 0.3;
        b.vy += (b.ty - b.y) * 0.0015 + (Math.random() - 0.5) * 0.3;
        if (p && Math.hypot(p.x - b.x, p.y - b.y) < 60) {
          b.vx += (b.x - p.x) * 0.02;
          b.vy += (b.y - p.y) * 0.02;
        }
      }
      b.vx *= 0.96;
      b.vy *= 0.96;
      b.x = Math.max(20, Math.min(W - 20, b.x + b.vx));
      b.y = Math.max(20, Math.min(H - 20, b.y + b.vy));

      g.clearRect(0, 0, W, H);
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#e2efd9");
      grad.addColorStop(1, "#b9cf9f");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      // flores
      for (let i = 0; i < 6; i++) {
        const fx = 50 + i * ((W - 100) / 5);
        g.fillStyle = "#5f8f4e";
        g.fillRect(fx - 2, H - 60, 4, 60);
        g.fillStyle = ["#f3b6c8", "#f2c14e", "#a291b4"][i % 3];
        g.beginPath();
        g.arc(fx, H - 62, 10, 0, Math.PI * 2);
        g.fill();
      }
      // dedo
      if (p) {
        g.fillStyle = "#e8c8a4";
        g.beginPath();
        g.roundRect(p.x - 10, p.y - 24, 20, 90, 10);
        g.fill();
      }
      // mariposa
      const flap = landedRef.current ? 0.2 : comfort.reduceMotion ? 0.6 : Math.abs(Math.sin(b.t * 0.25));
      g.save();
      g.translate(b.x, b.y);
      g.fillStyle = "#e9a84c";
      g.strokeStyle = "#5a3e1b";
      g.lineWidth = 1.5;
      for (const side of [-1, 1]) {
        g.save();
        g.scale(side * (0.35 + flap * 0.65), 1);
        g.beginPath();
        g.ellipse(14, -6, 14, 10, -0.3, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.beginPath();
        g.ellipse(11, 8, 9, 7, 0.3, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.restore();
      }
      g.fillStyle = "#5a3e1b";
      g.beginPath();
      g.ellipse(0, 0, 3, 12, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [comfort.reduceMotion, play]);

  function setPointer(e: PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    const prev = pointer.current;
    const moved = !prev || Math.hypot(prev.x - x, prev.y - y) > 6;
    pointer.current = { x, y, since: moved ? performance.now() : prev.since };
  }

  return (
    <div className="space-y-4">
      <Caption>Pon el dedo (o el ratón) en el jardín y quédate quieto. Si lo mueves, la mariposa se aleja. Si esperas un par de segundos sin moverte, se acerca y se posa.</Caption>
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        role="img"
        aria-label={landed ? "La mariposa está posada en tu dedo" : "Una mariposa vuela por el jardín"}
        className="block aspect-[8/5] w-full touch-none rounded-2xl"
        onPointerMove={setPointer}
        onPointerDown={setPointer}
        onPointerLeave={() => (pointer.current = null)}
      />
      <p role="status" className="min-h-6 text-center font-bold">
        {landed ? "Se posó. Respira despacio; mientras no te muevas, se queda." : landings > 0 ? `Se ha posado ${landings} ${landings === 1 ? "vez" : "veces"}.` : ""}
      </p>
      <Note>Con las mariposas, con los gatos y con algunas personas pasa lo mismo: cuanto menos persigues, más se acercan.</Note>
    </div>
  );
}
