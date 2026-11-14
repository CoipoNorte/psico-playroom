import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ACTIVITIES } from "../lib/activities-data";
import { useComfort, useSound } from "../lib/comfort";
import { ageShort, OBJECTS, ROOMS_BY_SLUG } from "../lib/rooms-data";
import { roomHref } from "../lib/router";
import { getAllProgress, getExperience } from "../lib/store";
import { HouseRoomInterior } from "./HouseInteriors";
import { Icon } from "./Icon";

export type TimeOfDay = "dia" | "tarde" | "noche";

const W = 1120;
const H = 790;

interface RoomSlot {
  slug: string;
  floorLabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Coordenadas donde se para el visitante dentro de esta habitación. */
  standX: number;
  standY: number;
  neighbors: { left?: string; right?: string; up?: string; down?: string };
}

export const HOUSE_SLOTS: RoomSlot[] = [
  { slug: "estrellas", floorLabel: "Ático", x: 330, y: 94, w: 460, h: 130, standX: 486, standY: 214, neighbors: { down: "respiracion" } },
  { slug: "lectura", floorLabel: "Piso 3", x: 204, y: 236, w: 232, h: 146, standX: 300, standY: 372, neighbors: { right: "respiracion", down: "peluches" } },
  { slug: "respiracion", floorLabel: "Piso 3", x: 444, y: 236, w: 232, h: 146, standX: 528, standY: 372, neighbors: { left: "lectura", right: "instrumentos", up: "estrellas", down: "creatividad" } },
  { slug: "instrumentos", floorLabel: "Piso 3", x: 684, y: 236, w: 232, h: 146, standX: 816, standY: 372, neighbors: { left: "respiracion", down: "movimiento" } },
  { slug: "peluches", floorLabel: "Piso 2", x: 204, y: 394, w: 232, h: 146, standX: 352, standY: 530, neighbors: { right: "creatividad", up: "lectura", down: "cocina" } },
  { slug: "creatividad", floorLabel: "Piso 2", x: 444, y: 394, w: 232, h: 146, standX: 572, standY: 530, neighbors: { left: "peluches", right: "movimiento", up: "respiracion", down: "vestibulo" } },
  { slug: "movimiento", floorLabel: "Piso 2", x: 684, y: 394, w: 232, h: 146, standX: 786, standY: 530, neighbors: { left: "creatividad", up: "instrumentos", down: "jardin" } },
  { slug: "cocina", floorLabel: "Planta baja", x: 204, y: 552, w: 232, h: 146, standX: 296, standY: 688, neighbors: { right: "vestibulo", up: "peluches" } },
  { slug: "vestibulo", floorLabel: "Planta baja", x: 444, y: 552, w: 232, h: 146, standX: 560, standY: 688, neighbors: { left: "cocina", right: "jardin", up: "creatividad" } },
  { slug: "jardin", floorLabel: "Planta baja", x: 684, y: 552, w: 232, h: 146, standX: 814, standY: 688, neighbors: { left: "vestibulo", up: "movimiento" } },
];

const SLOTS_BY_SLUG: Record<string, RoomSlot> = Object.fromEntries(HOUSE_SLOTS.map((s) => [s.slug, s]));

const SKY_STARS: [number, number, number][] = [
  [54, 48, 1.8], [94, 88, 1.3], [198, 42, 1.6], [268, 76, 1.2], [352, 34, 1.5], [442, 24, 1.3],
  [654, 28, 1.7], [742, 38, 1.4], [898, 52, 1.6], [964, 88, 1.2], [1034, 44, 1.8], [1072, 108, 1.3],
  [44, 178, 1.2], [118, 224, 1.5], [76, 304, 1.1], [1018, 184, 1.5], [1068, 254, 1.2], [992, 316, 1.4],
  [28, 396, 1.3], [1082, 378, 1.4], [142, 148, 1.1], [928, 146, 1.3],
];

const FIREFLIES: [number, number][] = [
  [78, 636], [134, 668], [954, 632], [1024, 658], [1066, 610], [42, 692],
];

const SKY_PALETTE: Record<TimeOfDay, { top: string; mid: string; low: string; hill1: string; hill2: string; grass1: string; grass2: string }> = {
  dia: { top: "#cde5ee", mid: "#e7f2ea", low: "#f5f2e4", hill1: "#c7dbb8", hill2: "#b2cba1", grass1: "#aac58e", grass2: "#93b278" },
  tarde: { top: "#8c89ad", mid: "#d8a89f", low: "#f4d3ac", hill1: "#a69c92", hill2: "#8f8b7d", grass1: "#8da176", grass2: "#778c62" },
  noche: { top: "#151a30", mid: "#222947", low: "#2f375c", hill1: "#242c47", hill2: "#1d253d", grass1: "#293b37", grass2: "#20302d" },
};

interface Props {
  highlight?: Set<string> | null;
  dimmed?: Set<string> | null;
  timeOfDay?: TimeOfDay;
  onCycleTime?: () => void;
  onMailboxClick?: () => void;
  keepsakeCount?: number;
}

/** Casa completa ilustrada en corte arquitectónico, con personaje recorrible y detalles vivos. */
export function HouseMap({
  highlight = null,
  dimmed = null,
  timeOfDay = "dia",
  onCycleTime,
  onMailboxClick,
  keepsakeCount = 0,
}: Props) {
  const { visitor, comfort } = useComfort();
  const play = useSound();
  const progress = useMemo(() => getAllProgress(), []);
  const garden = useMemo(() => getExperience<{ seed: string | null; growth: number }>("garden:main", { seed: null, growth: 0 }), []);

  const [currentSlug, setCurrentSlug] = useState<string>(() => {
    const last = getExperience<{ slug: string } | null>("nav:last", null);
    return last && SLOTS_BY_SLUG[last.slug] ? last.slug : "vestibulo";
  });
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [stepBounce, setStepBounce] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Interacciones del exterior
  const [chimneyPuff, setChimneyPuff] = useState(0);
  const [birdSing, setBirdSing] = useState(0);
  const [catPurr, setCatPurr] = useState(0);
  const [yardLampOn, setYardLampOn] = useState<boolean | null>(null);
  const [whisper, setWhisper] = useState<string>("");
  const whisperTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (whisperTimer.current !== null) window.clearTimeout(whisperTimer.current);
  }, []);

  const showWhisper = useCallback((text: string) => {
    setWhisper(text);
    if (whisperTimer.current !== null) window.clearTimeout(whisperTimer.current);
    whisperTimer.current = window.setTimeout(() => setWhisper(""), 4200);
  }, []);

  const walkTo = useCallback(
    (slug: string, withSound = false) => {
      const target = SLOTS_BY_SLUG[slug];
      if (!target) return;
      setCurrentSlug((prev) => {
        if (prev === slug) return prev;
        const from = SLOTS_BY_SLUG[prev];
        if (from && target.standX !== from.standX) {
          setFacing(target.standX < from.standX ? "left" : "right");
        }
        setStepBounce((n) => n + 1);
        if (withSound) play(target.standY < (from?.standY ?? target.standY) ? 523.25 : 392, "soft");
        return slug;
      });
    },
    [play],
  );

  // Si se activa un filtro (como "Calmarme") y el visitante no está en una sugerida, acercarlo suavemente.
  useEffect(() => {
    if (highlight && highlight.size > 0 && !highlight.has(currentSlug)) {
      const first = HOUSE_SLOTS.find((s) => highlight.has(s.slug));
      if (first) walkTo(first.slug, false);
    }
  }, [highlight, currentSlug, walkTo]);

  // Recorrido con teclado (flechas o WASD cuando no se está escribiendo en un input).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (document.querySelector("dialog[open]")) return;
      const slot = SLOTS_BY_SLUG[currentSlug];
      if (!slot) return;
      const dirMap: Record<string, keyof RoomSlot["neighbors"]> = {
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowDown: "down",
        s: "down",
        S: "down",
      };
      const dir = dirMap[e.key];
      if (dir) {
        const next = slot.neighbors[dir];
        if (next) {
          e.preventDefault();
          walkTo(next, true);
        }
        return;
      }
      if (e.key === "Enter" && tag !== "A" && tag !== "BUTTON") {
        e.preventDefault();
        play(523.25, "pluck");
        window.location.hash = roomHref(currentSlug);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSlug, walkTo, play]);

  const activeSlot = SLOTS_BY_SLUG[currentSlug] ?? SLOTS_BY_SLUG["vestibulo"];
  const activeRoom = ROOMS_BY_SLUG[activeSlot.slug];
  const activeProg = progress[activeRoom.slug];
  const activeActivity = ACTIVITIES[activeRoom.slug];
  const sky = SKY_PALETTE[timeOfDay];
  const warmLights = timeOfDay !== "dia";
  const isLampLit = yardLampOn ?? warmLights;

  return (
    <section aria-label="Casa completa de Refugio" className="mx-auto w-full max-w-6xl">
      {/* Marco panorámico de la casa completa */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-md">
        <div className={zoomed ? "overflow-x-auto overscroll-x-contain" : ""}>
          <div className={`relative mx-auto aspect-[1120/790] w-full select-none ${zoomed ? "min-w-[820px]" : ""}`}>
            {/* Capa 1: Ilustración completa de la casa, paisaje, interiores y visitante */}
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="block size-full"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <linearGradient id="house-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sky.top} />
                  <stop offset="56%" stopColor={sky.mid} />
                  <stop offset="100%" stopColor={sky.low} />
                </linearGradient>
                <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={timeOfDay === "tarde" ? "#ffbe7b" : "#fff1b8"} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={timeOfDay === "tarde" ? "#ffbe7b" : "#fff1b8"} stopOpacity="0" />
                </radialGradient>
                <radialGradient id="yard-lamp-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffe599" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ffe599" stopOpacity="0" />
                </radialGradient>
                {HOUSE_SLOTS.map((slot) => (
                  <clipPath key={slot.slug} id={`clip-${slot.slug}`}>
                    <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h} rx={slot.slug === "estrellas" ? 8 : 2} />
                  </clipPath>
                ))}
              </defs>

              {/* Cielo */}
              <rect width={W} height={H} fill="url(#house-sky)" />

              {/* Estrellas (noche) */}
              {timeOfDay === "noche" &&
                SKY_STARS.map(([x, y, r], i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={r}
                    fill="#fff4cf"
                    className="twinkle"
                    style={{ animationDelay: `${(i % 6) * 0.5}s` }}
                  />
                ))}

              {/* Sol o Luna (interactivo vía botón encima) */}
              {timeOfDay === "noche" ? (
                <g transform="translate(124, 102)">
                  <circle cx="0" cy="0" r="46" fill="#e2e8ff" opacity="0.1" />
                  <path d="M8 -26 a26 26 0 1 0 19 42 a20 20 0 1 1 -19 -42 z" fill="#fff0b8" />
                </g>
              ) : (
                <g transform={`translate(124, ${timeOfDay === "tarde" ? 132 : 98})`}>
                  <circle cx="0" cy="0" r="64" fill="url(#sun-glow)" />
                  <circle cx="0" cy="0" r="28" fill={timeOfDay === "tarde" ? "#f6a56e" : "#fae08c"} />
                </g>
              )}

              {/* Nubes suaves de día y atardecer */}
              {timeOfDay !== "noche" && (
                <g fill={timeOfDay === "tarde" ? "#f7dec8" : "#ffffff"} opacity={timeOfDay === "tarde" ? 0.65 : 0.85}>
                  <g className="house-cloud">
                    <rect x="206" y="72" width="92" height="24" rx="12" />
                    <circle cx="234" cy="72" r="18" />
                    <circle cx="268" cy="74" r="14" />
                  </g>
                  <g className="house-cloud-slow">
                    <rect x="916" y="88" width="98" height="24" rx="12" />
                    <circle cx="946" cy="88" r="17" />
                    <circle cx="980" cy="90" r="14" />
                  </g>
                  <g className="house-cloud" style={{ animationDelay: "-5s" }}>
                    <rect x="954" y="182" width="76" height="18" rx="9" opacity="0.7" />
                    <circle cx="978" cy="182" r="13" opacity="0.7" />
                  </g>
                </g>
              )}

              {/* Colinas lejanas */}
              <path d="M0 640 Q160 568 350 618 T760 606 T1120 622 L1120 790 L0 790 Z" fill={sky.hill1} />
              <path d="M0 664 Q220 618 460 656 T920 638 T1120 662 L1120 790 L0 790 Z" fill={sky.hill2} />

              {/* Jardín y pradera */}
              <rect x="0" y="694" width={W} height="96" fill={sky.grass1} />
              <ellipse cx="560" cy="720" rx="455" ry="26" fill={sky.grass2} opacity="0.55" />

              {/* Valla de madera a los lados */}
              <g fill="#e6dcc8" stroke="#bba98e" strokeWidth="1.4" opacity={timeOfDay === "noche" ? 0.55 : 0.95}>
                <rect x="14" y="668" width="174" height="6" rx="2" />
                <rect x="14" y="684" width="174" height="6" rx="2" />
                {[28, 56, 84, 112, 140, 168].map((x) => (
                  <path key={x} d={`M${x} 656 L${x + 6} 649 L${x + 12} 656 V702 H${x} Z`} />
                ))}
                <rect x="932" y="668" width="174" height="6" rx="2" />
                <rect x="932" y="684" width="174" height="6" rx="2" />
                {[944, 972, 1000, 1028, 1056, 1084].map((x) => (
                  <path key={x} d={`M${x} 656 L${x + 6} 649 L${x + 12} 656 V702 H${x} Z`} />
                ))}
              </g>

              {/* Camino de piedras desde la puerta principal */}
              <path d="M518 716 Q544 748 524 790 L598 790 Q580 748 602 716 Z" fill="#dfd2bc" opacity={timeOfDay === "noche" ? 0.5 : 0.92} />
              <g fill="#cbbba2" opacity={timeOfDay === "noche" ? 0.5 : 0.85}>
                <ellipse cx="556" cy="742" rx="18" ry="5" />
                <ellipse cx="566" cy="762" rx="20" ry="5.5" />
                <ellipse cx="554" cy="780" rx="17" ry="4.5" />
              </g>

              {/* Árbol acogedor a la izquierda con pajarito */}
              <g transform="translate(88, 696)">
                <path d="M-12 4 Q-8 -60 -16 -128 L12 -128 Q8 -60 14 4 Z" fill="#85624a" />
                <path d="M-6 -96 L-34 -128" stroke="#85624a" strokeWidth="7" strokeLinecap="round" />
                <path d="M6 -108 L34 -136" stroke="#85624a" strokeWidth="6" strokeLinecap="round" />
                <g className="house-sway" style={{ transformOrigin: "0px -130px" }}>
                  <circle cx="-30" cy="-148" r="40" fill={timeOfDay === "noche" ? "#345242" : "#7ca367"} />
                  <circle cx="28" cy="-152" r="38" fill={timeOfDay === "noche" ? "#2e4a3b" : "#6f965b"} />
                  <circle cx="0" cy="-182" r="46" fill={timeOfDay === "noche" ? "#3c5e4b" : "#8db376"} />
                  <circle cx="-10" cy="-136" r="32" fill={timeOfDay === "noche" ? "#395947" : "#82a86c"} />
                </g>
                {/* Pajarito posado */}
                <g key={birdSing} transform="translate(28, -142)" className={birdSing > 0 ? "obj-pop" : ""}>
                  <ellipse cx="0" cy="0" rx="9" ry="7" fill="#e89a6e" />
                  <circle cx="7" cy="-4" r="5" fill="#e89a6e" />
                  <polygon points="11,-5 16,-3 11,-1" fill="#f0c35a" />
                  <circle cx="8.5" cy="-5" r="1.1" fill="#2b3327" />
                  <path d="M-7 -1 L-14 -5 L-11 2 Z" fill="#c97b52" />
                  {birdSing > 0 && (
                    <g fill={timeOfDay === "noche" ? "#ffe99e" : "#56624f"} fontSize="15" fontWeight="800">
                      <text x="12" y="-12" className="heart-float">♪</text>
                      <text x="24" y="-22" className="heart-float" style={{ animationDelay: "0.18s" }}>♫</text>
                    </g>
                  )}
                </g>
              </g>

              {/* Farol de jardín (izquierda de la casa) */}
              <g transform="translate(160, 706)">
                {isLampLit && <circle cx="0" cy="-86" r="42" fill="url(#yard-lamp-glow)" className="house-lamp-glow" />}
                <rect x="-3" y="-82" width="6" height="82" rx="2" fill="#5e4b40" />
                <rect x="-10" y="-4" width="20" height="6" rx="2" fill="#5e4b40" />
                <path d="M-9 -82 L-6 -96 L6 -96 L9 -82 Z" fill={isLampLit ? "#fff1b8" : "#c5ced4"} stroke="#5e4b40" strokeWidth="2" />
                <path d="M-12 -96 L0 -105 L12 -96 Z" fill="#5e4b40" />
              </g>

              {/* Gato dormido junto al invernadero */}
              <g key={catPurr} transform="translate(962, 706)">
                <ellipse cx="0" cy="4" rx="18" ry="11" fill="#d9a173" stroke="#a6744c" strokeWidth="1.4" />
                <circle cx="-12" cy="1" r="8" fill="#d9a173" stroke="#a6744c" strokeWidth="1.4" />
                <polygon points="-18,-5 -15,-12 -11,-5" fill="#d9a173" />
                <polygon points="-10,-5 -7,-12 -4,-5" fill="#d9a173" />
                <path d="M-16 1 q2 2 4 0 M-10 1 q2 2 4 0" fill="none" stroke="#423226" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M16 8 q10 -4 6 -12" fill="none" stroke="#c48a5c" strokeWidth="3.5" strokeLinecap="round" className={catPurr > 0 ? "wiggle" : ""} />
                {catPurr > 0 && (
                  <text x="-16" y="-14" fontSize="15" className="heart-float">💛</text>
                )}
              </g>

              {/* Buzón de recuerdos a la derecha */}
              <g transform="translate(1038, 708)">
                <rect x="-3.5" y="-56" width="7" height="58" rx="2" fill="#826049" />
                <path d="M-18 -56 V-72 A18 16 0 0 1 18 -72 V-56 Z" fill="#6d8761" stroke="#4d6343" strokeWidth="2" />
                <rect x="-18" y="-58" width="36" height="5" rx="1.5" fill="#4d6343" />
                {/* Banderita levantada cuando hay recuerdos */}
                <g transform={`rotate(${keepsakeCount > 0 ? 0 : 75} 14 -64)`}>
                  <line x1="14" y1="-64" x2="14" y2="-84" stroke="#c96553" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="14,-84 26,-80 14,-75" fill="#e07460" />
                </g>
                {keepsakeCount > 0 && (
                  <g transform="translate(0, -96)">
                    <circle cx="0" cy="0" r="11" fill="#f2c14e" stroke="#fff" strokeWidth="2" />
                    <text x="0" y="4" fontSize="11" fontWeight="800" textAnchor="middle" fill="#2b3327">
                      {keepsakeCount}
                    </text>
                  </g>
                )}
              </g>

              {/* Luciérnagas en el jardín de noche */}
              {timeOfDay === "noche" &&
                FIREFLIES.map(([x, y], i) => (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2.6"
                    fill="#ffe899"
                    className="atmosphere-mote"
                    style={{ animationDelay: `${i * -0.9}s` }}
                  />
                ))}

              {/* ==================== ESTRUCTURA DE LA CASA ==================== */}

              {/* Sombra proyectada de la casa en el césped */}
              <ellipse cx="560" cy="718" rx="396" ry="15" fill="#2b3327" opacity="0.16" />

              {/* Chimenea con humo suave */}
              <g>
                <g key={`smoke-${chimneyPuff}`}>
                  <circle cx="834" cy="24" r="10" fill="#ffffff" opacity="0.55" className="house-smoke" />
                  <circle cx="844" cy="14" r="14" fill="#ffffff" opacity="0.4" className="house-smoke" style={{ animationDelay: "0.9s" }} />
                  {chimneyPuff > 0 && (
                    <text x="832" y="28" fontSize="16" textAnchor="middle" className="heart-float">🤍</text>
                  )}
                </g>
                <rect x="812" y="40" width="42" height="96" rx="4" fill="#a87660" stroke="#7d5442" strokeWidth="2" />
                <rect x="806" y="34" width="54" height="12" rx="4" fill="#8f614d" stroke="#6e4939" strokeWidth="2" />
              </g>

              {/* Tejado mansarda / a dos aguas con tejas */}
              <g>
                <path
                  d="M152 226 L308 62 L812 62 L968 226 Z"
                  fill="#bd8b73"
                  stroke="#875d4a"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                {/* Líneas de tejas */}
                <g stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="16 12">
                  <line x1="274" y1="98" x2="846" y2="98" />
                  <line x1="238" y1="136" x2="882" y2="136" />
                  <line x1="202" y1="174" x2="918" y2="174" />
                  <line x1="168" y1="210" x2="952" y2="210" />
                </g>
                {/* Alero de madera */}
                <rect x="148" y="220" width="824" height="14" rx="6" fill="#705342" />
                {/* Marco de madera del ático */}
                <rect x="322" y="86" width="476" height="144" rx="12" fill="#705342" />
              </g>

              {/* Cuerpo principal y muros exteriores de madera/piedra */}
              <rect x="190" y="232" width="740" height="476" rx="6" fill="#6b5140" />

              {/* Cimientos de piedra */}
              <rect x="182" y="698" width="756" height="18" rx="4" fill="#9c9488" stroke="#787166" strokeWidth="2" />
              <g stroke="#787166" strokeWidth="1.4" opacity="0.65">
                {[240, 310, 380, 450, 670, 740, 810, 880].map((x) => (
                  <line key={x} x1={x} y1="698" x2={x} y2="716" />
                ))}
              </g>

              {/* Escalones de entrada al Vestíbulo */}
              <rect x="514" y="700" width="92" height="10" rx="2" fill="#d4c9b8" stroke="#a89e8e" strokeWidth="1.4" />
              <rect x="506" y="710" width="108" height="10" rx="2" fill="#c7bba8" stroke="#9c9181" strokeWidth="1.4" />

              {/* ==================== LAS 10 HABITACIONES EN CORTE ==================== */}
              {HOUSE_SLOTS.map((slot) => {
                const room = ROOMS_BY_SLUG[slot.slug];
                const isHighlighted = highlight ? highlight.has(slot.slug) : false;
                const isFaded = (highlight && !highlight.has(slot.slug)) || (dimmed && !dimmed.has(slot.slug));
                const isCurrent = currentSlug === slot.slug;
                const isDone = Boolean(progress[slot.slug]?.data?.done);

                return (
                  <g key={slot.slug} clipPath={`url(#clip-${slot.slug})`}>
                    <g transform={`translate(${slot.x}, ${slot.y})`}>
                      <HouseRoomInterior room={room} warmLights={warmLights} garden={slot.slug === "jardin" ? garden : undefined} />
                    </g>

                    {/* Resplandor cuando la habitación es la actual o está sugerida */}
                    {isHighlighted && (
                      <rect
                        x={slot.x + 2}
                        y={slot.y + 2}
                        width={slot.w - 4}
                        height={slot.h - 4}
                        rx={slot.slug === "estrellas" ? 6 : 2}
                        fill="#ffe48f"
                        fillOpacity="0.16"
                        stroke="#f2c14e"
                        strokeWidth="5"
                      />
                    )}

                    {isCurrent && !isHighlighted && (
                      <rect
                        x={slot.x + 2}
                        y={slot.y + 2}
                        width={slot.w - 4}
                        height={slot.h - 4}
                        rx={slot.slug === "estrellas" ? 6 : 2}
                        fill="#ffffff"
                        fillOpacity="0.06"
                        stroke="#ffffff"
                        strokeOpacity="0.7"
                        strokeWidth="3"
                      />
                    )}

                    {/* Estrellita dorada si la actividad de la habitación ya se completó */}
                    {isDone && (
                      <g transform={`translate(${slot.x + slot.w - 18}, ${slot.y + 18})`}>
                        <circle cx="0" cy="0" r="10" fill="#f2c14e" stroke="#ffffff" strokeWidth="1.6" />
                        <text x="0" y="4" fontSize="11" fontWeight="800" textAnchor="middle" fill="#2b3327">✓</text>
                      </g>
                    )}

                    {/* Atenuado suave cuando el filtro excluye esta habitación */}
                    {isFaded && (
                      <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h} fill="#1f241c" opacity="0.46" />
                    )}
                  </g>
                );
              })}

              {/* Vigas de madera entre pisos */}
              <g fill="#755846">
                <rect x="190" y="224" width="740" height="12" />
                <rect x="190" y="382" width="740" height="12" />
                <rect x="190" y="540" width="740" height="12" />
              </g>
              <g stroke="#9c7a63" strokeWidth="1.5" opacity="0.45">
                <line x1="196" y1="227" x2="924" y2="227" />
                <line x1="196" y1="385" x2="924" y2="385" />
                <line x1="196" y1="543" x2="924" y2="543" />
              </g>

              {/* Arcos / puertas interiores conectando las habitaciones de cada planta */}
              {[382, 540, 698].map((floorY) =>
                [440, 680].map((wallX) => (
                  <path
                    key={`${floorY}-${wallX}`}
                    d={`M${wallX - 5} ${floorY} V${floorY - 38} A5 5 0 0 1 ${wallX + 5} ${floorY - 38} V${floorY} Z`}
                    fill="#4a372c"
                    opacity="0.72"
                  />
                )),
              )}

              {/* Escalera de mano del ático conectando Respiración ↔ Mirador de Estrellas */}
              <g transform="translate(592, 206)" stroke="#9e7453" strokeWidth="3" strokeLinecap="round">
                <line x1="0" y1="0" x2="0" y2="48" />
                <line x1="18" y1="0" x2="18" y2="48" />
                {[8, 18, 28, 38].map((y) => (
                  <line key={y} x1="0" y1={y} x2="18" y2={y} strokeWidth="2.4" />
                ))}
              </g>

              {/* ==================== PERSONAJE VISITANTE RECORRIENDO LA CASA ==================== */}
              <g
                className="house-visitor"
                style={{
                  transform: `translate(${activeSlot.standX}px, ${activeSlot.standY}px)`,
                }}
              >
                <g key={stepBounce} className={stepBounce > 0 ? "house-visitor-step" : ""}>
                  {/* Sombra en el suelo */}
                  <ellipse cx="0" cy="0" rx="13" ry="4" fill="#000" opacity="0.22" />
                  <g transform={facing === "left" ? "scale(-1, 1)" : undefined}>
                    {/* Brillo cálido del farolillo al atardecer/noche o en el Mirador */}
                    {(warmLights || currentSlug === "estrellas") && (
                      <circle cx="15" cy="-22" r="24" fill="#ffe699" opacity="0.34" className="house-lamp-glow" />
                    )}
                    {/* Cuerpo con capa en tu color elegido */}
                    <path d="M-11 -2 Q-12 -24 0 -28 Q12 -24 11 -2 Z" fill={visitor.color} stroke="#2b3327" strokeWidth="2" strokeLinejoin="round" />
                    {/* Bufanda cálida */}
                    <path d="M-8 -25 Q0 -21 8 -25" fill="none" stroke="#fff8e8" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Cabeza */}
                    <circle cx="0" cy="-36" r="10.5" fill="#f7dec2" stroke="#2b3327" strokeWidth="2" />
                    {/* Ojitos mirando hacia donde camina */}
                    <circle cx="2" cy="-37" r="1.5" fill="#2b3327" />
                    <circle cx="6.5" cy="-37" r="1.5" fill="#2b3327" />
                    <path d="M2 -32.5 q2.5 2 5 0" fill="none" stroke="#9e5a4f" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Farolillo en la mano cuando baja la luz */}
                    {(warmLights || currentSlug === "estrellas") && (
                      <g transform="translate(15, -22)">
                        <rect x="-3.5" y="-4" width="7" height="8" rx="2" fill="#ffe58a" stroke="#6e4f35" strokeWidth="1.4" />
                        <line x1="0" y1="-4" x2="-3" y2="-8" stroke="#6e4f35" strokeWidth="1.4" />
                      </g>
                    )}
                  </g>
                </g>
              </g>
            </svg>

            {/* ==================== CAPA 2: BOTONES DEL EXTERIOR (CIELO Y JARDÍN) ==================== */}
            <button
              type="button"
              aria-label={`Cambiar el momento del día (ahora es ${timeOfDay}). Toca el cielo para cambiar entre día, atardecer y noche.`}
              title="Cambiar día · atardecer · noche"
              onClick={() => {
                onCycleTime?.();
                play(timeOfDay === "dia" ? 440 : timeOfDay === "tarde" ? 329.63 : 587.33, "bell");
                showWhisper(
                  timeOfDay === "dia"
                    ? "Cae la tarde y se encienden las luces cálidas de la casa."
                    : timeOfDay === "tarde"
                      ? "Llega la noche serena: salen las estrellas y las luciérnagas."
                      : "Amanece un día nuevo sobre Refugio.",
                );
              }}
              className="house-hotspot absolute cursor-pointer rounded-full"
              style={{ left: "6.5%", top: "6%", width: "10%", height: "14%" }}
            />

            <button
              type="button"
              aria-label="Tocar la chimenea"
              title="Chimenea"
              onClick={() => {
                setChimneyPuff((n) => n + 1);
                play(261.63, "soft");
                showWhisper("Sube un poco de humo tibio desde la chimenea.");
              }}
              className="house-hotspot absolute cursor-pointer rounded-xl"
              style={{ left: "71.8%", top: "3.5%", width: "5.4%", height: "13%" }}
            />

            <button
              type="button"
              aria-label="Saludar al pajarito del árbol"
              title="Pajarito del jardín"
              onClick={() => {
                setBirdSing((n) => n + 1);
                play(783.99, "flute");
                window.setTimeout(() => play(987.77, "flute"), 110);
                showWhisper("El pajarito te saluda desde la rama.");
              }}
              className="house-hotspot absolute cursor-pointer rounded-full"
              style={{ left: "3%", top: "61%", width: "10%", height: "14%" }}
            />

            <button
              type="button"
              aria-label={isLampLit ? "Apagar el farol del jardín" : "Encender el farol del jardín"}
              aria-pressed={isLampLit}
              title={isLampLit ? "Apagar farol" : "Encender farol"}
              onClick={() => {
                const next = !isLampLit;
                setYardLampOn(next);
                play(next ? 587.33 : 392, "pluck");
                showWhisper(next ? "El farol del jardín ilumina el camino." : "El farol del jardín descansa apagado.");
              }}
              className="house-hotspot absolute cursor-pointer rounded-full"
              style={{ left: "12.5%", top: "75%", width: "3.8%", height: "15%" }}
            />

            <button
              type="button"
              aria-label="Acariciar al gato del jardín"
              title="Gato dormido"
              onClick={() => {
                setCatPurr((n) => n + 1);
                play(196, "soft");
                showWhisper("El gato ronronea despacito junto al invernadero.");
              }}
              className="house-hotspot absolute cursor-pointer rounded-full"
              style={{ left: "83.6%", top: "86%", width: "5.2%", height: "7.5%" }}
            />

            <button
              type="button"
              aria-label={
                keepsakeCount > 0
                  ? `Abrir el buzón de recuerdos (${keepsakeCount} guardados)`
                  : "Buzón de recuerdos"
              }
              title="Buzón de recuerdos"
              onClick={() => {
                play(659.25, "bell");
                onMailboxClick?.();
                showWhisper(
                  keepsakeCount > 0
                    ? `Tienes ${keepsakeCount} ${keepsakeCount === 1 ? "recuerdo" : "recuerdos"} guardados en tu buzón.`
                    : "Aquí se guardan los recuerdos de las actividades que termines.",
                );
              }}
              className="house-hotspot absolute cursor-pointer rounded-xl"
              style={{ left: "90%", top: "76%", width: "5.8%", height: "15%" }}
            />

            {/* ==================== CAPA 3: PUERTAS INTERACTIVAS DE LAS 10 HABITACIONES ==================== */}
            <nav aria-label="Habitaciones de la casa">
              {HOUSE_SLOTS.map((slot) => {
                const room = ROOMS_BY_SLUG[slot.slug];
                const isSuggested = highlight ? highlight.has(slot.slug) : false;
                const isCurrent = currentSlug === slot.slug;
                const darkPill = Boolean(room.dark) || timeOfDay === "noche";

                return (
                  <a
                    key={slot.slug}
                    href={roomHref(slot.slug)}
                    aria-describedby={isSuggested ? "map-suggested" : undefined}
                    aria-label={`Entrar a ${room.name}. ${room.category}. ${ageShort(room.minAge)}. ${room.description}`}
                    onMouseEnter={() => walkTo(slot.slug, false)}
                    onFocus={() => walkTo(slot.slug, false)}
                    onClick={() => play(523.25, "pluck")}
                    className={`house-room-link group absolute flex flex-col justify-between rounded-md p-1 sm:p-1.5 ${
                      isCurrent ? "is-current" : ""
                    }`}
                    style={{
                      left: `${(slot.x / W) * 100}%`,
                      top: `${(slot.y / H) * 100}%`,
                      width: `${(slot.w / W) * 100}%`,
                      height: `${(slot.h / H) * 100}%`,
                    }}
                  >
                    {/* Placa compacta arriba de cada habitación (deja libre el interior ilustrado) */}
                    <span className="flex items-center justify-between gap-1">
                      <span
                        className={`inline-flex max-w-full items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] leading-tight font-extrabold shadow-sm backdrop-blur-[2px] transition-transform group-hover:scale-[1.03] sm:px-2.5 sm:py-0.5 sm:text-xs ${
                          darkPill
                            ? "bg-[#1a2038]/82 text-[#eef2ff] ring-1 ring-white/20"
                            : "bg-white/88 text-[#2b3327] ring-1 ring-black/10"
                        }`}
                      >
                        <span aria-hidden="true" className="text-xs sm:text-sm">
                          {room.emoji}
                        </span>
                        <span className="truncate">{room.name}</span>
                      </span>
                    </span>

                    {/* Etiqueta flotante de "Entrar →" que aparece al pasar el ratón o enfocar */}
                    <span className="pointer-events-none self-end opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="hidden items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-extrabold text-accent-ink shadow sm:inline-flex">
                        Entrar →
                      </span>
                    </span>
                  </a>
                );
              })}
            </nav>

            {/* Botón discreto de acercar en móvil (arriba a la derecha, sobre el cielo libre) */}
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              aria-pressed={zoomed}
              className="absolute top-2 right-2 z-20 inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full border border-line bg-surface/92 px-3 text-xs font-extrabold text-ink shadow backdrop-blur sm:hidden"
            >
              {zoomed ? "🔍 Ver completa" : "🔍 Acercar casa"}
            </button>
          </div>
        </div>

        {/* ==================== BARRA DE RECORRIDO E INSPECCIÓN DE LA HABITACIÓN ==================== */}
        <div className="border-t border-line bg-surface px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Habitación actual donde está parado el visitante */}
            <div className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line text-2xl shadow-xs"
                style={{ backgroundColor: activeRoom.ambience.wall }}
              >
                {activeRoom.emoji}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="rounded-full bg-soft px-2 py-0.5 text-[11px] font-extrabold tracking-wide text-muted uppercase">
                    {activeSlot.floorLabel}
                  </span>
                  <h2 className="text-base leading-tight font-extrabold sm:text-lg">{activeRoom.name}</h2>
                  <span className="text-xs font-bold text-muted">· {activeRoom.category}</span>
                  <span className="rounded-full border border-line bg-bg px-2 py-0.5 text-xs font-bold text-muted">
                    {ageShort(activeRoom.minAge)}
                  </span>
                  {activeProg?.data?.done && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-ink">
                      ✓ Actividad hecha
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  <span className="font-bold text-ink">{activeRoom.description}</span>{" "}
                  <span className="hidden sm:inline">{activeRoom.welcome}</span>
                </p>
                {/* Vista rápida de objetos dentro */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <span className="font-bold">Dentro:</span>
                  {activeRoom.objects.map((o) => {
                    const def = OBJECTS[o.kind];
                    if (!def) return null;
                    return (
                      <span
                        key={o.kind}
                        className="inline-flex items-center gap-1 rounded-full bg-soft px-2 py-0.5 font-semibold text-ink"
                      >
                        {def.emoji && <span aria-hidden="true">{def.emoji}</span>}
                        {def.label}
                      </span>
                    );
                  })}
                  {activeActivity && !activeProg?.data?.done && (activeProg?.activityStep ?? 0) > 0 && (
                    <span className="rounded-full bg-soft px-2 py-0.5 font-bold text-primary">
                      Etapa {(activeProg?.activityStep ?? 0) + 1} de {activeActivity.steps.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controles para recorrer la casa paso a paso + entrar */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div role="group" aria-label="Recorrer la casa paso a paso" className="flex items-center gap-1 rounded-full border border-line bg-soft p-1">
                <button
                  type="button"
                  aria-label="Ir a la habitación de la izquierda"
                  disabled={!activeSlot.neighbors.left}
                  onClick={() => activeSlot.neighbors.left && walkTo(activeSlot.neighbors.left, true)}
                  className="grid size-9 cursor-pointer place-items-center rounded-full bg-surface text-sm font-extrabold hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Subir al piso de arriba"
                  disabled={!activeSlot.neighbors.up}
                  onClick={() => activeSlot.neighbors.up && walkTo(activeSlot.neighbors.up, true)}
                  className="grid size-9 cursor-pointer place-items-center rounded-full bg-surface text-sm font-extrabold hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Bajar al piso de abajo"
                  disabled={!activeSlot.neighbors.down}
                  onClick={() => activeSlot.neighbors.down && walkTo(activeSlot.neighbors.down, true)}
                  className="grid size-9 cursor-pointer place-items-center rounded-full bg-surface text-sm font-extrabold hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Ir a la habitación de la derecha"
                  disabled={!activeSlot.neighbors.right}
                  onClick={() => activeSlot.neighbors.right && walkTo(activeSlot.neighbors.right, true)}
                  className="grid size-9 cursor-pointer place-items-center rounded-full bg-surface text-sm font-extrabold hover:border-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  →
                </button>
              </div>

              <a href={roomHref(activeRoom.slug)} className="btn btn-primary px-5">
                Entrar a {activeRoom.name}
                <Icon name="arrow-right" size={18} />
              </a>
            </div>
          </div>

          {/* Susurro sutil cuando tocas detalles del exterior (chimenea, sol, gato, pajarito...) */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-2 text-xs text-muted">
            <p role="status" className="font-semibold">
              {whisper || (comfort.reduceMotion
                ? "Toca cualquier habitación para entrar, o usa las flechas para recorrer la casa."
                : "Toca una habitación para entrar, recorre con las flechas o toca el sol, la chimenea, el árbol y el gato.")}
            </p>
            <span id="map-suggested" className="sr-only">
              Sugerida para lo que elegiste.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
