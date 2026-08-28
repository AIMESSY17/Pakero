import { formatearGuita } from '../../core/constants.js';

/**
 * Eventos especiales: los que el motor programa en vez de sortear.
 *
 * Se distinguen del pool normal por el campo `especial`, que le dice al motor
 * cuando corresponden. Por lo demas son eventos de decision comunes (ver
 * SCHEMA.md): mismos cinco grados, misma tirada, mismo panel.
 *
 * Lo unico que agregan es `efecto` en la opcion, que se aplica salga como
 * salga la tirada. Es lo que permite que la bifurcacion de los 18 defina el
 * camino sin que el azar decida por vos: el azar define COMO arrancas, no
 * PARA DONDE.
 *
 *   especial: 'bifurcacion'     — a los 18, una sola vez
 *   especial: 'segunda_chance'  — 25-30, solo si venis por la calle
 *   especial: 'hijo'            — 28-30, una sola vez
 *   especial: 'socio_*'         — los tres momentos del arco del socio
 *   especial: 'bisagra'         — cada 5 años
 *   especial: 'bisagra_terr'    — bisagra cuando el hito de Territorio esta cerca
 */

// ===========================================================================
// La bifurcacion de los 18
// ===========================================================================

const BIFURCACION = [
  {
    id: 'esp_bifurcacion_18',
    especial: 'bifurcacion',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 18,
    edad_max: 18,
    titulo: 'Se terminó el secundario',
    texto:
      'Te dieron el papel y en la fiesta todos preguntaban lo mismo. Tu vieja dejó el folleto de la ' +
      'facultad arriba de la mesa sin decir nada. En la esquina te están esperando desde hace rato ' +
      'para arrancar en serio. Los dos caminos salen del mismo lugar y no vuelven a cruzarse igual.',
    opciones: [
      {
        texto: 'Anotarte. Total, el papel no muerde',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        // Baja a proposito: la que la levanta es la cabeza que hiciste en el
        // secundario (`usaEstudio`), no el numero pelado.
        prob_base: 0.3,
        usaEstudio: true,
        efecto: { camino: 'estudiar' },
        resultados: {
          critico_exito: {
            texto:
              'Entraste con el ingreso aprobado de una y una beca chica que ni sabías que existía. ' +
              'La primera semana ya te estaban preguntando cosas a vos.',
            stats: { mana: 8, fama: 3 },
            guita: 60_000,
            flags: ['palabra'],
          },
          exito: {
            texto:
              'Entraste. Vas a cursar de noche y a laburar de día, como media facultad. ' +
              'Nadie del barrio entendió mucho pero tampoco te bardearon.',
            stats: { mana: 6, atencion: -4 },
          },
          exito_con_costo: {
            texto:
              'Entraste raspando y con dos materias del secundario colgadas que hay que rendir aparte. ' +
              'Vas a llegar tarde a todos lados durante un año.',
            stats: { mana: 4, salud: -5, calle: -3 },
          },
          fracaso: {
            texto:
              'No te dio el ingreso. Te anotaste igual en el curso de verano, que es la versión larga ' +
              'de lo mismo. Arrancás un año atrasado y con la cara larga.',
            stats: { mana: 2, fama: -3 },
          },
          critico_fracaso: {
            texto:
              'No entraste, perdiste la inscripción por un papel que faltaba y encima te enteraste tarde. ' +
              'Vas a estudiar igual, pero pateando la puerta desde afuera.',
            stats: { mana: 1, fama: -4, salud: -4 },
          },
        },
      },
      {
        texto: 'A la calle. Ahí sabés cómo se juega',
        riesgo: 'medio',
        esfuerzo_fisico: true,
        minijuego: null,
        prob_base: 0.62,
        efecto: { camino: 'calle' },
        resultados: {
          critico_exito: {
            texto:
              'Arrancaste y en tres meses ya tenías gente moviéndose para vos. ' +
              'Los que se anotaron en la facultad todavía están haciendo la fila del ingreso.',
            stats: { calle: 8, fama: 5 },
            guita: 350_000,
            movidas: 1,
          },
          exito: {
            texto: 'Te metiste de lleno y entró plata desde el primer mes. Poca, pero tuya.',
            stats: { calle: 6, fama: 2 },
            guita: 150_000,
          },
          exito_con_costo: {
            texto:
              'Entraste bien pero pisaste un par de callos que no sabías que estaban ahí. ' +
              'Ahora andás mirando para atrás.',
            stats: { calle: 5, atencion: 8, salud: -6 },
            guita: 80_000,
          },
          fracaso: {
            texto:
              'Te dieron una punta que no era y perdiste seis meses en nada. ' +
              'Aprendiste a quién no hacerle caso, que es caro pero sirve.',
            stats: { calle: 2, mana: 2, fama: -2 },
          },
          critico_fracaso: {
            texto:
              'Arrancaste con el pie izquierdo: te limpiaron la primera mercadería y quedaste debiendo. ' +
              'Un debut para el olvido.',
            stats: { calle: 1, atencion: 10, salud: -10 },
            guita: -40_000,
            flags: ['deuda'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// Segunda chance: reconvertirse de grande (25-30)
// ===========================================================================

const SEGUNDA_CHANCE = [
  {
    id: 'esp_segunda_chance',
    especial: 'segunda_chance',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 25,
    edad_max: 30,
    titulo: 'La puerta que quedó abierta',
    texto: (c) =>
      `Tenés ${c.edad} y llegó el mail de la facultad a la que nunca fuiste: reabrieron las ` +
      'inscripciones para gente grande, cursada corta, título igual. ' +
      'Sacar la cabeza de donde la tenés metida no es gratis: hay que soltar negocios, pagar gente ' +
      `que cubra tu lugar y bancar el bardo. La cuenta da ${formatearGuita(c.costoReconversion)}. ` +
      'Cuanto más adentro estás, más cara sale la salida.',
    opciones: [
      {
        texto: (c) => `Pagar los ${formatearGuita(c.costoReconversion)} y anotarte`,
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.55,
        usaEstudio: true,
        efecto: { reconversion: true },
        resultados: {
          critico_exito: {
            texto:
              'Pagaste, cerraste todo prolijo y arrancaste. A los dos meses ya usabas lo que aprendías ' +
              'para ordenar tus propios números. Casi nadie se dio cuenta de que te fuiste.',
            stats: { mana: 10, fama: 4, atencion: -8 },
            socio: 5,
            flags: ['palabra'],
          },
          exito: {
            texto:
              'Pagaste y arrancaste. Vas a cursar mientras el negocio camina solo, que es la parte ' +
              'difícil, pero al menos ya estás adentro.',
            stats: { mana: 7, atencion: -5 },
          },
          exito_con_costo: {
            texto:
              'Pagaste y entraste, pero mientras no mirabas se te fue clientela a la competencia. ' +
              'La cursada la tenés; el terreno hay que recuperarlo.',
            stats: { mana: 5, calle: -6, fama: -3 },
          },
          fracaso: {
            texto:
              'Pagaste y no llegaste a nada: entre una cosa y otra abandonaste antes del primer parcial. ' +
              'La plata no vuelve y la sensación tampoco.',
            stats: { mana: 2, fama: -4 },
          },
          critico_fracaso: {
            texto:
              'Pagaste, abandonaste, y encima el que te cubría el lugar se acostumbró a estar ahí. ' +
              'Volviste a una mesa donde ya no te habían guardado la silla.',
            stats: { mana: 1, calle: -8, fama: -6 },
            socio: -10,
            flags: ['traicion'],
          },
        },
      },
      {
        texto: 'Ni loco. Esta es la vida que elegiste',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.8,
        resultados: {
          critico_exito: {
            texto:
              'Borraste el mail y esa misma semana cerraste el mejor negocio del año. ' +
              'Algunos nacen para esto y vos lo sabías desde los doce.',
            stats: { calle: 6, fama: 4 },
            guita: 900_000,
            movidas: 1,
          },
          exito: {
            texto: 'Borraste el mail y seguiste. No te tembló el pulso ni un segundo.',
            stats: { calle: 4 },
            guita: 200_000,
          },
          exito_con_costo: {
            texto:
              'Borraste el mail, pero te quedó dando vueltas y estuviste dos semanas de mal humor. ' +
              'Se te notó en el trato y alguno lo pagó.',
            stats: { calle: 3, salud: -5 },
            socio: -4,
          },
          fracaso: {
            texto:
              'Dijiste que no y a los tres días te salió todo mal, como una cargada del destino. ' +
              'Nadie te lo va a decir en la cara pero lo pensaron todos.',
            stats: { fama: -3, salud: -6 },
          },
          critico_fracaso: {
            texto:
              'Dijiste que no en voz alta, delante de gente, y el mes siguiente fue el peor en años. ' +
              'Ahora la frase te la repiten cada vez que se cae algo.',
            stats: { fama: -6, calle: -3, salud: -8 },
            flags: ['desastre'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// El hijo (28-30)
// ===========================================================================

const HIJO = [
  {
    id: 'esp_hijo_nace',
    especial: 'hijo',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 28,
    edad_max: 30,
    titulo: 'Vas a ser padre',
    texto:
      'Te lo dijeron en la cocina, de parada, sin adornos. Te quedaste mirando la mesa un rato largo. ' +
      'Toda la vida escuchaste que un pibe te cambia la cabeza y siempre te pareció una frase de ' +
      'película. Ahora la frase tiene fecha.',
    opciones: [
      {
        texto: 'Ponerte al hombro todo: casa, cuna, lo que haga falta',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.62,
        efecto: { hijo: true },
        resultados: {
          critico_exito: {
            texto:
              'Alquilaste algo decente, armaste el cuarto vos mismo y llegaste a todas las ecografías. ' +
              'Cuando nació estabas ahí, con la campera puesta y la cara de nunca haber dormido.',
            stats: { salud: -4, mana: 4, calle: 2 },
            guita: -400_000,
            hijo: 12,
          },
          exito: {
            texto:
              'Pusiste la plata, pusiste el cuerpo y llegaste a tiempo. No fue perfecto pero estuviste.',
            stats: { mana: 2 },
            guita: -250_000,
            hijo: 8,
          },
          exito_con_costo: {
            texto:
              'Llegaste, pero para juntar la plata tuviste que meterte en una movida que no te gustaba. ' +
              'El pibe nació sano y vos con una causa nueva encima.',
            stats: { atencion: 10, salud: -6 },
            guita: -150_000,
            hijo: 5,
          },
          fracaso: {
            texto:
              'Te agarró todo junto: se cayó un negocio, no llegabas con la plata y te perdiste el parto ' +
              'por estar resolviendo. Te enteraste por teléfono.',
            stats: { fama: -2, salud: -5 },
            guita: -120_000,
            hijo: -6,
            flags: ['abandono'],
          },
          critico_fracaso: {
            texto:
              'Quisiste hacer todo bien y salió todo mal: prometiste lo que no tenías, pediste prestado ' +
              'a quien no debías y encima no estuviste. Empezaste debiendo de las dos maneras.',
            stats: { atencion: 8, fama: -4, salud: -8 },
            guita: -300_000,
            hijo: -12,
            flags: ['abandono', 'deuda'],
          },
        },
      },
      {
        texto: 'Bancarlo con plata, pero sin cambiar nada de tu vida',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.68,
        egoista: true,
        efecto: { hijo: true },
        resultados: {
          critico_exito: {
            texto:
              'Mandaste plata todos los meses, más de la que hacía falta, y seguiste con lo tuyo sin frenar. ' +
              'El año que viene fue el mejor de tu carrera. Del cuarto del pibe se encargó otro.',
            stats: { calle: 5, fama: 4 },
            guita: 600_000,
            movidas: 1,
            hijo: -2,
          },
          exito: {
            texto:
              'Mandaste lo que correspondía y apareciste los domingos. Nadie te reclamó nada en voz alta.',
            stats: { calle: 3 },
            guita: 200_000,
            hijo: -4,
          },
          exito_con_costo: {
            texto:
              'Cumpliste con la plata pero no apareciste ni para el nacimiento. ' +
              'Te lo hicieron saber de una manera que no vas a olvidar.',
            stats: { fama: -3 },
            hijo: -8,
            flags: ['abandono'],
          },
          fracaso: {
            texto:
              'Se te complicó la guita justo ese mes y no mandaste nada. Después mandaste el doble, ' +
              'pero el mes que faltó ya había pasado.',
            guita: -100_000,
            hijo: -10,
            flags: ['abandono'],
          },
          critico_fracaso: {
            texto:
              'Te borraste. Lo dijiste sin decirlo, dejando de atender el teléfono. ' +
              'En el barrio se enteraron antes que vos de lo que habías hecho.',
            stats: { calle: -6, fama: -6 },
            hijo: -18,
            socio: -8,
            flags: ['abandono', 'traicion'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// El arco del socio: tres momentos
// ===========================================================================

const SOCIO = [
  {
    id: 'esp_socio_presentacion',
    especial: 'socio_presentacion',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: false,
    edad_min: 19,
    edad_max: 24,
    titulo: (c) => `${c.socioNombre} te propone algo`,
    texto: (c) =>
      `${c.socioCompleto} viene del mismo lado que vos y hace rato que se cruzan sin hablar. ` +
      'Hoy te frenó en la esquina con un plan armado: él pone los contactos, vos ponés la cara y ' +
      'la calle. Dice que solo no llega y que con vos sí. Puede ser cierto o puede ser la primera ' +
      'movida de alguien que te está midiendo.',
    opciones: [
      {
        texto: 'Entrar a medias. Socios de verdad',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        efecto: { socio: 'presentacion' },
        resultados: {
          critico_exito: {
            texto:
              'Funcionó desde el primer día. Él trae, vos cerrás, y la plata se parte por la mitad ' +
              'sin que ninguno tenga que contar delante del otro.',
            stats: { calle: 5, mana: 4, fama: 3 },
            guita: 500_000,
            movidas: 1,
            socio: 15,
          },
          exito: {
            texto: 'Arrancaron bien. Nada espectacular, pero los dos cumplieron lo que dijeron.',
            stats: { calle: 3, mana: 2 },
            guita: 200_000,
            movidas: 1,
            socio: 10,
          },
          exito_con_costo: {
            texto:
              'Salió, pero hubo que poner el cuerpo más de lo hablado y el que lo puso fuiste vos. ' +
              'Él lo sabe y no dijo nada.',
            stats: { calle: 3, salud: -8 },
            guita: 120_000,
            movidas: 1,
            socio: 4,
          },
          fracaso: {
            texto:
              'La primera movida juntos se cayó por una pavada. Se miraron buscando de quién era la culpa ' +
              'y ninguno de los dos la agarró.',
            stats: { fama: -2 },
            socio: -5,
          },
          critico_fracaso: {
            texto:
              'Se cayó fea y encima quedaron debiendo los dos. Arrancar una sociedad debiendo plata ' +
              'es arrancarla ya torcida.',
            stats: { atencion: 8, fama: -3 },
            guita: -150_000,
            socio: -12,
            flags: ['deuda'],
          },
        },
      },
      {
        texto: 'Usarlo de contacto, pero manejar vos',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.66,
        egoista: true,
        efecto: { socio: 'presentacion' },
        resultados: {
          critico_exito: {
            texto:
              'Le sacaste los contactos, armaste todo por tu lado y te quedaste con la parte grande. ' +
              'Él te agradeció, que es lo más incómodo que pasó en el año.',
            stats: { mana: 6, calle: 3 },
            guita: 700_000,
            movidas: 1,
            socio: -6,
          },
          exito: {
            texto: 'Funcionó y ganaste más vos. Él no preguntó cuánto.',
            stats: { mana: 4 },
            guita: 350_000,
            movidas: 1,
            socio: -4,
          },
          exito_con_costo: {
            texto:
              'Ganaste más, pero se enteró de cuánto y no te lo dijo. Solo cambió el tono para siempre.',
            stats: { mana: 3, fama: -2 },
            guita: 200_000,
            movidas: 1,
            socio: -10,
          },
          fracaso: {
            texto:
              'Quisiste manejar todo y se te fue de las manos. Los contactos eran de él y se fueron con él.',
            stats: { mana: 1, fama: -3 },
            socio: -8,
          },
          critico_fracaso: {
            texto:
              'Se cayó todo y encima quedó clarísimo que lo habías querido correr. ' +
              'Te lo dijo delante de gente, tranquilo, y eso fue peor que si gritaba.',
            stats: { fama: -5, calle: -3 },
            guita: -100_000,
            socio: -18,
            flags: ['traicion'],
          },
        },
      },
    ],
  },

  // --- Momento 2: la prueba. Sale por lealtad, no por tirada. ---
  {
    id: 'esp_socio_prueba_leal',
    especial: 'socio_prueba',
    variante: 'leal',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 27,
    edad_max: 34,
    titulo: (c) => `${c.socioNombre} apareció`,
    texto: (c) =>
      'Se te vino todo encima en la misma semana: plata que no entra, gente que no atiende y un par ' +
      `de puertas que se cerraron sin aviso. ${c.socioCompleto} se enteró antes de que le contaras. ` +
      'Golpeó a las dos de la mañana con un bolso y una lista de nombres, y lo primero que dijo fue ' +
      '"esto lo arreglamos" en plural.',
    opciones: [
      {
        texto: 'Aceptar la mano y salir juntos a levantar todo',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'combate_prolongado',
        prob_base: 0.58,
        efecto: { socio: 'firme' },
        resultados: {
          critico_exito: {
            texto:
              'Salieron los dos y en diez días no quedaba nada roto. Después no lo hablaron nunca más, ' +
              'porque las cosas que se hacen así no se hablan.',
            stats: { calle: 8, fama: 6, salud: -6 },
            guita: 1_800_000,
            movidas: 2,
            socio: 12,
            flags: ['palabra'],
          },
          exito: {
            texto: 'Levantaron casi todo. Te quedaste con la deuda vieja y con un socio a prueba de balas.',
            stats: { calle: 5, fama: 3, salud: -8 },
            guita: 800_000,
            movidas: 1,
            socio: 10,
          },
          exito_con_costo: {
            texto:
              'Salieron adelante pero él se comió la peor parte y estuvo un mes sin poder caminar bien. ' +
              'Nunca te pasó factura, que es exactamente el problema.',
            stats: { calle: 4, salud: -12 },
            guita: 400_000,
            movidas: 1,
            socio: 8,
            hijo: -3,
          },
          fracaso: {
            texto:
              'No alcanzó. Perdieron los dos y quedaron peor que antes, pero al menos perdieron juntos.',
            stats: { calle: -3, salud: -14, fama: -3 },
            socio: 5,
          },
          critico_fracaso: {
            texto:
              'Fue un desastre completo. A él lo levantaron y a vos te dejaron mirando cómo se lo llevaban. ' +
              'Eso no se saca más de la cabeza.',
            stats: { atencion: 15, salud: -20, fama: -5 },
            socio: 3,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Agradecerle y arreglarlo solo, sin meterlo',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.5,
        efecto: { socio: 'firme' },
        resultados: {
          critico_exito: {
            texto:
              'Lo resolviste vos, sin quemar a nadie, y cuando él se enteró de cómo lo hiciste te miró ' +
              'distinto. Hay respeto que solo se gana no pidiendo ayuda.',
            stats: { mana: 8, calle: 4 },
            guita: 900_000,
            movidas: 1,
            socio: 8,
          },
          exito: {
            texto: 'Lo sacaste solo. Él se ofendió un poco y se le pasó a la semana.',
            stats: { mana: 5 },
            guita: 400_000,
            socio: 2,
          },
          exito_con_costo: {
            texto:
              'Lo sacaste solo pero te costó salud y guita, y encima él se enteró de que la pasaste mal ' +
              'sin llamarlo. Le dolió más eso que el bardo.',
            stats: { mana: 3, salud: -10 },
            guita: 100_000,
            socio: -5,
          },
          fracaso: {
            texto: 'No pudiste solo y para cuando lo llamaste ya era tarde para las dos cosas.',
            stats: { fama: -4, salud: -8 },
            guita: -200_000,
            socio: -8,
          },
          critico_fracaso: {
            texto:
              'Te hundiste solo por no pedir. Él se enteró por terceros y esa noche entendió qué lugar ' +
              'ocupaba realmente en tu vida.',
            stats: { fama: -6, salud: -15, atencion: 8 },
            socio: -15,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    id: 'esp_socio_prueba_traicion',
    especial: 'socio_prueba',
    variante: 'traicion',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 27,
    edad_max: 34,
    titulo: (c) => `${c.socioNombre} habló`,
    texto: (c) =>
      `Hace rato que ${c.socioNombre} venía poniendo cara de nada cada vez que vos cerrabas solo. ` +
      'Ahora aparecieron cosas que solamente él sabía: nombres, horarios, una cuenta que nadie más ' +
      'manejaba. No hay que ser muy vivo para atar los cabos y no hay ninguna versión de esto en la ' +
      'que él quede bien.',
    opciones: [
      {
        texto: 'Ir a buscarlo de frente y que lo diga en la cara',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'pelear',
        prob_base: 0.5,
        efecto: { socio: 'traiciono' },
        resultados: {
          critico_exito: {
            texto:
              'Lo encaraste solo, sin gente atrás, y largó todo. Se fue del barrio esa misma semana. ' +
              'El que lo escuchó cantar contó cómo lo hiciste y eso te blindó por años.',
            stats: { calle: 9, fama: 6, salud: -8 },
            movidas: 1,
            flags: ['zafada'],
          },
          exito: {
            texto: 'Lo encaraste, admitió lo que pudo y desapareció. Recuperaste parte de lo perdido.',
            stats: { calle: 6, fama: 3, salud: -10 },
            guita: 300_000,
          },
          exito_con_costo: {
            texto:
              'Lo encaraste y se armó de verdad. Terminaron los dos en el piso y vos con la policía ' +
              'preguntando por qué había tanta gente mirando.',
            stats: { calle: 4, atencion: 14, salud: -18 },
          },
          fracaso: {
            texto:
              'Lo fuiste a buscar y no estaba: se había ido antes con todo lo que pudo cargar. ' +
              'Quedaste hablando solo en la puerta de una casa vacía.',
            stats: { fama: -4, salud: -6 },
            guita: -500_000,
            flags: ['traicion'],
          },
          critico_fracaso: {
            texto:
              'Lo fuiste a buscar y te estaban esperando. Se ve que había contado más de lo que pensabas ' +
              'y a más gente. Volviste sin nada y con la cara rota.',
            stats: { calle: -6, fama: -6, salud: -25, atencion: 12 },
            guita: -900_000,
            flags: ['traicion', 'desastre'],
          },
        },
      },
      {
        texto: 'Dejarlo pasar. Cortar por lo sano y seguir',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        efecto: { socio: 'traiciono' },
        resultados: {
          critico_exito: {
            texto:
              'No hiciste nada y esa fue la jugada. Se quedó esperando la respuesta que nunca llegó ' +
              'y el barrio entero entendió que vos ya jugabas otro campeonato.',
            stats: { mana: 8, fama: 4, atencion: -6 },
          },
          exito: {
            texto: 'Cortaste el vínculo sin escándalo. Te dolió más de lo que reconocés.',
            stats: { mana: 5, atencion: -3 },
          },
          exito_con_costo: {
            texto:
              'Lo dejaste pasar y funcionó, pero un par de personas lo leyeron como que estabas blando. ' +
              'Hubo que aclarar cosas después.',
            stats: { mana: 3, calle: -4 },
          },
          fracaso: {
            texto:
              'Lo dejaste ir y siguió hablando desde afuera, tranquilo, sabiendo que no ibas a hacer nada.',
            stats: { fama: -5, atencion: 10 },
            guita: -300_000,
            flags: ['buchon'],
          },
          critico_fracaso: {
            texto:
              'Lo dejaste ir y armó todo un negocio con lo que sabía de vos. Ahora es competencia ' +
              'y conoce cada uno de tus movimientos.',
            stats: { fama: -8, calle: -5, atencion: 14 },
            guita: -700_000,
            flags: ['buchon', 'traicion'],
          },
        },
      },
    ],
  },

  // --- Momento 3: el cierre del arco ---
  {
    id: 'esp_socio_cierre_leal',
    especial: 'socio_cierre',
    variante: 'leal',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 36,
    edad_max: 45,
    titulo: (c) => `Lo de ${c.socioNombre}`,
    texto: (c) =>
      `${c.socioCompleto} está cansado. Lo viste en cómo se sienta, en que ya no se ofrece primero. ` +
      'Te dijo que quiere salirse, que tiene una changa legal esperándolo y que no quiere terminar ' +
      'como terminaron los otros. Te está pidiendo permiso a vos, que es lo más triste del asunto.',
    opciones: [
      {
        texto: 'Dejarlo ir bien: parte, contactos y la puerta abierta',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.75,
        efecto: { socio: 'retirado' },
        resultados: {
          critico_exito: {
            texto:
              'Le diste más de lo que le tocaba y lo despediste como se despide a un hermano. ' +
              'Años después todavía se cuenta cómo lo dejaste salir, y esa historia te abrió más ' +
              'puertas que cualquier negocio.',
            stats: { calle: 6, fama: 7, mana: 3 },
            guita: -800_000,
            socio: 15,
            hijo: 4,
            flags: ['palabra'],
          },
          exito: {
            texto: 'Le diste lo suyo y se fue tranquilo. Vino al asado el domingo siguiente igual.',
            stats: { calle: 4, fama: 3 },
            guita: -400_000,
            socio: 10,
          },
          exito_con_costo: {
            texto:
              'Lo dejaste ir bien, pero te quedaste sin la única persona en la que confiabas y ' +
              'se notó todo el año siguiente.',
            stats: { fama: 2, mana: -3, salud: -5 },
            guita: -400_000,
            socio: 8,
          },
          fracaso: {
            texto:
              'Quisiste hacerlo bien y no te alcanzó la plata para darle lo que le correspondía. ' +
              'Se fue igual, sin bronca, que es peor.',
            stats: { fama: -2 },
            guita: -200_000,
            socio: 3,
          },
          critico_fracaso: {
            texto:
              'Le prometiste una parte que después no pudiste pagar. Se fue callado y no volvió ' +
              'a atenderte el teléfono. Veinte años tirados por una cifra.',
            stats: { fama: -5, calle: -4 },
            socio: -10,
            flags: ['traicion'],
          },
        },
      },
      {
        texto: 'Pedirle una última: sin él no cerrás la grande',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'combate_prolongado',
        prob_base: 0.5,
        egoista: true,
        efecto: { socio: 'ultima' },
        resultados: {
          critico_exito: {
            texto:
              'Aceptó por vos y salió redonda. La más grande de las dos carreras, y encima la última. ' +
              'Se fue al otro día, rico y entero, y te abrazó en la puerta.',
            stats: { calle: 7, fama: 8 },
            guita: 3_500_000,
            movidas: 2,
            socio: 8,
          },
          exito: {
            texto: 'Aceptó, salió bien y se fue con la parte más grande que vio en su vida.',
            stats: { calle: 4, fama: 5 },
            guita: 1_800_000,
            movidas: 1,
            socio: 4,
          },
          exito_con_costo: {
            texto:
              'Salió, pero volvió lastimado y con la mirada distinta. Se fue sin decir mucho. ' +
              'Vos ganaste plata y perdiste otra cosa.',
            stats: { calle: 3, salud: -10 },
            guita: 900_000,
            movidas: 1,
            socio: -8,
            hijo: -3,
          },
          fracaso: {
            texto:
              'Se cayó y él se llevó la peor parte por estar donde no quería estar. ' +
              'No te dijo nada. Nunca más te dijo nada.',
            stats: { fama: -4, salud: -12 },
            socio: -15,
            flags: ['traicion'],
          },
          critico_fracaso: {
            texto:
              'Lo metiste en la última y no volvió a salir de esa. Vos seguís acá contándolo. ' +
              'Es lo único que vas a tener para contar de él.',
            stats: { calle: -5, fama: -8, salud: -15 },
            socio: -25,
            hijo: -6,
            flags: ['traicion', 'desastre'],
          },
        },
      },
    ],
  },
  {
    id: 'esp_socio_cierre_traicion',
    especial: 'socio_cierre',
    variante: 'traicion',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 36,
    edad_max: 45,
    titulo: (c) => `Volvió ${c.socioNombre}`,
    texto: (c) =>
      `Apareció ${c.socioCompleto} después de todos estos años, más viejo y más flaco, con una ` +
      'propuesta que suena demasiado bien. Dice que lo de antes fue otra vida y que ahora tiene ' +
      'algo que solo puede hacer con vos. Podría ser cierto. También podría ser exactamente lo ' +
      'mismo que la vez pasada, con más años encima.',
    opciones: [
      {
        texto: 'Escucharlo. La gente cambia',
        riesgo: 'extremo',
        esfuerzo_fisico: false,
        minijuego: 'perderla_de_vista',
        prob_base: 0.4,
        efecto: { socio: 'reconciliado' },
        resultados: {
          critico_exito: {
            texto:
              'Era cierto. Salió la mejor movida de tu vida y encima recuperaste al único tipo que ' +
              'te conocía de pibe. Algunas cosas se arreglan; no muchas, pero algunas.',
            stats: { calle: 6, fama: 8, mana: 4 },
            guita: 4_000_000,
            movidas: 2,
            socio: 25,
            flags: ['zafada'],
          },
          exito: {
            texto: 'Era cierto a medias, pero alcanzó. Ganaron los dos y quedaron a mano.',
            stats: { fama: 4, mana: 3 },
            guita: 1_500_000,
            movidas: 1,
            socio: 15,
          },
          exito_con_costo: {
            texto:
              'Funcionó, pero en el medio te confirmó que sí, que aquella vez había sido él. ' +
              'Cobraste y te quedaste con la certeza, que no era lo que buscabas.',
            stats: { fama: 2, salud: -8 },
            guita: 600_000,
            socio: 5,
          },
          fracaso: {
            texto: 'Era el mismo de siempre. Te sacó lo que pudo y se fue por segunda vez.',
            stats: { fama: -5, mana: -3 },
            guita: -1_200_000,
            flags: ['traicion'],
          },
          critico_fracaso: {
            texto:
              'Era una trampa completa y esta vez venía con gente atrás. Perdiste plata, cara y ' +
              'la última ilusión que te quedaba sobre alguien.',
            stats: { fama: -8, calle: -6, salud: -20, atencion: 16 },
            guita: -2_500_000,
            flags: ['traicion', 'desastre'],
          },
        },
      },
      {
        texto: 'Cerrarle la puerta sin hablar',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.8,
        efecto: { socio: 'cerrado' },
        resultados: {
          critico_exito: {
            texto:
              'Le cerraste la puerta y a los dos meses se supo que la propuesta era una trampa armada ' +
              'para otro. Te salvaste sin enterarte de qué te salvabas.',
            stats: { mana: 8, calle: 4, fama: 3 },
            flags: ['zafada'],
          },
          exito: {
            texto: 'Le cerraste la puerta y seguiste con lo tuyo. Ni te temblo la mano.',
            stats: { mana: 4, calle: 2 },
          },
          exito_con_costo: {
            texto:
              'Le cerraste la puerta y esa noche no dormiste. Hay cosas que uno hace bien y le ' +
              'salen caras igual.',
            stats: { mana: 3, salud: -6 },
          },
          fracaso: {
            texto:
              'Le cerraste la puerta y la propuesta era buena de verdad. Se la llevó a otro y ' +
              'lo viste hacerse la plata que podía ser tuya.',
            stats: { fama: -3, mana: -2 },
          },
          critico_fracaso: {
            texto:
              'Le cerraste la puerta y salió a contar por todos lados que le habías dado la espalda ' +
              'a un tipo que venía de rodillas. Media versión, pero la que quedó.',
            stats: { fama: -6, calle: -4 },
            flags: ['traicion'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// Bisagras: una cada cinco años (20, 25, 30, 35, 40)
// ===========================================================================
// La idea es que cada lustro haya un año que se sienta distinto. No son
// eventos mas "fuertes" en numeros: son eventos que hablan de la edad que
// tenes y de lo que ya no vas a poder deshacer.

const BISAGRAS = [
  {
    id: 'esp_bisagra_20',
    especial: 'bisagra',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: false,
    edad_min: 20,
    edad_max: 20,
    titulo: 'Veinte',
    texto:
      'Cumpliste veinte y por primera vez alguien más chico te pidió un consejo en serio. ' +
      'Te quedaste pensando en qué le ibas a contestar y te diste cuenta de que ya no sos el pibe ' +
      'nuevo de ningún lado. Hay una decisión de esas que definen la década esperándote esta semana.',
    opciones: [
      {
        texto: 'Meter todo lo que tenés en una jugada grande',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'pasar_droga',
        prob_base: 0.5,
        resultados: {
          critico_exito: {
            texto: 'Saliste con todo y salió todo. A los veinte ya tenías lo que otros a los treinta.',
            stats: { calle: 7, fama: 7 },
            guita: 1_500_000,
            movidas: 2,
          },
          exito: {
            texto: 'Apostaste fuerte y ganaste. Con eso arrancás la década parado.',
            stats: { calle: 5, fama: 4 },
            guita: 700_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Ganaste, pero te tuviste que exponer más de lo que querías y ahora te conocen.',
            stats: { calle: 4, fama: 3, atencion: 12 },
            guita: 400_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'Perdiste todo lo que habías juntado en tres años. A los veinte todavía se puede.',
            stats: { fama: -4, salud: -8 },
            guita: -300_000,
          },
          critico_fracaso: {
            texto: 'La perdiste entera y encima con público. Vas a arrastrar esa cara un par de años.',
            stats: { calle: -5, fama: -7, salud: -14, atencion: 10 },
            guita: -500_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Frenar y construir despacio: base antes que ruido',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.68,
        resultados: {
          critico_exito: {
            texto:
              'Armaste una base tan prolija que después todo lo demás fue apoyarse ahí. ' +
              'Los que salieron a hacer ruido a los veinte hoy no están.',
            stats: { mana: 8, calle: 4, atencion: -8 },
            guita: 350_000,
          },
          exito: {
            texto: 'Construiste despacio y quedó firme. Sin fotos, pero firme.',
            stats: { mana: 5, atencion: -5 },
            guita: 180_000,
          },
          exito_con_costo: {
            texto: 'Construiste bien, pero mientras vos ordenabas otro se llevó la vidriera.',
            stats: { mana: 4, fama: -4 },
            guita: 80_000,
          },
          fracaso: {
            texto: 'Fuiste demasiado prudente y el año pasó sin que nada se moviera.',
            stats: { fama: -3, mana: 1 },
          },
          critico_fracaso: {
            texto:
              'Te quedaste quieto tanto tiempo que te empezaron a saltear cuando repartían. ' +
              'A los veinte eso duele distinto.',
            stats: { fama: -6, calle: -4 },
          },
        },
      },
    ],
  },
  {
    id: 'esp_bisagra_25',
    especial: 'bisagra',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 25,
    edad_max: 25,
    titulo: 'Veinticinco y la lista de los que ya no están',
    texto:
      'Te pusiste a contar y te salieron seis. Seis de los que arrancaron con vos que ya no están: ' +
      'presos, muertos o borrados. Uno de ellos era el que te enseñó todo. Es la primera vez que ' +
      'hacés la cuenta y no vas a poder dejar de hacerla nunca más.',
    opciones: [
      {
        texto: 'Ponerte serio con el cuerpo y la cabeza',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.7,
        resultados: {
          critico_exito: {
            texto:
              'Dejaste de fumar, arrancaste a entrenar y te sacaste dos cosas de encima que te ' +
              'venían comiendo. Volviste a dormir de noche.',
            stats: { salud: 16, mana: 5, atencion: -8 },
            hijo: 3,
          },
          exito: {
            texto: 'Te ordenaste. Nada espectacular, pero el cuerpo lo agradeció.',
            stats: { salud: 10, atencion: -4 },
          },
          exito_con_costo: {
            texto: 'Te ordenaste y en el barrio lo leyeron como que estabas aflojando.',
            stats: { salud: 8, calle: -5 },
          },
          fracaso: {
            texto: 'Duraste tres semanas. La cuarta te encontró en la misma esquina de siempre.',
            stats: { salud: 2, fama: -2 },
          },
          critico_fracaso: {
            texto:
              'Quisiste frenar de golpe y te salió peor: dos semanas hecho pelota y una recaída ' +
              'que vio todo el mundo.',
            stats: { salud: -12, fama: -4 },
          },
        },
      },
      {
        texto: 'Meterle el doble: si te queda poco, que rinda',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'empaquetar',
        prob_base: 0.55,
        egoista: true,
        resultados: {
          critico_exito: {
            texto:
              'Duplicaste todo y funcionó. Trabajaste como un animal y terminaste el año con una ' +
              'cifra que no habías visto nunca.',
            stats: { calle: 6, fama: 6, salud: -10 },
            guita: 2_200_000,
            ventas: 3,
          },
          exito: {
            texto: 'Le metiste el doble y entró el doble. El cuerpo lo va a cobrar después.',
            stats: { calle: 4, fama: 3, salud: -8 },
            guita: 1_000_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto: 'Entró plata pero te comió el año entero. No te acordás de nada más de esos meses.',
            stats: { calle: 3, salud: -16 },
            guita: 600_000,
            ventas: 1,
            hijo: -4,
          },
          fracaso: {
            texto: 'Te fundiste a trabajar y no rindió. El cuerpo te pasó la cuenta igual.',
            stats: { salud: -18, fama: -3 },
            guita: -100_000,
          },
          critico_fracaso: {
            texto:
              'Te llevaste el año puesto y terminaste en una cama de hospital con la lista de los ' +
              'seis dando vueltas en la cabeza. Estuviste cerca de ser el séptimo.',
            stats: { salud: -28, atencion: 10, fama: -5 },
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    id: 'esp_bisagra_30',
    especial: 'bisagra',
    tipo: 'decision',
    categoria: 'venta',
    esfuerzo_fisico: false,
    edad_min: 30,
    edad_max: 30,
    titulo: 'Treinta',
    texto:
      'A los treinta ya no te preguntan qué vas a hacer: te preguntan qué hacés. Y la respuesta ' +
      'que das es la que va a quedar. Se te apareció una oportunidad de las que definen si esto ' +
      'fue una etapa o si fue tu vida.',
    opciones: [
      {
        texto: 'Blanquear lo que se pueda y armar algo que dure',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.55,
        resultados: {
          critico_exito: {
            texto:
              'Metiste la plata en algo con factura y nombre propio. Por primera vez alguien te ' +
              'llamó por tu apellido y no por tu apodo.',
            stats: { mana: 9, fama: 5, atencion: -12 },
            guita: -600_000,
            hijo: 8,
          },
          exito: {
            texto: 'Blanqueaste una parte. Menos guita por mes, mucho menos ruido.',
            stats: { mana: 6, atencion: -8 },
            guita: -300_000,
            hijo: 5,
          },
          exito_con_costo: {
            texto:
              'Blanqueaste y funcionó, pero te comieron en comisiones y explicaciones. ' +
              'Y en la calle quedó la idea de que te estás yendo.',
            stats: { mana: 4, calle: -6, atencion: -5 },
            guita: -500_000,
            hijo: 3,
          },
          fracaso: {
            texto: 'El negocio legal no arrancó y te comió la plata que tenías apartada.',
            stats: { mana: 2, fama: -3 },
            guita: -700_000,
          },
          critico_fracaso: {
            texto:
              'El negocio legal te dejó los papeles a la vista y con eso vinieron preguntas. ' +
              'Perdiste plata y ganaste una carpeta con tu nombre.',
            stats: { atencion: 18, fama: -5 },
            guita: -900_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Ir a fondo: es ahora o no es nunca',
        riesgo: 'extremo',
        esfuerzo_fisico: true,
        minijuego: 'cruce_frontera',
        prob_base: 0.45,
        resultados: {
          critico_exito: {
            texto:
              'La jugada más grande de tu vida salió a los treinta clavados. ' +
              'De acá en adelante todo el mundo te va a nombrar con esta historia.',
            stats: { calle: 8, fama: 10 },
            guita: 5_000_000,
            ventas: 4,
            flags: ['zafada'],
          },
          exito: {
            texto: 'Fuiste a fondo y salió. Cambió tu categoría de una.',
            stats: { calle: 5, fama: 7 },
            guita: 2_500_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto:
              'Salió, pero quedaron cabos sueltos y gente que te vio la cara donde no debía verte.',
            stats: { fama: 5, atencion: 20, salud: -12 },
            guita: 1_200_000,
            ventas: 2,
          },
          fracaso: {
            texto: 'No salió y perdiste todo lo que habías puesto, que era casi todo.',
            stats: { fama: -6, salud: -14 },
            guita: -1_500_000,
            flags: ['deuda'],
          },
          critico_fracaso: {
            texto:
              'Fue un desastre en cadena: perdiste la carga, la plata y a dos que confiaban en vos. ' +
              'A los treinta ya no hay tanto tiempo para recuperar eso.',
            stats: { calle: -8, fama: -10, salud: -22, atencion: 22 },
            guita: -2_000_000,
            socio: -12,
            hijo: -8,
            flags: ['desastre', 'deuda'],
          },
        },
      },
    ],
  },
  {
    id: 'esp_bisagra_35',
    especial: 'bisagra',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 35,
    edad_max: 35,
    titulo: 'Treinta y cinco: los pibes nuevos',
    texto:
      'Aparecieron los de veinte. Se mueven más rápido, no le tienen miedo a nada y no saben quién ' +
      'sos. Uno de ellos te habló de arriba abajo sin darse cuenta de con quién hablaba. ' +
      'Podés enseñarles o podés recordarles.',
    opciones: [
      {
        texto: 'Ponerlos a laburar para vos: que aprendan',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        resultados: {
          critico_exito: {
            texto:
              'Armaste una estructura con los pibes adentro y ahora trabajan diez para vos. ' +
              'Te dicen "maestro" y no lo dicen en joda.',
            stats: { fama: 8, mana: 6, calle: 4 },
            guita: 1_800_000,
            ventas: 2,
            hijo: 4,
          },
          exito: {
            texto: 'Tres de ellos se te sumaron y rinden. Menos cuerpo tuyo, más cabeza.',
            stats: { fama: 4, mana: 4 },
            guita: 800_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto:
              'Te siguen, pero son un quilombo y te trajeron atención que no necesitabas.',
            stats: { fama: 3, atencion: 14 },
            guita: 400_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Se te rieron en la cara y armaron lo suyo aparte con lo que les mostraste.',
            stats: { fama: -5, calle: -4 },
          },
          critico_fracaso: {
            texto:
              'Les enseñaste todo y en seis meses te estaban compitiendo la esquina con tu propio método. ' +
              'Nadie te avisó que envejecer era esto.',
            stats: { fama: -8, calle: -7 },
            guita: -600_000,
            flags: ['traicion'],
          },
        },
      },
      {
        texto: 'Recordarles quién manda, a la vieja usanza',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'pelear',
        prob_base: 0.48,
        resultados: {
          critico_exito: {
            texto:
              'Bastó una noche. Al otro día lo saludaban a tu auto. Los treinta y cinco te sentaron bien.',
            stats: { calle: 9, fama: 6, salud: -10 },
          },
          exito: {
            texto: 'Quedó claro. Te dolió el cuerpo tres días pero quedó clarísimo.',
            stats: { calle: 6, fama: 3, salud: -12 },
          },
          exito_con_costo: {
            texto: 'Quedó claro y también quedó filmado. Ahora hay un video dando vueltas.',
            stats: { calle: 5, atencion: 18, salud: -14 },
          },
          fracaso: {
            texto:
              'Ya no tenés veinte. Te lo hicieron notar entre cuatro y no pudiste hacer mucho.',
            stats: { calle: -6, fama: -5, salud: -20 },
          },
          critico_fracaso: {
            texto:
              'Fue humillante y lo vio todo el barrio. Un tipo de treinta y cinco tirado en la vereda ' +
              'no vuelve a ser el mismo tipo.',
            stats: { calle: -10, fama: -9, salud: -28 },
            hijo: -6,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
  {
    id: 'esp_bisagra_40',
    especial: 'bisagra',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 40,
    edad_max: 40,
    titulo: 'Cuarenta: la última ventana',
    texto:
      'Cuarenta. El cuerpo ya no perdona nada y los que quedan arriba tuyo son cada vez menos. ' +
      'Todavía tenés una jugada de las grandes adentro, pero es la última: después de esta no hay ' +
      'revancha ni tiempo para armar otra.',
    opciones: [
      {
        texto: 'Gastarla toda en una última grande',
        riesgo: 'extremo',
        esfuerzo_fisico: true,
        minijuego: 'fuga_rescate',
        prob_base: 0.44,
        resultados: {
          critico_exito: {
            texto:
              'La última salió perfecta. Cuarenta años para llegar acá y valió cada uno. ' +
              'Ahora se puede elegir cómo termina.',
            stats: { fama: 12, calle: 6 },
            guita: 6_000_000,
            ventas: 4,
            flags: ['zafada'],
          },
          exito: {
            texto: 'La última salió. No perfecta, pero salió, y con eso te alcanza.',
            stats: { fama: 7, calle: 3 },
            guita: 2_800_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto: 'Salió y te costó el cuerpo entero. Vas a contarla desde una silla.',
            stats: { fama: 5, salud: -22 },
            guita: 1_400_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'No salió. A los cuarenta eso no se recupera: se administra.',
            stats: { fama: -6, salud: -16 },
            guita: -1_800_000,
          },
          critico_fracaso: {
            texto:
              'La última se cayó de la peor manera y arrastró todo lo que habías construido. ' +
              'Quedó una carpeta gruesa con tu nombre y muy poco más.',
            stats: { fama: -12, calle: -8, salud: -25, atencion: 25 },
            guita: -3_000_000,
            hijo: -8,
            flags: ['desastre', 'deuda'],
          },
        },
      },
      {
        texto: 'Guardarla. Cuidar lo que ya tenés',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.72,
        resultados: {
          critico_exito: {
            texto:
              'Ordenaste todo, blindaste lo tuyo y por primera vez en la vida dormís sin escuchar motores. ' +
              'A esta edad eso es la jugada más grande que hay.',
            stats: { salud: 14, mana: 7, atencion: -18 },
            hijo: 10,
            socio: 6,
          },
          exito: {
            texto: 'Cuidaste lo tuyo. Menos ruido, menos plata, más noches enteras.',
            stats: { salud: 8, atencion: -10 },
            hijo: 6,
          },
          exito_con_costo: {
            texto:
              'Te guardaste y funcionó, pero en el barrio ya hablan de vos en pasado.',
            stats: { salud: 6, fama: -7, atencion: -6 },
            hijo: 4,
          },
          fracaso: {
            texto: 'Te guardaste y te fueron comiendo el terreno igual, de a pedacitos.',
            stats: { calle: -6, fama: -5 },
            guita: -400_000,
          },
          critico_fracaso: {
            texto:
              'Te guardaste y lo leyeron como debilidad. Vinieron por todo lo que habías juntado ' +
              'y no tenías con qué frenarlos.',
            stats: { calle: -10, fama: -8, salud: -12 },
            guita: -1_500_000,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// Bisagras enganchadas al hito de Territorio
// ===========================================================================
// Si el jugador esta a un pelo del proximo umbral, la bisagra del año es esta:
// el evento que lo empuja adentro o le hace perder el envion. `efecto` con
// `empujeTerritorio` reparte los puntos hacia el stat que le esta faltando.

const BISAGRAS_TERRITORIO = [
  {
    id: 'esp_bisagra_terr_empuje',
    especial: 'bisagra_terr',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: true,
    edad_min: 20,
    edad_max: 45,
    titulo: 'Falta poco y se nota',
    texto: (c) =>
      `Ya no sos una promesa: sos el que está a punto. En ${c.ubicacion.nombre} lo sabe todo el mundo ` +
      'y por eso mismo esta semana pasan las dos cosas a la vez: te ofrecen la última pieza que te ' +
      'falta y te avisan que hay gente moviéndose para que no la agarres.',
    opciones: [
      {
        texto: 'Ir a buscar la pieza que falta, cueste lo que cueste',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'combate_prolongado',
        prob_base: 0.55,
        efecto: { empujeTerritorio: true },
        resultados: {
          critico_exito: {
            texto:
              'La fuiste a buscar y volviste con ella. Ahora sí: no falta nada. ' +
              'Lo que sigue es ir a tomarlo.',
            stats: { salud: -8 },
            guita: 500_000,
            movidas: 2,
          },
          exito: {
            texto: 'Costó, pero la tenés. Ya estás donde había que estar.',
            stats: { salud: -10 },
            guita: 200_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'La conseguiste dejando media cara en el intento y con la yuta preguntando.',
            stats: { salud: -16, atencion: 14 },
            movidas: 1,
          },
          fracaso: {
            texto: 'Te frenaron justo antes. Sigue estando ahí, a la vista, sin poder agarrarla.',
            stats: { salud: -12, fama: -3 },
          },
          critico_fracaso: {
            texto:
              'Te estaban esperando. Perdiste el envión, la plata y varios meses de cama. ' +
              'Lo que estaba a un paso volvió a estar a diez.',
            stats: { salud: -24, fama: -6, calle: -5, atencion: 12 },
            guita: -400_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Esperar. Que se acomode solo y entrar sin ruido',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.5,
        efecto: { empujeTerritorio: true },
        resultados: {
          critico_exito: {
            texto:
              'Esperaste y se acomodó solo, mejor de lo que lo hubieras acomodado vos. ' +
              'Entraste caminando por una puerta que otros rompieron.',
            stats: { mana: 8, atencion: -6 },
            guita: 300_000,
          },
          exito: {
            texto: 'Esperaste bien. Está todo dado para el paso siguiente.',
            stats: { mana: 5, atencion: -3 },
          },
          exito_con_costo: {
            texto: 'Esperaste y llegaste, pero mientras tanto perdiste peso en la calle.',
            stats: { mana: 4, calle: -5 },
          },
          fracaso: {
            texto: 'Esperaste demasiado. Se acomodó, sí, pero para otro.',
            stats: { fama: -4, mana: 1 },
          },
          critico_fracaso: {
            texto:
              'Esperaste y te pasaron por arriba sin despeinarse. Todo lo que habías juntado ' +
              'para este momento quedó viejo de golpe.',
            stats: { fama: -7, calle: -6 },
            flags: ['conquista_fallida'],
          },
        },
      },
    ],
  },
  {
    id: 'esp_bisagra_terr_todo',
    especial: 'bisagra_terr',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: true,
    edad_min: 20,
    edad_max: 45,
    titulo: 'Jugártela toda de una',
    texto: (c) =>
      `Tenés ${c.edad} años y el hito enfrente. Podés seguir juntando de a poco, como venís, ` +
      'o poner todo lo que tenés arriba de la mesa esta misma semana y terminar de cruzar. ' +
      'El que te lo propuso te dijo una sola frase: "o entrás ahora o entrás nunca".',
    opciones: [
      {
        texto: 'Todo a una carta',
        riesgo: 'extremo',
        esfuerzo_fisico: true,
        minijuego: 'escapar_policia',
        prob_base: 0.45,
        efecto: { empujeTerritorio: true },
        resultados: {
          critico_exito: {
            texto:
              'Pusiste todo y volviste con el doble. No solo llegaste al umbral: lo pasaste de largo.',
            stats: { calle: 6, fama: 8 },
            guita: 2_500_000,
            movidas: 2,
            flags: ['zafada'],
          },
          exito: {
            texto: 'Pusiste todo y alcanzó. Estás del otro lado.',
            stats: { calle: 4, fama: 5 },
            guita: 900_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Llegaste, pero pagando con el cuerpo y quedando a la vista de todos.',
            stats: { fama: 4, salud: -18, atencion: 20 },
            guita: 300_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'Pusiste todo y no alcanzó. Ahora estás más lejos que cuando arrancaste.',
            stats: { fama: -6, salud: -12 },
            guita: -900_000,
            flags: ['conquista_fallida'],
          },
          critico_fracaso: {
            texto:
              'Lo perdiste todo de una sola vez. La jugada que iba a coronarte te dejó abajo de todo, ' +
              'y encima se enteró hasta el último.',
            stats: { calle: -8, fama: -10, salud: -20, atencion: 20 },
            guita: -1_800_000,
            socio: -10,
            flags: ['conquista_fallida', 'desastre', 'deuda'],
          },
        },
      },
      {
        texto: 'De a poco. El hito no se va a ir a ningún lado',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.7,
        resultados: {
          critico_exito: {
            texto:
              'Fuiste de a poco y llegaste igual, sin deberle nada a nadie. Tardaste más y llegaste entero.',
            stats: { mana: 7, calle: 3, atencion: -6 },
            guita: 400_000,
          },
          exito: {
            texto: 'De a poco, sin ruido. Sumaste lo que faltaba sin que nadie se enterara.',
            stats: { mana: 4, atencion: -4 },
            guita: 200_000,
          },
          exito_con_costo: {
            texto: 'Llegaste tarde a la ventana buena, pero llegaste.',
            stats: { mana: 3, fama: -3 },
          },
          fracaso: {
            texto: 'Te tomaste tu tiempo y la ventana se cerró. Hay que esperar la próxima.',
            stats: { fama: -3 },
          },
          critico_fracaso: {
            texto:
              'Mientras vos ibas de a poco, otro fue de una y se llevó todo. ' +
              'La prudencia también se paga.',
            stats: { fama: -6, calle: -4 },
            flags: ['conquista_fallida'],
          },
        },
      },
    ],
  },
];

export const EVENTOS_BISAGRA_ESPECIALES = [
  ...BIFURCACION,
  ...SEGUNDA_CHANCE,
  ...HIJO,
  ...SOCIO,
  ...BISAGRAS,
  ...BISAGRAS_TERRITORIO,
];
