import { useEffect, useId, useRef, useState } from "react";
import type { Activity } from "../lib/activities-data";
import { STEP_OBJECTS } from "../lib/activities-data";
import { OBJECTS } from "../lib/rooms-data";
import { href } from "../lib/router";
import { Icon } from "./Icon";
import { ObjectArt } from "./ObjectArt";

interface Props {
  activity: Activity;
  step: number;
  done: boolean;
  friendlyName: string;
  /** Se llama con la nueva etapa; `skipped` indica que la etapa actual se omitió. */
  onStep: (next: number, skipped: boolean) => void;
  onFinish: (skipped: boolean) => void;
  onRestart: () => void;
  onOpenJournal: () => void;
  roomSlug: string;
  onOpenObject: (kind: string) => void;
}

/** Panel de actividad guiada opcional: Siguiente, Atrás, Omitir etapa y cierre sin evaluación. */
export function ActivityGuide({ activity, step, done, friendlyName, onStep, onFinish, onRestart, onOpenJournal, roomSlug, onOpenObject }: Props) {
  const headingId = useId();
  const focusRef = useRef<HTMLHeadingElement>(null);
  const previousDone = useRef(done);
  const [note, setNote] = useState("");

  const total = activity.steps.length;
  const index = Math.min(Math.max(step, 0), total - 1);
  const current = activity.steps[index];
  const isLast = index === total - 1;
  const relatedKind = STEP_OBJECTS[roomSlug]?.[index];
  const related = relatedKind ? OBJECTS[relatedKind] : undefined;

  // Al terminar o reiniciar cambian los botones: llevamos el foco al nuevo título.
  useEffect(() => {
    if (previousDone.current !== done) {
      previousDone.current = done;
      focusRef.current?.focus({ preventScroll: false });
    }
  }, [done]);

  function advance(skipped: boolean) {
    setNote(skipped ? "Omitiste esa etapa, y está bien así." : "");
    if (isLast) onFinish(skipped);
    else onStep(index + 1, skipped);
  }

  return (
    <section aria-labelledby={headingId} className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Actividad opcional</p>
      <h2 id={headingId} className="mt-1 text-xl font-extrabold leading-snug">
        {activity.title}
      </h2>

      {done ? (
        <div className="fade-up mt-4">
          <h3 ref={focusRef} tabIndex={-1} className="text-lg font-extrabold">
            Gracias por tomarte este momento{friendlyName ? `, ${friendlyName}` : ""}.
          </h3>
          <p className="mt-2 text-muted">{activity.closing}</p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-soft p-3">
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-2xl">
              {activity.keepsake.emoji}
            </span>
            <p className="text-sm">
              Queda un pequeño recuerdo en la entrada de la casa:{" "}
              <span className="font-bold">{activity.keepsake.name}</span>.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={onOpenJournal}>
              <Icon name="journal" size={18} />
              Escribir en el diario
            </button>
            <a className="btn btn-quiet" href={href("/casa")}>
              <Icon name="home" size={18} />
              Volver a la casa
            </a>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setNote("");
                onRestart();
              }}
            >
              <Icon name="reset" size={16} />
              Hacerla de nuevo
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-muted">{activity.intro}</p>

          <div className="mt-4 flex items-center gap-3">
            <ol aria-label="Etapas de la actividad" className="flex gap-1">
              {activity.steps.map((s, i) => (
                <li key={s.title}>
                  <button
                    type="button"
                    disabled={i >= index}
                    aria-label={`Volver a la etapa ${i + 1}: ${s.title}`}
                    aria-current={i === index ? "step" : undefined}
                    onClick={() => {
                      setNote("");
                      onStep(i, false);
                    }}
                    className={`grid size-8 place-items-center rounded-full text-xs font-extrabold ${i === index ? "bg-accent text-accent-ink" : i < index ? "cursor-pointer bg-soft text-ink hover:bg-accent" : "bg-soft text-muted"}`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
            <p className="text-sm font-bold text-muted">
              Etapa {index + 1} de {total}
            </p>
          </div>

          <div aria-live="polite">
            <div key={index} className="fade-up mt-4">
              <h3 ref={focusRef} tabIndex={-1} className="text-lg font-extrabold leading-snug">
                {current.title}
              </h3>
              <p className="mt-2 leading-relaxed">{current.description}</p>
              {related && relatedKind && (
                <button
                  type="button"
                  className="guide-object mt-4 flex w-full items-center gap-3 rounded-2xl border border-line bg-soft px-3 py-2.5 text-left hover:border-primary"
                  onClick={() => onOpenObject(relatedKind)}
                >
                  <span aria-hidden="true" className="text-2xl leading-none">{related.art ? <ObjectArt art={related.art} /> : related.emoji}</span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block text-xs font-extrabold uppercase tracking-[0.08em] text-muted">Si te apetece, toca</span>
                    <span className="font-extrabold">{related.label}</span>
                  </span>
                  <Icon name="arrow-right" size={17} />
                </button>
              )}
              {current.invitation && (
                <div className="mt-4 rounded-2xl border-l-4 border-accent bg-soft py-3 pr-3 pl-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Solo si quieres</p>
                  <p className="mt-1 font-bold">{current.invitation}</p>
                  <button type="button" className="btn btn-ghost mt-1 -ml-2 min-h-9 text-sm" onClick={onOpenJournal}>
                    <Icon name="journal" size={15} />
                    Anotarlo en el diario
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn btn-quiet"
              disabled={index === 0}
              onClick={() => {
                setNote("");
                onStep(index - 1, false);
              }}
            >
              <Icon name="arrow-left" size={18} />
              Atrás
            </button>
            <button type="button" className="btn btn-primary" onClick={() => advance(false)}>
              {isLast ? "Terminar" : "Siguiente"}
              <Icon name={isLast ? "check" : "arrow-right"} size={18} />
            </button>
            <button type="button" className="btn btn-ghost col-span-2" onClick={() => advance(true)}>
              <Icon name="skip" size={16} />
              Omitir etapa
            </button>
          </div>
        </>
      )}

      <p role="status" className="mt-2 min-h-5 text-center text-sm text-muted">
        {!done && note}
      </p>
    </section>
  );
}
