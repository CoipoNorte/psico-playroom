// Actividades guiadas opcionales: una por habitación (excepto el vestíbulo).

export interface ActivityStep {
  title: string;
  description: string;
  /** Pregunta o invitación opcional. */
  invitation?: string;
}

export interface Activity {
  title: string;
  intro: string;
  steps: ActivityStep[];
  /** Mensaje de cierre, sin evaluación. */
  closing: string;
  /** Pequeño recuerdo que queda al terminar. */
  keepsake: { emoji: string; name: string };
}

export const ACTIVITIES: Record<string, Activity> = {
  peluches: {
    title: "Un rato con un peluche",
    intro: "Cuatro momentos breves para estar en compañía de un personaje blando.",
    steps: [
      {
        title: "Elegir compañía",
        description:
          "Mira los peluches de la habitación. Puedes elegir uno, o dejar que uno te elija a ti. Si tienes un peluche de verdad cerca, también vale.",
        invitation: "¿Cuál te llama la atención hoy?",
      },
      {
        title: "Un nombre, si quieres",
        description:
          "Puedes ponerle un nombre, usar el que ya tiene o dejarlo sin nombre. A los peluches les da igual; lo que les importa es estar.",
      },
      {
        title: "Contarle algo",
        description:
          "Si te apetece, cuéntale cómo estuvo tu día. Puede ser en voz alta, bajito o solo pensándolo. También puedes no contarle nada.",
        invitation: "¿Hay algo que te gustaría que alguien supiera?",
      },
      {
        title: "Un abrazo a tu medida",
        description:
          "Cruza los brazos sobre el pecho y apoya las manos en tus hombros, como si abrazaras al peluche. Puedes apretar un poco y soltar, las veces que quieras.",
        invitation: "¿Cómo se siente tu cuerpo ahora?",
      },
    ],
    closing: "El peluche se queda aquí, por si quieres volver.",
    keepsake: { emoji: "🧸", name: "Un abrazo guardado" },
  },

  instrumentos: {
    title: "Tu ritmo de hoy",
    intro: "Un recorrido corto por el silencio, el pulso y una melodía pequeña.",
    steps: [
      {
        title: "Escuchar lo que ya suena",
        description:
          "Antes de tocar nada, puedes quedarte unos segundos escuchando lo que hay a tu alrededor: una voz lejana, un motor, tu propia respiración.",
        invitation: "¿Qué sonidos hay ahora mismo donde estás?",
      },
      {
        title: "Un pulso",
        description:
          "Toca el tambor unas cuantas veces, al ritmo que te salga. Si prefieres el sonido apagado, puedes marcarlo con los dedos sobre la mesa.",
        invitation: "¿Tu ritmo de hoy es rápido, lento o cambiante?",
      },
      {
        title: "Una melodía pequeña",
        description:
          "Prueba el xilófono: cada toque da una nota distinta. Tres o cuatro notas ya son una melodía. No hay ninguna equivocada.",
      },
      {
        title: "Dejar que se apague",
        description:
          "Toca la campana una vez y sigue el sonido hasta que desaparezca. Cuando quieras, puedes cerrar esta etapa.",
      },
    ],
    closing: "Lo que sonó, sonó. No hacía falta que fuera perfecto.",
    keepsake: { emoji: "🎵", name: "Una melodía propia" },
  },

  cocina: {
    title: "Una merienda imaginaria",
    intro: "Cinco pasos para preparar algo con calma, aunque sea solo en la imaginación.",
    steps: [
      {
        title: "Preparar el espacio",
        description:
          "Imagina que te pones el delantal y te lavas las manos despacio. Puedes notar el agua tibia, el jabón, los dedos uno por uno.",
      },
      {
        title: "Elegir qué preparar",
        description:
          "Piensa en algo sencillo que te gustaría tomar ahora: algo caliente, algo fresco, algo crujiente. No tiene que ser saludable ni elegante.",
        invitation: "¿Qué te apetecería de verdad en este momento?",
      },
      {
        title: "Una cosa cada vez",
        description:
          "Recorre los pasos en tu cabeza, de uno en uno: sacar, cortar, mezclar, remover. Mientras haces uno, los demás pueden esperar.",
      },
      {
        title: "Esperar mientras se hace",
        description:
          "Hay un rato en que la cocina trabaja sola. No hay nada que hacer salvo estar cerca. Puedes mirar la olla o mirar por la ventana.",
        invitation: "¿Cómo te llevas con los ratos de espera?",
      },
      {
        title: "Probar con calma",
        description:
          "Imagina el primer bocado o el primer sorbo. La temperatura, el sabor, el olor. Si luego quieres prepararlo de verdad, puedes pedir compañía en la cocina.",
      },
    ],
    closing: "Cuidarte un rato, aunque sea así de simple, también cuenta.",
    keepsake: { emoji: "☕", name: "Una taza tibia" },
  },

  creatividad: {
    title: "Dibujar lo de hoy",
    intro: "Cuatro pasos para poner algo en el lienzo sin que tenga que parecerse a nada.",
    steps: [
      {
        title: "Elegir un color",
        description:
          "Toca el lienzo de la escena para abrirlo. Mira los colores y elige el primero que te llame, sin pensarlo mucho.",
        invitation: "¿De qué color es este momento para ti?",
      },
      {
        title: "Una línea",
        description:
          "Traza una sola línea. Puede ser recta, enredada, temblorosa o enorme. Con eso ya hay un dibujo.",
      },
      {
        title: "Seguir, o dejarlo así",
        description:
          "Si te apetece, añade más líneas, manchas o colores. Si no, el dibujo ya está completo. El espacio vacío también forma parte.",
      },
      {
        title: "Mirar sin calificar",
        description:
          "Mira lo que hay en el lienzo unos segundos, como mirarías una nube. No es bonito ni feo: es lo que salió hoy.",
        invitation: "Si tu dibujo tuviera un título, ¿cuál sería?",
      },
    ],
    closing: "Lo que hiciste es tuyo. Puedes guardarlo en la memoria o borrarlo sin pena.",
    keepsake: { emoji: "🎨", name: "Una mancha de color" },
  },

  lectura: {
    title: "Cuento: El caracol que llegaba tarde",
    intro: "Un cuento corto en cuatro partes. Puedes leerlo en voz alta o en silencio.",
    steps: [
      {
        title: "Siempre tarde",
        description:
          "Había una vez un caracol que llegaba tarde a todo. Cuando llegaba a la fiesta, ya estaban recogiendo. Cuando llegaba al charco, ya se había secado. «Soy demasiado lento», pensaba, y se metía un poco más en su casa.",
        invitation: "¿Alguna vez has sentido que ibas más despacio que los demás?",
      },
      {
        title: "El camino a la colina",
        description:
          "Una mañana salió hacia la colina para ver el amanecer. Por el camino lo adelantaron la liebre, la hormiga y hasta una hoja que llevaba el viento. Él siguió, pasito a pasito, mirando lo que había: una gota en una telaraña, una seta recién nacida, el olor de la tierra mojada.",
      },
      {
        title: "Arriba",
        description:
          "Llegó a la cima cuando el sol ya estaba alto. El amanecer había pasado. La liebre, que había llegado primera, le preguntó: «¿Viste algo por el camino? Yo corrí tanto que no vi nada». Y el caracol le habló de la gota, de la seta y de la tierra.",
        invitation: "¿Qué crees que sintió el caracol al contarlo?",
      },
      {
        title: "A su paso",
        description:
          "Desde ese día el caracol siguió llegando tarde. Pero ya no decía «soy lento». Decía: «voy a mi paso». Y algunas mañanas la liebre caminaba un rato a su lado, solo para ver lo que él veía.",
        invitation: "¿Qué cosas ves tú cuando vas a tu paso?",
      },
    ],
    closing: "El cuento se queda en el estante, por si quieres volver a leerlo.",
    keepsake: { emoji: "🐌", name: "El paso del caracol" },
  },

  respiracion: {
    title: "Respirar a tu ritmo",
    intro:
      "Cuatro invitaciones suaves. Si algo te incomoda o te marea, vuelve a respirar como siempre: esa forma también está bien.",
    steps: [
      {
        title: "Notar, sin cambiar nada",
        description:
          "No hace falta respirar de ninguna manera especial. Solo nota por dónde entra el aire y por dónde sale, como quien mira pasar a alguien por la calle.",
        invitation: "¿Tu respiración está arriba, en el pecho, o más abajo?",
      },
      {
        title: "Soplar una burbuja",
        description:
          "Toma aire por la nariz y suéltalo por la boca muy despacio, como si soplaras una burbuja grande sin romperla. Dos o tres veces alcanzan.",
      },
      {
        title: "El globo en la barriga",
        description:
          "Si quieres, apoya una mano en la barriga. Al entrar el aire, se infla como un globo; al salir, se desinfla sola. Debajo de la habitación hay un círculo que puede marcarte el ritmo.",
        invitation: "¿Notas algún cambio, aunque sea pequeño?",
      },
      {
        title: "Volver a lo de siempre",
        description:
          "Deja que la respiración vuelva a ir por su cuenta. No hay que mantener nada. Tu cuerpo sabe respirar sin que lo dirijas.",
      },
    ],
    closing: "El aire sigue ahí, disponible, cada vez que lo necesites.",
    keepsake: { emoji: "🎈", name: "Un soplo lento" },
  },

  jardin: {
    title: "Sembrar y esperar",
    intro: "Cuatro momentos para cuidar algo pequeño sin apurarlo.",
    steps: [
      {
        title: "Mirar la tierra",
        description:
          "Observa la maceta un momento. Lo que hay hoy es lo que hay: un brote, unas hojas o solo tierra. Todo jardín empieza por mirar.",
      },
      {
        title: "Sembrar una intención",
        description:
          "Toca la semilla e imagina que la entierras con un dedo. Puede representar algo que te gustaría que creciera, aunque todavía no sepas cómo.",
        invitation: "¿Qué te gustaría que creciera en tu vida, poco a poco?",
      },
      {
        title: "Regar un poco",
        description:
          "Toca la regadera un par de veces. No hace falta mucha agua: demasiada tampoco ayuda. Puedes fijarte en si la maceta cambia.",
      },
      {
        title: "Esperar",
        description:
          "Esta es la parte más larga y en la que menos hay que hacer. Las plantas crecen de noche, cuando nadie las mira. Puedes volver otro día a ver cómo va.",
        invitation: "¿Hay algo que estés esperando con paciencia, o con impaciencia?",
      },
    ],
    closing: "Lo que sembraste sigue su curso, aunque no lo veas.",
    keepsake: { emoji: "🌷", name: "Un brote nuevo" },
  },

  movimiento: {
    title: "Despertar el cuerpo",
    intro:
      "Cinco movimientos sencillos. Hazlos de pie, en una silla o en la cama, y solo hasta donde te resulte cómodo.",
    steps: [
      {
        title: "Notar cómo llegas",
        description:
          "Antes de moverte, recorre tu cuerpo con la atención: pies, piernas, espalda, hombros, cara. No hay que cambiar nada, solo saludar.",
        invitation: "¿Hay alguna parte que pida atención hoy?",
      },
      {
        title: "Sacudir",
        description:
          "Sacude las manos como si tuvieran agua. Luego, si quieres, los brazos, los hombros, una pierna y la otra. Puede ser muy suave o con ganas.",
      },
      {
        title: "Estirar",
        description:
          "Lleva los brazos hacia arriba como al despertar por la mañana, hasta donde lleguen sin esfuerzo. Puedes bostezar; aquí no es mala educación.",
      },
      {
        title: "Soltar los hombros",
        description:
          "Sube los hombros hacia las orejas, quédate un segundo y déjalos caer. Repite dos o tres veces, si te sienta bien.",
        invitation: "¿Qué cambia cuando los dejas caer?",
      },
      {
        title: "Un momento de quietud",
        description:
          "Quédate sin moverte unos segundos. Puedes notar el corazón, el calor en las manos o simplemente el descanso.",
      },
    ],
    closing: "Tu cuerpo te acompañó hasta aquí. Puedes darle las gracias a tu manera.",
    keepsake: { emoji: "🤸", name: "Un cuerpo más suelto" },
  },

  estrellas: {
    title: "Cerrar el día",
    intro: "Cuatro pasos para ir apagando el día sin tener que resolverlo.",
    steps: [
      {
        title: "Bajar la luz",
        description:
          "Si puedes, baja un poco la luz de donde estás o el brillo de la pantalla. Deja que los ojos se acostumbren a la penumbra del mirador.",
      },
      {
        title: "Tres estrellas",
        description:
          "Piensa en tres momentos de hoy. No tienen que ser buenos ni importantes: un sabor, una frase, un rato de silencio. Cada uno es una estrella en tu cielo.",
        invitation: "¿Qué tres momentos pondrías en el cielo de hoy?",
      },
      {
        title: "Dejar algo en la luna",
        description:
          "Si hay algo que hoy no se pudo resolver, puedes dejárselo a la luna para que lo guarde esta noche. Mañana estará ahí, si lo quieres retomar.",
        invitation: "¿Qué te gustaría soltar hasta mañana?",
      },
      {
        title: "Buenas noches",
        description:
          "Imagina que te tapas con la manta. El día ya hizo lo suyo y tú también. No queda nada pendiente en este momento.",
      },
    ],
    closing: "Que descanses. La luz tenue se queda encendida.",
    keepsake: { emoji: "🌟", name: "Una estrella encendida" },
  },
};

/** Objeto de la escena que acompaña cada etapa; la guía invita a usarlo, nunca lo exige. */
export const STEP_OBJECTS: Record<string, string[]> = {
  peluches: ["oso", "conejo", "oso", "manta"],
  instrumentos: ["campana", "tambor", "xilofono", "campana"],
  cocina: ["delantal", "frutas", "cuchara", "olla", "taza"],
  creatividad: ["crayones", "lienzo", "pinceles", "papel"],
  lectura: ["butaca", "libro", "libro", "marcador"],
  respiracion: ["reloj-arena", "burbujas", "globo", "vela"],
  jardin: ["maceta", "semilla", "regadera", "maceta"],
  movimiento: ["colchoneta", "pelota", "cinta", "espejo-movimiento", "banco-movimiento"],
  estrellas: ["lampara-noche", "constelacion", "luna", "manta-noche"],
};
