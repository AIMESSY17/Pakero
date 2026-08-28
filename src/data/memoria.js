/**
 * Ecos: lo que vuelve.
 *
 * Cada entrada es un flag que algun evento dejo anotado y que resurge entre 3
 * y 5 años despues, una sola vez. No es un arbol de dependencias: el flag no
 * desbloquea ni requiere nada, solo agrega un parrafo al año en que vuelve y
 * mueve un poco la aguja. El mundo se acuerda; el motor no cambia.
 *
 * Campos:
 *   id      — mismo string que el flag que dejan los eventos
 *   titulo  — cabecera del bloque en el panel
 *   texto   — (ctx) => string   ctx: { anios, edad, edadEntonces, jugador,
 *                                      rival, socio, hijo }
 *   stats   — deltas opcionales, chicos: el eco no define una partida
 *   hijo    — delta opcional al tracker del hijo
 *   socio   — delta opcional a la lealtad del socio
 */

export const ECOS = {
  traicion: {
    id: 'traicion',
    titulo: 'Te acordás de aquella vez',
    icono: '🐀',
    texto: (c) =>
      `Pasaron ${c.anios} años y hoy te lo cruzaste en la parada del bondi al que dejaste tirado. ` +
      'No te dijo nada. Te miró, se acomodó la campera y se subió. ' +
      'Esa noche te enteraste de que hace rato viene contando su versión, y que hay gente que le cree.',
    stats: { fama: -3, atencion: 4 },
    socio: -6,
  },
  desastre: {
    id: 'desastre',
    titulo: 'La cuenta vieja',
    icono: '💀',
    texto: (c) =>
      `Lo de los ${c.edadEntonces} nunca se cerró del todo. ${c.anios} años después vino uno a cobrarte ` +
      'lo que quedó colgando, con la calma del que esperó y sabe que puede esperar más. ' +
      'Arreglaste como pudiste, pero el barrio vio que a vos también se te puede ir a golpear la puerta.',
    stats: { calle: -3, salud: -6 },
  },
  buchon: {
    id: 'buchon',
    titulo: 'El que habló',
    icono: '📞',
    texto: (c) =>
      `Apareció el expediente viejo, ese de cuando tenías ${c.edadEntonces}. ` +
      'Alguien había firmado abajo de todo y ahora el nombre circula. ' +
      'Te llamaron a declarar por una causa que creías muerta y enterrada.',
    stats: { atencion: 8, mana: 2 },
  },
  conquista_fallida: {
    id: 'conquista_fallida',
    titulo: 'La que se te escapó',
    icono: '🏴',
    texto: (c) =>
      `Volviste a pasar por donde te habían roto la cara a los ${c.edadEntonces}. ` +
      'Ahora manda otro, uno que llegó después que vos y no tuvo que pelearla igual. ' +
      'Te tomaste un café enfrente y te fuiste sin decir nada, que es lo más caro que hiciste en años.',
    stats: { fama: -2, mana: 3 },
  },
  zafada: {
    id: 'zafada',
    titulo: 'La noche que zafaste',
    icono: '🍀',
    texto: (c) =>
      `${c.anios} años después todavía cuentan lo de aquella noche, y cada vez es más grande. ` +
      'Ya no importa cómo fue: importa que la contás vos y que todos se callan cuando arrancás. ' +
      'Una historia buena, bien repetida, vale más que cualquier movida.',
    stats: { fama: 6, calle: 2 },
    socio: 4,
  },
  abandono: {
    id: 'abandono',
    titulo: 'Lo que no fuiste',
    icono: '🎂',
    texto: (c) =>
      `${c.hijo ? c.hijo.nombre : 'El pibe'} sacó el tema de la nada, comiendo. ` +
      `Lo dijo sin reproche, como quien menciona el clima: "esa vez no viniste". ` +
      'Vos te acordabas perfecto de la movida y no te acordabas nada del día.',
    hijo: -8,
    stats: { mana: 1 },
  },
  deuda: {
    id: 'deuda',
    titulo: 'Los que no olvidan',
    icono: '💸',
    texto: (c) =>
      `La plata que no devolviste a los ${c.edadEntonces} volvió con intereses que nadie pactó. ` +
      'Te lo hicieron saber sin levantar la voz, que es como se avisa en serio. ' +
      'Pagaste. Tarde, pero pagaste.',
    stats: { atencion: 3 },
  },
  palabra: {
    id: 'palabra',
    titulo: 'Te devuelven una',
    icono: '🤝',
    texto: (c) =>
      `Aquella vez que bancaste sin pedir nada a cambio, a los ${c.edadEntonces}, alguien la anotó. ` +
      `${c.anios} años más tarde te abrieron una puerta que ni sabías que existía, ` +
      'y cuando quisiste agradecer te dijeron que ya estaba saldado.',
    stats: { calle: 4, mana: 3 },
    socio: 6,
  },
};

export const ecoPorId = (id) => ECOS[id] ?? null;
