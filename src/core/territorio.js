import { rnd, rndElem, rndInt, barajar } from './rng.js';
import {
  VILLAS,
  PROVINCIAS,
  PAISES,
  PICANTILLO,
  NIVEL_TERRITORIO,
  UMBRALES_TERRITORIO,
  MOTIVOS_MUDANZA,
  COSTO_MUDANZA,
} from '../data/lugares.js';
import {
  PROB_CONQUISTA_ORIGEN,
  PROB_CONQUISTA_FORASTERO,
  clamp,
  clampStat,
  factorRendimiento,
} from './constants.js';

/**
 * Nivel de territorio que toca conquistar ahora (se conquistan en orden).
 * Devuelve null si ya estan los cuatro o si todavia no llega a los stats.
 */
export function nivelDisponible(estado) {
  const nivel = estado.territorios.length + 1;
  if (nivel > 4) return null;
  const umbral = UMBRALES_TERRITORIO[nivel];
  return umbral.cumple(estado.stats, estado.guita) ? nivel : null;
}

/** Datos para la barra de progreso hacia el proximo hito de la ficha. */
export function progresoProximoHito(estado) {
  const nivel = estado.territorios.length + 1;
  if (nivel > 4) {
    return { completo: true, nivel: 4, label: 'Ganaste todo', texto: '—', progreso: 1 };
  }
  const umbral = UMBRALES_TERRITORIO[nivel];
  const meta = NIVEL_TERRITORIO[nivel];
  return {
    completo: false,
    nivel,
    label: meta.label,
    texto: umbral.texto,
    progreso: clamp(umbral.progreso(estado.stats, estado.guita), 0, 1),
    listo: umbral.cumple(estado.stats, estado.guita),
  };
}

/** ¿Está peleando en su zona de origen o llegó de afuera? */
export function esForastero(estado) {
  return !estado.ubicacion.esOrigen;
}

export function probConquista(estado) {
  return esForastero(estado) ? PROB_CONQUISTA_FORASTERO : PROB_CONQUISTA_ORIGEN;
}

/** Minijuego que le toca a la conquista de ese nivel (el 4 no tiene). */
export function minijuegoConquista(rng, nivel) {
  const lista = NIVEL_TERRITORIO[nivel].minijuegos;
  return lista.length ? rndElem(rng, lista) : null;
}

function nombresUsados(estado, tipo) {
  const usados = new Set();
  for (const t of estado.territorios) if (t.tipo === tipo) usados.add(t.nombre);
  for (const z of estado.zonasVisitadas) if (z.tipo === tipo) usados.add(z.nombre);
  return usados;
}

/** Que lugar concreto se lleva al conquistar ese nivel. */
export function nombreParaTerritorio(estado, nivel, rng) {
  const tipoPorNivel = { 1: 'villa', 2: 'provincia', 3: 'pais', 4: 'picantillo' };
  const tipo = tipoPorNivel[nivel];
  if (nivel === 4) return { tipo, nombre: PICANTILLO };

  // Si ya estás parado en un lugar de ese tipo, conquistás ese.
  if (estado.ubicacion.tipo === tipo) return { tipo, nombre: estado.ubicacion.nombre };

  const listas = { villa: VILLAS, provincia: PROVINCIAS, pais: PAISES };
  const usados = nombresUsados(estado, tipo);
  const libres = listas[tipo].filter((n) => !usados.has(n));
  return { tipo, nombre: rndElem(rng, libres.length ? libres : listas[tipo]) };
}

/**
 * Resuelve el intento de conquista. Si falla: penalizacion menor y se puede
 * reintentar el año siguiente (el umbral sigue cumplido).
 */
export function resolverConquista(estado, nivel, bonusMinijuego = 0, mods = {}) {
  const base = probConquista(estado);
  const p = clamp(base + bonusMinijuego + (mods.bonusTirada ?? 0), 0.05, 0.95);
  const roll = rnd(estado.rng);
  const gano = roll < p;

  if (gano) {
    const lugar = nombreParaTerritorio(estado, nivel, estado.rng);
    estado.territorios.push({
      nivel,
      tipo: lugar.tipo,
      nombre: lugar.nombre,
      edad: estado.edad,
    });
    // Recompensa de conquista, con el mismo freno de rendimiento decreciente
    // que el resto de las subidas.
    const subeFama = Math.round((3 + nivel) * factorRendimiento(estado.stats.fama));
    const subeCalle = Math.round((2 + nivel) * factorRendimiento(estado.stats.calle));
    estado.stats.fama = clampStat(estado.stats.fama + subeFama);
    estado.stats.calle = clampStat(estado.stats.calle + subeCalle);
    return {
      gano: true,
      nivel,
      lugar,
      prob: p,
      texto: `${lugar.nombre} es tuyo. ${NIVEL_TERRITORIO[nivel].descripcion}`,
    };
  }

  // Penalizacion menor: te dolio, no te mató.
  estado.stats.salud = clampStat(estado.stats.salud - rndInt(estado.rng, 5, 12));
  estado.stats.fama = clampStat(estado.stats.fama - rndInt(estado.rng, 2, 5));
  return {
    gano: false,
    nivel,
    prob: p,
    texto: 'No alcanzó. Te vas con la cara marcada, pero podés volver a intentarlo.',
  };
}

/**
 * Empujón hacia el próximo hito. Lo usan las bisagras enganchadas a Territorio:
 * el año que se siente distinto es justo el que te deja del otro lado.
 *
 * Estas subidas NO pasan por rendimiento decreciente a propósito: el freno
 * existe para que el contenido generoso no lleve los stats al techo solo, y
 * acá el jugador se la está jugando en un evento de riesgo alto por exactamente
 * esto. El critico_exito cierra el hueco entero; el desastre te tira para atrás.
 *
 * El empuje de guita va topeado: el umbral de nivel 3 pide $5.000.000 y regalarlos
 * convertiría la bisagra en un atajo en vez de un envión.
 */
const FACTOR_EMPUJE = {
  critico_exito: 1,
  exito: 0.7,
  exito_con_costo: 0.4,
  fracaso: 0,
  critico_fracaso: -0.3,
};
export const TOPE_EMPUJE_GUITA = 1_500_000;

export function empujarHito(estado, grado) {
  const nivel = estado.territorios.length + 1;
  const factor = FACTOR_EMPUJE[grado] ?? 0;
  if (nivel > 4 || !factor) return null;

  const umbral = UMBRALES_TERRITORIO[nivel];
  const hueco = umbral.falta?.(estado.stats, estado.guita);
  if (!hueco) return null;

  const deltas = {};
  for (const [stat, v] of Object.entries(hueco.stats)) {
    // Con factor negativo el hueco puede ser 0 (ya lo cumplía): ahí se le
    // saca un mordisco fijo para que perder también se sienta.
    const base = factor < 0 && v === 0 ? 8 : v;
    const d = Math.round(base * factor);
    if (d) deltas[stat] = d;
  }
  const aplicados = {};
  for (const [stat, d] of Object.entries(deltas)) {
    const antes = estado.stats[stat];
    estado.stats[stat] = clampStat(antes + d);
    const real = estado.stats[stat] - antes;
    if (real) aplicados[stat] = real;
  }

  let guita = 0;
  if (hueco.guita > 0 && factor > 0) {
    guita = Math.round(Math.min(hueco.guita * factor, TOPE_EMPUJE_GUITA));
    estado.guita += guita;
  }

  return { nivel, deltas: aplicados, guita };
}

/** Todos los destinos a los que se puede mudar (desde los 18). */
export function destinosDisponibles(estado) {
  const actual = estado.ubicacion.nombre;
  return [
    ...VILLAS.filter((n) => n !== actual).map((nombre) => ({ tipo: 'villa', nombre })),
    ...PROVINCIAS.filter((n) => n !== actual).map((nombre) => ({ tipo: 'provincia', nombre })),
    ...PAISES.filter((n) => n !== actual).map((nombre) => ({ tipo: 'pais', nombre })),
  ];
}

/**
 * Mudanza: baja Calle (nadie te conoce) mas 1-2 stats extra, y deja un cartel
 * narrativo con el motivo.
 */
export function mudarse(estado, destino) {
  const rng = estado.rng;
  const deltas = { calle: COSTO_MUDANZA.calle };

  const cuantos = rndInt(rng, 1, 2);
  const extra = barajar(rng, COSTO_MUDANZA.candidatosExtra).slice(0, cuantos);
  for (const stat of extra) {
    deltas[stat] = (deltas[stat] ?? 0) + rndInt(rng, COSTO_MUDANZA.rangoExtra[0], COSTO_MUDANZA.rangoExtra[1]);
  }
  for (const [k, v] of Object.entries(deltas)) estado.stats[k] = clampStat(estado.stats[k] + v);

  const volviendoAlPais = estado.enElExterior && destino.tipo !== 'pais';
  estado.ubicacion = { tipo: destino.tipo, nombre: destino.nombre, esOrigen: false };
  estado.mudanzas += 1;
  estado.enElExterior = destino.tipo === 'pais';
  if (volviendoAlPais) estado.volvioAlPais = true;
  estado.zonasVisitadas.push({ ...destino, edad: estado.edad, origen: false });

  const motivo = rndElem(rng, MOTIVOS_MUDANZA);
  return { destino, deltas, motivo };
}
