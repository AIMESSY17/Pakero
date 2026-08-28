import { costoReconversion } from './camino.js';
import { nombreSocio } from './vinculos.js';
import { nombreRivalCompleto } from '../data/nombres.js';
import { CAMINOS, SUBVARIANTES } from './constants.js';

/**
 * Algunos eventos tienen que nombrar a gente que se genera en la partida (el
 * socio, el hijo, el rival) o mostrar un numero que se calcula (lo que cuesta
 * reconvertirse). Para esos, `titulo` / `texto` pueden ser una funcion
 * `(ctx) => string` en vez de un string suelto.
 *
 * Todo lo demas del pool sigue siendo string plano, que es la mayoria.
 */

export function ctxTexto(estado) {
  return {
    edad: estado.edad,
    anio: estado.anio,
    guita: estado.guita,
    stats: estado.stats,
    jugador: estado.jugador,
    rival: estado.rival,
    rivalCompleto: nombreRivalCompleto(estado.rival),
    socio: estado.socio,
    socioNombre: estado.socio?.nombre ?? 'tu socio',
    socioCompleto: nombreSocio(estado.socio),
    hijo: estado.hijo,
    hijoNombre: estado.hijo?.nombre ?? 'el pibe',
    ubicacion: estado.ubicacion,
    camino: estado.camino?.elegido ? CAMINOS[estado.camino.elegido] : null,
    subVariante: estado.camino?.subVariante ? SUBVARIANTES[estado.camino.subVariante] : null,
    costoReconversion: costoReconversion(estado),
    territorios: estado.territorios.length,
  };
}

/** Resuelve un campo que puede ser string o `(ctx) => string`. */
export function resolverTexto(valor, ctx) {
  return typeof valor === 'function' ? valor(ctx) : (valor ?? '');
}
