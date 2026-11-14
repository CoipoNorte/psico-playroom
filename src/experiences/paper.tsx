import { useState } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, Note, type ExperienceProps } from "./shared";

const WORDS = [
  "lo que pesa",
  "me molesta",
  "quiero soltarlo",
  "estoy cansado",
  "tengo miedo",
  "estoy bien",
  "quiero descansar",
  "gracias",
  "mañana será otro día",
  "no es para tanto",
  "lo dejo aquí",
  "todo pasa",
];

interface Piece {
  id: string;
  w: string;
}

/** Papel: se compone tocando palabras; se puede guardar, arrugar o lanzar como avión. */
export function Paper({ onOpenJournal }: ExperienceProps) {
  const play = useSound();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [anim, setAnim] = useState<"crumple" | "fly" | null>(null);
  const [gone, setGone] = useState({ crumpled: 0, flown: 0 });

  function add(w: string) {
    if (anim) return;
    setPieces((p) => [...p, { id: `${Date.now()}-${Math.random()}`, w }].slice(0, 16));
    play(523.25 + Math.random() * 120, "pluck");
  }

  function remove(id: string) {
    if (anim) return;
    setPieces((p) => p.filter((x) => x.id !== id));
    play(330, "pluck");
  }

  function release(how: "crumple" | "fly") {
    if (pieces.length === 0) return;
    setAnim(how);
    play(how === "fly" ? 659.25 : 196, how === "fly" ? "flute" : "shaker");
    window.setTimeout(() => {
      setPieces([]);
      setAnim(null);
      setGone((g) => (how === "fly" ? { ...g, flown: g.flown + 1 } : { ...g, crumpled: g.crumpled + 1 }));
    }, 1500);
  }

  return (
    <div className="space-y-4">
      <Caption>Toca las frases que digan algo de hoy. Tocarlas de nuevo en el papel las quita. Después decides: arrugarlo y tirarlo, doblarlo como avión y soltarlo, o guardarlo en el diario.</Caption>
      <div className={`min-h-40 rounded-2xl border border-line bg-[#fffaf0] p-5 text-lg leading-10 text-[#2b3327] shadow-md ${anim === "crumple" ? "crumple" : anim === "fly" ? "fly" : ""}`} style={{ backgroundImage: "repeating-linear-gradient(transparent 0 39px, #e3dccb 39px 40px)", fontFamily: "Georgia, serif" }}>
        {pieces.length === 0 ? (
          <span className="text-[#9a917e]">Tu papel está en blanco.</span>
        ) : (
          pieces.map((p) => (
            <button key={p.id} type="button" onClick={() => remove(p.id)} aria-label={`Quitar «${p.w}»`} disabled={anim !== null} className="fade-up mr-1 cursor-pointer rounded-md px-1 underline decoration-dotted underline-offset-4 hover:bg-soft">
              {p.w}
            </button>
          ))
        )}
      </div>
      <div role="group" aria-label="Frases" className="flex flex-wrap gap-2">
        {WORDS.map((w) => (
          <button key={w} type="button" disabled={anim !== null} className="btn btn-quiet min-h-10 text-sm" onClick={() => add(w)}>
            {w}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-quiet" disabled={pieces.length === 0 || anim !== null} onClick={() => release("crumple")}>
          🗑️ Arrugarlo y tirarlo
        </button>
        <button type="button" className="btn btn-quiet" disabled={pieces.length === 0 || anim !== null} onClick={() => release("fly")}>
          ✈️ Doblarlo y soltarlo
        </button>
        <button type="button" className="btn btn-primary" disabled={anim !== null} onClick={onOpenJournal}>
          <Icon name="journal" size={16} /> Guardarlo en el diario
        </button>
      </div>
      <p role="status" className="min-h-6 text-sm text-muted">
        {gone.crumpled + gone.flown > 0 && `Has soltado ${gone.crumpled + gone.flown} ${gone.crumpled + gone.flown === 1 ? "papel" : "papeles"} en esta visita. Ninguno se guardó.`}
      </p>
      <Note>Sacar algo de la cabeza y ponerlo en un papel que luego se tira, a veces alcanza para hoy.</Note>
    </div>
  );
}
