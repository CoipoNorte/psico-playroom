import { useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { useComfort, useSound } from "../lib/comfort";
import { OBJECTS, type Room } from "../lib/rooms-data";
import { getExperience, saveExperience, type Point } from "../lib/store";
import { InteractiveObject } from "./InteractiveObject";
import { AMBIENT_COPY, RoomAtmosphere, type AmbientState } from "./RoomAtmosphere";
import { RoomDecor } from "./RoomDecor";

interface Props {
  room: Room;
  positions: Record<string, Point>;
  counts: Record<string, number>;
  activeKind: string | null;
  bursts: Record<string, number>;
  onActivate: (kind: string) => void;
  onMove: (kind: string, p: Point) => void;
  guidedKind?: string;
}

const STARS: [number, number, number][] = [
  [48, 120, 1.6], [150, 70, 1.3], [110, 170, 1.2], [250, 75, 1.4], [330, 150, 1.6],
  [300, 100, 1.1], [170, 110, 1], [36, 160, 1.1], [355, 190, 1.2], [230, 120, 1],
];

/** Escena 2D isométrica: dos paredes, suelo en perspectiva, ventana y alfombra elíptica. */
export function RoomScene({ room, positions, counts, activeKind, bursts, onActivate, onMove, guidedKind }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const rippleTimer = useRef<number | null>(null);
  const hintId = useId();
  const { wall, floor, rug } = room.ambience;
  const dark = Boolean(room.dark);
  const play = useSound();
  const [ambient, setAmbient] = useState<AmbientState>(() =>
    getExperience(`ambience:${room.slug}`, { windowOpen: true, detailOn: true }),
  );
  const [lastAction, setLastAction] = useState("");
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const { comfort } = useComfort();
  const copy = AMBIENT_COPY[room.slug];

  useEffect(() => () => {
    if (rippleTimer.current !== null) window.clearTimeout(rippleTimer.current);
  }, []);

  function toggle(which: keyof AmbientState) {
    const next = { ...ambient, [which]: !ambient[which] };
    setAmbient(next);
    saveExperience(`ambience:${room.slug}`, next);
    play(which === "windowOpen" ? 392 : 523.25, "soft");
    setLastAction(which === "detailOn" ? copy.message[next.detailOn ? 0 : 1] : next.windowOpen ? "Entra aire nuevo en la habitación." : "La ventana queda cerrada y tranquila.");
  }

  function touchScene(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (!comfort.reduceMotion) {
      setRipple({ x, y, id: Date.now() });
      if (rippleTimer.current !== null) window.clearTimeout(rippleTimer.current);
      rippleTimer.current = window.setTimeout(() => setRipple(null), 900);
    }
    toggle(x > 0.15 && x < 0.34 && y > 0.26 && y < 0.55 ? "windowOpen" : "detailOn");
  }

  function moveScene(e: PointerEvent<HTMLDivElement>) {
    if (comfort.reduceMotion || e.pointerType === "touch") return;
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    sceneRef.current?.style.setProperty("--scene-x", `${((e.clientX - rect.left) / rect.width - 0.5) * -3}px`);
    sceneRef.current?.style.setProperty("--scene-y", `${((e.clientY - rect.top) / rect.height - 0.5) * -3}px`);
  }

  return (
    <div className="rounded-3xl border border-line p-2 shadow-sm sm:p-3" style={{ backgroundColor: room.ambience.wall }}>
      <div
        ref={sceneRef}
        role="group"
        aria-label={`Escena de ${room.name}. Contiene ${room.objects.length} objetos interactivos.`}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
        style={{ background: dark ? "#161a2c" : "var(--soft)" }}
        onClick={touchScene}
        onPointerMove={moveScene}
        onPointerLeave={() => {
          sceneRef.current?.style.setProperty("--scene-x", "0px");
          sceneRef.current?.style.setProperty("--scene-y", "0px");
        }}
      >
        <svg viewBox="0 0 400 300" className="room-illustration absolute inset-0 size-full" aria-hidden="true" focusable="false">
          {/* Paredes */}
          <polygon points="20,215 200,140 200,25 20,100" fill={wall} />
          <polygon points="200,140 380,215 380,100 200,25" fill={wall} />
          <polygon points="200,140 380,215 380,100 200,25" fill="#000" opacity={dark ? 0.16 : 0.055} />
          <line x1="200" y1="25" x2="200" y2="140" stroke="#000" strokeOpacity="0.1" strokeWidth="1.5" />

          {dark &&
            STARS.map(([x, y, r], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={r}
                fill="#f6efc8"
                className="twinkle"
                style={{ animationDelay: `${(i % 5) * 0.7}s` }}
              />
            ))}

          {/* Ventana en la pared izquierda */}
          <polygon points="62,108.5 128,81 128,133 62,160.5" fill={dark ? "#11142a" : ambient.windowOpen ? "#d3e9f0" : "#c5d2d0"} />
          {dark ? (
            <g fill="#f6efc8">
              <circle cx="78" cy="118" r="1.6" />
              <circle cx="104" cy="100" r="1.2" />
              <circle cx="116" cy="122" r="1.4" />
              <circle cx="90" cy="140" r="1" />
            </g>
          ) : (
            <polygon points="62,146 90,128 128,118 128,133 62,160.5" fill="#bcd9b4" opacity="0.8" />
          )}
          {!ambient.windowOpen && (
            <g>
              <polygon points="62,108.5 128,81 128,133 62,160.5" fill={dark ? "#424966" : "#d5c2a7"} opacity="0.94" />
              <path d="M62 121.5 128 94 M62 134.5 128 107 M62 147.5 128 120" fill="none" stroke={dark ? "#7981a1" : "#aa9275"} strokeWidth="2" />
            </g>
          )}
          <g fill="none" stroke={dark ? "#5a6190" : "#ffffff"} strokeWidth="4" strokeLinejoin="round">
            <polygon points="62,108.5 128,81 128,133 62,160.5" />
            <path d="M95 94.75V146.75M62 134.5 128 107" strokeWidth="2.5" />
          </g>

          {/* Suelo */}
          <polygon points="20,215 200,290 200,298 20,223" fill={floor} />
          <polygon points="20,215 200,290 200,298 20,223" fill="#000" opacity="0.18" />
          <polygon points="380,215 200,290 200,298 380,223" fill={floor} />
          <polygon points="380,215 200,290 200,298 380,223" fill="#000" opacity="0.28" />
          <polygon points="20,215 200,140 380,215 200,290" fill={floor} />
          <g stroke="#000" strokeOpacity="0.07" strokeWidth="1.2">
            <line x1="56" y1="230" x2="236" y2="155" />
            <line x1="92" y1="245" x2="272" y2="170" />
            <line x1="128" y1="260" x2="308" y2="185" />
            <line x1="164" y1="275" x2="344" y2="200" />
          </g>
          {/* Zócalo */}
          <path
            d="M20 215 200 140 380 215"
            fill="none"
            stroke={dark ? "#555c8a" : "#ffffff"}
            strokeOpacity={dark ? 0.6 : 0.7}
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Alfombra elíptica */}
          <ellipse cx="200" cy="218" rx="108" ry="45" fill={rug} />
          <ellipse
            cx="200"
            cy="218"
            rx="92"
            ry="37"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.4"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
          <RoomDecor slug={room.slug} active={ambient.detailOn} />
          <RoomAtmosphere slug={room.slug} state={ambient} />
        </svg>

        {ripple && <span key={ripple.id} aria-hidden="true" className="scene-ripple pointer-events-none absolute z-[8] size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" style={{ left: `${ripple.x * 100}%`, top: `${ripple.y * 100}%` }} />}

        <button
          type="button"
          aria-label={ambient.windowOpen ? copy.window[1] : copy.window[0]}
          aria-pressed={ambient.windowOpen}
          onClick={() => toggle("windowOpen")}
          className="scene-window absolute z-10 cursor-pointer rounded-xl"
          style={{ left: "15.5%", top: "27%", width: "17%", height: "28%" }}
        />

        {room.objects.map((obj) => {
          const def = OBJECTS[obj.kind];
          if (!def) return null;
          let emoji = def.emoji;
          if (obj.kind === "maceta" && def.stages) {
            const garden = getExperience<{ seed: string | null; growth: number }>("garden:main", { seed: null, growth: 0 });
            emoji = garden.seed
              ? def.stages[Math.min(def.stages.length - 1, Math.floor(Math.max(0, garden.growth) / 28))]
              : "🪴";
          } else if (def.stages) {
            const uses = counts[def.stageBy ?? obj.kind] ?? 0;
            emoji = def.stages[Math.min(def.stages.length - 1, Math.floor(uses / 2))];
          }
          return (
            <InteractiveObject
              key={obj.kind}
              def={def}
              emoji={emoji}
              position={positions[obj.kind] ?? { x: obj.x, y: obj.y }}
              burst={bursts[obj.kind] ?? 0}
              active={activeKind === obj.kind}
              guided={guidedKind === obj.kind}
              sceneRef={sceneRef}
              hintId={hintId}
              onActivate={() => onActivate(obj.kind)}
              onMove={(p) => onMove(obj.kind, p)}
            />
          );
        })}
      </div>
      <div className="flex flex-col gap-2 px-2 pt-2.5 pb-1 sm:flex-row sm:items-center">
        <p id={hintId} className="w-full text-sm text-muted sm:min-w-0 sm:flex-1">
          Toca un objeto para usarlo. Arrástralo para moverlo. La ventana y el ambiente también responden al tacto.
          Con el teclado, Enter abre y las flechas mueven.
        </p>
        <div className="flex w-full flex-wrap gap-1.5 sm:w-auto sm:justify-end">
          <button type="button" aria-pressed={ambient.windowOpen} className="ambient-control" onClick={() => toggle("windowOpen")}>
            {ambient.windowOpen ? copy.window[1] : copy.window[0]}
          </button>
          <button type="button" aria-pressed={ambient.detailOn} className="ambient-control" onClick={() => toggle("detailOn")}>
            {ambient.detailOn ? copy.detail[1] : copy.detail[0]}
          </button>
        </div>
      </div>
      <p role="status" className="sr-only">{lastAction}</p>
    </div>
  );
}
