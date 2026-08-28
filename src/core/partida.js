import { crearRng, rndElem, rndInt, chance } from './rng.js';
import { NOMBRES_VILLEROS, APODOS, STREAMERS_PARODIA } from '../data/nombres.js';
import { VILLAS } from '../data/lugares.js';
import { estadoCaminoInicial } from './camino.js';
import { crearSocio } from './vinculos.js';
import {
  EDAD_INICIAL,
  GUITA_INICIAL,
  PROB_PIBE_MARAVILLA,
  PIBE_MARAVILLA_BONUS,
  PIBE_MARAVILLA_MULT_GUITA,
  STORAGE_VERSION,
  etapaPorEdad,
  clampStat,
} from './constants.js';

/** Rival: nombre villero + apodo. Trackea Ventas en paralelo toda la partida. */
export function crearRival(rng) {
  return {
    nombre: rndElem(rng, NOMBRES_VILLEROS),
    apodo: rndElem(rng, APODOS),
    ventas: 0,
  };
}

export function sugerirNombre(rng) {
  return rndElem(rng, NOMBRES_VILLEROS);
}

/**
 * Crea el GameState completo. Aca se tira el 1% de "Nació un pibe maravilla".
 */
export function crearPartida({ nombre, apodo, seed } = {}) {
  const rng = crearRng(seed ?? (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);

  const stats = {
    calle: rndInt(rng, 8, 18),
    fama: rndInt(rng, 3, 10),
    mana: rndInt(rng, 8, 18),
    atencion: rndInt(rng, 0, 5),
    salud: rndInt(rng, 90, 100),
  };

  let guita = GUITA_INICIAL;
  const pibeMaravilla = chance(rng, PROB_PIBE_MARAVILLA);
  if (pibeMaravilla) {
    stats.calle = clampStat(stats.calle + PIBE_MARAVILLA_BONUS.calle);
    stats.fama = clampStat(stats.fama + PIBE_MARAVILLA_BONUS.fama);
    guita *= PIBE_MARAVILLA_MULT_GUITA;
  }

  const villaOrigen = rndElem(rng, VILLAS);
  const ubicacion = { tipo: 'villa', nombre: villaOrigen, esOrigen: true };

  return {
    version: STORAGE_VERSION,
    rng,
    creadoEn: new Date().toISOString(),

    jugador: {
      nombre: (nombre || '').trim() || sugerirNombre(rng),
      apodo: (apodo || '').trim() || rndElem(rng, APODOS),
    },

    edad: EDAD_INICIAL,
    etapa: etapaPorEdad(EDAD_INICIAL),
    anio: 1,

    stats,
    guita,
    ventas: 0,
    movidas: 0,

    rival: crearRival(rng),

    // El camino se define recien a los 18. Hasta entonces solo se junta el
    // contador oculto de puntos de estudio (ver core/camino.js).
    camino: estadoCaminoInicial(),

    // El socio ya existe con nombre y apodo desde el minuto cero, pero recien
    // aparece en la partida cuando cae su evento de presentacion (19-24).
    socio: crearSocio({ rng }),

    // El hijo se crea si y cuando cae ese evento (28-30).
    hijo: null,

    // Flags que van a volver dentro de 3-5 años (ver core/memoria.js).
    memoria: [],

    // Ids de eventos especiales ya jugados: ninguno se repite.
    especialesJugados: [],

    ubicacion,
    origen: { tipo: 'villa', nombre: villaOrigen },
    zonasVisitadas: [{ tipo: 'villa', nombre: villaOrigen, edad: EDAD_INICIAL, origen: true }],
    territorios: [],
    mudanzas: 0,
    enElExterior: false,
    volvioAlPais: false,

    mercado: {
      staff: [],
      lujo: [],
      consumiblesComprados: [],
      buffs: [],
      escudosGastados: 0,
    },

    historial: [],
    ingresos: [],
    eventosVistos: [],

    pibeMaravilla,
    // El streamer de apuestas que aparece en el cartel de intro. Se elige una
    // vez y queda fijo, para que la historia de origen sea siempre la misma.
    streamer: rndElem(rng, STREAMERS_PARODIA),
    ultimaMovidaFallida: false,
    seRetiro: false,
    ultimaCrisisAnio: -99,

    // --- flujo ---
    fase: 'evento', // evento | conquista | resumen | fin
    anioActual: null,
    pendienteConquista: null,
    resumen: null,
    final: null,
    // Cola de carteles a mostrar antes de arrancar. Se van sacando de a uno
    // con `cerrarCartel`. La intro siempre va primero; el 1% del pibe
    // maravilla, si salió, se muestra después como remate.
    carteles: pibeMaravilla ? ['intro', 'pibe_maravilla'] : ['intro'],
  };
}
