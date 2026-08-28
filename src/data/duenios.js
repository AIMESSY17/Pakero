/**
 * El dueño anterior.
 *
 * Ningún territorio está vacío cuando llegás: alguien lo estaba manejando y
 * ahora no. Al conquistar se genera un tipo con nombre, apodo y arquetipo, y
 * el jugador tiene que decidir qué hace con él.
 *
 * Las tres salidas no son sabor: cada una deja una marca distinta en el
 * mantenimiento posterior de ESE territorio (ver `core/territorio.js`).
 *
 *   dejarlo ir   → no cambia nada. Te lo sacaste de encima y listo.
 *   humillarlo   → mantener ese territorio cuesta más para siempre: quedó
 *                  afuera con bronca y tiempo libre.
 *   sumarlo      → mantenerlo cuesta menos: conoce cada pasillo. Pero es un
 *                  tipo al que le sacaste lo suyo, y eso no se olvida.
 */

/**
 * Arquetipos. `presentacion` es cómo se lo describe al jugador cuando aparece,
 * y `resiste` inclina qué tan probable es que la conquista le salga barata.
 */
export const ARQUETIPOS_DUENIO = [
  {
    id: 'viejo',
    label: 'El que ya estaba cansado',
    presentacion:
      'Hace veinte años que maneja esto y se le nota en cómo se sienta. ' +
      'Cuando entraste no se levantó: se quedó mirándote como quien ve llegar algo que esperaba.',
    peso: 1.2,
  },
  {
    id: 'heredero',
    label: 'El heredero',
    presentacion:
      'Agarró esto porque era del padre, no porque se lo haya ganado. ' +
      'Nunca terminó de entender por qué la gente le hacía caso, y ahora ya no le hace.',
    peso: 1,
  },
  {
    id: 'bravo',
    label: 'El que peleó hasta el final',
    presentacion:
      'No aflojó ni cuando ya estaba perdido. Te lo trajeron con la cara marcada y ' +
      'todavía te miró de arriba, que es lo único que le quedaba para mirarte.',
    peso: 1,
  },
  {
    id: 'contador',
    label: 'El de los números',
    presentacion:
      'Nunca puso el cuerpo: manejaba planillas, proveedores y a quién se le fía. ' +
      'Sabe cosas de este lugar que no están escritas en ningún lado.',
    peso: 1,
  },
  {
    id: 'politico',
    label: 'El de los contactos',
    presentacion:
      'Se movía con gente de arriba: un concejal, dos comisarios y alguien del club. ' +
      'Lo que lo hacía fuerte no estaba acá adentro, y por eso se cayó tan rápido.',
    peso: 0.9,
  },
  {
    id: 'forastero',
    label: 'El que también había llegado de afuera',
    presentacion:
      'Llegó hace seis años como llegaste vos hoy, y le sacó esto a otro. ' +
      'Te mira y ve la película entera, incluido el final.',
    peso: 1,
  },
  {
    id: 'club',
    label: 'El del club',
    presentacion:
      'Manejaba esto desde la comisión del club: la cancha, la cantina y todo lo demás. ' +
      'Media zona le debe un favor y la otra media le debe plata.',
    peso: 0.9,
  },
  {
    id: 'pibe',
    label: 'El pibe al que se le fue de las manos',
    presentacion:
      'Tiene menos años que vos y agarró esto hace ocho meses, cuando cayó el anterior. ' +
      'Le quedó grande desde el primer día y en el fondo debe estar aliviado.',
    peso: 0.8,
  },
];

export const arquetipoPorId = (id) => ARQUETIPOS_DUENIO.find((a) => a.id === id) ?? null;
