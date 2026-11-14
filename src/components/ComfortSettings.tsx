import { useEffect, useId, useState } from "react";
import { playHello } from "../lib/audio";
import { useComfort } from "../lib/comfort";
import { DEFAULT_ALIAS } from "../lib/store";
import { LocalModeNote } from "./Disclaimer";
import { Icon } from "./Icon";
import { Modal } from "./Modal";

export const ACCENTS = [
  { value: "#a3b18a", name: "Salvia" },
  { value: "#627757", name: "Bosque" },
  { value: "#bd9079", name: "Arcilla" },
  { value: "#a291b4", name: "Lavanda" },
  { value: "#8fb1c4", name: "Cielo" },
  { value: "#e0b96a", name: "Miel" },
  { value: "#e2a5a5", name: "Rosa" },
] as const;

/** Interruptor accesible (role="switch"). */
export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}) {
  const labelId = useId();
  const descId = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p id={labelId} className="font-bold">
          {label}
        </p>
        {description && (
          <p id={descId} className="text-sm text-muted">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 transition-colors ${
          checked ? "border-primary bg-primary" : "border-muted bg-soft"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1/2 left-0.5 size-6 -translate-y-1/2 rounded-full transition-transform ${
            checked ? "translate-x-6 bg-primary-ink" : "translate-x-0 bg-muted"
          }`}
        />
      </button>
    </div>
  );
}

export function ComfortSettings({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Ajustes de confort" subtitle="Acomoda la casa a tu gusto. Todo se puede cambiar después.">
      <SettingsBody onClose={onClose} />
    </Modal>
  );
}

function SettingsBody({ onClose }: { onClose: () => void }) {
  const { visitor, comfort, updateVisitor, updateComfort, resetAll } = useComfort();
  const aliasId = useId();
  const [alias, setAlias] = useState(visitor.alias === DEFAULT_ALIAS ? "" : visitor.alias);
  const [confirmReset, setConfirmReset] = useState(false);

  // Guarda el alias mientras se escribe; vacío vuelve al alias por defecto.
  useEffect(() => {
    const clean = alias.trim().slice(0, 40);
    const next = clean || DEFAULT_ALIAS;
    if (next !== visitor.alias) updateVisitor({ alias: next });
  }, [alias, visitor.alias, updateVisitor]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Switch
          label="Sonido"
          description="Tonos suaves al tocar los objetos."
          checked={comfort.sound}
          onChange={(next) => {
            updateComfort({ sound: next });
            if (next) playHello();
          }}
        />
        <Switch
          label="Reducir movimiento"
          description="Desactiva animaciones y transiciones."
          checked={comfort.reduceMotion}
          onChange={(next) => updateComfort({ reduceMotion: next })}
        />
      </div>

      <div className="border-t border-line pt-5">
        <label htmlFor={aliasId} className="font-bold">
          ¿Cómo quieres que te llame la casa?
        </label>
        <p className="text-sm text-muted">Es opcional y no tiene que ser tu nombre real.</p>
        <input
          id={aliasId}
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          maxLength={40}
          autoComplete="off"
          placeholder={DEFAULT_ALIAS}
          className="mt-2 block w-full rounded-2xl border border-line bg-bg px-4 py-3 text-base placeholder:text-muted/80"
        />
      </div>

      <fieldset className="border-t border-line pt-5">
        <legend className="float-left w-full font-bold">Tu color de acento</legend>
        <p className="clear-both text-sm text-muted">Se usa en botones y detalles de toda la casa.</p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {ACCENTS.map((c) => {
            const selected = visitor.color.toLowerCase() === c.value;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={selected}
                aria-label={`Color ${c.name}`}
                title={c.name}
                onClick={() => updateVisitor({ color: c.value })}
                className={`grid size-11 cursor-pointer place-items-center rounded-full border-2 ${
                  selected ? "border-ink ring-2 ring-surface ring-inset" : "border-line"
                }`}
                style={{ background: c.value }}
              >
                {selected && (
                  <span className="grid size-6 place-items-center rounded-full bg-surface text-ink">
                    <Icon name="check" size={15} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3 border-t border-line pt-5">
        <p className="font-bold">Tus datos</p>
        <LocalModeNote />
        {confirmReset ? (
          <div className="rounded-2xl border border-line bg-soft p-4">
            <p className="font-bold">¿Borrar todo lo guardado en este navegador?</p>
            <p className="text-sm text-muted">
              Se borrarán tus notas del diario, tu progreso, tus recuerdos y tus ajustes. No se puede deshacer.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-quiet" onClick={() => setConfirmReset(false)}>
                Conservar mis datos
              </button>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => {
                  resetAll();
                  onClose();
                }}
              >
                <Icon name="trash" size={16} />
                Sí, borrar todo
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost -ml-2" onClick={() => setConfirmReset(true)}>
            <Icon name="trash" size={16} />
            Borrar mis datos de este navegador
          </button>
        )}
      </div>
    </div>
  );
}
