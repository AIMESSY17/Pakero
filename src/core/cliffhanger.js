import { CLIFFHANGERS } from '../data/cliffhangers.js';
import { rndElem } from './rng.js';

/**
 * Elige el cliffhanger del año.
 *
 * Contrato: SIEMPRE devuelve un texto. El banco tiene cinco entradas de
 * `peso: 0` con `cuando: () => true`, así que la lista de candidatos nunca
 * queda vacía por más rara que sea la partida. Si alguna vez quedara vacía,
 * igual se devuelve una línea antes que `null`: el resumen no puede cerrar sin
 * gancho, que es todo el punto de esta función.
 */

const RESPALDO = 'Cerraste el año con la sensación de que algo quedó abierto.';

export function elegirCliffhanger(estado, ctx) {
  const candidatos = CLIFFHANGERS.filter((cl) => {
    try {
      return !!cl.cuando(ctx);
    } catch {
      // Un cliffhanger que revienta por un campo que no existe no puede tirar
      // abajo el cierre del año: se descarta y sigue el que venga.
      return false;
    }
  });
  if (!candidatos.length) return RESPALDO;

  const maxPeso = Math.max(...candidatos.map((c) => c.peso ?? 0));
  const finalistas = candidatos.filter((c) => (c.peso ?? 0) === maxPeso);
  const elegido = finalistas.length === 1 ? finalistas[0] : rndElem(estado.rng, finalistas);

  try {
    return elegido.texto(ctx) || RESPALDO;
  } catch {
    return RESPALDO;
  }
}

/** Cuántos cliffhangers hay. Lo usa el simulador para validar el banco. */
export const totalCliffhangers = () => CLIFFHANGERS.length;
