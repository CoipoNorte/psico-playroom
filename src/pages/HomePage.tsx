import { useState } from "react";
import { Disclaimer } from "../components/Disclaimer";
import { Icon } from "../components/Icon";
import { useComfort } from "../lib/comfort";
import { ageShort, ROOMS, ROOMS_BY_SLUG } from "../lib/rooms-data";
import { href, roomHref } from "../lib/router";
import { getExperience } from "../lib/store";

const STEPS = [
  {
    n: "1",
    emoji: "🚪",
    title: "Entra a la casa",
    text: "Pulsa «Entrar a la casa» y verás las diez puertas. No hay registro ni turno: entras cuando quieres y sales cuando quieres.",
  },
  {
    n: "2",
    emoji: "🧭",
    title: "Elige según cómo llegas",
    text: "En la casa puedes decir qué te apetece —calmarte, jugar, crear, descansar— y te señalamos las habitaciones que mejor encajan. O ignóralo y entra donde te llame.",
  },
  {
    n: "3",
    emoji: "👆",
    title: "Toca, mueve y escucha",
    text: "Cada objeto se abre para usarlo de verdad: el telescopio muestra el cielo, el xilófono suena, el oso responde. También puedes arrastrarlos para ordenar la habitación.",
  },
  {
    n: "4",
    emoji: "🌱",
    title: "Sigue una actividad, o no",
    text: "Cada habitación propone una guía breve por etapas. Puedes avanzar, volver atrás u omitir cualquier paso. Al terminarla guardas un pequeño recuerdo.",
  },
  {
    n: "5",
    emoji: "📓",
    title: "Guarda lo que quieras",
    text: "El diario es privado y vive solo en tu navegador. Arriba a la derecha también tienes los ajustes: sonido, movimiento, tu nombre y tu color.",
  },
];

const RULES = [
  { emoji: "🔓", title: "Sin registro", text: "No pedimos cuenta, correo ni contraseña." },
  { emoji: "🐢", title: "Sin prisa", text: "No hay temporizadores obligatorios ni rachas que mantener." },
  { emoji: "⏭️", title: "Todo se puede omitir", text: "Etapas, sonidos, actividades enteras. Omitir también es usar la casa." },
  { emoji: "💾", title: "Todo queda contigo", text: "Tus notas y tu progreso se guardan solo en este navegador." },
];

const FAQS = [
  {
    q: "¿Necesito registrarme o descargar algo?",
    a: "No. Refugio funciona en el navegador, sin cuentas ni descargas. Tu visita es anónima y tus datos quedan solo en este dispositivo.",
  },
  {
    q: "¿Por dónde empiezo si es mi primera vez?",
    a: "Entra a la casa y empieza por el vestíbulo, o elige una habitación según cómo llegues. Si dudas, el Rincón de Peluches y el Jardín Interno son puertas amables para empezar.",
  },
  {
    q: "¿Tengo que terminar las actividades?",
    a: "No. Son invitaciones breves, no tareas. Puedes omitir etapas, dejarlas a medias o ignorarlas por completo y simplemente tocar los objetos.",
  },
  {
    q: "¿Qué pasa con lo que escribo en el diario?",
    a: "Se guarda únicamente en tu navegador y solo tú puedes verlo. Puedes borrarlo cuando quieras desde los ajustes. Nunca se envía a ningún servidor.",
  },
  {
    q: "¿Puedo usarlo con niñas o niños?",
    a: "Sí. Cada habitación indica su edad recomendada y en las pensadas para menores se recomienda la presencia de una persona adulta responsable.",
  },
  {
    q: "¿Y si me siento muy mal?",
    a: "Refugio acompaña, pero no es un servicio de emergencias ni atención clínica. Si necesitas ayuda profesional, busca un servicio de salud mental de tu localidad.",
  },
];

/** Portada: instructivo breve con una entrada clara hacia la casa. */
export function HomePage() {
  const { friendlyName } = useComfort();
  const [last] = useState(() => getExperience<{ slug: string; at: number } | null>("nav:last", null));
  const lastRoom = last ? ROOMS_BY_SLUG[last.slug] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Hero instructivo */}
      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-muted uppercase">
            Instructivo · Léelo en 2 minutos
          </p>
          <h1
            id="page-title"
            tabIndex={-1}
            className="mt-2 text-4xl leading-[1.1] font-extrabold text-balance sm:text-5xl"
          >
            {friendlyName ? `Hola, ${friendlyName}.` : "Hola."} Así se habita esta casa.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-pretty">
            Refugio es una casa tranquila con diez habitaciones para calmarte, jugar, crear o descansar. Esta página
            es el instructivo: la casa, con sus diez puertas abiertas, está un paso más adentro.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={href("/casa")} className="btn btn-primary px-6 text-base">
              <span aria-hidden="true">🏠</span>
              Entrar a la casa
              <Icon name="arrow-right" size={18} />
            </a>
            <a href={roomHref("vestibulo")} className="btn btn-quiet px-5">
              Empezar por el vestíbulo
            </a>
          </div>
          {lastRoom && (
            <p className="mt-3 text-sm text-muted">
              La última vez estuviste en{" "}
              <a href={roomHref(lastRoom.slug)} className="font-bold text-ink underline underline-offset-4">
                {lastRoom.name}
              </a>
              . Puedes seguir ahí o entrar de nuevo por la casa.
            </p>
          )}
        </div>

        <aside
          aria-label="Tu entrada a la casa"
          className="overflow-hidden rounded-3xl border border-line bg-surface p-4 shadow-sm"
        >
          <a
            href={href("/casa")}
            aria-label="Entrar a ver la casa completa"
            className="group block overflow-hidden rounded-2xl border border-line/70"
          >
            <svg viewBox="0 0 320 200" className="block w-full transition-transform duration-300 group-hover:scale-[1.03]" aria-hidden="true">
              <defs>
                <linearGradient id="mini-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cde5ee" />
                  <stop offset="100%" stopColor="#f5f2e4" />
                </linearGradient>
              </defs>
              <rect width="320" height="200" fill="url(#mini-sky)" />
              <circle cx="48" cy="40" r="14" fill="#fae08c" />
              <ellipse cx="160" cy="186" rx="150" ry="24" fill="#aac58e" />
              {/* Chimenea */}
              <rect x="220" y="22" width="16" height="32" rx="2" fill="#a87660" />
              {/* Tejado + mirador */}
              <path d="M52 72 L96 28 L224 28 L268 72 Z" fill="#bd8b73" stroke="#875d4a" strokeWidth="2.5" strokeLinejoin="round" />
              <rect x="108" y="38" width="104" height="32" rx="4" fill="#232a49" stroke="#705342" strokeWidth="2.5" />
              <circle cx="160" cy="54" r="9" fill="#10152b" stroke="#646d9e" strokeWidth="1.5" />
              <path d="M162 48 a6 6 0 1 0 4 10 a4.5 4.5 0 1 1 -4 -10 z" fill="#ffe694" />
              {/* 3 plantas en corte */}
              <rect x="64" y="72" width="192" height="106" rx="3" fill="#6b5140" />
              {/* Piso 3 */}
              <rect x="70" y="76" width="58" height="30" fill="#e3e7d6" />
              <rect x="131" y="76" width="58" height="30" fill="#dfecee" />
              <rect x="192" y="76" width="58" height="30" fill="#e6e0ee" />
              {/* Piso 2 */}
              <rect x="70" y="110" width="58" height="30" fill="#f3e1d8" />
              <rect x="131" y="110" width="58" height="30" fill="#f6efe0" />
              <rect x="192" y="110" width="58" height="30" fill="#f5e6da" />
              {/* Planta baja */}
              <rect x="70" y="144" width="58" height="30" fill="#f4ead2" />
              <rect x="131" y="144" width="58" height="30" fill="#efe7d6" />
              <path d="M150 174 v-16 a10 9 0 0 1 20 0 v16 z" fill="#b88868" stroke="#8f684e" strokeWidth="1.5" />
              <rect x="192" y="144" width="58" height="30" fill="#e2efd9" />
              {/* Arbolito */}
              <rect x="28" y="148" width="6" height="28" fill="#85624a" />
              <circle cx="31" cy="140" r="14" fill="#7ca367" />
              {/* Buzón */}
              <rect x="282" y="156" width="3" height="20" fill="#826049" />
              <path d="M276 156 v-7 a7 6 0 0 1 14 0 v7 z" fill="#6d8761" />
            </svg>
          </a>
          <p className="mt-3 font-extrabold">Una casa completa para recorrer.</p>
          <p className="mt-1 text-sm text-muted">
            Verás las diez habitaciones abiertas por dentro, el jardín, el cielo y un visitante que camina contigo.
          </p>
          <a href={href("/casa")} className="btn btn-primary mt-4 w-full">
            Ver la casa completa
            <Icon name="arrow-right" size={18} />
          </a>
          <a href={roomHref("vestibulo")} className="btn btn-ghost mt-1 w-full text-sm">
            o ir directo al vestíbulo
          </a>
        </aside>
      </section>

      {/* Pasos */}
      <section aria-labelledby="pasos-titulo" className="mt-12">
        <h2 id="pasos-titulo" className="text-xl font-extrabold">
          Cómo se usa, en 5 pasos
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-3 rounded-2xl border border-line bg-surface p-4 lg:flex-col">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-ink"
                >
                  {s.n}
                </span>
                <span aria-hidden="true" className="text-xl lg:hidden">
                  {s.emoji}
                </span>
              </span>
              <div>
                <p className="font-extrabold">
                  <span aria-hidden="true" className="mr-1 hidden lg:inline">
                    {s.emoji}
                  </span>
                  {s.title}
                </p>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Qué hay dentro */}
      <section aria-labelledby="dentro-titulo" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="dentro-titulo" className="text-xl font-extrabold">
              Qué hay dentro
            </h2>
            <p className="text-sm text-muted">Un vistazo rápido. Toca cualquiera para entrar directamente.</p>
          </div>
          <a href={href("/casa")} className="btn btn-quiet min-h-9 text-sm">
            Explorar la casa completa
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {ROOMS.map((r) => (
            <li key={r.slug}>
              <a
                href={roomHref(r.slug)}
                className="flex h-full items-center gap-2.5 rounded-2xl border border-line bg-surface p-3 hover:border-primary"
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-2xl"
                  style={{ background: r.ambience.wall }}
                >
                  {r.emoji}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block truncate font-extrabold">{r.name}</span>
                  <span className="block text-xs text-muted">{ageShort(r.minAge)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Reglas */}
      <section aria-labelledby="reglas-titulo" className="mt-12">
        <h2 id="reglas-titulo" className="text-xl font-extrabold">
          Las reglas de la casa
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map((r) => (
            <li key={r.title} className="rounded-2xl border border-line bg-surface p-4">
              <p aria-hidden="true" className="text-2xl">
                {r.emoji}
              </p>
              <p className="mt-2 font-extrabold">{r.title}</p>
              <p className="mt-1 text-sm text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Preguntas */}
      <section aria-labelledby="faq-titulo" className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <h2 id="faq-titulo" className="text-xl font-extrabold">
            Preguntas que nos hacen mucho
          </h2>
          <p className="mt-2 text-sm text-muted">
            Si después de leer esto prefieres no entrar hoy, también está bien. La casa seguirá aquí.
          </p>
          <a href={href("/casa")} className="btn btn-primary mt-4">
            Entrar a la casa
            <Icon name="arrow-right" size={18} />
          </a>
        </div>
        <div className="space-y-2">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-line bg-surface px-4 py-3">
              <summary className="cursor-pointer font-extrabold marker:text-muted">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Alcance */}
      <section aria-labelledby="alcance-titulo" className="mt-12">
        <h2 id="alcance-titulo" className="text-xl font-extrabold">
          Un espacio de acompañamiento
        </h2>
        <div className="mt-3">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <p aria-hidden="true" className="text-6xl">
        🚪
      </p>
      <h1 id="page-title" tabIndex={-1} className="mt-4 text-3xl font-extrabold">
        Esa puerta no está en esta casa
      </h1>
      <p className="mt-3 text-lg text-muted">
        Puede que la dirección haya cambiado. Puedes volver a la entrada o ir directo a explorar las habitaciones.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <a href={href("/casa")} className="btn btn-primary px-5">
          <Icon name="home" size={18} />
          Ir a la casa
        </a>
        <a href={href("/")} className="btn btn-quiet px-5">
          Ver el instructivo
        </a>
      </div>
    </div>
  );
}
