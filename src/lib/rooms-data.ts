// Catálogo fijo de la casa. Se sirve desde código (no requiere base de datos).
// Las formas de `Room` y `RoomObject` siguen el esquema de `refugio_rooms`.

export type Voice = "soft" | "pluck" | "bell" | "flute" | "drum" | "shaker";

export type ArtKey =
  | "xilofono"
  | "flauta"
  | "pandereta"
  | "burbujas"
  | "plastilina"
  | "delantal"
  | "manta"
  | "cojin"
  | "regadera";

export interface ObjectDef {
  label: string;
  /** Emoji que representa el objeto (si no hay uno fiel, se usa `art`). */
  emoji?: string;
  /** Ilustración SVG propia. */
  art?: ArtKey;
  /** Entre 2 y 4 frases cálidas y no directivas. */
  messages: string[];
  /** Frecuencias (Hz) que se recorren en cada toque. */
  notes: number[];
  voice?: Voice;
  /** Emojis de crecimiento (p. ej. la planta del jardín). */
  stages?: string[];
  /** Objeto cuyo uso hace avanzar `stages`. */
  stageBy?: string;
}

export interface RoomObject {
  kind: string;
  x: number;
  y: number;
}

export interface Room {
  slug: string;
  name: string;
  category: string;
  minAge: number;
  emoji: string;
  description: string;
  welcome: string;
  ambience: { wall: string; floor: string; rug: string };
  objects: RoomObject[];
  dark?: boolean;
}

const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392.0, A4 = 440.0;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.0;
const C3 = 130.81, G3 = 196.0, A3 = 220.0;

export const OBJECTS: Record<string, ObjectDef> = {
  /* ---------- Vestíbulo ---------- */
  perchero: {
    label: "Perchero",
    emoji: "🧥",
    notes: [C4, E4],
    messages: [
      "Aquí puedes dejar colgado lo que pesa, aunque sea por un rato.",
      "No hace falta traer nada especial para entrar.",
      "Lo que dejes aquí te espera a la salida, si lo quieres de vuelta.",
    ],
  },
  "reloj-pared": {
    label: "Reloj de pared",
    emoji: "🕰️",
    notes: [G4, E4],
    voice: "bell",
    messages: [
      "En esta casa el tiempo no apura a nadie.",
      "Puedes quedarte un minuto o una tarde entera.",
    ],
  },
  "banco-entrada": {
    label: "Banco de la entrada",
    emoji: "🪑",
    notes: [C4],
    messages: [
      "Puedes sentarte un momento antes de decidir a dónde ir.",
      "No elegir todavía también es una opción.",
      "A veces llegar ya es suficiente.",
    ],
  },
  "planta-entrada": {
    label: "Planta de la entrada",
    emoji: "🪴",
    notes: [E4, G4],
    messages: [
      "Esta planta no hace nada especial. Solo está, y eso basta.",
      "Crece despacio, sin que nadie la mire.",
    ],
  },
  llaves: {
    label: "Llavero",
    emoji: "🗝️",
    notes: [E5, G5, A5],
    voice: "bell",
    messages: [
      "Todas las puertas de esta casa están abiertas para ti.",
      "No necesitas llave ni permiso para entrar a ninguna habitación.",
    ],
  },
  paraguas: {
    label: "Paraguas",
    emoji: "☂️",
    notes: [D4, A4],
    messages: [
      "Si afuera llueve, aquí dentro puedes secarte con calma.",
      "Hay días de lluvia. También pasan.",
      "Puedes dejarlo abierto para que se seque; nadie tiene prisa.",
    ],
  },

  /* ---------- Peluches ---------- */
  oso: {
    label: "Oso de peluche",
    emoji: "🧸",
    notes: [C4, E4, G4],
    messages: [
      "Puedes tomar el oso y contarle algo, o solo quedarte en silencio.",
      "El oso escucha sin interrumpir y sin dar consejos.",
      "Si quieres, imagina un abrazo del tamaño que necesites.",
      "No tienes que explicarle nada. Él se queda igual.",
    ],
  },
  conejo: {
    label: "Conejo de peluche",
    emoji: "🐰",
    notes: [E4, G4, C5],
    messages: [
      "El conejo tiene las orejas largas para escuchar bajito.",
      "Puedes contarle un secreto pequeño. Se queda aquí.",
      "A veces el conejo también se asusta, y está bien.",
    ],
  },
  manta: {
    label: "Manta suave",
    art: "manta",
    notes: [C4, G3],
    messages: [
      "Puedes imaginar que la manta te envuelve los hombros.",
      "Debajo de una manta el mundo se vuelve un poco más pequeño y manejable.",
      "Es suave por los dos lados. Elige el que prefieras.",
    ],
  },
  cojin: {
    label: "Cojín",
    art: "cojin",
    notes: [D4, G4],
    messages: [
      "Un cojín sirve para apoyarse. Tú decides cómo.",
      "Puedes abrazarlo fuerte; aguanta todo.",
      "Si necesitas descansar la cabeza, aquí hay sitio.",
    ],
  },
  "espejo-emociones": {
    label: "Espejo de emociones",
    emoji: "🪞",
    notes: [A4, E5],
    voice: "bell",
    messages: [
      "Si te miras un momento, ¿qué cara tiene lo que sientes hoy?",
      "Todas las caras son bienvenidas en este espejo.",
      "No hace falta ponerle nombre. Mirar ya es bastante.",
    ],
  },

  /* ---------- Instrumentos ---------- */
  tambor: {
    label: "Tambor",
    emoji: "🥁",
    notes: [C3, C3, G3],
    voice: "drum",
    messages: [
      "Puedes tocar al ritmo que traigas hoy, rápido o lento.",
      "Un golpe, una pausa. La pausa también es música.",
      "Si quieres, busca el ritmo de tu corazón.",
    ],
  },
  xilofono: {
    label: "Xilófono",
    art: "xilofono",
    notes: [C5, D5, E5, G5, A5, G5, E5, D5],
    voice: "pluck",
    messages: [
      "Cada toque suena una nota distinta. No hay notas equivocadas.",
      "Puedes subir y bajar por los colores, sin partitura.",
      "Una melodía puede ser de solo dos notas.",
    ],
  },
  flauta: {
    label: "Flauta",
    art: "flauta",
    notes: [G4, A4, C5, A4],
    voice: "flute",
    messages: [
      "La flauta suena con aire. Si quieres, suelta el tuyo despacio.",
      "Un sonido largo, como un suspiro que se oye.",
      "Puedes escucharla hasta que se apague sola.",
    ],
  },
  campana: {
    label: "Campana",
    emoji: "🔔",
    notes: [E5, C5],
    voice: "bell",
    messages: [
      "Puedes seguir el sonido hasta que ya no lo escuches.",
      "Una campana marca un comienzo, o una pausa. Tú eliges cuál.",
    ],
  },
  pandereta: {
    label: "Pandereta",
    art: "pandereta",
    notes: [1],
    voice: "shaker",
    messages: [
      "Sacudir algo a veces ayuda a soltar lo que sobra.",
      "Puedes agitarla fuerte o muy, muy suave.",
      "El ruido también puede ser alegría.",
    ],
  },

  /* ---------- Cocina ---------- */
  olla: {
    label: "Olla",
    emoji: "🍲",
    notes: [C4, E4],
    messages: [
      "Las cosas buenas se cocinan a fuego lento.",
      "Puedes imaginar el olor de algo que te gusta.",
      "No hay que vigilarla todo el tiempo. Hierve sola.",
    ],
  },
  taza: {
    label: "Taza",
    emoji: "☕",
    notes: [G4, E4],
    messages: [
      "Una taza caliente entre las manos puede ser un pequeño descanso.",
      "Si quieres, imagina el calor subiendo despacio por los dedos.",
      "Puedes prepararte algo rico después, sin apuro.",
    ],
  },
  cuchara: {
    label: "Cuchara de madera",
    emoji: "🥄",
    notes: [A4, G4, E4],
    voice: "pluck",
    messages: [
      "Remover despacio también es una forma de respirar.",
      "Una vuelta, otra vuelta. No hay que llegar a ningún lado.",
    ],
  },
  frutas: {
    label: "Frutas",
    emoji: "🍎",
    notes: [E4, A4],
    messages: [
      "¿Hay algún sabor que te haga sentir en casa?",
      "Cuidarte puede empezar por algo pequeño, como una fruta.",
      "Puedes elegir la que más te guste. Hoy mandas tú.",
    ],
  },
  delantal: {
    label: "Delantal",
    art: "delantal",
    notes: [D4, G4],
    messages: [
      "Ponerse el delantal es decir: ahora me dedico un rato.",
      "Mancharse es parte de cocinar. No pasa nada.",
    ],
  },

  /* ---------- Creatividad ---------- */
  lienzo: {
    label: "Lienzo",
    emoji: "🖼️",
    notes: [C4, G4],
    messages: [
      "Un lienzo en blanco no pide nada. Puede quedarse así.",
      "Aquí no hay dibujos feos ni bonitos, solo tuyos.",
      "Toca el lienzo para abrir uno de verdad y trazar algo, si te apetece.",
    ],
  },
  pinceles: {
    label: "Pinceles",
    emoji: "🖌️",
    notes: [E4, G4, A4],
    voice: "pluck",
    messages: [
      "Una sola línea ya es un dibujo.",
      "Puedes pintar cómo te sientes sin usar ninguna palabra.",
      "El pincel va a donde tú quieras, incluso fuera del borde.",
    ],
  },
  crayones: {
    label: "Crayones",
    emoji: "🖍️",
    notes: [C5, E5, G5],
    voice: "pluck",
    messages: [
      "¿De qué color es este momento?",
      "Puedes rayar fuerte. El papel aguanta.",
      "Mezclar colores que no combinan también está permitido.",
    ],
  },
  plastilina: {
    label: "Plastilina",
    art: "plastilina",
    notes: [D4, C4],
    messages: [
      "Apretar, estirar, aplastar. Las manos también piensan.",
      "Si no te gusta lo que salió, se vuelve bolita y ya.",
      "No tiene que parecerse a nada.",
    ],
  },
  papel: {
    label: "Hojas de papel",
    emoji: "📄",
    notes: [G4, D5],
    messages: [
      "Un papel se puede doblar, arrugar o guardar.",
      "Lo que pongas aquí no tiene que verlo nadie.",
    ],
  },

  tangram: {
    label: "Tangram",
    emoji: "🔷",
    notes: [E4, G4, C5],
    voice: "pluck",
    messages: [
      "Siete piezas. Con ellas se puede hacer casi cualquier cosa, pero no hace falta hacer nada.",
      "Girar una pieza a veces cambia todo el dibujo.",
      "Si no encaja, no es que esté mal: es que todavía no encontró su sitio.",
    ],
  },

  /* ---------- Lectura ---------- */
  libro: {
    label: "Libro abierto",
    emoji: "📖",
    notes: [C4, E4, G4],
    messages: [
      "Puedes leer una página, una línea o solo mirar los dibujos.",
      "Los cuentos esperan. No se enojan si los dejas a la mitad.",
      "En el panel de actividad hay un cuento corto, por si quieres compañía.",
    ],
  },
  "lampara-lectura": {
    label: "Lámpara de lectura",
    emoji: "🪔",
    notes: [E4, A4],
    messages: [
      "Una luz pequeña alcanza para leer y para estar.",
      "La luz cálida suele aflojar un poco los hombros.",
    ],
  },
  butaca: {
    label: "Butaca",
    emoji: "🛋️",
    notes: [C4, G3],
    messages: [
      "Puedes acomodarte como quieras: de lado, con los pies arriba.",
      "Esta butaca ya conoce todas las formas de sentarse.",
      "Quedarse un rato sin hacer nada también cuenta.",
    ],
  },
  estante: {
    label: "Estante de libros",
    emoji: "📚",
    notes: [D4, G4, A4],
    voice: "pluck",
    messages: [
      "Hay historias de valentía, de miedo y de las dos cosas a la vez.",
      "¿Qué historia te gustaría que existiera?",
      "Algunos libros se leen muchas veces. Eso no es repetir, es volver.",
    ],
  },
  marcador: {
    label: "Marcapáginas",
    emoji: "🔖",
    notes: [A4],
    voice: "pluck",
    messages: [
      "Puedes parar aquí. El marcador guarda tu lugar.",
      "Detenerse no es abandonar.",
    ],
  },

  /* ---------- Respiración ---------- */
  burbujas: {
    label: "Burbujas",
    art: "burbujas",
    notes: [C5, E5, G5, A5],
    voice: "bell",
    messages: [
      "Para hacer una burbuja grande hay que soplar muy despacio.",
      "Puedes mirar cómo flotan y se van sin que nadie las empuje.",
      "Si quieres, sopla una ahora mismo, de mentira.",
    ],
  },
  globo: {
    label: "Globo",
    emoji: "🎈",
    notes: [G4, C5],
    messages: [
      "Tu barriga puede inflarse como un globo cuando entra el aire.",
      "Y desinflarse despacio cuando sale. Sin esfuerzo.",
      "Un globo no se llena de golpe. Tú tampoco tienes que hacerlo.",
    ],
  },
  vela: {
    label: "Vela",
    emoji: "🕯️",
    notes: [E4, G4],
    messages: [
      "Puedes soplar tan suave que la llama solo baile.",
      "Mirar una llama un momento a veces calma el ruido de adentro.",
    ],
  },
  "reloj-arena": {
    label: "Reloj de arena",
    emoji: "⏳",
    notes: [A4, G4, E4, C4],
    voice: "pluck",
    messages: [
      "La arena cae a su ritmo. No se puede apurar.",
      "Lo que dura un reloj de arena, puede durar tu pausa.",
      "Cuando termine, puedes darle la vuelta. O no.",
    ],
  },

  /* ---------- Jardín ---------- */
  maceta: {
    label: "Maceta",
    emoji: "🌱",
    stages: ["🌱", "🌿", "🪴", "🌷"],
    stageBy: "regadera",
    notes: [C4, E4, G4],
    messages: [
      "Esta planta crece cuando la riegas, y también cuando no la miras.",
      "No puedes hacer que crezca más rápido. Solo acompañarla.",
      "Cada hoja nueva tardó lo que tenía que tardar.",
    ],
  },
  regadera: {
    label: "Regadera",
    art: "regadera",
    notes: [G5, E5, C5],
    voice: "pluck",
    messages: [
      "Un poco de agua. La planta toma lo que necesita.",
      "Regar es una forma de decir: aquí estoy.",
      "Puedes volver a regar cuando quieras. La maceta lo nota.",
    ],
  },
  semilla: {
    label: "Semilla",
    emoji: "🌰",
    notes: [C4],
    messages: [
      "Por fuera no parece que pase nada. Por dentro, sí.",
      "Esperar también es hacer algo.",
      "¿Qué te gustaría sembrar para más adelante?",
    ],
  },
  sol: {
    label: "Sol",
    emoji: "☀️",
    notes: [E4, A4, E5],
    voice: "bell",
    messages: [
      "Puedes imaginar un poco de sol tibio en la cara.",
      "El sol sale también los días nublados, solo que no se ve.",
    ],
  },
  mariposa: {
    label: "Mariposa",
    emoji: "🦋",
    notes: [E5, G5, A5],
    voice: "pluck",
    messages: [
      "Llegó sola y se irá cuando quiera. Mientras tanto, puedes mirarla.",
      "Antes de volar pasó un tiempo quieta. Fue parte del camino.",
      "Si no te mueves mucho, a veces se acerca.",
    ],
  },

  /* ---------- Movimiento ---------- */
  colchoneta: {
    label: "Colchoneta",
    emoji: "🧘",
    notes: [C4, G4],
    messages: [
      "Puedes estirarte como un gato recién despierto.",
      "Tumbarse también es una forma de moverse: hacia el descanso.",
      "Tu cuerpo sabe qué le hace falta. Puedes preguntarle.",
    ],
  },
  pelota: {
    label: "Pelota",
    emoji: "⚽",
    notes: [G3, C4],
    voice: "drum",
    messages: [
      "Botar, rodar, lanzar. La energía busca por dónde salir.",
      "Puedes moverte mucho o apenas un poco.",
      "Si hay algo de enojo en el cuerpo, la pelota lo aguanta.",
    ],
  },
  cinta: {
    label: "Cinta",
    emoji: "🎀",
    notes: [E5, D5, C5],
    voice: "flute",
    messages: [
      "Una cinta dibuja en el aire lo que tu brazo quiera decir.",
      "Círculos grandes, ondas pequeñas. Todo vale.",
    ],
  },
  "espejo-movimiento": {
    label: "Espejo de pared",
    emoji: "🪞",
    notes: [A4, E5],
    voice: "bell",
    messages: [
      "Este espejo no corrige posturas. Solo acompaña.",
      "Tu cuerpo, tal como está hoy, es bienvenido aquí.",
      "Puedes saludarte. O hacerte una mueca.",
    ],
  },
  "banco-movimiento": {
    label: "Banco para descansar",
    emoji: "🪑",
    notes: [C4],
    messages: [
      "Descansar es parte del movimiento, no lo contrario.",
      "Puedes sentarte y notar cómo late el cuerpo después de moverse.",
    ],
  },

  /* ---------- Estrellas ---------- */
  luna: {
    label: "Luna",
    emoji: "🌙",
    notes: [A3, E4],
    voice: "bell",
    messages: [
      "La luna también cambia de forma, y sigue siendo la luna.",
      "Hoy no tiene que estar llena. Tú tampoco.",
      "Puedes dejarle algo del día para que lo cuide esta noche.",
    ],
  },
  constelacion: {
    label: "Constelación",
    emoji: "✨",
    notes: [E5, G5, A5, C5],
    voice: "bell",
    messages: [
      "Alguien unió estrellas sueltas y vio un dibujo. Tú también puedes.",
      "¿Qué momentos del día unirías con una línea?",
      "Incluso un punto de luz pequeño cuenta.",
    ],
  },
  telescopio: {
    label: "Telescopio",
    emoji: "🔭",
    notes: [C4, G4, C5],
    messages: [
      "Desde lejos, algunas cosas se ven de otro tamaño.",
      "Puedes mirar lo de hoy con un poco de distancia.",
    ],
  },
  maqueta: {
    label: "Maqueta del sistema",
    emoji: "🌐",
    notes: [C4, E4, G4, C5],
    voice: "bell",
    messages: [
      "Esta maqueta gira despacio, sin que nadie la empuje.",
      "Puedes acercarte a un planeta y mirar sus lunas, o quedarte viendo el conjunto.",
      "Cada cosa gira a su propio ritmo. Ninguna le pide permiso a las demás.",
    ],
  },
  planetario: {
    label: "Planetario",
    emoji: "🪐",
    notes: [C4, G4, E5],
    voice: "bell",
    messages: [
      "Los planetas giran sin que nadie los empuje. Hay cosas que siguen su curso solas.",
      "Desde aquí arriba, lo de hoy se ve del tamaño que es.",
    ],
  },
  "lampara-noche": {
    label: "Lámpara de noche",
    emoji: "🪔",
    notes: [E4, C4],
    messages: [
      "Una luz tenue alcanza para no estar a oscuras.",
      "Puede quedarse encendida todo lo que haga falta.",
      "No hay que apagar nada todavía.",
    ],
  },
  "manta-noche": {
    label: "Manta para la noche",
    art: "manta",
    notes: [C4, A3],
    messages: [
      "El día ya hizo lo suyo. Puedes soltarlo.",
      "Tápate hasta donde te resulte cómodo.",
      "Mañana será otro día. Por ahora, solo este momento.",
    ],
  },
};

export const ROOMS: Room[] = [
  {
    slug: "vestibulo",
    name: "El Vestíbulo",
    category: "Punto de encuentro",
    minAge: 0,
    emoji: "🏠",
    description: "Elegir a dónde ir hoy.",
    welcome:
      "Aquí empieza la casa. Puedes dejar tus cosas, mirar alrededor y elegir una habitación cuando te apetezca.",
    ambience: { wall: "#efe7d6", floor: "#d8c3a5", rug: "#a3b18a" },
    objects: [
      { kind: "perchero", x: 12, y: 50 },
      { kind: "reloj-pared", x: 70, y: 32 },
      { kind: "banco-entrada", x: 74, y: 61 },
      { kind: "planta-entrada", x: 50, y: 62 },
      { kind: "llaves", x: 21, y: 60 },
      { kind: "paraguas", x: 86, y: 73 },
    ],
  },
  {
    slug: "peluches",
    name: "Rincón de Peluches",
    category: "Peluches y compañía",
    minAge: 3,
    emoji: "🧸",
    description: "Abrazos, historias y personajes que escuchan.",
    welcome:
      "Un rincón blando donde nadie pregunta de más. Los peluches escuchan, acompañan y no tienen prisa.",
    ambience: { wall: "#f3e1d8", floor: "#e0c4b0", rug: "#bd9079" },
    objects: [
      { kind: "oso", x: 50, y: 67 },
      { kind: "conejo", x: 33, y: 76 },
      { kind: "manta", x: 67, y: 77 },
      { kind: "cojin", x: 49, y: 87 },
      { kind: "espejo-emociones", x: 70, y: 33 },
    ],
  },
  {
    slug: "instrumentos",
    name: "Sala de Instrumentos",
    category: "Música y ritmo",
    minAge: 8,
    emoji: "🎵",
    description: "Explorar sonidos, ritmos y melodías.",
    welcome:
      "Aquí todo suena, y nada tiene que sonar bien. Si activas el sonido, cada instrumento te responde con su voz.",
    ambience: { wall: "#e6e0ee", floor: "#cdbfae", rug: "#a291b4" },
    objects: [
      { kind: "tambor", x: 50, y: 68 },
      { kind: "xilofono", x: 32, y: 78 },
      { kind: "flauta", x: 68, y: 78 },
      { kind: "campana", x: 70, y: 34 },
      { kind: "pandereta", x: 50, y: 87 },
    ],
  },
  {
    slug: "cocina",
    name: "Cocina del Cuidado",
    category: "Cocina y rutinas",
    minAge: 10,
    emoji: "🍲",
    description: "Preparar algo con calma, paso a paso.",
    welcome:
      "Una cocina tibia donde las cosas se hacen de a una. Preparar algo, aunque sea imaginario, es una forma de cuidarse.",
    ambience: { wall: "#f4ead2", floor: "#d9c7a8", rug: "#d9a273" },
    objects: [
      { kind: "olla", x: 71, y: 46 },
      { kind: "taza", x: 34, y: 53 },
      { kind: "cuchara", x: 50, y: 80 },
      { kind: "frutas", x: 85, y: 54 },
      { kind: "delantal", x: 36, y: 31 },
    ],
  },
  {
    slug: "creatividad",
    name: "Taller de Creatividad",
    category: "Arte y expresión",
    minAge: 3,
    emoji: "🎨",
    description: "Pintar, dibujar y crear sin reglas.",
    welcome:
      "Un taller con manchas en el suelo y ninguna regla en la pared. Lo que hagas aquí no se califica ni se corrige.",
    ambience: { wall: "#f6efe0", floor: "#d6cbb8", rug: "#e2b06e" },
    objects: [
      { kind: "lienzo", x: 68, y: 47 },
      { kind: "pinceles", x: 49, y: 68 },
      { kind: "crayones", x: 37, y: 56 },
      { kind: "plastilina", x: 64, y: 82 },
      { kind: "papel", x: 86, y: 72 },
      { kind: "tangram", x: 25, y: 52 },
    ],
  },
  {
    slug: "lectura",
    name: "Biblioteca Serena",
    category: "Lectura y cuentos",
    minAge: 5,
    emoji: "📚",
    description: "Cuentos cortos para acompañar.",
    welcome:
      "Huele a papel y a tarde tranquila. Hay una butaca, una luz cálida y un cuento corto esperando sin apuro.",
    ambience: { wall: "#e3e7d6", floor: "#b99f84", rug: "#8a9a78" },
    objects: [
      { kind: "estante", x: 67, y: 38 },
      { kind: "butaca", x: 27, y: 66 },
      { kind: "lampara-lectura", x: 73, y: 61 },
      { kind: "libro", x: 50, y: 75 },
      { kind: "marcador", x: 61, y: 87 },
    ],
  },
  {
    slug: "respiracion",
    name: "Sala de Respiración",
    category: "Calma y regulación",
    minAge: 6,
    emoji: "🌬️",
    description: "Ejercicios de respiración opcionales.",
    welcome:
      "Una sala despejada, con aire de sobra. Puedes respirar como ya lo haces, o probar un ritmo más lento si te apetece.",
    ambience: { wall: "#dfecee", floor: "#c9d6d2", rug: "#9fc0c7" },
    objects: [
      { kind: "burbujas", x: 33, y: 66 },
      { kind: "globo", x: 69, y: 55 },
      { kind: "vela", x: 50, y: 74 },
      { kind: "reloj-arena", x: 62, y: 86 },
    ],
  },
  {
    slug: "jardin",
    name: "Jardín Interno",
    category: "Naturaleza y crecimiento",
    minAge: 0,
    emoji: "🌱",
    description: "Cuidar una planta, observar, esperar.",
    welcome:
      "Un jardín pequeño bajo techo. Aquí las cosas crecen a su ritmo: puedes regar, mirar o simplemente esperar.",
    ambience: { wall: "#e2efd9", floor: "#b9cf9f", rug: "#8fae74" },
    objects: [
      { kind: "sol", x: 70, y: 28 },
      { kind: "maceta", x: 50, y: 69 },
      { kind: "regadera", x: 32, y: 78 },
      { kind: "semilla", x: 75, y: 61 },
      { kind: "mariposa", x: 86, y: 42 },
    ],
  },
  {
    slug: "movimiento",
    name: "Sala de Movimiento",
    category: "Cuerpo y energía",
    minAge: 4,
    emoji: "🤸",
    description: "Estirar, saltar o descansar el cuerpo.",
    welcome:
      "Un espacio amplio para lo que el cuerpo pida: sacudirse, estirarse o quedarse quieto. Muévete solo hasta donde te resulte cómodo.",
    ambience: { wall: "#f5e6da", floor: "#d8c0a2", rug: "#e0a98a" },
    objects: [
      { kind: "espejo-movimiento", x: 70, y: 37 },
      { kind: "colchoneta", x: 46, y: 75 },
      { kind: "pelota", x: 31, y: 70 },
      { kind: "cinta", x: 66, y: 85 },
      { kind: "banco-movimiento", x: 86, y: 63 },
    ],
  },
  {
    slug: "estrellas",
    name: "Mirador de Estrellas",
    category: "Cierre y descanso",
    minAge: 0,
    emoji: "🌙",
    description: "Cerrar el día con una luz tenue.",
    welcome:
      "Arriba del todo, bajo el tejado, la casa se queda a media luz. Un lugar para ir cerrando el día sin tener que resolverlo.",
    ambience: { wall: "#343b5e", floor: "#272c49", rug: "#4f5584" },
    dark: true,
    objects: [
      { kind: "luna", x: 70, y: 27 },
      { kind: "constelacion", x: 84, y: 43 },
      { kind: "telescopio", x: 37, y: 57 },
      { kind: "planetario", x: 64, y: 60 },
      { kind: "maqueta", x: 80, y: 76 },
      { kind: "lampara-noche", x: 23, y: 59 },
      { kind: "manta-noche", x: 47, y: 74 },
    ],
  },
];

export const ROOMS_BY_SLUG: Record<string, Room> = Object.fromEntries(ROOMS.map((r) => [r.slug, r]));

export function getRoom(slug: string): Room | undefined {
  return ROOMS_BY_SLUG[slug];
}

/** Texto completo de recomendación de edad. */
export function ageLabel(minAge: number): string {
  return minAge <= 0
    ? "Recomendado para todas las edades"
    : `Recomendado desde los ${minAge} años en adelante`;
}

/** Versión corta para tarjetas. */
export function ageShort(minAge: number): string {
  return minAge <= 0 ? "Todas las edades" : `Desde los ${minAge} años`;
}

export const DISCLAIMER =
  "Refugio es un espacio de acompañamiento voluntario. No es un servicio de emergencias, atención clínica ni diagnóstico. Si necesitas ayuda profesional, busca un servicio de salud mental de tu localidad. Puedes pasar, detenerte o no compartir en cualquier momento.";

export const ADULT_NOTE = "Se recomienda la presencia de una persona adulta responsable.";
