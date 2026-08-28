import { BLOQUES_BIOGRAFIA, SECCIONES_BIOGRAFIA } from '../data/biografia.js';
import { vistaHijo, vistaSocio } from './vinculos.js';
import { tuvoFlag, flagsDeCarrera } from './memoria.js';
import { vistaNegocio, afinidadDominante } from './negocio.js';
import { rndElem } from './rng.js';

/**
 * Arma la biografía final combinando el banco de bloques.
 *
 * Una sección = un bloque. De todos los que matchean gana el de mayor `peso`;
 * si empatan, desempata el azar con semilla, así una partida cargada rearma
 * exactamente la misma biografía.
 *
 * El azar acá va sobre una copia del RNG a propósito: pedir la biografía no
 * puede correr la secuencia de la partida (la pantalla final la puede pedir
 * más de una vez).
 */

/**
 * El contexto completo. Esta función es la lista viva de variables gatillo:
 * si un bloque quiere mirar algo que no está acá, hay que agregarlo acá
 * primero. La documentación de cada campo está en data/biografia.js.
 */
export function contextoBiografia(estado, final) {
  const diferencia = estado.ventas - estado.rival.ventas;
  const flags = flagsDeCarrera(estado);
  return {
    jugador: estado.jugador,
    origen: estado.origen,
    pibeMaravilla: !!estado.pibeMaravilla,

    edad: estado.edad,
    guita: estado.guita,
    stats: estado.stats,
    ventas: estado.ventas,
    movidas: estado.movidas,

    camino: estado.camino?.elegido ?? null,
    sub: estado.camino?.subVariante ?? null,
    reconvertido: !!estado.camino?.reconversion,
    edadEleccion: estado.camino?.reconversion?.edad ?? estado.camino?.edadEleccion ?? null,
    puntosEstudio: estado.camino?.puntosEstudio ?? 0,

    // En qué se convirtió después de los 23.
    negocio: vistaNegocio(estado),
    rubro: afinidadDominante(estado),

    hijo: vistaHijo(estado),
    // El socio solo cuenta como personaje si llegó a aparecer en la partida.
    socio: estado.socio?.momentos?.length ? vistaSocio(estado) : null,

    territorioMax: estado.territorios.reduce((m, t) => Math.max(m, t.nivel), 0),
    territorios: estado.territorios,
    // Lo que hiciste con cada tipo al que le sacaste su lugar, y lo que no
    // pudiste bancar. Las dos cosas sobreviven al territorio en sí.
    duenios: estado.duenios ?? [],
    territoriosPerdidos: estado.territoriosPerdidos ?? [],
    mudanzas: estado.mudanzas,
    enElExterior: estado.enElExterior,
    volvioAlPais: estado.volvioAlPais,

    duelo: diferencia > 0 ? 'gano' : diferencia === 0 ? 'empate' : 'perdio',
    diferencia,
    rival: estado.rival,

    finalId: final.id,
    causa: final.causa,
    rareza: final.rareza,

    flags,
    tuvo: (flag) => tuvoFlag(estado, flag),
  };
}

/** El bloque que gana en una sección. */
function elegirBloque(seccion, ctx, rng) {
  const candidatos = BLOQUES_BIOGRAFIA.filter((b) => {
    if (b.seccion !== seccion) return false;
    try {
      return !!b.cuando(ctx);
    } catch {
      // Un bloque que revienta por un campo faltante no puede tirar abajo la
      // pantalla final: se descarta y sigue el que venga.
      return false;
    }
  });
  if (!candidatos.length) return null;
  const maxPeso = Math.max(...candidatos.map((b) => b.peso ?? 0));
  const finalistas = candidatos.filter((b) => (b.peso ?? 0) === maxPeso);
  return finalistas.length === 1 ? finalistas[0] : rndElem(rng, finalistas);
}

/**
 * Devuelve [{ seccion, titulo, id, texto }] listo para pintar.
 * Nunca devuelve menos de una entrada por sección: cada una tiene su bloque
 * de piso con `peso: 0` y `cuando: () => true`.
 */
export function armarBiografia(estado, final) {
  const ctx = contextoBiografia(estado, final);
  // Copia del RNG: la biografía no mueve la secuencia de la partida.
  const rng = { seed: (estado.rng?.seed ?? 1) >>> 0 };

  const salida = [];
  for (const s of SECCIONES_BIOGRAFIA) {
    const bloque = elegirBloque(s.id, ctx, rng);
    if (!bloque) continue;
    let texto;
    try {
      texto = bloque.texto(ctx);
    } catch {
      continue;
    }
    salida.push({ seccion: s.id, titulo: s.titulo, id: bloque.id, texto });
  }
  return salida;
}

/** Cuántos bloques hay por sección. Lo usa el simulador para validar el banco. */
export function inventarioBiografia() {
  const conteo = {};
  for (const b of BLOQUES_BIOGRAFIA) conteo[b.seccion] = (conteo[b.seccion] ?? 0) + 1;
  return { total: BLOQUES_BIOGRAFIA.length, porSeccion: conteo };
}
