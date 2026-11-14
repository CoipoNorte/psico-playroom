import { ADULT_NOTE, DISCLAIMER } from "../lib/rooms-data";
import { isPersistent } from "../lib/store";
import { Icon } from "./Icon";

/** Aviso de alcance y uso responsable. */
export function Disclaimer({ compact = false, withAdultNote = false }: { compact?: boolean; withAdultNote?: boolean }) {
  return (
    <aside
      role="note"
      aria-label="Aviso de alcance"
      className={`flex gap-3 rounded-2xl border border-line bg-soft text-ink ${compact ? "p-3 text-sm" : "p-4 text-sm sm:text-base"}`}
    >
      <span className="mt-0.5 shrink-0 text-primary">
        <Icon name="info" size={compact ? 18 : 20} />
      </span>
      <div className="space-y-1.5">
        <p>{DISCLAIMER}</p>
        {withAdultNote && <p className="font-bold">{ADULT_NOTE}</p>}
      </div>
    </aside>
  );
}

/** Aviso discreto sobre dónde se guardan los datos. */
export function LocalModeNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-muted ${className}`}>
      <span className="font-bold">Modo local:</span>{" "}
      {isPersistent()
        ? "tus notas se guardan en este navegador. No se envían a ningún servidor."
        : "este navegador no permite guardar datos, así que tus notas durarán mientras esta pestaña siga abierta."}
    </p>
  );
}
