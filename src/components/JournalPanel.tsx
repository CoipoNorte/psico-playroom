import { useId, useMemo, useState, type FormEvent } from "react";
import { useComfort } from "../lib/comfort";
import { getRoom } from "../lib/rooms-data";
import { addJournal, deleteJournal, listJournal, type JournalEntry } from "../lib/store";
import { Disclaimer, LocalModeNote } from "./Disclaimer";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

export const MOODS = [
  { id: "calma", emoji: "😌", label: "Calma" },
  { id: "alegria", emoji: "😊", label: "Alegría" },
  { id: "gratitud", emoji: "🥰", label: "Gratitud" },
  { id: "cansancio", emoji: "😴", label: "Cansancio" },
  { id: "tristeza", emoji: "😢", label: "Tristeza" },
  { id: "enojo", emoji: "😠", label: "Enojo" },
  { id: "miedo", emoji: "😨", label: "Miedo" },
  { id: "confusion", emoji: "😕", label: "Confusión" },
] as const;

const MOOD_BY_ID: Record<string, (typeof MOODS)[number]> = Object.fromEntries(MOODS.map((m) => [m.id, m]));

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Habitación desde la que se abre el diario (o null desde la casa). */
  roomSlug: string | null;
}

export function JournalPanel({ open, onClose, roomSlug }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Tu diario" subtitle="Un lugar privado. Nada de lo que escribas se comparte.">
      <JournalBody roomSlug={roomSlug} />
    </Modal>
  );
}

function JournalBody({ roomSlug }: { roomSlug: string | null }) {
  const { visitor } = useComfort();
  const textId = useId();
  const [entries, setEntries] = useState<JournalEntry[]>(() => listJournal(visitor.id));
  const [mood, setMood] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "hint" | "error"; message: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const origin = useMemo(() => (roomSlug ? getRoom(roomSlug) : undefined), [roomSlug]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean && !mood) {
      setStatus({ kind: "hint", message: "Puedes elegir una emoción o escribir algo; con una de las dos basta." });
      return;
    }
    try {
      addJournal({ visitorId: visitor.id, roomSlug: origin ? origin.slug : null, mood, text: clean });
      setEntries(listJournal(visitor.id));
      setMood("");
      setText("");
      setStatus({ kind: "ok", message: "Nota guardada. Solo tú puedes verla, en este navegador." });
    } catch {
      setStatus({
        kind: "error",
        message: "No se pudo guardar esta vez. Tu texto sigue aquí; puedes intentarlo de nuevo en un momento.",
      });
    }
  }

  function handleDelete(id: string) {
    try {
      deleteJournal(id);
      setEntries(listJournal(visitor.id));
      setStatus({ kind: "ok", message: "Nota borrada." });
    } catch {
      setStatus({ kind: "error", message: "No se pudo borrar esta vez. Puedes intentarlo de nuevo." });
    }
    setConfirmId(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset>
          <legend className="font-bold">
            ¿Cómo estás en este momento? <span className="font-normal text-muted">(opcional)</span>
          </legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {MOODS.map((m) => {
              const selected = mood === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMood(selected ? "" : m.id)}
                  className={`flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-2 text-xs font-bold transition-colors ${
                    selected ? "border-primary bg-accent text-accent-ink" : "border-line bg-soft hover:border-primary"
                  }`}
                >
                  <span aria-hidden="true" className="text-2xl leading-none">
                    {m.emoji}
                  </span>
                  {m.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <div className="mb-2 flex flex-wrap gap-2" role="group" aria-label="Frases rápidas para tocar">
            {["Hoy me sentí tranquilo", "Hoy me costó", "Quiero recordar esto", "Gracias por hoy", "Necesito descansar"].map((q) => (
              <button key={q} type="button" className="btn btn-quiet min-h-9 text-sm" onClick={() => setText((t) => (t ? `${t} ${q}` : q))}>
                {q}
              </button>
            ))}
          </div>
          <label htmlFor={textId} className="font-bold">
            Lo que quieras escribir <span className="font-normal text-muted">(opcional)</span>
          </label>
          <textarea
            id={textId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="Una palabra, una frase o lo que salga."
            className="mt-2 block w-full resize-y rounded-2xl border border-line bg-bg px-4 py-3 text-base placeholder:text-muted/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="submit" className="btn btn-primary">
            <Icon name="check" size={18} />
            Guardar nota
          </button>
          <p className="text-sm text-muted">
            {origin ? `Se guardará desde: ${origin.emoji} ${origin.name}` : "Se guardará desde la casa"}
          </p>
        </div>
        <p role="status" className={`min-h-6 text-sm font-bold ${status?.kind === "ok" ? "text-primary" : "text-ink"}`}>
          {status?.message}
        </p>
      </form>

      <section aria-label="Notas anteriores">
        <h3 className="text-lg font-extrabold">Notas anteriores</h3>
        {entries.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
            Todavía no hay notas. Cuando guardes una, aparecerá aquí con su fecha y la habitación desde la que la
            escribiste.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {entries.map((entry) => {
              const room = entry.roomSlug ? getRoom(entry.roomSlug) : undefined;
              const m = MOOD_BY_ID[entry.mood];
              return (
                <li key={entry.id} className="rounded-2xl border border-line bg-soft p-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <time dateTime={entry.createdAt} className="font-bold text-ink">
                      {formatDate(entry.createdAt)}
                    </time>
                    <span>{room ? `${room.emoji} ${room.name}` : "🏠 Desde la casa"}</span>
                  </div>
                  {m && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-sm font-bold">
                      <span aria-hidden="true">{m.emoji}</span>
                      {m.label}
                    </p>
                  )}
                  {entry.text && <p className="mt-2 break-words whitespace-pre-wrap">{entry.text}</p>}
                  <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-sm">
                    {confirmId === entry.id ? (
                      <>
                        <span className="mr-auto font-bold">¿Borrar esta nota?</span>
                        <button type="button" className="btn btn-quiet min-h-9 text-sm" onClick={() => setConfirmId(null)}>
                          Conservar
                        </button>
                        <button type="button" className="btn btn-quiet min-h-9 text-sm" onClick={() => handleDelete(entry.id)}>
                          <Icon name="trash" size={15} />
                          Sí, borrar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost min-h-9 text-sm"
                        aria-label={`Borrar la nota del ${formatDate(entry.createdAt)}`}
                        onClick={() => setConfirmId(entry.id)}
                      >
                        <Icon name="trash" size={15} />
                        Borrar
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="space-y-3">
        <Disclaimer compact />
        <LocalModeNote />
      </div>
    </div>
  );
}
