/**
 * Cliffhangers: la última línea del resumen de cada año.
 *
 * Va SIEMPRE, sin excepción. Un año que cierra con la nota y nada más se
 * siente como un balance contable; un año que cierra con algo sin resolver te
 * hace apretar "Siguiente año". Esa es toda la función de este archivo.
 *
 * Mismo mecanismo que la biografía: de todos los que dan `cuando(c)` true gana
 * el de mayor `peso`, y si empatan desempata el azar con semilla. Los de
 * `peso: 0` siempre matchean — son el piso, y hay varios para que un año sin
 * nada particular tampoco cierre siempre igual.
 *
 * El contexto `c` que recibe cada uno:
 *
 *   c.edad c.anio c.nota c.comentario
 *   c.ingreso c.ingresoPrevio c.tendencia   -1 | 0 | 1
 *   c.guita c.stats c.crisis
 *   c.ventas c.movidas c.ventasAnio c.movidasAnio
 *   c.rival { nombre, apodo, ventas } c.diferencia c.duelo
 *   c.territorios          cuántos tiene ahora
 *   c.conquistoEsteAnio    boolean
 *   c.perdioEsteAnio       nombre del territorio perdido, o null
 *   c.cercaDelHito         boolean — está a 1-9 puntos del próximo umbral
 *   c.hijo c.socio c.camino
 *   c.duenios              los dueños anteriores y qué hiciste con cada uno
 *   c.huboEco              boolean — este año volvió algo de hace años
 */

export const CLIFFHANGERS = [
  // --------------------------------------------------------------- el piso
  {
    id: 'piso_puerta',
    peso: 0,
    cuando: () => true,
    texto: () => 'Esa noche golpearon la puerta dos veces y cuando abriste no había nadie.',
  },
  {
    id: 'piso_telefono',
    peso: 0,
    cuando: () => true,
    texto: () =>
      'A las tres de la mañana sonó el teléfono, cortaron al segundo tono y no volvió a sonar.',
  },
  {
    id: 'piso_auto',
    peso: 0,
    cuando: () => true,
    texto: () =>
      'Hay un auto que hace tres semanas estaciona en la misma esquina y no baja nadie.',
  },
  {
    id: 'piso_pregunta',
    peso: 0,
    cuando: () => true,
    texto: () =>
      'Alguien anduvo preguntando por vos. No dejó nombre y el que te contó no le vio bien la cara.',
  },
  {
    id: 'piso_sobre',
    peso: 0,
    cuando: () => true,
    texto: () =>
      'Apareció un sobre abajo de la puerta, sin remitente y sin nada adentro. ' +
      'Eso también es un mensaje.',
  },

  // ------------------------------------------------------------ la policía
  {
    id: 'yuta_zona_roja',
    peso: 5,
    cuando: (c) => c.stats.atencion >= 80,
    texto: () =>
      'El patrullero ya no disimula: para en la esquina, apaga el motor y se queda. ' +
      'Están esperando algo y vos también.',
  },
  {
    id: 'yuta_media',
    peso: 3,
    cuando: (c) => c.stats.atencion >= 55 && c.stats.atencion < 80,
    texto: () =>
      'Te enteraste de que tu nombre apareció en una carpeta. No sabés en cuál ni de quién.',
  },

  // -------------------------------------------------------------- el cuerpo
  {
    id: 'salud_rota',
    peso: 5,
    cuando: (c) => c.stats.salud < 30,
    texto: () =>
      'Te levantaste tres veces esa noche y ninguna fue por ruido. ' +
      'Hay algo adentro tuyo que hace rato viene avisando.',
  },

  // --------------------------------------------------------------- el rival
  {
    id: 'rival_pisando',
    peso: 4,
    cuando: (c) => c.diferencia >= 1 && c.diferencia <= 2,
    texto: (c) =>
      `${c.rival.nombre} te está a dos pasos y lo sabe. ` +
      'Preguntó por vos en un lugar donde no tenía por qué estar preguntando.',
  },
  {
    id: 'rival_adelante',
    peso: 4,
    cuando: (c) => c.diferencia < 0,
    texto: (c) =>
      `${c.rival.nombre} cerró el año arriba tuyo y esta vez lo festejó donde vos lo ibas a escuchar.`,
  },
  {
    id: 'rival_lejos',
    peso: 4,
    cuando: (c) => c.diferencia >= 5,
    texto: (c) =>
      `Hace meses que ${c.rival.nombre} no dice tu nombre. ` +
      'Los que lo conocen dicen que cuando se calla es cuando hay que mirarlo.',
  },

  // ------------------------------------------------------------ territorio
  {
    id: 'terr_recien',
    peso: 7,
    cuando: (c) => c.conquistoEsteAnio,
    texto: () =>
      'La primera semana como dueño fue tranquila. Demasiado. ' +
      'Nadie toma algo así sin que alguien, en algún lado, esté haciendo cuentas.',
  },
  {
    id: 'terr_perdido',
    peso: 8,
    cuando: (c) => !!c.perdioEsteAnio,
    texto: (c) =>
      `Pasaste por ${c.perdioEsteAnio} de noche, despacio, sin frenar. ` +
      'Ya hay otro parado donde estabas vos y todavía no sabe quién sos.',
  },
  {
    id: 'terr_cerca',
    peso: 6,
    cuando: (c) => c.cercaDelHito,
    texto: () =>
      'Te falta poquito y se nota: ya te miran distinto, ya te hablan distinto. ' +
      'El año que viene se define de un lado o del otro.',
  },
  {
    id: 'terr_varios',
    peso: 4,
    cuando: (c) => c.territorios >= 2,
    texto: () =>
      'Manejar dos lugares a la vez significa que siempre hay uno donde no estás. ' +
      'Y alguien ya se dio cuenta de cuál es.',
  },
  {
    id: 'terr_duenio_humillado',
    peso: 6,
    cuando: (c) => c.duenios?.some((d) => d.destino === 'humillado'),
    texto: (c) => {
      const d = c.duenios.find((x) => x.destino === 'humillado');
      return (
        `Lo vieron a ${d.nombre} tomando algo con gente que no es de acá. ` +
        'Un tipo al que le sacaste todo y encima lo dejaste caminando tiene mucho tiempo libre.'
      );
    },
  },
  {
    id: 'terr_duenio_aliado',
    peso: 5,
    cuando: (c) => c.duenios?.some((d) => d.destino === 'aliado'),
    texto: (c) => {
      const d = c.duenios.find((x) => x.destino === 'aliado');
      return (
        `${d.nombre} te resolvió un quilombo antes de que te enteraras de que existía. ` +
        'Todavía no sabés si eso es lealtad o es que conoce esto mejor que vos.'
      );
    },
  },

  // ------------------------------------------------------------------ hijo
  {
    id: 'hijo_mal',
    peso: 6,
    cuando: (c) => c.hijo && c.hijo.tracker < 30,
    texto: (c) =>
      `${c.hijo.nombre} dejó de contarte las cosas. No de golpe: te fuiste enterando ` +
      'de que hacía rato que no te contaba nada.',
  },
  {
    id: 'hijo_bien',
    peso: 4,
    cuando: (c) => c.hijo && c.hijo.tracker >= 70,
    texto: (c) =>
      `${c.hijo.nombre} te preguntó de qué trabajás. Así, de la nada, comiendo. ` +
      'Le contestaste cualquier cosa y te quedaste pensando toda la noche.',
  },

  // ----------------------------------------------------------------- socio
  {
    id: 'socio_quebrado',
    peso: 6,
    cuando: (c) => c.socio?.humor === 'quebrado',
    texto: (c) =>
      `${c.socio.nombre} llegó tarde a las últimas tres y no dio explicaciones. ` +
      'Antes las daba sin que se las pidieras.',
  },
  {
    id: 'socio_traiciono',
    peso: 6,
    cuando: (c) => c.socio?.estado === 'traiciono',
    texto: (c) =>
      `Alguien vio a ${c.socio.nombre} del otro lado de la General Paz, bajando de un auto ` +
      'que no era el suyo. Todavía anda dando vueltas y todavía sabe todo.',
  },

  // ---------------------------------------------------------------- la guita
  {
    id: 'crisis',
    peso: 7,
    cuando: (c) => c.crisis,
    texto: () =>
      'Sacaste la cuenta de lo que te queda y te alcanza para cuatro meses. ' +
      'Cinco si no pasa nada raro, y siempre pasa algo raro.',
  },
  {
    id: 'guita_cayendo',
    peso: 3,
    cuando: (c) => c.tendencia < 0 && c.ingresoPrevio != null,
    texto: () =>
      'Segundo año que entra menos. Todavía no es un problema, pero ya es un número ' +
      'que mirás más de una vez.',
  },
  {
    id: 'guita_mucha',
    peso: 4,
    cuando: (c) => c.guita >= 25_000_000,
    texto: () =>
      'Tenés tanta plata quieta que ya es un problema en sí misma. ' +
      'Guardarla en algún lado también es decirle a alguien dónde está.',
  },

  // ------------------------------------------------------------ cómo salió
  {
    id: 'anio_buenisimo',
    peso: 3,
    cuando: (c) => c.nota >= 9,
    texto: () =>
      'Fue el mejor año que tuviste. Eso significa que a partir de ahora todos los que vengan ' +
      'se van a comparar con este.',
  },
  {
    id: 'anio_desastre',
    peso: 3,
    cuando: (c) => c.nota <= 3,
    texto: () =>
      'Cerraste el año con la sensación de que se te escapó entero entre los dedos. ' +
      'Y arriba de la mesa hay una cosa que no resolviste y que en enero sigue ahí.',
  },

  // ------------------------------------------------------------------ otros
  {
    id: 'eco',
    peso: 5,
    cuando: (c) => c.huboEco,
    texto: () =>
      'Lo de este año te dejó pensando en cosas viejas. ' +
      'Y si volvió una, no hay ningún motivo para que no vuelvan las otras.',
  },
  {
    id: 'edad_final',
    peso: 5,
    cuando: (c) => c.edad >= 43,
    texto: (c) =>
      `Tenés ${c.edad}. Lo que no hagas ahora ya no lo vas a hacer, y por primera vez ` +
      'eso no es una frase: es una fecha.',
  },
  {
    id: 'estudiando',
    peso: 2,
    cuando: (c) => c.camino?.id === 'estudiar' && c.edad < 30,
    texto: () =>
      'Dejaste el apunte abierto en la misma página tres noches seguidas. ' +
      'Cursar y sostener todo lo demás al mismo tiempo se está poniendo pesado.',
  },
];
