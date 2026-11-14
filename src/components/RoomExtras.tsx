import { useEffect, useRef, useState } from "react";
import { useComfort, useSound } from "../lib/comfort";
import { Icon } from "./Icon";

/* ------------------------------------------------------------------ */
/* Sala de Respiración: círculo que respira al ritmo 4 · 2 · 6.         */
/* El tiempo se mide con el reloj del navegador y el tamaño se         */
/* calcula en cada fotograma, así el movimiento es continuo.           */
/* ------------------------------------------------------------------ */

const PHASES = [
  { label: "Entra el aire", seconds: 4, tone: 392 },
  { label: "Pausa suave", seconds: 2, tone: 0 },
  { label: "Sale el aire, despacio", seconds: 6, tone: 261.63 },
] as const;
const CYCLE = PHASES.reduce((sum, p) => sum + p.seconds, 0);
const MIN_SCALE = 0.58;

/** Curva suave de principio y final: el círculo no da tirones. */
const ease = (k: number) => 0.5 - Math.cos(Math.PI * k) / 2;

export function BreathingCircle() {
  const { comfort } = useComfort();
  const play = useSound();
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const startRef = useRef(0);
  const lastPhase = useRef(-1);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      setT((now - startRef.current) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const m = t % CYCLE;
  const phaseIndex = m < 4 ? 0 : m < 6 ? 1 : 2;
  const phaseStart = phaseIndex === 0 ? 0 : phaseIndex === 1 ? 4 : 6;
  const phase = PHASES[phaseIndex];
  const into = m - phaseStart;
  const k = Math.min(1, into / phase.seconds);
  const remaining = Math.max(0, Math.ceil(phase.seconds - into));

  let scale = MIN_SCALE;
  if (running) {
    if (comfort.reduceMotion) {
      scale = phaseIndex === 2 ? MIN_SCALE : 1;
    } else if (phaseIndex === 0) {
      scale = MIN_SCALE + (1 - MIN_SCALE) * ease(k);
    } else if (phaseIndex === 1) {
      scale = 1;
    } else {
      scale = 1 - (1 - MIN_SCALE) * ease(k);
    }
  }

  useEffect(() => {
    if (!running) {
      lastPhase.current = -1;
      return;
    }
    if (lastPhase.current !== phaseIndex) {
      lastPhase.current = phaseIndex;
      const tone = PHASES[phaseIndex].tone;
      if (tone) play(tone, "flute");
    }
  }, [running, phaseIndex, play]);

  return (
    <section aria-labelledby="respirar-titulo" className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <h2 id="respirar-titulo" className="text-lg font-extrabold">
        Un círculo que respira contigo
      </h2>
      <p className="mt-1 text-sm text-muted">
        Marca un ritmo lento: entra el aire en 4, una pausa de 2, sale en 6. Síguelo solo si te sienta bien; puedes detenerlo cuando quieras.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
        <div className="relative grid size-44 shrink-0 place-items-center" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border-2 border-dashed border-line" />
          <span className="absolute inset-2 rounded-full bg-accent opacity-80" style={{ transform: `scale(${scale})` }} />
          <span className="relative text-3xl font-extrabold text-ink tabular-nums">{running ? remaining : "·"}</span>
        </div>

        <div className="text-center sm:text-left">
          <p className="min-h-8 text-xl font-extrabold">{running ? phase.label : "Cuando quieras"}</p>
          <p className="sr-only" role="status">
            {running ? phase.label : ""}
          </p>
          <button
            type="button"
            className={`btn mt-3 ${running ? "btn-quiet" : "btn-primary"}`}
            onClick={() => {
              setT(0);
              setRunning((r) => !r);
            }}
          >
            <Icon name={running ? "stop" : "play"} size={16} />
            {running ? "Detener" : "Empezar"}
          </button>
        </div>
      </div>
    </section>
  );
}
