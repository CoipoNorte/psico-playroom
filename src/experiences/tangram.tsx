import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, Note, svgPoint, type ExperienceProps } from "./shared";

type Pt = [number, number];

interface PieceDef {
  id: string;
  shape: "big" | "medium" | "small" | "square" | "para";
  color: string;
  /** Vértices en el cuadrado clásico de 100 × 100. */
  pts: Pt[];
  label: string;
}

// Descomposición clásica del cuadrado 100×100 en las 7 piezas.
const PIECES: PieceDef[] = [
  { id: "A", shape: "big", color: "#e88a7a", pts: [[0, 0], [100, 0], [50, 50]], label: "Triángulo grande rojo" },
  { id: "B", shape: "big", color: "#6f9fd0", pts: [[0, 0], [50, 50], [0, 100]], label: "Triángulo grande azul" },
  { id: "M", shape: "medium", color: "#7fae6f", pts: [[100, 50], [100, 100], [50, 100]], label: "Triángulo mediano verde" },
  { id: "S1", shape: "small", color: "#e9a84c", pts: [[50, 50], [75, 25], [75, 75]], label: "Triángulo pequeño naranja" },
  { id: "S2", shape: "small", color: "#e6cf52", pts: [[0, 100], [50, 100], [25, 75]], label: "Triángulo pequeño amarillo" },
  { id: "Q", shape: "square", color: "#a291b4", pts: [[50, 50], [75, 75], [50, 100], [25, 75]], label: "Cuadrado lila" },
  { id: "P", shape: "para", color: "#6fc3c9", pts: [[75, 25], [100, 0], [100, 50], [75, 75]], label: "Paralelogramo turquesa" },
];

const HALF1 = new Set(["A", "B"]);

interface Transform {
  rot: number; // grados
  dx: number;
  dy: number;
}

interface Figure {
  id: string;
  name: string;
  half1: Transform;
  half2: Transform;
  offset: Pt;
}

// Cada figura se construye moviendo rígidamente las dos mitades del cuadrado
// (A+B por un lado; las otras cinco piezas por el otro), así la solución es exacta.
const FIGURES: Figure[] = [
  { id: "square", name: "Cuadrado", half1: { rot: 0, dx: 0, dy: 0 }, half2: { rot: 0, dx: 0, dy: 0 }, offset: [160, 20] },
  { id: "triangle", name: "Triángulo", half1: { rot: 90, dx: 100, dy: 0 }, half2: { rot: 180, dx: 200, dy: 100 }, offset: [110, 30] },
  { id: "para", name: "Paralelogramo", half1: { rot: 0, dx: 0, dy: 0 }, half2: { rot: 0, dx: -100, dy: 0 }, offset: [210, 30] },
];

function rotate([x, y]: Pt, deg: number): Pt {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
}

function centroid(pts: Pt[]): Pt {
  const n = pts.length;
  return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
}

interface PieceState {
  x: number; // posición del centroide
  y: number;
  rot: number;
  flip: boolean;
}

/** Puntos del mundo de una pieza según su estado. */
function worldPoints(def: PieceDef, st: PieceState): Pt[] {
  const c = centroid(def.pts);
  return def.pts.map(([px, py]) => {
    const lx = (st.flip ? -1 : 1) * (px - c[0]);
    const ly = py - c[1];
    const [rx, ry] = rotate([lx, ly], st.rot);
    return [rx + st.x, ry + st.y];
  });
}

function targetPoints(def: PieceDef, fig: Figure): Pt[] {
  const t = HALF1.has(def.id) ? fig.half1 : fig.half2;
  return def.pts.map((p) => {
    const [rx, ry] = rotate(p, t.rot);
    return [rx + t.dx + fig.offset[0], ry + t.dy + fig.offset[1]];
  });
}

function sameShape(a: Pt[], b: Pt[], tol = 5): boolean {
  if (a.length !== b.length) return false;
  return a.every(([ax, ay]) => b.some(([bx, by]) => Math.hypot(ax - bx, ay - by) < tol));
}

function scattered(): Record<string, PieceState> {
  const spots: Pt[] = [[60, 215], [135, 230], [215, 225], [290, 215], [355, 235], [110, 275], [330, 280]];
  const rots = [45, 0, 90, 135, 0, 45, 0];
  return Object.fromEntries(PIECES.map((p, i) => [p.id, { x: spots[i][0], y: spots[i][1], rot: rots[i], flip: false }]));
}

const VW = 420;
const VH = 310;

export function Tangram(_props: ExperienceProps) {
  const play = useSound();
  const svgRef = useRef<SVGSVGElement>(null);
  const [figureId, setFigureId] = useState<string>("square");
  const [pieces, setPieces] = useState<Record<string, PieceState>>(scattered);
  const [selected, setSelected] = useState<string | null>(null);
  const drag = useRef<{ id: string; ox: number; oy: number; moved: boolean; pointer: number } | null>(null);
  const lastTap = useRef(0);

  const figure = FIGURES.find((f) => f.id === figureId) ?? null;

  const targets = useMemo(() => (figure ? PIECES.map((p) => ({ def: p, pts: targetPoints(p, figure) })) : []), [figure]);

  const solved = useMemo(() => {
    if (!figure) return false;
    const used = new Set<number>();
    return PIECES.every((p) => {
      const wp = worldPoints(p, pieces[p.id]);
      const idx = targets.findIndex((t, i) => !used.has(i) && t.def.shape === p.shape && sameShape(wp, t.pts));
      if (idx < 0) return false;
      used.add(idx);
      return true;
    });
  }, [figure, pieces, targets]);

  function update(id: string, patch: Partial<PieceState>) {
    setPieces((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  }

  /** Imán: acerca un vértice de la pieza al vértice más cercano de la silueta o de otra pieza. */
  function snap(id: string, st: PieceState): PieceState {
    const mine = worldPoints(PIECES.find((p) => p.id === id)!, st);
    const others: Pt[] = [];
    targets.forEach((t) => others.push(...t.pts));
    PIECES.filter((p) => p.id !== id).forEach((p) => others.push(...worldPoints(p, pieces[p.id])));
    let best: { d: number; dx: number; dy: number } | null = null;
    for (const [mx, my] of mine) {
      for (const [ox, oy] of others) {
        const d = Math.hypot(ox - mx, oy - my);
        if (d < 9 && (!best || d < best.d)) best = { d, dx: ox - mx, dy: oy - my };
      }
    }
    return best ? { ...st, x: st.x + best.dx, y: st.y + best.dy } : st;
  }

  function rotatePiece(id: string, dir = 1) {
    setPieces((p) => ({ ...p, [id]: snap(id, { ...p[id], rot: (p[id].rot + 45 * dir + 360) % 360 }) }));
    play(440, "pluck");
  }

  function flipPiece(id: string) {
    setPieces((p) => ({ ...p, [id]: snap(id, { ...p[id], flip: !p[id].flip }) }));
    play(392, "pluck");
  }

  function onPointerDown(e: PointerEvent<SVGGElement>, id: string) {
    if (!svgRef.current) return;
    const p = svgPoint(svgRef.current, e.clientX, e.clientY);
    drag.current = { id, ox: p.x - pieces[id].x, oy: p.y - pieces[id].y, moved: false, pointer: e.pointerId };
    setSelected(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<SVGGElement>) {
    const d = drag.current;
    if (!d || !svgRef.current || d.pointer !== e.pointerId) return;
    const p = svgPoint(svgRef.current, e.clientX, e.clientY);
    const nx = Math.max(10, Math.min(VW - 10, p.x - d.ox));
    const ny = Math.max(10, Math.min(VH - 10, p.y - d.oy));
    if (Math.hypot(nx - pieces[d.id].x, ny - pieces[d.id].y) > 1) d.moved = true;
    update(d.id, { x: nx, y: ny });
  }

  function onPointerUp(e: PointerEvent<SVGGElement>) {
    const d = drag.current;
    if (!d || d.pointer !== e.pointerId) return;
    drag.current = null;
    if (d.moved) {
      setPieces((p) => ({ ...p, [d.id]: snap(d.id, p[d.id]) }));
      play(523.25, "pluck");
    } else {
      // Toque simple: doble toque gira.
      const now = performance.now();
      if (now - lastTap.current < 350) rotatePiece(d.id);
      lastTap.current = now;
    }
  }

  function onKey(e: KeyboardEvent<SVGGElement>, id: string) {
    const step = e.shiftKey ? 25 : 5;
    const map: Record<string, () => void> = {
      ArrowLeft: () => update(id, { x: pieces[id].x - step }),
      ArrowRight: () => update(id, { x: pieces[id].x + step }),
      ArrowUp: () => update(id, { y: pieces[id].y - step }),
      ArrowDown: () => update(id, { y: pieces[id].y + step }),
      r: () => rotatePiece(id),
      R: () => rotatePiece(id, -1),
      f: () => flipPiece(id),
      F: () => flipPiece(id),
      Enter: () => rotatePiece(id),
      " ": () => rotatePiece(id),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      setSelected(id);
      fn();
    }
  }

  const order = useMemo(() => [...PIECES.filter((p) => p.id !== selected), ...PIECES.filter((p) => p.id === selected)], [selected]);

  return (
    <div className="space-y-4">
      <Caption>
        Arrastra las piezas hasta la silueta. Doble toque, Enter o «Girar» las gira 45°; «Voltear» las refleja (al paralelogramo le hace falta a veces). Con el teclado: flechas para mover, R para girar, F para voltear.
      </Caption>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold">Figura:</span>
        {FIGURES.map((f) => (
          <button key={f.id} type="button" aria-pressed={figureId === f.id} className={`btn min-h-9 text-sm ${figureId === f.id ? "btn-primary" : "btn-quiet"}`} onClick={() => setFigureId(f.id)}>
            {f.name}
          </button>
        ))}
        <button type="button" aria-pressed={figureId === "free"} className={`btn min-h-9 text-sm ${figureId === "free" ? "btn-primary" : "btn-quiet"}`} onClick={() => setFigureId("free")}>
          Modo libre
        </button>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} role="group" aria-label="Tablero de tangram" className="block aspect-[42/31] w-full touch-none rounded-2xl border border-line bg-[#fffaf0]">
        {targets.map((t, i) => (
          <polygon key={i} points={t.pts.map((p) => p.join(",")).join(" ")} fill={solved ? "#dfe8d3" : "#dcd6ca"} stroke={solved ? "#dfe8d3" : "#dcd6ca"} strokeWidth="1.5" strokeLinejoin="round" />
        ))}
        {order.map((def) => {
          const st = pieces[def.id];
          const pts = worldPoints(def, st);
          const isSel = selected === def.id;
          return (
            <g
              key={def.id}
              role="button"
              tabIndex={0}
              aria-label={`${def.label}. Girada ${st.rot} grados${st.flip ? ", volteada" : ""}.`}
              aria-pressed={isSel}
              className="cursor-grab outline-none focus-visible:[&>polygon]:stroke-ink"
              onPointerDown={(e) => onPointerDown(e, def.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={(e) => onKey(e, def.id)}
              onFocus={() => setSelected(def.id)}
            >
              <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={def.color} stroke={isSel ? "#2b3327" : "rgba(0,0,0,0.25)"} strokeWidth={isSel ? 2.5 : 1.2} strokeLinejoin="round" style={{ filter: isSel ? "drop-shadow(0 3px 3px rgba(0,0,0,0.25))" : undefined }} />
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-quiet" disabled={!selected} onClick={() => selected && rotatePiece(selected)}>
          <Icon name="reset" size={16} /> Girar
        </button>
        <button type="button" className="btn btn-quiet" disabled={!selected} onClick={() => selected && flipPiece(selected)}>
          ⇄ Voltear
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setPieces(scattered())}>
          Desordenar
        </button>
        <span className="ml-auto text-sm text-muted">{selected ? PIECES.find((p) => p.id === selected)?.label : "Ninguna pieza elegida"}</span>
      </div>

      <p role="status" className="min-h-6 font-bold">
        {solved ? "Encajó todo. Puedes mirarlo un momento antes de deshacerlo, o probar otra figura." : ""}
      </p>
      {figureId === "free" && <Note>Sin silueta. Inventa un animal, una casa, una persona corriendo. Las siete piezas dan para más de lo que parece.</Note>}
    </div>
  );
}
