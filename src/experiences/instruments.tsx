import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { startMetronome, startTone } from "../lib/audio";
import { useComfort, useSound } from "../lib/comfort";
import { Caption, HoldButton, Note, type ExperienceProps } from "./shared";

function SoundHint() {
  const { comfort, updateComfort } = useComfort();
  if (comfort.sound) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-soft px-4 py-3 text-sm">
      <span>El sonido está apagado: verás el instrumento moverse, pero no lo oirás.</span>
      <button type="button" className="btn btn-primary min-h-9 text-sm" onClick={() => updateComfort({ sound: true })}>
        <Icon name="sound-on" size={16} /> Activar sonido
      </button>
    </div>
  );
}

/* ====================================================================== */
/* Xilófono: ocho teclas, teclado numérico y una grabadora de melodías.    */
/* ====================================================================== */

const BARS = [
  { note: "Do", freq: 523.25, color: "#e88a7a", key: "1" },
  { note: "Re", freq: 587.33, color: "#f0b765", key: "2" },
  { note: "Mi", freq: 659.25, color: "#efd96b", key: "3" },
  { note: "Fa", freq: 698.46, color: "#9ccf8f", key: "4" },
  { note: "Sol", freq: 783.99, color: "#7fc4c9", key: "5" },
  { note: "La", freq: 880.0, color: "#8fb8e0", key: "6" },
  { note: "Si", freq: 987.77, color: "#b79fc9", key: "7" },
  { note: "Do'", freq: 1046.5, color: "#f0a0c0", key: "8" },
];

const SUGGESTIONS = [
  { name: "Estrellita", seq: [0, 0, 4, 4, 5, 5, 4] },
  { name: "Subir y bajar", seq: [0, 1, 2, 3, 4, 3, 2, 1, 0] },
  { name: "Tres notas", seq: [2, 0, 4] },
];

export function Xylophone(_p: ExperienceProps) {
  const play = useSound();
  const [hit, setHit] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [melody, setMelody] = useState<{ i: number; t: number }[]>([]);
  const [playing, setPlaying] = useState(false);
  const recStart = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function strike(i: number) {
    play(BARS[i].freq, "pluck");
    setHit(i);
    window.setTimeout(() => setHit((h) => (h === i ? null : h)), 180);
    if (recording) setMelody((m) => [...m, { i, t: performance.now() - recStart.current }].slice(0, 64));
  }

  function playback(seq: { i: number; t: number }[]) {
    if (seq.length === 0) return;
    setPlaying(true);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = seq.map((n) => window.setTimeout(() => strikeSilentRec(n.i), n.t));
    timers.current.push(window.setTimeout(() => setPlaying(false), seq[seq.length - 1].t + 400));
  }

  function strikeSilentRec(i: number) {
    play(BARS[i].freq, "pluck");
    setHit(i);
    window.setTimeout(() => setHit((h) => (h === i ? null : h)), 180);
  }

  return (
    <div className="space-y-4">
      <SoundHint />
      <Caption>Toca las teclas o usa los números del 1 al 8. Si quieres, graba una melodía y escúchala después.</Caption>
      <div
        role="group"
        aria-label="Teclas del xilófono"
        tabIndex={0}
        className="rounded-3xl bg-[#d9c7a8] p-4 outline-none focus-visible:ring-4 focus-visible:ring-primary"
        onKeyDown={(e) => {
          const i = BARS.findIndex((b) => b.key === e.key);
          if (i >= 0) {
            e.preventDefault();
            strike(i);
          }
        }}
      >
        <div className="flex items-end justify-center gap-1.5 sm:gap-2">
          {BARS.map((b, i) => (
            <button
              key={b.note}
              type="button"
              aria-label={`${b.note} (tecla ${b.key})`}
              onPointerDown={(e) => {
                e.preventDefault();
                strike(i);
              }}
              className={`flex w-full max-w-14 cursor-pointer flex-col items-center justify-end rounded-xl border-2 border-black/15 text-sm font-extrabold text-[#2b3327] shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)] ${hit === i ? "bar-shake" : ""}`}
              style={{ background: b.color, height: `${150 - i * 10}px` }}
            >
              <span className="mb-2 rounded-full bg-white/70 px-1.5">{b.key}</span>
              <span className="mb-2">{b.note}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {recording ? (
          <button type="button" className="btn btn-primary" onClick={() => setRecording(false)}>
            <Icon name="stop" size={16} /> Terminar grabación ({melody.length})
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              setMelody([]);
              recStart.current = performance.now();
              setRecording(true);
            }}
          >
            ● Grabar una melodía
          </button>
        )}
        <button type="button" className="btn btn-quiet" disabled={melody.length === 0 || recording || playing} onClick={() => playback(melody)}>
          <Icon name="play" size={16} /> Escuchar la mía
        </button>
        <span className="text-sm text-muted">Melodías para probar:</span>
        {SUGGESTIONS.map((s) => (
          <button key={s.name} type="button" className="btn btn-ghost min-h-9 text-sm" disabled={playing} onClick={() => playback(s.seq.map((i, k) => ({ i, t: k * 450 })))}>
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Tambor: cuatro parches y un metrónomo para encontrar el pulso.          */
/* ====================================================================== */

const PADS = [
  { name: "Bombo", key: "a", freq: 65, voice: "drum" as const, color: "#bd9079" },
  { name: "Tom grave", key: "s", freq: 110, voice: "drum" as const, color: "#c9a27e" },
  { name: "Tom agudo", key: "d", freq: 180, voice: "drum" as const, color: "#d9b48c" },
  { name: "Caja", key: "f", freq: 1, voice: "shaker" as const, color: "#e4c9a6" },
];

export function DrumKit({ kind }: ExperienceProps) {
  const play = useSound();
  const { comfort } = useComfort();
  const [hit, setHit] = useState<number | null>(null);
  const [tempo, setTempo] = useState(70);
  const [metro, setMetro] = useState(false);
  const [beat, setBeat] = useState(0);
  const [count, setCount] = useState(0);
  const isTambourine = kind === "pandereta";
  const lastShake = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    if (!metro) {
      setBeat(0);
      return;
    }
    return startMetronome(tempo, (b) => setBeat(b), comfort.sound);
  }, [metro, tempo, comfort.sound]);

  function strike(i: number) {
    play(PADS[i].freq, PADS[i].voice);
    setHit(i);
    setCount((c) => c + 1);
    window.setTimeout(() => setHit((h) => (h === i ? null : h)), 120);
  }

  return (
    <div className="space-y-4">
      <SoundHint />
      {isTambourine ? (
        <>
          <Caption>Sacude la pandereta moviendo el puntero rápido sobre ella, o tócala para dar un golpe seco. Con el teclado: Espacio golpea, flechas sacuden.</Caption>
          <div
            role="button"
            tabIndex={0}
            aria-label="Pandereta. Espacio para golpear, flechas para sacudir."
            className="mx-auto grid size-56 cursor-pointer place-items-center rounded-full border-[14px] border-[#d9a273] bg-[#fff8ea] outline-none transition-transform select-none focus-visible:ring-4 focus-visible:ring-primary"
            style={{ transform: hit !== null ? "rotate(-6deg) scale(0.97)" : undefined, touchAction: "none" }}
            onPointerDown={() => strike(0)}
            onPointerMove={(e) => {
              const now = performance.now();
              const l = lastShake.current;
              const v = Math.hypot(e.clientX - l.x, e.clientY - l.y) / Math.max(1, now - l.t);
              lastShake.current = { x: e.clientX, y: e.clientY, t: now };
              if (v > 1.4 && now - l.t > 0 && Math.random() < 0.6) {
                play(1, "shaker");
                setCount((c) => c + 1);
                setHit(3);
                window.setTimeout(() => setHit(null), 80);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                strike(0);
              } else if (e.key.startsWith("Arrow")) {
                e.preventDefault();
                play(1, "shaker");
                setCount((c) => c + 1);
              }
            }}
          >
            <span aria-hidden="true" className={`text-6xl ${hit === 3 ? "wiggle" : ""}`}>
              🪘
            </span>
          </div>
        </>
      ) : (
        <>
          <Caption>Toca los parches o usa las teclas A, S, D y F. El metrónomo es opcional: puedes seguirlo, ignorarlo o buscar el ritmo de tu propio corazón.</Caption>
          <div
            role="group"
            aria-label="Parches del tambor"
            tabIndex={0}
            className="grid grid-cols-2 gap-3 rounded-3xl bg-soft p-4 outline-none focus-visible:ring-4 focus-visible:ring-primary sm:grid-cols-4"
            onKeyDown={(e) => {
              const i = PADS.findIndex((p) => p.key === e.key.toLowerCase());
              if (i >= 0) {
                e.preventDefault();
                strike(i);
              }
            }}
          >
            {PADS.map((p, i) => (
              <button
                key={p.name}
                type="button"
                aria-label={`${p.name} (tecla ${p.key.toUpperCase()})`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  strike(i);
                }}
                className="aspect-square cursor-pointer rounded-full border-8 border-black/10 text-[#2b3327] shadow-inner transition-transform"
                style={{ background: p.color, transform: hit === i ? "scale(0.93)" : undefined }}
              >
                <span className="block text-sm font-extrabold">{p.name}</span>
                <span className="block text-xs opacity-70">{p.key.toUpperCase()}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-3">
            <svg viewBox="0 0 60 70" className="h-14 w-10 shrink-0" aria-hidden="true">
              <rect x="6" y="2" width="48" height="4" rx="2" fill="#8f6c5a" />
              <g key={`${tempo}-${metro}`} style={{ transformOrigin: "30px 6px", transformBox: "view-box", animation: metro ? `pendulum ${120 / tempo}s ease-in-out infinite` : "none" }}>
                <line x1="30" y1="6" x2="30" y2="58" stroke="#2b3327" strokeWidth="2" />
                <circle cx="30" cy="54" r="6" fill="#bd9079" />
              </g>
            </svg>
            <button type="button" className={`btn ${metro ? "btn-primary" : "btn-quiet"}`} aria-pressed={metro} onClick={() => setMetro((m) => !m)}>
              {metro ? <Icon name="stop" size={16} /> : <Icon name="play" size={16} />} Metrónomo
            </button>
            <div role="group" aria-label="Velocidad del metrónomo" className="flex items-center gap-2">
              <button type="button" aria-label="Más lento" className="btn btn-quiet min-h-9 w-10 px-0" disabled={tempo <= 40} onClick={() => setTempo((t) => Math.max(40, t - 10))}>
                −
              </button>
              <span className="w-20 text-center text-sm font-bold tabular-nums">{tempo} bpm</span>
              <button type="button" aria-label="Más rápido" className="btn btn-quiet min-h-9 w-10 px-0" disabled={tempo >= 140} onClick={() => setTempo((t) => Math.min(140, t + 10))}>
                +
              </button>
            </div>
            <div aria-hidden="true" className="flex gap-1.5">
              {[0, 1, 2, 3].map((b) => (
                <span key={b} className={`size-3 rounded-full ${metro && beat === b ? "bg-primary" : "bg-line"}`} />
              ))}
            </div>
          </div>
        </>
      )}
      <Note>Llevas {count} {count === 1 ? "golpe" : "golpes"} en esta visita. Un ritmo de 60 a 70 por minuto se parece al de un corazón en calma.</Note>
    </div>
  );
}

/* ====================================================================== */
/* Flauta: tapa agujeros y sopla (mantén pulsado) para sostener la nota.   */
/* ====================================================================== */

const FLUTE_NOTES = ["Do'", "Si", "La", "Sol", "Fa", "Mi", "Re"];
const FLUTE_FREQS = [1046.5, 987.77, 880, 783.99, 698.46, 659.25, 587.33];

export function Flute(_p: ExperienceProps) {
  const { comfort } = useComfort();
  const [holes, setHoles] = useState<boolean[]>([false, false, false, false, false, false]);
  const [blowing, setBlowing] = useState(false);
  const stopRef = useRef<() => void>(() => {});
  const covered = holes.findIndex((h) => !h) === -1 ? 6 : holes.findIndex((h) => !h);
  const noteIndex = covered;

  function begin() {
    stopRef.current();
    setBlowing(true);
    if (comfort.sound) stopRef.current = startTone(FLUTE_FREQS[noteIndex], "flute");
  }
  function end() {
    stopRef.current();
    stopRef.current = () => {};
    setBlowing(false);
  }
  useEffect(() => () => stopRef.current(), []);
  useEffect(() => {
    if (blowing) {
      stopRef.current();
      if (comfort.sound) stopRef.current = startTone(FLUTE_FREQS[noteIndex], "flute");
    }
  }, [noteIndex, blowing, comfort.sound]);

  return (
    <div className="space-y-4">
      <SoundHint />
      <Caption>Tapa agujeros de arriba hacia abajo para bajar la nota (como en una flauta dulce) y mantén pulsado «Soplar». Suelta cuando se te acabe el aire; eso también es parte de la música.</Caption>
      <div className="rounded-3xl bg-soft p-4">
        {blowing && (
          <div aria-hidden="true" className="pointer-events-none relative mx-auto h-0 max-w-md">
            {[0, 1, 2].map((n) => (
              <span key={n} className="note-float absolute left-[70%] text-2xl text-[#4b4239]" style={{ animationDelay: `${n * 0.5}s` }}>
                ♪
              </span>
            ))}
          </div>
        )}
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className={`h-10 w-16 rounded-l-full bg-[#bd9079] ${blowing ? "ring-4 ring-accent" : ""}`} aria-hidden="true" />
          <div className="flex flex-1 items-center justify-around rounded-full bg-[#ecd9b0] px-3 py-2 shadow-inner">
            {holes.map((h, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={h}
                aria-label={`Agujero ${i + 1}`}
                onClick={() => setHoles((hs) => hs.map((v, j) => (j === i ? !v : v)))}
                className={`size-9 cursor-pointer rounded-full border-2 border-[#4b4239] transition-colors ${h ? "bg-[#4b4239]" : "bg-[#fff6e6]"}`}
              />
            ))}
          </div>
        </div>
        <p className="mt-3 text-center text-sm text-muted">
          Nota: <span className="text-lg font-extrabold text-ink">{FLUTE_NOTES[noteIndex]}</span>
          {blowing && <span className="ml-2 animate-pulse">♪ sonando</span>}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <HoldButton className="btn-primary px-6" onHoldStart={begin} onHoldEnd={end}>
          🌬️ Soplar (mantén pulsado)
        </HoldButton>
        <button type="button" className="btn btn-ghost" onClick={() => setHoles([false, false, false, false, false, false])}>
          Destapar todo
        </button>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Campana: un toque y una pausa guiada por campanadas.                     */
/* ====================================================================== */

export function Bell(_p: ExperienceProps) {
  const play = useSound();
  const [swing, setSwing] = useState(0);
  const [session, setSession] = useState<{ total: number; left: number } | null>(null);

  function ring() {
    play(659.25, "bell");
    window.setTimeout(() => play(1318.5, "bell"), 30);
    setSwing((s) => s + 1);
  }

  useEffect(() => {
    if (!session || session.left <= 0) return;
    const id = window.setTimeout(() => {
      ring();
      setSession((s) => (s ? { ...s, left: s.left - 1 } : s));
    }, 20000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="space-y-4">
      <SoundHint />
      <Caption>Toca la campana y sigue el sonido hasta que desaparezca del todo. Si quieres, inicia una pausa: sonará una campanada cada 20 segundos, tres veces.</Caption>
      <button type="button" aria-label="Tocar la campana" onClick={ring} className="mx-auto block cursor-pointer rounded-3xl bg-soft p-6 outline-none focus-visible:ring-4 focus-visible:ring-primary">
        <svg key={swing} viewBox="0 0 120 140" className={`mx-auto block h-40 ${swing > 0 ? "swing" : ""}`} aria-hidden="true">
          <rect x="56" y="0" width="8" height="18" rx="3" fill="#8f6c5a" />
          <path d="M60 18c-28 0-36 30-36 70h72c0-40-8-70-36-70z" fill="#e2b45a" stroke="#9b7a2e" strokeWidth="3" />
          <rect x="18" y="88" width="84" height="12" rx="6" fill="#d9a63d" stroke="#9b7a2e" strokeWidth="3" />
          <circle cx="60" cy="110" r="9" fill="#9b7a2e" />
        </svg>
      </button>
      <div className="flex flex-wrap justify-center gap-2">
        {session && session.left > 0 ? (
          <button type="button" className="btn btn-quiet" onClick={() => setSession(null)}>
            <Icon name="stop" size={16} /> Detener la pausa ({session.left} {session.left === 1 ? "campanada" : "campanadas"} más)
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              ring();
              setSession({ total: 3, left: 3 });
            }}
          >
            <Icon name="play" size={16} /> Pausa de tres campanadas
          </button>
        )}
      </div>
      {session && session.left === 0 && <Note>Tres campanadas. Un minuto entero. Puedes seguir aquí o volver a la habitación.</Note>}
    </div>
  );
}
