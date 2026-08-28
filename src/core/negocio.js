import {
  AFINIDADES_NEGOCIO,
  IDS_AFINIDAD_NEGOCIO,
  PUNTOS_NEGOCIO_POR_ELECCION,
  PESO_AFINIDAD_NEGOCIO,
  EDAD_NEGOCIOS,
} from './constants.js';

/**
 * En qué se convierte el personaje después de los 23.
 *
 * Es el mismo truco que `puntosEstudio` en el Secundario, escalado a cinco
 * lados: un contador liviano que se llena con lo que el jugador ELIGE, y que
 * no bloquea ni desbloquea nada. Lo único que hace es inclinar el sorteo.
 *
 * Lo que este archivo NO hace, a propósito:
 *   - no saca eventos del pool
 *   - no exige un mínimo para nada
 *   - no cierra ninguna opción
 *
 * Un jugador con 100% de afinidad `finanzas` sigue viendo eventos de calle y
 * de farándula; solo ve los de finanzas más seguido. La diferencia entre
 * "inclinar" y "rutear" es exactamente esa, y es la que se pidió cuidar.
 */

export function estadoNegocioInicial() {
  const afinidad = {};
  for (const id of IDS_AFINIDAD_NEGOCIO) afinidad[id] = 0;
  return {
    afinidad,
    // Historial corto de qué fue eligiendo, para la biografía del final.
    elecciones: [],
  };
}

/** ¿Ya está en la etapa donde los negocios definen el camino? */
export const enEtapaNegocios = (estado) => estado.edad >= EDAD_NEGOCIOS;

/**
 * Anota una elección de negocio. `tipo` es una de las cinco afinidades; un
 * tipo desconocido se ignora en silencio, igual que un flag de memoria que no
 * existe: contenido mal tipeado no puede romper una partida.
 */
export function registrarNegocio(estado, tipo, contexto = null) {
  if (!tipo || !AFINIDADES_NEGOCIO[tipo]) return 0;
  const n = (estado.negocio ??= estadoNegocioInicial());
  n.afinidad[tipo] = (n.afinidad[tipo] ?? 0) + PUNTOS_NEGOCIO_POR_ELECCION;
  n.elecciones.push({ tipo, edad: estado.edad, contexto });
  return PUNTOS_NEGOCIO_POR_ELECCION;
}

export const totalAfinidad = (estado) =>
  Object.values(estado.negocio?.afinidad ?? {}).reduce((a, b) => a + b, 0);

/** Qué parte del total se lleva esa afinidad, 0..1. Sin datos, todas valen 0. */
export function proporcionAfinidad(estado, tipo) {
  const total = totalAfinidad(estado);
  if (!total) return 0;
  return (estado.negocio?.afinidad?.[tipo] ?? 0) / total;
}

/**
 * Multiplicador de peso para el sorteo. Nunca baja de 1: un evento de una
 * afinidad que el jugador no tocó nunca conserva su peso original y puede
 * salir igual.
 */
export function pesoPorAfinidad(estado, evento) {
  const tipo = evento?.rubro;
  if (!tipo || !AFINIDADES_NEGOCIO[tipo]) return 1;
  return 1 + PESO_AFINIDAD_NEGOCIO * proporcionAfinidad(estado, tipo);
}

/** La afinidad más fuerte, o null si todavía no eligió nada. */
export function afinidadDominante(estado) {
  const af = estado.negocio?.afinidad;
  if (!af || !totalAfinidad(estado)) return null;
  let mejor = null;
  for (const [id, v] of Object.entries(af)) {
    if (!mejor || v > af[mejor]) mejor = id;
  }
  return mejor;
}

/**
 * ¿Está repartido entre varias o hay una que manda?
 * Se considera dominante cuando se lleva más de un tercio del total: con cinco
 * afinidades el reparto parejo daría 20% cada una.
 */
export const UMBRAL_DOMINANTE = 1 / 3;

export function vistaNegocio(estado) {
  const total = totalAfinidad(estado);
  if (!total) return null;
  const dom = afinidadDominante(estado);
  const prop = proporcionAfinidad(estado, dom);
  const reparto = IDS_AFINIDAD_NEGOCIO.map((id) => ({
    ...AFINIDADES_NEGOCIO[id],
    puntos: estado.negocio.afinidad[id] ?? 0,
    proporcion: proporcionAfinidad(estado, id),
  }))
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos);

  return {
    total,
    dominante: prop >= UMBRAL_DOMINANTE ? { ...AFINIDADES_NEGOCIO[dom], proporcion: prop } : null,
    // Sin una que mande, el personaje es un multiuso — que también es un perfil.
    disperso: prop < UMBRAL_DOMINANTE,
    reparto,
  };
}

/** Etiqueta corta para la ficha y la biografía. */
export function etiquetaNegocio(estado) {
  const v = vistaNegocio(estado);
  if (!v) return null;
  if (v.dominante) {
    return { icono: v.dominante.icono, label: v.dominante.label, desc: v.dominante.desc };
  }
  return {
    icono: '🎲',
    label: 'De todo un poco',
    desc: 'No se especializó en nada: mete la mano donde aparezca.',
  };
}
