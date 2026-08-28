import { chance } from './rng.js';
import {
  CAMINOS,
  SUBVARIANTES,
  PUNTOS_ESTUDIO_VIABLE,
  PUNTOS_ESTUDIO_TECHO,
  BONUS_ESTUDIO_MAX,
  COSTO_RECONVERSION_BASE,
  COSTO_RECONVERSION_POR_PUNTO,
  COSTO_RECONVERSION_PESO_CALLE,
  CALLE_ACUMULADA_POR_ANIO,
  CALLE_ACUMULADA_POR_MOVIDA,
  EDAD_SEGUNDA_CHANCE_MIN,
  EDAD_SEGUNDA_CHANCE_MAX,
  clamp,
} from './constants.js';

/**
 * El camino de los 18: Estudiar o la Calle.
 *
 * No es un sistema de rutas. Es UN bit (`elegido`) mas UN sabor (`subVariante`)
 * que filtran el pool de eventos igual que lo hace la etapa. Todo evento sin
 * `camino` sigue estando disponible para los dos lados, que es la mayoria: la
 * bifurcacion cambia el color de la etapa, no el juego entero.
 */

export function estadoCaminoInicial() {
  return {
    puntosEstudio: 0,
    // De que lado tiraron los eventos estudio_friendly que le tocaron.
    afinidadFama: 0,
    afinidadMana: 0,
    elegido: null, // 'estudiar' | 'calle'
    subVariante: null, // 'comunicacion' | 'administracion'
    edadEleccion: null,
    reconversion: null, // { edad, costo } si uso la segunda chance
    // Cuanto se fue metiendo en la calle. Es lo que encarece reconvertirse.
    calleAcumulada: 0,
  };
}

/**
 * Anota puntos de estudio. `fuente` es un resultado de evento o un evento
 * automatico: cualquiera puede traer `estudio` y `afinidad`.
 */
export function registrarEstudio(estado, fuente) {
  if (!fuente) return;
  const c = estado.camino;
  if (fuente.estudio) c.puntosEstudio += fuente.estudio;
  if (fuente.afinidad === 'fama') c.afinidadFama += fuente.estudio ?? 1;
  if (fuente.afinidad === 'mana') c.afinidadMana += fuente.estudio ?? 1;
}

/** Cuanto empuja el contador oculto a la tirada de la bifurcacion. */
export function bonusEstudio(estado) {
  const p = clamp(estado.camino.puntosEstudio, 0, PUNTOS_ESTUDIO_TECHO);
  return (p / PUNTOS_ESTUDIO_TECHO) * BONUS_ESTUDIO_MAX;
}

export function estudioEsViable(estado) {
  return estado.camino.puntosEstudio >= PUNTOS_ESTUDIO_VIABLE;
}

/**
 * Que carrera le toca si eligio Estudiar. Sale de que tipo de eventos
 * estudio_friendly predominaron, no de una eleccion aparte: el jugador ya
 * la eligio sin saberlo durante todo el Secundario.
 */
export function subVarianteSegunAfinidad(estado) {
  const { afinidadFama, afinidadMana } = estado.camino;
  if (afinidadFama === afinidadMana) {
    // Empate: lo tira una moneda con semilla, a proposito.
    //
    // La version obvia era desempatar con el stat mas alto (Fama -> Comunicacion,
    // Maña -> Administracion), pero Maña arranca en 8-18 y Fama en 3-10: el
    // desempate se lo llevaba Administracion casi siempre y el reparto simulado
    // daba 40/60. Si el secundario no dejo ninguna señal, que sea una moneda es
    // mas honesto que un desempate que ya viene torcido de la creacion.
    return chance(estado.rng, 0.5) ? 'comunicacion' : 'administracion';
  }
  return afinidadFama > afinidadMana ? 'comunicacion' : 'administracion';
}

/** Fija el camino. Se llama una sola vez, desde el evento de bifurcacion. */
export function definirCamino(estado, id) {
  const c = estado.camino;
  c.elegido = id;
  c.edadEleccion = estado.edad;
  c.subVariante = id === 'estudiar' ? subVarianteSegunAfinidad(estado) : null;
  return c;
}

/**
 * Segunda chance: reconvertirse a Estudiar de grande. Cuesta guita y la
 * cuenta la escribe tu propia carrera —  cuanto mas metido en la calle
 * estas, mas caro es dejarla.
 */
export function costoReconversion(estado) {
  const c = estado.camino;
  const base = COSTO_RECONVERSION_BASE + c.calleAcumulada * COSTO_RECONVERSION_POR_PUNTO;
  const multCalle = 1 + (estado.stats.calle / 100) * COSTO_RECONVERSION_PESO_CALLE;
  return Math.round(base * multCalle);
}

export function puedeReconvertirse(estado) {
  const c = estado.camino;
  return (
    c.elegido === 'calle' &&
    !c.reconversion &&
    estado.edad >= EDAD_SEGUNDA_CHANCE_MIN &&
    estado.edad <= EDAD_SEGUNDA_CHANCE_MAX
  );
}

/** Paga y cambia de lado. Devuelve false si no le alcanzaba la guita. */
export function reconvertirse(estado) {
  const costo = costoReconversion(estado);
  if (estado.guita < costo) return false;
  estado.guita -= costo;
  estado.camino.reconversion = { edad: estado.edad, costo };
  estado.camino.elegido = 'estudiar';
  estado.camino.subVariante = subVarianteSegunAfinidad(estado);
  return true;
}

/** Suma al contador de "cuan metido en la calle esta". Corre en el cierre del año. */
export function acumularCalle(estado, movidasDelAnio = 0) {
  if (estado.camino.elegido !== 'calle') return;
  estado.camino.calleAcumulada +=
    CALLE_ACUMULADA_POR_ANIO + movidasDelAnio * CALLE_ACUMULADA_POR_MOVIDA;
}

/** Etiqueta corta para la ficha y la biografia. */
export function etiquetaCamino(estado) {
  const c = estado.camino;
  if (!c?.elegido) return null;
  const base = CAMINOS[c.elegido];
  const sub = c.subVariante ? SUBVARIANTES[c.subVariante] : null;
  return {
    id: c.elegido,
    label: sub ? sub.label : base.label,
    icono: sub ? sub.icono : base.icono,
    desc: sub ? sub.desc : base.desc,
    reconvertido: !!c.reconversion,
  };
}
