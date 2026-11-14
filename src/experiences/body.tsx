import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Icon } from "../components/Icon";
import { useComfort, useSound } from "../lib/comfort";
import { Caption, Note, useStopwatch, type ExperienceProps } from "./shared";

/* ====================================================================== */
/* Pelota: física sencilla; lánzala, atrápala, déjala botar.                 */
/* ====================================================================== */

export function Ball(_p: ExperienceProps) {
  const play = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ball = useRef({ x: 320, y: 120, vx: 2, vy: 0, r: 34, held: false });
  const trail = useRef<{ x: number; y: number; t: number }[]>([]);
  const [bounces, setBounces] = useState(0);
  const lastSound = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const W = canvas.width;
    const H = canvas.height;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      // Factor de tiempo: la pelota cae igual en cualquier pantalla.
      const k = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const b = ball.current;
      if (!b.held) {
        b.vy += 0.45 * k;
        b.x += b.vx * k;
        b.y += b.vy * k;
        b.vx *= Math.pow(0.999, k);
        let hit = false;
        if (b.y + b.r > H) {
          b.y = H - b.r;
          if (Math.abs(b.vy) > 1.5) hit = true;
          b.vy = -b.vy * 0.72;
          b.vx *= 0.96;
        }
        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = -b.vx * 0.8;
          hit = Math.abs(b.vx) > 1.5;
        }
        if (b.x + b.r > W) {
          b.x = W - b.r;
          b.vx = -b.vx * 0.8;
          hit = Math.abs(b.vx) > 1.5;
        }
        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy = -b.vy * 0.8;
        }
        if (hit) {
          setBounces((n) => n + 1);
          const now = performance.now();
          if (now - lastSound.current > 90) {
            lastSound.current = now;
            play(80 + Math.min(60, Math.abs(b.vy) * 3), "drum");
          }
        }
      }
      g.clearRect(0, 0, W, H);
      g.fillStyle = "#f5e6da";
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#d8c0a2";
      g.fillRect(0, H - 14, W, 14);
      // sombra
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.beginPath();
      g.ellipse(b.x, H - 8, b.r * (1 - (H - b.y) / (H * 2)), 6, 0, 0, Math.PI * 2);
      g.fill();
      // pelota
      const grad = g.createRadialGradient(b.x - 10, b.y - 12, 4, b.x, b.y, b.r);
      grad.addColorStop(0, "#f2a0a0");
      grad.addColorStop(1, "#d9705f");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.5)";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(b.x, b.y, b.r - 8, Math.PI * 1.1, Math.PI * 1.9);
      g.stroke();
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play]);

  function pos(e: PointerEvent<HTMLCanvasElement>) {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  }

  return (
    <div className="space-y-4">
      <Caption>Agarra la pelota y lánzala con un gesto rápido, o déjala caer y mira cómo bota hasta quedarse quieta. Con el teclado: Espacio la hace saltar, flechas la empujan.</Caption>
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        role="img"
        tabIndex={0}
        aria-label="Pelota que bota. Espacio para saltar, flechas para empujar."
        className="block aspect-[8/5] w-full cursor-grab touch-none rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-primary"
        onPointerDown={(e) => {
          const p = pos(e);
          const b = ball.current;
          if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + 20) {
            b.held = true;
            trail.current = [{ ...p, t: performance.now() }];
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          const b = ball.current;
          if (!b.held) return;
          const p = pos(e);
          b.x = p.x;
          b.y = p.y;
          trail.current.push({ ...p, t: performance.now() });
          if (trail.current.length > 6) trail.current.shift();
        }}
        onPointerUp={() => {
          const b = ball.current;
          if (!b.held) return;
          b.held = false;
          const t = trail.current;
          if (t.length >= 2) {
            const a = t[0];
            const z = t[t.length - 1];
            const dt = Math.max(16, z.t - a.t);
            b.vx = ((z.x - a.x) / dt) * 16;
            b.vy = ((z.y - a.y) / dt) * 16;
          }
        }}
        onKeyDown={(e) => {
          const b = ball.current;
          if (e.key === " ") {
            e.preventDefault();
            b.vy = -14;
          } else if (e.key === "ArrowLeft") b.vx -= 4;
          else if (e.key === "ArrowRight") b.vx += 4;
          else if (e.key === "ArrowUp") b.vy -= 6;
        }}
      />
      <Note>
        {bounces} {bounces === 1 ? "bote" : "botes"}. {bounces > 30 ? "Si hay algo de enojo en el cuerpo, la pelota lo aguanta. Y luego se queda quieta, igual que tú." : "La energía busca por dónde salir. Lanzar algo que no se rompe es una buena salida."}
      </Note>
    </div>
  );
}

/* ====================================================================== */
/* Colchoneta: una secuencia de estiramientos suaves con tiempo.             */
/* ====================================================================== */

type JointKey = "h" | "n" | "ls" | "rs" | "le" | "re" | "lh" | "rh" | "hp" | "lk" | "rk" | "lf" | "rf";
type Joints = Record<JointKey, [number, number]>;
const JOINT_KEYS: JointKey[] = ["h", "n", "ls", "rs", "le", "re", "lh", "rh", "hp", "lk", "rk", "lf", "rf"];

const STAND: Joints = {
  h: [60, 22], n: [60, 42], ls: [50, 46], rs: [70, 46], le: [46, 68], re: [74, 68],
  lh: [44, 88], rh: [76, 88], hp: [60, 100], lk: [54, 128], rk: [66, 128], lf: [52, 156], rf: [68, 156],
};

const POSES: { name: string; seconds: number; text: string; joints: Joints }[] = [
  { name: "Llegar", seconds: 20, text: "De pie, sentado o acostado. Nota los puntos de apoyo: pies, glúteos, espalda. Nada que corregir.", joints: STAND },
  { name: "Cuello", seconds: 30, text: "Deja caer la oreja hacia el hombro, sin forzar. Vuelve despacio al centro antes de cambiar de lado.", joints: { ...STAND, h: [70, 27] } },
  { name: "Hombros", seconds: 25, text: "Sube los hombros hacia las orejas al tomar aire y déjalos caer de golpe al soltarlo. Tres o cuatro veces.", joints: { ...STAND, h: [60, 20], n: [60, 40], ls: [48, 40], rs: [72, 40], le: [44, 60], re: [76, 60], lh: [44, 82], rh: [76, 82] } },
  { name: "Brazos arriba", seconds: 25, text: "Entrelaza los dedos y estira los brazos hacia el techo, como al despertar. Bostezar está permitido.", joints: { ...STAND, le: [40, 30], re: [80, 30], lh: [50, 12], rh: [70, 12] } },
  { name: "Torsión suave", seconds: 30, text: "Abre los brazos a los lados y gira el tronco despacio hacia un lado, sin forzar la espalda. A la mitad del tiempo, al otro lado.", joints: { ...STAND, ls: [54, 46], rs: [66, 46], le: [36, 46], lh: [18, 46], re: [84, 46], rh: [102, 46] } },
  { name: "Plegarse", seconds: 30, text: "Deja caer el tronco hacia adelante con las rodillas blandas, los brazos colgando. La cabeza pesa; déjala.", joints: { ...STAND, h: [60, 132], n: [60, 114], ls: [50, 118], rs: [70, 118], le: [48, 134], re: [72, 134], lh: [46, 150], rh: [74, 150] } },
  { name: "Quietud", seconds: 30, text: "Vuelve a la posición inicial. Nota si algo cambió: el calor en las manos, el espacio entre los hombros.", joints: STAND },
];

/** Figura articulada: al cambiar de postura, cada articulación se desplaza hasta su nueva posición. */
function Figure({ joints }: { joints: Joints }) {
  const [cur, setCur] = useState<Joints>(joints);
  const curRef = useRef<Joints>(joints);
  useEffect(() => {
    const from = curRef.current;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const next = {} as Joints;
      for (const key of JOINT_KEYS) {
        next[key] = [
          from[key][0] + (joints[key][0] - from[key][0]) * e,
          from[key][1] + (joints[key][1] - from[key][1]) * e,
        ];
      }
      curRef.current = next;
      setCur(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [joints]);

  const P = (k: JointKey) => `${cur[k][0].toFixed(1)} ${cur[k][1].toFixed(1)}`;
  return (
    <svg viewBox="0 0 120 170" className="h-44 w-32" aria-hidden="true">
      <g fill="none" stroke="#627757" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${P("n")} L${P("hp")}`} />
        <path d={`M${P("ls")} L${P("rs")}`} />
        <path d={`M${P("ls")} L${P("le")} L${P("lh")}`} />
        <path d={`M${P("rs")} L${P("re")} L${P("rh")}`} />
        <path d={`M${P("hp")} L${P("lk")} L${P("lf")}`} />
        <path d={`M${P("hp")} L${P("rk")} L${P("rf")}`} />
      </g>
      <circle cx={cur.h[0]} cy={cur.h[1]} r="12" fill="#e8c8a4" stroke="#8f6c5a" strokeWidth="2.5" />
    </svg>
  );
}

export function Stretch(_p: ExperienceProps) {
  const play = useSound();
  const [i, setI] = useState(0);
  const [running, setRunning] = useState(false);
  const [offset, setOffset] = useState(0);
  const ms = useStopwatch(running, null);
  const pose = POSES[Math.min(i, POSES.length - 1)];
  const elapsed = Math.max(0, (ms - offset) / 1000);
  const left = Math.max(0, pose.seconds - elapsed);
  const finished = i >= POSES.length;

  useEffect(() => {
    if (!running || left > 0) return;
    play(659.25, "bell");
    if (i < POSES.length - 1) {
      setOffset(ms);
      setI((n) => n + 1);
    } else {
      setRunning(false);
      setI(POSES.length);
    }
  }, [running, left, i, ms, play]);

  function goTo(n: number) {
    setOffset(ms);
    setI(n);
  }

  return (
    <div className="space-y-4">
      <Caption>Siete estiramientos suaves, unos tres minutos en total. Cada uno tiene su tiempo y pasa solo al siguiente. Muévete solo hasta donde te resulte cómodo, y salta el que no te apetezca.</Caption>
      <ol className="flex flex-wrap gap-1.5" aria-label="Estiramientos">
        {POSES.map((p, n) => (
          <li key={p.name}>
            <button type="button" aria-current={n === i ? "step" : undefined} className={`cursor-pointer rounded-full px-3 py-1 text-xs font-bold ${n === i ? "bg-accent text-accent-ink" : n < i ? "bg-soft text-muted" : "bg-surface border border-line"}`} onClick={() => goTo(n)}>
              {p.name}
            </button>
          </li>
        ))}
      </ol>
      {finished ? (
        <div className="fade-up rounded-2xl border border-line p-5 text-center">
          <p className="text-lg font-extrabold">Tu cuerpo te acompañó hasta aquí.</p>
          <p className="mt-1 text-muted">Puedes darle las gracias a tu manera. O repetir el que más te gustó.</p>
          <button type="button" className="btn btn-quiet mt-3" onClick={() => { goTo(0); setRunning(false); }}>
            Empezar de nuevo
          </button>
        </div>
      ) : (
        <div className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="mx-auto">
            <Figure joints={pose.joints} />
          </div>
          <div>
            <p className="text-xl font-extrabold">{pose.name}</p>
            <p className="mt-1">{pose.text}</p>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">{Math.ceil(left)} s</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, (elapsed / pose.seconds) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}
      {!finished && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`btn ${running ? "btn-quiet" : "btn-primary"}`} onClick={() => setRunning((r) => !r)}>
            <Icon name={running ? "stop" : "play"} size={16} /> {running ? "Pausar" : elapsed > 0 ? "Seguir" : "Empezar"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => goTo(i + 1)}>
            <Icon name="skip" size={16} /> Saltar este
          </button>
        </div>
      )}
    </div>
  );
}

/* ====================================================================== */
/* Cinta: una estela que sigue tu mano y dibuja en el aire.                  */
/* ====================================================================== */

const RIBBONS = ["#e2a5a5", "#a291b4", "#8fb1c4", "#e0b96a", "#7fae6f"];

export function Ribbon(_p: ExperienceProps) {
  const { comfort } = useComfort();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<{ x: number; y: number; t: number }[]>([]);
  const [color, setColor] = useState(RIBBONS[0]);
  const colorRef = useRef(color);
  colorRef.current = color;

  useEffect(() => {
    const canvas = canvasRef.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    let raf = 0;
    const draw = () => {
      const now = performance.now();
      const life = comfort.reduceMotion ? 6000 : 1800;
      points.current = points.current.filter((p) => now - p.t < life);
      g.clearRect(0, 0, canvas.width, canvas.height);
      g.fillStyle = "#fbf6ee";
      g.fillRect(0, 0, canvas.width, canvas.height);
      const pts = points.current;
      for (let i = 1; i < pts.length; i++) {
        const age = (now - pts[i].t) / life;
        g.strokeStyle = colorRef.current;
        g.globalAlpha = 1 - age;
        g.lineWidth = 18 * (1 - age) + 2;
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(pts[i - 1].x, pts[i - 1].y);
        g.lineTo(pts[i].x, pts[i].y);
        g.stroke();
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [comfort.reduceMotion]);

  return (
    <div className="space-y-4">
      <Caption>Mueve el dedo o el ratón por el espacio: la cinta sigue tu mano y se desvanece sola. Círculos grandes, ondas pequeñas, garabatos. Si puedes, acompaña con el brazo entero.</Caption>
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        role="img"
        aria-label="Cinta que sigue el movimiento del puntero"
        className="block aspect-[8/5] w-full touch-none rounded-2xl border border-line"
        onPointerMove={(e) => {
          const c = e.currentTarget;
          const r = c.getBoundingClientRect();
          points.current.push({ x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height, t: performance.now() });
          if (points.current.length > 200) points.current.shift();
        }}
      />
      <div role="group" aria-label="Color de la cinta" className="flex gap-2">
        {RIBBONS.map((c) => (
          <button key={c} type="button" aria-pressed={color === c} aria-label={`Cinta ${c}`} onClick={() => setColor(c)} className={`size-9 cursor-pointer rounded-full border-2 ${color === c ? "border-ink" : "border-line"}`} style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
