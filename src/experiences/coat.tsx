import { useState } from "react";
import { useSound } from "../lib/comfort";
import { Caption, Note, usePersistent, type ExperienceProps } from "./shared";

interface Coat {
  id: string;
  text: string;
  emoji: string;
  since: number;
}

const WORRIES = [
  { emoji: "📝", text: "Una tarea pendiente" },
  { emoji: "💬", text: "Una conversación" },
  { emoji: "💼", text: "El trabajo" },
  { emoji: "📚", text: "El estudio" },
  { emoji: "🌧️", text: "Un día triste" },
  { emoji: "💭", text: "Algo que da vueltas" },
];

function days(since: number): string {
  const d = Math.floor((Date.now() - since) / 86400000);
  return d === 0 ? "hoy" : d === 1 ? "desde ayer" : `desde hace ${d} días`;
}

/** Perchero: se cuelga una preocupación tocando; se puede llevar o dejar ir. */
export function CoatRack(_p: ExperienceProps) {
  const play = useSound();
  const [coats, setCoats] = usePersistent<Coat[]>("hall:coats", []);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  function hang(w: { emoji: string; text: string }) {
    if (coats.length >= 6) {
      setMsg("El perchero está lleno: descuelga algo primero.");
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setCoats((c) => [...c, { id, text: w.text, emoji: w.emoji, since: Date.now() }]);
    setFresh(id);
    setMsg("Colgado. Puede quedarse aquí todo el tiempo que haga falta.");
    play(392, "pluck");
  }

  function remove(c: Coat, how: "take" | "let") {
    setLeaving(c.id);
    setMsg(how === "take" ? "Te lo llevas. A veces es lo que toca." : "Lo dejaste ir. El perchero no pregunta a dónde.");
    play(how === "take" ? 330 : 523.25, how === "take" ? "pluck" : "bell");
    window.setTimeout(() => {
      setCoats((cs) => cs.filter((x) => x.id !== c.id));
      setLeaving(null);
    }, 900);
  }

  return (
    <div className="space-y-4">
      <Caption>Toca una preocupación para colgarla en el perchero. Se queda entre visitas. Cuando quieras, te la llevas de vuelta o la dejas ir.</Caption>
      <div className="relative min-h-52 rounded-3xl bg-[#efe7d6] p-4">
        <div aria-hidden="true" className="mx-auto h-3 w-5/6 rounded-full bg-[#8f6c5a]" />
        <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6" aria-label="Cosas colgadas">
          {Array.from({ length: 6 }, (_, i) => coats[i]).map((c, i) => (
            <li key={c?.id ?? `empty-${i}`} className={`flex flex-col items-center ${c && leaving === c.id ? "fly" : ""}`}>
              <span aria-hidden="true" className="block h-4 w-1 bg-[#8f6c5a]" />
              {c ? (
                <details className="group w-full text-center">
                  <summary
                    className="cursor-pointer list-none rounded-xl text-4xl outline-none focus-visible:ring-4 focus-visible:ring-primary"
                    aria-label={`Colgado ${days(c.since)}: ${c.text}`}
                  >
                    <span className={`inline-block ${fresh === c.id ? "swing" : ""}`}>{c.emoji}</span>
                  </summary>
                  <div className="fade-up mt-1 rounded-xl bg-surface p-2 text-xs shadow">
                    <p className="font-bold break-words">{c.text}</p>
                    <p className="text-muted">{days(c.since)}</p>
                    <div className="mt-1.5 flex flex-col gap-1">
                      <button type="button" className="btn btn-quiet min-h-8 text-xs" onClick={() => remove(c, "take")}>
                        Me lo llevo
                      </button>
                      <button type="button" className="btn btn-quiet min-h-8 text-xs" onClick={() => remove(c, "let")}>
                        Lo dejo ir
                      </button>
                    </div>
                  </div>
                </details>
              ) : (
                <span aria-hidden="true" className="text-3xl opacity-25">
                  🪝
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div role="group" aria-label="Preocupaciones para colgar" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {WORRIES.map((w) => (
          <button
            key={w.text}
            type="button"
            disabled={coats.length >= 6}
            className="btn btn-quiet min-h-14 justify-start text-left text-sm"
            onClick={() => hang(w)}
          >
            <span aria-hidden="true" className="text-xl">
              {w.emoji}
            </span>
            {w.text}
          </button>
        ))}
      </div>
      <p role="status" className="min-h-6 text-sm font-bold">
        {msg}
      </p>
      <Note>Lo que cuelgas aquí se guarda solo en este navegador. Mientras recorres la casa, no lo llevas puesto.</Note>
    </div>
  );
}
