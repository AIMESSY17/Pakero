import { EVENTOS_SECUNDARIO } from './secundario.js';
import { EVENTOS_ADULTEZ } from './adultez.js';
import { EVENTOS_CRISIS } from './crisis.js';
import { ETAPAS } from '../../core/constants.js';

/**
 * Pool unico. No hay rutas, ni requisitos, ni desbloqueos entre eventos:
 * el filtro es solo etapa + edad.
 *
 * Para sumar contenido nuevo: crear el archivo, importarlo aca y sumarlo al
 * spread. Nada mas que tocar.
 */
export const TODOS_LOS_EVENTOS = [...EVENTOS_SECUNDARIO, ...EVENTOS_ADULTEZ].map(normalizar);

export const POOL_CRISIS = EVENTOS_CRISIS.map(normalizar);

function normalizar(ev) {
  const etapa = ETAPAS[ev.etapa];
  return {
    peso: 1,
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: ev.edad_min ?? etapa?.edadMin ?? 0,
    edad_max: ev.edad_max ?? etapa?.edadMax ?? 999,
    ...ev,
  };
}

/** Chequeo barato de integridad del pool, util al sumar contenido nuevo. */
export function validarPool(pool = TODOS_LOS_EVENTOS) {
  const problemas = [];
  const vistos = new Set();
  for (const ev of pool) {
    if (vistos.has(ev.id)) problemas.push(`id duplicado: ${ev.id}`);
    vistos.add(ev.id);
    if (ev.tipo === 'automatico') {
      if (!ev.slot) problemas.push(`${ev.id}: automatico sin slot`);
      if (!ev.stats || Object.keys(ev.stats).length === 0)
        problemas.push(`${ev.id}: automatico sin stats`);
    } else if (ev.tipo === 'decision') {
      if (!ev.opciones || ev.opciones.length < 2)
        problemas.push(`${ev.id}: decision con menos de 2 opciones`);
      ev.opciones?.forEach((op, i) => {
        for (const g of ['critico_exito', 'exito', 'exito_con_costo', 'fracaso', 'critico_fracaso']) {
          if (!op.resultados?.[g]) problemas.push(`${ev.id} op${i}: falta grado ${g}`);
        }
      });
    } else {
      problemas.push(`${ev.id}: tipo desconocido "${ev.tipo}"`);
    }
  }
  return problemas;
}
