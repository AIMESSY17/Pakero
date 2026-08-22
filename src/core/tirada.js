import { rnd } from './rng.js';
import { bonusStats } from './formulas.js';
import {
  CORTE_CRITICO_EXITO,
  CORTE_EXITO,
  CORTE_FRACASO,
  PROB_MIN,
  PROB_MAX,
  PESO_STATS_EN_TIRADA,
  BONUS_MINIJUEGO_MIN,
  BONUS_MINIJUEGO_MAX,
  clamp,
} from './constants.js';

/**
 * Traduce el resultado de un minijuego (score 0..1) a un bonus de
 * probabilidad. El minijuego NUNCA reemplaza la tirada: solo la empuja.
 */
export function bonusDeMinijuego(score) {
  const s = clamp(score ?? 0.5, 0, 1);
  return BONUS_MINIJUEGO_MIN + s * (BONUS_MINIJUEGO_MAX - BONUS_MINIJUEGO_MIN);
}

/** Probabilidad final de una opcion, ya con stats, minijuego y mods encima. */
export function probabilidadFinal({ probBase, categoria, stats, bonusMinijuego = 0, mods = {} }) {
  const p =
    probBase +
    bonusStats(stats, categoria, PESO_STATS_EN_TIRADA) +
    bonusMinijuego +
    (mods.bonusTirada ?? 0);
  return clamp(p, PROB_MIN, PROB_MAX);
}

/**
 * Tira y devuelve uno de los cinco grados.
 * La banda de exito se reparte 20/55/25 y la de fracaso 75/25.
 */
export function resolverTirada(rng, params) {
  const p = probabilidadFinal(params);
  const r = rnd(rng);

  let grado;
  if (r < p * CORTE_CRITICO_EXITO) grado = 'critico_exito';
  else if (r < p * CORTE_EXITO) grado = 'exito';
  else if (r < p) grado = 'exito_con_costo';
  else if (r < p + (1 - p) * CORTE_FRACASO) grado = 'fracaso';
  else grado = 'critico_fracaso';

  return { grado, prob: p, roll: r };
}

export const esExito = (grado) =>
  grado === 'critico_exito' || grado === 'exito' || grado === 'exito_con_costo';
