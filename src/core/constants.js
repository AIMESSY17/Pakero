/**
 * Todas las perillas del balance en un solo lugar.
 * Si algo se siente mal jugando, se toca aca y no en la logica.
 */

// --- Stats reales (Guita NO es un stat, es un contador de plata aparte) ---
export const STATS = ['calle', 'fama', 'mana', 'atencion', 'salud'];

export const STAT_META = {
  calle: { label: 'Calle', icono: '🧱', desc: 'Respeto y aguante en el barrio' },
  fama: { label: 'Fama', icono: '📣', desc: 'Cuanto suena tu nombre' },
  mana: { label: 'Maña', icono: '🧠', desc: 'Viveza para zafar y negociar' },
  atencion: { label: 'Atención', icono: '🚨', desc: 'Cuanto te tiene marcado la yuta', invertido: true },
  salud: { label: 'Salud', icono: '❤️', desc: 'El cuerpo que te queda' },
};

export const STAT_MIN = 0;
export const STAT_MAX = 100;

// --- Etapas ---
export const EDAD_INICIAL = 12;
export const EDAD_FIN_SECUNDARIO = 17; // el año que cumple 18 ya es Adultez
export const EDAD_MAXIMA = 45; // pasado esto la partida cierra sola

export const ETAPAS = {
  secundario: { id: 'secundario', label: 'Secundario', edadMin: 12, edadMax: 17 },
  adultez: { id: 'adultez', label: 'Adultez', edadMin: 18, edadMax: 45 },
};

export function etapaPorEdad(edad) {
  return edad <= EDAD_FIN_SECUNDARIO ? 'secundario' : 'adultez';
}

// --- Estructura del año ---
// 3 automaticos (uno Calle, uno Fama, uno Maña-o-baja-Atencion) + 1 con decision.
export const SLOTS_AUTOMATICOS = ['calle', 'fama', 'mana_atencion'];
export const EVENTOS_DECISION_POR_ANIO = 1;

// --- Economia ---
export const GUITA_INICIAL = 5000;
export const INGRESO_MIN = 10_000;
export const INGRESO_MAX = 50_000_000;
// Calle/Fama son un "piso" chico: crecen solos con la edad (ver crecimiento
// pasivo más abajo), así que si pesaran mucho acá la guita se ganaría sola
// con el correr de los años, sin que el jugador haga nada. La plata real
// tiene que salir de jugar: eventos, Movidas, Ventas y Territorios.
export const VALOR_CALLE = 1_500;
export const VALOR_FAMA = 3_000;
export const VALOR_MOVIDA = 25_000;
export const VALOR_VENTA = 20_000;
/** Renta anual por cada territorio en tu poder: conquistar paga, y sigue pagando. */
export const VALOR_TERRITORIO = 800_000;
/** Salud por debajo de este umbral castiga el ingreso y bloquea riesgo fisico. */
export const UMBRAL_SALUD_BAJA = 30;
export const PENALIZACION_INGRESO_SALUD = 0.7;

// --- Atencion policial ---
export const ATENCION_PRESO_AUTOMATICO = 100;
export const ATENCION_ZONA_ROJA = 80; // 80-99: 50% de caer preso en evento de riesgo
export const PROB_PRESO_ZONA_ROJA = 0.5;

// --- Nota del año ---
export const VALOR_GRADO = {
  critico_exito: 10,
  exito: 8,
  exito_con_costo: 6,
  fracaso: 3,
  critico_fracaso: 0,
};

export const GRADO_META = {
  critico_exito: { label: 'Críticazo', color: 'dorado', icono: '⭐' },
  exito: { label: 'Salió bien', color: 'verde', icono: '✅' },
  exito_con_costo: { label: 'Salió, pero costó', color: 'verde', icono: '🩹' },
  fracaso: { label: 'Fracaso', color: 'rojo', icono: '❌' },
  critico_fracaso: { label: 'Desastre', color: 'rojo', icono: '💀' },
};

// --- Crecimiento pasivo anual ---
// 12-29: +1/+2 repartido entre Calle/Fama/Maña (uno solo por año, al azar).
// 30+:   -1 a cada uno de los tres.
export const EDAD_FIN_CRECIMIENTO = 29;
export const STATS_CRECIMIENTO = ['calle', 'fama', 'mana'];
export const CRECIMIENTO_MIN = 1;
export const CRECIMIENTO_MAX = 2;
export const DECAIMIENTO = -1;

// --- Rendimiento decreciente ---
// Freno propio del motor: cuanto mas alto esta un stat de progresion, menos
// rinde cada punto nuevo. Sin esto, contenido generoso lleva Fama a 95 sola y
// el Picantillo de Oro se gana en casi todas las partidas.
// factor = 1 - (valor/100)^2 * FUERZA   →  en 0: x1 | en 50: x0.81 | en 95: x0.32
export const STATS_RENDIMIENTO_DECRECIENTE = ['calle', 'fama', 'mana'];
export const FUERZA_RENDIMIENTO_DECRECIENTE = 0.75;

export function factorRendimiento(valor) {
  return 1 - Math.pow(clamp(valor, 0, 100) / 100, 2) * FUERZA_RENDIMIENTO_DECRECIENTE;
}

// --- Riesgo ---
export const NIVELES_RIESGO = ['nulo', 'bajo', 'medio', 'alto', 'extremo'];
export const RIESGO_META = {
  nulo: { label: 'Sin riesgo', color: 'humo', atencion: 0 },
  bajo: { label: 'Riesgo bajo', color: 'verde', atencion: 2 },
  medio: { label: 'Riesgo medio', color: 'dorado', atencion: 5 },
  alto: { label: 'Riesgo alto', color: 'rojo', atencion: 9 },
  extremo: { label: 'Riesgo extremo', color: 'rojo', atencion: 14 },
};
/** Riesgos que se bloquean con Salud baja si la opcion pide esfuerzo fisico. */
export const RIESGOS_FISICOS_BLOQUEABLES = ['alto', 'extremo'];

// --- Tirada ---
/** Reparto de la banda de exito: 20% criticazo, 55% exito, 25% exito con costo. */
export const CORTE_CRITICO_EXITO = 0.2;
export const CORTE_EXITO = 0.75;
/** Reparto de la banda de fracaso: 75% fracaso comun, 25% desastre. */
export const CORTE_FRACASO = 0.75;
export const PROB_MIN = 0.02;
export const PROB_MAX = 0.97;
/** Cuanto pueden empujar los stats relevantes la probabilidad base. */
export const PESO_STATS_EN_TIRADA = 0.18;

// --- Minijuegos ---
/** El resultado del minijuego SUMA a la tirada, nunca la reemplaza. */
export const BONUS_MINIJUEGO_MIN = -0.1;
export const BONUS_MINIJUEGO_MAX = 0.25;

// --- Mala racha ---
export const ANIOS_MALA_RACHA = 3;

// --- Creacion ---
export const PROB_PIBE_MARAVILLA = 0.01;
export const PIBE_MARAVILLA_BONUS = { calle: 30, fama: 25 };
export const PIBE_MARAVILLA_MULT_GUITA = 3;

// --- Territorio ---
export const PROB_CONQUISTA_ORIGEN = 0.7;
export const PROB_CONQUISTA_FORASTERO = 0.5;

// --- Rareza del final (Territorios + Fama) ---
export const RAREZA_UMBRALES = { legendaria: 120, rara: 70 };
export const PUNTOS_POR_TERRITORIO = 20;

// --- Guardado ---
export const STORAGE_KEY = 'paquero:partida:v1';
export const STORAGE_VERSION = 1;

// --- Helpers numericos ---
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const clampStat = (v) => clamp(Math.round(v), STAT_MIN, STAT_MAX);

export function formatearGuita(n) {
  const v = Math.round(n);
  return '$' + v.toLocaleString('es-AR');
}

export function formatearGuitaCorta(n) {
  const v = Math.round(n);
  if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (Math.abs(v) >= 1_000) return '$' + Math.round(v / 1000) + 'k';
  return '$' + v;
}
