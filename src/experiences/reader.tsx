import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, Note, usePersistent, type ExperienceProps } from "./shared";

interface Story {
  id: string;
  title: string;
  spine: string;
  minutes: number;
  pages: string[][];
  question: string;
}

const STORIES: Story[] = [
  {
    id: "caracol",
    title: "El caracol que llegaba tarde",
    spine: "#bd9079",
    minutes: 3,
    question: "¿Qué cosas ves tú cuando vas a tu paso?",
    pages: [
      [
        "Había una vez un caracol que llegaba tarde a todo. Cuando llegaba a la fiesta, ya estaban recogiendo. Cuando llegaba al charco, ya se había secado.",
        "«Soy demasiado lento», pensaba, y se metía un poco más adentro de su casa.",
      ],
      [
        "Una mañana salió hacia la colina para ver el amanecer. Por el camino lo adelantaron la liebre, la hormiga y hasta una hoja que llevaba el viento.",
        "Él siguió, pasito a pasito, mirando lo que había: una gota en una telaraña, una seta recién nacida, el olor de la tierra mojada.",
      ],
      [
        "Llegó a la cima cuando el sol ya estaba alto. El amanecer había pasado.",
        "La liebre, que había llegado primera, le preguntó: «¿Viste algo por el camino? Yo corrí tanto que no vi nada». Y el caracol le habló de la gota, de la seta y de la tierra.",
      ],
      [
        "Desde ese día el caracol siguió llegando tarde. Pero ya no decía «soy lento». Decía: «voy a mi paso».",
        "Y algunas mañanas la liebre caminaba un rato a su lado, solo para ver lo que él veía.",
      ],
    ],
  },
  {
    id: "nube",
    title: "La nube que no sabía llover",
    spine: "#8fb1c4",
    minutes: 3,
    question: "¿Hay algo que lleves cargando y que te gustaría soltar un poco?",
    pages: [
      [
        "En un cielo muy azul vivía una nube pequeña que iba guardando cosas. Guardaba la bruma de las mañanas, el vapor de los ríos, el aliento de los bosques.",
        "«Ya lloveré después», decía, y seguía guardando.",
      ],
      [
        "Con el tiempo se puso gris, y luego oscura, y tan pesada que apenas podía moverse con el viento. Las otras nubes pasaban a su lado, blancas y ligeras.",
        "«¿Por qué no sueltas un poco?», le preguntó una. «Porque si empiezo, no sé si voy a poder parar», contestó la nube.",
      ],
      [
        "Un día pasó por encima de un jardín seco. Las plantas tenían las hojas caídas y la tierra estaba partida en pedacitos.",
        "A la nube le dio tanta pena que, sin querer, se le escapó una gota. Y luego otra. Y luego muchas.",
      ],
      [
        "Llovió un rato largo. No para siempre: un rato. Cuando terminó, el jardín olía a tierra mojada y la nube era otra vez pequeña y blanca.",
        "Desde entonces, cada vez que se siente pesada, busca un jardín. Y llueve un rato, lo que haga falta.",
      ],
    ],
  },
  {
    id: "faro",
    title: "El faro y la niebla",
    spine: "#627757",
    minutes: 2,
    question: "¿Quién ha sido un faro para ti, aunque no lo viera en el momento?",
    pages: [
      [
        "En la punta de un acantilado había un faro. Cada noche encendía su luz y la hacía girar, despacio, para los barcos que pasaban.",
        "Una noche llegó una niebla tan espesa que la luz no llegaba a ningún lado. El faro giraba y giraba, y solo veía blanco.",
      ],
      [
        "«¿Para qué sirvo así?», pensó el faro. «Nadie puede verme». Estuvo a punto de apagarse.",
        "Pero siguió encendido, por costumbre, o por si acaso.",
      ],
      [
        "Al amanecer la niebla se levantó. En la bahía había un barco pequeño, anclado, sano y salvo.",
        "«No te veía», dijo el barco, «pero el resplandor en la niebla me decía por dónde no ir. Con eso me bastó».",
      ],
    ],
  },
  {
    id: "piedra",
    title: "La piedra del río",
    spine: "#a291b4",
    minutes: 2,
    question: "¿Qué cosa en ti ha cambiado tan despacio que casi no lo notaste?",
    pages: [
      [
        "Había una piedra en medio de un río. Era angulosa, con bordes que cortaban, y estaba convencida de que así iba a ser siempre.",
        "El agua pasaba por encima todos los días. No la empujaba ni la golpeaba. Solo pasaba.",
      ],
      [
        "Pasaron años. La piedra no notó ningún cambio: cada día era igual al anterior.",
        "Hasta que un niño la sacó del agua para llevársela, y la piedra se vio en su mano: redonda, suave, tibia por el sol.",
      ],
      [
        "«¿Cuándo pasó esto?», se preguntó. Y la respuesta era: todos los días, un poquito, sin que doliera.",
        "El niño se la guardó en el bolsillo, porque era de esas piedras que dan ganas de apretar cuando uno está nervioso.",
      ],
    ],
  },
  {
    id: "erizo",
    title: "El erizo y el abrazo",
    spine: "#d9a273",
    minutes: 3,
    question: "¿Cómo te gusta a ti que se acerquen cuando lo necesitas?",
    pages: [
      [
        "Al erizo le gustaban los abrazos, pero tenía púas. Cada vez que alguien se acercaba, se encogía y se hacía una bola, y el otro se iba con un pinchazo.",
        "«Mejor solo», decidió el erizo. Y se fue a vivir debajo de un arbusto.",
      ],
      [
        "Un invierno llegó una tortuga a vivir al lado. No intentó abrazarlo. Se sentó cerca, a un paso, y se quedó mirando la lluvia.",
        "Al día siguiente volvió. Y al otro. Siempre a un paso.",
      ],
      [
        "Una tarde el erizo se dio cuenta de que ya no se hacía bola cuando la tortuga llegaba. Las púas seguían ahí, pero relajadas, apuntando a cualquier lado.",
        "«¿Puedo acercarme un poco más?», preguntó la tortuga. «Un poco», dijo el erizo.",
      ],
      [
        "Nunca llegaron a abrazarse como en los cuentos. Pero se apoyaban espalda con caparazón las noches de frío, y eso, para los dos, contaba como abrazo.",
        "Porque un abrazo no es una forma. Es una distancia que los dos eligen.",
      ],
    ],
  },
];

interface Bookmark {
  storyId: string;
  page: number;
}

export function Library({ kind, onOpenJournal }: ExperienceProps) {
  const play = useSound();
  const [bookmark, setBookmark] = usePersistent<Bookmark | null>("library:bookmark", null);
  const [bigText, setBigText] = usePersistent<boolean>("library:bigText", false);
  const [storyId, setStoryId] = useState<string | null>(() => (kind === "marcador" && bookmark ? bookmark.storyId : kind === "libro" ? (bookmark?.storyId ?? STORIES[0].id) : null));
  const [page, setPage] = useState(() => (kind !== "estante" && bookmark && (kind === "marcador" || kind === "libro") ? bookmark.page : 0));
  const pageRef = useRef<HTMLDivElement>(null);

  const story = STORIES.find((s) => s.id === storyId) ?? null;

  useEffect(() => {
    pageRef.current?.focus({ preventScroll: true });
  }, [page, storyId]);

  function open(id: string) {
    const resume = bookmark?.storyId === id ? bookmark.page : 0;
    setStoryId(id);
    setPage(resume);
    play(392, "pluck");
  }

  function go(next: number) {
    if (!story) return;
    const clamped = Math.max(0, Math.min(story.pages.length, next));
    setPage(clamped);
    if (clamped < story.pages.length) setBookmark({ storyId: story.id, page: clamped });
    play(clamped > page ? 523.25 : 440, "pluck");
  }

  if (!story) {
    return (
      <div className="space-y-4">
        <Caption>Elige un libro del estante. Son cuentos cortos, de dos o tres minutos. El marcapáginas recuerda dónde te quedaste.</Caption>
        <ul className="grid gap-3 sm:grid-cols-2">
          {STORIES.map((s) => {
            const marked = bookmark?.storyId === s.id;
            return (
              <li key={s.id}>
                <button type="button" onClick={() => open(s.id)} className="flex w-full cursor-pointer items-stretch gap-3 rounded-2xl border border-line bg-surface p-3 text-left hover:border-primary">
                  <span aria-hidden="true" className="w-3 shrink-0 rounded-sm" style={{ background: s.spine }} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold">{s.title}</span>
                    <span className="block text-sm text-muted">
                      {s.pages.length} páginas · unos {s.minutes} minutos
                    </span>
                    {marked && <span className="mt-1 inline-block rounded-full bg-soft px-2 py-0.5 text-xs font-bold">🔖 Te quedaste en la página {bookmark.page + 1}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const finished = page >= story.pages.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn btn-ghost -ml-2" onClick={() => setStoryId(null)}>
          <Icon name="arrow-left" size={16} /> Estante
        </button>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-quiet min-h-9 text-sm" aria-pressed={bigText} onClick={() => setBigText(!bigText)}>
            Aa {bigText ? "Letra grande" : "Letra normal"}
          </button>
        </div>
      </div>

      <article aria-label={story.title} className="rounded-3xl border border-line bg-[#fffaf0] p-5 text-[#2b3327] shadow-inner sm:p-8" style={{ backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.04), transparent 6%, transparent 94%, rgba(0,0,0,0.04))" }}>
        <p className="text-xs font-extrabold tracking-[0.14em] text-[#7a7262] uppercase">{story.title}</p>
        <div ref={pageRef} tabIndex={-1} key={page} className="page-turn mt-3 min-h-48 outline-none">
          {finished ? (
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold">Fin</h3>
              <p className={bigText ? "text-xl leading-relaxed" : "text-lg leading-relaxed"}>{story.question}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" className="btn btn-primary" onClick={onOpenJournal}>
                  <Icon name="journal" size={16} /> Escribirlo en el diario
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => go(0)}>
                  Leer de nuevo
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => setStoryId(null)}>
                  Otro cuento
                </button>
              </div>
            </div>
          ) : (
            story.pages[page].map((paragraph, i) => (
              <p key={i} className={`${bigText ? "text-xl leading-loose" : "text-lg leading-relaxed"} ${i > 0 ? "mt-4" : ""}`} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                {paragraph}
              </p>
            ))
          )}
        </div>
        {!finished && (
          <p className="mt-6 text-center text-sm text-[#7a7262]">
            {page + 1} / {story.pages.length}
          </p>
        )}
      </article>

      {!finished && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-quiet" disabled={page === 0} onClick={() => go(page - 1)}>
            <Icon name="arrow-left" size={16} /> Página anterior
          </button>
          <button type="button" className="btn btn-primary" onClick={() => go(page + 1)}>
            {page === story.pages.length - 1 ? "Terminar" : "Pasar página"} <Icon name="arrow-right" size={16} />
          </button>
        </div>
      )}
      <Note>Puedes dejar el cuento a la mitad. El marcapáginas guarda la página y el libro te espera en el estante.</Note>
    </div>
  );
}
