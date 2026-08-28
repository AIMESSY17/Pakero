/**
 * Los eventos que rodean al Territorio.
 *
 * La conquista en sí sigue siendo lo de siempre (umbral + minijuego + tirada).
 * Lo que se agrega acá es todo lo que pasa alrededor, que es donde estaba el
 * agujero: antes no había nada, y después tampoco.
 *
 *   especial: 'acercamiento'  — te faltan 1 a 9 puntos. La zona ya se enteró.
 *   especial: 'duenio'        — qué hacés con el tipo al que se lo sacaste.
 *   especial: 'mantenimiento' — cada 2-3 años hay que volver a bancarlo.
 *   especial: 'tension_terr'  — con 2+ territorios, se rozan entre ellos.
 *
 * Todos leen `c.terr`, que el motor arma antes de construir el año
 * (ver `core/texto.js` y `focoTerritorio` en `core/engine.js`).
 */

// ===========================================================================
// Acercamiento: te falta poco y se nota
// ===========================================================================

const ACERCAMIENTO = [
  {
    id: 'terr_acerc_01',
    especial: 'acercamiento',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 12,
    edad_max: 45,
    titulo: 'Te empezaron a medir',
    texto: (c) =>
      `Faltan ${c.terr.hito?.puntos ?? 'unos pocos'} puntos y en la zona ya lo saben antes que vos. ` +
      'Esta semana pasaron dos cosas raras: uno que nunca te saludaba te saludó primero, ' +
      'y otro que te saludaba siempre cruzó de vereda. ' +
      'Así arranca esto, con la gente acomodándose antes de que pase nada.',
    opciones: [
      {
        texto: 'Mostrarte. Que vean que ya estás para eso',
        riesgo: 'medio',
        esfuerzo_fisico: true,
        minijuego: null,
        prob_base: 0.58,
        resultados: {
          critico_exito: {
            texto:
              'Te paseaste una semana entera como si ya fuera tuyo y nadie te discutió nada. ' +
              'Cuando llegue el momento va a ser un trámite.',
            stats: { calle: 6, fama: 5 },
            guita: 250_000,
          },
          exito: {
            texto: 'Te mostraste y quedó claro. Los que dudaban dejaron de dudar.',
            stats: { calle: 4, fama: 3 },
            guita: 120_000,
          },
          exito_con_costo: {
            texto:
              'Quedó claro, pero te expusiste de más y ahora hay gente mirándote que antes ni sabía tu nombre.',
            stats: { calle: 3, fama: 2, atencion: 12 },
          },
          fracaso: {
            texto:
              'Saliste a mostrarte y no se te dio: quedaste haciendo ruido sin nada atrás.',
            stats: { fama: -4, calle: -2 },
          },
          critico_fracaso: {
            texto:
              'Te adelantaste. Cantaste la jugada antes de tenerla y ahora el que está enfrente ' +
              'sabe exactamente lo que venís a buscar.',
            stats: { fama: -6, calle: -4, atencion: 14 },
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Callarte la boca y seguir juntando',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.66,
        resultados: {
          critico_exito: {
            texto:
              'No dijiste una palabra y seguiste sumando. Para cuando se dieron cuenta ' +
              'ya no había forma de pararte.',
            stats: { mana: 7, calle: 3, atencion: -8 },
            guita: 300_000,
          },
          exito: {
            texto: 'Perfil bajo, cabeza fría. Sumaste sin que nadie llevara la cuenta.',
            stats: { mana: 4, atencion: -5 },
            guita: 150_000,
          },
          exito_con_costo: {
            texto:
              'Te guardaste tanto que algunos lo leyeron como que aflojaste. Vas a tener que aclararlo.',
            stats: { mana: 3, fama: -4 },
          },
          fracaso: {
            texto: 'Te quedaste callado y otro habló por vos. No dijo cosas buenas.',
            stats: { fama: -3, mana: 1 },
          },
          critico_fracaso: {
            texto:
              'Mientras vos juntabas en silencio, alguien se movió rápido y te sacó ventaja ' +
              'en el mismo lugar que venías mirando.',
            stats: { fama: -5, calle: -3 },
            flags: ['conquista_fallida'],
          },
        },
      },
    ],
  },
  {
    id: 'terr_acerc_02',
    especial: 'acercamiento',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: false,
    edad_min: 12,
    edad_max: 45,
    titulo: 'Vino uno a tantear',
    texto: (c) =>
      `Se te apareció un tipo que dijo venir "de parte de gente" y no aclaró de qué gente. ` +
      `Habló media hora sin decir nada y en el medio dejó caer el nombre del lugar. ` +
      (c.terr.flavor ? `${c.terr.flavor} ` : '') +
      'Te está midiendo para alguien, y lo que le contestes va a llegar más lejos que él.',
    opciones: [
      {
        texto: 'Darle la razón en todo y no soltar nada',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        resultados: {
          critico_exito: {
            texto:
              'Le diste la razón toda la tarde y se fue convencido de que sos un boludo. ' +
              'Es lo mejor que te podía pasar.',
            stats: { mana: 8, atencion: -6 },
            movidas: 1,
          },
          exito: {
            texto: 'Escuchaste, asentiste y no soltaste una sola cosa útil. Se fue con las manos vacías.',
            stats: { mana: 5 },
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'No soltaste nada, pero se dio cuenta de que no soltabas nada. Eso también informa.',
            stats: { mana: 3, atencion: 6 },
          },
          fracaso: {
            texto: 'Se te escapó un detalle de más y lo vio. Chiquito, pero lo vio.',
            stats: { mana: 1, atencion: 8 },
          },
          critico_fracaso: {
            texto:
              'Hablaste de más para hacerte el vivo y le contaste, sin darte cuenta, ' +
              'exactamente lo que había venido a buscar.',
            stats: { fama: -4, atencion: 16 },
            flags: ['buchon'],
          },
        },
      },
      {
        texto: 'Marcarle la cancha ahí mismo',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'pelear',
        prob_base: 0.52,
        resultados: {
          critico_exito: {
            texto:
              'Lo pusiste en su lugar sin levantar la voz y se fue caminando rápido. ' +
              'El mensaje llegó a destino antes que él.',
            stats: { calle: 8, fama: 5 },
            movidas: 1,
          },
          exito: {
            texto: 'Le quedó clarísimo con quién estaba hablando. No vuelve.',
            stats: { calle: 5, fama: 3, salud: -5 },
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Le marcaste la cancha y se armó. Ganaste, pero lo vio medio barrio.',
            stats: { calle: 4, atencion: 14, salud: -10 },
          },
          fracaso: {
            texto: 'Quisiste marcarle la cancha y no estaba solo. Te fuiste vos.',
            stats: { calle: -4, fama: -4, salud: -12 },
          },
          critico_fracaso: {
            texto:
              'Era una prueba y la reprobaste de la peor manera: reaccionaste como el que todavía ' +
              'no está para esto. Ahora lo saben los de arriba.',
            stats: { calle: -7, fama: -6, salud: -16, atencion: 12 },
            flags: ['desastre'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// El dueño anterior
// ===========================================================================

const DUENIO = [
  {
    id: 'terr_duenio_01',
    especial: 'duenio',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 12,
    edad_max: 45,
    titulo: (c) => `Y ahora qué hacés con ${c.terr.duenio?.nombre ?? 'él'}`,
    texto: (c) => {
      const d = c.terr.duenio;
      if (!d) return 'Quedó un tipo sentado enfrente tuyo esperando que decidas.';
      return (
        `${d.nombre} "${d.apodo}" manejaba ${d.territorio} hasta hace tres días. ` +
        `${d.presentacion} ` +
        'Está sentado enfrente tuyo, en su propia casa, esperando que decidas. ' +
        'Y todo el mundo va a enterarse de lo que decidas, así que en realidad no estás ' +
        'decidiendo sobre él: estás decidiendo qué clase de dueño vas a ser.'
      );
    },
    opciones: [
      {
        texto: 'Dejarlo ir. Que agarre sus cosas y se vaya',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.68,
        efecto: { duenio: 'libre' },
        resultados: {
          critico_exito: {
            texto:
              'Le dejaste juntar lo suyo y le abriste la puerta. Se fue sin decir nada. ' +
              'A la semana medio barrio comentaba que lo habías dejado salir entero, ' +
              'y eso hizo más por vos que cualquier paliza.',
            stats: { fama: 5, mana: 4, calle: 2 },
            flags: ['palabra'],
          },
          exito: {
            texto: 'Se fue con lo puesto y sin drama. Vos te quedaste con el lugar y con la conciencia liviana.',
            stats: { fama: 3, mana: 2 },
          },
          exito_con_costo: {
            texto:
              'Lo dejaste ir y un par de los tuyos no lo entendieron. ' +
              'Hubo que explicar cosas que no deberían necesitar explicación.',
            stats: { mana: 2, calle: -4 },
          },
          fracaso: {
            texto:
              'Lo dejaste ir y a los dos meses volvió a aparecer por la zona, ' +
              'saludando gente y recordándoles que él estuvo primero.',
            stats: { calle: -3, fama: -2 },
          },
          critico_fracaso: {
            texto:
              'Lo dejaste ir y se llevó más de lo que dijo: contactos, plata escondida ' +
              'y la mitad de los proveedores. Fuiste generoso con el tipo equivocado.',
            stats: { calle: -5, fama: -3 },
            guita: -400_000,
          },
        },
      },
      {
        texto: 'Humillarlo delante de todos',
        riesgo: 'medio',
        esfuerzo_fisico: true,
        minijuego: null,
        prob_base: 0.62,
        egoista: true,
        efecto: { duenio: 'humillado' },
        resultados: {
          critico_exito: {
            texto:
              'Lo sacaste caminando por el medio, con todo el mundo mirando, sin tocarle un pelo. ' +
              'No hizo falta más. Nadie en esa zona te va a discutir nada por mucho tiempo.',
            stats: { calle: 9, fama: 6, atencion: 6 },
          },
          exito: {
            texto: 'Quedó clarísimo quién manda ahora. Se fue mirando el piso.',
            stats: { calle: 6, fama: 4, atencion: 5 },
          },
          exito_con_costo: {
            texto:
              'Funcionó, pero alguien lo filmó con el celular y el video anda dando vueltas.',
            stats: { calle: 5, atencion: 16 },
            hijo: -4,
          },
          fracaso: {
            texto:
              'Te pasaste. Lo que iba a ser un mensaje terminó siendo una escena fea ' +
              'que dejó a varios incómodos, incluidos los tuyos.',
            stats: { calle: 2, fama: -4, atencion: 10 },
            socio: -8,
            hijo: -5,
          },
          critico_fracaso: {
            texto:
              'Lo humillaste delante de la familia. De la propia y de la de él. ' +
              'Ganaste el lugar y perdiste algo que no sabías que tenías.',
            stats: { calle: 3, fama: -7, atencion: 14 },
            socio: -12,
            hijo: -8,
            flags: ['traicion'],
          },
        },
      },
      {
        texto: 'Sumarlo. Conoce esto mejor que vos',
        riesgo: 'alto',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.5,
        efecto: { duenio: 'aliado' },
        resultados: {
          critico_exito: {
            texto:
              'Le ofreciste quedarse manejando lo de siempre, con vos arriba. Aceptó ' +
              'y en un mes te enseñó cosas del lugar que ibas a tardar tres años en aprender solo.',
            stats: { mana: 9, calle: 4, fama: 3 },
            guita: 400_000,
            socio: 5,
            flags: ['palabra'],
          },
          exito: {
            texto:
              'Aceptó quedarse. Va a estar incómodo un tiempo, pero sabe dónde está cada cosa ' +
              'y eso vale más que su orgullo.',
            stats: { mana: 6, calle: 2 },
            guita: 150_000,
          },
          exito_con_costo: {
            texto:
              'Aceptó, pero le tuviste que dar más de lo que querías para que dijera que sí. ' +
              'Ahora tenés un socio que no elegiste.',
            stats: { mana: 4, calle: -3 },
            guita: -300_000,
          },
          fracaso: {
            texto:
              'Te dijo que sí en la cara y se borró a la semana con lo que pudo agarrar. ' +
              'Confiaste rápido en un tipo al que le acababas de sacar todo.',
            stats: { mana: 1, fama: -4 },
            guita: -500_000,
          },
          critico_fracaso: {
            texto:
              'Se quedó, sí. Y en tres meses te había vaciado medio negocio desde adentro, ' +
              'con la tranquilidad del que conoce cada pasillo porque los hizo él.',
            stats: { mana: -3, calle: -6, fama: -5, atencion: 12 },
            guita: -900_000,
            flags: ['traicion', 'deuda'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// Mantenimiento: bancar lo que ya es tuyo
// ===========================================================================

const MANTENIMIENTO = [
  {
    id: 'terr_mant_01',
    especial: 'mantenimiento',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 12,
    edad_max: 45,
    titulo: (c) => `${c.terr.lugar ?? 'Tu zona'} se está aflojando`,
    texto: (c) =>
      // Ojo con el orden: la línea de flavor es una oración entera y cerrada,
      // así que va DESPUÉS de que termina la enumeración. Metida en el medio
      // quedaba partiendo la lista al medio con mayúscula y punto.
      // Y nada de "X es tuyo": los lugares tienen género (La Matanza, Fuerte
      // Apache) y el motor no lo sabe. Se rodea con verbos.
      `Hace ${c.terr.aniosDesde ?? 'un par de'} años que manejás ${c.terr.lugar} y este año se ` +
      'notó que no alcanza con eso. Dos proveedores empezaron a atender a otro, ' +
      'la gente de la esquina de atrás dejó de avisar cuando pasa algo, ' +
      'y hay un par de pibes nuevos que se mueven como si el lugar no tuviera dueño. ' +
      (c.terr.flavor ?? ''),
    opciones: [
      {
        texto: 'Ir en persona y quedarte hasta arreglarlo',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'combate_prolongado',
        prob_base: 0.56,
        efecto: { mantener: true, perderTerritorio: ['critico_fracaso'] },
        resultados: {
          critico_exito: {
            texto:
              'Te instalaste dos meses y lo diste vuelta entero. Volvió gente que se había ido ' +
              'y los nuevos entendieron rapidísimo cómo era la cosa.',
            stats: { calle: 8, fama: 5, salud: -8 },
            guita: 900_000,
            movidas: 1,
          },
          exito: {
            texto: 'Fuiste, te quedaste y se acomodó. Nada que no se arregle estando.',
            stats: { calle: 5, salud: -8 },
            guita: 400_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto:
              'Lo recuperaste, pero mientras estabas allá se te desatendió todo lo demás. ' +
              'Y volviste roto.',
            stats: { calle: 4, salud: -16, fama: -2 },
            hijo: -5,
          },
          fracaso: {
            texto:
              'Fuiste, te quedaste, y no alcanzó. Se sostiene con alfileres y se nota.',
            stats: { calle: -3, salud: -12, fama: -3 },
          },
          critico_fracaso: {
            texto:
              'Fuiste a poner el cuerpo y te lo pusieron a vos. Cuando pudiste levantarte ' +
              'ya había otro sentado en tu silla, y esta vez nadie salió a defenderte.',
            stats: { calle: -8, fama: -7, salud: -22, atencion: 10 },
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Mandar plata y gente, sin moverte vos',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.54,
        efecto: { mantener: true, perderTerritorio: ['critico_fracaso'] },
        resultados: {
          critico_exito: {
            texto:
              'Mandaste a los indicados con la plata justa y lo resolvieron mejor que vos. ' +
              'Delegar bien también es mandar.',
            stats: { mana: 8, fama: 3 },
            guita: -200_000,
            movidas: 1,
          },
          exito: {
            texto: 'Se acomodó sin que tuvieras que aparecer. Costó guita, no cuerpo.',
            stats: { mana: 5 },
            guita: -400_000,
          },
          exito_con_costo: {
            texto:
              'Se acomodó, pero salió el doble de lo pensado y quedó la idea de que ' +
              'al dueño no se le ve nunca la cara.',
            stats: { mana: 3, calle: -5 },
            guita: -800_000,
          },
          fracaso: {
            texto:
              'Mandaste plata y se la comieron en el camino. El problema sigue igual, ' +
              'vos tenés menos guita y ahora también menos gente de confianza.',
            stats: { calle: -4, mana: -2 },
            guita: -600_000,
            socio: -5,
          },
          critico_fracaso: {
            texto:
              'Mandaste a otros a hacer lo que había que hacer en persona. ' +
              'Perdiste el lugar por teléfono, que es la forma más barata y más humillante de perderlo.',
            stats: { calle: -9, fama: -6 },
            guita: -500_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Dejarlo correr. Ya se va a acomodar solo',
        riesgo: 'extremo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.32,
        egoista: true,
        efecto: { mantener: true, perderTerritorio: ['fracaso', 'critico_fracaso'] },
        resultados: {
          critico_exito: {
            texto:
              'No hiciste nada y se acomodó solo: los pibes nuevos se pelearon entre ellos ' +
              'y los proveedores volvieron pidiendo disculpas. A veces pasa.',
            stats: { mana: 6, calle: 2 },
            guita: 200_000,
          },
          exito: {
            texto: 'No hiciste nada y aguantó. Un año más de prestado.',
            stats: { mana: 3 },
          },
          exito_con_costo: {
            texto:
              'Aguantó, pero perdiste terreno real: hoy manejás bastante menos de lo que decís que manejás.',
            stats: { calle: -6, fama: -4 },
            guita: -300_000,
          },
          fracaso: {
            texto:
              'No hiciste nada y se te cayó. Así, sin pelea, sin ruido: un día te enteraste ' +
              'de que ya no era tuyo y hacía rato que no lo era.',
            stats: { calle: -7, fama: -6 },
            flags: ['conquista_fallida'],
          },
          critico_fracaso: {
            texto:
              'No hiciste nada y no solo lo perdiste: quedó la versión de que te lo sacaron ' +
              'sin que hicieras un gesto. Esa versión te va a seguir mucho más que el lugar.',
            stats: { calle: -10, fama: -9, atencion: 8 },
            socio: -8,
            flags: ['conquista_fallida', 'desastre'],
          },
        },
      },
    ],
  },
];

// ===========================================================================
// Tensión entre territorios
// ===========================================================================

const TENSION = [
  {
    id: 'terr_tension_01',
    especial: 'tension_terr',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 12,
    edad_max: 45,
    titulo: (c) => `${c.terr.a ?? 'Uno'} contra ${c.terr.b ?? 'el otro'}`,
    texto: (c) =>
      `Tenés ${c.terr.a} y tenés ${c.terr.b}, y resulta que la gente de uno y la del otro ` +
      'se conocen de antes y no se bancan. Se está armando por una pavada —una deuda vieja, ' +
      'una mina, un partido— y las dos partes te vinieron a buscar a vos convencidas ' +
      'de que les vas a dar la razón. No podés darles la razón a las dos.',
    opciones: [
      {
        texto: (c) => `Bancar a los de ${c.terr.a}`,
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.55,
        resultados: {
          critico_exito: {
            texto:
              'Elegiste un lado y lo defendiste con argumentos que hasta el otro lado tuvo que aceptar. ' +
              'Quedaste como el que decide, no como el que toma partido.',
            stats: { calle: 6, mana: 5 },
            guita: 300_000,
          },
          exito: {
            texto: 'Elegiste y se bancó. Los otros quedaron calientes pero acataron.',
            stats: { calle: 4, mana: 2 },
          },
          exito_con_costo: {
            texto: 'Se resolvió, pero los del otro lado ahora te miran distinto y no van a olvidarse.',
            stats: { calle: 3, fama: -4 },
          },
          fracaso: {
            texto: 'Elegiste mal y se te dio vuelta: los que bancaste no te bancaron a vos.',
            stats: { calle: -5, fama: -3 },
            guita: -300_000,
          },
          critico_fracaso: {
            texto:
              'Tomaste partido y se pudrió todo. Terminaron peleándose entre ellos y vos ' +
              'quedaste como el que prendió el fuego.',
            stats: { calle: -8, fama: -6, salud: -10 },
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Sentarlos en la misma mesa y que se arreglen',
        riesgo: 'alto',
        esfuerzo_fisico: false,
        minijuego: 'perderla_de_vista',
        prob_base: 0.48,
        resultados: {
          critico_exito: {
            texto:
              'Los sentaste, los dejaste hablar cuatro horas y salieron dándose la mano. ' +
              'No sabés bien cómo lo lograste y ellos tampoco, pero ahora te deben las dos partes.',
            stats: { mana: 10, fama: 6, calle: 3 },
            guita: 500_000,
            socio: 6,
          },
          exito: {
            texto: 'Se sentaron, se dijeron de todo y salieron sin pegarse. Con eso alcanza.',
            stats: { mana: 6, fama: 3 },
          },
          exito_con_costo: {
            texto:
              'Se arreglaron, pero te costó plata de tu bolsillo poner el arreglo en pie.',
            stats: { mana: 4 },
            guita: -600_000,
          },
          fracaso: {
            texto: 'Se levantaron de la mesa peor que como llegaron. Ahora también están enojados con vos.',
            stats: { fama: -5, mana: -2 },
          },
          critico_fracaso: {
            texto:
              'Los juntaste y se armó ahí mismo, en tu mesa, con vos en el medio. ' +
              'Lo que era un problema entre dos zonas ahora es un problema tuyo.',
            stats: { calle: -6, fama: -7, salud: -14, atencion: 12 },
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Que se maten. Vos cobrás igual',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        egoista: true,
        resultados: {
          critico_exito: {
            texto:
              'Los dejaste pelear y se desgastaron los dos. Cuando terminaron, los dos ' +
              'te necesitaban más que antes y vos no habías gastado un peso.',
            stats: { mana: 8, calle: 4 },
            guita: 700_000,
          },
          exito: {
            texto: 'Te corriste y se arreglaron entre ellos como pudieron. Vos cobraste igual.',
            stats: { mana: 4 },
            guita: 300_000,
          },
          exito_con_costo: {
            texto:
              'Cobraste, pero quedó grabado que mirás para otro lado cuando los tuyos se lastiman.',
            stats: { mana: 3, fama: -5 },
            socio: -6,
          },
          fracaso: {
            texto:
              'Se pelearon en serio, se rompió mercadería y perdiste plata en los dos lugares a la vez.',
            stats: { calle: -4, fama: -4 },
            guita: -700_000,
          },
          critico_fracaso: {
            texto:
              'Los dejaste pelear y hubo heridos de los dos lados. Los dos barrios coinciden ' +
              'en una sola cosa: que el dueño estaba y no hizo nada.',
            stats: { calle: -9, fama: -8, atencion: 14 },
            socio: -12,
            hijo: -5,
            flags: ['traicion', 'desastre'],
          },
        },
      },
    ],
  },
];

export const EVENTOS_TERRITORIO = [...ACERCAMIENTO, ...DUENIO, ...MANTENIMIENTO, ...TENSION];
