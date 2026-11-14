import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Room } from "../lib/rooms-data";
import { getExperience, saveExperience } from "../lib/store";

export interface ExperienceProps {
  kind: string;
  room: Room;
  onOpenJournal: () => void;
  onClose: () => void;
  /** Oscurece la habitación de fondo (0 = nada, 1 = casi a oscuras). */
  setDim: (value: number) => void;
}

/** Estado que sobrevive al cerrar la experiencia y al recargar. */
export function usePersistent<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => getExperience<T>(key, initial));
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        saveExperience(key, value);
        return value;
      });
    },
    [key],
  );
  return [state, set];
}

/** Cronómetro de precisión: mide con el reloj del navegador, así que no se atrasa aunque la pestaña vaya lenta. */
function useElapsed(running: boolean, resetKey: unknown, frame: boolean): number {
  const acc = useRef(0);
  const since = useRef<number | null>(null);
  const [ms, setMs] = useState(0);

  useEffect(() => {
    acc.current = 0;
    since.current = running ? performance.now() : null;
    setMs(0);
    // Solo se reinicia cuando cambia resetKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    const read = () => acc.current + (since.current !== null ? performance.now() - since.current : 0);
    if (!running) {
      setMs(acc.current);
      return;
    }
    since.current = performance.now();
    setMs(read());
    let raf = 0;
    let timer = 0;
    if (frame) {
      const loop = () => {
        setMs(read());
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    } else {
      timer = window.setInterval(() => setMs(read()), 100);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      if (since.current !== null) {
        acc.current += performance.now() - since.current;
        since.current = null;
      }
    };
  }, [running, frame]);

  return ms;
}

/** Segundos transcurridos mientras `running` (entero, para mostrar en pantalla). */
export function useTicker(running: boolean, resetKey: unknown = null): number {
  return Math.floor(useElapsed(running, resetKey, false) / 1000);
}

/** Milisegundos transcurridos con actualización por fotograma (para animaciones suaves). */
export function useStopwatch(running: boolean, resetKey: unknown = null): number {
  return useElapsed(running, resetKey, true);
}

/** Valor que se acerca suavemente a `target` en `duration` ms (animación de crecimiento, etc.). */
export function useTween(target: number, duration = 800): number {
  const [v, setV] = useState(target);
  const vRef = useRef(target);
  useEffect(() => {
    const from = vRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      const next = from + (target - from) * e;
      vRef.current = next;
      setV(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/** Botón que detecta cuánto tiempo se mantiene pulsado (ratón, dedo o teclado). */
export function HoldButton({
  children,
  className = "",
  onHoldStart,
  onHoldEnd,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onHoldStart: () => void;
  onHoldEnd: (heldMs: number) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const start = useRef<number | null>(null);
  const begin = () => {
    if (disabled || start.current !== null) return;
    start.current = performance.now();
    onHoldStart();
  };
  const end = () => {
    if (start.current === null) return;
    const held = performance.now() - start.current;
    start.current = null;
    onHoldEnd(held);
  };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`btn select-none touch-none ${className}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        begin();
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          begin();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") end();
      }}
      onBlur={end}
    >
      {children}
    </button>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-soft px-4 py-3 text-sm text-muted">{children}</p>;
}

export function Caption({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

/** Convierte coordenadas del puntero a coordenadas del viewBox de un SVG. */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inv = ctm.inverse();
  return { x: inv.a * clientX + inv.c * clientY + inv.e, y: inv.b * clientX + inv.d * clientY + inv.f };
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Generador pseudoaleatorio determinista (para cielos y texturas estables). */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
