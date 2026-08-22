import {
  VALOR_CALLE,
  VALOR_FAMA,
  VALOR_MOVIDA,
  VALOR_VENTA,
  VALOR_TERRITORIO,
  INGRESO_MIN,
  INGRESO_MAX,
  UMBRAL_SALUD_BAJA,
  PENALIZACION_INGRESO_SALUD,
  VALOR_GRADO,
  ATENCION_ZONA_ROJA,
  clamp,
  RAREZA_UMBRALES,
  PUNTOS_POR_TERRITORIO,
} from './constants.js';

/**
 * Multiplicador de ingreso por edad/etapa.
 * Secundario x0.3 | 18-30 x1 | 30-45 x1.5 | 45+ x1.2
 */
export function bonusEdad(edad, etapa) {
  if (etapa === 'secundario') return 0.3;
  if (edad < 30) return 1;
  if (edad < 45) return 1.5;
  return 1.2;
}

/**
 * ingreso_anual = [(Calle x 1.500) + (Fama x 3.000) + (Territorios x 800.000)] x bonus_edad
 *                 + (Movidas x 25.000) + (Ventas x 20.000)
 * Acotado entre $10.000 y $50.000.000. Sin inflacion.
 *
 * Movidas y Ventas son los acumulados de carrera: la carrera que venis
 * construyendo es lo que te da de comer todos los años. Calle y Fama pesan
 * poco a propósito: suben solas con la edad (crecimiento pasivo), y si
 * pagaran fuerte la guita se ganaría solo por pasar los años. Los
 * Territorios sí pagan fuerte, porque conquistarlos es una acción real.
 */
export function ingresoAnual({ calle, fama, salud }, movidas, ventas, territorios, edad, etapa, mods = {}) {
  let base =
    (calle * VALOR_CALLE + fama * VALOR_FAMA + territorios * VALOR_TERRITORIO) *
      bonusEdad(edad, etapa) +
    movidas * VALOR_MOVIDA +
    ventas * VALOR_VENTA;

  if (salud < UMBRAL_SALUD_BAJA) base *= PENALIZACION_INGRESO_SALUD;
  if (mods.ingresoPct) base *= 1 + mods.ingresoPct; // Contador trucho, etc.

  return clamp(Math.round(base), INGRESO_MIN, INGRESO_MAX);
}

/**
 * nota_año = promedio de los grados del año (+1 si hubo Movida, +1 si hubo
 * Venta, -1 si Atencion >= 80%). Acotada 0..10.
 */
export function notaAnio(grados, { huboMovida, huboVenta, atencion }) {
  if (!grados || grados.length === 0) return 0;
  const suma = grados.reduce((acc, g) => acc + (VALOR_GRADO[g] ?? 0), 0);
  let nota = suma / grados.length;
  if (huboMovida) nota += 1;
  if (huboVenta) nota += 1;
  if (atencion >= ATENCION_ZONA_ROJA) nota -= 1;
  return clamp(Math.round(nota * 10) / 10, 0, 10);
}

/** Texto corto para acompañar la nota en el resumen del año. */
export function comentarioNota(nota) {
  if (nota >= 9) return 'Año de crack. No lo para nadie.';
  if (nota >= 7.5) return 'Buen año. Se nota el laburo.';
  if (nota >= 6) return 'Zafaste. Ni fu ni fa.';
  if (nota >= 4) return 'Año flojo. Hay que meterle.';
  if (nota >= 2) return 'Año para el olvido.';
  return 'Un desastre de punta a punta.';
}

/**
 * Empuje que dan los stats relevantes a una tirada, en [0, PESO_STATS_EN_TIRADA].
 * Las movidas se resuelven con Calle+Maña; las ventas con Calle+Fama.
 */
export function bonusStats(stats, categoria, peso) {
  const pares = categoria === 'venta' ? ['calle', 'fama'] : ['calle', 'mana'];
  const prom = (stats[pares[0]] + stats[pares[1]]) / 2;
  return (prom / 100) * peso;
}

/** Rareza del final segun Territorios + Fama. */
export function rarezaFinal(territorios, fama) {
  const puntos = territorios * PUNTOS_POR_TERRITORIO + fama;
  if (puntos >= RAREZA_UMBRALES.legendaria) return 'Legendaria';
  if (puntos >= RAREZA_UMBRALES.rara) return 'Rara';
  return 'Común';
}
