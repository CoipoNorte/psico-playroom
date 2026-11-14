// Interiores en miniatura de las 10 habitaciones para la casa completa en corte.
// Cada habitación principal ocupa un espacio local de 232 × 146 (suelo en y = 132..146).
// El Mirador de Estrellas (ático) ocupa un espacio local de 460 × 130 (suelo en y = 116..130).

import type { ReactNode } from "react";
import type { Room } from "../lib/rooms-data";

export interface InteriorProps {
  room: Room;
  /** Las lámparas interiores se encienden con más calidez al atardecer y de noche. */
  warmLights: boolean;
  /** Nivel real de crecimiento de la planta del jardín (0..100) y semilla elegida. */
  garden?: { seed: string | null; growth: number };
}

/** Fondo común de una habitación estándar (232 × 146): pared, zócalo, suelo de madera y alfombra. */
function BaseRoom({
  wall,
  floor,
  rug,
  warmLights,
  windowType = "classic",
  children,
}: {
  wall: string;
  floor: string;
  rug: string;
  warmLights: boolean;
  windowType?: "classic" | "none" | "greenhouse";
  children: ReactNode;
}) {
  return (
    <g>
      {/* Pared */}
      <rect x="0" y="0" width="232" height="128" fill={wall} />
      {/* Sombra sutil bajo el techo */}
      <rect x="0" y="0" width="232" height="10" fill="#000" opacity="0.06" />
      {/* Papel pintado sutil en la franja baja (zócalo / arrimadero) */}
      <rect x="0" y="96" width="232" height="32" fill="#000" opacity="0.035" />
      <line x1="0" y1="96" x2="232" y2="96" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.5" />

      {/* Ventana trasera opcional */}
      {windowType === "classic" && (
        <g>
          <rect x="18" y="24" width="44" height="48" rx="4" fill={warmLights ? "#2c3759" : "#d4eaf2"} stroke="#fff" strokeWidth="3.5" />
          {!warmLights ? (
            <path d="M20 58 Q35 46 60 52 L60 70 L20 70 Z" fill="#b8d4ac" opacity="0.85" />
          ) : (
            <g fill="#f6efc8">
              <circle cx="30" cy="36" r="1.3" />
              <circle cx="48" cy="42" r="1" />
              <circle cx="36" cy="54" r="1.2" />
            </g>
          )}
          <line x1="40" y1="24" x2="40" y2="72" stroke="#fff" strokeWidth="2.5" />
          <line x1="18" y1="48" x2="62" y2="48" stroke="#fff" strokeWidth="2.5" />
          <rect x="15" y="72" width="50" height="4" rx="1.5" fill="#fff" opacity="0.9" />
        </g>
      )}

      {/* Invernadero acristalado */}
      {windowType === "greenhouse" && (
        <g>
          <rect x="6" y="8" width="220" height="116" rx="4" fill={warmLights ? "#293948" : "#d9f0ea"} opacity={warmLights ? 0.52 : 0.72} />
          <g stroke="#ffffff" strokeOpacity="0.72" strokeWidth="2.4">
            <line x1="58" y1="8" x2="58" y2="124" />
            <line x1="116" y1="8" x2="116" y2="124" />
            <line x1="174" y1="8" x2="174" y2="124" />
            <line x1="6" y1="54" x2="226" y2="54" />
            <line x1="6" y1="98" x2="226" y2="98" />
          </g>
        </g>
      )}

      {/* Suelo y tablas */}
      <rect x="0" y="128" width="232" height="18" fill={floor} />
      <line x1="0" y1="128" x2="232" y2="128" stroke="#000" strokeOpacity="0.12" strokeWidth="1.5" />
      <g stroke="#000" strokeOpacity="0.08" strokeWidth="1">
        <line x1="46" y1="128" x2="36" y2="146" />
        <line x1="94" y1="128" x2="90" y2="146" />
        <line x1="142" y1="128" x2="146" y2="146" />
        <line x1="190" y1="128" x2="200" y2="146" />
      </g>

      {/* Alfombra */}
      <ellipse cx="116" cy="137" rx="70" ry="7" fill={rug} opacity="0.92" />
      <ellipse cx="116" cy="137" rx="58" ry="4.5" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="4 4" />

      {/* Luz cálida general al atardecer / noche */}
      {warmLights && (
        <ellipse cx="116" cy="54" rx="108" ry="66" fill="#ffe4a0" opacity="0.2" className="house-lamp-glow" />
      )}

      {children}
    </g>
  );
}

/** Ático — Mirador de Estrellas (460 × 130) */
function EstrellasInterior({ warmLights }: { warmLights: boolean }) {
  return (
    <g>
      {/* Fondo nocturno siempre sereno */}
      <rect x="0" y="0" width="460" height="114" fill="#232a49" />
      <rect x="0" y="114" width="460" height="16" fill="#1d223c" />
      <ellipse cx="230" cy="122" rx="132" ry="7" fill="#464d7d" opacity="0.85" />

      {/* Estrellas en el cielo del techo */}
      {[
        [44, 24, 1.4], [92, 16, 1.1], [150, 28, 1.6], [312, 24, 1.5], [374, 18, 1.2], [418, 36, 1.5], [70, 56, 1], [396, 62, 1.1],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff3c8" className="twinkle" style={{ animationDelay: `${i * 0.45}s` }} />
      ))}

      {/* Gran ventana circular (tragaluz con luna creciente) */}
      <g>
        <circle cx="230" cy="52" r="35" fill="#10152b" stroke="#646d9e" strokeWidth="4.5" />
        {/* Luna creciente */}
        <path d="M235 31 a19 19 0 1 0 14 31 a14 14 0 1 1 -14 -31 z" fill="#ffe694" />
        {/* Constelación mini en el tragaluz */}
        <polyline points="206,56 214,48 220,58 210,68" fill="none" stroke="#a6b3e8" strokeWidth="0.9" opacity="0.65" />
        <circle cx="206" cy="56" r="1.4" fill="#fff6d6" />
        <circle cx="214" cy="48" r="1.4" fill="#fff6d6" />
        <circle cx="220" cy="58" r="1.4" fill="#fff6d6" />
        <circle cx="210" cy="68" r="1.2" fill="#fff6d6" />
        {/* Cruz del marco */}
        <line x1="195" y1="52" x2="265" y2="52" stroke="#646d9e" strokeWidth="2" opacity="0.7" />
        <line x1="230" y1="17" x2="230" y2="87" stroke="#646d9e" strokeWidth="2" opacity="0.7" />
      </g>

      {/* Guirnalda de lucecitas */}
      <path d="M12 18 Q115 44 230 14 Q345 44 448 18" fill="none" stroke="#6872a6" strokeWidth="1.2" />
      {[34, 72, 114, 158, 302, 346, 388, 426].map((x, i) => {
        const y = i < 4 ? 22 + Math.sin(((i + 1) / 5) * Math.PI) * 14 : 22 + Math.sin(((i - 3) / 5) * Math.PI) * 14;
        return (
          <circle
            key={x}
            cx={x}
            cy={y}
            r="3"
            fill={["#ffe799", "#f4b9cd", "#9ed8cc"][i % 3]}
            className="twinkle"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
        );
      })}

      {/* Telescopio sobre trípode (izquierda) */}
      <g transform="translate(106, 72)">
        <line x1="0" y1="16" x2="-12" y2="44" stroke="#8f98c4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="16" x2="12" y2="44" stroke="#8f98c4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="16" x2="0" y2="45" stroke="#757ea8" strokeWidth="2.2" strokeLinecap="round" />
        <g transform="rotate(-26 0 14)">
          <rect x="-24" y="9" width="44" height="10" rx="3" fill="#dce2f5" stroke="#5b638a" strokeWidth="1.5" />
          <rect x="-28" y="8" width="7" height="12" rx="1.5" fill="#5b638a" />
          <rect x="18" y="11" width="9" height="6" rx="1.5" fill="#7c85b0" />
        </g>
      </g>

      {/* Planetario / Saturno móvil colgando (derecha) */}
      <g className="bob" transform="translate(342, 54)">
        <line x1="0" y1="-34" x2="0" y2="-10" stroke="#7a84b5" strokeWidth="1.2" />
        <ellipse cx="0" cy="0" rx="22" ry="6" fill="none" stroke="#e9d29c" strokeWidth="2.6" transform="rotate(-14)" />
        <circle cx="0" cy="0" r="10.5" fill="#e6c88a" />
        <path d="M-21 3 A22 6 0 0 0 21 -3" fill="none" stroke="#f5e3b8" strokeWidth="2.4" transform="rotate(-14)" />
      </g>

      {/* Futón con almohada y manta lila */}
      <g transform="translate(226, 98)">
        <rect x="-46" y="4" width="92" height="14" rx="5" fill="#3a4370" stroke="#556094" strokeWidth="1.5" />
        <ellipse cx="-26" cy="2" rx="16" ry="7" fill="#d9def7" />
        <rect x="2" y="-2" width="32" height="14" rx="5" fill="#b49bc9" stroke="#8d74a3" strokeWidth="1.5" />
        <line x1="6" y1="5" x2="30" y2="5" stroke="#fff" strokeOpacity="0.45" strokeDasharray="3 3" />
      </g>

      {/* Mesita + lámpara de noche encendida */}
      <g transform="translate(376, 86)">
        <ellipse cx="14" cy="-2" rx="26" ry="20" fill="#ffdf8a" opacity={warmLights ? 0.34 : 0.22} className="house-lamp-glow" />
        <rect x="0" y="10" width="28" height="20" rx="3" fill="#5e4b40" />
        <path d="M6 10 Q14 -6 22 10 Z" fill="#f7c865" stroke="#c9953c" strokeWidth="1.4" />
        <circle cx="14" cy="4" r="3" fill="#fff7d6" />
      </g>
    </g>
  );
}

/** Piso 3 Izquierda — Biblioteca Serena */
function LecturaInterior({ room, warmLights }: InteriorProps) {
  const spines = ["#8d9c7a", "#c98b73", "#8298ad", "#9e88ad", "#d4b46e", "#b57b66", "#6c8c6b"];
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights}>
      {/* Estantería alta llena de libros */}
      <g transform="translate(132, 16)">
        <rect x="0" y="0" width="84" height="112" rx="3" fill="#9a755c" stroke="#755642" strokeWidth="2" />
        {[24, 52, 80, 106].map((y, row) => (
          <g key={y}>
            <rect x="4" y={y - 21} width="76" height="21" fill="#7b5c48" opacity="0.45" />
            {Array.from({ length: 8 }, (_, i) => {
              const h = 15 + ((i * 5 + row * 3) % 6);
              return (
                <rect
                  key={i}
                  x={6 + i * 9}
                  y={y - h}
                  width="7.5"
                  height={h}
                  rx="1"
                  fill={spines[(i + row * 2) % spines.length]}
                />
              );
            })}
            <rect x="2" y={y} width="80" height="3.5" fill="#755642" />
          </g>
        ))}
      </g>

      {/* Lámpara de pie cálida */}
      <g transform="translate(106, 44)">
        <ellipse cx="0" cy="14" rx="28" ry="22" fill="#ffe29a" opacity={warmLights ? 0.45 : 0.18} className="house-lamp-glow" />
        <line x1="0" y1="16" x2="0" y2="84" stroke="#6c5749" strokeWidth="2.6" />
        <ellipse cx="0" cy="84" rx="10" ry="3" fill="#6c5749" />
        <path d="M-12 18 L-7 2 L7 2 L12 18 Z" fill="#f5d999" stroke="#bd9079" strokeWidth="1.5" />
      </g>

      {/* Butaca acogedora */}
      <g transform="translate(22, 78)">
        <rect x="6" y="4" width="46" height="32" rx="10" fill="#6d92ad" stroke="#51718a" strokeWidth="1.8" />
        <rect x="0" y="20" width="12" height="26" rx="5" fill="#5e829c" />
        <rect x="46" y="20" width="12" height="26" rx="5" fill="#5e829c" />
        <rect x="8" y="28" width="42" height="18" rx="6" fill="#82a6bf" />
        <line x1="10" y1="46" x2="10" y2="52" stroke="#6c5749" strokeWidth="3" strokeLinecap="round" />
        <line x1="48" y1="46" x2="48" y2="52" stroke="#6c5749" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Libro abierto en la alfombra */}
      <g transform="translate(86, 120)">
        <path d="M0 10 Q10 4 18 10 Q26 4 36 10 L34 17 Q26 12 18 17 Q10 12 2 17 Z" fill="#fffdf6" stroke="#c78c73" strokeWidth="1.5" />
        <line x1="18" y1="10" x2="18" y2="17" stroke="#c78c73" strokeWidth="1.2" />
      </g>
    </BaseRoom>
  );
}

/** Piso 3 Centro — Sala de Respiración */
function RespiracionInterior({ room, warmLights }: InteriorProps) {
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights}>
      {/* Círculos concéntricos que respiran en la pared */}
      <g transform="translate(132, 54)">
        {[30, 21, 12].map((r, i) => (
          <circle
            key={r}
            cx="0"
            cy="0"
            r={r}
            fill="none"
            stroke="#7faeb8"
            strokeWidth="2"
            opacity={0.35 + i * 0.18}
            className="breathe"
            style={{ transformOrigin: "0px 0px", animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </g>

      {/* Planta colgante en macramé */}
      <g transform="translate(194, 0)" className="house-sway">
        <line x1="0" y1="0" x2="-6" y2="26" stroke="#b9a487" strokeWidth="1.2" />
        <line x1="0" y1="0" x2="6" y2="26" stroke="#b9a487" strokeWidth="1.2" />
        <path d="M-9 26 h18 l-3 12 h-12 z" fill="#f4ebda" stroke="#c4b299" strokeWidth="1.2" />
        <ellipse cx="-6" cy="22" rx="6" ry="10" fill="#77a66a" transform="rotate(-24 -6 22)" />
        <ellipse cx="6" cy="22" rx="6" ry="10" fill="#639157" transform="rotate(24 6 22)" />
        <ellipse cx="0" cy="18" rx="5" ry="10" fill="#8bb87d" />
      </g>

      {/* Burbujas flotando */}
      <g className="bob">
        <circle cx="62" cy="86" r="10" fill="#ffffff" fillOpacity="0.45" stroke="#85b5c2" strokeWidth="1.5" />
        <circle cx="58" cy="82" r="2.5" fill="#fff" />
        <circle cx="80" cy="70" r="6.5" fill="#ffffff" fillOpacity="0.45" stroke="#85b5c2" strokeWidth="1.3" />
        <circle cx="76" cy="96" r="4.5" fill="#ffffff" fillOpacity="0.45" stroke="#85b5c2" strokeWidth="1.1" />
      </g>

      {/* Esterilla de respiración + vela encendida */}
      <rect x="86" y="121" width="76" height="10" rx="5" fill="#9bc2b3" opacity="0.9" />
      <g transform="translate(124, 96)">
        <ellipse cx="0" cy="0" rx="14" ry="12" fill="#ffd97d" opacity={warmLights ? 0.42 : 0.2} className="house-lamp-glow" />
        <rect x="-5" y="6" width="10" height="22" rx="2" fill="#fff7e6" stroke="#d9c6a3" strokeWidth="1.2" />
        <path d="M0 -4 C-4 2 -4 6 0 7 C4 6 4 2 0 -4 Z" fill="#f7a83a" className="flame" />
      </g>

      {/* Reloj de arena sobre cojín */}
      <g transform="translate(182, 102)">
        <ellipse cx="0" cy="26" rx="14" ry="5" fill="#d9c4e3" />
        <rect x="-7" y="4" width="14" height="3" rx="1" fill="#8f6c5a" />
        <rect x="-7" y="21" width="14" height="3" rx="1" fill="#8f6c5a" />
        <path d="M-5 7 L5 7 L1 14 L5 21 L-5 21 L-1 14 Z" fill="#e5f2f5" stroke="#97b4bd" strokeWidth="1.1" />
        <polygon points="-3,19 3,19 0,15" fill="#e4b654" />
      </g>
    </BaseRoom>
  );
}

/** Piso 3 Derecha — Sala de Instrumentos */
function InstrumentosInterior({ room, warmLights }: InteriorProps) {
  const keys = ["#e88a7a", "#f0b765", "#efd96b", "#9ccf8f", "#7fc4c9"];
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights}>
      {/* Pentagrama con notas flotando */}
      <g transform="translate(74, 24)">
        {[0, 5, 10, 15, 20].map((y) => (
          <line key={y} x1="0" y1={y} x2="66" y2={y} stroke="#8f7ca1" strokeOpacity="0.55" strokeWidth="1" />
        ))}
        <text x="10" y="14" fontSize="14" fill="#6b5680" className="bob">♪</text>
        <text x="34" y="10" fontSize="15" fill="#6b5680" className="bob" style={{ animationDelay: "0.5s" }}>♫</text>
        <text x="54" y="18" fontSize="12" fill="#6b5680" className="bob" style={{ animationDelay: "1s" }}>♩</text>
      </g>

      {/* Campana colgante */}
      <g transform="translate(184, 0)" className="house-sway">
        <line x1="0" y1="0" x2="0" y2="26" stroke="#6b5a4c" strokeWidth="1.6" />
        <path d="M0 24 c-9 0 -11 10 -11 18 h22 c0 -8 -2 -18 -11 -18 z" fill="#e5b855" stroke="#a6812d" strokeWidth="1.3" />
        <circle cx="0" cy="44" r="2.8" fill="#a6812d" />
      </g>

      {/* Piano vertical */}
      <g transform="translate(148, 64)">
        <rect x="0" y="0" width="66" height="64" rx="3" fill="#59463c" stroke="#3e2f28" strokeWidth="1.6" />
        <rect x="4" y="30" width="58" height="9" rx="1.5" fill="#fffaf0" />
        {[10, 18, 30, 38, 46].map((x) => (
          <rect key={x} x={x} y="30" width="3.5" height="5.5" fill="#2d2622" />
        ))}
        <rect x="6" y="42" width="54" height="18" fill="#4a3930" />
      </g>

      {/* Xilófono colorido */}
      <g transform="translate(24, 108)">
        <rect x="-2" y="14" width="52" height="4" rx="2" fill="#8f6c5a" />
        {keys.map((c, i) => (
          <rect key={c} x={i * 10} y={2 + i * 1.4} width="8" height={16 - i * 1.4} rx="2" fill={c} stroke="#2b3327" strokeOpacity="0.25" strokeWidth="1" />
        ))}
      </g>

      {/* Tambor en el centro */}
      <g transform="translate(96, 104)">
        <rect x="0" y="8" width="32" height="18" rx="3" fill="#d96b59" stroke="#9e483a" strokeWidth="1.4" />
        <ellipse cx="16" cy="8" rx="16" ry="5" fill="#fff5e0" stroke="#9e483a" strokeWidth="1.4" />
        <line x1="6" y1="-2" x2="14" y2="8" stroke="#a37a52" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="26" y1="-2" x2="18" y2="8" stroke="#a37a52" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </BaseRoom>
  );
}

/** Piso 2 Izquierda — Rincón de Peluches */
function PeluchesInterior({ room, warmLights }: InteriorProps) {
  const flags = ["#e88a7a", "#f0c36a", "#9ccf8f", "#8fb8e0", "#b79fc9", "#f3b6c8"];
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights}>
      {/* Banderines festivos */}
      <path d="M70 12 Q145 30 222 12" fill="none" stroke="#8f6c5a" strokeWidth="1.2" />
      {flags.map((c, i) => {
        const x = 84 + i * 24;
        const y = 14 + Math.sin(((i + 0.5) / flags.length) * Math.PI) * 9;
        return <polygon key={c} points={`${x - 6},${y} ${x + 6},${y} ${x},${y + 12}`} fill={c} />;
      })}

      {/* Tienda tipis en el fondo */}
      <g transform="translate(80, 42)">
        <polygon points="34,0 0,86 68,86" fill="#f7dfd1" stroke="#d4a68e" strokeWidth="1.8" />
        <polygon points="34,18 22,86 46,86" fill="#8f6c5a" opacity="0.4" />
        <line x1="28" y1="-6" x2="38" y2="6" stroke="#8f6c5a" strokeWidth="2" />
        <line x1="40" y1="-6" x2="30" y2="6" stroke="#8f6c5a" strokeWidth="2" />
      </g>

      {/* Espejo ovalado en la pared derecha */}
      <ellipse cx="192" cy="56" rx="14" ry="20" fill="#dff0f5" stroke="#c9956b" strokeWidth="3.5" />
      <line x1="185" y1="48" x2="195" y2="38" stroke="#fff" strokeWidth="2" opacity="0.8" />

      {/* Oso de peluche adorable sentado en la alfombra */}
      <g transform="translate(114, 108)" className="bob">
        <circle cx="-10" cy="-12" r="5" fill="#b88356" />
        <circle cx="10" cy="-12" r="5" fill="#b88356" />
        <ellipse cx="0" cy="12" rx="14" ry="12" fill="#c79163" />
        <ellipse cx="0" cy="13" rx="7" ry="6" fill="#e8c8a4" />
        <circle cx="0" cy="-2" r="12" fill="#c79163" />
        <ellipse cx="0" cy="2" rx="5.5" ry="4" fill="#e8c8a4" />
        <circle cx="-4" cy="-4" r="1.4" fill="#3a2c24" />
        <circle cx="4" cy="-4" r="1.4" fill="#3a2c24" />
        <circle cx="0" cy="1" r="1.5" fill="#3a2c24" />
      </g>

      {/* Conejo de orejas largas */}
      <g transform="translate(58, 114)">
        <ellipse cx="-4" cy="-14" rx="3" ry="9" fill="#eee8e2" stroke="#cfc5bc" strokeWidth="1" />
        <ellipse cx="4" cy="-14" rx="3" ry="9" fill="#eee8e2" stroke="#cfc5bc" strokeWidth="1" />
        <ellipse cx="0" cy="8" rx="10" ry="9" fill="#eee8e2" />
        <circle cx="0" cy="-2" r="8.5" fill="#eee8e2" />
        <circle cx="-3" cy="-3" r="1.2" fill="#3a2c24" />
        <circle cx="3" cy="-3" r="1.2" fill="#3a2c24" />
      </g>

      {/* Puf lila + manta doblada */}
      <g transform="translate(178, 114)">
        <ellipse cx="0" cy="14" rx="22" ry="8" fill="#b79fc9" />
        <rect x="-14" y="2" width="28" height="10" rx="4" fill="#dfd2ea" stroke="#9981ad" strokeWidth="1.2" />
        <line x1="-10" y1="7" x2="10" y2="7" stroke="#fff" strokeDasharray="3 2" />
      </g>
    </BaseRoom>
  );
}

/** Piso 2 Centro — Taller de Creatividad */
function CreatividadInterior({ room, warmLights }: InteriorProps) {
  const paints = ["#e88a7a", "#f0c36a", "#8fc284", "#7da9d4"];
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights}>
      {/* Cuerda con dibujos colgados */}
      <path d="M72 16 Q142 30 218 16" fill="none" stroke="#8f6c5a" strokeWidth="1.2" />
      {paints.map((c, i) => {
        const x = 90 + i * 34;
        const y = 18 + Math.sin(((i + 0.5) / 4) * Math.PI) * 7;
        return (
          <g key={c} transform={`translate(${x}, ${y})`}>
            <rect x="-8" y="0" width="16" height="20" fill="#fffdf6" stroke="#d4c7b4" strokeWidth="1.2" />
            <circle cx="0" cy="10" r="4.5" fill={c} />
          </g>
        );
      })}

      {/* Estante con frascos de pintura */}
      <rect x="18" y="88" width="54" height="4" rx="1.5" fill="#8f6c5a" />
      {paints.map((c, i) => (
        <rect key={c} x={23 + i * 12} y="78" width="8" height="10" rx="2" fill={c} />
      ))}

      {/* Mesa de trabajo con tangram y crayones */}
      <g transform="translate(22, 102)">
        <rect x="0" y="0" width="82" height="8" rx="2" fill="#dbb88c" stroke="#a68158" strokeWidth="1.2" />
        <rect x="6" y="8" width="6" height="24" fill="#a68158" />
        <rect x="70" y="8" width="6" height="24" fill="#a68158" />
        {/* Tangram colorido sobre la mesa */}
        <polygon points="16,0 32,0 24,-10" fill="#6f9fd0" />
        <polygon points="32,0 44,0 38,-8" fill="#e88a7a" />
        <polygon points="44,0 54,0 50,-7" fill="#e6cf52" />
        <rect x="60" y="-12" width="10" height="12" rx="2" fill="#fff" stroke="#bd9079" strokeWidth="1" />
        <line x1="63" y1="-12" x2="61" y2="-18" stroke="#e88a7a" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="67" y1="-12" x2="69" y2="-19" stroke="#6f9fd0" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Caballete con lienzo */}
      <g transform="translate(154, 48)">
        <line x1="18" y1="4" x2="2" y2="82" stroke="#8f6c5a" strokeWidth="3" strokeLinecap="round" />
        <line x1="26" y1="4" x2="42" y2="82" stroke="#8f6c5a" strokeWidth="3" strokeLinecap="round" />
        <line x1="22" y1="4" x2="22" y2="78" stroke="#755545" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="4" y="14" width="36" height="32" rx="2" fill="#fffdf6" stroke="#c99a6b" strokeWidth="2.4" />
        <path d="M6 38 Q16 28 24 34 T38 30 L38 44 L6 44 Z" fill="#8dbb7f" />
        <circle cx="15" cy="24" r="4" fill="#f2c14e" />
        <line x1="0" y1="48" x2="44" y2="48" stroke="#8f6c5a" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Manchas alegres en la alfombra */}
      <ellipse cx="122" cy="136" rx="6" ry="2.2" fill="#e88a7a" opacity="0.7" />
      <ellipse cx="140" cy="139" rx="5" ry="2" fill="#6f9fd0" opacity="0.7" />
    </BaseRoom>
  );
}

/** Piso 2 Derecha — Sala de Movimiento */
function MovimientoInterior({ room, warmLights }: InteriorProps) {
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights}>
      {/* Espaldera sueca de madera */}
      <g transform="translate(172, 18)" stroke="#c49b72" strokeWidth="3">
        <line x1="0" y1="0" x2="0" y2="108" />
        <line x1="42" y1="0" x2="42" y2="108" />
        {[12, 26, 40, 54, 68, 82, 96].map((y) => (
          <line key={y} x1="0" y1={y} x2="42" y2={y} strokeWidth="2.4" />
        ))}
      </g>

      {/* Espejo alto de estudio */}
      <g transform="translate(90, 22)">
        <rect x="0" y="0" width="60" height="92" rx="4" fill="#e4f0f5" stroke="#c49474" strokeWidth="3" />
        <line x1="12" y1="22" x2="28" y2="8" stroke="#fff" strokeWidth="3" opacity="0.85" />
        <line x1="18" y1="34" x2="44" y2="10" stroke="#fff" strokeWidth="1.6" opacity="0.7" />
      </g>

      {/* Cinta de movimiento ondulando */}
      <path d="M26 96 Q54 66 78 92 T132 84" fill="none" stroke="#e28779" strokeWidth="3" strokeLinecap="round" opacity="0.85" />

      {/* Colchoneta en el suelo */}
      <rect x="76" y="122" width="84" height="9" rx="4.5" fill="#8dc488" stroke="#6aa365" strokeWidth="1.2" />

      {/* Pelota botadora */}
      <g transform="translate(52, 112)" className="bob">
        <circle cx="0" cy="0" r="14" fill="#e07b67" stroke="#b55947" strokeWidth="1.5" />
        <path d="M-12 -3 Q0 -12 12 -3" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="2" />
        <circle cx="-4" cy="-5" r="3" fill="#fff" opacity="0.45" />
      </g>

      {/* Banco bajo */}
      <g transform="translate(166, 114)">
        <rect x="0" y="0" width="44" height="6" rx="2" fill="#c99a6b" />
        <rect x="5" y="6" width="4" height="12" fill="#9c724b" />
        <rect x="35" y="6" width="4" height="12" fill="#9c724b" />
      </g>
    </BaseRoom>
  );
}

/** Planta Baja Izquierda — Cocina del Cuidado */
function CocinaInterior({ room, warmLights }: InteriorProps) {
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights}>
      {/* Alacenas superiores */}
      <rect x="116" y="16" width="46" height="32" rx="3" fill="#cfa882" stroke="#997556" strokeWidth="1.6" />
      <rect x="168" y="16" width="48" height="32" rx="3" fill="#cfa882" stroke="#997556" strokeWidth="1.6" />
      <circle cx="155" cy="36" r="2" fill="#6b503b" />
      <circle cx="175" cy="36" r="2" fill="#6b503b" />

      {/* Azulejos */}
      <rect x="114" y="52" width="104" height="28" fill="#dff0f2" opacity="0.85" />
      <g stroke="#a3c2c7" strokeWidth="1" opacity="0.65">
        <line x1="140" y1="52" x2="140" y2="80" />
        <line x1="166" y1="52" x2="166" y2="80" />
        <line x1="192" y1="52" x2="192" y2="80" />
        <line x1="114" y1="66" x2="218" y2="66" />
      </g>

      {/* Encimera con fogón, olla humeante y frutero */}
      <g transform="translate(110, 80)">
        <rect x="0" y="0" width="110" height="48" rx="2" fill="#ba916a" stroke="#8c6848" strokeWidth="1.6" />
        <rect x="-2" y="0" width="114" height="7" rx="2" fill="#efe6d5" stroke="#c9bba2" strokeWidth="1.2" />
        {/* Olla */}
        <rect x="18" y="-15" width="28" height="16" rx="4" fill="#5d636b" />
        <ellipse cx="32" cy="-15" rx="14" ry="3.5" fill="#e8a75a" />
        {/* Vapor subiendo */}
        <path d="M26 -20 q-4 -8 1 -14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.8" className="steam" />
        <path d="M36 -20 q4 -8 -1 -15" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" className="steam" style={{ animationDelay: "0.7s" }} />
        {/* Frutero */}
        <path d="M68 -6 h26 a13 10 0 0 1 -26 0 z" fill="#f7edda" stroke="#c49573" strokeWidth="1.4" />
        <circle cx="76" cy="-9" r="4.5" fill="#e05a47" />
        <circle cx="84" cy="-10" r="4.5" fill="#f2b84b" />
        <circle cx="80" cy="-14" r="4" fill="#86b86b" />
      </g>

      {/* Mesa redonda con taza caliente */}
      <g transform="translate(22, 92)">
        <ellipse cx="34" cy="6" rx="30" ry="7" fill="#f2d5c4" stroke="#d49e85" strokeWidth="1.4" />
        <rect x="31" y="12" width="6" height="24" fill="#8c6848" />
        <ellipse cx="34" cy="36" rx="12" ry="3" fill="#8c6848" />
        {/* Taza */}
        <rect x="26" y="-5" width="14" height="10" rx="3" fill="#fffdf8" stroke="#997556" strokeWidth="1.3" />
        <path d="M33 -8 q-2 -5 1 -8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" className="steam" />
      </g>
    </BaseRoom>
  );
}

/** Planta Baja Centro — El Vestíbulo (puerta principal y escalera que sube) */
function VestibuloInterior({ room, warmLights }: InteriorProps) {
  return (
    <BaseRoom {...room.ambience} warmLights={warmLights} windowType="none">
      {/* Escalera de madera subiendo hacia los pisos superiores */}
      <g transform="translate(154, 24)">
        <path d="M0 104 L62 12 L62 104 Z" fill="#c79e76" opacity="0.55" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={i * 8} y={92 - i * 13} width="24" height="5" rx="1" fill="#a87d56" />
        ))}
        <line x1="-2" y1="88" x2="54" y2="4" stroke="#7d5c40" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Lámpara colgante cálida */}
      <g transform="translate(116, 0)">
        <ellipse cx="0" cy="34" rx="34" ry="22" fill="#ffe49e" opacity={warmLights ? 0.5 : 0.25} className="house-lamp-glow" />
        <line x1="0" y1="0" x2="0" y2="20" stroke="#6c5749" strokeWidth="2" />
        <path d="M-14 30 Q0 14 14 30 Z" fill="#e6ba5e" stroke="#a67f32" strokeWidth="1.4" />
        <circle cx="0" cy="31" r="3" fill="#fff7d6" />
      </g>

      {/* Gran puerta arqueada de entrada a la casa */}
      <g transform="translate(86, 48)">
        <path d="M0 80 V26 A30 26 0 0 1 60 26 V80 Z" fill="#8f684e" />
        <path d="M5 80 V28 A25 22 0 0 1 55 28 V80 Z" fill="#b88868" />
        {/* Ventanita de la puerta */}
        <path d="M16 42 V28 A14 12 0 0 1 44 28 V42 Z" fill={warmLights ? "#ffe4a0" : "#d8edf2"} stroke="#8f684e" strokeWidth="2" />
        <line x1="30" y1="16" x2="30" y2="42" stroke="#8f684e" strokeWidth="1.5" />
        <circle cx="47" cy="54" r="3" fill="#f0c869" />
      </g>

      {/* Perchero con abrigo a la izquierda */}
      <g transform="translate(24, 52)">
        <line x1="16" y1="4" x2="16" y2="76" stroke="#7d5c40" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="6" y1="76" x2="26" y2="76" stroke="#7d5c40" strokeWidth="3" strokeLinecap="round" />
        <line x1="6" y1="14" x2="26" y2="14" stroke="#7d5c40" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M6 18 L16 14 L26 18 L28 48 L4 48 Z" fill="#5e809e" stroke="#425d75" strokeWidth="1.3" />
      </g>

      {/* Reloj de pared redondo */}
      <g transform="translate(56, 32)">
        <circle cx="0" cy="0" r="12" fill="#fffaf0" stroke="#997556" strokeWidth="2.6" />
        <line x1="0" y1="0" x2="0" y2="-6" stroke="#2b3327" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="0" y1="0" x2="5" y2="2" stroke="#2b3327" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Felpudo de bienvenida */}
      <rect x="92" y="131" width="48" height="9" rx="4" fill="#c79e72" stroke="#94704c" strokeWidth="1.2" />
    </BaseRoom>
  );
}

/** Planta Baja Derecha — Jardín Interno (invernadero sincronizado con tu planta real) */
function JardinInterior({ room, warmLights, garden }: InteriorProps) {
  const g = garden?.seed ? Math.max(8, garden.growth) : 0;
  const stem = Math.min(46, g * 0.48);
  const flowerColor = garden?.seed === "lavanda" ? "#a291b4" : garden?.seed === "tomate" ? "#e05a4f" : "#f2c14e";

  return (
    <BaseRoom {...room.ambience} warmLights={warmLights} windowType="greenhouse">
      {/* Rayo de sol cálido en el invernadero */}
      {!warmLights && (
        <polygon points="150,8 224,8 140,128 70,128" fill="#fff7cc" opacity="0.28" />
      )}

      {/* Enredadera colgando del techo de cristal */}
      <g fill="#6ca15d">
        <path d="M26 8 q-4 18 2 34 q6 16 -2 30" fill="none" stroke="#538545" strokeWidth="2" />
        <ellipse cx="22" cy="22" rx="5" ry="3" transform="rotate(-25 22 22)" />
        <ellipse cx="30" cy="36" rx="5" ry="3" transform="rotate(25 30 36)" />
        <ellipse cx="24" cy="52" rx="5" ry="3" transform="rotate(-20 24 52)" />
      </g>

      {/* Bancal con flores a la derecha */}
      <g transform="translate(148, 98)">
        <rect x="0" y="12" width="68" height="18" rx="3" fill="#a87b56" stroke="#7d5a3d" strokeWidth="1.4" />
        <rect x="3" y="9" width="62" height="5" rx="2" fill="#5e432b" />
        {[16, 34, 52].map((x, i) => (
          <g key={x}>
            <line x1={x} y1="10" x2={x} y2="-6" stroke="#538545" strokeWidth="2" />
            <circle cx={x} cy="-8" r="5" fill={["#f3b6c8", "#f2c14e", "#a291b4"][i]} />
            <circle cx={x} cy="-8" r="2" fill="#fff5cc" />
          </g>
        ))}
      </g>

      {/* Maceta principal con tu planta real */}
      <g transform="translate(96, 102)">
        <path d="M-18 4 h36 l-5 24 h-26 z" fill="#c48b6c" stroke="#8f6048" strokeWidth="1.5" />
        <rect x="-21" y="0" width="42" height="6" rx="2" fill="#d49c7d" stroke="#8f6048" strokeWidth="1.4" />
        {g > 0 ? (
          <g>
            <path d={`M0 1 Q3 ${-stem / 2} 0 ${-stem}`} fill="none" stroke="#588a49" strokeWidth="3.2" strokeLinecap="round" />
            <ellipse cx="-10" cy={-Math.max(10, stem * 0.45)} rx="9" ry="4.5" fill="#7ab068" transform={`rotate(-25 -10 ${-Math.max(10, stem * 0.45)})`} />
            <ellipse cx="10" cy={-Math.max(14, stem * 0.65)} rx="9" ry="4.5" fill="#689e57" transform={`rotate(25 10 ${-Math.max(14, stem * 0.65)})`} />
            {g >= 75 && (
              <g transform={`translate(0, ${-stem - 2})`}>
                <circle cx="0" cy="0" r="8" fill={flowerColor} />
                <circle cx="0" cy="0" r="3.5" fill="#6b4b2a" />
              </g>
            )}
          </g>
        ) : (
          <g>
            <ellipse cx="-7" cy="-8" rx="6" ry="3.5" fill="#82b870" transform="rotate(-25 -7 -8)" />
            <ellipse cx="7" cy="-8" rx="6" ry="3.5" fill="#6ca35b" transform="rotate(25 7 -8)" />
          </g>
        )}
      </g>

      {/* Regadera azul */}
      <g transform="translate(26, 106)">
        <rect x="4" y="6" width="22" height="18" rx="3" fill="#7db0c4" stroke="#528296" strokeWidth="1.4" />
        <path d="M4 10 c-7 0 -7 12 0 12" fill="none" stroke="#528296" strokeWidth="2.2" />
        <line x1="26" y1="14" x2="38" y2="4" stroke="#528296" strokeWidth="3.2" strokeLinecap="round" />
      </g>

      {/* Mariposa volando */}
      <g transform="translate(158, 52)" className="bob">
        <ellipse cx="-5" cy="-2" rx="6" ry="4.5" fill="#f0a84c" transform="rotate(-20 -5 -2)" />
        <ellipse cx="5" cy="-2" rx="6" ry="4.5" fill="#f0a84c" transform="rotate(20 5 -2)" />
        <ellipse cx="0" cy="0" rx="1.6" ry="5" fill="#4f371e" />
      </g>
    </BaseRoom>
  );
}

export function HouseRoomInterior({ room, warmLights, garden }: InteriorProps) {
  switch (room.slug) {
    case "estrellas":
      return <EstrellasInterior warmLights={warmLights} />;
    case "lectura":
      return <LecturaInterior room={room} warmLights={warmLights} />;
    case "respiracion":
      return <RespiracionInterior room={room} warmLights={warmLights} />;
    case "instrumentos":
      return <InstrumentosInterior room={room} warmLights={warmLights} />;
    case "peluches":
      return <PeluchesInterior room={room} warmLights={warmLights} />;
    case "creatividad":
      return <CreatividadInterior room={room} warmLights={warmLights} />;
    case "movimiento":
      return <MovimientoInterior room={room} warmLights={warmLights} />;
    case "cocina":
      return <CocinaInterior room={room} warmLights={warmLights} />;
    case "vestibulo":
      return <VestibuloInterior room={room} warmLights={warmLights} />;
    case "jardin":
      return <JardinInterior room={room} warmLights={warmLights} garden={garden} />;
    default:
      return null;
  }
}
