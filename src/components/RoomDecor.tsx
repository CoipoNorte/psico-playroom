// Decoración propia de cada habitación, dibujada sobre la escena isométrica (viewBox 400 × 300).
// Geometría de la escena:
//   pared izquierda  (20,215) → (200,140), altura hacia arriba
//   pared derecha    (200,140) → (380,215)
//   suelo (rombo)    esquina del fondo (200,140), izquierda (20,215), derecha (380,215), frente (200,290)
// Los objetos interactivos se colocan encima (ver `objects` en rooms-data), alineados con estos muebles.

import type { ReactNode } from "react";

type Pt = [number, number];

/** Punto en la pared izquierda: u = 0 junto a la ventana exterior, 1 en la esquina; h = altura. */
const lw = (u: number, h: number): Pt => [20 + 180 * u, 215 - 75 * u - h];
/** Punto en la pared derecha: u = 0 en la esquina, 1 en el extremo; h = altura. */
const rw = (u: number, h: number): Pt => [200 + 180 * u, 140 + 75 * u - h];
/** Punto del suelo: p avanza hacia la esquina izquierda, q hacia la derecha. */
const fl = (p: number, q: number): Pt => [200 - 180 * p + 180 * q, 140 + 75 * p + 75 * q];

/** Punto de una curva cuadrática (para colgar cosas exactamente de una cuerda). */
const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t ** 2 * b[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t ** 2 * b[1],
];

const pts = (list: Pt[]) => list.map((p) => p.join(",")).join(" ");

/** Rectángulo pegado a una pared. */
function WallRect({ side, u0, u1, h0, h1, fill, stroke, sw = 2, opacity, className }: { side: "l" | "r"; u0: number; u1: number; h0: number; h1: number; fill: string; stroke?: string; sw?: number; opacity?: number | string; className?: string }) {
  const f = side === "l" ? lw : rw;
  return <polygon points={pts([f(u0, h0), f(u1, h0), f(u1, h1), f(u0, h1)])} fill={fill} stroke={stroke} strokeWidth={stroke ? sw : undefined} strokeLinejoin="round" opacity={opacity} className={className} />;
}

/** Caja isométrica apoyada en el suelo (muebles). */
function IsoBox({ p, q, sp, sq, h, top, left, right, children }: { p: number; q: number; sp: number; sq: number; h: number; top: string; left?: string; right?: string; children?: ReactNode }) {
  const A = fl(p, q);
  const B = fl(p + sp, q);
  const C = fl(p + sp, q + sq);
  const D = fl(p, q + sq);
  const up = ([x, y]: Pt): Pt => [x, y - h];
  return (
    <g>
      <polygon points={pts([B, C, up(C), up(B)])} fill={left ?? top} />
      <polygon points={pts([B, C, up(C), up(B)])} fill="#000" opacity="0.12" />
      <polygon points={pts([D, C, up(C), up(D)])} fill={right ?? top} />
      <polygon points={pts([D, C, up(C), up(D)])} fill="#000" opacity="0.24" />
      <polygon points={pts([up(A), up(B), up(C), up(D)])} fill={top} />
      {children}
    </g>
  );
}

/** Rombo plano sobre el suelo (alfombrillas, camas de tierra, colchonetas). */
function FloorPatch({ p, q, sp, sq, fill, opacity, stroke }: { p: number; q: number; sp: number; sq: number; fill: string; opacity?: number | string; stroke?: string }) {
  return <polygon points={pts([fl(p, q), fl(p + sp, q), fl(p + sp, q + sq), fl(p, q + sq)])} fill={fill} opacity={opacity} stroke={stroke} strokeWidth={stroke ? 1.5 : undefined} />;
}

function Frame({ side, u0, u1, h0, h1, inner }: { side: "l" | "r"; u0: number; u1: number; h0: number; h1: number; inner: string }) {
  return (
    <g>
      <WallRect side={side} u0={u0} u1={u1} h0={h0} h1={h1} fill="#fff" stroke="#8f6c5a" sw={2.5} />
      <WallRect side={side} u0={u0 + 0.015} u1={u1 - 0.015} h0={h0 + 4} h1={h1 - 4} fill={inner} />
    </g>
  );
}

/** Planta en maceta vista de frente. */
function Plant({ x, y, s = 1, pot = "#bd9079" }: { x: number; y: number; s?: number; pot?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="-7" cy="-22" rx="7" ry="13" fill="#7fae6f" transform="rotate(-25 -7 -22)" />
      <ellipse cx="7" cy="-22" rx="7" ry="13" fill="#6a9a5c" transform="rotate(25 7 -22)" />
      <ellipse cx="0" cy="-27" rx="6" ry="14" fill="#8cbc7c" />
      <path d="M-9 -10h18l-3 12h-12z" fill={pot} />
    </g>
  );
}

/* ====================================================================== */
/* Habitaciones                                                            */
/* ====================================================================== */

function Vestibulo() {
  return (
    <g>
      {/* Puerta de entrada en la pared derecha */}
      <WallRect side="r" u0={0.68} u1={0.9} h0={0} h1={100} fill="#8f6c5a" />
      <WallRect side="r" u0={0.705} u1={0.875} h0={4} h1={94} fill="#a97d5d" />
      <WallRect side="r" u0={0.73} u1={0.85} h0={62} h1={86} fill="#d3e9f0" opacity="0.85" />
      <circle cx={rw(0.855, 45)[0]} cy={rw(0.855, 45)[1]} r="2.5" fill="#e2b45a" />
      {/* Felpudo */}
      <FloorPatch p={0.02} q={0.66} sp={0.13} sq={0.24} fill="#b58b5f" />
      <FloorPatch p={0.04} q={0.7} sp={0.09} sq={0.16} fill="#c9a27e" />
      {/* Riel de ganchos sobre el perchero */}
      <WallRect side="l" u0={0.03} u1={0.2} h0={78} h1={83} fill="#8f6c5a" />
      {[0.06, 0.11, 0.16].map((u) => (
        <circle key={u} cx={lw(u, 74)[0]} cy={lw(u, 74)[1]} r="2.5" fill="#6b5a4c" />
      ))}
      {/* Cuadro y repisa */}
      <Frame side="l" u0={0.7} u1={0.92} h0={62} h1={98} inner="#cfe0c4" />
      <path d={`M${lw(0.73, 70)[0]} ${lw(0.73, 70)[1]} l10 -10 l8 6 l9 -12 l7 14`} fill="none" stroke="#627757" strokeWidth="2" />
      {/* Zapatero */}
      <IsoBox p={0.62} q={0.02} sp={0.2} sq={0.09} h={18} top="#c9a27e" />
      {/* Lámpara colgante */}
      <line x1="200" y1="0" x2="200" y2="30" stroke="#6b5a4c" strokeWidth="1.5" />
      <path d="M188 40 Q200 22 212 40 Z" fill="#e2b45a" />
      <ellipse cx="200" cy="44" rx="22" ry="8" fill="#f7d98b" opacity="0.35" className="breathe" style={{ transformOrigin: "200px 44px" }} />
    </g>
  );
}

function Peluches() {
  const flags = ["#e88a7a", "#f0c36a", "#9ccf8f", "#8fb8e0", "#b79fc9", "#f3b6c8"];
  return (
    <g>
      {/* Banderines en la pared derecha, colgando de su cordel */}
      {(() => {
        const a = rw(0.05, 100);
        const c = rw(0.5, 70);
        const b = rw(0.95, 100);
        return (
          <g>
            <path d={`M${a.join(" ")} Q${c.join(" ")} ${b.join(" ")}`} fill="none" stroke="#8f6c5a" strokeWidth="1.2" />
            {Array.from({ length: 8 }, (_, i) => {
              const [x, y] = quad(a, c, b, 0.08 + i * 0.12);
              return <path key={i} d={`M${x - 6} ${y} L${x + 6} ${y + 2} L${x} ${y + 14} Z`} fill={flags[i % flags.length]} className="swing" style={{ animationDelay: `${i * 0.15}s` }} />;
            })}
          </g>
        );
      })()}
      {/* Estrellitas pegadas en la pared izquierda */}
      {[[0.68, 92], [0.8, 70], [0.9, 100], [0.74, 52]].map(([u, h], i) => {
        const [x, y] = lw(u, h);
        return (
          <text key={i} x={x} y={y} fontSize="11" textAnchor="middle" className="twinkle" style={{ animationDelay: `${i * 0.6}s` }}>
            ⭐
          </text>
        );
      })}
      {/* Tienda de juego en la esquina */}
      <g>
        <path d={`M${fl(0.02, 0.06).join(" ")} L178 70 L${fl(0.24, 0.06).join(" ")} Z`} fill="#f3d6c4" stroke="#d9a98f" strokeWidth="2" />
        <path d={`M178 70 L${fl(0.02, 0.24).join(" ")} L${fl(0.02, 0.06).join(" ")} Z`} fill="#e9c2ad" stroke="#d9a98f" strokeWidth="2" />
        <path d={`M178 70 L174 ${fl(0.13, 0.06)[1]} L184 ${fl(0.13, 0.06)[1]} Z`} fill="#8f6c5a" opacity="0.5" />
        <circle cx="178" cy="66" r="3" fill="#e88a7a" />
      </g>
      {/* Baúl de juguetes */}
      <IsoBox p={0.66} q={0.02} sp={0.18} sq={0.12} h={22} top="#e0b07a" left="#d29d63" right="#c48c55" />
      {/* Puf (bajo la manta) */}
      <ellipse cx="268" cy="240" rx="30" ry="14" fill="#b79fc9" />
      <ellipse cx="268" cy="234" rx="24" ry="10" fill="#c9b4d8" />
    </g>
  );
}

function Instrumentos() {
  return (
    <g>
      {/* Pentagrama en la pared derecha */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${rw(0.08, 100 - i * 5).join(" ")} L${rw(0.36, 100 - i * 5).join(" ")}`} stroke="#8a7794" strokeOpacity="0.6" strokeWidth="1" />
      ))}
      {["♪", "♫", "♩"].map((n, i) => {
        const [x, y] = rw(0.12 + i * 0.09, 90 - (i % 2) * 6);
        return (
          <text key={n} x={x} y={y} fontSize="13" fill="#6f5c80" className="bob" style={{ animationDelay: `${i * 0.4}s` }}>
            {n}
          </text>
        );
      })}
      {/* Soporte de la campana */}
      <path d={`M${rw(0.44, 112).join(" ")} L280 86`} fill="none" stroke="#6b5a4c" strokeWidth="2" strokeDasharray="3 2" />
      <circle cx={rw(0.44, 112)[0]} cy={rw(0.44, 112)[1]} r="3" fill="#6b5a4c" />
      {/* Paneles acústicos en la pared izquierda */}
      {[0.66, 0.78, 0.9].map((u) => (
        <WallRect key={u} side="l" u0={u} u1={u + 0.09} h0={55} h1={95} fill="#b79fc9" opacity="0.6" />
      ))}
      {/* Piano vertical contra la pared derecha */}
      <IsoBox p={0} q={0.66} sp={0.12} sq={0.3} h={62} top="#4b3b33" left="#5b4a40" right="#3f312a">
        <polygon points={pts([[fl(0.12, 0.68)[0], fl(0.12, 0.68)[1] - 34], [fl(0.12, 0.94)[0], fl(0.12, 0.94)[1] - 34], [fl(0.12, 0.94)[0], fl(0.12, 0.94)[1] - 28], [fl(0.12, 0.68)[0], fl(0.12, 0.68)[1] - 28]])} fill="#fffaf0" />
      </IsoBox>
      {/* Atril */}
      <g stroke="#6b5a4c" strokeWidth="2">
        <line x1="96" y1="214" x2="96" y2="168" />
        <line x1="88" y1="216" x2="96" y2="206" />
        <line x1="104" y1="216" x2="96" y2="206" />
      </g>
      <polygon points="82,152 110,158 108,174 80,168" fill="#fffaf0" stroke="#6b5a4c" strokeWidth="1.5" />
    </g>
  );
}

function Cocina() {
  return (
    <g>
      {/* Azulejos */}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${rw(0.32 + i * 0.1, 46).join(" ")} L${rw(0.32 + i * 0.1, 80).join(" ")}`} stroke="#9fb8c2" strokeOpacity="0.5" />
      ))}
      <WallRect side="r" u0={0.3} u1={0.98} h0={46} h1={80} fill="#dfeef2" opacity="0.6" />
      {/* Alacenas */}
      <WallRect side="r" u0={0.3} u1={0.62} h0={88} h1={118} fill="#c9a27e" stroke="#8f6c5a" sw={1.5} />
      <WallRect side="r" u0={0.66} u1={0.98} h0={88} h1={118} fill="#c9a27e" stroke="#8f6c5a" sw={1.5} />
      {/* Encimera con fogones (la olla va encima) */}
      <IsoBox p={0} q={0.3} sp={0.15} sq={0.68} h={45} top="#eae2d3" left="#b58b5f" right="#a37a51">
        {[0.46, 0.62].map((q) => {
          const [x, y] = fl(0.075, q);
          return <ellipse key={q} cx={x} cy={y - 45} rx="9" ry="4" fill="#3b3b40" />;
        })}
      </IsoBox>
      {/* Mesa redonda con mantel (taza encima) */}
      <line x1="137" y1="198" x2="137" y2="170" stroke="#8f6c5a" strokeWidth="4" />
      <ellipse cx="137" cy="200" rx="10" ry="3.5" fill="#8f6c5a" />
      <ellipse cx="137" cy="168" rx="30" ry="12" fill="#f3d6c4" />
      <path d="M107 168 q30 18 60 0 v6 q-30 18 -60 0z" fill="#e88a7a" opacity="0.6" />
      {/* Barra con sartenes en la pared izquierda */}
      <path d={`M${lw(0.78, 102).join(" ")} L${lw(0.98, 102).join(" ")}`} stroke="#6b5a4c" strokeWidth="2.5" />
      {[0.84, 0.93].map((u, i) => {
        const [x, y] = lw(u, 102);
        return (
          <g key={u} className="swing" style={{ animationDelay: `${i * 0.5}s` }}>
            <line x1={x} y1={y} x2={x} y2={y + 10} stroke="#6b5a4c" strokeWidth="1.5" />
            <circle cx={x} cy={y + 18} r="8" fill="#3b3b40" />
          </g>
        );
      })}
      {/* Gancho del delantal */}
      <circle cx={lw(0.68, 98)[0]} cy={lw(0.68, 98)[1]} r="3" fill="#6b5a4c" />
      <Plant x={90} y={150} s={0.6} />
    </g>
  );
}

function Creatividad() {
  const pinned = ["#e88a7a", "#9ccf8f", "#8fb8e0", "#f0c36a"];
  return (
    <g>
      {/* Cuerda con dibujos colgados */}
      {(() => {
        const a = rw(0.06, 102);
        const c = rw(0.33, 80);
        const b = rw(0.62, 102);
        return (
          <g>
            <path d={`M${a.join(" ")} Q${c.join(" ")} ${b.join(" ")}`} fill="none" stroke="#8f6c5a" strokeWidth="1.2" />
            {pinned.map((col, i) => {
              const [x, y] = quad(a, c, b, 0.15 + i * 0.23);
              return (
                <g key={col} className="swing" style={{ animationDelay: `${i * 0.3}s` }}>
                  <rect x={x - 7} y={y} width="14" height="17" fill="#fffaf0" stroke="#d6cbb8" />
                  <circle cx={x} cy={y + 8} r="4" fill={col} />
                </g>
              );
            })}
          </g>
        );
      })()}
      {/* Caballete (el lienzo va encima) */}
      <g stroke="#8f6c5a" strokeWidth="3" strokeLinecap="round">
        <line x1="260" y1="205" x2="270" y2="120" />
        <line x1="284" y1="205" x2="274" y2="120" />
        <line x1="272" y1="200" x2="272" y2="122" />
        <line x1="256" y1="170" x2="288" y2="170" />
      </g>
      {/* Mesa de trabajo (crayones y tangram encima) */}
      <IsoBox p={0.45} q={0.04} sp={0.3} sq={0.24} h={32} top="#e6cfa8" left="#c9a27e" right="#b58b5f" />
      {/* Manchas de pintura */}
      <ellipse cx="300" cy="240" rx="9" ry="4" fill="#8fb8e0" opacity="0.6" />
      <ellipse cx="160" cy="250" rx="7" ry="3" fill="#e88a7a" opacity="0.55" />
      <ellipse cx="225" cy="265" rx="6" ry="2.5" fill="#f0c36a" opacity="0.6" />
      {/* Estante con frascos en la pared izquierda */}
      <WallRect side="l" u0={0.66} u1={0.96} h0={92} h1={96} fill="#8f6c5a" />
      {[0.7, 0.78, 0.86, 0.93].map((u, i) => {
        const [x, y] = lw(u, 96);
        return <rect key={u} x={x - 4} y={y - 12} width="8" height="12" rx="2" fill={pinned[i]} opacity="0.85" />;
      })}
    </g>
  );
}

function Lectura() {
  const spines = ["#8d9c7a", "#c79f86", "#a6a08d", "#8f8299", "#b8a97f", "#7f9db0", "#c48c6e"];
  return (
    <g>
      {/* Librería alta contra la pared derecha (el estante va encima) */}
      <IsoBox p={0} q={0.24} sp={0.1} sq={0.48} h={112} top="#8f6c5a" left="#a97d5d" right="#7b5b4b" />
      {[30, 58, 86].map((h) =>
        Array.from({ length: 7 }, (_, i) => {
          const q = 0.27 + i * 0.062;
          const [x, y] = fl(0.1, q);
          return <rect key={`${h}-${i}`} x={x - 3} y={y - h - 20} width="6" height="20" fill={spines[(i + h) % spines.length]} />;
        }),
      )}
      {/* Cuadro y aplique en la pared izquierda */}
      <Frame side="l" u0={0.7} u1={0.9} h0={70} h1={104} inner="#e8dcc8" />
      <circle cx={lw(0.8, 87)[0]} cy={lw(0.8, 87)[1]} r="6" fill="#f0c36a" opacity="0.8" />
      {/* Mesita con pila de libros junto a la butaca */}
      <IsoBox p={0.36} q={0.02} sp={0.1} sq={0.1} h={26} top="#c9a27e" />
      <rect x="131" y="146" width="16" height="4" fill="#c79f86" />
      <rect x="133" y="142" width="13" height="4" fill="#8d9c7a" />
      {/* Pie de la lámpara de lectura */}
      <line x1="292" y1="215" x2="292" y2="192" stroke="#6b5a4c" strokeWidth="2.5" />
      <ellipse cx="292" cy="216" rx="9" ry="3.5" fill="#6b5a4c" />
      <ellipse cx="292" cy="180" rx="30" ry="20" fill="#f7d98b" opacity="0.28" className="breathe" style={{ transformOrigin: "292px 180px" }} />
    </g>
  );
}

function Respiracion() {
  return (
    <g>
      {/* Mural de círculos que respiran */}
      {[30, 22, 14].map((r, i) => {
        const [x, y] = rw(0.42, 78);
        return <ellipse key={r} cx={x} cy={y} rx={r} ry={r * 0.95} fill="none" stroke="#8fb1c4" strokeWidth="2" opacity={0.35 + i * 0.2} className="breathe" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.5}s` }} />;
      })}
      {/* Planta colgante con macramé, desde el techo */}
      {(() => {
        const [x, y] = lw(0.82, 72);
        const top = lw(0.82, 113)[1];
        return (
          <g className="swing">
            <line x1={x - 5} y1={top} x2={x} y2={y - 26} stroke="#c9b394" strokeWidth="1.2" />
            <line x1={x + 5} y1={top} x2={x} y2={y - 26} stroke="#c9b394" strokeWidth="1.2" />
            <Plant x={x} y={y} s={0.7} pot="#f3ead9" />
          </g>
        );
      })()}
      {/* Campanas de viento */}
      {(() => {
        const [x, y] = lw(0.66, 100);
        return (
          <g className="swing">
            <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="#8f6c5a" strokeWidth="2" />
            {[0, 1, 2].map((i) => (
              <line key={i} x1={x - 4 + i * 4} y1={y} x2={x - 4 + i * 4} y2={y + 14 + i * 4} stroke="#b8a97f" strokeWidth="2" />
            ))}
          </g>
        );
      })()}
      {/* Esterilla y cojines de suelo */}
      <FloorPatch p={0.36} q={0.6} sp={0.42} sq={0.18} fill="#a3c2b3" opacity="0.9" />
      <ellipse cx="128" cy="232" rx="20" ry="8" fill="#d6c3e3" />
      <ellipse cx="292" cy="182" rx="18" ry="7" fill="#f3d6c4" />
      {/* Piedras */}
      {[[150, 258], [162, 262], [172, 257]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={6 - i} ry={3} fill="#a6a08d" />
      ))}
    </g>
  );
}

function Jardin() {
  return (
    <g>
      {/* Paneles de invernadero */}
      {[0.2, 0.4, 0.6, 0.8].map((u) => (
        <path key={u} d={`M${rw(u, 0).join(" ")} L${rw(u, 125).join(" ")}`} stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
      ))}
      {/* Hiedra trepando */}
      {[0.9, 0.5].map((u, k) => {
        const [x, y] = rw(u, 0);
        return (
          <g key={u}>
            <path d={`M${x} ${y} q-8 -30 0 -60 t0 -60`} stroke="#5f8f4e" strokeWidth="2" fill="none" />
            {Array.from({ length: 6 }, (_, i) => (
              <ellipse key={i} cx={x + (i % 2 ? 5 : -5)} cy={y - 15 - i * 18} rx="5" ry="3" fill="#7fae6f" transform={`rotate(${i % 2 ? 30 : -30} ${x} ${y - 15 - i * 18})`} className={k === 0 ? "bob" : undefined} />
            ))}
          </g>
        );
      })}
      {/* Bancal de madera (la semilla va encima) */}
      <IsoBox p={0.05} q={0.55} sp={0.24} sq={0.36} h={18} top="#6b4b2a" left="#a97d5d" right="#8f6c5a">
        {[[0.12, 0.62], [0.2, 0.8], [0.1, 0.84]].map(([p, q], i) => {
          const [x, y] = fl(p, q);
          return (
            <g key={i}>
              <line x1={x} y1={y - 18} x2={x} y2={y - 30} stroke="#5f8f4e" strokeWidth="1.5" />
              <circle cx={x} cy={y - 32} r="3.5" fill={["#f3b6c8", "#f2c14e", "#a291b4"][i]} />
            </g>
          );
        })}
      </IsoBox>
      {/* Camino de piedras */}
      {[[150, 250], [175, 262], [200, 272]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="10" ry="4" fill="#cfc6b3" stroke="#b5ab97" />
      ))}
      <Plant x={60} y={212} s={0.9} />
      <Plant x={175} y={150} s={0.6} />
    </g>
  );
}

function Movimiento() {
  return (
    <g>
      {/* Espejo largo en la pared derecha (el objeto espejo va encima) */}
      <WallRect side="r" u0={0.3} u1={0.6} h0={18} h1={110} fill="#e4eef2" stroke="#bd9079" sw={3} />
      <path d={`M${rw(0.36, 40).join(" ")} L${rw(0.44, 96).join(" ")}`} stroke="#fff" strokeWidth="3" opacity="0.8" />
      {/* Espaldera en la pared izquierda */}
      {[0.68, 0.94].map((u) => (
        <path key={u} d={`M${lw(u, 0).join(" ")} L${lw(u, 112).join(" ")}`} stroke="#c9a27e" strokeWidth="3" />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${lw(0.68, 12 + i * 15).join(" ")} L${lw(0.94, 12 + i * 15).join(" ")}`} stroke="#c9a27e" strokeWidth="2" />
      ))}
      {/* Colchonetas de colores */}
      <FloorPatch p={0.42} q={0.38} sp={0.2} sq={0.3} fill="#9ccf8f" />
      <FloorPatch p={0.62} q={0.38} sp={0.2} sq={0.3} fill="#8fb8e0" />
      {/* Aro y conos */}
      <ellipse cx="318" cy="230" rx="18" ry="7" fill="none" stroke="#e88a7a" strokeWidth="3" />
      {[[108, 236], [140, 252]].map(([x, y], i) => (
        <path key={i} d={`M${x - 6} ${y} L${x} ${y - 14} L${x + 6} ${y} Z`} fill="#f0a35a" />
      ))}
    </g>
  );
}

function Estrellas() {
  return (
    <g>
      {/* Ventana redonda grande (la luna va dentro) */}
      <ellipse cx="280" cy="84" rx="34" ry="36" fill="#0d1024" stroke="#5a6190" strokeWidth="4" />
      <path d="M246 84h68M280 48v72" stroke="#5a6190" strokeWidth="2" />
      {/* Guirnalda de luces */}
      <path d={`M${lw(0.02, 125).join(" ")} Q${lw(0.5, 100).join(" ")} 200 28 Q${rw(0.5, 100).join(" ")} ${rw(0.98, 125).join(" ")}`} fill="none" stroke="#5a6190" strokeWidth="1" />
      {Array.from({ length: 14 }, (_, i) => {
        const t = i / 13;
        const x = 22 + t * 356;
        const y = 92 - Math.sin(t * Math.PI) * 48 + Math.abs(t - 0.5) * 40;
        return <circle key={i} cx={x} cy={y} r="2.6" fill={["#f6e7a6", "#f3b6c8", "#9fd3c7"][i % 3]} className="twinkle" style={{ animationDelay: `${(i % 5) * 0.5}s` }} />;
      })}
      {/* Futón con almohadas (la manta va encima) */}
      <IsoBox p={0.5} q={0.42} sp={0.32} sq={0.36} h={12} top="#3d4470" left="#353c63" right="#2c3254" />
      <ellipse cx="214" cy="212" rx="14" ry="6" fill="#d6dbf5" />
      {/* Mesita de noche (la lámpara va encima) */}
      <IsoBox p={0.7} q={0.1} sp={0.1} sq={0.1} h={24} top="#5b4a40" />
    </g>
  );
}

const DECOR: Record<string, () => ReactNode> = {
  vestibulo: Vestibulo,
  peluches: Peluches,
  instrumentos: Instrumentos,
  cocina: Cocina,
  creatividad: Creatividad,
  lectura: Lectura,
  respiracion: Respiracion,
  jardin: Jardin,
  movimiento: Movimiento,
  estrellas: Estrellas,
};

export function RoomDecor({ slug, active = true }: { slug: string; active?: boolean }) {
  const Decor = DECOR[slug];
  return Decor ? <g className={`room-decor ${active ? "" : "room-decor--quiet"}`}>{Decor()}</g> : null;
}

/** Ayuda para colocar objetos: convierte un punto del SVG a porcentaje de la escena. */
export const toPct = ([x, y]: Pt) => ({ x: Math.round((x / 400) * 100), y: Math.round((y / 300) * 100) });
export const decorGeometry = { lw, rw, fl };
