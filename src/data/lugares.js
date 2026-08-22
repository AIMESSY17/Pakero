/**
 * Lugares del juego. El nivel de territorio va de 1 a 4:
 *   1 Barrio/Villa  2 Provincia  3 Pais extranjero  4 Picantillo de Oro
 */

export const VILLAS = [
  'Fuerte Apache',
  'La Cava',
  'Ciudad Oculta',
  'Villa 31',
  'La Matanza',
  'Barrio Carlos Gardel',
  'Zavaleta',
];

/** Las 24 jurisdicciones argentinas. */
export const PROVINCIAS = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

export const PAISES = ['Colombia', 'España / Europa', 'Estados Unidos'];

export const PICANTILLO = 'Picantillo de Oro';

export const NIVEL_TERRITORIO = {
  1: {
    nivel: 1,
    id: 'villa',
    label: 'Barrio / Villa',
    minijuegos: ['pelear', 'combate_prolongado'],
    descripcion: 'Tu esquina, tu gente, tu ley.',
  },
  2: {
    nivel: 2,
    id: 'provincia',
    label: 'Provincia',
    minijuegos: ['escapar_policia'],
    descripcion: 'Ya no sos un pibe del barrio: sos un problema provincial.',
  },
  3: {
    nivel: 3,
    id: 'pais',
    label: 'País extranjero',
    minijuegos: ['cruce_frontera'],
    descripcion: 'Afuera nadie te conoce. Eso es bueno y es malo.',
  },
  4: {
    nivel: 4,
    id: 'picantillo',
    label: PICANTILLO,
    minijuegos: [], // evento unico, sin minijuego
    descripcion: 'La corona. No hay nada arriba de esto.',
  },
};

/**
 * Umbrales para que se dispare la conquista de cada nivel.
 * `cumple(stats, guita)` devuelve true cuando el jugador cruza el umbral.
 */
export const UMBRALES_TERRITORIO = {
  1: {
    texto: 'Calle 40+',
    cumple: (s) => s.calle >= 40,
    progreso: (s) => s.calle / 40,
  },
  2: {
    texto: 'Calle + Fama 60+',
    cumple: (s) => s.calle + s.fama >= 60,
    progreso: (s) => (s.calle + s.fama) / 60,
  },
  3: {
    texto: 'Fama 75+ y $5.000.000',
    cumple: (s, guita) => s.fama >= 75 && guita >= 5_000_000,
    progreso: (s, guita) => Math.min(s.fama / 75, guita / 5_000_000),
  },
  4: {
    texto: 'Fama 95+',
    cumple: (s) => s.fama >= 95,
    progreso: (s) => s.fama / 95,
  },
};

/** Motivos narrativos que se muestran como cartel al mudarse. */
export const MOTIVOS_MUDANZA = [
  'Se pudrió todo con la gente de al lado y había que desaparecer un rato.',
  'Le tiraron un par de tiros a la puerta. Mensaje entendido.',
  'La yuta empezó a pasar demasiado seguido por la esquina.',
  'Un negocio grande esperaba lejos y no iba a esperar para siempre.',
  'Quedó la casa marcada. Mejor arrancar de cero en otro lado.',
  'Se le quemó el rancho y no había nada que atara.',
  'Se corrió la bola de que había plata fácil por allá.',
  'Un familiar le abrió la puerta y no había mucho para pensar.',
];

/** Al mudarte perdes Calle (nadie te conoce) y 1-2 stats mas. */
export const COSTO_MUDANZA = {
  calle: -15,
  candidatosExtra: ['fama', 'mana', 'salud'],
  rangoExtra: [-10, -4],
};
