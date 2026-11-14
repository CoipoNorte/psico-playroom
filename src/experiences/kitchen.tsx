import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, formatClock, Note, useTicker, type ExperienceProps } from "./shared";

/* ====================================================================== */
/* Olla y cuchara: echar ingredientes y remover en círculos.                */
/* ====================================================================== */

const INGREDIENTS = [
  { emoji: "🥕", name: "zanahoria", hue: 25 },
  { emoji: "🧅", name: "cebolla", hue: 45 },
  { emoji: "🥔", name: "papa", hue: 40 },
  { emoji: "🍅", name: "tomate", hue: 8 },
  { emoji: "🌿", name: "hierbas", hue: 110 },
  { emoji: "🧄", name: "ajo", hue: 50 },
  { emoji: "🌽", name: "maíz", hue: 50 },
  { emoji: "🫘", name: "porotos", hue: 20 },
];

export function CookingPot({ kind }: ExperienceProps) {
  const play = useSound();
  const [added, setAdded] = useState<string[]>([]);
  const [turns, setTurns] = useState(0);
  const [angle, setAngle] = useState(0);
  const angleAcc = useRef(0);
  const lastAngle = useRef<number | null>(null);
  const [heat, setHeat] = useState(1);
  const simmer = useTicker(added.length > 0 && heat > 0);

  const hue = added.length ? added.reduce((a, e) => a + (INGREDIENTS.find((i) => i.emoji === e)?.hue ?? 30), 0) / added.length : 35;
  const doneness = Math.min(100, turns * 6 + simmer * 0.5);

  function stir(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.buttons === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const a = Math.atan2(e.clientY - cy, e.clientX - cx);
    setAngle(a);
    if (lastAngle.current !== null) {
      let d = a - lastAngle.current;
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      angleAcc.current += Math.abs(d);
      if (angleAcc.current > 2 * Math.PI) {
        angleAcc.current = 0;
        setTurns((t) => t + 1);
        play(220 + Math.random() * 40, "soft");
      }
    }
    lastAngle.current = a;
  }

  return (
    <div className="space-y-4">
      <Caption>
        {kind === "cuchara"
          ? "Remueve dibujando círculos sobre la olla con el dedo o el ratón. Cada vuelta cuenta. No hay que llegar a ningún lado."
          : "Echa lo que quieras a la olla tocando los ingredientes, y remueve en círculos. El fuego hace el resto; tú solo acompañas."}
      </Caption>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
        <div
          role="img"
          aria-label={`Olla con ${added.length} ingredientes, ${turns} vueltas`}
          className="relative mx-auto size-60 cursor-grab touch-none select-none rounded-full border-[10px] border-[#6b6b73] shadow-xl"
          style={{ background: `radial-gradient(circle at 50% 45%, hsl(${hue}, 60%, ${70 - doneness * 0.2}%), hsl(${hue}, 55%, ${55 - doneness * 0.2}%))` }}
          onPointerMove={stir}
          onPointerDown={(e) => {
            lastAngle.current = null;
            stir(e);
          }}
          onPointerUp={() => (lastAngle.current = null)}
        >
          {added.map((e, i) => (
            <span key={i} aria-hidden="true" className="absolute text-2xl" style={{ left: `${35 + 30 * Math.cos((i / Math.max(1, added.length)) * Math.PI * 2 + angle)}%`, top: `${35 + 30 * Math.sin((i / Math.max(1, added.length)) * Math.PI * 2 + angle)}%` }}>
              {e}
            </span>
          ))}
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 origin-left -translate-y-1/2 text-4xl" style={{ transform: `translateY(-50%) rotate(${angle}rad)` }}>
            🥄
          </span>
          {heat > 0 && added.length > 0 && (
            <svg aria-hidden="true" className="absolute -top-10 left-1/2 h-12 w-24 -translate-x-1/2" viewBox="0 0 96 48">
              {[16, 48, 80].map((x, i) => (
                <path key={x} d={`M${x} 46 q-6 -12 0 -24 t0 -22`} stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" className="steam" style={{ animationDelay: `${i * 0.6}s` }} />
              ))}
            </svg>
          )}
        </div>
        <div className="space-y-3">
          <p className="font-bold">Ingredientes</p>
          <div className="flex flex-wrap gap-2">
            {INGREDIENTS.map((i) => (
              <button
                key={i.emoji}
                type="button"
                aria-label={`Añadir ${i.name}`}
                className="btn btn-quiet min-h-10 text-xl"
                disabled={added.length >= 8}
                onClick={() => {
                  setAdded((a) => [...a, i.emoji]);
                  play(392, "pluck");
                }}
              >
                {i.emoji}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Fuego" className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">Fuego:</span>
            {["Apagado", "🔥 Bajo", "🔥🔥 Medio", "🔥🔥🔥 Alto"].map((t, i) => (
              <button key={t} type="button" aria-pressed={heat === i} className={`btn min-h-9 text-sm ${heat === i ? "btn-primary" : "btn-quiet"}`} onClick={() => setHeat(i)}>
                {t}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">
            {turns} {turns === 1 ? "vuelta" : "vueltas"} · {formatClock(simmer)} al fuego · {doneness < 30 ? "empezando" : doneness < 70 ? "tomando sabor" : "casi listo"}
          </p>
          {added.length > 0 && (
            <button type="button" className="btn btn-ghost -ml-2" onClick={() => { setAdded([]); setTurns(0); }}>
              Vaciar la olla
            </button>
          )}
        </div>
      </div>
      <Note>{heat >= 3 ? "A fuego alto se pega. Las cosas buenas se cocinan a fuego lento." : "Remover despacio también es una forma de respirar: una vuelta, otra vuelta."}</Note>
    </div>
  );
}

/* ====================================================================== */
/* Taza: preparar una infusión de verdad, con su tiempo de reposo.          */
/* ====================================================================== */

const TEAS = [
  { id: "manzanilla", name: "Manzanilla", minutes: 5, color: "#e9d99a", note: "Clásica para la noche. Con una cucharadita de miel si te gusta." },
  { id: "menta", name: "Menta", minutes: 4, color: "#c9dfb5", note: "Despeja. Las hojas frescas, aplastadas un poco, dan más sabor." },
  { id: "tila", name: "Tila", minutes: 6, color: "#e6d6a8", note: "Para cuando el cuerpo no se suelta. Mejor sin azúcar, dicen." },
  { id: "negro", name: "Té negro", minutes: 3, color: "#b67a4a", note: "Si lo dejas más de tres minutos, amarga. Un buen recordatorio." },
];

export function TeaCup(_p: ExperienceProps) {
  const play = useSound();
  const [tea, setTea] = useState(TEAS[0]);
  const [steeping, setSteeping] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const elapsed = useTicker(steeping, resetKey);
  const total = tea.minutes * 60;
  const left = Math.max(0, total - elapsed);
  const ready = steeping && left === 0;
  const strength = Math.min(1, elapsed / total);

  useEffect(() => {
    if (ready) {
      setSteeping(false);
      play(659.25, "bell");
    }
  }, [ready, play]);

  const finished = !steeping && elapsed >= total && elapsed > 0;

  return (
    <div className="space-y-4">
      <Caption>Elige una infusión, pon el agua a calentar de verdad si quieres, y deja reposar lo que marca el reloj. Mientras tanto no hay nada que hacer, salvo esperar con las manos alrededor de la taza.</Caption>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <svg viewBox="0 0 200 180" className="mx-auto block h-48" role="img" aria-label={finished ? `${tea.name} lista` : steeping ? `${tea.name} reposando` : "Taza vacía"}>
          {(steeping || finished) && [60, 100, 140].map((x, i) => (
            <path key={x} d={`M${x} 60 q-8 -14 0 -28 t0 -26`} stroke="#bbb" strokeWidth="4" strokeLinecap="round" fill="none" className="steam" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
          <path d="M40 70h120v50a40 40 0 0 1-40 40H80a40 40 0 0 1-40-40z" fill="#fffaf0" stroke="#bd9079" strokeWidth="4" />
          <path d="M160 85h14a18 18 0 0 1 0 36h-14" fill="none" stroke="#bd9079" strokeWidth="4" />
          <ellipse cx="100" cy="72" rx="58" ry="10" fill={tea.color} opacity={0.25 + strength * 0.75} />
          <ellipse cx="100" cy="72" rx="58" ry="10" fill="none" stroke="#bd9079" strokeWidth="4" />
          {steeping && <rect x="128" y="20" width="14" height="18" rx="2" fill="#e8e0d0" stroke="#bd9079" strokeWidth="2" />}
          {steeping && <line x1="135" y1="38" x2="118" y2="75" stroke="#bd9079" strokeWidth="2" />}
          <ellipse cx="100" cy="166" rx="80" ry="8" fill="#e0d2bd" />
        </svg>
        <div className="space-y-3">
          <div role="group" aria-label="Infusión" className="flex flex-wrap gap-2">
            {TEAS.map((t) => (
              <button key={t.id} type="button" aria-pressed={tea.id === t.id} disabled={steeping} className={`btn min-h-9 text-sm ${tea.id === t.id ? "btn-primary" : "btn-quiet"}`} onClick={() => { setTea(t); setResetKey((k) => k + 1); }}>
                {t.name} · {t.minutes} min
              </button>
            ))}
          </div>
          <p className="text-4xl font-extrabold tabular-nums">{formatClock(left)}</p>
          <div className="flex flex-wrap gap-2">
            {steeping ? (
              <button type="button" className="btn btn-quiet" onClick={() => setSteeping(false)}>
                <Icon name="stop" size={16} /> Sacar la bolsita antes
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => { setResetKey((k) => k + 1); setSteeping(true); play(523.25, "pluck"); }}>
                <Icon name="play" size={16} /> {finished ? "Otra taza" : "Dejar reposar"}
              </button>
            )}
          </div>
          <p role="status" className="min-h-6 font-bold">
            {finished ? `Lista. ${tea.name} en su punto. Tómala despacio.` : ""}
          </p>
        </div>
      </div>
      <Note>{tea.note}</Note>
    </div>
  );
}

/* ====================================================================== */
/* Delantal: recetas sencillas de verdad, paso a paso.                      */
/* ====================================================================== */

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  time: string;
  ingredients: string[];
  steps: { text: string; timer?: number }[];
}

const RECIPES: Recipe[] = [
  {
    id: "avena",
    name: "Avena de la noche anterior",
    emoji: "🥣",
    time: "5 minutos hoy, lista mañana",
    ingredients: ["½ taza de avena", "½ taza de leche (la que uses)", "1 cucharada de yogur o semillas de chía (opcional)", "Fruta que te guste", "Un poco de miel o canela"],
    steps: [
      { text: "Pon la avena en un frasco o taza con tapa." },
      { text: "Añade la leche y, si quieres, el yogur o la chía. Remueve hasta que no queden grumos." },
      { text: "Tapa y guarda en la nevera. Lo demás lo hace el tiempo, mientras duermes." },
      { text: "Por la mañana, pon la fruta encima y un poco de miel o canela. Ya está." },
    ],
  },
  {
    id: "tostada",
    name: "Tostada de plátano y canela",
    emoji: "🍞",
    time: "7 minutos",
    ingredients: ["1 rebanada de pan", "½ plátano", "Mantequilla, crema de cacahuete o queso crema", "Canela"],
    steps: [
      { text: "Tuesta el pan como te guste: más blando o más crujiente.", timer: 180 },
      { text: "Mientras tanto, pela el plátano y córtalo en rodajas. Fíjate en el sonido del cuchillo sobre la tabla." },
      { text: "Unta la tostada con lo que hayas elegido." },
      { text: "Coloca las rodajas encima y espolvorea canela. Cómela caliente, sin pantalla delante si puedes." },
    ],
  },
  {
    id: "infusion",
    name: "Leche tibia con miel y canela",
    emoji: "🥛",
    time: "6 minutos",
    ingredients: ["1 taza de leche (de vaca, avena o almendra)", "1 cucharadita de miel", "Una pizca de canela", "Una rama de canela o vainilla, si tienes"],
    steps: [
      { text: "Calienta la leche en un cazo a fuego bajo. No tiene que hervir: solo humear.", timer: 240 },
      { text: "Apaga el fuego. Añade la miel y remueve despacio hasta que se disuelva." },
      { text: "Sirve en tu taza favorita y pon la canela por encima." },
      { text: "Sostén la taza con las dos manos un momento antes del primer sorbo." },
    ],
  },
];

export function Recipes({ onOpenJournal }: ExperienceProps) {
  const play = useSound();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [step, setStep] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const elapsed = useTicker(timerOn, timerKey);

  const current = recipe?.steps[step];
  const timerLeft = current?.timer ? Math.max(0, current.timer - elapsed) : 0;
  useEffect(() => {
    if (timerOn && current?.timer && timerLeft === 0) {
      setTimerOn(false);
      play(659.25, "bell");
    }
  }, [timerOn, timerLeft, current, play]);

  if (!recipe) {
    return (
      <div className="space-y-4">
        <Caption>Tres recetas sencillas de verdad, para hacer en una cocina real, con calma. Si no puedes cocinar ahora, también sirven para leerlas e imaginarlas.</Caption>
        <ul className="grid gap-3 sm:grid-cols-3">
          {RECIPES.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => { setRecipe(r); setStep(0); setChecked(new Set()); setTimerOn(false); setTimerKey((k) => k + 1); }} className="h-full w-full cursor-pointer rounded-2xl border border-line bg-surface p-4 text-left hover:border-primary">
                <span aria-hidden="true" className="text-3xl">
                  {r.emoji}
                </span>
                <span className="mt-1 block font-extrabold">{r.name}</span>
                <span className="block text-sm text-muted">{r.time}</span>
              </button>
            </li>
          ))}
        </ul>
        <Note>Si eres menor, pide compañía para usar el fuego, el horno o los cuchillos. Cocinar con alguien también es parte de la receta.</Note>
      </div>
    );
  }

  const done = step >= recipe.steps.length;

  return (
    <div className="space-y-4">
      <button type="button" className="btn btn-ghost -ml-2" onClick={() => setRecipe(null)}>
        <Icon name="arrow-left" size={16} /> Otras recetas
      </button>
      <h3 className="text-xl font-extrabold">
        {recipe.emoji} {recipe.name}
      </h3>
      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <section aria-label="Ingredientes" className="rounded-2xl border border-line bg-soft p-4">
          <p className="font-bold">Ingredientes</p>
          <ul className="mt-2 space-y-1.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={ing}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked.has(i)}
                    onChange={() => setChecked((c) => { const n = new Set(c); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                    className="mt-1 size-4 accent-[var(--primary)]"
                  />
                  <span className={checked.has(i) ? "text-muted line-through" : ""}>{ing}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Pasos" className="space-y-3">
          {done ? (
            <div className="fade-up space-y-3 rounded-2xl border border-line p-4">
              <p className="text-lg font-extrabold">Listo. Cuidarte un rato, aunque sea así de simple, también cuenta.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={onOpenJournal}>
                  <Icon name="journal" size={16} /> ¿Cómo estuvo?
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => setStep(0)}>
                  Volver al principio
                </button>
              </div>
            </div>
          ) : (
            <div key={step} className="fade-up rounded-2xl border border-line p-4">
              <p className="text-xs font-extrabold tracking-[0.12em] text-muted uppercase">
                Paso {step + 1} de {recipe.steps.length}
              </p>
              <p className="mt-1 text-lg">{current?.text}</p>
              {current?.timer && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-soft px-3 py-2">
                  <span className="text-2xl font-extrabold tabular-nums">{formatClock(timerOn || elapsed > 0 ? timerLeft : current.timer)}</span>
                  <button type="button" className={`btn min-h-9 text-sm ${timerOn ? "btn-quiet" : "btn-primary"}`} onClick={() => { if (!timerOn && timerLeft === 0) setTimerKey((k) => k + 1); setTimerOn((v) => !v); }}>
                    {timerOn ? "Pausar" : elapsed > 0 && timerLeft > 0 ? "Seguir" : "Empezar a contar"}
                  </button>
                  {elapsed > 0 && timerLeft === 0 && <span className="text-sm font-bold">¡Tiempo!</span>}
                </div>
              )}
            </div>
          )}
          {!done && (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-quiet" disabled={step === 0} onClick={() => { setStep((s) => s - 1); setTimerOn(false); setTimerKey((k) => k + 1); }}>
                <Icon name="arrow-left" size={16} /> Anterior
              </button>
              <button type="button" className="btn btn-primary" onClick={() => { setStep((s) => s + 1); setTimerOn(false); setTimerKey((k) => k + 1); }}>
                {step === recipe.steps.length - 1 ? "Terminar" : "Siguiente"} <Icon name="arrow-right" size={16} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Frutas: armar un frutero (o un desayuno) a tu gusto.                     */
/* ====================================================================== */

const FRUITS = ["🍎", "🍐", "🍊", "🍋", "🍌", "🍇", "🍓", "🫐", "🍑", "🥝", "🍒", "🍉"];

export function FruitBowl(_p: ExperienceProps) {
  const play = useSound();
  const [bowl, setBowl] = useState<{ id: number; f: string; x: number; y: number }[]>([]);

  return (
    <div className="space-y-4">
      <Caption>Toca las frutas para ponerlas en el frutero. Elige las que te gusten de verdad; nadie va a revisar si es equilibrado. Toca una fruta del frutero para sacarla.</Caption>
      <div className="relative h-56 overflow-hidden rounded-3xl bg-soft">
        <div aria-hidden="true" className="absolute inset-x-8 bottom-6 h-24 rounded-b-[50%] border-4 border-[#bd9079] bg-[#f6ecd9]" />
        {bowl.map((b) => (
          <button key={b.id} type="button" aria-label={`Sacar ${b.f}`} onClick={() => { setBowl((s) => s.filter((x) => x.id !== b.id)); play(330, "pluck"); }} className="drop-in absolute cursor-pointer text-4xl" style={{ left: `${b.x}%`, top: `${b.y}%`, transform: "translate(-50%,-50%)" }}>
            {b.f}
          </button>
        ))}
        {bowl.length === 0 && <p className="absolute inset-x-0 top-10 text-center text-sm text-muted">El frutero está vacío. De momento.</p>}
      </div>
      <div role="group" aria-label="Frutas disponibles" className="flex flex-wrap gap-2">
        {FRUITS.map((f) => (
          <button key={f} type="button" aria-label={`Añadir ${f}`} disabled={bowl.length >= 14} className="btn btn-quiet min-h-11 text-2xl" onClick={() => { setBowl((s) => [...s, { id: Date.now() + Math.random(), f, x: 25 + Math.random() * 50, y: 45 + Math.random() * 30 }]); play(523.25 + Math.random() * 200, "pluck"); }}>
            {f}
          </button>
        ))}
      </div>
      <Note>{bowl.length === 0 ? "¿Hay algún sabor que te haga sentir en casa?" : bowl.length < 4 ? "Un frutero con pocas cosas también es un frutero." : "Eso ya parece un desayuno. O una merienda. O lo que tú digas que es."}</Note>
    </div>
  );
}
