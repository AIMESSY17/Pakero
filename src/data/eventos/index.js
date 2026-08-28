import { EVENTOS_SECUNDARIO } from './secundario.js';
import { EVENTOS_ADULTEZ } from './adultez.js';
import { EVENTOS_CRISIS } from './crisis.js';
import { EVENTOS_CAMINOS } from './caminos.js';
import { EVENTOS_BISAGRA_ESPECIALES } from './bisagras.js';
import { ETAPAS } from '../../core/constants.js';

/**
 * Pool unico. Sigue sin haber rutas, requisitos ni desbloqueos entre eventos:
 * el filtro del pool normal es etapa + edad, y opcionalmente `camino` / `sub`,
 * que es la unica cosa que la bifurcacion de los 18 le agrega al motor.
 *
 * Los eventos ESPECIALES (bisagras.js) viven aparte: no se sortean, los
 * programa el motor cuando corresponde (ver core/engine.js).
 *
 * Para sumar contenido nuevo: crear el archivo, importarlo aca y sumarlo al
 * spread. Nada mas que tocar.
 */
export const TODOS_LOS_EVENTOS = [
  ...EVENTOS_SECUNDARIO,
  ...EVENTOS_ADULTEZ,
  ...EVENTOS_CAMINOS,
].map(normalizar);

export const POOL_CRISIS = EVENTOS_CRISIS.map(normalizar);

export const POOL_ESPECIALES = EVENTOS_BISAGRA_ESPECIALES.map(normalizar);

/** Todos los eventos especiales de un tipo dado, en orden de declaracion. */
export function especialesDe(tipo) {
  return POOL_ESPECIALES.filter((e) => e.especial === tipo);
}

function normalizar(ev) {
  const etapa = ETAPAS[ev.etapa];
  return {
    peso: 1,
    categoria: null,
    esfuerzo_fisico: false,
    // null = sirve para los dos caminos (la mayoria del pool).
    camino: null,
    sub: null,
    edad_min: ev.edad_min ?? etapa?.edadMin ?? 0,
    edad_max: ev.edad_max ?? etapa?.edadMax ?? 999,
    ...ev,
  };
}

const GRADOS = ['critico_exito', 'exito', 'exito_con_costo', 'fracaso', 'critico_fracaso'];
const CAMINOS_VALIDOS = ['estudiar', 'calle'];
const SUBS_VALIDAS = ['comunicacion', 'administracion'];

/** Chequeo barato de integridad del pool, util al sumar contenido nuevo. */
export function validarPool(pool = [...TODOS_LOS_EVENTOS, ...POOL_CRISIS, ...POOL_ESPECIALES]) {
  const problemas = [];
  const vistos = new Set();
  for (const ev of pool) {
    if (vistos.has(ev.id)) problemas.push(`id duplicado: ${ev.id}`);
    vistos.add(ev.id);

    if (ev.camino && !CAMINOS_VALIDOS.includes(ev.camino))
      problemas.push(`${ev.id}: camino desconocido "${ev.camino}"`);
    if (ev.sub && !SUBS_VALIDAS.includes(ev.sub))
      problemas.push(`${ev.id}: sub-variante desconocida "${ev.sub}"`);
    if (ev.sub && ev.camino !== 'estudiar')
      problemas.push(`${ev.id}: tiene sub-variante pero no es del camino estudiar`);

    if (ev.tipo === 'automatico') {
      if (!ev.slot) problemas.push(`${ev.id}: automatico sin slot`);
      if (!ev.stats || Object.keys(ev.stats).length === 0)
        problemas.push(`${ev.id}: automatico sin stats`);
    } else if (ev.tipo === 'decision') {
      if (!ev.opciones || ev.opciones.length < 2)
        problemas.push(`${ev.id}: decision con menos de 2 opciones`);
      ev.opciones?.forEach((op, i) => {
        for (const g of GRADOS) {
          if (!op.resultados?.[g]) problemas.push(`${ev.id} op${i}: falta grado ${g}`);
        }
      });
    } else {
      problemas.push(`${ev.id}: tipo desconocido "${ev.tipo}"`);
    }
  }
  return problemas;
}

/**
 * Chequea que el motor pueda armar un año en cada combinacion de etapa+camino.
 * Es el error que mas caro sale: un pool que se queda sin eventos de un slot
 * deja el año incompleto y no avisa.
 */
export function validarCobertura() {
  const problemas = [];
  const combos = [
    { etapa: 'secundario', camino: null, sub: null },
    { etapa: 'adultez', camino: 'calle', sub: null },
    { etapa: 'adultez', camino: 'estudiar', sub: 'comunicacion' },
    { etapa: 'adultez', camino: 'estudiar', sub: 'administracion' },
  ];
  for (const c of combos) {
    const pool = TODOS_LOS_EVENTOS.filter(
      (e) =>
        e.etapa === c.etapa &&
        (e.camino == null || e.camino === c.camino) &&
        (e.sub == null || e.sub === c.sub)
    );
    const etiqueta = `${c.etapa}${c.camino ? '/' + c.camino : ''}${c.sub ? '/' + c.sub : ''}`;
    for (const slot of ['calle', 'fama', 'mana_atencion']) {
      if (!pool.some((e) => e.tipo === 'automatico' && e.slot === slot))
        problemas.push(`${etiqueta}: sin evento automatico de slot "${slot}"`);
    }
    if (!pool.some((e) => e.tipo === 'decision'))
      problemas.push(`${etiqueta}: sin eventos con decision`);
  }
  return problemas;
}
