import { itemPorId } from '../data/mercado.js';
import { clampStat } from './constants.js';

export function yaComprado(estado, item) {
  if (item.familia === 'staff') return estado.mercado.staff.includes(item.id);
  if (item.familia === 'lujo') return estado.mercado.lujo.includes(item.id);
  return false; // los consumibles se pueden comprar todas las veces que quieras
}

export function puedeComprar(estado, item) {
  return estado.guita >= item.precio && !yaComprado(estado, item);
}

/**
 * Compra. Muta el estado (se lo llama siempre sobre una copia del reducer).
 * Devuelve { ok, mensaje, deltas }.
 */
export function comprar(estado, itemId) {
  const item = itemPorId(itemId);
  if (!item) return { ok: false, mensaje: 'Ese item no existe.' };
  if (yaComprado(estado, item)) return { ok: false, mensaje: 'Eso ya lo tenés.' };
  if (estado.guita < item.precio) return { ok: false, mensaje: 'No te alcanza la guita.' };

  estado.guita -= item.precio;
  const deltas = {};

  if (item.familia === 'staff') {
    estado.mercado.staff.push(item.id);
  } else if (item.familia === 'lujo') {
    estado.mercado.lujo.push(item.id);
    const fama = item.efectos?.famaAlComprar ?? 0;
    if (fama) {
      estado.stats.fama = clampStat(estado.stats.fama + fama);
      deltas.fama = fama;
    }
  } else {
    estado.mercado.consumiblesComprados.push(item.id);
    for (const [k, v] of Object.entries(item.consumo?.stats ?? {})) {
      estado.stats[k] = clampStat(estado.stats[k] + v);
      deltas[k] = (deltas[k] ?? 0) + v;
    }
    if (item.consumo?.buff) {
      estado.mercado.buffs.push({ ...item.consumo.buff, origen: item.id });
    }
  }

  return { ok: true, mensaje: `Compraste: ${item.nombre}`, deltas, item };
}

/** Activos visibles en la ficha (staff + lujo). */
export function activosDelJugador(estado) {
  return [...estado.mercado.staff, ...estado.mercado.lujo].map(itemPorId).filter(Boolean);
}
