import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, Note, type ExperienceProps } from "./shared";

/* ====================================================================== */
/* Lienzo: pincel, crayón o plastilina según lo que tocaste.                 */
/* ====================================================================== */

type Tool = "brush" | "crayon" | "clay";

const PAINTS = [
  { value: "#2b3327", name: "Carbón" },
  { value: "#d9705f", name: "Rojo teja" },
  { value: "#e9a84c", name: "Naranja miel" },
  { value: "#e6cf52", name: "Amarillo" },
  { value: "#7fae6f", name: "Verde hoja" },
  { value: "#6f9fd0", name: "Azul cielo" },
  { value: "#a291b4", name: "Lavanda" },
  { value: "#fffdf7", name: "Blanco (borrar)" },
];

const CW = 960;
const CH = 600;
const PAPER = "#fffdf7";

function toolFor(kind: string): Tool {
  if (kind === "crayones") return "crayon";
  if (kind === "plastilina") return "clay";
  return "brush";
}

export function Canvas({ kind }: ExperienceProps) {
  const play = useSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<Tool>(() => toolFor(kind));
  const [color, setColor] = useState(PAINTS[1].value);
  const [size, setSize] = useState(tool === "clay" ? 36 : 10);
  const [strokes, setStrokes] = useState(0);

  function clear() {
    const c = canvasRef.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    g.fillStyle = tool === "clay" ? "#e8e2d6" : PAPER;
    g.fillRect(0, 0, c.width, c.height);
    setStrokes(0);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(clear, []);

  function point(e: PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / (r.width || 1)) * CW, y: ((e.clientY - r.top) / (r.height || 1)) * CH, p: e.pressure || 0.5 };
  }

  function stroke(a: { x: number; y: number }, b: { x: number; y: number; p: number }) {
    const g = canvasRef.current?.getContext("2d");
    if (!g) return;
    g.lineCap = "round";
    g.lineJoin = "round";
    if (tool === "brush") {
      g.strokeStyle = color;
      g.lineWidth = size * (0.6 + b.p * 0.8);
      g.globalAlpha = 0.9;
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    } else if (tool === "crayon") {
      g.strokeStyle = color;
      g.globalAlpha = 0.35;
      for (let i = 0; i < 4; i++) {
        const j = () => (Math.random() - 0.5) * size * 0.6;
        g.lineWidth = size * 0.35;
        g.beginPath();
        g.moveTo(a.x + j(), a.y + j());
        g.lineTo(b.x + j(), b.y + j());
        g.stroke();
      }
    } else {
      g.globalAlpha = 1;
      g.shadowColor = "rgba(0,0,0,0.25)";
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      g.fillStyle = color;
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      const n = Math.max(1, Math.floor(d / 4));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        g.beginPath();
        g.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, size, 0, Math.PI * 2);
        g.fill();
      }
      g.shadowBlur = 0;
      g.shadowOffsetY = 0;
    }
    g.globalAlpha = 1;
  }

  const tools: { id: Tool; label: string; emoji: string }[] = [
    { id: "brush", label: "Pincel", emoji: "🖌️" },
    { id: "crayon", label: "Crayón", emoji: "🖍️" },
    { id: "clay", label: "Plastilina", emoji: "🟣" },
  ];

  return (
    <div className="space-y-4">
      <Caption>
        {tool === "clay" ? "Arrastra para amasar bolas y churros de plastilina. Si no te gusta lo que salió, «Hacer bolita» y a empezar." : "Dibuja con el dedo o el ratón. Nada se guarda ni se envía: al salir, el lienzo vuelve a quedar en blanco."}
      </Caption>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        role="img"
        aria-label="Lienzo para dibujar libremente"
        className="block aspect-[8/5] w-full cursor-crosshair touch-none rounded-2xl border border-line"
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = point(e);
          last.current = p;
          stroke(p, { ...p, x: p.x + 0.01 });
          setStrokes((s) => s + 1);
          if (tool === "clay") play(130, "soft");
        }}
        onPointerMove={(e) => {
          if (!last.current) return;
          const p = point(e);
          stroke(last.current, p);
          last.current = p;
        }}
        onPointerUp={() => (last.current = null)}
        onPointerCancel={() => (last.current = null)}
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div role="group" aria-label="Herramienta" className="flex gap-1 rounded-full bg-soft p-1">
          {tools.map((t) => (
            <button key={t.id} type="button" aria-pressed={tool === t.id} className={`btn min-h-9 px-3 text-sm ${tool === t.id ? "btn-primary" : ""}`} onClick={() => { setTool(t.id); setSize(t.id === "clay" ? 36 : 10); }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Color" className="flex flex-wrap gap-2">
          {PAINTS.map((p) => (
            <button key={p.value} type="button" aria-pressed={color === p.value} aria-label={p.name} title={p.name} onClick={() => setColor(p.value)} className={`size-9 cursor-pointer rounded-full border-2 ${color === p.value ? "border-ink ring-2 ring-surface ring-inset" : "border-line"}`} style={{ background: p.value }} />
          ))}
        </div>
        <div role="group" aria-label="Grosor" className="flex items-center gap-1">
          <span className="text-sm font-bold">Grosor:</span>
          {(tool === "clay" ? [18, 36, 60] : [4, 10, 24]).map((v, i) => (
            <button key={v} type="button" aria-pressed={size === v} aria-label={["Fino", "Medio", "Grueso"][i]} className={`grid size-10 cursor-pointer place-items-center rounded-full border-2 ${size === v ? "border-ink bg-soft" : "border-line"}`} onClick={() => setSize(v)}>
              <span aria-hidden="true" className="block rounded-full" style={{ width: 6 + i * 7, height: 6 + i * 7, background: color === "#fffdf7" ? "#ccc" : color }} />
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-quiet" onClick={clear}>
          <Icon name="eraser" size={16} /> {tool === "clay" ? "Hacer bolita" : "Borrar todo"}
        </button>
      </div>
      <Note>{strokes === 0 ? "Un lienzo en blanco no pide nada. Puede quedarse así." : strokes < 5 ? "Una sola línea ya es un dibujo." : "¿De qué color es este momento?"}</Note>
    </div>
  );
}
