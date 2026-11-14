import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ActivityGuide } from "../components/ActivityGuide";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";
import { ObjectArt } from "../components/ObjectArt";
import { BreathingCircle } from "../components/RoomExtras";
import { RoomScene } from "../components/RoomScene";
import { EXPERIENCES } from "../experiences";
import { ACTIVITIES, STEP_OBJECTS } from "../lib/activities-data";

import { playTone } from "../lib/audio";
import { useComfort } from "../lib/comfort";
import { ADULT_NOTE, ageLabel, ageShort, OBJECTS, ROOMS, type Room } from "../lib/rooms-data";
import { href, roomHref } from "../lib/router";
import { getProgress, saveExperience, saveProgress, type Point, type RoomProgress } from "../lib/store";

/** Sube este número si cambia la distribución de los objetos: se descartan posiciones antiguas. */
const LAYOUT_V = 2;

interface Message {
  kind: string;
  text: string;
  n: number;
}

export function RoomPage({ room, onOpenJournal }: { room: Room; onOpenJournal: () => void }) {
  const { comfort, friendlyName } = useComfort();
  const activity = ACTIVITIES[room.slug];
  const [progress, setProgress] = useState<RoomProgress>(() => getProgress(room.slug));
  const [activeKind, setActiveKind] = useState<string | null>(null);
  const [bursts, setBursts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<Message | null>(null);
  const turns = useRef<Record<string, number>>({});
  const messageCount = useRef(0);
  const [openKind, setOpenKind] = useState<string | null>(null);
  const [dim, setDim] = useState(0);
  const setDimStable = useCallback((v: number) => setDim(v), []);
  useEffect(() => {
    saveExperience("nav:last", { slug: room.slug, at: Date.now() });
  }, [room.slug]);

  // Modo serenidad: el Mirador de Estrellas oscurece toda la casa mientras estás dentro.
  useEffect(() => {
    if (!room.dark) return;
    const root = document.documentElement;
    root.dataset.theme = "night";
    return () => {
      delete root.dataset.theme;
    };
  }, [room.dark]);

  function update(patch: (p: RoomProgress) => RoomProgress) {
    const next = patch(progress);
    setProgress(next);
    saveProgress(room.slug, next);
  }

  function handleActivate(kind: string) {
    const def = OBJECTS[kind];
    if (!def) return;
    const turn = turns.current[kind] ?? 0;
    turns.current[kind] = turn + 1;
    const uses = (progress.data.counts?.[kind] ?? 0) + 1;

    messageCount.current += 1;
    setActiveKind(kind);
    setBursts((b) => ({ ...b, [kind]: (b[kind] ?? 0) + 1 }));
    setMessage({ kind, text: def.messages[turn % def.messages.length], n: messageCount.current });
    if (comfort.sound) playTone(def.notes[turn % def.notes.length], def.voice);
    update((p) => ({ ...p, data: { ...p.data, counts: { ...p.data.counts, [kind]: uses } } }));
    if (EXPERIENCES[kind]) window.setTimeout(() => setOpenKind(kind), 260);
  }

  function handleMove(kind: string, point: Point) {
    update((p) => ({ ...p, data: { ...p.data, layoutV: LAYOUT_V, positions: { ...(p.data.layoutV === LAYOUT_V ? p.data.positions : {}), [kind]: point } } }));
  }

  const positions = progress.data.layoutV === LAYOUT_V ? (progress.data.positions ?? {}) : {};
  const moved = Object.keys(positions).length > 0;
  const messageDef = message ? OBJECTS[message.kind] : undefined;
  const index = ROOMS.findIndex((r) => r.slug === room.slug);
  const previous = ROOMS[(index - 1 + ROOMS.length) % ROOMS.length];
  const next = ROOMS[(index + 1) % ROOMS.length];
  const experience = openKind ? EXPERIENCES[openKind] : null;
  const messageExperience = message ? EXPERIENCES[message.kind] : null;
  const guidedKind = activity && !progress.data.done ? STEP_OBJECTS[room.slug]?.[progress.activityStep] : undefined;

  return (
    <div
      className="room-page mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:py-8"
      style={{ "--room-glow": room.ambience.wall } as CSSProperties}
    >
      {dim > 0 && <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 bg-[#06070f] transition-opacity duration-700" style={{ opacity: dim }} />}
      <a href={href("/casa")} className="btn btn-ghost -ml-2">
        <Icon name="arrow-left" size={18} />
        Volver a la casa
      </a>

      <header className="mt-2 flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-3xl border border-line bg-surface text-4xl sm:size-20 sm:text-5xl"
        >
          {room.emoji}
        </span>
        <div className="min-w-0">
          <h1 id="page-title" tabIndex={-1} className="text-3xl leading-tight font-extrabold text-balance sm:text-4xl">
            {room.name}
          </h1>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm font-bold">
            <li className="rounded-full bg-accent px-3 py-1 text-accent-ink">{room.category}</li>
            <li className="rounded-2xl border border-line bg-surface px-3 py-1">{ageLabel(room.minAge)}</li>
          </ul>
        </div>
      </header>
      <p className="mt-4 max-w-3xl text-lg text-pretty">
        <span className="font-extrabold">{room.description}</span> {room.welcome}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_23.5rem] lg:items-start lg:gap-6">
        {/* Escena + mensaje */}
        <div className="min-w-0 space-y-3 lg:col-start-1 lg:row-start-1">
          <RoomScene
            room={room}
            positions={positions}
            counts={progress.data.counts ?? {}}
            activeKind={activeKind}
            bursts={bursts}
            guidedKind={guidedKind}
            onActivate={handleActivate}
            onMove={handleMove}
          />

          <div aria-live="polite" className="min-h-24 rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5">
            {message && messageDef ? (
              <div key={message.n} className="fade-up flex items-start gap-3.5">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-soft text-2xl">
                  {messageDef.art ? <ObjectArt art={messageDef.art} /> : (messageDef.stages?.[0] ?? messageDef.emoji)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-muted">{messageDef.label}</p>
                  <p className="text-lg leading-snug">{message.text}</p>
                  {messageExperience && (
                    <button type="button" className="btn btn-quiet mt-2 min-h-9 text-sm" onClick={() => setOpenKind(message.kind)}>
                      <Icon name="play" size={14} /> {messageExperience.subtitle}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted">
                Toca cualquier objeto y se abre para usarlo de verdad: el telescopio muestra el cielo, el libro se lee,
                el oso responde. No hay un orden ni una forma correcta de hacerlo.
              </p>
            )}
          </div>

          {moved && (
            <button
              type="button"
              className="btn btn-ghost -ml-2 text-sm"
              onClick={() => update((p) => ({ ...p, data: { ...p.data, layoutV: LAYOUT_V, positions: {} } }))}
            >
              <Icon name="reset" size={16} />
              Devolver los objetos a su sitio
            </button>
          )}
        </div>

        {/* Panel lateral: actividad guiada (o selector de habitaciones en el vestíbulo) */}
        <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {activity ? (
            <ActivityGuide
              activity={activity}
              roomSlug={room.slug}
              step={progress.activityStep}
              done={Boolean(progress.data.done)}
              friendlyName={friendlyName}
              onOpenJournal={onOpenJournal}
              onOpenObject={handleActivate}
              onStep={(nextStep, skipped) =>
                update((p) => {
                  const rest = (p.data.skipped ?? []).filter((s) => s !== p.activityStep);
                  return {
                    ...p,
                    activityStep: nextStep,
                    data: { ...p.data, done: false, skipped: skipped ? [...rest, p.activityStep] : rest },
                  };
                })
              }
              onFinish={(skipped) =>
                update((p) => {
                  const rest = (p.data.skipped ?? []).filter((s) => s !== p.activityStep);
                  return { ...p, data: { ...p.data, done: true, skipped: skipped ? [...rest, p.activityStep] : rest } };
                })
              }
              onRestart={() => update((p) => ({ ...p, activityStep: 0, data: { ...p.data, done: false, skipped: [] } }))}
            />
          ) : (
            <RoomChooser current={room.slug} />
          )}
        </div>

        {/* Extras propios de algunas habitaciones */}
        {room.slug === "respiracion" && (
          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <BreathingCircle />
          </div>
        )}
      </div>

      {experience && openKind && (
        <Modal open onClose={() => setOpenKind(null)} title={experience.title} subtitle={experience.subtitle} wide={experience.wide}>
          <experience.Component kind={openKind} room={room} onOpenJournal={() => { setOpenKind(null); onOpenJournal(); }} onClose={() => setOpenKind(null)} setDim={setDimStable} />
        </Modal>
      )}

      {room.minAge < 18 && (
        <p className="mt-6 flex items-start gap-2 text-sm text-muted">
          <span className="mt-0.5 shrink-0">
            <Icon name="heart" size={16} />
          </span>
          {ADULT_NOTE}
        </p>
      )}

      <nav aria-label="Otras habitaciones" className="mt-6 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
        <a href={roomHref(previous.slug)} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-primary">
          <Icon name="arrow-left" />
          <span className="min-w-0">
            <span className="block text-sm text-muted">Habitación anterior</span>
            <span className="font-extrabold">
              <span aria-hidden="true">{previous.emoji} </span>
              {previous.name}
            </span>
          </span>
        </a>
        <a
          href={roomHref(next.slug)}
          className="flex items-center justify-end gap-3 rounded-2xl border border-line bg-surface p-4 text-right hover:border-primary"
        >
          <span className="min-w-0">
            <span className="block text-sm text-muted">Habitación siguiente</span>
            <span className="font-extrabold">
              <span aria-hidden="true">{next.emoji} </span>
              {next.name}
            </span>
          </span>
          <Icon name="arrow-right" />
        </a>
      </nav>
    </div>
  );
}

/** En el vestíbulo no hay actividad: el panel lateral ayuda a elegir a dónde ir. */
function RoomChooser({ current }: { current: string }) {
  return (
    <section aria-labelledby="elegir-titulo" className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
      <p className="text-xs font-extrabold tracking-[0.14em] text-muted uppercase">Sin prisa</p>
      <h2 id="elegir-titulo" className="mt-1 text-xl leading-snug font-extrabold">
        ¿A dónde te gustaría ir hoy?
      </h2>
      <p className="mt-1.5 text-sm text-muted">Todas las puertas están abiertas. También puedes quedarte aquí.</p>
      <ul className="mt-4 space-y-1.5">
        {ROOMS.filter((r) => r.slug !== current).map((r) => (
          <li key={r.slug}>
            <a
              href={roomHref(r.slug)}
              className="flex items-center gap-3 rounded-2xl border border-transparent bg-soft px-3 py-2.5 hover:border-primary"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                {r.emoji}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block font-extrabold">{r.name}</span>
                <span className="text-sm text-muted">
                  {r.category} · {ageShort(r.minAge)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
