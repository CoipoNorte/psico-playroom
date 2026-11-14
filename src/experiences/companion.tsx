import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "../components/Icon";
import { useSound } from "../lib/comfort";
import { Caption, HoldButton, Note, usePersistent, type ExperienceProps } from "./shared";

type Mood = "calm" | "happy" | "sleepy" | "listening" | "hug";

interface CompanionState {
  name: string;
  pets: number;
  hugs: number;
  told: number;
}

const TALK = [
  { emoji: "😔", text: "Hoy fue un día pesado", reply: "Lo escuché. No tienes que explicarlo más si no quieres." },
  { emoji: "😊", text: "Estoy contento", reply: "¡Qué bien! Me alegra que haya un momento así." },
  { emoji: "😨", text: "Tengo miedo", reply: "Estoy aquí a tu lado. El miedo también puede sentarse un rato." },
  { emoji: "😴", text: "Estoy cansado", reply: "Descansa. Aquí puedes quedarte quieto todo lo que quieras." },
  { emoji: "🥺", text: "Extraño a alguien", reply: "Extrañar es una forma de querer. Aquí tienes compañía." },
  { emoji: "🤷", text: "No sé cómo decirlo", reply: "No hace falta decirlo bien. Con que estés aquí, basta." },
];

const NAMES = {
  oso: ["Osito", "Pancho", "Lula", "Mel", "Tomi"],
  conejo: ["Pepa", "Nube", "Tito", "Mora", "Pan"],
};

const PET_LINES = [
  "Le gusta. Cierra los ojos.",
  "Se acurruca un poco más.",
  "Suelta un suspiro de peluche.",
  "Si pudiera ronronear, lo haría.",
];

interface Heart {
  id: number;
  x: number;
  y: number;
  dx: number;
}

export function Companion({ kind, onOpenJournal }: ExperienceProps) {
  const isRabbit = kind === "conejo";
  const play = useSound();
  const [state, setState] = usePersistent<CompanionState>(`companion:${kind}`, { name: "", pets: 0, hugs: 0, told: 0 });
  const [mood, setMood] = useState<Mood>("calm");
  const [line, setLine] = useState("");
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [said, setSaid] = useState<string | null>(null);
  const [naming, setNaming] = useState(false);
  const lastPet = useRef(0);
  const petsThisStroke = useRef(0);
  const moodTimer = useRef(0);
  const talkTimer = useRef(0);

  const Name = state.name.trim() || (isRabbit ? "El conejo" : "El oso");
  const toName = state.name.trim() ? `a ${state.name.trim()}` : isRabbit ? "al conejo" : "al oso";
  const fur = isRabbit ? "#e9e2dc" : "#c99a6b";
  const furDark = isRabbit ? "#d6cbc2" : "#a97d52";
  const inner = isRabbit ? "#f3c4c4" : "#e8c8a4";
  const eyesClosed = mood === "sleepy" || mood === "hug";

  function setMoodFor(m: Mood, ms: number) {
    setMood(m);
    window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => setMood("calm"), ms);
  }

  useEffect(
    () => () => {
      window.clearTimeout(moodTimer.current);
      window.clearTimeout(talkTimer.current);
    },
    [],
  );

  function pet(x: number, y: number) {
    const now = performance.now();
    if (now - lastPet.current < 160) return;
    lastPet.current = now;
    petsThisStroke.current += 1;
    setHearts((h) => [...h.slice(-10), { id: now, x, y, dx: (Math.random() - 0.5) * 60 }]);
    setMoodFor("sleepy", 900);
    if (petsThisStroke.current % 6 === 1) {
      setLine(PET_LINES[Math.floor(petsThisStroke.current / 6) % PET_LINES.length]);
      play(523.25 + Math.random() * 100, "soft");
    }
    setState((s) => ({ ...s, pets: s.pets + 1 }));
  }

  function talk(i: number) {
    const item = TALK[i];
    setSaid(item.text);
    setMoodFor("listening", 1200);
    setLine("…");
    play(392, "soft");
    window.clearTimeout(talkTimer.current);
    talkTimer.current = window.setTimeout(() => {
      setLine(item.reply);
      setMoodFor("happy", 2400);
      play(523.25, "soft");
    }, 900);
    setState((s) => ({ ...s, told: s.told + 1 }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        <Caption>
          Pasa el dedo o el ratón por encima para acariciar {toName}. Mantén pulsado «Abrazar» todo lo que quieras. También puedes contarle algo tocando una frase.
        </Caption>
        <div className="relative select-none overflow-hidden rounded-3xl bg-soft p-2">
          <svg
            viewBox="0 0 320 322"
            role="img"
            aria-label={`${Name} de peluche`}
            className="mx-auto block w-full max-w-sm touch-none"
            style={{ cursor: "grab" }}
            onPointerMove={(e) => {
              if (e.pointerType === "mouse" && e.buttons === 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              pet(((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100);
            }}
            onPointerDown={(e) => {
              petsThisStroke.current = 0;
              const rect = e.currentTarget.getBoundingClientRect();
              pet(((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100);
            }}
          >
            <g className="bob">
              <g style={{ transform: mood === "hug" ? "scale(1.06, 0.94)" : "scale(1)", transformOrigin: "160px 250px", transition: "transform 300ms ease" }}>
                {isRabbit ? (
                  <g className={mood === "listening" ? "wiggle" : undefined}>
                    <ellipse cx="125" cy="70" rx="20" ry="58" fill={fur} stroke={furDark} strokeWidth="3" />
                    <ellipse cx="125" cy="72" rx="10" ry="42" fill={inner} />
                    <ellipse cx="195" cy="70" rx="20" ry="58" fill={fur} stroke={furDark} strokeWidth="3" transform="rotate(8 195 70)" />
                    <ellipse cx="195" cy="72" rx="10" ry="42" fill={inner} transform="rotate(8 195 70)" />
                  </g>
                ) : (
                  <g className={mood === "listening" ? "wiggle" : undefined}>
                    <circle cx="105" cy="105" r="26" fill={fur} stroke={furDark} strokeWidth="3" />
                    <circle cx="105" cy="105" r="13" fill={inner} />
                    <circle cx="215" cy="105" r="26" fill={fur} stroke={furDark} strokeWidth="3" />
                    <circle cx="215" cy="105" r="13" fill={inner} />
                  </g>
                )}
                <ellipse cx="160" cy="245" rx="78" ry="60" fill={fur} stroke={furDark} strokeWidth="3" />
                <ellipse cx="160" cy="252" rx="42" ry="36" fill={inner} />
                <ellipse cx="92" cy="235" rx="22" ry="40" fill={fur} stroke={furDark} strokeWidth="3" transform={mood === "hug" ? "rotate(35 92 205)" : "rotate(15 92 205)"} style={{ transition: "transform 300ms ease" }} />
                <ellipse cx="228" cy="235" rx="22" ry="40" fill={fur} stroke={furDark} strokeWidth="3" transform={mood === "hug" ? "rotate(-35 228 205)" : "rotate(-15 228 205)"} style={{ transition: "transform 300ms ease" }} />
                <circle cx="160" cy="150" r="68" fill={fur} stroke={furDark} strokeWidth="3" />
                <ellipse cx="160" cy="172" rx="30" ry="22" fill={inner} />
                <g opacity={mood === "happy" || mood === "sleepy" || mood === "hug" ? 0.7 : 0.25} style={{ transition: "opacity 300ms" }}>
                  <ellipse cx="115" cy="165" rx="12" ry="7" fill="#f2a9a9" />
                  <ellipse cx="205" cy="165" rx="12" ry="7" fill="#f2a9a9" />
                </g>
                {eyesClosed ? (
                  <g stroke="#3b2f2a" strokeWidth="3.5" fill="none" strokeLinecap="round">
                    <path d="M126 142q10 8 20 0" />
                    <path d="M174 142q10 8 20 0" />
                  </g>
                ) : (
                  <g fill="#3b2f2a" className="blink">
                    <circle cx="136" cy="140" r="6" />
                    <circle cx="184" cy="140" r="6" />
                    <circle cx="138" cy="138" r="2" fill="#fff" />
                    <circle cx="186" cy="138" r="2" fill="#fff" />
                  </g>
                )}
                <ellipse cx="160" cy="165" rx={isRabbit ? 6 : 9} ry={isRabbit ? 4 : 6} fill="#3b2f2a" />
                <path
                  d={mood === "happy" || mood === "hug" ? "M146 180q14 14 28 0" : mood === "listening" ? "M154 182q6 4 12 0" : "M148 180q12 8 24 0"}
                  stroke="#3b2f2a"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                {isRabbit && (
                  <g stroke="#3b2f2a" strokeWidth="2" strokeLinecap="round">
                    <path d="M118 168h22M118 176h22M180 168h22M180 176h22" />
                  </g>
                )}
              </g>
            </g>
          </svg>
          {hearts.map((h) => (
            <span key={h.id} aria-hidden="true" className="heart-float pointer-events-none absolute text-xl" style={{ left: `${h.x}%`, top: `${h.y}%`, "--dx": `${h.dx}px` } as CSSProperties}>
              {isRabbit ? "🩷" : "💛"}
            </span>
          ))}
        </div>
        <p role="status" className="min-h-6 text-center font-bold">
          {line}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <HoldButton
            className="btn-primary"
            onHoldStart={() => {
              setMood("hug");
              setLine("");
              play(261.63, "soft");
            }}
            onHoldEnd={(ms) => {
              setMood("happy");
              setMoodFor("happy", 1500);
              setState((s) => ({ ...s, hugs: s.hugs + 1 }));
              setLine(ms > 3000 ? "Un abrazo largo. De los que se sienten después." : ms > 1200 ? "Gracias por el abrazo." : "Un abrazo cortito también cuenta.");
            }}
          >
            🤗 Abrazar (mantén pulsado)
          </HoldButton>
          <button type="button" className="btn btn-quiet" aria-expanded={naming} onClick={() => setNaming((v) => !v)}>
            {state.name ? `Se llama ${state.name}` : "Ponerle nombre"}
          </button>
        </div>
        {naming && (
          <div role="group" aria-label="Elegir un nombre" className="fade-up flex flex-wrap justify-center gap-2">
            {(isRabbit ? NAMES.conejo : NAMES.oso).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={state.name === n}
                className={`btn min-h-9 text-sm ${state.name === n ? "btn-primary" : "btn-quiet"}`}
                onClick={() => {
                  setState((s) => ({ ...s, name: n }));
                  setNaming(false);
                }}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-ghost min-h-9 text-sm"
              onClick={() => {
                setState((s) => ({ ...s, name: "" }));
                setNaming(false);
              }}
            >
              Sin nombre
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="font-bold">Cuéntale algo {toName}, tocando:</p>
        <div className="grid grid-cols-2 gap-2">
          {TALK.map((t, i) => (
            <button key={t.text} type="button" className="btn btn-quiet min-h-14 justify-start text-left text-sm leading-tight" onClick={() => talk(i)}>
              <span aria-hidden="true" className="text-xl">
                {t.emoji}
              </span>
              {t.text}
            </button>
          ))}
        </div>
        {said && (
          <p key={said} className="fade-up rounded-2xl bg-soft px-4 py-2 text-sm">
            Tú: <span className="font-bold">«{said}»</span>
          </p>
        )}
        <button type="button" className="btn btn-ghost -ml-2" onClick={onOpenJournal}>
          <Icon name="journal" size={15} /> Guardarlo en el diario
        </button>
        <Note>
          {Name} lleva {state.pets} caricias, {state.hugs} abrazos y {state.told} {state.told === 1 ? "cosa escuchada" : "cosas escuchadas"}. No lleva la cuenta de nada más.
        </Note>
      </div>
    </div>
  );
}
