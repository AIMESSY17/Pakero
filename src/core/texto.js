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
    // El streamer parodiado del cartel de intro. Lo usan los eventos de
    // farandula para nombrar a alguien que ya existe en esta partida.
    streamer: estado.streamer,
    camino: estado.camino?.elegido ? CAMINOS[estado.camino.elegido] : null,
    subVariante: estado.camino?.subVariante ? SUBVARIANTES[estado.camino.subVariante] : null,
    costoReconversion: costoReconversion(estado),
    territorios: estado.territorios.length,

    // Contexto de Territorio para los eventos de acercamiento, dueño,
    // mantenimiento y tension. Lo arma el motor en `focoTerritorio` antes de
    // construir el año; aca solo se expone con `?.` para que un evento que lo
    // lea cuando no corresponde no reviente, solo quede sin ese dato.
    terr: {
      duenio: estado.focoTerritorio?.duenio ?? estado.pendienteDuenio ?? null,
      lugar: estado.focoTerritorio?.lugar ?? null,
      flavor: estado.focoTerritorio?.flavor ?? null,
      hito: estado.focoTerritorio?.hito ?? null,
      aniosDesde: estado.focoTerritorio?.aniosDesde ?? null,
      a: estado.focoTerritorio?.a ?? null,
      b: estado.focoTerritorio?.b ?? null,
    },
  };
}

/** Resuelve un campo que puede ser string o `(ctx) => string`. */
export function resolverTexto(valor, ctx) {
  return typeof valor === 'function' ? valor(ctx) : (valor ?? '');
}
