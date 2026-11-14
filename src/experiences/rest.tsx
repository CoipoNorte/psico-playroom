import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, formatClock, Note, useTicker, type ExperienceProps } from "./shared";

const LENGTHS = [1, 3, 5];

const COPY: Record<string, { emoji: string; motion: string; start: string; lines: string[]; note: string }> = {
  butaca: {
    emoji: "🛋️",
    motion: "rock",
    start: "Sentarme",
    lines: ["Acomódate como quieras: de lado, con los pies arriba.", "Esta butaca ya conoce todas las formas de sentarse."],
    note: "Quedarse un rato sin hacer nada también cuenta. Nadie te va a pedir resultados.",
  },
  "banco-entrada": {
    emoji: "🪑",
    motion: "breathe",
    start: "Sentarme",
    lines: ["Puedes sentarte un momento antes de decidir a dónde ir.", "No elegir todavía también es una opción."],
    note: "A veces llegar ya es suficiente.",
  },
  "banco-movimiento": {
    emoji: "🪑",
    motion: "breathe",
    start: "Descansar",
    lines: ["Descansar es parte del movimiento, no lo contrario.", "Nota cómo late el cuerpo después de moverse."],
    note: "Puedes sentarte y dejar que el cuerpo baje solo, sin ayudarlo.",
  },
};

/** Butaca y bancos: sentarse con un temporizador opcional y un brillo que sube mientras descansas. */
export function Rest({ kind }: ExperienceProps) {
  const play = useSound();
  const copy = COPY[kind] ?? COPY.butaca;
  const [minutes, setMinutes] = useState(3);
  const [sitting, setSitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [line, setLine] = useState(0);
  const elapsed = useTicker(sitting, resetKey);
  const total = minutes * 60;
  const left = Math.max(0, total - elapsed);
  const finished = elapsed > 0 && left === 0;
  const progress = Math.min(1, elapsed / total);

  useEffect(() => {
    if (finished && sitting) {
      setSitting(false);
      play(523.25, "bell");
      window.setTimeout(() => play(659.25, "bell"), 400);
    }
  }, [finished, sitting, play]);

  return (
    <div className="space-y-4">
      <Caption>{copy.lines[line % copy.lines.length]}</Caption>
      <div className="relative grid h-64 place-items-center overflow-hidden rounded-3xl bg-soft">
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{ background: "radial-gradient(circle at 50% 60%, rgba(247,199,92,0.5), transparent 62%)", opacity: sitting ? 0.25 + progress * 0.75 : 0.12 }}
        />
        <span aria-hidden="true" className={`relative inline-block origin-bottom text-[9rem] leading-none ${sitting ? copy.motion : ""}`}>
          {copy.emoji}
        </span>
      </div>
      <p className="text-center text-4xl font-extrabold tabular-nums" aria-live="off">
        {sitting || elapsed > 0 ? formatClock(left) : "Sin prisa"}
      </p>
      <div role="group" aria-label="Duración" className="flex flex-wrap justify-center gap-2">
        {LENGTHS.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={minutes === m}
            disabled={sitting}
            className={`btn min-h-9 text-sm ${minutes === m ? "btn-primary" : "btn-quiet"}`}
            onClick={() => {
              setMinutes(m);
              setResetKey((k) => k + 1);
            }}
          >
            {m} min
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {sitting ? (
          <button type="button" className="btn btn-quiet" onClick={() => setSitting(false)}>
            <Icon name="stop" size={16} /> Levantarme
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (finished) setResetKey((k) => k + 1);
              setSitting(true);
              play(392, "soft");
            }}
          >
            <Icon name="play" size={16} /> {copy.start}
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => setLine((l) => l + 1)}>
          Otra idea
        </button>
      </div>
      <p role="status" className="min-h-6 text-center font-bold">
        {finished ? "Un rato completo. Puedes quedarte o levantarte cuando quieras." : ""}
      </p>
      <Note>{copy.note}</Note>
    </div>
  );
}
