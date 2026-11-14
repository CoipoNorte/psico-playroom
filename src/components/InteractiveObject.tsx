import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import type { ObjectDef } from "../lib/rooms-data";
import type { Point } from "../lib/store";
import { ObjectArt } from "./ObjectArt";

/** Límites (en %) dentro de los que puede moverse un objeto. */
export const BOUNDS = { minX: 7, maxX: 93, minY: 10, maxY: 91 };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function clampPoint(p: Point): Point {
  return { x: clamp(p.x, BOUNDS.minX, BOUNDS.maxX), y: clamp(p.y, BOUNDS.minY, BOUNDS.maxY) };
}

const SPARK_ANGLES = [0, 60, 120, 180, 240, 300];

interface Props {
  def: ObjectDef;
  /** Emoji a mostrar (puede variar con las etapas de crecimiento). */
  emoji?: string;
  position: Point;
  /** Cambia en cada activación para relanzar la animación. */
  burst: number;
  active: boolean;
  guided?: boolean;
  sceneRef: RefObject<HTMLDivElement | null>;
  hintId: string;
  onActivate: () => void;
  onMove: (p: Point) => void;
}

export function InteractiveObject({ def, emoji, position, burst, active, guided, sceneRef, hintId, onActivate, onMove }: Props) {
  const drag = useRef<{ id: number; startX: number; startY: number; offX: number; offY: number; moved: boolean; last: Point | null } | null>(null);
  const suppressClick = useRef(false);
  const [live, setLive] = useState<Point | null>(null);

  const shown = live ?? position;

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const scene = sceneRef.current;
    if (!scene) return;
    suppressClick.current = false;
    const rect = scene.getBoundingClientRect();
    const centerX = rect.left + (position.x / 100) * rect.width;
    const centerY = rect.top + (position.y / 100) * rect.height;
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      offX: e.clientX - centerX,
      offY: e.clientY - centerY,
      moved: false,
      last: null,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Sin captura el arrastre sigue funcionando mientras el puntero esté sobre el objeto.
    }
  }

  function handlePointerMove(e: PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    const scene = sceneRef.current;
    if (!d || d.id !== e.pointerId || !scene) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 6) return;
    d.moved = true;
    const rect = scene.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    d.last = clampPoint({
      x: ((e.clientX - d.offX - rect.left) / rect.width) * 100,
      y: ((e.clientY - d.offY - rect.top) / rect.height) * 100,
    });
    setLive(d.last);
  }

  function finishDrag(e: PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.moved) {
      suppressClick.current = true;
      if (d.last) onMove(d.last);
      setLive(null);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const step = e.shiftKey ? 6 : 2;
    const delta: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const move = delta[e.key];
    if (!move) return;
    e.preventDefault();
    onMove(clampPoint({ x: position.x + move.x, y: position.y + move.y }));
  }

  return (
    <button
      type="button"
      tabIndex={0}
      aria-label={def.label}
      aria-describedby={hintId}
      data-dragging={live ? "true" : "false"}
      data-guided={guided ? "true" : "false"}
      className="scene-object absolute grid min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl p-1 text-[clamp(2.1rem,8vw,3.6rem)] leading-none"
      style={{ left: `${shown.x}%`, top: `${shown.y}%`, zIndex: live ? 200 : Math.round(shown.y) }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onKeyDown={handleKeyDown}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        onActivate();
      }}
    >
      {guided && <span aria-hidden="true" className="guided-orbit pointer-events-none absolute -inset-2 rounded-full border-2 border-dashed border-[#fff3cf]" />}
      {active && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-white/45 ring-2 ring-white/80"
        />
      )}
      {burst > 0 && (
        <span key={`fx-${burst}`} aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="obj-halo absolute inset-0 rounded-full bg-white/70" />
          {SPARK_ANGLES.map((a) => (
            <span key={a} className="sparkle" style={{ "--a": `${a + (burst % 2) * 30}deg` } as CSSProperties} />
          ))}
        </span>
      )}
      <span className="obj-art relative block">
        <span key={`pop-${burst}`} className={`block ${burst > 0 ? "obj-pop" : ""}`}>
          {def.art ? <ObjectArt art={def.art} /> : <span aria-hidden="true">{emoji ?? def.emoji}</span>}
        </span>
      </span>
    </button>
  );
}
