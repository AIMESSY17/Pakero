import { rndInt, rndPonderado, chance } from './rng.js';
import { TODOS_LOS_EVENTOS, POOL_CRISIS, POOL_ESPECIALES, especialesDe } from '../data/eventos/index.js';
import { ingresoAnual, notaAnio, comentarioNota } from './formulas.js';
import { resolverTirada, bonusDeMinijuego, probabilidadFinal } from './tirada.js';
import { calcularMods, consumirBuffs } from './mods.js';
import { resolverFinal } from './finales.js';
import {
  nivelDisponible,
  resolverConquista,
  minijuegoConquista,
  probConquista,
  progresoProximoHito,
  empujarHito,
} from './territorio.js';
import { NIVEL_TERRITORIO } from '../data/lugares.js';
import { ctxTexto, resolverTexto } from './texto.js';
import {
  registrarEstudio,
  bonusEstudio,
  estudioEsViable,
  definirCamino,
  costoReconversion,
  reconvertirse,
  puedeReconvertirse,
  acumularCalle,
  etiquetaCamino,
} from './camino.js';
import {
  crearHijo,
  moverHijo,
  derivaAnualHijo,
  vistaHijo,
  moverLealtad,
  castigarEgoismo,
  humorDelSocio,
  momentoPendiente,
  marcarMomento,
  vistaSocio,
} from './vinculos.js';
import { recordar, resurgir } from './memoria.js';
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
  EDAD_BIFURCACION,
  EDAD_HIJO_MIN,
  EDAD_HIJO_MAX,
  EDAD_SEGUNDA_CHANCE_MAX,
  BISAGRA_CADA,
  BISAGRA_EDAD_MIN,
  BISAGRA_UMBRAL_TERRITORIO,
  MAX_ESPECIALES_POR_ANIO,
} from './constants.js';

// ---------------------------------------------------------------------------
// Lookup de eventos por id (el estado guarda ids, no copias enteras)
// ---------------------------------------------------------------------------
const INDICE_EVENTOS = new Map();
for (const ev of [...TODOS_LOS_EVENTOS, ...POOL_CRISIS, ...POOL_ESPECIALES])
  INDICE_EVENTOS.set(ev.id, ev);
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

/**
 * Líneas con ícono para el panel de evento y el resumen del año.
 *
 * `extras.hijo` entra como línea propia porque el tracker del pibe es un
 * número que el jugador ve. La lealtad del socio NO: es un contador liviano y
 * oculto, así que se cuenta con palabras (ver `notaSocio`).
 */
export function lineasDeDeltas(deltas = {}, guita = 0, extras = {}) {
  const lineas = [];
  for (const [stat, v] of Object.entries(deltas)) {
    const meta = STAT_META[stat];
    if (!meta || !v) continue;
    // En Atención bajar es lo bueno, así que se invierte el color.
    const bueno = meta.invertido ? v < 0 : v > 0;
    lineas.push({ icono: meta.icono, label: meta.label, valor: v, bueno });
  }
  if (guita) lineas.push({ icono: '💵', label: 'Guita', valor: guita, bueno: guita > 0, esGuita: true });
  if (extras.hijo) {
    lineas.push({
      icono: '🧒',
      label: extras.hijoNombre ? `Cómo le va a ${extras.hijoNombre}` : 'Tu hijo',
      valor: extras.hijo,
      bueno: extras.hijo > 0,
    });
  }
  return lineas;
}

/** La lealtad no tiene barra: cuando se mueve, se dice con una frase. */
export function notaSocio(delta, nombre) {
  if (!delta || !nombre) return null;
  if (delta >= 10) return `${nombre} no se olvida de esta.`;
  if (delta > 0) return `A ${nombre} le gustó cómo lo manejaste.`;
  if (delta <= -10) return `${nombre} se lo va a acordar. Y no para bien.`;
  return `A ${nombre} no le cayó bien.`;
}

// ---------------------------------------------------------------------------
// Selección de eventos del año
// ---------------------------------------------------------------------------

/**
 * El pool del año. El filtro sigue siendo etapa + edad; lo único que agrega la
 * bifurcación de los 18 es que un evento puede pedir un `camino` (y una `sub`).
 * Los que no piden nada — la mayoría — siguen sirviendo para los dos lados.
 */
function poolDelAnio(estado) {
  const camino = estado.camino?.elegido ?? null;
  const sub = estado.camino?.subVariante ?? null;
  return TODOS_LOS_EVENTOS.filter(
    (ev) =>
      ev.etapa === estado.etapa &&
      estado.edad >= ev.edad_min &&
      estado.edad <= ev.edad_max &&
      (ev.camino == null || ev.camino === camino) &&
      (ev.sub == null || ev.sub === sub)
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

// ---------------------------------------------------------------------------
// Eventos especiales: los que el motor programa
// ---------------------------------------------------------------------------

const yaJugado = (estado, id) => estado.especialesJugados?.includes(id);

/** ¿Toca bisagra este año? A los 20, 25, 30, 35 y 40. */
export function esAnioBisagra(estado) {
  return estado.edad >= BISAGRA_EDAD_MIN && estado.edad % BISAGRA_CADA === 0;
}

/**
 * Si el hito de Territorio está a tiro, la bisagra del año pasa a ser la que
 * lo empuja. Es el punto donde las dos mecánicas se tocan: el año que se
 * siente distinto es justo el año en que te lo podés jugar todo.
 */
function bisagraDelAnio(estado) {
  const hito = progresoProximoHito(estado);
  const cerca = !hito.completo && !hito.listo && hito.progreso >= BISAGRA_UMBRAL_TERRITORIO;
  const familia = cerca ? 'bisagra_terr' : 'bisagra';
  const cands = especialesDe(familia).filter(
    (e) => !yaJugado(estado, e.id) && estado.edad >= e.edad_min && estado.edad <= e.edad_max
  );
  // Las de territorio se pueden repetir en distintos lustros; las de edad no.
  if (!cands.length && cerca) {
    return rndPonderado(estado.rng, especialesDe('bisagra_terr'));
  }
  return rndPonderado(estado.rng, cands);
}

/** Cuál de las dos variantes del momento del socio corresponde hoy. */
function varianteSocio(estado, momento) {
  if (momento === 'presentacion') return especialesDe('socio_presentacion')[0];
  const humor = humorDelSocio(estado);
  if (momento === 'prueba') {
    const variante = humor === 'quebrado' ? 'traicion' : 'leal';
    return especialesDe('socio_prueba').find((e) => e.variante === variante);
  }
  const variante = estado.socio?.estado === 'traiciono' ? 'traicion' : 'leal';
  return especialesDe('socio_cierre').find((e) => e.variante === variante);
}

/**
 * Arma la lista de especiales del año, en orden de prioridad y con techo.
 * La bifurcación es exclusiva: el año que te definís no pasa nada más.
 */
function especialesDelAnio(estado) {
  // Bifurcación de los 18. Se chequea por >= por si una partida vieja llegó
  // hasta acá sin camino: el juego no puede seguir sin ese bit definido.
  if (estado.edad >= EDAD_BIFURCACION && !estado.camino?.elegido) {
    const ev = especialesDe('bifurcacion')[0];
    if (ev) return [ev];
  }

  const salida = [];
  const sumar = (ev) => {
    if (ev && !salida.includes(ev) && salida.length < MAX_ESPECIALES_POR_ANIO) salida.push(ev);
  };

  // El hijo: entre los 28 y los 30, una sola vez, y no siempre el primer año.
  if (
    !estado.hijo &&
    estado.edad >= EDAD_HIJO_MIN &&
    estado.edad <= EDAD_HIJO_MAX &&
    (estado.edad === EDAD_HIJO_MAX || chance(estado.rng, 0.45))
  ) {
    sumar(especialesDe('hijo')[0]);
  }

  // El arco del socio.
  const momento = momentoPendiente(estado);
  if (momento) sumar(varianteSocio(estado, momento));

  // Segunda chance de estudiar. Se reparte por la ventana 25-30 en vez de caer
  // siempre el primer año, igual que el hijo: si no, "25 a 30" no es una
  // ventana, es una fecha.
  if (
    puedeReconvertirse(estado) &&
    !yaJugado(estado, 'esp_segunda_chance') &&
    (estado.edad === EDAD_SEGUNDA_CHANCE_MAX || chance(estado.rng, 0.4))
  ) {
    sumar(especialesDe('segunda_chance')[0]);
  }

  // Bisagra del lustro (puede venir enganchada al hito de Territorio).
  if (esAnioBisagra(estado)) sumar(bisagraDelAnio(estado));

  return salida;
}

/**
 * Arma el año: 3 automáticos (Calle / Fama / Maña-o-Atención) + 1 con decisión
 * + los especiales que toquen + crisis si viene mala racha.
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
  const idDecision = dec?.id ?? null;

  const especiales = especialesDelAnio(estado);
  for (const ev of especiales) {
    ids.push(ev.id);
    (estado.especialesJugados ??= []).push(ev.id);
  }

  let crisis = false;
  if (hayMalaRacha(estado)) {
    const ev = rndPonderado(estado.rng, POOL_CRISIS);
    if (ev) {
      ids.push(ev.id);
      crisis = true;
      estado.ultimaCrisisAnio = estado.anio;
    }
  }

  // Ecos: lo que dejaste anotado hace 3-5 años y vuelve ahora. No es un evento
  // ni se juega: es un bloque que se muestra al abrir el año y mueve la aguja.
  const ecos = resurgir(estado);
  const avisosEco = [];
  if (ecos) {
    for (const eco of ecos) {
      const deltas = eco.stats ? aplicarStats(estado, eco.stats) : {};
      const dHijo = eco.hijo ? moverHijo(estado, eco.hijo, eco.titulo) : 0;
      const dSocio = eco.socio ? moverLealtad(estado, eco.socio, eco.titulo) : 0;
      avisosEco.push({
        ...eco,
        deltas,
        lineas: lineasDeDeltas(deltas, 0, { hijo: dHijo, hijoNombre: estado.hijo?.nombre }),
        notaSocio: notaSocio(dSocio, estado.socio?.nombre),
      });
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
      hijo: 0,
      notaSocio: null,
    })),
    indice: 0,
    grados: [],
    log: [],
    huboMovida: false,
    huboVenta: false,
    crisis,
    idDecision,
    idsEspeciales: especiales.map((e) => e.id),
    ecos: avisosEco,
    statsInicio: { ...estado.stats },
    guitaInicio: estado.guita,
    ventasInicio: estado.ventas,
    movidasInicio: estado.movidas,
    hijoInicio: estado.hijo?.tracker ?? null,
  };

  asegurarAplicado(estado);
  chequearLimites(estado);
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

  const ctx = ctxTexto(estado);
  const deltas = aplicarStats(estado, def.stats);
  registrarEstudio(estado, def);
  runtime.resuelto = true;
  runtime.deltas = deltas;
  runtime.texto = resolverTexto(def.texto, ctx);
  registrarCategoria(estado, def.categoria);
  estado.anioActual.log.push({
    titulo: resolverTexto(def.titulo, ctx),
    texto: runtime.texto,
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
 * alto/extremo que pidan esfuerzo físico. La reconversión se bloquea aparte:
 * ahí lo que falta es la guita.
 */
export function opcionBloqueada(estado, opcion) {
  if (opcion.efecto?.reconversion && estado.guita < costoReconversion(estado)) return true;
  return (
    estado.stats.salud < UMBRAL_SALUD_BAJA &&
    opcion.esfuerzo_fisico &&
    RIESGOS_FISICOS_BLOQUEABLES.includes(opcion.riesgo)
  );
}

export function motivoBloqueo(estado, opcion) {
  if (!opcionBloqueada(estado, opcion)) return null;
  if (opcion.efecto?.reconversion) return 'No te alcanza la guita para soltar todo lo que tenés.';
  return 'No podés: tenés la salud muy baja para algo así.';
}

/** Info que la UI necesita para pintar cada opción antes de elegirla. */
export function inspeccionarOpcion(estado, def, opcion) {
  const mods = calcularMods(estado);
  // Lo que la cabeza que hiciste en el secundario le suma a esta opción.
  const extraEstudio = opcion.usaEstudio ? bonusEstudio(estado) : 0;
  return {
    bloqueada: opcionBloqueada(estado, opcion),
    motivoBloqueo: motivoBloqueo(estado, opcion),
    riesgo: RIESGO_META[opcion.riesgo],
    minijuego: opcion.minijuego,
    // El bonus de estudio sí se muestra: el contador es oculto toda la partida,
    // pero el día que se cobra tiene que verse que se cobró.
    bonusEstudio: extraEstudio ? Math.round(extraEstudio * 100) : 0,
    estudioViable: opcion.usaEstudio ? estudioEsViable(estado) : null,
    egoista: !!opcion.egoista,
    // Solo con Informante en la comisaría se ve la probabilidad real. Se usa la
    // misma función que la tirada para que nunca muestre un número mentiroso.
    // No incluye el bonus del minijuego: todavía no lo jugaste.
    probVisible: mods.avisoRiesgo
      ? Math.round(
          probabilidadFinal({
            probBase: opcion.prob_base,
            categoria: def.categoria,
            stats: estado.stats,
            bonusMinijuego: extraEstudio,
            mods,
          }) * 100
        )
      : null,
  };
}

/**
 * Efectos que se aplican salga como salga la tirada. Es lo que permite que la
 * bifurcación defina el camino sin que el azar elija por vos.
 */
function aplicarEfecto(estado, efecto, grado) {
  if (!efecto) return;

  if (efecto.camino) definirCamino(estado, efecto.camino);
  if (efecto.reconversion) reconvertirse(estado);
  if (efecto.hijo && !estado.hijo) estado.hijo = crearHijo(estado);

  if (efecto.socio && estado.socio) {
    const s = estado.socio;
    if (efecto.socio === 'presentacion') marcarMomento(estado, 'presentacion');
    else if (efecto.socio === 'firme' || efecto.socio === 'traiciono') {
      marcarMomento(estado, 'prueba');
      s.estado = efecto.socio;
    } else {
      marcarMomento(estado, 'cierre');
      s.estado = efecto.socio;
    }
  }

  if (efecto.empujeTerritorio) empujarHito(estado, grado);
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

  const ctx = ctxTexto(estado);
  const mods = calcularMods(estado);
  const bonusMj = scoreMinijuego == null ? 0 : bonusDeMinijuego(scoreMinijuego);
  const bonusEst = opcion.usaEstudio ? bonusEstudio(estado) : 0;

  const { grado, prob } = resolverTirada(estado.rng, {
    probBase: opcion.prob_base,
    categoria: def.categoria,
    stats: estado.stats,
    bonusMinijuego: bonusMj + bonusEst,
    mods,
  });

  const res = opcion.resultados[grado];

  // El efecto va PRIMERO: si este evento crea el hijo o define el camino, lo
  // que venga después (deltas al tracker, textos) tiene que verlo ya creado.
  aplicarEfecto(estado, opcion.efecto, grado);

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

  registrarEstudio(estado, res);

  // Vínculos: el hijo tiene número, el socio tiene frase.
  const dHijo = res.hijo ? moverHijo(estado, res.hijo, resolverTexto(def.titulo, ctx)) : 0;
  let dSocio = res.socio ? moverLealtad(estado, res.socio, resolverTexto(def.titulo, ctx)) : 0;
  if (opcion.egoista) dSocio += castigarEgoismo(estado);

  // Memoria de mediano plazo: esto vuelve dentro de 3 a 5 años.
  for (const flag of res.flags ?? []) recordar(estado, flag, resolverTexto(def.titulo, ctx));

  // Para el final "El Traidor": movida que se cayó.
  if (def.categoria === 'movida') {
    estado.ultimaMovidaFallida = grado === 'fracaso' || grado === 'critico_fracaso';
  }

  registrarCategoria(estado, def.categoria);
  consumirBuffs(estado);

  const nota = notaSocio(dSocio, estado.socio?.nombre);
  runtime.resuelto = true;
  runtime.grado = grado;
  runtime.opcionIdx = opcionIdx;
  runtime.texto = resolverTexto(res.texto, ctx);
  runtime.deltas = deltas;
  runtime.guita = guita;
  runtime.prob = prob;
  runtime.minijuego = opcion.minijuego;
  runtime.bonusMinijuego = bonusMj;
  runtime.bonusEstudio = bonusEst;
  runtime.hijo = dHijo;
  runtime.notaSocio = nota;

  estado.anioActual.grados.push(grado);
  estado.anioActual.log.push({
    titulo: resolverTexto(def.titulo, ctx),
    texto: runtime.texto,
    grado,
    especial: def.especial ?? null,
    opcion: resolverTexto(opcion.texto, ctx),
    notaSocio: nota,
    lineas: lineasDeDeltas(deltas, guita, { hijo: dHijo, hijoNombre: estado.hijo?.nombre }),
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
  if (!p.resultado.gano) recordar(estado, 'conquista_fallida', p.meta?.label);
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
// Cierre del año: ingreso, nota, rival, vínculos
// ---------------------------------------------------------------------------

/** El evento con decisión del año, listo para que el resumen lo ponga arriba. */
function decisionDelAnio(estado) {
  const a = estado.anioActual;
  const runtimes = a.eventos.filter((e) => {
    const def = eventoPorId(e.id);
    return def?.tipo === 'decision' && e.resuelto;
  });
  if (!runtimes.length) return null;
  // Si hubo especial, el especial es el que manda: es el evento del año.
  const elegido =
    runtimes.find((e) => a.idsEspeciales?.includes(e.id)) ??
    runtimes.find((e) => e.id === a.idDecision) ??
    runtimes[0];
  const def = eventoPorId(elegido.id);
  const ctx = ctxTexto(estado);
  return {
    id: elegido.id,
    especial: def.especial ?? null,
    esCrisis: !!def.esCrisis,
    titulo: resolverTexto(def.titulo, ctx),
    opcion: resolverTexto(def.opciones[elegido.opcionIdx]?.texto, ctx),
    grado: elegido.grado,
    texto: elegido.texto,
    lineas: lineasDeDeltas(elegido.deltas, elegido.guita, {
      hijo: elegido.hijo,
      hijoNombre: estado.hijo?.nombre,
    }),
    notaSocio: elegido.notaSocio,
    categoria: def.categoria,
  };
}

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

  const movidasAnio = estado.movidas - a.movidasInicio;
  acumularCalle(estado, movidasAnio);
  const derivaHijo = derivaAnualHijo(estado, nota);

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
    hijo: estado.hijo?.tracker ?? null,
  });

  const hijo = vistaHijo(estado);

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
    movidasAnio,
    ventas: estado.ventas,
    movidas: estado.movidas,
    rival: { ...estado.rival, ventasAnio: ventasRival },
    crisis: a.crisis,
    huboMovida: a.huboMovida,
    huboVenta: a.huboVenta,
    // Lo nuevo del resumen: la decisión arriba de todo, y al lado de la
    // comparación con el Rival, cómo quedaron el hijo y el socio.
    decision: decisionDelAnio(estado),
    hijo: hijo && {
      ...hijo,
      deltaAnio: a.hijoInicio == null ? null : hijo.tracker - a.hijoInicio,
      derivaAnio: derivaHijo,
    },
    socio: vistaSocio(estado),
    camino: etiquetaCamino(estado),
    ecos: a.ecos ?? [],
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
