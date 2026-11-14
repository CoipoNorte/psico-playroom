import type { ComponentType } from "react";
import { Canvas } from "./art";
import { Paper } from "./paper";
import { Ball, Ribbon, Stretch } from "./body";
import { Mirror } from "./mirror";
import { Rest } from "./rest";
import { CoatRack } from "./coat";
import { Balloon, Blanket, Bubbles, Candle, Hourglass, Lamp } from "./calm";
import { Companion } from "./companion";
import { Butterfly, Garden } from "./garden";
import { Keys, Rain } from "./hall";
import { Bell, DrumKit, Flute, Xylophone } from "./instruments";
import { CookingPot, FruitBowl, Recipes, TeaCup } from "./kitchen";
import { Library } from "./reader";
import type { ExperienceProps } from "./shared";
import { MoonPhases, Planetarium, StarSky } from "./sky";
import { Solar3D } from "./solar3d";
import { Tangram } from "./tangram";

export interface Experience {
  title: string;
  subtitle: string;
  wide?: boolean;
  Component: ComponentType<ExperienceProps>;
}

/** Qué se abre al tocar cada objeto de la casa. */
export const EXPERIENCES: Record<string, Experience> = {
  // Vestíbulo
  perchero: { title: "El perchero", subtitle: "Dejar colgado lo que pesa", Component: CoatRack },
  "reloj-pared": { title: "El reloj", subtitle: "La hora, y una pausa si la quieres", Component: Hourglass },
  "banco-entrada": { title: "El banco", subtitle: "Sentarse un rato antes de decidir", Component: Rest },
  "planta-entrada": { title: "La planta de la entrada", subtitle: "La misma que crece en el jardín", wide: true, Component: Garden },
  llaves: { title: "Las llaves", subtitle: "Todas las puertas están abiertas", Component: Keys },
  paraguas: { title: "El paraguas", subtitle: "Un rato bajo la lluvia", wide: true, Component: Rain },
  // Peluches
  oso: { title: "El oso", subtitle: "Acariciar, abrazar, contarle", wide: true, Component: Companion },
  conejo: { title: "El conejo", subtitle: "Orejas largas para escuchar bajito", wide: true, Component: Companion },
  manta: { title: "La manta", subtitle: "Taparse hasta donde quieras", Component: Blanket },
  cojin: { title: "El cojín", subtitle: "Apretar y soltar", Component: Blanket },
  "espejo-emociones": { title: "El espejo de emociones", subtitle: "La cara de lo que sientes hoy", Component: Mirror },
  // Instrumentos
  tambor: { title: "El tambor", subtitle: "Tu pulso de hoy", wide: true, Component: DrumKit },
  xilofono: { title: "El xilófono", subtitle: "Ocho notas, ninguna equivocada", wide: true, Component: Xylophone },
  flauta: { title: "La flauta", subtitle: "Suena con tu aire", Component: Flute },
  campana: { title: "La campana", subtitle: "Un sonido hasta que se apaga", Component: Bell },
  pandereta: { title: "La pandereta", subtitle: "Sacudir lo que sobra", Component: DrumKit },
  // Cocina
  olla: { title: "La olla", subtitle: "A fuego lento", wide: true, Component: CookingPot },
  cuchara: { title: "La cuchara", subtitle: "Remover despacio", wide: true, Component: CookingPot },
  taza: { title: "La taza", subtitle: "Una infusión con su tiempo", Component: TeaCup },
  frutas: { title: "Las frutas", subtitle: "Tu frutero", Component: FruitBowl },
  delantal: { title: "El delantal", subtitle: "Recetas sencillas, paso a paso", wide: true, Component: Recipes },
  // Creatividad
  lienzo: { title: "El lienzo", subtitle: "Pintar sin reglas", wide: true, Component: Canvas },
  pinceles: { title: "Los pinceles", subtitle: "Una línea ya es un dibujo", wide: true, Component: Canvas },
  crayones: { title: "Los crayones", subtitle: "Rayar fuerte está permitido", wide: true, Component: Canvas },
  plastilina: { title: "La plastilina", subtitle: "Las manos también piensan", wide: true, Component: Canvas },
  papel: { title: "El papel", subtitle: "Escribir, y después decidir", Component: Paper },
  tangram: { title: "El tangram", subtitle: "Siete piezas, mil figuras", wide: true, Component: Tangram },
  // Lectura
  libro: { title: "El libro abierto", subtitle: "Un cuento corto", Component: Library },
  estante: { title: "El estante", subtitle: "Elige un cuento", wide: true, Component: Library },
  marcador: { title: "El marcapáginas", subtitle: "Donde te quedaste", Component: Library },
  butaca: { title: "La butaca", subtitle: "Un rato sin hacer nada", Component: Rest },
  "lampara-lectura": { title: "La lámpara", subtitle: "Luz para leer y para estar", Component: Lamp },
  // Respiración
  burbujas: { title: "Las burbujas", subtitle: "Soplar despacio", wide: true, Component: Bubbles },
  globo: { title: "El globo", subtitle: "Inflar como la barriga", Component: Balloon },
  vela: { title: "La vela", subtitle: "Mirar una llama", Component: Candle },
  "reloj-arena": { title: "El reloj de arena", subtitle: "Lo que dura tu pausa", Component: Hourglass },
  // Jardín
  maceta: { title: "La maceta", subtitle: "Cuidar y esperar", wide: true, Component: Garden },
  regadera: { title: "La regadera", subtitle: "Un poco de agua", wide: true, Component: Garden },
  semilla: { title: "La semilla", subtitle: "Sembrar algo", wide: true, Component: Garden },
  sol: { title: "El sol", subtitle: "Más luz, menos luz", wide: true, Component: Garden },
  mariposa: { title: "La mariposa", subtitle: "Quedarse quieto", wide: true, Component: Butterfly },
  // Movimiento
  colchoneta: { title: "La colchoneta", subtitle: "Estirar con tiempo", wide: true, Component: Stretch },
  pelota: { title: "La pelota", subtitle: "Lanzar, botar, descansar", wide: true, Component: Ball },
  cinta: { title: "La cinta", subtitle: "Dibujar en el aire", wide: true, Component: Ribbon },
  "espejo-movimiento": { title: "El espejo", subtitle: "Cómo llega tu cuerpo hoy", Component: Mirror },
  "banco-movimiento": { title: "El banco", subtitle: "Descansar también es moverse", Component: Rest },
  // Estrellas
  luna: { title: "La luna", subtitle: "La fase de hoy", Component: MoonPhases },
  constelacion: { title: "Tu constelación", subtitle: "Unir estrellas con una línea", wide: true, Component: StarSky },
  telescopio: { title: "El telescopio", subtitle: "Mirar el cielo de cerca", wide: true, Component: StarSky },
  planetario: { title: "El planetario", subtitle: "Los planetas, girando", wide: true, Component: Planetarium },
  maqueta: { title: "La maqueta del sistema", subtitle: "Modelo 3D con sus lunas", wide: true, Component: Solar3D },
  "lampara-noche": { title: "La lámpara de noche", subtitle: "Una luz tenue", Component: Lamp },
  "manta-noche": { title: "La manta", subtitle: "Taparse para la noche", Component: Blanket },
};
