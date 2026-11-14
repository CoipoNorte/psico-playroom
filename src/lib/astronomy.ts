// Datos y cálculos astronómicos compartidos por el mapa orbital (opción A)
// y el modelo 3D (opción B). Sin servicios externos ni assets.
// Posiciones: elementos orbitales medios J2000 (aprox. 1 grado de precisión).

export const D2R = Math.PI / 180;
export const DAY = 86400000;
export const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
export const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

export const fmt = (v: number, d = 1) =>
  v.toLocaleString("es", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Edad de la Luna, en días desde la luna nueva, en un instante dado. */
export function moonAgeAt(ms: number): number {
  const days = (ms - KNOWN_NEW_MOON) / DAY;
  return ((days % SYNODIC) + SYNODIC) % SYNODIC;
}

export function phaseName(age: number): string {
  const p = age / SYNODIC;
  if (p < 0.03 || p > 0.97) return "Luna nueva";
  if (p < 0.22) return "Luna creciente";
  if (p < 0.28) return "Cuarto creciente";
  if (p < 0.47) return "Gibosa creciente";
  if (p < 0.53) return "Luna llena";
  if (p < 0.72) return "Gibosa menguante";
  if (p < 0.78) return "Cuarto menguante";
  return "Luna menguante";
}

export function dateFromDays(days: number, from = Date.now()): number {
  return from + days * DAY;
}

export interface Elements {
  a: number;
  ad: number;
  e: number;
  ed: number;
  i: number;
  id: number;
  L: number;
  Ld: number;
  lp: number;
  lpd: number;
  n: number;
  nd: number;
}

export const ELEMENTS: Record<string, Elements> = {
  Mercurio: { a: 0.38709927, ad: 0.00000037, e: 0.20563593, ed: 0.00001906, i: 7.00497902, id: -0.00594749, L: 252.2503235, Ld: 149472.67411175, lp: 77.45779628, lpd: 0.16047689, n: 48.33076593, nd: -0.12534081 },
  Venus: { a: 0.72333566, ad: 0.0000039, e: 0.00677672, ed: -0.00004107, i: 3.39467605, id: -0.0007889, L: 181.9790995, Ld: 58517.81538729, lp: 131.60246718, lpd: 0.00268329, n: 76.67984255, nd: -0.27769418 },
  Tierra: { a: 1.00000261, ad: 0.00000562, e: 0.01671123, ed: -0.00004392, i: -0.00001531, id: -0.01294668, L: 100.46457166, Ld: 35999.37244981, lp: 102.93768193, lpd: 0.32327364, n: 0, nd: 0 },
  Marte: { a: 1.52371034, ad: 0.00001847, e: 0.0933941, ed: 0.00007882, i: 1.84969142, id: -0.00813131, L: -4.55343205, Ld: 19140.30268499, lp: -23.94362959, lpd: 0.44441088, n: 49.55953891, nd: -0.29257343 },
  Júpiter: { a: 5.202887, ad: -0.00011607, e: 0.04838624, ed: -0.00013253, i: 1.30439695, id: -0.00183714, L: 34.39644051, Ld: 3034.74612775, lp: 14.72847983, lpd: 0.21252668, n: 100.47390909, nd: 0.20469106 },
  Saturno: { a: 9.53667594, ad: -0.0012506, e: 0.05386179, ed: -0.00050991, i: 2.48599187, id: 0.00193609, L: 49.95424423, Ld: 1222.49362201, lp: 92.59887831, lpd: -0.41897216, n: 113.66242448, nd: -0.28867794 },
  Urano: { a: 19.18916464, ad: -0.00196176, e: 0.04725744, ed: -0.00004397, i: 0.77263783, id: -0.00242939, L: 313.23810451, Ld: 428.48202785, lp: 170.9542763, lpd: 0.40805281, n: 74.01692503, nd: 0.04240589 },
  Neptuno: { a: 30.06992276, ad: 0.00026291, e: 0.00859048, ed: 0.00005105, i: 1.77004347, id: 0.00035372, L: -55.12002969, Ld: 218.45945325, lp: 44.96476227, lpd: -0.32241464, n: 131.78422574, nd: -0.00508664 },
};

export type Vec = [number, number, number];

/** Posición heliocéntrica en la eclíptica, en UA. T = siglos julianos desde J2000. */
export function helio(el: Elements, T: number): Vec {
  const a = el.a + el.ad * T;
  const e = el.e + el.ed * T;
  const inc = (el.i + el.id * T) * D2R;
  const L = el.L + el.Ld * T;
  const lp = el.lp + el.lpd * T;
  const node = (el.n + el.nd * T) * D2R;
  const w = lp * D2R - node;
  let m = (L - lp) % 360;
  if (m < -180) m += 360;
  if (m > 180) m -= 360;
  const M = m * D2R;
  let E = M + e * Math.sin(M);
  for (let k = 0; k < 8; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xo = a * (Math.cos(E) - e);
  const yo = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(w);
  const sw = Math.sin(w);
  const cn = Math.cos(node);
  const sn = Math.sin(node);
  const ci = Math.cos(inc);
  const si = Math.sin(inc);
  return [
    (cn * cw - sn * sw * ci) * xo + (-cn * sw - sn * cw * ci) * yo,
    (sn * cw + cn * sw * ci) * xo + (-sn * sw + cn * cw * ci) * yo,
    sw * si * xo + cw * si * yo,
  ];
}

export function planetVec(ms: number, key: string): Vec {
  return helio(ELEMENTS[key], (ms - J2000) / DAY / 36525);
}

export const dist3 = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Radio de dibujo en 2D: escala suave para que los planetas internos no se amontonen. */
export const RADIUS2D = (au: number) => 36 + 210 * Math.sqrt(au / 30);

/** Radio orbital en el modelo 3D (no está a escala real). */
export const RADIUS3D = (au: number) => 14 + 132 * Math.sqrt(au / 30);

export interface MoonDef {
  name: string;
  parent: string;
  /** Período orbital real, en días. */
  period: number;
  /** Distancia al planeta en unidades del dibujo (no real). */
  orbit: number;
  /** Tamaño en el dibujo. */
  size: number;
  color: string;
  /** Fase inicial, en radianes. */
  phase: number;
  /** Inclinación del plano de la órbita en el dibujo, en grados. */
  tilt: number;
  fact: string;
}

/** Lunas principales. Períodos orbitales reales; distancias y tamaños exagerados para poder verlas. */
export const MOONS: MoonDef[] = [
  { name: "Luna", parent: "Tierra", period: 27.322, orbit: 4.2, size: 0.55, color: "#d8d4c6", phase: 0.3, tilt: 5.1, fact: "Siempre nos muestra la misma cara: gira sobre sí en lo que tarda en dar la vuelta." },
  { name: "Fobos", parent: "Marte", period: 0.319, orbit: 2.6, size: 0.26, color: "#b9a894", phase: 0.8, tilt: 1.1, fact: "Da dos vueltas a Marte en un día marciano. Es una luna muy pequeña y con forma de patata." },
  { name: "Deimos", parent: "Marte", period: 1.263, orbit: 3.8, size: 0.22, color: "#c5b6a3", phase: 2.2, tilt: 1.8, fact: "Se aleja de Marte muy despacio, unos centímetros por siglo." },
  { name: "Ío", parent: "Júpiter", period: 1.769, orbit: 7.0, size: 0.62, color: "#e8d484", phase: 0.2, tilt: 0.4, fact: "Es el mundo con más volcanes activos del sistema solar." },
  { name: "Europa", parent: "Júpiter", period: 3.551, orbit: 9.0, size: 0.56, color: "#e6d9c2", phase: 1.4, tilt: 0.5, fact: "Bajo su corteza de hielo hay probablemente un océano de agua salada." },
  { name: "Ganímedes", parent: "Júpiter", period: 7.155, orbit: 11.2, size: 0.76, color: "#b6a68f", phase: 2.8, tilt: 0.3, fact: "Es la luna más grande del sistema solar, más grande que Mercurio." },
  { name: "Calisto", parent: "Júpiter", period: 16.689, orbit: 13.6, size: 0.7, color: "#8f8072", phase: 4.1, tilt: 0.4, fact: "Su superficie es una de las más antiguas y craterizadas que conocemos." },
  { name: "Mimas", parent: "Saturno", period: 0.942, orbit: 6.0, size: 0.3, color: "#d9d2c2", phase: 0.7, tilt: 1.5, fact: "Un cráter enorme le da un parecido curioso con una nave de películas." },
  { name: "Encélado", parent: "Saturno", period: 1.37, orbit: 7.8, size: 0.34, color: "#f0f3f2", phase: 2.1, tilt: 0.2, fact: "Lanza chorros de agua helada al espacio desde su polo sur." },
  { name: "Titán", parent: "Saturno", period: 15.945, orbit: 11.4, size: 0.8, color: "#d9a95f", phase: 3.4, tilt: 0.3, fact: "Tiene una atmósfera densa y lagos de metano líquido en la superficie." },
  { name: "Rea", parent: "Saturno", period: 4.518, orbit: 9.5, size: 0.44, color: "#cfc9bd", phase: 5.0, tilt: 0.3, fact: "Es la segunda luna más grande de Saturno y está cubierta de hielo." },
  { name: "Titania", parent: "Urano", period: 8.706, orbit: 6.4, size: 0.5, color: "#c8d2d2", phase: 1.1, tilt: 0.3, fact: "La luna más grande de Urano, con cañones profundos sobre hielo." },
  { name: "Oberón", parent: "Urano", period: 13.463, orbit: 8.4, size: 0.46, color: "#b7bfc0", phase: 3.0, tilt: 0.3, fact: "La más exterior de las lunas grandes de Urano; tiene cráteres muy oscuros." },
  { name: "Tritón", parent: "Neptuno", period: -5.877, orbit: 5.6, size: 0.6, color: "#dbc9c6", phase: 2.4, tilt: 156, fact: "Gira al revés que Neptuno: probablemente fue capturada por su gravedad." },
];

export interface BodyDef {
  key: string;
  color: string;
  spot: string;
  /** Tamaño en el mapa 2D. */
  size: number;
  /** Segundos por giro decorativo en 2D. */
  spin: number;
  /** Radio en el modelo 3D. */
  r3: number;
  /** Rotación sidérea real, en días (negativo = gira al revés). */
  rotDays: number;
  /** Inclinación del eje, en grados. */
  tilt: number;
  /** Estilo de textura procedural. */
  texture: "rock" | "cloud" | "earth" | "desert" | "bands" | "ice" | "deep";
  ring?: boolean;
  period: string;
  fact: string;
  thought: string;
}

export const BODIES: BodyDef[] = [
  { key: "Mercurio", color: "#b8ada0", spot: "#7d7468", size: 4, spin: 26, r3: 1.1, rotDays: 58.646, tilt: 0.03, texture: "rock", period: "88 días", fact: "Es el planeta más cercano al Sol y el que más rápido se mueve.", thought: "Ir rápido no lo hace llegar antes a ningún lado: solo da más vueltas." },
  { key: "Venus", color: "#e8c88a", spot: "#c2a262", size: 7, spin: 34, r3: 1.7, rotDays: -243.025, tilt: 177.4, texture: "cloud", period: "225 días", fact: "Gira al revés que casi todos los demás, y muy despacio: un día venusino dura más que su año.", thought: "Hacer las cosas en otro orden también es una forma de hacerlas." },
  { key: "Tierra", color: "#6fa4d8", spot: "#7fb36a", size: 7.5, spin: 12, r3: 1.8, rotDays: 0.99727, tilt: 23.44, texture: "earth", period: "365 días", fact: "Es el único lugar que conocemos con agua líquida en la superficie.", thought: "Desde fuera no se ven fronteras ni prisas. Solo una esfera azul respirando." },
  { key: "Marte", color: "#d08860", spot: "#9c5a3c", size: 5.5, spin: 14, r3: 1.4, rotDays: 1.026, tilt: 25.19, texture: "desert", period: "687 días", fact: "Tiene el volcán más alto del sistema solar, Olympus Mons: unas dos veces y media el Everest.", thought: "Es rojo por el óxido de su superficie: incluso un planeta cambia con el tiempo." },
  { key: "Júpiter", color: "#d9b48c", spot: "#a8704a", size: 16, spin: 6, r3: 4.6, rotDays: 0.41354, tilt: 3.13, texture: "bands", period: "11,9 años", fact: "Cabrían más de mil Tierras dentro. Su Gran Mancha Roja es una tormenta observada desde hace siglos.", thought: "Una tormenta puede durar siglos y, aun así, no ser todo el planeta." },
  { key: "Saturno", color: "#e6d3a3", spot: "#b99e6a", size: 13, spin: 9, r3: 3.9, rotDays: 0.444, tilt: 26.73, texture: "bands", ring: true, period: "29,5 años", fact: "Sus anillos son sobre todo hielo y roca, y de perfil casi desaparecen.", thought: "Lo que lo hace único es tan delicado que a veces no se ve. Igual sigue ahí." },
  { key: "Urano", color: "#9fd6dd", spot: "#6fb0ba", size: 10, spin: 16, r3: 2.8, rotDays: -0.718, tilt: 97.77, texture: "ice", period: "84 años", fact: "Gira casi acostado, con el eje inclinado unos 98 grados.", thought: "Hay más de una manera de girar alrededor de lo mismo." },
  { key: "Neptuno", color: "#5f7fd6", spot: "#3f5aa8", size: 9.5, spin: 11, r3: 2.7, rotDays: 0.671, tilt: 28.32, texture: "deep", period: "165 años", fact: "Desde su descubrimiento en 1846 ya ha dado una vuelta completa al Sol.", thought: "Algunas cosas llevan más de una vida entera. Y están bien así." },
];

export const SPEEDS = [
  { label: "Reloj real", days: 1 / 86400 },
  { label: "1 día/s", days: 1 },
  { label: "1 semana/s", days: 7 },
  { label: "1 mes/s", days: 30.44 },
  { label: "1 año/s", days: 365.25 },
];

export const MOONS_OF = (planet: string) => MOONS.filter((m) => m.parent === planet);
