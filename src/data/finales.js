/**
 * Las 14 pantallas de fin de partida.
 *
 * No hay tabla de prioridad ni puntajes: es una lista ordenada de condiciones
 * y gana la primera que da true. Para cambiar que final sale antes, se mueve
 * la entrada de lugar en el array. Nada mas.
 *
 * El contexto que recibe cada condicion:
 *   { causa, edad, stats, guita, ventas, movidas, territorios, mudanzas,
 *     enElExterior, volvioAlPais, rival, ultimaMovidaFallida, seRetiro }
 * donde causa = 'picantillo' | 'muerte' | 'preso' | 'retiro' | 'edad'
 */

export const FINALES = [
  {
    id: 'leyenda',
    titulo: 'Leyenda',
    apodo: 'EL PATRÓN DE PATRONES',
    icono: '👑',
    color: 'dorado',
    condicion: (c) => c.causa === 'picantillo',
    texto: () =>
      'Ganaste el Picantillo de Oro. No hay esquina, barrio ni provincia donde tu nombre no pese. ' +
      'Los pibes que recién arrancan cuentan tu historia como si fuera un cuento de terror y de admiración a la vez. ' +
      'Llegaste hasta arriba de todo y desde ahí ya no se sube más: se mira.',
  },
  {
    id: 'finado',
    titulo: 'El Finado',
    apodo: 'SE LO LLEVÓ LA CALLE',
    icono: '🕯️',
    color: 'rojo',
    condicion: (c) => c.causa === 'muerte',
    texto: (c) =>
      `Se te terminó a los ${c.edad}. La misma calle que te dio todo te pasó la factura de una. ` +
      'Hubo velas en la esquina, una bandera con tu apodo y gente que no te conocía llorando igual. ' +
      'A la semana ya había otro parado en tu lugar.',
  },
  {
    id: 'traidor',
    titulo: 'El Traidor',
    apodo: 'LO BUCHONEARON A ÉL',
    icono: '🐀',
    color: 'rojo',
    condicion: (c) => c.causa === 'preso' && c.ultimaMovidaFallida,
    texto: (c) =>
      `La movida se cayó y alguien habló. A los ${c.edad} entraste con la causa armada de antemano. ` +
      'Lo peor no fue la condena: fue enterarte de quién había sido. ' +
      'Adentro te miran raro, como si el buchón hubieras sido vos.',
  },
  {
    id: 'preso',
    titulo: 'El Preso',
    apodo: 'LO ENCANARON',
    icono: '⛓️',
    color: 'rojo',
    condicion: (c) => c.causa === 'preso',
    texto: (c) =>
      `Te tenían marcado hace rato y a los ${c.edad} se les dio. ` +
      'Entraste con todo el peso encima y la calle siguió andando sin vos. ' +
      'Te quedaron los recortes de diario, el apodo y un montón de tiempo para pensar.',
  },
  {
    id: 'arrepentido',
    titulo: 'El Arrepentido',
    apodo: 'COLGÓ LOS BOTINES A TIEMPO',
    icono: '🙏',
    color: 'verde',
    condicion: (c) => c.causa === 'retiro' && c.edad < 25,
    texto: (c) =>
      `Te bajaste a los ${c.edad}, cuando todavía había con qué. ` +
      'Nadie te aplaudió y muchos te trataron de cagón, pero vos sabías lo que veías venir. ' +
      'Hoy tenés laburo, dormís de noche y no mirás la puerta cada vez que suena un motor.',
  },
  {
    id: 'capo',
    titulo: 'El Capo',
    apodo: 'EL QUE SE HIZO SOLO',
    icono: '🎩',
    color: 'dorado',
    condicion: (c) => c.causa === 'retiro' && c.territorios >= 2 && c.territorios <= 3 && c.stats.salud >= 60,
    texto: (c) =>
      `Te retiraste entero, con ${c.territorios} territorios tuyos y sin deberle nada a nadie. ` +
      'No te apadrinó ningún grande: cada metro que ganaste lo peleaste vos. ' +
      'Ahora mirás desde el balcón y los que mandan siguen preguntando cómo hiciste.',
  },
  {
    id: 'fantasma_frontera',
    titulo: 'El Fantasma de la Frontera',
    apodo: 'SE FUE Y NO VOLVIÓ MÁS',
    icono: '🛂',
    color: 'humo',
    condicion: (c) => c.enElExterior && !c.volvioAlPais,
    texto: (c) =>
      `Cruzaste y del otro lado te quedaste. Nunca volviste a pisar el barrio. ` +
      'Allá sos un tipo raro con acento y plata que nadie sabe de dónde salió. ' +
      'Acá quedó tu nombre escrito en una pared que ya nadie repinta.',
  },
  {
    id: 'fantasma',
    titulo: 'El Fantasma',
    apodo: 'NUNCA ENCONTRÓ SU ESQUINA',
    icono: '👻',
    color: 'humo',
    condicion: (c) => c.mudanzas >= 2 && c.territorios === 0,
    texto: (c) =>
      `${c.mudanzas} mudanzas y ni un solo lugar que fuera tuyo. ` +
      'Siempre llegabas de afuera, siempre eras el nuevo, siempre te ibas antes de que te conocieran. ' +
      'Pasaste por todos lados sin dejar marca en ninguno.',
  },
  {
    id: 'la_pego',
    titulo: 'El Que la Pegó',
    apodo: 'SE HIZO RICO Y SE BORRÓ',
    icono: '💰',
    color: 'dorado',
    condicion: (c) => c.guita >= 20_000_000 && c.territorios === 0,
    texto: (c) =>
      `Juntaste una fortuna sin llegar a mandar en ningún lado. ` +
      'Te llenaste los bolsillos y te fuiste antes de que alguien te pidiera cuentas. ' +
      'Los que se quedaron todavía discuten si fuiste el más vivo o el más cagón.',
  },
  {
    id: 'zafo',
    titulo: 'El Que Zafó',
    apodo: 'TUVO MÁS CULO QUE FIGURA',
    icono: '🍀',
    color: 'verde',
    condicion: (c) => c.stats.salud < 20,
    texto: (c) =>
      `Terminaste con ${c.stats.salud} de salud y respirando, que ya es mucho decir. ` +
      'Te salvaste de cosas que a otros los mataron y ni sabés bien cómo. ' +
      'No fue talento ni cabeza: fue culo, y el culo también cuenta.',
  },
  {
    id: 'eterno_segundo',
    titulo: 'El Eterno Segundo',
    apodo: 'SIEMPRE ATRÁS DEL RIVAL',
    icono: '🥈',
    color: 'humo',
    // Pide una diferencia real: perder por una venta no te define la carrera.
    condicion: (c) => c.ventas < c.rival.ventas - 2,
    texto: (c) =>
      `Cerraste con ${c.ventas} ventas contra las ${c.rival.ventas} de ${c.rival.nombre}. ` +
      'Toda la carrera corriendo atrás del mismo tipo, y el tipo nunca aflojó el paso. ' +
      'Fuiste bueno. Él fue el que contaron.',
  },
  {
    id: 'curtido',
    titulo: 'El Curtido',
    apodo: 'AGUANTÓ TODO',
    icono: '🪨',
    color: 'verde',
    condicion: (c) => c.causa === 'edad' && c.stats.salud >= 40,
    texto: (c) =>
      `Llegaste a los ${c.edad} sin morirte y sin caer preso. ` +
      'Comiste palos, perdiste gente, te quedaste sin nada dos o tres veces y siempre volviste a pararte. ' +
      'Nadie te hizo un monumento pero todos saben que vos aguantaste lo que otros no.',
  },
  {
    id: 'nunca_aflojo',
    titulo: 'El Que Nunca Aflojó',
    apodo: 'SIGUIÓ HASTA EL FINAL',
    icono: '🔥',
    color: 'dorado',
    condicion: (c) => !c.seRetiro,
    texto: (c) =>
      `Nunca te bajaste. Ni cuando había plata para irse, ni cuando el cuerpo pedía parar. ` +
      `A los ${c.edad} seguías firme en la misma esquina, con la misma cara. ` +
      'Algunos le dicen aguante. Otros le dicen no saber cuándo parar.',
  },
  {
    id: 'perdido',
    titulo: 'El Perdido',
    apodo: 'SE RAJÓ SIN HACER RUIDO',
    icono: '🌫️',
    color: 'humo',
    // Fallback: siempre da true, cierra la lista.
    condicion: () => true,
    texto: (c) =>
      `Te fuiste a los ${c.edad} y casi nadie se enteró. ` +
      'Ni gloria, ni cana, ni tumba: una puerta que se cerró y ya. ' +
      'De vez en cuando alguien pregunta qué fue de vos y nadie sabe qué contestar.',
  },
];

export const finalPorId = (id) => FINALES.find((f) => f.id === id);
