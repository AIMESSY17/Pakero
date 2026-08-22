import { rnd, rndInt, rndPonderado, chance } from './rng.js';
import { TODOS_LOS_EVENTOS, POOL_CRISIS } from '../data/eventos/index.js';
import { ingresoAnual, notaAnio, comentarioNota } from './formulas.js';
import { resolverTirada, bonusDeMinijuego, probabilidadFinal } from './tirada.js';
import { calcularMods, consumirBuffs } from './mods.js';
import { resolverFinal } from './finales.js';
import { nivelDisponible, resolverConquista, minijuegoConquista, probConquista } from './territorio.js';
import { NIVEL_TERRITORIO } from '../data/lugares.js';
import {
  SLOTS_AUTOMATICOS,
  ATENCION_PRESO_AUTOMATICO,
  ATENCION_ZONA_ROJA,
  PROB_PRESO_ZONA_ROJA,
  RIESGO_META,
  RIESGOS_FISICOS_BLOQUEABLES,
  UMBRAL_SALUD_BAJA,
  EDAD_MAXIMA,
  ANIOS_MALA_RACHA,
  STATS_CRECIMIENTO,
  EDAD_FIN_CRECIMIENTO,
  CRECIMIENTO_MIN,
  CRECIMIENTO_MAX,
  DECAIMIENTO,
  STATS_RENDIMIENTO_DECRECIENTE,
  factorRendimiento,
  etapaPorEdad,
  clampStat,
  STAT_META,
} from './constants.js';

// ---------------------------------------------------------------------------
// Lookup de eventos por id (el estado guarda ids, no copias enteras)
// ---------------------------------------------------------------------------
const INDICE_EVENTOS = new Map();
for (const ev of [...TODOS_LOS_EVENTOS, ...POOL_CRISIS]) INDICE_EVENTOS.set(ev.id, ev);
export const eventoPorId = (id) => INDICE_EVENTOS.get(id);

// ---------------------------------------------------------------------------
// Helpers de stats
// ---------------------------------------------------------------------------

/**
 * Aplica deltas con clamp 0..100 y devuelve lo que realmente cambió.
 *
 * Las subidas de Calle/Fama/Maña pasan por rendimiento decreciente: llegar de
 * 10 a 20 es fácil, de 90 a 95 cuesta muchísimo. Las bajadas pegan completas.
 */
export function aplicarStats(estado, deltas = {}) {
  const reales = {};
  for (const [stat, delta] of Object.entries(deltas)) {
    if (!(stat in estado.stats) || !delta) continue;
    const antes = estado.stats[stat];

    let efectivo = delta;
    if (delta > 0 && STATS_RENDIMIENTO_DECRECIENTE.includes(stat)) {
      efectivo = Math.round(delta * factorRendimiento(antes));
    }

    estado.stats[stat] = clampStat(antes + efectivo);
    const real = estado.stats[stat] - antes;
    if (real !== 0) reales[stat] = real;
  }
  return reales;
}

/** Líneas con ícono para el panel de evento y el resumen del año. */
export function lineasDeDeltas(deltas = {}, guita = 0) {
  const lineas = [];
  for (const [stat, v] of Object.entries(deltas)) {
    const meta = STAT_META[stat];
    if (!meta || !v) continue;
    // En Atención bajar es lo bueno, así que se invierte el color.
    const bueno = meta.invertido ? v < 0 : v > 0;
    lineas.push({ icono: meta.icono, label: meta.label, valor: v, bueno });
  }
  if (guita) lineas.push({ icono: '💵', label: 'Guita', valor: guita, bueno: guita > 0, esGuita: true });
  return lineas;
}

// ---------------------------------------------------------------------------
// Selección de eventos del año
// ---------------------------------------------------------------------------

function poolDelAnio(estado) {
  return TODOS_LOS_EVENTOS.filter(
    (ev) => ev.etapa === estado.etapa && estado.edad >= ev.edad_min && estado.edad <= ev.edad_max
  );
}

/** Prefiere eventos no vistos; si ya se vieron todos, recicla el pool entero. */
function elegirSinRepetir(estado, candidatos) {
  if (candidatos.length === 0) return null;
  const vistos = new Set(estado.eventosVistos);
  const frescos = candidatos.filter((e) => !vistos.has(e.id));
  const elegido = rndPonderado(estado.rng, frescos.length ? frescos : candidatos);
  if (elegido) {
    if (!frescos.length) {
      // Se agotó el pool de esa categoría: se limpia para volver a empezar.
      estado.eventosVistos = estado.eventosVistos.filter(
        (id) => !candidatos.some((c) => c.id === id)
      );
    }
    estado.eventosVistos.push(elegido.id);
  }
  return elegido;
}

/** Ingreso que bajó o se estancó 3 años seguidos = mala racha. */
export function hayMalaRacha(estado) {
  const h = estado.ingresos;
  if (h.length < ANIOS_MALA_RACHA + 1) return false;
  if (estado.anio - estado.ultimaCrisisAnio < ANIOS_MALA_RACHA) return false;
  const ultimos = h.slice(-(ANIOS_MALA_RACHA + 1));
  for (let i = 1; i < ultimos.length; i++) {
    if (ultimos[i] > ultimos[i - 1]) return false;
  }
  return true;
}

/**
 * Arma el año: 3 automáticos (Calle / Fama / Maña-o-Atención) + 1 con decisión.
 * Si viene mala racha, se suma un evento de crisis al final.
 */
export function construirAnio(estado) {
  const pool = poolDelAnio(estado);
  const ids = [];

  for (const slot of SLOTS_AUTOMATICOS) {
    const cands = pool.filter((e) => e.tipo === 'automatico' && e.slot === slot);
    const ev = elegirSinRepetir(estado, cands);
    if (ev) ids.push(ev.id);
  }

  const dec = elegirSinRepetir(
    estado,
    pool.filter((e) => e.tipo === 'decision')
  );
  if (dec) ids.push(dec.id);

  let crisis = false;
  if (hayMalaRacha(estado)) {
    const ev = rndPonderado(estado.rng, POOL_CRISIS);
    if (ev) {
      ids.push(ev.id);
      crisis = true;
      estado.ultimaCrisisAnio = estado.anio;
    }
  }

  estado.anioActual = {
    eventos: ids.map((id) => ({
      id,
      resuelto: false,
      grado: null,
      opcionIdx: null,
      texto: null,
      deltas: null,
      guita: 0,
      prob: null,
      minijuego: null,
      bonusMinijuego: 0,
    })),
    indice: 0,
    grados: [],
    log: [],
    huboMovida: false,
    huboVenta: false,
    crisis,
    statsInicio: { ...estado.stats },
    guitaInicio: estado.guita,
    ventasInicio: estado.ventas,
    movidasInicio: estado.movidas,
  };

  asegurarAplicado(estado);
  return estado;
}

export function eventoActual(estado) {
  const a = estado.anioActual;
  if (!a || a.indice >= a.eventos.length) return null;
  const runtime = a.eventos[a.indice];
  return { def: eventoPorId(runtime.id), runtime };
}

/** Los automáticos no piden nada al jugador: se resuelven solos al aparecer. */
function asegurarAplicado(estado) {
  const actual = eventoActual(estado);
  if (!actual || actual.runtime.resuelto) return;
  const { def, runtime } = actual;
  if (def.tipo !== 'automatico') return;

  const deltas = aplicarStats(estado, def.stats);
  runtime.resuelto = true;
  runtime.deltas = deltas;
  runtime.texto = def.texto;
  registrarCategoria(estado, def.categoria);
  estado.anioActual.log.push({
    titulo: def.titulo,
    texto: def.texto,
    lineas: lineasDeDeltas(deltas),
  });
}

function registrarCategoria(estado, categoria) {
  if (categoria === 'movida') estado.anioActual.huboMovida = true;
  if (categoria === 'venta') estado.anioActual.huboVenta = true;
}

// ---------------------------------------------------------------------------
// Opciones con decisión
// ---------------------------------------------------------------------------

/**
 * Con Salud por debajo del umbral se bloquean las opciones de riesgo
 * alto/extremo que pidan esfuerzo físico.
 */
export function opcionBloqueada(estado, opcion) {
  return (
    estado.stats.salud < UMBRAL_SALUD_BAJA &&
    opcion.esfuerzo_fisico &&
    RIESGOS_FISICOS_BLOQUEABLES.includes(opcion.riesgo)
  );
}

/** Info que la UI necesita para pintar cada opción antes de elegirla. */
export function inspeccionarOpcion(estado, def, opcion) {
  const mods = calcularMods(estado);
  return {
    bloqueada: opcionBloqueada(estado, opcion),
    riesgo: RIESGO_META[opcion.riesgo],
    minijuego: opcion.minijuego,
    // Solo con Informante en la comisaría se ve la probabilidad real. Se usa la
    // misma función que la tirada para que nunca muestre un número mentiroso.
    // No incluye el bonus del minijuego: todavía no lo jugaste.
    probVisible: mods.avisoRiesgo
      ? Math.round(
          probabilidadFinal({
            probBase: opcion.prob_base,
            categoria: def.categoria,
            stats: estado.stats,
            mods,
          }) * 100
        )
      : null,
  };
}

/**
 * Resuelve la opción elegida. `bonusMinijuego` sale de jugar el minijuego y
 * SUMA a la tirada; nunca la reemplaza.
 */
export function elegirOpcion(estado, opcionIdx, scoreMinijuego = null) {
  const actual = eventoActual(estado);
  if (!actual || actual.runtime.resuelto) return estado;
  const { def, runtime } = actual;
  const opcion = def.opciones[opcionIdx];
  if (!opcion || opcionBloqueada(estado, opcion)) return estado;

  const mods = calcularMods(estado);
  const bonus = scoreMinijuego == null ? 0 : bonusDeMinijuego(scoreMinijuego);

  const { grado, prob } = resolverTirada(estado.rng, {
    probBase: opcion.prob_base,
    categoria: def.categoria,
    stats: estado.stats,
    bonusMinijuego: bonus,
    mods,
  });

  const res = opcion.resultados[grado];
  const deltas = aplicarStats(estado, res.stats);

  // Atención extra por el nivel de riesgo, aparte de lo que diga el resultado.
  const atencionRiesgo = Math.round(
    (RIESGO_META[opcion.riesgo]?.atencion ?? 0) * (1 - (mods.reduceAtencionRiesgo ?? 0))
  );
  if (atencionRiesgo) {
    const d = aplicarStats(estado, { atencion: atencionRiesgo });
    if (d.atencion) deltas.atencion = (deltas.atencion ?? 0) + d.atencion;
  }

  const guita = res.guita ?? 0;
  estado.guita = Math.max(0, estado.guita + guita);
  estado.ventas += res.ventas ?? 0;
  estado.movidas += res.movidas ?? 0;

  // Para el final "El Traidor": movida que se cayó.
  if (def.categoria === 'movida') {
    estado.ultimaMovidaFallida = grado === 'fracaso' || grado === 'critico_fracaso';
  }

  registrarCategoria(estado, def.categoria);
  consumirBuffs(estado);

  runtime.resuelto = true;
  runtime.grado = grado;
  runtime.opcionIdx = opcionIdx;
  runtime.texto = res.texto;
  runtime.deltas = deltas;
  runtime.guita = guita;
  runtime.prob = prob;
  runtime.minijuego = opcion.minijuego;
  runtime.bonusMinijuego = bonus;

  estado.anioActual.grados.push(grado);
  estado.anioActual.log.push({
    titulo: def.titulo,
    texto: res.texto,
    grado,
    lineas: lineasDeDeltas(deltas, guita),
  });

  // Zona roja de Atención: 50% de caer preso en cualquier evento de riesgo.
  if (
    opcion.riesgo !== 'nulo' &&
    estado.stats.atencion >= ATENCION_ZONA_ROJA &&
    estado.stats.atencion < ATENCION_PRESO_AUTOMATICO &&
    chance(estado.rng, PROB_PRESO_ZONA_ROJA)
  ) {
    caerPreso(estado);
  }

  chequearLimites(estado);
  return estado;
}

// ---------------------------------------------------------------------------
// Límites duros: muerte y cana
// ---------------------------------------------------------------------------

function caerPreso(estado) {
  const mods = calcularMods(estado);
  if (mods.escudoPreso > 0) {
    estado.mercado.escudosGastados = (estado.mercado.escudosGastados ?? 0) + 1;
    estado.stats.atencion = clampStat(55);
    estado.anioActual?.log.push({
      titulo: 'Te salvó el abogado',
      texto: 'Estabas adentro por doce horas y salió todo por un error de procedimiento. No pasa dos veces.',
      lineas: lineasDeDeltas({ atencion: -20 }),
    });
    return false;
  }
  terminar(estado, 'preso');
  return true;
}

/** Salud 0 = muerte. Atención 100 = preso automático. */
export function chequearLimites(estado) {
  if (estado.final) return true;
  if (estado.stats.salud <= 0) {
    terminar(estado, 'muerte');
    return true;
  }
  if (estado.stats.atencion >= ATENCION_PRESO_AUTOMATICO) {
    return caerPreso(estado);
  }
  return false;
}

export function terminar(estado, causa) {
  estado.final = resolverFinal(estado, causa);
  estado.fase = 'fin';
  return estado;
}

// ---------------------------------------------------------------------------
// Avance dentro del año
// ---------------------------------------------------------------------------

export function continuar(estado) {
  if (estado.final) return estado;
  const a = estado.anioActual;
  if (!a) return estado;

  a.indice += 1;
  if (a.indice < a.eventos.length) {
    asegurarAplicado(estado);
    return estado;
  }

  // Se terminaron los eventos: ¿hay territorio para conquistar?
  const nivel = nivelDisponible(estado);
  if (nivel) {
    estado.pendienteConquista = {
      nivel,
      minijuego: minijuegoConquista(estado.rng, nivel),
      prob: probConquista(estado),
      forastero: !estado.ubicacion.esOrigen,
      meta: NIVEL_TERRITORIO[nivel],
      resultado: null,
    };
    estado.fase = 'conquista';
    return estado;
  }

  return cerrarAnio(estado);
}

export function jugarConquista(estado, scoreMinijuego = null) {
  const p = estado.pendienteConquista;
  if (!p || p.resultado) return estado;
  const bonus = scoreMinijuego == null ? 0 : bonusDeMinijuego(scoreMinijuego);
  p.resultado = resolverConquista(estado, p.nivel, bonus, calcularMods(estado));
  estado.anioActual?.log.push({
    titulo: p.resultado.gano ? `Conquistaste ${p.resultado.lugar.nombre}` : 'Conquista fallida',
    texto: p.resultado.texto,
    grado: p.resultado.gano ? 'critico_exito' : 'fracaso',
    lineas: [],
  });
  chequearLimites(estado);
  return estado;
}

export function saltarConquista(estado) {
  estado.pendienteConquista = null;
  if (estado.final) return estado;
  return cerrarAnio(estado);
}

export function cerrarConquista(estado) {
  const p = estado.pendienteConquista;
  const gano = p?.resultado?.gano;
  const nivel = p?.nivel;
  estado.pendienteConquista = null;
  if (estado.final) return estado;
  // El Picantillo de Oro cierra la partida al toque: no hay nada más arriba.
  if (gano && nivel === 4) return terminar(estado, 'picantillo');
  return cerrarAnio(estado);
}

// ---------------------------------------------------------------------------
// Cierre del año: ingreso, nota, rival
// ---------------------------------------------------------------------------

export function cerrarAnio(estado) {
  const a = estado.anioActual;
  const mods = calcularMods(estado);

  const ingreso = ingresoAnual(
    estado.stats,
    estado.movidas,
    estado.ventas,
    estado.territorios.length,
    estado.edad,
    estado.etapa,
    mods
  );
  estado.guita += ingreso;

  const nota = notaAnio(a.grados, {
    huboMovida: a.huboMovida,
    huboVenta: a.huboVenta,
    atencion: estado.stats.atencion,
  });

  // El Rival trackea Ventas en paralelo: si te le escapás, aprieta y te
  // alcanza; si te quedás, se adelanta despacio. El duelo se define al final.
  const diferencia = estado.ventas - estado.rival.ventas;
  let ventasRival;
  if (diferencia > 2) ventasRival = rndInt(estado.rng, 0, 2); // le sacaste ventaja: aprieta
  else if (diferencia >= 0) ventasRival = chance(estado.rng, 0.45) ? 1 : 0; // van parejos
  else ventasRival = chance(estado.rng, 0.25) ? 1 : 0; // va ganando: afloja
  estado.rival.ventas += ventasRival;

  const ingresoPrevio = estado.ingresos[estado.ingresos.length - 1] ?? null;
  estado.ingresos.push(ingreso);

  const deltasAnio = {};
  for (const k of Object.keys(estado.stats)) {
    const d = estado.stats[k] - a.statsInicio[k];
    if (d) deltasAnio[k] = d;
  }

  estado.historial.push({
    anio: estado.anio,
    edad: estado.edad,
    etapa: estado.etapa,
    stats: { ...estado.stats },
    guita: estado.guita,
    ingreso,
    nota,
    ventas: estado.ventas,
    movidas: estado.movidas,
    rivalVentas: estado.rival.ventas,
    territorios: estado.territorios.length,
    ubicacion: estado.ubicacion.nombre,
  });

  estado.resumen = {
    anio: estado.anio,
    edad: estado.edad,
    etapa: estado.etapa,
    nota,
    comentario: comentarioNota(nota),
    ingreso,
    ingresoPrevio,
    tendenciaIngreso:
      ingresoPrevio == null ? 0 : ingreso > ingresoPrevio ? 1 : ingreso < ingresoPrevio ? -1 : 0,
    guita: estado.guita,
    log: a.log,
    deltas: deltasAnio,
    lineasDeltas: lineasDeDeltas(deltasAnio),
    ventasAnio: estado.ventas - a.ventasInicio,
    movidasAnio: estado.movidas - a.movidasInicio,
    ventas: estado.ventas,
    movidas: estado.movidas,
    rival: { ...estado.rival, ventasAnio: ventasRival },
    crisis: a.crisis,
    huboMovida: a.huboMovida,
    huboVenta: a.huboVenta,
  };

  estado.fase = 'resumen';
  return estado;
}

// ---------------------------------------------------------------------------
// Paso de año
// ---------------------------------------------------------------------------

export function siguienteAnio(estado) {
  if (estado.final) return estado;
  const mods = calcularMods(estado);
  const avisos = [];

  // Staff con efecto anual (médico, abogado, guardaespaldas...).
  const staffDeltas = {};
  if (mods.saludPorAnio) staffDeltas.salud = mods.saludPorAnio;
  if (mods.atencionPorAnio) staffDeltas.atencion = mods.atencionPorAnio;
  if (Object.keys(staffDeltas).length) {
    const d = aplicarStats(estado, staffDeltas);
    if (Object.keys(d).length) avisos.push({ titulo: 'Tu gente laburando', lineas: lineasDeDeltas(d) });
  }

  // Crecimiento pasivo: hasta los 29 sube uno solo de los tres (+1/+2),
  // de los 30 en adelante bajan los tres.
  const pasivo = {};
  if (estado.edad <= EDAD_FIN_CRECIMIENTO) {
    const stat = STATS_CRECIMIENTO[rndInt(estado.rng, 0, STATS_CRECIMIENTO.length - 1)];
    pasivo[stat] = rndInt(estado.rng, CRECIMIENTO_MIN, CRECIMIENTO_MAX);
  } else {
    for (const stat of STATS_CRECIMIENTO) pasivo[stat] = DECAIMIENTO;
  }
  const dPasivo = aplicarStats(estado, pasivo);
  if (Object.keys(dPasivo).length) {
    avisos.push({
      titulo: estado.edad <= EDAD_FIN_CRECIMIENTO ? 'Un año más de calle' : 'Los años pesan',
      lineas: lineasDeDeltas(dPasivo),
    });
  }

  if (chequearLimites(estado)) return estado;

  estado.edad += 1;
  estado.anio += 1;
  estado.etapa = etapaPorEdad(estado.edad);

  if (estado.edad > EDAD_MAXIMA) {
    estado.edad = EDAD_MAXIMA;
    return terminar(estado, 'edad');
  }

  estado.avisosDeAnio = avisos;
  estado.resumen = null;
  estado.fase = 'evento';
  return construirAnio(estado);
}

/** Retiro voluntario. Disponible a partir de los 18. */
export function retirarse(estado) {
  estado.seRetiro = true;
  return terminar(estado, 'retiro');
}

export function puedeRetirarse(estado) {
  return estado.edad >= 18 && !estado.final;
}
