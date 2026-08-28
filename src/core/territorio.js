import { rnd, rndElem, rndInt, barajar, rndPonderado } from './rng.js';
import { ARQUETIPOS_DUENIO } from '../data/duenios.js';
import { NOMBRES_VILLEROS, APODOS } from '../data/nombres.js';
import { flavorDe } from '../data/flavor.js';
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
  ACERCAMIENTO_PUNTOS_MIN,
  ACERCAMIENTO_PUNTOS_MAX,
  MANTENIMIENTO_CADA_MIN,
  MANTENIMIENTO_CADA_MAX,
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
      anio: estado.anio,
      // Cuando toca volver a bancarlo. Se sortea por territorio para que no
      // venzan todos el mismo año.
      proximoMantenimiento:
        estado.anio + rndInt(estado.rng, MANTENIMIENTO_CADA_MIN, MANTENIMIENTO_CADA_MAX),
      duenio: null, // lo llena el evento del dueño anterior
    });
    // Recompensa de conquista, con el mismo freno de rendimiento decreciente
    // que el resto de las subidas.
    const subeFama = Math.round((3 + nivel) * factorRendimiento(estado.stats.fama));
    const subeCalle = Math.round((2 + nivel) * factorRendimiento(estado.stats.calle));
    estado.stats.fama = clampStat(estado.stats.fama + subeFama);
    estado.stats.calle = clampStat(estado.stats.calle + subeCalle);
    // El Picantillo es la corona, no un lugar con gente adentro: no tiene
    // dueño anterior al que haya que mirar a la cara.
    const duenio = nivel === 4 ? null : crearDuenio(estado, lugar, nivel);
    const flavor = flavorDe(lugar.nombre, estado.rng, rndElem);

    return {
      gano: true,
      nivel,
      lugar,
      prob: p,
      duenio,
      flavor,
      // "es tuyo" no sirve: los lugares tienen genero (La Matanza, La Cava,
      // Ciudad Oculta son femeninos) y el motor no lo sabe. "Ahora mandas en"
      // funciona para todos.
      texto:
        `Ahora mandás en ${lugar.nombre}. ${NIVEL_TERRITORIO[nivel].descripcion}` +
        (flavor ? ` ${flavor}` : ''),
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

// ---------------------------------------------------------------------------
// El dueño anterior
// ---------------------------------------------------------------------------

/**
 * Genera al tipo que manejaba esto antes que vos. Se llama al conquistar y el
 * evento del dueño (ver data/eventos/territorio.js) decide qué se hace con él.
 */
export function crearDuenio(estado, lugar, nivel) {
  const arq = rndPonderado(estado.rng, ARQUETIPOS_DUENIO);
  return {
    nombre: rndElem(estado.rng, NOMBRES_VILLEROS),
    apodo: rndElem(estado.rng, APODOS),
    arquetipo: arq.id,
    arquetipoLabel: arq.label,
    presentacion: arq.presentacion,
    territorio: lugar.nombre,
    nivel,
    edad: estado.edad,
    // 'libre' | 'humillado' | 'aliado'. Null hasta que el jugador decide.
    destino: null,
  };
}

export const nombreDuenio = (d) => (d ? `${d.nombre} "${d.apodo}"` : '');

/** Anota qué se hizo con el dueño y lo pega al territorio correspondiente. */
export function resolverDuenio(estado, duenio, destino) {
  const marcado = { ...duenio, destino };
  (estado.duenios ??= []).push(marcado);
  const terr = estado.territorios.find((t) => t.nombre === duenio.territorio);
  if (terr) terr.duenio = marcado;
  return marcado;
}

/**
 * Lo que el dueño anterior le suma o le resta a la chance de bancar ESE
 * territorio, para siempre. Es la consecuencia mecánica de las tres opciones:
 * un tipo al que humillaste tiene tiempo libre y bronca, y uno al que sumaste
 * conoce cada pasillo.
 */
export const BONUS_MANTENIMIENTO_DUENIO = { aliado: 0.15, libre: 0, humillado: -0.15 };

export function bonusMantenimiento(territorio) {
  return BONUS_MANTENIMIENTO_DUENIO[territorio?.duenio?.destino] ?? 0;
}

// ---------------------------------------------------------------------------
// Acercamiento: cuando te falta poco
// ---------------------------------------------------------------------------

/**
 * Cuántos puntos de stat te faltan para el próximo umbral. Devuelve null si ya
 * están los cuatro territorios o si el umbral ya está cumplido.
 *
 * Solo cuenta stats: la guita del nivel 3 se mira aparte, porque juntar plata
 * no es lo mismo que estar a un paso — y "a 1-9 puntos" habla de puntos.
 */
export function puntosParaHito(estado) {
  const nivel = estado.territorios.length + 1;
  if (nivel > 4) return null;
  const umbral = UMBRALES_TERRITORIO[nivel];
  if (umbral.cumple(estado.stats, estado.guita)) return null;
  const hueco = umbral.falta?.(estado.stats, estado.guita);
  if (!hueco) return null;
  const puntos = Object.values(hueco.stats).reduce((a, b) => a + b, 0);
  return { nivel, puntos, guitaFaltante: hueco.guita ?? 0 };
}

/** ¿Está en la ventana de "le falta poco" (1 a 9 puntos)? */
export function estaCerca(estado) {
  const p = puntosParaHito(estado);
  return (
    !!p && p.puntos >= ACERCAMIENTO_PUNTOS_MIN && p.puntos <= ACERCAMIENTO_PUNTOS_MAX
  );
}

// ---------------------------------------------------------------------------
// Mantenimiento: bancar lo que ya es tuyo
// ---------------------------------------------------------------------------

/**
 * El territorio al que le toca mantenimiento este año, o null.
 *
 * Conquistar dejó de ser un logro que se cobra solo para siempre: cada 2 o 3
 * años hay que volver a bancar cada lugar, y se puede perder.
 */
export function territorioAMantener(estado) {
  const vencidos = estado.territorios.filter(
    (t) => t.nivel !== 4 && (t.proximoMantenimiento ?? 0) <= estado.anio
  );
  if (!vencidos.length) return null;
  // El más atrasado primero: si se acumularon dos, se atiende el que viene
  // esperando hace más.
  vencidos.sort((a, b) => (a.proximoMantenimiento ?? 0) - (b.proximoMantenimiento ?? 0));
  return vencidos[0];
}

/** Reprograma el próximo mantenimiento de ese territorio. */
export function reprogramarMantenimiento(estado, territorio) {
  if (!territorio) return;
  territorio.proximoMantenimiento =
    estado.anio + rndInt(estado.rng, MANTENIMIENTO_CADA_MIN, MANTENIMIENTO_CADA_MAX);
}

/**
 * Se te cayó un territorio. Devuelve el que se perdió, o null.
 *
 * Ojo con el orden: los territorios se conquistan por nivel y `nivelDisponible`
 * usa `territorios.length`, así que perder el del medio dejaría un agujero.
 * Por eso siempre se cae el de nivel MÁS ALTO: lo último que ganaste es lo
 * primero que se va, y la escalera queda entera.
 */
export function perderTerritorio(estado, nombre = null) {
  if (!estado.territorios.length) return null;
  let idx;
  if (nombre) {
    idx = estado.territorios.findIndex((t) => t.nombre === nombre);
    if (idx === -1) return null;
    // Aunque venga pedido por nombre, se cae el de nivel más alto para no
    // romper la escalera de niveles.
    const nivelMax = Math.max(...estado.territorios.map((t) => t.nivel));
    if (estado.territorios[idx].nivel !== nivelMax) {
      idx = estado.territorios.findIndex((t) => t.nivel === nivelMax);
    }
  } else {
    const nivelMax = Math.max(...estado.territorios.map((t) => t.nivel));
    idx = estado.territorios.findIndex((t) => t.nivel === nivelMax);
  }
  const [perdido] = estado.territorios.splice(idx, 1);
  (estado.territoriosPerdidos ??= []).push({ ...perdido, perdidoALos: estado.edad });
  return perdido;
}

// ---------------------------------------------------------------------------
// Tensión entre territorios
// ---------------------------------------------------------------------------

/** Dos territorios al azar para el evento de roce. Null si no hay al menos dos. */
export function parDeTerritorios(estado) {
  if (estado.territorios.length < 2) return null;
  const mezclado = barajar(estado.rng, estado.territorios);
  return { a: mezclado[0], b: mezclado[1] };
}

/** Una línea de color del lugar, para los eventos que lo nombran. */
export function flavorDeLugar(estado, nombre) {
  return flavorDe(nombre, estado.rng, rndElem);
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
