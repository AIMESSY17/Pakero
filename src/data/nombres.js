/** Nombres y apodos para generar el Rival (y sugerir nombre al jugador). */

export const NOMBRES_VILLEROS = [
  'Brayan',
  'Kevin',
  'Ezequiel',
  'Maiqol',
  'Yeison',
  'Jonathan',
  'Cristian',
  'Nahuel',
  'Yohan',
  'Yamil',
  'Franco',
  'Alan',
];

/** Nombres para el hijo. Neutros a proposito: el juego nunca le asigna genero. */
export const NOMBRES_HIJOS = [
  'Thiago',
  'Morena',
  'Bautista',
  'Milagros',
  'Ciro',
  'Zoe',
  'Benja',
  'Abril',
  'Dilan',
  'Guadalupe',
  'Lautaro',
  'Jazmín',
];

export const APODOS = [
  'Toto',
  'Rulero',
  'Motoquero',
  'Pelo',
  'el Ñeri',
  'Cabeza',
  'el Pelado',
  'Sandro',
  'el Gordo',
  'Chapa',
  'el Chino',
  'Puñal',
  'el Loco',
  'el Negro',
  'el Pibe',
  'Zurdo',
];

/**
 * Streamers de apuestas para el cartel de introduccion.
 *
 * Son todos inventados: arquetipos del rubro (el del codigo de referido, el
 * que pierde un sueldo en vivo), no parodias de nadie en particular.
 */
export const STREAMERS_PARODIA = [
  {
    handle: 'GallinaDavo',
    desc: 'anunció en redes que se venía la nueva era fitness y que iba a cuidar el físico como un atleta de élite, pero a las dos horas lo engancharon en el vivo de otro morfando una pizza entera a las 4 AM, y ahora cada vez que sube una historia le piden el número de la nutricionista',
  },
  {
    handle: 'Cuscus',
    desc: 'organizó el evento más importante del año con producción de nivel internacional, pero el audio falló los primeros 45 minutos y la cámara principal enfocó un cable tirado en el piso, y los memes lo inmortalizaron como el rey de la tecnología que no sabe conectar un micrófono',
  },
  {
    handle: 'MomoPosta',
    desc: 'prometió un directo relajado de dos horitas para estar con la gente, pero terminó en un agujero negro de videos viejos de YouTube a las 6 de la mañana, y el chat le armó una enciclopedia de memes sobre su incapacidad crónica para irse a dormir',
  },
  {
    handle: 'Viborita',
    desc: 'se la pasó toda la semana hablando de lo ganador que era y cómo le ganaba a cualquiera en la cancha, pero cuando llegó el torneo importante su equipo perdió y él se fue puteando a todo el mundo, y el chat no para de recordarle con memes que es un perdedor'
  },
  {
    handle: 'Santoto',
    desc: 'saltó con la frase "yo tengo US$35.000 para apostar, vos mañana te levantás a laburar" creyéndose el más grande, pero cuando se armó el quilombo de verdad desapareció sin dar la cara, y los memes no paran de decirle que es un fantasma que le huye al portero',
  },
];

/** Frases que el Rival "dice" en el resumen del año, segun como viene la mano. */
export const CHICANAS_RIVAL = {
  ganando: [
    'Dicen que anda diciendo que vos no existís.',
    'Se paseó por tu esquina como si fuera de él.',
    'Contó tus ventas en voz alta y se cagó de risa.',
    'Ya lo saludan primero a él.',
  ],
  parejo: [
    'Van cabeza a cabeza y todo el barrio lo sabe.',
    'Se cruzaron y ninguno bajó la mirada.',
    'Están empatados y eso a los dos les quema.',
  ],
  perdiendo: [
    'Anda preguntando cómo hiciste.',
    'Ya no te nombra. Mala señal para él.',
    'Se lo vio ofreciendo barato para no perder la clientela.',
    'Dicen que se quiere mudar.',
  ],
};

export function nombreRivalCompleto(rival) {
  return `${rival.nombre} "${rival.apodo}"`;
}
