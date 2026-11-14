import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, formatClock, HoldButton, Note, useStopwatch, type ExperienceProps } from "./shared";

/* ====================================================================== */
/* Burbujas: mantén pulsado para soplar; cuanto más despacio, más grande.   */
/* ====================================================================== */

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  pop?: number;
}

export function Bubbles(_p: ExperienceProps) {
  const play = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbles = useRef<Bubble[]>([]);
  const growing = useRef<Bubble | null>(null);
  const growStart = useRef(0);
  const [count, setCount] = useState(0);
  const [popped, setPopped] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const W = canvas.width;
    const H = canvas.height;
    let raf = 0;
    let last = performance.now();
    const draw = (now: number) => {
      // Factor de tiempo: la física va igual en pantallas de 60 Hz que de 120 Hz.
      const f = Math.min(3, (now - last) / 16.67);
      last = now;
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#dfecee");
      grad.addColorStop(1, "#c9dbd8");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.strokeStyle = "#7a6a8a";
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(W / 2, H);
      g.lineTo(W / 2, H - 70);
      g.stroke();
      g.beginPath();
      g.arc(W / 2, H - 92, 22, 0, Math.PI * 2);
      g.stroke();

      const gr = growing.current;
      if (gr) gr.r = Math.min(70, 6 + ((now - growStart.current) / 1000) * 26);
      const all = gr ? [...bubbles.current, gr] : bubbles.current;
      for (const b of all) {
        if (b !== gr) {
          b.x += b.vx * f;
          b.y += b.vy * f;
          b.vx += (Math.random() - 0.5) * 0.08 * f;
          b.vx *= Math.pow(0.995, f);
        }
        const age = b.pop ? (now - b.pop) / 250 : 0;
        const alpha = b.pop ? Math.max(0, 1 - age) : 1;
        const r = b.pop ? b.r * (1 + age * 0.4) : b.r;
        g.globalAlpha = alpha;
        g.beginPath();
        g.arc(b.x, b.y, r, 0, Math.PI * 2);
        g.fillStyle = `hsla(${b.hue}, 70%, 85%, 0.35)`;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = `hsla(${b.hue}, 60%, 60%, 0.8)`;
        g.stroke();
        g.beginPath();
        g.arc(b.x - r * 0.35, b.y - r * 0.35, r * 0.25, 0, Math.PI * 2);
        g.fillStyle = "rgba(255,255,255,0.7)";
        g.fill();
        g.globalAlpha = 1;
      }
      bubbles.current = bubbles.current.filter((b) => b.y + b.r > -10 && !(b.pop && now - b.pop > 250));
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  function start() {
    const c = canvasRef.current;
    if (!c) return;
    growStart.current = performance.now();
    growing.current = { id: Date.now(), x: c.width / 2, y: c.height - 92, r: 6, vx: 0, vy: 0, hue: 180 + Math.random() * 120 };
  }

  function release() {
    const b = growing.current;
    if (!b) return;
    growing.current = null;
    // Las grandes suben más despacio, como en la realidad.
    b.vy = -(0.25 + 10 / b.r);
    b.vx = (Math.random() - 0.5) * 0.5;
    b.y -= b.r;
    bubbles.current.push(b);
    setCount((n) => n + 1);
    play(600 + b.r * 6, "bell");
  }

  function popAt(clientX: number, clientY: number) {
    const c = canvasRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * c.width;
    const y = ((clientY - rect.top) / rect.height) * c.height;
    const hit = bubbles.current.find((b) => !b.pop && Math.hypot(b.x - x, b.y - y) < b.r + 6);
    if (hit) {
      hit.pop = performance.now();
      setPopped((n) => n + 1);
      play(1200 + Math.random() * 400, "pluck");
    }
  }

  return (
    <div className="space-y-4">
      <Caption>Mantén pulsado «Soplar» y suelta aire despacio: cuanto más tiempo, más grande la burbuja. Luego mira cómo flota, o tócala para explotarla.</Caption>
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        role="img"
        aria-label="Burbujas flotando"
        className="block aspect-[8/5] w-full touch-none rounded-2xl"
        onPointerDown={(e) => popAt(e.clientX, e.clientY)}
      />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <HoldButton className="btn-primary px-6" onHoldStart={start} onHoldEnd={release}>
          🫧 Soplar (mantén pulsado)
        </HoldButton>
        <span className="text-sm text-muted">
          {count} {count === 1 ? "burbuja" : "burbujas"} · {popped} {popped === 1 ? "explotada" : "explotadas"}
        </span>
      </div>
      <Note>Soplar despacio para una burbuja grande es, sin querer, una exhalación larga. Esas son las que más calman.</Note>
    </div>
  );
}

/* ====================================================================== */
/* Vela: sopla suave para que baile, fuerte para apagarla.                  */
/* ====================================================================== */

export function Candle({ setDim }: ExperienceProps) {
  const play = useSound();
  const [lit, setLit] = useState(true);
  const [lean, setLean] = useState(0);
  const [blown, setBlown] = useState(0);
  const [dimRoom, setDimRoom] = useState(false);
  const holdTimer = useRef(0);

  useEffect(() => {
    setDim(dimRoom ? (lit ? 0.55 : 0.85) : 0);
    return () => setDim(0);
  }, [dimRoom, lit, setDim]);

  return (
    <div className="space-y-4">
      <Caption>Mantén pulsado «Soplar» menos de un segundo y la llama solo baila. Mantén más tiempo y se apaga. Puedes encenderla las veces que quieras.</Caption>
      <div className={`rounded-3xl p-6 transition-colors duration-700 ${dimRoom ? "bg-[#1a1a24]" : "bg-soft"}`}>
        <svg viewBox="0 0 160 220" className="mx-auto block h-56" role="img" aria-label={lit ? "Vela encendida" : "Vela apagada"}>
          {lit && (
            <g>
              <circle cx="80" cy="70" r="70" fill="#f7c75c" opacity="0.18" />
              <g className="flame" style={{ transform: `skewX(${lean}deg)`, transition: "transform 200ms" }}>
                <path d="M80 30c-16 22-20 34-20 46a20 20 0 0 0 40 0c0-12-4-24-20-46z" fill="#f7a83a" />
                <path d="M80 50c-8 12-10 20-10 27a10 10 0 0 0 20 0c0-7-2-15-10-27z" fill="#fff0b3" />
              </g>
            </g>
          )}
          {!lit && (
            <path d="M80 80c6-10-6-14 0-24" stroke="#999" strokeWidth="2" fill="none" opacity="0.7" strokeLinecap="round">
              <animate attributeName="opacity" values="0.7;0" dur="2s" fill="freeze" />
            </path>
          )}
          <rect x="78" y="78" width="4" height="14" fill="#333" />
          <rect x="50" y="90" width="60" height="110" rx="8" fill="#f6ecd9" stroke="#d8c7a7" strokeWidth="3" />
          <ellipse cx="80" cy="92" rx="30" ry="8" fill="#fff8ea" stroke="#d8c7a7" strokeWidth="3" />
        </svg>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <HoldButton
          className="btn-primary px-6"
          disabled={!lit}
          onHoldStart={() => {
            setLean(-14);
            window.clearTimeout(holdTimer.current);
            holdTimer.current = window.setTimeout(() => {
              setLit(false);
              setLean(0);
              setBlown((n) => n + 1);
              play(196, "soft");
            }, 1000);
          }}
          onHoldEnd={() => {
            window.clearTimeout(holdTimer.current);
            setLean(0);
          }}
        >
          🌬️ Soplar (mantén pulsado)
        </HoldButton>
        {!lit && (
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              setLit(true);
              play(659.25, "bell");
            }}
          >
            🔥 Encender de nuevo
          </button>
        )}
        <button type="button" className={`btn ${dimRoom ? "btn-primary" : "btn-quiet"}`} aria-pressed={dimRoom} onClick={() => setDimRoom((v) => !v)}>
          Bajar la luz de la habitación
        </button>
      </div>
      <Note>{blown === 0 ? "Mirar una llama un rato ordena un poco el ruido de adentro. No hay que hacer nada más." : "Apagar una vela con un soplido largo es, también, soltar el aire del todo."}</Note>
    </div>
  );
}

/* ====================================================================== */
/* Globo: se infla mientras mantienes pulsado y se desinfla al soltar.      */
/* ====================================================================== */

export function Balloon(_p: ExperienceProps) {
  const play = useSound();
  const [size, setSize] = useState(0.2);
  const [holding, setHolding] = useState(false);
  const [pops, setPops] = useState(0);
  const [popped, setPopped] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const holdingRef = useRef(false);
  const sizeRef = useRef(0.2);
  const poppedRef = useRef(false);

  // Inflar/desinflar por tiempo real: unos 4 segundos para llenarlo, 7 para desinflarlo.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!poppedRef.current) {
        let s = sizeRef.current;
        if (holdingRef.current) s += dt * 0.22;
        else s = Math.max(0.2, s - dt * 0.14);
        if (s >= 1.05) {
          poppedRef.current = true;
          setPopped(true);
          setPops((n) => n + 1);
          play(110, "drum");
          s = 0.2;
          window.setTimeout(() => {
            poppedRef.current = false;
            setPopped(false);
          }, 1400);
        }
        if (s !== sizeRef.current) {
          sizeRef.current = s;
          setSize(s);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [play]);

  const diameter = 90 + size * 170;

  return (
    <div className="space-y-4">
      <Caption>Mantén pulsado para inflar el globo como si fuera tu barriga al tomar aire: unos cuatro segundos. Suelta y mira cómo se desinfla solo, despacio. Si lo inflas demasiado, explota; no pasa nada, aparece otro.</Caption>
      <div className="grid h-72 place-items-end rounded-3xl bg-soft pb-4">
        <div className="relative flex flex-col items-center">
          {popped ? (
            <p className="fade-up mb-20 text-center font-bold">¡Pum! No pasa nada. Aquí hay otro.</p>
          ) : (
            <>
              <div
                aria-hidden="true"
                className="rounded-[50%_50%_50%_50%/45%_45%_55%_55%] bg-gradient-to-br from-[#f3b6c8] to-[#d86f92] shadow-lg"
                style={{ width: diameter, height: diameter * 1.15, opacity: 0.6 + size * 0.4 }}
              />
              <div aria-hidden="true" className="h-3 w-3 bg-[#d86f92]" style={{ clipPath: "polygon(50% 0, 0 100%, 100% 100%)" }} />
              <div aria-hidden="true" className="h-10 w-0.5 bg-[#7a6a8a]" />
            </>
          )}
        </div>
      </div>
      <p className="sr-only" role="status">
        {popped ? "El globo explotó. Hay uno nuevo." : holding ? "Inflando." : size > 0.3 ? "Desinflándose." : ""}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <HoldButton
          className="btn-primary px-6"
          onHoldStart={() => {
            holdingRef.current = true;
            setHolding(true);
          }}
          onHoldEnd={(ms) => {
            holdingRef.current = false;
            setHolding(false);
            if (ms > 2500) setBreaths((b) => b + 1);
            play(392, "soft");
          }}
        >
          🎈 Inflar (mantén pulsado)
        </HoldButton>
        <span className="text-sm text-muted">
          {breaths} {breaths === 1 ? "respiración larga" : "respiraciones largas"}
          {pops > 0 && ` · ${pops} ${pops === 1 ? "globo explotado" : "globos explotados"}`}
        </span>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Temporizadores: reloj de arena, reloj de pared y bancos para descansar.  */
/* ====================================================================== */

const DURATIONS = [1, 2, 3, 5, 10];

export function Hourglass({ kind }: ExperienceProps) {
  const play = useSound();
  const [minutes, setMinutes] = useState(kind === "reloj-arena" ? 3 : 2);
  const [running, setRunning] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const ms = useStopwatch(running, resetKey);
  const elapsed = ms / 1000;
  const total = minutes * 60;
  const left = Math.max(0, total - elapsed);
  const done = running && left === 0;
  const progress = Math.min(1, elapsed / total);
  const [now, setNow] = useState(() => new Date());
  const entered = useRef(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (done) {
      setRunning(false);
      play(659.25, "bell");
      window.setTimeout(() => play(523.25, "bell"), 500);
    }
  }, [done, play]);

  const isClock = kind === "reloj-pared";
  const isBench = kind.startsWith("banco");
  const sinceEntered = Math.floor((now.getTime() - entered.current) / 60000);

  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  return (
    <div className="space-y-4">
      {isClock && (
        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <svg viewBox="0 0 200 200" className="mx-auto block size-44" role="img" aria-label={`Son las ${now.getHours()}:${m.toString().padStart(2, "0")}`}>
            <circle cx="100" cy="100" r="92" fill="#fffaf0" stroke="#bd9079" strokeWidth="8" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="100" y1="18" x2="100" y2={i % 3 === 0 ? 32 : 26} stroke="#2b3327" strokeWidth={i % 3 === 0 ? 4 : 2} transform={`rotate(${i * 30} 100 100)`} />
            ))}
            <line x1="100" y1="100" x2="100" y2="52" stroke="#2b3327" strokeWidth="6" strokeLinecap="round" transform={`rotate(${h * 30 + m / 2} 100 100)`} />
            <line x1="100" y1="100" x2="100" y2="36" stroke="#2b3327" strokeWidth="4" strokeLinecap="round" transform={`rotate(${m * 6} 100 100)`} />
            <line x1="100" y1="110" x2="100" y2="30" stroke="#bd9079" strokeWidth="2" strokeLinecap="round" transform={`rotate(${s * 6} 100 100)`} />
            <circle cx="100" cy="100" r="5" fill="#bd9079" />
          </svg>
          <div>
            <p className="text-3xl font-extrabold tabular-nums">
              {now.getHours().toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}
            </p>
            <Caption>{sinceEntered < 1 ? "Acabas de llegar a la casa." : `Llevas ${sinceEntered} ${sinceEntered === 1 ? "minuto" : "minutos"} en la casa. No hay un tiempo correcto.`}</Caption>
          </div>
        </div>
      )}

      <Caption>
        {isBench
          ? "Un banco es para sentarse. Elige cuánto rato quieres no hacer nada y el banco te avisa con una campanita cuando pase. También puedes quedarte más."
          : isClock
            ? "Si quieres, el reloj puede medir una pausa por ti, para que no tengas que mirarlo."
            : "Elige cuánto quieres que dure tu pausa. La arena cae a su ritmo; no se puede apurar."}
      </Caption>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        {!isClock && (
          <svg viewBox="0 0 120 200" className="mx-auto block h-52" role="img" aria-label={running ? `Quedan ${formatClock(Math.ceil(left))}` : "Reloj de arena detenido"}>
            <defs>
              <clipPath id="topbulb">
                <path d="M20 14h80v10L66 96v8L100 176v10H20v-10L54 104v-8L20 24z" />
              </clipPath>
            </defs>
            <rect x="12" y="4" width="96" height="10" rx="4" fill="#8f6c5a" />
            <rect x="12" y="186" width="96" height="10" rx="4" fill="#8f6c5a" />
            <path d="M20 14h80v10L66 96v8L100 176v10H20v-10L54 104v-8L20 24z" fill="#eaf3f6" stroke="#9fb8c2" strokeWidth="3" />
            <g clipPath="url(#topbulb)">
              <rect x="20" y={24 + progress * 72} width="80" height={76 - progress * 72} fill="#e2b45a" />
              <rect x="20" y={186 - progress * 72} width="80" height={progress * 72 + 2} fill="#e2b45a" />
              {running && !done && <rect x="58" y="96" width="4" height="90" fill="#e2b45a" />}
            </g>
          </svg>
        )}
        <div className="space-y-3">
          <p className="text-4xl font-extrabold tabular-nums" aria-live="off">
            {formatClock(Math.ceil(left))}
          </p>
          <div role="group" aria-label="Duración" className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={minutes === d}
                disabled={running}
                className={`btn min-h-9 text-sm ${minutes === d ? "btn-primary" : "btn-quiet"}`}
                onClick={() => {
                  setMinutes(d);
                  setResetKey((k) => k + 1);
                }}
              >
                {d} min
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {running ? (
              <button type="button" className="btn btn-quiet" onClick={() => setRunning(false)}>
                <Icon name="stop" size={16} /> Pausar
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (left === 0) setResetKey((k) => k + 1);
                  setRunning(true);
                }}
              >
                <Icon name="play" size={16} /> {elapsed > 0 && left > 0 ? "Seguir" : isBench ? "Sentarme" : "Dar la vuelta"}
              </button>
            )}
            {elapsed > 0 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setRunning(false);
                  setResetKey((k) => k + 1);
                }}
              >
                Reiniciar
              </button>
            )}
          </div>
        </div>
      </div>
      <p role="status" className="min-h-6 font-bold">
        {elapsed > 0 && left === 0 ? "Se terminó la arena. Puedes darle la vuelta, o no." : ""}
      </p>
    </div>
  );
}

/* ====================================================================== */
/* Lámpara: regula la luz de la habitación de fondo.                        */
/* ====================================================================== */

export function Lamp({ setDim, kind }: ExperienceProps) {
  const [level, setLevel] = useState(kind === "lampara-noche" ? 0.6 : 0.3);
  const [on, setOn] = useState(true);
  useEffect(() => {
    setDim(on ? level : 0.9);
    return () => setDim(0);
  }, [level, on, setDim]);
  const warmth = `rgba(255, 196, 120, ${on ? 0.25 + (1 - level) * 0.5 : 0})`;

  return (
    <div className="space-y-4">
      <Caption>Mueve el regulador y la luz de toda la habitación cambia detrás de esta ventana. Puedes dejarla como te guste: se mantiene mientras estés en la habitación.</Caption>
      <div className="relative grid h-56 place-items-center overflow-hidden rounded-3xl transition-colors duration-700" style={{ background: `rgb(${26 - level * 14}, ${26 - level * 14}, ${40 - level * 14})` }}>
        <div aria-hidden="true" className="absolute inset-0 transition-opacity duration-700" style={{ background: `radial-gradient(circle at 50% 35%, ${warmth}, transparent 60%)` }} />
        <svg viewBox="0 0 120 160" className="relative h-44 cursor-pointer" role="button" tabIndex={0} aria-label={on ? "Apagar la lámpara" : "Encender la lámpara"} onClick={() => setOn((v) => !v)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOn((v) => !v); } }}>
          <path d="M30 70L45 20h30l15 50z" fill={on ? "#f3d9a4" : "#9a8f7a"} stroke="#8f6c5a" strokeWidth="3" />
          <rect x="56" y="70" width="8" height="60" fill="#8f6c5a" />
          <ellipse cx="60" cy="135" rx="30" ry="8" fill="#8f6c5a" />
          {on && <ellipse cx="60" cy="72" rx="34" ry="6" fill="#ffe9b8" opacity={1 - level * 0.6} />}
        </svg>
      </div>
      <div role="group" aria-label="Intensidad de la luz" className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold">Luz:</span>
        {[
          { v: 0, t: "☀️ Completa" },
          { v: 0.3, t: "🌤️ Suave" },
          { v: 0.55, t: "🌥️ Tenue" },
          { v: 0.8, t: "🌙 Muy tenue" },
        ].map((o) => (
          <button key={o.v} type="button" aria-pressed={on && level === o.v} className={`btn min-h-9 text-sm ${on && level === o.v ? "btn-primary" : "btn-quiet"}`} onClick={() => { setOn(true); setLevel(o.v); }}>
            {o.t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`btn ${on ? "btn-quiet" : "btn-primary"}`} onClick={() => setOn((v) => !v)}>
          {on ? "Apagar" : "Encender"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setOn(true); setLevel(0); }}>
          Luz completa
        </button>
      </div>
      <Note>Una luz tenue le dice al cuerpo que ya no hay que estar alerta. Por eso la noche empieza en las lámparas, no en el reloj.</Note>
    </div>
  );
}

/* ====================================================================== */
/* Manta y cojín: taparse hasta donde quieras; apretar y soltar.             */
/* ====================================================================== */

export function Blanket({ kind, setDim }: ExperienceProps) {
  const play = useSound();
  const isPillow = kind === "cojin";
  const [cover, setCover] = useState(0.1);
  const [squeeze, setSqueeze] = useState(false);
  const [squeezes, setSqueezes] = useState(0);

  useEffect(() => {
    if (isPillow) return;
    setDim(cover * 0.5);
    return () => setDim(0);
  }, [cover, isPillow, setDim]);

  if (isPillow) {
    return (
      <div className="space-y-4">
        <Caption>Mantén pulsado para apretar el cojín todo lo fuerte que necesites, y suelta. Apretar y soltar, varias veces, es una de las formas más antiguas de descargar tensión.</Caption>
        <div className="grid h-60 place-items-center rounded-3xl bg-soft">
          <div
            aria-hidden="true"
            className="rounded-[40%] bg-gradient-to-br from-[#f6d9a0] to-[#e0b06a] shadow-lg transition-transform duration-200"
            style={{ width: 200, height: 150, transform: squeeze ? "scale(0.86, 0.7)" : "scale(1)" }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <HoldButton
            className="btn-primary px-6"
            onHoldStart={() => {
              setSqueeze(true);
              play(130.81, "soft");
            }}
            onHoldEnd={() => {
              setSqueeze(false);
              setSqueezes((n) => n + 1);
              play(261.63, "soft");
            }}
          >
            ✊ Apretar (mantén pulsado)
          </HoldButton>
          <span className="text-sm text-muted">{squeezes} {squeezes === 1 ? "apretón" : "apretones"}</span>
        </div>
        <Note>Si quieres hacerlo con tu propio cuerpo: aprieta los puños cinco segundos y suéltalos de golpe. Nota la diferencia entre antes y después.</Note>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Caption>Toca la manta para subirla un poco más, o elige hasta dónde taparte. La luz de la habitación baja un poco mientras más te tapas.</Caption>
      <div
        role="button"
        tabIndex={0}
        aria-label="Tirar de la manta hacia arriba"
        className="relative h-72 cursor-pointer select-none overflow-hidden rounded-3xl bg-soft outline-none focus-visible:ring-4 focus-visible:ring-primary"
        onClick={() => { const next = cover >= 1 ? 0.1 : cover < 0.45 ? 0.45 : cover < 0.75 ? 0.75 : 1; setCover(next); play(261.63 + next * 200, "soft"); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const next = cover >= 1 ? 0.1 : cover < 0.45 ? 0.45 : cover < 0.75 ? 0.75 : 1; setCover(next); } }}
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-10 mx-auto size-24 rounded-full bg-[#e8c8a4]" />
        <div aria-hidden="true" className="absolute inset-x-0 top-32 mx-auto h-40 w-40 rounded-t-[50%] bg-[#c99a6b]" />
        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-0 rounded-t-[2rem] bg-gradient-to-b from-[#d6c3e3] to-[#b79fc9] shadow-[0_-8px_20px_rgba(0,0,0,0.12)] transition-[height] duration-200"
          style={{ height: `${15 + cover * 80}%`, backgroundImage: "repeating-linear-gradient(90deg, transparent 0 28px, rgba(255,255,255,0.25) 28px 30px)" }}
        />
      </div>
      <div role="group" aria-label="Cuánto te tapa la manta" className="flex flex-wrap items-center gap-2">
        {[
          { v: 0.1, t: "Destapado" },
          { v: 0.45, t: "Hasta la cintura" },
          { v: 0.75, t: "Hasta los hombros" },
          { v: 1, t: "Hasta las orejas" },
        ].map((o) => (
          <button key={o.v} type="button" aria-pressed={cover === o.v} className={`btn min-h-9 text-sm ${cover === o.v ? "btn-primary" : "btn-quiet"}`} onClick={() => { setCover(o.v); play(261.63 + o.v * 200, "soft"); }}>
            {o.t}
          </button>
        ))}
      </div>
      <Note>Debajo de una manta el mundo se vuelve más pequeño y manejable. Hay gente que piensa mejor así. Y gente que, por fin, deja de pensar.</Note>
    </div>
  );
}
