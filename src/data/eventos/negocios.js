/**
 * Eventos de negocio — de los 23 en adelante.
 *
 * A los 23 la facultad se termina y estos ocupan su lugar. Son el mecanismo
 * por el que el personaje va definiendo en qué se convierte durante toda la
 * vida adulta, y funcionan en dos capas:
 *
 *   `rubro` en el EVENTO      — de qué palo es. Inclina cuánto pesa en el
 *                               sorteo según lo que el jugador viene eligiendo.
 *   `negocio` en la OPCIÓN    — qué te hace elegirla. Es lo que suma al
 *                               contador. Por eso la mayoría de los eventos
 *                               ofrece opciones de afinidades DISTINTAS: ahí
 *                               está la decisión de en qué te convertís.
 *
 * No hay rutas. Ningún evento se bloquea, ningún umbral se exige, ninguna
 * opción se cierra. Un tipo con 100% de `finanzas` sigue viendo eventos de
 * calle y de farándula: los ve menos seguido, nada más.
 *
 * Las cinco afinidades:
 *   comercio    rutas, mercadería, distribución
 *   finanzas    estructuras, contadores, blanqueo
 *   territorio  control de zona, bandas
 *   politica    favores, corrupción, poder formal
 *   farandula   vida pública, auspicios, medios — prioriza Fama sobre el resto
 */

const BASE = { etapa: 'adultez', edad_min: 23, tipo: 'decision', esfuerzo_fisico: false };

// ===========================================================================
// COMERCIO Y LOGÍSTICA
// ===========================================================================

const COMERCIO = [
  {
    ...BASE,
    id: 'neg_com_01',
    rubro: 'comercio',
    categoria: 'venta',
    titulo: 'La ruta que nadie usa',
    texto:
      'Un tipo que maneja camiones de verdura te marcó en un mapa una ruta secundaria que evita ' +
      'los tres controles de la provincial. Tarda dos horas más y no la conoce casi nadie. ' +
      'Te la ofrece a cambio de un porcentaje, o podés averiguar quién firma en esos controles ' +
      'y arreglar de una vez por todas.',
    opciones: [
      {
        texto: 'Tomar la ruta y armar el circuito propio',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.6,
        negocio: 'comercio',
        resultados: {
          critico_exito: {
            texto:
              'La ruta es oro. En seis meses tenías tres vehículos haciendo el recorrido y ' +
              'nadie preguntando nada. Mover cosas bien es un oficio y resultó que lo tenías.',
            stats: { mana: 7, calle: 3 },
            guita: 1_400_000,
            ventas: 3,
          },
          exito: {
            texto: 'Funcionó. Más lento, más barato, más tranquilo.',
            stats: { mana: 4 },
            guita: 600_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto: 'Anda, pero las dos horas extra por viaje se te comen el margen y el humor.',
            stats: { mana: 3, salud: -6 },
            guita: 250_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'La ruta era conocida por más gente de la que decía. Perdiste dos cargas.',
            stats: { fama: -3 },
            guita: -400_000,
          },
          critico_fracaso: {
            texto:
              'Había un control nuevo que nadie te avisó. Perdiste el camión, la carga y ' +
              'ganaste una carpeta con fotos tuyas al volante.',
            stats: { atencion: 20, fama: -4 },
            guita: -900_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Ir a hablar con el que firma en los controles',
        riesgo: 'alto',
        minijuego: null,
        prob_base: 0.48,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Resultó que el que firma tiene un primo con ambiciones y una campaña que financiar. ' +
              'Ahora no hay ruta secundaria: pasás por la principal, saludando.',
            stats: { mana: 6, fama: 5, atencion: -10 },
            guita: 900_000,
            ventas: 2,
          },
          exito: {
            texto: 'Arreglaste. Sale plata todos los meses y no sale ningún problema.',
            stats: { mana: 4, atencion: -6 },
            guita: 400_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Arreglaste caro y ahora hay alguien con poder que sabe exactamente qué hacés.',
            stats: { mana: 2, atencion: 8 },
            guita: -200_000,
          },
          fracaso: {
            texto: 'Te escuchó, te dijo que sí y no cumplió nada. La plata no vuelve.',
            stats: { mana: -2 },
            guita: -500_000,
          },
          critico_fracaso: {
            texto:
              'Le ofreciste plata al equivocado y quedó grabado. Ahora hay una causa por cohecho ' +
              'con tu nombre y un fiscal con ganas de aparecer en el diario.',
            stats: { atencion: 26, fama: -6 },
            guita: -700_000,
            flags: ['desastre', 'buchon'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_com_02',
    rubro: 'comercio',
    categoria: 'movida',
    titulo: 'El galpón de Villa Soldati',
    texto:
      'Se alquila un galpón grande, con muelle de carga y portón que da a dos calles distintas. ' +
      'Es exactamente lo que necesitás para dejar de guardar las cosas en cinco lugares chicos. ' +
      'Piden dos años adelantados y factura, así que o lo ponés a nombre tuyo o hay que armar algo.',
    opciones: [
      {
        texto: 'Alquilarlo y centralizar todo ahí',
        riesgo: 'medio',
        minijuego: 'empaquetar',
        prob_base: 0.6,
        negocio: 'comercio',
        resultados: {
          critico_exito: {
            texto:
              'Tener todo en un solo lugar te cambió la operación entera. Sabés qué tenés, ' +
              'sabés dónde está y sabés cuánto vale. Nunca habías tenido esa tranquilidad.',
            stats: { mana: 8, calle: 3 },
            guita: 1_100_000,
            movidas: 2,
          },
          exito: {
            texto: 'El galpón ordena todo. Se nota en el primer mes.',
            stats: { mana: 5 },
            guita: 400_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Funciona, pero tener todo junto también significa que se puede perder todo junto.',
            stats: { mana: 4, atencion: 12 },
            guita: 100_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'El galpón salió más caro de lo pactado y el dueño resultó ser un problema.',
            stats: { mana: 1 },
            guita: -700_000,
          },
          critico_fracaso: {
            texto:
              'Allanaron el galpón con todo adentro. En una tarde perdiste lo que habías juntado ' +
              'en tres años, prolijamente centralizado para que no tuvieran que buscar.',
            stats: { atencion: 24, calle: -5 },
            guita: -1_800_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Inaugurarlo a lo grande, con prensa y todo',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.55,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Corte de cinta, catering, dos concejales y un móvil del canal local. ' +
              'A partir de esa foto dejaste de ser un rumor y pasaste a ser una empresa.',
            stats: { fama: 13, mana: 3 },
            guita: -400_000,
            movidas: 1,
          },
          exito: {
            texto: 'Vino gente, salió una nota chica y tu nombre quedó asociado a algo legítimo.',
            stats: { fama: 8 },
            guita: -250_000,
          },
          exito_con_costo: {
            texto:
              'Salió lindo, pero ahora media ciudad sabe exactamente dónde guardás las cosas.',
            stats: { fama: 7, atencion: 18 },
            guita: -300_000,
          },
          fracaso: {
            texto: 'No vino casi nadie y las fotos del salón vacío circularon más que el evento.',
            stats: { fama: -4 },
            guita: -350_000,
          },
          critico_fracaso: {
            texto:
              'Invitaste a la prensa a un galpón lleno de cosas que no había que mostrar. ' +
              'Una de esas fotos terminó en un expediente.',
            stats: { fama: -5, atencion: 28 },
            guita: -400_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Ponerlo a nombre de una sociedad armada',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.58,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Armaste una sociedad con dos testaferros y un objeto social tan aburrido que ' +
              'nadie va a leerlo nunca. El galpón existe, factura y no es tuyo en ningún papel.',
            stats: { mana: 9, atencion: -14 },
            guita: 700_000,
            movidas: 1,
          },
          exito: {
            texto: 'Quedó a nombre de una sociedad. Más papeleo, mucho menos riesgo.',
            stats: { mana: 6, atencion: -8 },
            guita: 300_000,
          },
          exito_con_costo: {
            texto: 'Salió, pero los honorarios del que armó todo fueron una barbaridad.',
            stats: { mana: 4, atencion: -4 },
            guita: -600_000,
          },
          fracaso: {
            texto: 'La sociedad quedó mal armada y uno de los testaferros se arrepintió.',
            stats: { mana: 1, atencion: 6 },
            guita: -400_000,
          },
          critico_fracaso: {
            texto:
              'El testaferro era un colgado que ya tenía causas. Ponerle tu galpón encima ' +
              'fue como poner un cartel: ahora hay una investigación patrimonial.',
            stats: { atencion: 22, mana: -3 },
            guita: -900_000,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_com_03',
    rubro: 'comercio',
    categoria: 'venta',
    esfuerzo_fisico: true,
    titulo: 'Los camioneros se plantaron',
    texto:
      'Los que te mueven la mercadería pararon todo: quieren el doble por viaje y lo quieren ahora. ' +
      'Tienen razón en que les pagabas poco y tienen la ventaja de que sin ellos no se mueve nada. ' +
      'Podés negociar como un empresario o recordarles cómo se arreglan estas cosas.',
    opciones: [
      {
        texto: 'Sentarte a negociar y firmar algo que dure',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.62,
        negocio: 'comercio',
        resultados: {
          critico_exito: {
            texto:
              'Les diste el aumento y además un porcentaje por viaje cumplido. Ahora cuidan la ' +
              'carga como si fuera de ellos, porque en parte lo es.',
            stats: { mana: 8, fama: 3 },
            guita: 500_000,
            ventas: 2,
          },
          exito: {
            texto: 'Arreglaron en un número intermedio. Todos se fueron medio conformes.',
            stats: { mana: 5 },
            guita: 200_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Aceptaste casi todo lo que pedían. Se movió la mercadería y se fue el margen.',
            stats: { mana: 3 },
            guita: -300_000,
          },
          fracaso: {
            texto: 'No se llegó a nada y perdiste tres semanas de operación.',
            stats: { fama: -3 },
            guita: -600_000,
          },
          critico_fracaso: {
            texto:
              'Se levantaron de la mesa y se llevaron los contactos a la competencia. ' +
              'Aprendiste tarde que la logística la hacen personas.',
            stats: { fama: -6, mana: -3 },
            guita: -1_200_000,
          },
        },
      },
      {
        texto: 'Recordarles quién consigue la carga',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'pelear',
        prob_base: 0.5,
        negocio: 'territorio',
        egoista: true,
        resultados: {
          critico_exito: {
            texto:
              'Una conversación, dos frases y el paro se terminó esa misma tarde. ' +
              'Volvieron a los precios de antes y nadie volvió a mencionar el tema.',
            stats: { calle: 9, fama: 4, salud: -6 },
            guita: 300_000,
            ventas: 2,
          },
          exito: {
            texto: 'Se acabó el paro. Trabajan igual y te miran distinto.',
            stats: { calle: 6, salud: -8 },
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Volvieron a laburar, pero uno terminó en la guardia y hubo preguntas.',
            stats: { calle: 4, atencion: 16, salud: -12 },
          },
          fracaso: {
            texto: 'No aflojaron. Son más que vos y esta vez estaban juntos.',
            stats: { calle: -4, fama: -4, salud: -14 },
            guita: -500_000,
          },
          critico_fracaso: {
            texto:
              'Le pegaste al que no era y resultó ser el cuñado de tu mejor proveedor. ' +
              'Perdiste el transporte, la mercadería y una relación de años.',
            stats: { calle: -7, fama: -8, salud: -16, atencion: 12 },
            guita: -1_500_000,
            socio: -10,
            flags: ['traicion', 'desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_com_04',
    rubro: 'comercio',
    categoria: 'movida',
    titulo: 'Comprar la flota',
    texto:
      'Podés dejar de alquilar vehículos y comprar los tuyos. Son muchos ceros de una sola vez, ' +
      'pero después no le rendís cuentas a nadie sobre dónde va cada uno. ' +
      'El contador dice que la amortización te sirve para otra cosa, además.',
    opciones: [
      {
        texto: 'Comprarlos. Que sean tuyos',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.58,
        negocio: 'comercio',
        resultados: {
          critico_exito: {
            texto:
              'Cinco vehículos propios y un mecánico de confianza. Bajaste el costo por viaje a ' +
              'la mitad y no hay nadie afuera que sepa tus horarios.',
            stats: { mana: 8, calle: 4, atencion: -8 },
            guita: -1_500_000,
            movidas: 2,
          },
          exito: {
            texto: 'Compraste tres. Se paga solo en un año y medio.',
            stats: { mana: 5, atencion: -4 },
            guita: -900_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Compraste, pero dos vinieron con problemas y el taller te come el ahorro.',
            stats: { mana: 3 },
            guita: -1_400_000,
          },
          fracaso: {
            texto: 'Compraste chatarra pintada. La mitad no arranca.',
            stats: { mana: -2, fama: -3 },
            guita: -1_600_000,
          },
          critico_fracaso: {
            texto:
              'Los vehículos tenían pedido de secuestro de antes. Los perdiste todos y ' +
              'encima quedaste vinculado a la causa del que te los vendió.',
            stats: { atencion: 22, mana: -3 },
            guita: -2_000_000,
            flags: ['desastre', 'deuda'],
          },
        },
      },
      {
        texto: 'Armarlo como leasing con factura y todo',
        riesgo: 'bajo',
        minijuego: 'prensado',
        prob_base: 0.6,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Leasing, IVA computado, amortización acelerada. Los vehículos trabajan para vos ' +
              'y encima te bajan lo que tenés que declarar. El contador te miró con respeto.',
            stats: { mana: 10, atencion: -12 },
            guita: 400_000,
            movidas: 1,
          },
          exito: {
            texto: 'Quedó armado prolijo. Cuota mensual, papeles en orden, cero ruido.',
            stats: { mana: 6, atencion: -6 },
            guita: -300_000,
          },
          exito_con_costo: {
            texto: 'Funciona pero te ató a una cuota fija que hay que pagar entre bien y mal.',
            stats: { mana: 4 },
            guita: -800_000,
          },
          fracaso: {
            texto: 'El banco pidió garantías que no podías dar sin explicar cosas. Se cayó.',
            stats: { mana: 1, fama: -2 },
            guita: -200_000,
          },
          critico_fracaso: {
            texto:
              'Para calificar tuviste que mostrar ingresos que no existían y los inventaste mal. ' +
              'Ahora hay un legajo bancario con números que no cierran y alguien los está mirando.',
            stats: { atencion: 25, mana: -2 },
            guita: -600_000,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// FINANZAS Y LAVADO
// ===========================================================================

const FINANZAS = [
  {
    ...BASE,
    id: 'neg_fin_01',
    rubro: 'finanzas',
    categoria: null,
    titulo: 'El contador que te presentaron',
    texto:
      'Te presentaron a un contador que trabajó veinte años en el estudio grande de la avenida ' +
      'y se fue por su cuenta. Habla despacio, no pregunta de dónde sale nada y te dijo una sola ' +
      'frase: "vos traé los números, yo los hago existir". Cobra caro y cobra por adelantado.',
    opciones: [
      {
        texto: 'Contratarlo y darle acceso a todo',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.56,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'En cuatro meses tenías una estructura que aguanta que la miren de frente. ' +
              'Por primera vez sabés exactamente cuánto tenés, y por primera vez es defendible.',
            stats: { mana: 11, atencion: -20 },
            guita: 800_000,
          },
          exito: {
            texto: 'Ordenó todo. Menos plata líquida, mucho menos riesgo.',
            stats: { mana: 7, atencion: -12 },
            guita: -400_000,
          },
          exito_con_costo: {
            texto: 'Ordenó todo y ahora sabe todo. Es la persona más peligrosa que conocés.',
            stats: { mana: 5, atencion: -6 },
            guita: -700_000,
          },
          fracaso: {
            texto: 'Cobró por adelantado, hizo la mitad y se volvió al estudio grande.',
            stats: { mana: 1 },
            guita: -800_000,
          },
          critico_fracaso: {
            texto:
              'Le diste acceso a todo a un tipo que ya venía negociando con la fiscalía. ' +
              'Le entregaste tu contabilidad entera, ordenada y con índice.',
            stats: { atencion: 30, mana: -4, fama: -4 },
            guita: -1_200_000,
            flags: ['buchon', 'desastre'],
          },
        },
      },
      {
        texto: 'Pedirle que te presente gente de arriba en vez',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.5,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Te sentó en una mesa con tres tipos de traje que manejan más plata que vos ' +
              'y no preguntan nada. Salir de esa cena te cambió de categoría.',
            stats: { fama: 8, mana: 6, atencion: -8 },
            guita: 1_200_000,
          },
          exito: {
            texto: 'Te abrió dos puertas. Chicas, pero de las que no se abren solas.',
            stats: { fama: 4, mana: 3 },
            guita: 400_000,
          },
          exito_con_costo: {
            texto: 'Te presentó gente, sí. Y ahora esa gente sabe que existís y qué hacés.',
            stats: { fama: 3, atencion: 12 },
          },
          fracaso: {
            texto: 'Te dijo que sí y nunca concretó ninguna reunión. Pura cortesía.',
            stats: { mana: -1 },
            guita: -200_000,
          },
          critico_fracaso: {
            texto:
              'Te presentó gente que te usó de pantalla para algo mucho más grande. ' +
              'Sos el nombre que figura en una operación que ni entendés.',
            stats: { atencion: 28, fama: -5 },
            guita: -1_000_000,
            flags: ['desastre', 'traicion'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_fin_02',
    rubro: 'finanzas',
    categoria: 'movida',
    titulo: 'La financiera de la galería',
    texto:
      'Hay una financiera en la galería del centro que cambia, presta y no hace preguntas. ' +
      'El dueño se quiere retirar y la vende con cartera de clientes incluida. ' +
      'Es una máquina de mover plata a la vista de todos, que es la mejor forma de esconderla.',
    opciones: [
      {
        texto: 'Comprarla entera',
        riesgo: 'alto',
        minijuego: 'prensado',
        prob_base: 0.52,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Comprás y vendés dólares todo el día con cara de aburrido. Por el mostrador pasa ' +
              'tanta plata legal que la tuya se vuelve invisible. Es el mejor negocio que hiciste.',
            stats: { mana: 11, fama: 4, atencion: -18 },
            guita: 2_500_000,
            movidas: 2,
          },
          exito: {
            texto: 'Anda. Entra plata todos los días y sale limpia por el otro lado.',
            stats: { mana: 7, atencion: -10 },
            guita: 1_000_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Funciona, pero la cartera que te vendieron tenía tres incobrables grandes.',
            stats: { mana: 5 },
            guita: -600_000,
          },
          fracaso: {
            texto: 'El negocio dependía del dueño anterior y sus clientes se fueron con él.',
            stats: { mana: 1, fama: -3 },
            guita: -1_400_000,
          },
          critico_fracaso: {
            texto:
              'La financiera venía con una causa por asociación ilícita en curso y vos ' +
              'firmaste la transferencia. Compraste un problema con vidriera a la calle.',
            stats: { atencion: 32, fama: -6 },
            guita: -2_200_000,
            flags: ['desastre', 'deuda'],
          },
        },
      },
      {
        texto: 'Usarla de cliente nomás, sin comprar nada',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.66,
        negocio: 'comercio',
        resultados: {
          critico_exito: {
            texto:
              'Le llevás plata todos los martes y te la devuelve en otro formato, sin nombres. ' +
              'Sin comprar nada ni firmar nada, que es lo más elegante del asunto.',
            stats: { mana: 7, atencion: -10 },
            guita: 700_000,
            movidas: 1,
          },
          exito: {
            texto: 'Buen canal, sin exposición. Cobra su comisión y no molesta.',
            stats: { mana: 4, atencion: -5 },
            guita: 350_000,
          },
          exito_con_costo: {
            texto: 'Funciona, pero la comisión es una barbaridad y no hay con qué negociarla.',
            stats: { mana: 2 },
            guita: -300_000,
          },
          fracaso: {
            texto: 'Cerró de un día para el otro con plata tuya adentro.',
            stats: { mana: -2 },
            guita: -800_000,
          },
          critico_fracaso: {
            texto:
              'Cayó la financiera con todo y en los registros figurabas como cliente habitual, ' +
              'con montos, fechas y una cámara que te filmó veinte veces entrando.',
            stats: { atencion: 26, fama: -4 },
            guita: -1_100_000,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_fin_03',
    rubro: 'finanzas',
    categoria: null,
    titulo: 'Dónde guardás lo que tenés',
    texto:
      'Ya no entra abajo del colchón ni en la casa de tu vieja. Es demasiada plata quieta y ' +
      'la plata quieta es un problema en sí misma: alguien siempre sabe dónde está. ' +
      'Hay que decidir dónde va a vivir de ahora en adelante.',
    opciones: [
      {
        texto: 'Ladrillo: comprar propiedades a nombre de terceros',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.62,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Cuatro departamentos y un local, todos alquilados, todos a nombre de gente que ' +
              'existe y confía en vos. Entra renta todos los meses y nada figura.',
            stats: { mana: 9, atencion: -14 },
            guita: -1_200_000,
          },
          exito: {
            texto: 'Dos propiedades bien puestas. La plata dejó de estar suelta.',
            stats: { mana: 6, atencion: -8 },
            guita: -800_000,
          },
          exito_con_costo: {
            texto: 'Compraste caro y encima uno de los titulares empezó a hacerse el vivo.',
            stats: { mana: 4 },
            guita: -1_400_000,
          },
          fracaso: {
            texto: 'Una de las escrituras salió trucha y perdiste la propiedad entera.',
            stats: { mana: -2, fama: -3 },
            guita: -1_600_000,
          },
          critico_fracaso: {
            texto:
              'El testaferro principal se murió sin dejar nada escrito y los herederos ' +
              'reclamaron todo. Legalmente no tenés cómo decir que era tuyo.',
            stats: { mana: -4, fama: -5 },
            guita: -2_500_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Repartirla entre la gente de tu zona y que la muevan ellos',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.54,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'Veinte personas guardando un pedazo cada una, todas del barrio, todas debiéndote algo. ' +
              'No hay allanamiento que encuentre eso y no hay nadie que se atreva a no devolverlo.',
            stats: { calle: 9, mana: 4 },
            guita: 300_000,
          },
          exito: {
            texto: 'Repartida y a salvo. Le diste de comer a mucha gente de paso.',
            stats: { calle: 6, fama: 3 },
          },
          exito_con_costo: {
            texto: 'Está segura, pero ahora veinte personas saben cuánto tenés.',
            stats: { calle: 4, atencion: 10 },
          },
          fracaso: {
            texto: 'Dos no devolvieron y tuviste que decidir qué hacer con eso.',
            stats: { calle: -3, salud: -8 },
            guita: -600_000,
          },
          critico_fracaso: {
            texto:
              'Uno habló para zafar de otra causa y dio la lista completa de quién guardaba qué. ' +
              'Cayeron todos el mismo día, a la misma hora.',
            stats: { atencion: 28, calle: -8, fama: -6 },
            guita: -1_800_000,
            flags: ['buchon', 'desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_fin_04',
    rubro: 'finanzas',
    categoria: 'movida',
    titulo: 'El fideicomiso',
    texto:
      'Te ofrecen entrar en un fideicomiso inmobiliario: se construye una torre, vos ponés capital ' +
      'y salís como inversor legítimo con documentación que aguanta cualquier auditoría. ' +
      'Es el paso de blanquear de verdad, y es la primera vez que te lo ofrecen.',
    opciones: [
      {
        texto: 'Entrar fuerte y salir a la luz',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.55,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Sos inversor inmobiliario. Así, con esas palabras, en un papel con sello. ' +
              'Cuando te preguntan a qué te dedicás tenés una respuesta que es verdad.',
            stats: { mana: 10, fama: 6, atencion: -22 },
            guita: -2_000_000,
            movidas: 2,
          },
          exito: {
            texto: 'Entraste. La plata quedó adentro dos años y sale limpia del otro lado.',
            stats: { mana: 7, atencion: -14 },
            guita: -1_500_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Entraste, pero la obra se atrasó y tu plata quedó congelada más de lo previsto.',
            stats: { mana: 4, atencion: -8 },
            guita: -2_200_000,
          },
          fracaso: {
            texto: 'La obra se frenó por un conflicto entre los desarrolladores. Tu plata, adentro.',
            stats: { mana: 1, fama: -3 },
            guita: -2_000_000,
          },
          critico_fracaso: {
            texto:
              'El fideicomiso era una estafa armada para juntar plata de gente como vos, ' +
              'que justamente no puede ir a denunciar nada.',
            stats: { mana: -4, fama: -6 },
            guita: -3_000_000,
            flags: ['desastre', 'deuda'],
          },
        },
      },
      {
        texto: 'Entrar chico y usar el contacto para otra cosa',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.6,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Pusiste poco y te quedaste con lo que valía: los teléfonos. ' +
              'Ahora conocés a los que deciden dónde se construye antes de que se anuncie.',
            stats: { mana: 8, fama: 5, atencion: -6 },
            guita: 900_000,
            movidas: 1,
          },
          exito: {
            texto: 'Entrada chica, contactos grandes. Buen intercambio.',
            stats: { mana: 5, fama: 3 },
            guita: -300_000,
          },
          exito_con_costo: {
            texto: 'Los contactos quedaron, pero te trataron de chico toda la reunión.',
            stats: { mana: 3, fama: -3 },
            guita: -500_000,
          },
          fracaso: {
            texto: 'Pusiste poco, te trataron como a alguien que puso poco y no te llamaron más.',
            stats: { fama: -4 },
            guita: -400_000,
          },
          critico_fracaso: {
            texto:
              'Entraste chico a una mesa grande y quedaste de garante de algo que no leíste. ' +
              'Cuando se cayó, el único nombre disponible era el tuyo.',
            stats: { atencion: 20, fama: -6, mana: -2 },
            guita: -1_400_000,
            flags: ['desastre', 'deuda'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// TERRITORIO Y CALLE
// ===========================================================================

const TERRITORIO = [
  {
    ...BASE,
    id: 'neg_ter_01',
    rubro: 'territorio',
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'Los pibes de la otra cuadra',
    texto:
      'Un grupo de siete u ocho pibes empezó a moverse en el borde de tu zona. Son jóvenes, ' +
      'son rápidos y no le tienen miedo a nada porque todavía no perdieron nada. ' +
      'O los absorbés o los sacás, pero dejarlos ahí no es una opción.',
    opciones: [
      {
        texto: 'Sumarlos y ponerles reglas',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.56,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'Los sentaste, les explicaste cómo se hace y les diste un lugar. ' +
              'Ahora tenés ocho tipos que se mueven rápido y te deben el primer sí de su vida.',
            stats: { calle: 10, fama: 5 },
            guita: 800_000,
            movidas: 2,
          },
          exito: {
            texto: 'Cinco de los ocho se sumaron. Los otros tres se fueron a otro barrio.',
            stats: { calle: 6, fama: 2 },
            guita: 350_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Se sumaron, pero son un desastre y te trajeron atención que no necesitabas.',
            stats: { calle: 4, atencion: 16 },
            guita: 150_000,
          },
          fracaso: {
            texto: 'Se rieron de la oferta. Ahora saben que preferís no pelear.',
            stats: { calle: -5, fama: -3 },
          },
          critico_fracaso: {
            texto:
              'Les diste lugar y en cuatro meses te estaban compitiendo con tu propia estructura. ' +
              'Les enseñaste todo lo que hacía falta para reemplazarte.',
            stats: { calle: -9, fama: -6 },
            guita: -800_000,
            flags: ['traicion'],
          },
        },
      },
      {
        texto: 'Hablar con el puntero del barrio para que los frene',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.55,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'El puntero les consiguió a tres un plan y a dos una changa municipal. ' +
              'El grupo se deshizo solo, sin un solo golpe, y vos no apareciste en ningún lado.',
            stats: { mana: 8, fama: 4, atencion: -8 },
            guita: -200_000,
          },
          exito: {
            texto: 'Movió un par de hilos y el grupo se corrió de zona. Costó unos pesos.',
            stats: { mana: 5, atencion: -4 },
            guita: -300_000,
          },
          exito_con_costo: {
            texto: 'Los frenó, y ahora el puntero considera que le debés una. Y te lo va a cobrar.',
            stats: { mana: 3, calle: -3 },
            guita: -400_000,
            flags: ['deuda'],
          },
          fracaso: {
            texto: 'El puntero cobró y no hizo nada. Los pibes siguen ahí.',
            stats: { mana: -1, fama: -3 },
            guita: -350_000,
          },
          critico_fracaso: {
            texto:
              'El puntero les avisó a los pibes que vos habías ido a pedir que los frenaran. ' +
              'Ahora sos el que no se anima a resolver sus propias cosas.',
            stats: { calle: -8, fama: -7 },
            guita: -300_000,
            flags: ['traicion'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_ter_02',
    rubro: 'territorio',
    categoria: 'venta',
    titulo: 'El peaje de la feria',
    texto:
      'La feria de los domingos mueve cientos de puestos y toda esa gente paga algo a alguien ' +
      'para poder poner la mesa. Ese alguien viene siendo el mismo hace años y está viejo. ' +
      'Podés quedarte con el peaje, o podés ofrecerles algo mejor y quedarte con la feria entera.',
    opciones: [
      {
        texto: 'Quedarte con el peaje y listo',
        riesgo: 'medio',
        esfuerzo_fisico: true,
        minijuego: null,
        prob_base: 0.6,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'Todos los domingos, sin falta, sin discusión. Es la renta más aburrida y más ' +
              'confiable que tuviste en tu vida.',
            stats: { calle: 8, fama: 3 },
            guita: 900_000,
            ventas: 2,
          },
          exito: {
            texto: 'Cobrás el peaje. Poca guita por puesto, muchos puestos.',
            stats: { calle: 5 },
            guita: 400_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Cobrás, pero la mitad se queja y algunos dejaron de venir.',
            stats: { calle: 3, fama: -3 },
            guita: 150_000,
          },
          fracaso: {
            texto: 'Se organizaron entre ellos y decidieron no pagarle a nadie.',
            stats: { calle: -5, fama: -3 },
          },
          critico_fracaso: {
            texto:
              'Los feriantes fueron a la comisaría todos juntos, con una nota firmada. ' +
              'Doscientas firmas con tu apodo escrito arriba.',
            stats: { calle: -6, atencion: 24, fama: -5 },
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Convertir la feria en un evento: música, prensa y tu nombre arriba',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.55,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Le pusiste escenario, bandas del barrio y un arco con tu apodo en la entrada. ' +
              'Triplicó la gente, los puestos facturan como nunca y todos saben de quién fue la idea.',
            stats: { fama: 15, calle: 5, mana: 3 },
            guita: 800_000,
            ventas: 2,
          },
          exito: {
            texto: 'Vino el doble de gente y tu nombre quedó pegado a algo que la gente quiere.',
            stats: { fama: 9, calle: 3 },
            guita: 300_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto:
              'Fue un éxito y también un quilombo: cortaste dos calles sin permiso ' +
              'y ahora el municipio sabe tu nombre.',
            stats: { fama: 8, atencion: 16 },
            guita: 100_000,
          },
          fracaso: {
            texto: 'Llovió, no vino nadie y los puestos perdieron el domingo por tu idea.',
            stats: { fama: -4, calle: -3 },
            guita: -500_000,
          },
          critico_fracaso: {
            texto:
              'Se armó en el medio del evento, con escenario, gente y celulares filmando. ' +
              'Tu apodo estaba en el arco de entrada, bien grande, en todas las tomas.',
            stats: { fama: -8, calle: -4, atencion: 24 },
            guita: -700_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Proveerles la mercadería y cobrar de ahí',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.58,
        negocio: 'comercio',
        resultados: {
          critico_exito: {
            texto:
              'Les conseguiste mercadería más barata de la que compraban y te quedaste con el ' +
              'margen de todos. Nadie te ve como el que cobra: te ven como el que los salvó.',
            stats: { mana: 9, fama: 5, calle: 3 },
            guita: 1_500_000,
            ventas: 3,
          },
          exito: {
            texto: 'Proveés a sesenta puestos. Buen volumen, cero quilombo.',
            stats: { mana: 6, fama: 2 },
            guita: 700_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto: 'Funciona, pero tenés la plata inmovilizada en stock todo el tiempo.',
            stats: { mana: 4 },
            guita: -200_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Compraste mal, la mercadería no se vendió y te quedaste con todo encima.',
            stats: { mana: 1, fama: -2 },
            guita: -700_000,
          },
          critico_fracaso: {
            texto:
              'La mercadería tenía problemas de origen y se los pasaste a sesenta puestos. ' +
              'Cuando cayó el control, cayeron todos y el proveedor eras vos.',
            stats: { atencion: 26, fama: -7, calle: -4 },
            guita: -1_200_000,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_ter_03',
    rubro: 'territorio',
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'La banda que se ofrece',
    texto:
      'Vino a verte gente de otra zona: son doce, tienen experiencia y se quedaron sin quien ' +
      'los organice. Ofrecen trabajar para vos con la única condición de que les banques ' +
      'los problemas. Doce tipos así son mucho poder y son mucho quilombo, en partes iguales.',
    opciones: [
      {
        texto: 'Tomarlos a todos y armar una estructura en serio',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'combate_prolongado',
        prob_base: 0.5,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'Doce tipos organizados y con reglas claras. En un año no había zona vecina ' +
              'que discutiera nada. Esto ya no es una banda: es una organización.',
            stats: { calle: 12, fama: 8, salud: -8 },
            guita: 2_000_000,
            movidas: 3,
          },
          exito: {
            texto: 'Los tomaste y funcionan. Cuesta darles de comer todos los meses, pero funcionan.',
            stats: { calle: 8, fama: 4, salud: -6 },
            guita: 800_000,
            movidas: 2,
          },
          exito_con_costo: {
            texto: 'Funcionan, pero se mandaron dos cagadas grandes y las tuviste que pagar vos.',
            stats: { calle: 5, atencion: 20, salud: -10 },
            guita: -600_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'Eran más problema que solución. En seis meses se te fueron casi todos.',
            stats: { calle: -4, fama: -3, salud: -10 },
            guita: -900_000,
          },
          critico_fracaso: {
            texto:
              'Traían una guerra vieja de su zona y te la metieron adentro de la tuya. ' +
              'Perdiste gente propia por un conflicto que ni siquiera era tuyo.',
            stats: { calle: -8, fama: -8, salud: -22, atencion: 20 },
            guita: -1_500_000,
            socio: -10,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Tomar tres y usarlos de cobradores nomás',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.6,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Tres tipos serios cobrando lo que te deben, y de golpe todos los incobrables ' +
              'resultaron ser muy cobrables. Recuperaste plata de hace años.',
            stats: { mana: 7, calle: 5 },
            guita: 1_600_000,
            movidas: 1,
          },
          exito: {
            texto: 'Tres cobradores y la cartera vencida bajó a la mitad.',
            stats: { mana: 5, calle: 3 },
            guita: 700_000,
          },
          exito_con_costo: {
            texto: 'Cobran bien, tal vez demasiado bien. Hubo dos denuncias.',
            stats: { calle: 3, atencion: 18 },
            guita: 400_000,
          },
          fracaso: {
            texto: 'Cobraron poco y se quedaron con parte de lo que cobraron.',
            stats: { mana: -2, calle: -2 },
            guita: -300_000,
          },
          critico_fracaso: {
            texto:
              'Se excedieron con un deudor que resultó tener familia con contactos. ' +
              'Ahora hay una causa penal y tres tipos que pueden hablar de vos.',
            stats: { atencion: 28, fama: -6, calle: -4 },
            guita: -800_000,
            flags: ['desastre', 'buchon'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_ter_04',
    rubro: 'territorio',
    categoria: null,
    titulo: 'El código viejo',
    texto:
      'Se armó una discusión en una mesa larga sobre cómo se hacen las cosas ahora. ' +
      'Los grandes dicen que antes había códigos; los nuevos dicen que los códigos eran ' +
      'para los que no podían ganar de otra manera. Los dos lados te miraron a vos.',
    opciones: [
      {
        texto: 'Bancar el código viejo, aunque cueste plata',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.6,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'Hablaste diez minutos y se hizo un silencio raro. Los viejos te adoptaron como ' +
              'a uno de ellos y los nuevos entendieron con quién no meterse.',
            stats: { calle: 10, fama: 5 },
            socio: 8,
            flags: ['palabra'],
          },
          exito: {
            texto: 'Te pusiste del lado de los códigos. Perdiste algún negocio y ganaste respeto.',
            stats: { calle: 6, fama: 2 },
            guita: -300_000,
            socio: 5,
          },
          exito_con_costo: {
            texto: 'Quedaste como un tipo derecho y como un tipo lento. Las dos cosas a la vez.',
            stats: { calle: 4, mana: -3 },
            guita: -500_000,
          },
          fracaso: {
            texto: 'Defendiste algo que ya no existe. Se rieron y siguieron con lo suyo.',
            stats: { fama: -4 },
          },
          critico_fracaso: {
            texto:
              'Defendiste el código y a la semana el que más lo defendía te pasó por encima. ' +
              'Quedaste como el último tipo que se creía el discurso.',
            stats: { calle: -6, fama: -6, mana: -3 },
            guita: -700_000,
            flags: ['traicion'],
          },
        },
      },
      {
        texto: 'Salir a hablar del tema donde te escuchen',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.55,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Contaste la discusión como una historia y se volvió viral. De golpe hay periodistas ' +
              'citando tus frases sobre "los códigos que se perdieron". Sos un personaje.',
            stats: { fama: 12, mana: 4 },
            guita: 400_000,
          },
          exito: {
            texto: 'Lo contaste bien y tu nombre circuló. Fama gratis.',
            stats: { fama: 8 },
          },
          exito_con_costo: {
            texto: 'Sonó bárbaro afuera y espantoso adentro: los de la mesa no querían prensa.',
            stats: { fama: 7, calle: -6 },
            socio: -6,
          },
          fracaso: {
            texto: 'Nadie lo levantó y encima quedó grabado que fuiste a contarlo.',
            stats: { fama: -3, calle: -4 },
          },
          critico_fracaso: {
            texto:
              'Contaste de más y se entendió perfecto de quiénes hablabas. ' +
              'Los nombraste sin nombrarlos delante de todo el mundo.',
            stats: { fama: -5, calle: -8, atencion: 18 },
            socio: -12,
            flags: ['buchon', 'traicion'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// POLÍTICA Y CONTACTOS
// ===========================================================================

const POLITICA = [
  {
    ...BASE,
    id: 'neg_pol_01',
    rubro: 'politica',
    categoria: null,
    titulo: 'El puntero te quiere de socio',
    texto:
      'El puntero de la zona maneja tres comedores, dos planes y la lista de quién cobra qué. ' +
      'Te propuso algo simple: vos ponés la plata para que la estructura funcione, ' +
      'él pone la estructura. En época de elecciones eso se transforma en otra cosa.',
    opciones: [
      {
        texto: 'Entrar de socio y financiar la estructura',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.56,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Financiaste todo y ganaron. Ahora tenés un concejal que atiende el teléfono ' +
              'a la primera y una zona donde nadie te va a molestar nunca.',
            stats: { fama: 8, mana: 6, atencion: -20 },
            guita: -1_000_000,
          },
          exito: {
            texto: 'Entraste. Los comedores funcionan, la gente te conoce, la policía menos.',
            stats: { fama: 5, mana: 3, atencion: -10 },
            guita: -600_000,
          },
          exito_con_costo: {
            texto: 'Funciona, pero ahora estás atado a que a él le vaya bien.',
            stats: { fama: 3, mana: 2 },
            guita: -900_000,
          },
          fracaso: {
            texto: 'Pusiste plata en una campaña que salió cuarta. Adiós inversión.',
            stats: { fama: -3 },
            guita: -1_000_000,
          },
          critico_fracaso: {
            texto:
              'Perdieron, y el que ganó llegó con la lista de quién había financiado a quién. ' +
              'Estás del lado equivocado de una lista que existe.',
            stats: { atencion: 24, fama: -5 },
            guita: -1_200_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Decirle que no y quedarte con lo tuyo',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.6,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'Le dijiste que no con respeto y sin cerrar la puerta. Seguís manejando lo tuyo ' +
              'sin deberle nada a nadie, que a esta altura es un lujo.',
            stats: { calle: 7, mana: 5 },
            guita: 300_000,
          },
          exito: {
            texto: 'Que no. Sin drama, sin enemistad, sin sociedad.',
            stats: { calle: 4, mana: 2 },
          },
          exito_con_costo: {
            texto: 'Le dijiste que no y se ofendió. Ahora los trámites de la zona tardan el doble.',
            stats: { calle: 3, atencion: 8 },
          },
          fracaso: {
            texto: 'Le dijiste que no y se lo propuso a otro, que aceptó. Ahora tenés competencia con respaldo.',
            stats: { calle: -3, fama: -3 },
          },
          critico_fracaso: {
            texto:
              'Le dijiste que no y se lo tomó personal. Empezaron los controles, las inspecciones ' +
              'y las visitas. Todo legal, todo dirigido a vos.',
            stats: { atencion: 26, calle: -4 },
            guita: -900_000,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_pol_02',
    rubro: 'politica',
    categoria: 'movida',
    titulo: 'La licitación municipal',
    texto:
      'Sale a licitación la recolección de residuos de tres barrios. Es plata pública, ' +
      'es todos los meses y es por cinco años. Te avisaron con tiempo, que es la parte importante: ' +
      'alguien quiere que te presentes y ese alguien espera algo a cambio.',
    opciones: [
      {
        texto: 'Presentarte y arreglar lo que haya que arreglar',
        riesgo: 'alto',
        minijuego: null,
        prob_base: 0.5,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Ganaste la licitación. Facturás al municipio todos los meses, con sello y ' +
              'expediente. Es la plata más limpia y más segura que viste en tu vida.',
            stats: { mana: 9, fama: 8, atencion: -18 },
            guita: 3_500_000,
            movidas: 3,
          },
          exito: {
            texto: 'La ganaste. Menos margen del esperado, pero es plata del Estado todos los meses.',
            stats: { mana: 6, fama: 5, atencion: -10 },
            guita: 1_800_000,
            movidas: 2,
          },
          exito_con_costo: {
            texto: 'La ganaste pagando tanto por adentro que el primer año trabajás gratis.',
            stats: { mana: 4, fama: 3 },
            guita: -400_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'Pagaste el arreglo y la licitación se la llevó otro igual.',
            stats: { fama: -3, mana: -2 },
            guita: -1_200_000,
          },
          critico_fracaso: {
            texto:
              'Se cayó la licitación entera por una denuncia y quedaron a la vista todos los ' +
              'arreglos. Tu empresa figura primera en la nota del diario.',
            stats: { atencion: 32, fama: -8 },
            guita: -1_500_000,
            flags: ['desastre', 'buchon'],
          },
        },
      },
      {
        texto: 'Presentarte y hacer ruido: que se sepa que competís',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.5,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Saliste en los medios locales prometiendo barrios limpios y camiones nuevos. ' +
              'Te la dieron porque bajarte hubiera sido más caro políticamente que dártela.',
            stats: { fama: 14, mana: 4, atencion: -8 },
            guita: 2_200_000,
            movidas: 2,
          },
          exito: {
            texto:
              'Hiciste ruido, te conocieron y te dieron un tramo para que te callaras. ' +
              'Funcionó igual.',
            stats: { fama: 9, mana: 2 },
            guita: 800_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto:
              'Te dieron el tramo y también te pusieron la lupa: ahora sos un proveedor ' +
              'del Estado con antecedentes y eso lo revisa cualquiera.',
            stats: { fama: 7, atencion: 20 },
            guita: 400_000,
          },
          fracaso: {
            texto: 'Hiciste ruido, no ganaste nada y quedaste como el que grita desde afuera.',
            stats: { fama: -3 },
            guita: -300_000,
          },
          critico_fracaso: {
            texto:
              'Hiciste tanto ruido que un periodista se puso a investigar de dónde salía ' +
              'tu empresa. Lo que publicó no hablaba de residuos.',
            stats: { fama: -7, atencion: 30 },
            guita: -600_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Presentarte limpio, sin arreglar nada',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.4,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Presentaste la mejor oferta técnica y ganaste sin pagarle a nadie. ' +
              'Nadie lo puede creer, vos tampoco, y no le debés nada a ninguno.',
            stats: { mana: 12, fama: 7, atencion: -16 },
            guita: 2_800_000,
            movidas: 2,
            flags: ['palabra'],
          },
          exito: {
            texto: 'Quedaste segundo y te dieron un tramo. Chico pero legítimo.',
            stats: { mana: 7, fama: 3, atencion: -8 },
            guita: 900_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'No ganaste, pero la carpeta que armaste te sirve para todo lo que venga.',
            stats: { mana: 5 },
            guita: -300_000,
          },
          fracaso: {
            texto: 'Perdiste contra el que sí arregló. Aprendiste cómo funciona.',
            stats: { mana: 2, fama: -2 },
            guita: -400_000,
          },
          critico_fracaso: {
            texto:
              'Te descalificaron por un requisito que nadie te avisó y encima quedó registrado ' +
              'que te presentaste. Ahora saben que tenés una empresa y qué factura.',
            stats: { atencion: 16, fama: -4, mana: -2 },
            guita: -600_000,
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_pol_03',
    rubro: 'politica',
    categoria: null,
    titulo: 'El comisario nuevo',
    texto:
      'Cambiaron al comisario de la seccional. El anterior tenía un acuerdo con vos de años; ' +
      'este llegó de otra provincia, no conoce a nadie y todavía no sabés de qué lado juega. ' +
      'La primera conversación define los próximos tres años.',
    opciones: [
      {
        texto: 'Ir vos mismo a presentarte y ofrecer arreglo',
        riesgo: 'alto',
        minijuego: null,
        prob_base: 0.5,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Fuiste solo, hablaste claro y salió mejor que con el anterior. ' +
              'Ahora tenés a la seccional entera avisándote antes que a nadie.',
            stats: { mana: 8, calle: 5, atencion: -24 },
            guita: -600_000,
          },
          exito: {
            texto: 'Arreglaron. Un número por mes y ninguna sorpresa.',
            stats: { mana: 5, atencion: -14 },
            guita: -400_000,
          },
          exito_con_costo: {
            texto: 'Arreglaste, carísimo, y con la sensación de que te está midiendo.',
            stats: { mana: 3, atencion: -6 },
            guita: -1_000_000,
          },
          fracaso: {
            texto: 'Te escuchó, no dijo que sí ni que no, y no te atendió más el teléfono.',
            stats: { atencion: 10 },
            guita: -200_000,
          },
          critico_fracaso: {
            texto:
              'Vino a hacer carrera y vos le serviste de trampolín: grabó todo, ' +
              'lo presentó y salió en el diario como el comisario que no se vende.',
            stats: { atencion: 34, fama: -7 },
            guita: -400_000,
            flags: ['desastre', 'buchon'],
          },
        },
      },
      {
        texto: 'No moverte y que la zona hable por vos',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.54,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'No fuiste a ningún lado. En tres semanas él ya sabía quién sos, cuánta gente ' +
              'te responde y por qué le conviene no molestarte. Nunca hablaron.',
            stats: { calle: 9, mana: 5, atencion: -12 },
          },
          exito: {
            texto: 'Se acomodó solo a cómo funcionan las cosas acá. No hizo falta nada.',
            stats: { calle: 5, atencion: -6 },
          },
          exito_con_costo: {
            texto: 'Se acomodó, pero mientras tanto hubo tres meses de controles molestos.',
            stats: { calle: 3, atencion: 8 },
            guita: -400_000,
          },
          fracaso: {
            texto: 'Interpretó tu silencio como debilidad y empezó a apretar.',
            stats: { atencion: 18, calle: -3 },
            guita: -600_000,
          },
          critico_fracaso: {
            texto:
              'Mientras vos esperabas, otro fue a hablar primero y le contó de vos ' +
              'con lujo de detalles. Llegaste último a tu propia negociación.',
            stats: { atencion: 28, calle: -6, fama: -4 },
            guita: -800_000,
            flags: ['buchon', 'desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_pol_04',
    rubro: 'politica',
    edad_min: 30,
    categoria: null,
    titulo: 'Te ofrecen un lugar en la lista',
    texto:
      'Te lo dijeron medio en joda y medio en serio: hay un lugar en la lista de concejales ' +
      'para alguien que "conozca el territorio". Fueros, despacho, sueldo y una foto en la ' +
      'boleta. También significa que todo lo tuyo pasa a ser de interés público.',
    opciones: [
      {
        texto: 'Aceptar. Ser el que firma, no el que pide',
        riesgo: 'extremo',
        minijuego: null,
        prob_base: 0.42,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Entraste. Fueros, despacho y un cartel con tu nombre en la puerta. ' +
              'El pibe que vendía en la esquina ahora vota ordenanzas. Nadie lo puede creer.',
            stats: { fama: 14, mana: 8, atencion: -30 },
            guita: 2_000_000,
            hijo: 8,
          },
          exito: {
            texto: 'Entraste raspando por el último lugar de la lista. Pero entraste.',
            stats: { fama: 9, mana: 5, atencion: -18 },
            guita: 700_000,
            hijo: 5,
          },
          exito_con_costo: {
            texto:
              'Entraste, y con la banca vino el escrutinio: hay periodistas revisando de dónde salió todo.',
            stats: { fama: 8, atencion: 14 },
            guita: 300_000,
          },
          fracaso: {
            texto: 'La lista no llegó al piso. Gastaste una fortuna en una campaña para nada.',
            stats: { fama: -4 },
            guita: -1_800_000,
          },
          critico_fracaso: {
            texto:
              'Te usaron para juntar votos en la zona y te bajaron de la lista a último momento. ' +
              'Quedaste expuesto, sin banca y con todo tu patrimonio a la vista.',
            stats: { atencion: 34, fama: -8, mana: -3 },
            guita: -2_200_000,
            flags: ['traicion', 'desastre'],
          },
        },
      },
      {
        texto: 'Que vaya otro y vos ponés la plata',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.58,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Pusiste a alguien de confianza en la banca y vos quedaste afuera de todo papel. ' +
              'Tenés el poder sin tener la exposición, que es como se hace de verdad.',
            stats: { mana: 11, fama: 4, atencion: -20 },
            guita: -900_000,
          },
          exito: {
            texto: 'Tu candidato entró. Te atiende el teléfono siempre.',
            stats: { mana: 7, atencion: -10 },
            guita: -700_000,
          },
          exito_con_costo: {
            texto: 'Entró y a los seis meses empezó a creerse el personaje.',
            stats: { mana: 4, fama: -2 },
            guita: -1_100_000,
          },
          fracaso: {
            texto: 'Tu candidato no entró y encima te quedaste sin la plata de la campaña.',
            stats: { mana: 1 },
            guita: -1_200_000,
          },
          critico_fracaso: {
            texto:
              'Entró, y a los dos meses te dio la espalda en público para despegarse de vos. ' +
              'Financiaste al tipo que ahora te usa de ejemplo de lo que hay que combatir.',
            stats: { fama: -8, mana: -3, atencion: 20 },
            guita: -1_500_000,
            flags: ['traicion', 'desastre'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// FARÁNDULA Y FAMA
// ===========================================================================
// Estos priorizan Fama por encima de todo lo demás: son el camino en el que el
// nombre propio vale más que la mercadería, la zona o los contactos.

const FARANDULA = [
  {
    ...BASE,
    id: 'neg_far_01',
    rubro: 'farandula',
    categoria: 'venta',
    titulo: (c) => `${c.streamer?.handle ?? 'Un streamer'} te quiere de sponsor`,
    // Ojo: nada de cortar `streamer.desc` por la primera coma. Esas
    // descripciones tienen comillas adentro y el corte las dejaba sin cerrar
    // ("...saltó con la frase "yo tengo US$35.000 para apostar.").
    texto: (c) =>
      `Te escribió ${c.streamer?.handle ?? 'un streamer de apuestas'}, ese que llena el chat ` +
      'todas las noches y del que se habla más por los papelones que por lo que juega. ' +
      'Quiere que le auspicies los directos: tu marca en el overlay, menciones cada media hora ' +
      'y treinta mil personas mirando. Pide una cifra que duele y promete un alcance que no se compra.',
    opciones: [
      {
        texto: 'Poner la guita y salir en pantalla',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.58,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Explotó. Tu nombre salió en todos los clips de la semana y de golpe te escriben ' +
              'marcas, productoras y gente que jamás te hubiera atendido el teléfono.',
            stats: { fama: 16, mana: 3 },
            guita: 1_200_000,
            ventas: 3,
          },
          exito: {
            texto: 'Funcionó bien. Tu nombre circula en un ambiente que antes no te conocía.',
            stats: { fama: 10 },
            guita: 400_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto:
              'Te vio muchísima gente, incluida la que no querías que te viera. ' +
              'Aparecer en pantalla es aparecer para todos.',
            stats: { fama: 9, atencion: 20 },
            guita: 200_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Pagaste tres meses y el canal se cayó a la mitad de audiencia justo ese mes.',
            stats: { fama: -2 },
            guita: -800_000,
          },
          critico_fracaso: {
            texto:
              'Se mandó una barbaridad al aire con tu logo arriba a la izquierda. ' +
              'Tu marca quedó pegada a un escándalo que no era tuyo y no se despega más.',
            stats: { fama: -9, atencion: 18 },
            guita: -1_000_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Ofrecerle mercadería en canje en vez de plata',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.6,
        negocio: 'comercio',
        resultados: {
          critico_exito: {
            texto:
              'Canje puro: le mandás producto, él lo muestra, todos contentos y vos no pusiste ' +
              'un peso. Encima se volvió cliente y ahora te compra de verdad.',
            stats: { mana: 8, fama: 6 },
            guita: 600_000,
            ventas: 2,
          },
          exito: {
            texto: 'Aceptó el canje. Publicidad gratis a cambio de stock parado.',
            stats: { mana: 5, fama: 4 },
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Aceptó, mostró todo una vez y no volvió a mencionarlo nunca más.',
            stats: { mana: 2, fama: 1 },
            guita: -200_000,
          },
          fracaso: {
            texto: 'Se ofendió con la oferta y lo comentó al aire. Con nombre.',
            stats: { fama: -5 },
          },
          critico_fracaso: {
            texto:
              'Agarró el canje, no mostró nada y arriba salió a decir que le habías mandado ' +
              'basura. Perdiste el stock y ganaste un enemigo con público.',
            stats: { fama: -8, mana: -2 },
            guita: -500_000,
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_far_02',
    rubro: 'farandula',
    categoria: null,
    titulo: 'El programa de espectáculos quiere una nota',
    texto:
      'Un programa de chimentos de la tarde te quiere en vivo. No para hablar de nada en ' +
      'particular: te quieren a vos, el personaje, el tipo del que se habla. ' +
      'Es una hora de aire nacional y es una hora de preguntas que no vas a poder elegir.',
    opciones: [
      {
        texto: 'Ir y bancarse las preguntas',
        riesgo: 'alto',
        minijuego: 'perderla_de_vista',
        prob_base: 0.5,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Los cruzaste a todos con una calma que no esperaban y te fuiste aplaudido ' +
              'por el propio panel. Al otro día te llamaron de tres programas más.',
            stats: { fama: 18, mana: 6 },
            guita: 500_000,
          },
          exito: {
            texto: 'Saliste bien parado. Te vio muchísima gente y no dijiste nada de más.',
            stats: { fama: 12, mana: 2 },
            guita: 200_000,
          },
          exito_con_costo: {
            texto:
              'Saliste bien, pero una frase tuya quedó dando vueltas fuera de contexto ' +
              'y la van a repetir por años.',
            stats: { fama: 10, atencion: 16 },
          },
          fracaso: {
            texto: 'Te acorralaron con una pregunta y se te notó. Ese clip circuló solo.',
            stats: { fama: -4, atencion: 10 },
          },
          critico_fracaso: {
            texto:
              'Te sacaron de las casillas en vivo y dijiste cosas que un fiscal escuchó con ' +
              'mucha atención. Una hora de aire nacional para incriminarte gratis.',
            stats: { fama: -6, atencion: 32 },
            flags: ['desastre', 'buchon'],
          },
        },
      },
      {
        texto: 'Mandar a alguien que hable por vos',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.6,
        negocio: 'politica',
        resultados: {
          critico_exito: {
            texto:
              'Mandaste a un abogado con labia que dijo mucho sin decir nada y quedó todo ' +
              'prolijo. Tu nombre circuló y tu cara no.',
            stats: { fama: 8, mana: 8, atencion: -8 },
            guita: -300_000,
          },
          exito: {
            texto: 'Habló tu vocero. Menos impacto, cero riesgo.',
            stats: { fama: 5, mana: 4 },
            guita: -200_000,
          },
          exito_con_costo: {
            texto: 'Lo trataron de títere toda la nota y quedó claro que vos no diste la cara.',
            stats: { fama: 2, calle: -4 },
            guita: -300_000,
          },
          fracaso: {
            texto: 'Tu vocero se comió todas las preguntas y quedó peor que si no ibas nadie.',
            stats: { fama: -4 },
            guita: -300_000,
          },
          critico_fracaso: {
            texto:
              'El que mandaste se puso nervioso y para zafar empezó a dar detalles. ' +
              'Contó en vivo cosas que ni tu socio sabía.',
            stats: { fama: -7, atencion: 28 },
            socio: -10,
            flags: ['buchon', 'desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_far_03',
    rubro: 'farandula',
    categoria: 'movida',
    titulo: 'Auspiciar al club del barrio',
    texto:
      'El club donde jugaste de pibe está fundido y no llega a pagar la inscripción de la liga. ' +
      'Podés poner tu nombre en la camiseta de todas las divisiones. ' +
      'Es plata que no vuelve y es tu apodo corriendo por una cancha todos los domingos.',
    opciones: [
      {
        texto: 'Poner el nombre en la camiseta',
        riesgo: 'nulo',
        minijuego: null,
        prob_base: 0.7,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Salieron campeones con tu apodo en el pecho y la foto salió en el diario local. ' +
              'En ese barrio ya no sos un tipo del que se habla: sos el que puso la plata.',
            stats: { fama: 14, calle: 6 },
            guita: -600_000,
            hijo: 8,
            socio: 6,
            flags: ['palabra'],
          },
          exito: {
            texto: 'Tu nombre en cuarenta camisetas todos los domingos. Barato para lo que rinde.',
            stats: { fama: 9, calle: 3 },
            guita: -400_000,
            hijo: 4,
          },
          exito_con_costo: {
            texto:
              'Buenísimo para tu nombre y pésimo para tu perfil: ahora sos identificable ' +
              'para cualquiera que mire una foto del equipo.',
            stats: { fama: 8, atencion: 14 },
            guita: -400_000,
          },
          fracaso: {
            texto: 'Pusiste la plata, el club se fue al descenso y algunos dicen que trajiste mufa.',
            stats: { fama: -2 },
            guita: -500_000,
          },
          critico_fracaso: {
            texto:
              'Se armó un quilombo grande en una final, con la camiseta de tu marca en todas ' +
              'las imágenes. Tu apodo quedó pegado a una batalla campal en horario central.',
            stats: { fama: -7, atencion: 24 },
            guita: -600_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Ponerte al frente de la comisión directiva',
        riesgo: 'medio',
        minijuego: null,
        prob_base: 0.55,
        negocio: 'territorio',
        resultados: {
          critico_exito: {
            texto:
              'Presidente del club. Manejás el predio, la cantina, los alquileres de la cancha ' +
              'y a quinientas familias que pasan por ahí todas las semanas.',
            stats: { calle: 10, fama: 8, mana: 4 },
            guita: 700_000,
            movidas: 2,
          },
          exito: {
            texto: 'Entraste a la comisión. El club funciona y vos manejás lo que pasa adentro.',
            stats: { calle: 6, fama: 4 },
            guita: 200_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Entraste y te comió el tiempo: reuniones, balances y padres quejándose.',
            stats: { calle: 4, salud: -6 },
            guita: -400_000,
          },
          fracaso: {
            texto: 'La comisión vieja se resistió y quedaste afuera después de tres asambleas.',
            stats: { fama: -4, calle: -2 },
            guita: -300_000,
          },
          critico_fracaso: {
            texto:
              'Entraste y a los ocho meses faltaba plata de la cantina. No fuiste vos, ' +
              'pero el presidente eras vos y el barrio no distingue.',
            stats: { fama: -9, calle: -7, atencion: 12 },
            guita: -700_000,
            hijo: -5,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    ...BASE,
    id: 'neg_far_04',
    rubro: 'farandula',
    edad_min: 28,
    categoria: null,
    titulo: 'Quieren hacer un documental sobre vos',
    texto:
      'Una plataforma quiere una serie documental de tres capítulos: tu barrio, tu historia, ' +
      'tu ascenso. Pagan bien y prometen "mirada respetuosa". ' +
      'También significa cámaras filmando lugares y caras que nunca fueron filmadas.',
    opciones: [
      {
        texto: 'Hacerlo. Que la historia la cuentes vos',
        riesgo: 'extremo',
        minijuego: null,
        prob_base: 0.45,
        negocio: 'farandula',
        resultados: {
          critico_exito: {
            texto:
              'Salió hermoso y lo vio medio país. Manejaste cada plano y cada nombre. ' +
              'Ahora sos un personaje público y nadie puede contar tu historia sin tu versión.',
            stats: { fama: 22, mana: 5 },
            guita: 3_000_000,
            hijo: 6,
          },
          exito: {
            texto: 'Se estrenó y funcionó. Cobraste bien y saliste bien parado.',
            stats: { fama: 14 },
            guita: 1_500_000,
          },
          exito_con_costo: {
            texto:
              'Quedó bien, pero editaron tres minutos que no deberían haber existido ' +
              'y hay gente del barrio que quedó identificable.',
            stats: { fama: 12, calle: -6, atencion: 20 },
            guita: 1_000_000,
            socio: -8,
          },
          fracaso: {
            texto: 'Lo estrenaron sin ruido y nadie lo vio. Filmaron tu vida para nada.',
            stats: { fama: -2, atencion: 10 },
            guita: 300_000,
          },
          critico_fracaso: {
            texto:
              'El documental terminó siendo material probatorio. Contaste, filmado y con fecha, ' +
              'cosas que ninguna causa había podido demostrar en veinte años.',
            stats: { fama: 6, atencion: 40, calle: -8 },
            guita: 800_000,
            socio: -15,
            flags: ['desastre', 'buchon'],
          },
        },
      },
      {
        texto: 'Cobrar por los derechos y no aparecer',
        riesgo: 'bajo',
        minijuego: null,
        prob_base: 0.62,
        negocio: 'finanzas',
        resultados: {
          critico_exito: {
            texto:
              'Vendiste los derechos, pusiste un actor en tu lugar y cobraste igual. ' +
              'Todos hablan de la serie y nadie tiene una foto tuya reciente.',
            stats: { mana: 10, fama: 7, atencion: -10 },
            guita: 2_000_000,
          },
          exito: {
            texto: 'Cobraste los derechos y quedaste afuera de las cámaras. Buen negocio.',
            stats: { mana: 6, fama: 4 },
            guita: 1_200_000,
          },
          exito_con_costo: {
            texto: 'Cobraste, pero perdiste todo control sobre cómo te cuentan.',
            stats: { mana: 3, fama: -4 },
            guita: 900_000,
          },
          fracaso: {
            texto: 'Se cayó la producción después de firmar y cobraste una fracción.',
            stats: { fama: -2 },
            guita: 200_000,
          },
          critico_fracaso: {
            texto:
              'Vendiste los derechos y lo que hicieron fue una carnicería: te pintaron de ' +
              'monstruo durante tres capítulos y ya no hay derecho a réplica que valga.',
            stats: { fama: -12, calle: -5, atencion: 22 },
            guita: 600_000,
            hijo: -10,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
];

export const EVENTOS_NEGOCIOS = [
  ...COMERCIO,
  ...FINANZAS,
  ...TERRITORIO,
  ...POLITICA,
  ...FARANDULA,
];
