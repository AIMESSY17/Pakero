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
// 1 o 2 automaticos (sorteados entre los tres slots) + SIEMPRE 1 con decision.
//
// Antes eran los tres slots todos los años. Tres automaticos seguidos antes de
// la unica decision hacian que el año se sintiera un tramite: el jugador
// apretaba "Continuar" tres veces para recien despues jugar. Con uno o dos, y
// sorteando cuales, el año arranca mas rapido y ademas no siempre sube lo
// mismo — que los stats crezcan parejo todos los años era parte del problema.
export const SLOTS_AUTOMATICOS = ['calle', 'fama', 'mana_atencion'];
export const AUTOMATICOS_MIN = 1;
export const AUTOMATICOS_MAX = 2;
export const EVENTOS_DECISION_POR_ANIO = 1;

/**
 * Compensacion por haber bajado de 3 automaticos fijos a 1-2 sorteados.
 *
 * Sin esto el recorte de ritmo es tambien un recorte de balance encubierto: en
 * 400 partidas simuladas la edad final se caia de 26,4 a 22,5, los territorios
 * de 2,0 a 0,97 y "El Preso" pasaba del 30% al 56%. El culpable principal era
 * el slot `mana_atencion`, que es por donde BAJA la Atencion: al salir la mitad
 * de las veces, la Atencion subia sin freno y todos terminaban presos.
 *
 * Con x2 sobre ~1,5 eventos por año se recupera el rinde de los 3 de antes.
 * Aplica a los deltas positivos y a los negativos por igual, asi que el alivio
 * de Atencion se compensa en la misma proporcion que las subidas.
 */
export const MULT_AUTOMATICO = 2;

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

/**
 * Reescalado de la Atencion que suma el nivel de riesgo.
 *
 * La tabla de arriba estaba tuneada para un año de ~1,2 eventos con decision.
 * Con los especiales de Territorio (acercamiento, dueño, mantenimiento,
 * tension) el año pasó a ~1,7 decisiones, y cada una cobra Atencion por
 * riesgo: en 250 partidas simuladas el 100% terminaba preso y la Atencion
 * promedio a los 20 años era 52.
 *
 * El arreglo correcto no es sacar contenido: es que cada decision cobre menos,
 * porque ahora hay mas decisiones. 1 / 1,7 ≈ 0,6. Los valores de `RIESGO_META`
 * quedan como estan para que se sigan leyendo comparativamente entre si.
 */
export const MULT_ATENCION_RIESGO = 0.6;

/**
 * Enfriamiento anual de la Atencion: las causas viejas se enfrian solas.
 *
 * Hasta ahora la Atencion era un contador que SOLO subia, y el unico freno era
 * que te tocara un evento automatico del slot `mana_atencion` de los que la
 * bajan. Con los tres slots fijos eso pasaba una vez cada dos años y alcanzaba;
 * con 1-2 sorteados pasa una vez cada cuatro y no alcanza. En 250 partidas
 * simuladas el 100% terminaba preso, siempre, por acumulacion pura.
 *
 * Un regulador que dependa del sorteo de slots es un regulador roto. Este es
 * pasivo y ademas es lo que pasa de verdad: si no le das de comer, la causa se
 * enfria. Sigue siendo una amenaza real —se acumula mucho mas rapido de lo que
 * baja— pero ya no es una cuenta regresiva inevitable.
 */
export const ATENCION_ENFRIAMIENTO_ANUAL = -3;

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

// ---------------------------------------------------------------------------
// Camino: la bifurcacion de los 18
// ---------------------------------------------------------------------------
// Durante el Secundario se junta `puntosEstudio` en silencio (el jugador no lo
// ve). A los 18 se abre la bifurcacion Estudiar vs Calle y esos puntos son lo
// que hace que "Estudiar" sea una opcion con chances reales o un tiro al aire.
export const EDAD_BIFURCACION = 18;
/** Con esto o mas, la opcion Estudiar aparece marcada como viable en el panel. */
export const PUNTOS_ESTUDIO_VIABLE = 12;
/** Cuanto puede empujar el contador oculto a la tirada de la bifurcacion. */
export const BONUS_ESTUDIO_MAX = 0.35;
export const PUNTOS_ESTUDIO_TECHO = 30;

export const CAMINOS = {
  estudiar: {
    id: 'estudiar',
    label: 'Estudiar',
    icono: '🎓',
    desc: 'Seguiste con los libros. Mas lento, pero con techo mas alto.',
  },
  calle: {
    id: 'calle',
    label: 'La calle',
    icono: '🧱',
    desc: 'Te quedaste donde ya sabias moverte. Arranca rapido y se paga despues.',
  },
};

// Sub-variantes de Estudiar. No son rutas: solo cambian el sabor de los
// eventos de la etapa. Se deciden solas segun que tipo de eventos
// estudio_friendly predominaron en el Secundario.
export const SUBVARIANTES = {
  comunicacion: {
    id: 'comunicacion',
    label: 'Comunicación',
    icono: '🎙️',
    desc: 'Carrera de imagen y verso. Todo lo tuyo pasa por como sonas.',
  },
  administracion: {
    id: 'administracion',
    label: 'Administración de Empresas',
    icono: '📊',
    desc: 'Carrera de numeros y estructura. Todo lo tuyo pasa por como cerras.',
  },
};

// --- Segunda chance de estudiar (25-30) ---
export const EDAD_SEGUNDA_CHANCE_MIN = 25;
export const EDAD_SEGUNDA_CHANCE_MAX = 30;
export const COSTO_RECONVERSION_BASE = 1_500_000;
/** Cada punto de "calle acumulada" encarece dejar la vida que llevas. */
export const COSTO_RECONVERSION_POR_PUNTO = 140_000;
/** Ademas escala con el stat Calle: cuanto mas sos el barrio, mas cuesta irte. */
export const COSTO_RECONVERSION_PESO_CALLE = 1.2;
/** Lo que suma al contador de "calle acumulada" cada año en la calle. */
export const CALLE_ACUMULADA_POR_ANIO = 1;
export const CALLE_ACUMULADA_POR_MOVIDA = 2;

// ---------------------------------------------------------------------------
// Hijo
// ---------------------------------------------------------------------------
export const EDAD_HIJO_MIN = 28;
export const EDAD_HIJO_MAX = 30;
export const HIJO_TRACKER_INICIAL = 50;
/** Deriva anual del tracker segun como venis vos: la casa se nota. */
export const HIJO_DERIVA_ATENCION_ALTA = -3; // Atencion >= zona roja
export const HIJO_DERIVA_SALUD_BAJA = -2;
export const HIJO_DERIVA_BUEN_ANIO = 2; // nota del año >= 7.5

export const HIJO_ESTADOS = [
  { min: 75, id: 'muy_bien', label: 'Le va muy bien', color: 'verde', icono: '🌟' },
  { min: 50, id: 'bien', label: 'Le va bien', color: 'verde', icono: '🙂' },
  { min: 25, id: 'complicado', label: 'Viene complicado', color: 'dorado', icono: '😕' },
  { min: 0, id: 'mal', label: 'Le va mal', color: 'rojo', icono: '💔' },
];

export function estadoHijo(tracker) {
  return HIJO_ESTADOS.find((e) => tracker >= e.min) ?? HIJO_ESTADOS[HIJO_ESTADOS.length - 1];
}

// ---------------------------------------------------------------------------
// Socio recurrente
// ---------------------------------------------------------------------------
// Lealtad es un contador liviano y oculto, no un stat: no tiene barra propia
// ni entra en ninguna formula. Solo decide como sale su arco.
export const SOCIO_LEALTAD_INICIAL = 55;
export const SOCIO_LEALTAD_MIN = 0;
export const SOCIO_LEALTAD_MAX = 100;
/** Debajo de esto, cuando le toque el momento de arco, te da vuelta la cara. */
export const SOCIO_UMBRAL_TRAICION = 35;
/** Arriba de esto te banca aunque se le venga el mundo abajo. */
export const SOCIO_UMBRAL_FIRME = 65;
/** Lo que resta cada opcion marcada como egoista. */
export const SOCIO_PENALIZACION_EGOISTA = -8;
/** Edades en las que puede caer cada momento del arco. */
export const SOCIO_ARCO = [
  { id: 'presentacion', edadMin: 19, edadMax: 24 },
  { id: 'prueba', edadMin: 27, edadMax: 34 },
  { id: 'cierre', edadMin: 36, edadMax: 45 },
];

// ---------------------------------------------------------------------------
// Memoria de mediano plazo
// ---------------------------------------------------------------------------
// Algunas cosas no se terminan el año que pasan. Se anotan como flag y vuelven
// entre 3 y 5 años despues como un eco narrativo, una sola vez.
export const MEMORIA_ANIOS_MIN = 3;
export const MEMORIA_ANIOS_MAX = 5;
/** Cuantos ecos pueden resurgir en un mismo año. */
export const MEMORIA_ECOS_POR_ANIO = 1;

// ---------------------------------------------------------------------------
// Eventos de bisagra
// ---------------------------------------------------------------------------
/** Cada cuantos años cae una bisagra (20, 25, 30, 35, 40). */
export const BISAGRA_CADA = 5;
export const BISAGRA_EDAD_MIN = 20;
/** Si el proximo hito de Territorio esta a este % o mas, la bisagra es esa. */
export const BISAGRA_UMBRAL_TERRITORIO = 0.7;

/** Techo de eventos especiales por año, sin contar la crisis. */
export const MAX_ESPECIALES_POR_ANIO = 2;

// ---------------------------------------------------------------------------
// Territorio: la vida alrededor de la conquista
// ---------------------------------------------------------------------------
// Conquistar dejo de ser un boton que se aprieta una vez. Ahora hay tres capas
// mas: el acercamiento (antes), el dueño anterior (durante) y el mantenimiento
// (despues, para siempre).

/** Ventana de "te falta poco": entre 1 y 9 puntos de stat para el umbral. */
export const ACERCAMIENTO_PUNTOS_MIN = 1;
export const ACERCAMIENTO_PUNTOS_MAX = 9;
/** Un solo evento de acercamiento por nivel: no se repite todos los años. */
export const PROB_ACERCAMIENTO = 0.75;

/** Cada cuantos años hay que volver a bancar un territorio ya conquistado. */
export const MANTENIMIENTO_CADA_MIN = 2;
export const MANTENIMIENTO_CADA_MAX = 3;

/** Con dos o mas territorios a la vez, empiezan a rozarse entre ellos. */
export const TENSION_MIN_TERRITORIOS = 2;
export const PROB_TENSION_TERRITORIOS = 0.4;

/** Destinos posibles del dueño anterior, segun que hizo el jugador con el. */
export const DESTINOS_DUENIO = {
  libre: { id: 'libre', label: 'Lo dejaste ir', icono: '🚪', color: 'humo' },
  humillado: { id: 'humillado', label: 'Lo humillaste', icono: '👞', color: 'rojo' },
  aliado: { id: 'aliado', label: 'Lo sumaste', icono: '🤝', color: 'verde' },
};

// ---------------------------------------------------------------------------
// Negocios: los caminos de la vida adulta (23+)
// ---------------------------------------------------------------------------
/**
 * A los 23 la facultad se termina. Los eventos del camino "estudiar" salen del
 * pool —hayas estudiado o no— y su lugar lo ocupan los eventos de negocio.
 *
 * Los eventos de negocio son el mecanismo por el que el personaje va definiendo
 * en qué se convierte. NO son rutas: no bloquean nada ni desbloquean nada. Es
 * un contador liviano de afinidad, igual que `puntosEstudio` en el Secundario,
 * que solo inclina QUE TAN PROBABLE es que aparezca cada tipo de evento.
 */
export const EDAD_FIN_EVENTOS_ESTUDIO = 23;
export const EDAD_NEGOCIOS = 23;

export const AFINIDADES_NEGOCIO = {
  comercio: {
    id: 'comercio',
    label: 'Comercio y logística',
    icono: '🚚',
    desc: 'Rutas, mercadería, distribución. Mover cosas de un lado a otro sin que se pierdan.',
  },
  finanzas: {
    id: 'finanzas',
    label: 'Finanzas y lavado',
    icono: '🏦',
    desc: 'Estructuras, contadores, blanqueo. Que la plata exista en los papeles.',
  },
  territorio: {
    id: 'territorio',
    label: 'Territorio y calle',
    icono: '🧱',
    desc: 'Control de zona y de gente. Lo de siempre, pero en serio.',
  },
  politica: {
    id: 'politica',
    label: 'Política y contactos',
    icono: '🤵',
    desc: 'Favores, despachos, gente que firma. El poder que no se ve.',
  },
  farandula: {
    id: 'farandula',
    label: 'Farándula y fama',
    icono: '📸',
    desc: 'Vida pública, auspicios, cámaras. Que tu nombre valga por sí solo.',
  },
};

export const IDS_AFINIDAD_NEGOCIO = Object.keys(AFINIDADES_NEGOCIO);

/** Lo que suma elegir una opcion de ese tipo. El contador es liviano a proposito. */
export const PUNTOS_NEGOCIO_POR_ELECCION = 3;

/**
 * Cuanto empuja la afinidad al peso de un evento en el sorteo.
 *
 * `peso_efectivo = peso * (1 + PESO_AFINIDAD_NEGOCIO * proporcion)`, donde
 * `proporcion` es la parte del total que se lleva esa afinidad (0..1). Con 1.2,
 * un jugador que metio TODO en una sola afinidad ve esos eventos con el doble
 * de peso — y sigue viendo todos los demas, porque el multiplicador nunca baja
 * de 1. Inclinar, no bloquear: esa es toda la idea.
 */
export const PESO_AFINIDAD_NEGOCIO = 1.2;

// --- Guardado ---
export const STORAGE_KEY = 'paquero:partida:v4';
export const STORAGE_VERSION = 4;

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
