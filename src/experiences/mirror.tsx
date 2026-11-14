import { useState } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, Note, type ExperienceProps } from "./shared";

const BROWS = [
  { v: -1, label: "Caídas" },
  { v: 0, label: "Normales" },
  { v: 1, label: "Fruncidas" },
];
const MOUTHS = [
  { v: -1, label: "Triste" },
  { v: 0, label: "Neutra" },
  { v: 1, label: "Sonrisa" },
];
const EYES = [
  { v: 0.2, label: "Cerrados" },
  { v: 1, label: "Abiertos" },
];
const FEELINGS = ["calma", "alegría", "cansancio", "tristeza", "enojo", "miedo", "confusión", "ternura", "no sé"];
const INTENSITY = ["apenas", "un poco", "bastante", "mucho", "muchísimo"];

function Segment({ label, options, value, onChange }: { label: string; options: { v: number; label: string }[]; value: number; onChange: (v: number) => void }) {
  return (
    <div role="group" aria-label={label} className="space-y-1.5">
      <p className="text-sm font-bold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.label} type="button" aria-pressed={value === o.v} className={`btn min-h-9 text-sm ${value === o.v ? "btn-primary" : "btn-quiet"}`} onClick={() => onChange(o.v)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Espejo: se compone la cara tocando; la cara se redibuja con una pequeña animación. */
export function Mirror({ kind, onOpenJournal }: ExperienceProps) {
  const play = useSound();
  const [brows, setBrows] = useState(0);
  const [mouth, setMouth] = useState(0);
  const [eyes, setEyes] = useState(1);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(2);

  const face = `${brows}-${mouth}-${eyes}`;
  const browL = `M38 ${58 - brows * 6} Q50 ${54 + brows * 6} 62 ${58 + brows * 2}`;
  const browR = `M98 ${58 + brows * 2} Q110 ${54 + brows * 6} 122 ${58 - brows * 6}`;
  const mouthPath = `M58 118 Q80 ${118 + mouth * 22} 102 118`;

  function cycleMouth() {
    const order = [-1, 0, 1];
    const next = order[(order.indexOf(mouth) + 1) % order.length];
    setMouth(next);
    play(330 + (next + 1) * 110, "pluck");
  }

  return (
    <div className="space-y-4">
      <Caption>
        {kind === "espejo-movimiento"
          ? "Este espejo no corrige posturas. Elige cómo llegas hoy y mira cómo se ve. Toca la cara para cambiar la boca."
          : "Elige cómo se ve tu cara hoy. No hace falta ponerle nombre; mirar ya es bastante. Toca la cara para cambiar la boca."}
      </Caption>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="mx-auto rounded-[50%] border-8 border-[#bd9079] bg-gradient-to-br from-[#eef3f5] to-[#d6e1e6] p-3 shadow-inner">
          <svg
            key={face}
            viewBox="0 0 160 170"
            className="fade-up h-48 w-44 cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-primary rounded-full"
            role="button"
            tabIndex={0}
            aria-label="Cara del espejo. Toca para cambiar la boca."
            onClick={cycleMouth}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                cycleMouth();
              }
            }}
          >
            <ellipse cx="80" cy="88" rx="56" ry="64" fill="#f0c9a6" />
            <path d={browL} stroke="#5a3e1b" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d={browR} stroke="#5a3e1b" strokeWidth="4" fill="none" strokeLinecap="round" />
            <ellipse cx="55" cy="78" rx="7" ry={7 * eyes} fill="#3b2f2a" />
            <ellipse cx="105" cy="78" rx="7" ry={7 * eyes} fill="#3b2f2a" />
            <path d="M80 86 q-6 12 2 16" stroke="#c99a6b" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d={mouthPath} stroke="#a0524d" strokeWidth="4" fill={mouth > 0.5 ? "#c96a6a" : "none"} strokeLinecap="round" />
            {mouth < 0 && <ellipse cx="46" cy="100" rx="8" ry="5" fill="#8fb1c4" className="heart-float" />}
          </svg>
        </div>
        <div className="space-y-4">
          <Segment label="Cejas" options={BROWS} value={brows} onChange={setBrows} />
          <Segment label="Boca" options={MOUTHS} value={mouth} onChange={setMouth} />
          <Segment label="Ojos" options={EYES} value={eyes} onChange={setEyes} />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold">Si quieres ponerle una palabra (o no):</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FEELINGS.map((f) => (
            <button key={f} type="button" aria-pressed={feeling === f} className={`btn min-h-9 text-sm ${feeling === f ? "btn-primary" : "btn-quiet"}`} onClick={() => setFeeling(feeling === f ? null : f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {feeling && (
        <Segment label="¿Cuánto?" options={INTENSITY.map((l, i) => ({ v: i, label: l }))} value={intensity} onChange={setIntensity} />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-primary" onClick={onOpenJournal}>
          <Icon name="journal" size={16} /> Anotarlo en el diario
        </button>
        <span className="text-sm text-muted">{feeling ? `Hoy: ${feeling}, ${INTENSITY[intensity]}.` : "Todas las caras son bienvenidas en este espejo."}</span>
      </div>
      <Note>Cambiar la cara del espejo no cambia nada por dentro. Solo ayuda a ponerle forma a lo que hay.</Note>
    </div>
  );
}
