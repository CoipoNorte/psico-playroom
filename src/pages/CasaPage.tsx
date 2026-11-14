import { useMemo, useRef, useState } from "react";
import { HouseMap, type TimeOfDay } from "../components/HouseMap";
import { Icon } from "../components/Icon";
import { ACTIVITIES } from "../lib/activities-data";
import { useComfort } from "../lib/comfort";
import { ageShort, ROOMS, ROOMS_BY_SLUG } from "../lib/rooms-data";
import { href, roomHref } from "../lib/router";
import { getAllProgress, getExperience, saveExperience } from "../lib/store";

const INTENTS = [
  { id: "calma", emoji: "🌿", label: "Calmarme", slugs: ["respiracion", "jardin", "lectura"] },
  { id: "jugar", emoji: "🎈", label: "Jugar", slugs: ["peluches", "instrumentos", "movimiento"] },
  { id: "crear", emoji: "🎨", label: "Crear", slugs: ["creatividad", "instrumentos", "cocina"] },
  { id: "descansar", emoji: "🌙", label: "Descansar", slugs: ["estrellas", "peluches", "lectura"] },
  { id: "moverme", emoji: "🤸", label: "Moverme", slugs: ["movimiento", "instrumentos", "jardin"] },
  { id: "compania", emoji: "🧸", label: "Acompañado", slugs: ["peluches", "cocina", "estrellas"] },
];

const TIMES: { id: TimeOfDay; emoji: string; label: string }[] = [
  { id: "dia", emoji: "☀️", label: "Día" },
  { id: "tarde", emoji: "🌅", label: "Tarde" },
  { id: "noche", emoji: "🌙", label: "Noche" },
];

function guessTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 20 || h < 6) return "noche";
  if (h >= 17) return "tarde";
  return "dia";
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** La casa: vista visual completa y recorrible de las diez habitaciones. */
export function CasaPage() {
  const { friendlyName } = useComfort();
  const [intent, setIntent] = useState<string | null>(null);
  const [view, setView] = useState<"mapa" | "lista">("mapa");
  const [query, setQuery] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() =>
    getExperience<TimeOfDay>("house:time", guessTimeOfDay()),
  );
  const [last] = useState(() => getExperience<{ slug: string; at: number } | null>("nav:last", null));
  const keepsakesRef = useRef<HTMLElement>(null);

  const lastRoom = last ? ROOMS_BY_SLUG[last.slug] : null;
  const progress = useMemo(() => getAllProgress(), []);
  const keepsakes = useMemo(
    () =>
      ROOMS.filter((r) => ACTIVITIES[r.slug] && progress[r.slug]?.data?.done).map((r) => ({
        slug: r.slug,
        room: r.name,
        ...ACTIVITIES[r.slug].keepsake,
      })),
    [progress],
  );

  const chosen = INTENTS.find((i) => i.id === intent) ?? null;
  const q = normalize(query.trim());

  const matched = useMemo(() => {
    return ROOMS.filter((r) => {
      if (q) {
        const haystack = normalize(`${r.name} ${r.category} ${r.description} ${r.emoji}`);
        if (!haystack.includes(q)) return false;
      }
      if (chosen && !chosen.slugs.includes(r.slug)) return false;
      if (onlyPending && progress[r.slug]?.data?.done) return false;
      return true;
    });
  }, [q, chosen, onlyPending, progress]);

  const matchedSlugs = useMemo(() => new Set(matched.map((r) => r.slug)), [matched]);
  const hasFilter = Boolean(chosen || q || onlyPending);
  const highlight = chosen || q ? matchedSlugs : null;

  function pickTime(next: TimeOfDay) {
    setTimeOfDay(next);
    saveExperience("house:time", next);
  }

  function cycleTime() {
    const order: TimeOfDay[] = ["dia", "tarde", "noche"];
    pickTime(order[(order.indexOf(timeOfDay) + 1) % order.length]);
  }

  function clearFilters() {
    setQuery("");
    setIntent(null);
    setOnlyPending(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-3 pt-4 pb-8 sm:px-6 sm:pt-5">
      {/* Cabecera compacta: la casa se ve completa enseguida, sin parecer una landing */}
      <header className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h1 id="page-title" tabIndex={-1} className="text-2xl leading-tight font-extrabold sm:text-3xl">
            {friendlyName ? `La casa de ${friendlyName}` : "La casa de Refugio"}
          </h1>
          {lastRoom && (
            <a
              href={roomHref(lastRoom.slug)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-extrabold hover:border-primary"
            >
              <span aria-hidden="true">{lastRoom.emoji}</span>
              Seguir en {lastRoom.name}
              <Icon name="arrow-right" size={14} />
            </a>
          )}
        </div>

        {/* Controles compactos: momento del día + Casa / Lista */}
        <div className="flex flex-wrap items-center gap-2">
          {view === "mapa" && (
            <div role="group" aria-label="Momento del día" className="flex gap-0.5 rounded-full border border-line bg-surface p-0.5">
              {TIMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={timeOfDay === t.id}
                  onClick={() => pickTime(t.id)}
                  className={`inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 text-xs font-extrabold transition-colors ${
                    timeOfDay === t.id ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <span aria-hidden="true">{t.emoji}</span>
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
          )}

          <div role="group" aria-label="Forma de ver la casa" className="flex gap-0.5 rounded-full border border-line bg-surface p-0.5">
            {(["mapa", "lista"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-full px-3 text-xs font-extrabold transition-colors ${
                  view === v ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
                }`}
              >
                {v === "mapa" ? "🏠 Casa" : "☰ Lista"}
              </button>
            ))}
          </div>

          <a href={href("/")} className="btn btn-ghost min-h-8 px-2 text-xs">
            Instructivo
          </a>
        </div>
      </header>

      {/* Barra fina de intención + búsqueda (sin empujar la casa hacia abajo) */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="¿Qué te apetece ahora?" className="flex flex-wrap items-center gap-1.5">
          {INTENTS.map((i) => (
            <button
              key={i.id}
              type="button"
              aria-pressed={intent === i.id}
              onClick={() => setIntent(intent === i.id ? null : i.id)}
              className={`inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full border px-3 text-xs font-extrabold transition-colors ${
                intent === i.id
                  ? "border-transparent bg-accent text-accent-ink shadow-xs"
                  : "border-line bg-surface text-ink hover:border-primary"
              }`}
            >
              <span aria-hidden="true">{i.emoji}</span>
              {i.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <label htmlFor="buscar-habitacion" className="sr-only">
              Buscar una habitación
            </label>
            <input
              id="buscar-habitacion"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar habitación…"
              autoComplete="off"
              className="h-9 w-44 rounded-full border border-line bg-surface pr-8 pl-3.5 text-xs font-semibold outline-none placeholder:text-muted focus:border-primary sm:w-52"
            />
            {query ? (
              <button
                type="button"
                aria-label="Borrar la búsqueda"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-1 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted hover:bg-soft hover:text-ink"
              >
                <Icon name="close" size={14} />
              </button>
            ) : (
              <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted">
                ⌕
              </span>
            )}
          </div>

          <button
            type="button"
            aria-pressed={onlyPending}
            onClick={() => setOnlyPending((v) => !v)}
            className={`inline-flex min-h-9 cursor-pointer items-center rounded-full border px-3 text-xs font-extrabold transition-colors ${
              onlyPending
                ? "border-transparent bg-accent text-accent-ink"
                : "border-line bg-surface text-muted hover:border-primary hover:text-ink"
            }`}
          >
            {onlyPending ? "✓ Pendientes" : "Pendientes"}
          </button>

          {hasFilter && (
            <button type="button" onClick={clearFilters} className="btn btn-ghost min-h-9 text-xs">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Escenario principal: la casa completa o la lista */}
      <div className="mt-3">
        {view === "mapa" ? (
          <>
            <HouseMap
              highlight={highlight}
              dimmed={hasFilter ? matchedSlugs : null}
              timeOfDay={timeOfDay}
              onCycleTime={cycleTime}
              keepsakeCount={keepsakes.length}
              onMailboxClick={() => keepsakesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
            />
            {matched.length === 0 && (
              <div className="mt-3 rounded-2xl border border-dashed border-line bg-surface p-4 text-center text-sm text-muted">
                Ninguna habitación coincide con ese filtro.{" "}
                <button type="button" className="btn btn-ghost min-h-9 text-sm" onClick={clearFilters}>
                  Ver todas las habitaciones
                </button>
              </div>
            )}
          </>
        ) : matched.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <p aria-hidden="true" className="text-4xl">
              🔎
            </p>
            <p className="mt-3 font-extrabold">No encontramos esa habitación</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Prueba con otra palabra o limpia los filtros para ver la casa completa. Todas las puertas siguen abiertas.
            </p>
            <button type="button" className="btn btn-quiet mt-4" onClick={clearFilters}>
              Ver las diez habitaciones
            </button>
          </div>
        ) : (
          <nav aria-label="Lista de habitaciones">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matched.map((r) => {
                const lit = highlight?.has(r.slug);
                const done = Boolean(progress[r.slug]?.data?.done);
                return (
                  <li key={r.slug}>
                    <a
                      href={roomHref(r.slug)}
                      className={`fade-up flex h-full gap-3 rounded-2xl border p-3.5 transition-opacity hover:border-primary ${
                        lit && (chosen || q) ? "border-[#e0b040] bg-[#fdf6e3]" : "border-line bg-surface"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-14 shrink-0 place-items-center rounded-xl text-3xl"
                        style={{ background: r.ambience.wall }}
                      >
                        {r.emoji}
                      </span>
                      <span className="min-w-0 leading-snug">
                        <span className="block font-extrabold">{r.name}</span>
                        <span className="block text-sm text-muted">{r.category}</span>
                        <span className="block text-sm text-muted">{r.description}</span>
                        <span className="mt-1.5 flex flex-wrap gap-1 text-xs font-bold">
                          <span className="rounded-full bg-soft px-2 py-0.5">{ageShort(r.minAge)}</span>
                          <span className="rounded-full bg-soft px-2 py-0.5">{r.objects.length} objetos</span>
                          {done && (
                            <span className="rounded-full bg-accent px-2 py-0.5 text-accent-ink">✓ Hecha</span>
                          )}
                          {last?.slug === r.slug && (
                            <span className="rounded-full bg-soft px-2 py-0.5">Última visita</span>
                          )}
                        </span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      {/* Estante compacto de recuerdos (también enlazado al buzón de la casa) */}
      <section ref={keepsakesRef} aria-labelledby="recuerdos-titulo" className="mt-6 rounded-2xl border border-line bg-surface px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="recuerdos-titulo" className="text-base font-extrabold">
            📬 Buzón de recuerdos
          </h2>
          <span className="text-xs font-bold text-muted">
            {keepsakes.length} de {ROOMS.length - 1} recuerdos
          </span>
        </div>
        {keepsakes.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted">
            Cuando termines una actividad en alguna habitación, aquí aparecerá su pequeño recuerdo. No hay prisa ni nada que completar.
          </p>
        ) : (
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {keepsakes.map((k) => (
              <li key={k.slug}>
                <a
                  href={roomHref(k.slug)}
                  className="flex items-center gap-2 rounded-full border border-line bg-soft py-1 pr-3.5 pl-1 hover:border-primary"
                >
                  <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-surface text-base">
                    {k.emoji}
                  </span>
                  <span className="text-xs leading-tight">
                    <span className="block font-extrabold">{k.name}</span>
                    <span className="text-muted">{k.room}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
