import { rndElem, rndInt } from './rng.js';
import { NOMBRES_VILLEROS, NOMBRES_HIJOS, APODOS } from '../data/nombres.js';
import {
  HIJO_TRACKER_INICIAL,
  HIJO_DERIVA_ATENCION_ALTA,
  HIJO_DERIVA_SALUD_BAJA,
  HIJO_DERIVA_BUEN_ANIO,
  ATENCION_ZONA_ROJA,
  UMBRAL_SALUD_BAJA,
  SOCIO_LEALTAD_INICIAL,
  SOCIO_LEALTAD_MIN,
  SOCIO_LEALTAD_MAX,
  SOCIO_UMBRAL_TRAICION,
  SOCIO_UMBRAL_FIRME,
  SOCIO_PENALIZACION_EGOISTA,
  SOCIO_ARCO,
  estadoHijo,
  clamp,
} from './constants.js';

/**
 * Los dos vinculos que el juego sigue de verdad: el hijo y el socio.
 *
 * Ninguno de los dos es un stat. Son trackers propios (0-100) que no entran en
 * ninguna formula de ingreso ni de tirada: lo unico que hacen es cambiar como
 * te va con ellos y que dice de vos la biografia del final.
 */

// ---------------------------------------------------------------------------
// Hijo
// ---------------------------------------------------------------------------

export function crearHijo(estado) {
  return {
    nombre: rndElem(estado.rng, NOMBRES_HIJOS),
    edadJugador: estado.edad, // la edad tuya cuando nacio
    anio: estado.anio,
    tracker: HIJO_TRACKER_INICIAL,
    // Los momentos que le movieron la aguja, para el bloque de la biografia.
    hitos: [],
  };
}

/** Edad del pibe hoy. */
export function edadDelHijo(estado) {
  if (!estado.hijo) return null;
  return estado.edad - estado.hijo.edadJugador;
}

/**
 * Mueve el tracker del hijo. `motivo` queda anotado para la biografia: al
 * final importa QUE le hiciste, no solo el numero.
 */
export function moverHijo(estado, delta, motivo = null) {
  const h = estado.hijo;
  if (!h || !delta) return 0;
  const antes = h.tracker;
  h.tracker = clamp(Math.round(h.tracker + delta), 0, 100);
  const real = h.tracker - antes;
  if (real && motivo) {
    h.hitos.push({ edad: estado.edad, edadHijo: edadDelHijo(estado), delta: real, motivo });
  }
  return real;
}

/**
 * Deriva anual: la casa se nota aunque no haya un evento que lo diga. Vivir
 * marcado o roto le pega; un buen año lo levanta un poco.
 */
export function derivaAnualHijo(estado, nota) {
  if (!estado.hijo) return 0;
  let d = 0;
  if (estado.stats.atencion >= ATENCION_ZONA_ROJA) d += HIJO_DERIVA_ATENCION_ALTA;
  if (estado.stats.salud < UMBRAL_SALUD_BAJA) d += HIJO_DERIVA_SALUD_BAJA;
  if (nota >= 7.5) d += HIJO_DERIVA_BUEN_ANIO;
  return moverHijo(estado, d);
}

/** Resumen listo para la ficha, el resumen anual y la biografia. */
export function vistaHijo(estado) {
  const h = estado.hijo;
  if (!h) return null;
  const est = estadoHijo(h.tracker);
  const edad = edadDelHijo(estado);
  return {
    nombre: h.nombre,
    edad,
    // El año que nace, "0 años" queda raro en pantalla.
    edadLabel: edad <= 0 ? 'recién nacido' : `${edad} ${edad === 1 ? 'año' : 'años'}`,
    tracker: h.tracker,
    estado: est.id,
    label: est.label,
    color: est.color,
    icono: est.icono,
    hitos: h.hitos,
  };
}

// ---------------------------------------------------------------------------
// Socio
// ---------------------------------------------------------------------------

export function crearSocio(estado) {
  return {
    nombre: rndElem(estado.rng, NOMBRES_VILLEROS),
    apodo: rndElem(estado.rng, APODOS),
    lealtad: SOCIO_LEALTAD_INICIAL + rndInt(estado.rng, -5, 5),
    // Momentos del arco ya jugados: 'presentacion' | 'prueba' | 'cierre'
    momentos: [],
    // 'activo' mientras dura; despues de la prueba queda 'firme' o 'traiciono'
    estado: 'activo',
    // Lo que hizo en cada momento, para la biografia.
    hitos: [],
  };
}

export function moverLealtad(estado, delta, motivo = null) {
  const s = estado.socio;
  if (!s || !delta) return 0;
  // Un socio que ya te dio vuelta la cara no vuelve a moverse.
  if (s.estado === 'traiciono') return 0;
  const antes = s.lealtad;
  s.lealtad = clamp(Math.round(s.lealtad + delta), SOCIO_LEALTAD_MIN, SOCIO_LEALTAD_MAX);
  const real = s.lealtad - antes;
  if (real && motivo) s.hitos.push({ edad: estado.edad, delta: real, motivo });
  return real;
}

/** Las opciones egoistas no avisan: le van bajando la lealtad de a poco. */
export function castigarEgoismo(estado) {
  return moverLealtad(estado, SOCIO_PENALIZACION_EGOISTA, 'Otra vez te la guardaste vos.');
}

/** Como va a salir el proximo momento del arco, segun la lealtad de hoy. */
export function humorDelSocio(estado) {
  const s = estado.socio;
  if (!s) return null;
  if (s.estado === 'traiciono') return 'traiciono';
  if (s.lealtad < SOCIO_UMBRAL_TRAICION) return 'quebrado';
  if (s.lealtad >= SOCIO_UMBRAL_FIRME) return 'firme';
  return 'tibio';
}

/** Momento del arco que le toca ahora (o null). Se juegan en orden. */
export function momentoPendiente(estado) {
  const s = estado.socio;
  // Ojo: un socio que te traiciono NO corta el arco. Le falta el cierre, que
  // es justamente el momento en que vuelve.
  if (!s) return null;
  for (const m of SOCIO_ARCO) {
    if (s.momentos.includes(m.id)) continue;
    if (estado.edad < m.edadMin || estado.edad > m.edadMax) return null;
    return m.id;
  }
  return null;
}

export function marcarMomento(estado, id) {
  if (estado.socio && !estado.socio.momentos.includes(id)) estado.socio.momentos.push(id);
}

export function nombreSocio(socio) {
  return socio ? `${socio.nombre} "${socio.apodo}"` : '';
}

export function vistaSocio(estado) {
  const s = estado.socio;
  if (!s) return null;
  const humor = humorDelSocio(estado);
  const meta = {
    firme: { label: 'Te banca a muerte', color: 'verde', icono: '🤝' },
    tibio: { label: 'Anda ahí', color: 'humo', icono: '🤝' },
    quebrado: { label: 'Se le nota la bronca', color: 'dorado', icono: '😠' },
    traiciono: { label: 'Te dio vuelta la cara', color: 'rojo', icono: '🐍' },
  }[humor];
  return {
    nombre: s.nombre,
    apodo: s.apodo,
    completo: nombreSocio(s),
    humor,
    estado: s.estado,
    momentos: s.momentos,
    hitos: s.hitos,
    ...meta,
  };
}
