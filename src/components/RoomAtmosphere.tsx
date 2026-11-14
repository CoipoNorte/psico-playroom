import type { CSSProperties } from "react";

export interface AmbientState {
  windowOpen: boolean;
  detailOn: boolean;
}

export const AMBIENT_COPY: Record<string, { detail: [string, string]; window: [string, string]; message: [string, string] }> = {
  vestibulo: { detail: ["Encender la lámpara", "Apagar la lámpara"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["La luz de la entrada da la bienvenida.", "El vestíbulo queda a media luz."] },
  peluches: { detail: ["Encender los farolillos", "Apagar los farolillos"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["Los farolillos acompañan sin hacer ruido.", "Los peluches descansan a la luz del día."] },
  instrumentos: { detail: ["Dar vida al pentagrama", "Dejar el pentagrama quieto"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["Las notas pasean por la pared.", "La sala escucha en silencio."] },
  cocina: { detail: ["Poner agua a calentar", "Apagar el fogón"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["El vapor sube despacio desde la cocina.", "El fogón se queda en reposo."] },
  creatividad: { detail: ["Soltar los colores", "Recoger los colores"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["Los colores se pasean por el taller.", "El taller se queda listo para empezar de nuevo."] },
  lectura: { detail: ["Encender la luz de lectura", "Apagar la luz de lectura"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["Una luz cálida acompaña a los libros.", "Las páginas esperan en silencio."] },
  respiracion: { detail: ["Dejar pasar la brisa", "Dejar el aire quieto"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["Una brisa suave recorre la habitación.", "El aire se queda en calma."] },
  jardin: { detail: ["Dejar entrar el sol", "Buscar un poco de sombra"], window: ["Abrir el invernadero", "Cerrar el invernadero"], message: ["La luz llega a las hojas.", "El jardín descansa a la sombra."] },
  movimiento: { detail: ["Poner la sala en movimiento", "Dejar la sala quieta"], window: ["Abrir la ventana", "Cerrar la ventana"], message: ["Las cintas dibujan caminos en el aire.", "Hay espacio para quedarse quieto."] },
  estrellas: { detail: ["Encender las estrellas", "Dejar el cielo tranquilo"], window: ["Abrir el mirador", "Cerrar el mirador"], message: ["El cielo tiene un poco más de luz.", "La noche se queda serena."] },
};

const motes = [
  [52, 58, 2.1], [89, 34, 1.2], [130, 60, 1.5], [175, 78, 1.1],
  [225, 65, 1.3], [270, 55, 1.8], [320, 88, 1.3], [345, 135, 1],
] as const;

function WindowLight({ open, night }: { open: boolean; night: boolean }) {
  if (!open) return null;
  return (
    <g pointerEvents="none">
      <path d="M63 156 127 130 238 270 164 246Z" fill={night ? "#9ea8ec" : "#fff5ce"} opacity={night ? 0.08 : 0.25} className="atmosphere-light" />
      <path d="M63 157 128 130 204 239 177 231Z" fill={night ? "#d2d9ff" : "#fff9dc"} opacity={night ? 0.08 : 0.16} />
      {motes.slice(0, 4).map(([x, y, r], i) => (
        <circle key={i} cx={x + 42} cy={y + 95} r={r} fill={night ? "#f9edc8" : "#ffffff"} className="atmosphere-mote" style={{ animationDelay: `${i * -1.2}s` }} />
      ))}
    </g>
  );
}

/** Ambient SVG stays behind the draggable objects and never intercepts pointer events. */
export function RoomAtmosphere({ slug, state }: { slug: string; state: AmbientState }) {
  const night = slug === "estrellas";
  const on = state.detailOn;
  return (
    <g aria-hidden="true" pointerEvents="none" className="room-atmosphere">
      <WindowLight open={state.windowOpen} night={night} />
      {on && slug === "vestibulo" && (
        <g>
          <ellipse cx="200" cy="51" rx="46" ry="21" fill="#ffe6a5" opacity="0.37" className="atmosphere-light" />
          <path d="M200 43 145 199 246 188Z" fill="#ffe6a5" opacity="0.08" />
          {motes.slice(0, 5).map(([x, y, r], i) => <circle key={i} cx={x + 40} cy={y + 53} r={r} fill="#f7d884" className="atmosphere-mote" style={{ animationDelay: `${i * -0.7}s` }} />)}
        </g>
      )}
      {on && slug === "peluches" && (
        <g>
          {motes.map(([x, y], i) => <circle key={i} cx={x + 20} cy={y + 25} r={2 + i % 2} fill={["#f6ddab", "#e8b6bf", "#f4e6d6"][i % 3]} className="atmosphere-glimmer" style={{ animationDelay: `${i * -0.43}s` }} />)}
          <ellipse cx="200" cy="210" rx="100" ry="42" fill="#f7d8ae" opacity="0.09" />
        </g>
      )}
      {on && slug === "instrumentos" && (
        <g fill="#76668f">
          {["♪", "♫", "♬", "♪", "♩"].map((note, i) => <text key={i} x={160 + i * 33} y={195 - (i % 2) * 18} fontSize={12 + i % 3 * 4} className="atmosphere-note" style={{ animationDelay: `${i * -1.3}s` }}>{note}</text>)}
        </g>
      )}
      {on && slug === "cocina" && (
        <g>
          <ellipse cx="273" cy="166" rx="21" ry="8" fill="#ffdc98" opacity="0.42" className="atmosphere-light" />
          {[0, 1, 2, 3].map(i => <path key={i} d={`M${262 + i * 7} 162 q-8 -10 1 -19 t1 -19`} fill="none" stroke="#fffdf1" strokeWidth="2" opacity="0.58" strokeLinecap="round" className="atmosphere-steam" style={{ animationDelay: `${i * -0.48}s` }} />)}
        </g>
      )}
      {on && slug === "creatividad" && (
        <g>
          {["#e78b7a", "#e3bb72", "#8dbb98", "#9c9bc4", "#f3c5ac", "#82b8c5"].map((color, i) => <circle key={i} cx={124 + i * 26} cy={190 + (i % 3) * 12} r={3 + i % 3} fill={color} className="atmosphere-color" style={{ animationDelay: `${i * -0.54}s`, "--color-x": `${(i % 2 ? 1 : -1) * (13 + i * 4)}px` } as CSSProperties} />)}
        </g>
      )}
      {on && slug === "lectura" && (
        <g>
          <ellipse cx="292" cy="180" rx="48" ry="34" fill="#ffeab4" opacity="0.24" className="atmosphere-light" />
          <path d="M294 185 226 278 325 246Z" fill="#ffeab4" opacity="0.11" />
          {motes.slice(0, 5).map(([x, y, r], i) => <circle key={i} cx={226 + (x % 84)} cy={188 + (y % 60)} r={r} fill="#fff9df" className="atmosphere-mote" style={{ animationDelay: `${i * -0.9}s` }} />)}
        </g>
      )}
      {on && slug === "respiracion" && (
        <g fill="none" stroke="#86bac6">
          {[0, 1, 2].map(i => <circle key={i} cx="200" cy="220" r={14 + i * 24} strokeWidth="1.5" strokeOpacity="0.45" className="atmosphere-breath" style={{ animationDelay: `${i * -1.4}s` }} />)}
          {motes.slice(0, 4).map(([x, y, r], i) => <circle key={i} cx={x + 40} cy={y + 55} r={r + 2} fill="#e4f8fa" opacity="0.8" className="atmosphere-mote" style={{ animationDelay: `${i * -1}s` }} />)}
        </g>
      )}
      {on && slug === "jardin" && (
        <g>
          <ellipse cx="282" cy="84" rx="31" ry="28" fill="#ffe59b" opacity="0.26" className="atmosphere-light" />
          <path d="M262 86 147 275 277 230Z" fill="#ffe7a3" opacity="0.11" />
          {motes.slice(0, 6).map(([x, y], i) => <circle key={i} cx={50 + x * 0.85} cy={130 + y * 0.55} r={1.7} fill="#faf5c2" className="atmosphere-mote" style={{ animationDelay: `${i * -0.7}s` }} />)}
        </g>
      )}
      {on && slug === "movimiento" && (
        <g fill="none" strokeLinecap="round">
          {[["#e7a59a", 0], ["#a79cc4", 1], ["#91b8aa", 2]].map(([color, i]) => <path key={i} d={`M${70 + Number(i) * 38} 255 q45 -66 100 -34 t100 -40`} stroke={String(color)} strokeWidth="2" opacity="0.56" strokeDasharray="3 8" className="atmosphere-ribbon" style={{ animationDelay: `${Number(i) * -0.7}s` }} />)}
        </g>
      )}
      {on && slug === "estrellas" && (
        <g>
          {motes.map(([x, y, r], i) => <circle key={i} cx={x + 11} cy={y + 12} r={r + 0.4} fill="#fff0bf" className="atmosphere-glimmer" style={{ animationDelay: `${i * -0.55}s` }} />)}
          <path d="M329 66 292 86" stroke="#fff4cd" strokeWidth="1.8" strokeLinecap="round" className="atmosphere-shoot" />
        </g>
      )}
    </g>
  );
}