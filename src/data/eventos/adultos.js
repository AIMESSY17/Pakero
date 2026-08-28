/**
 * Contenido adulto — SOLO Adultez, de 18 para arriba.
 *
 * Todos los eventos de este archivo llevan `adulto: true` y `edad_min: 18`.
 * No es una convención: `validarPool()` en `index.js` lo rechaza si no está,
 * y `poolDelAnio()` filtra por edad igual que con todo lo demás. El Secundario
 * (12-17) no toca este pool nunca, por construcción y no por buena voluntad.
 *
 * El registro es el de la comedia picaresca argentina: chamuyo, levante,
 * quilombo de telo, el amigo que te deja pagando. Se insinúa, se hace el
 * chiste y se corta en la puerta del cuarto — que además es donde el chiste
 * funciona mejor. Nada explícito: acá el gag es el papelón, no la escena.
 */

export const EVENTOS_ADULTOS = [
  // ------------------------- AUTOMATICOS: slot fama -------------------------
  {
    id: 'adu_adt_auto_fama_01',
    etapa: 'adultez',
    edad_min: 18,
    adulto: true,
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Te bancaste el bolonqui del telo',
    texto:
      'Salió mal desde el minuto cero: el ascensor trabado, la tarjeta que no pasaba y el ' +
      'de recepción preguntando por el nombre completo con toda la fila escuchando. ' +
      'Lo contás vos y es una anécdota; lo cuenta el que estaba atrás en la fila y sos una leyenda.',
    stats: { fama: 4 },
  },
  {
    id: 'adu_adt_auto_fama_02',
    etapa: 'adultez',
    edad_min: 18,
    adulto: true,
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Se corrió un bolazo sobre vos',
    texto:
      'Alguien dijo algo, otro lo agrandó y para el jueves ya era una historia con detalles ' +
      'que ni existieron. Vos la desmentiste dos veces, sin muchas ganas, y después dejaste de desmentirla.',
    stats: { fama: 5 },
  },

  // ------------------------- AUTOMATICOS: slot calle ------------------------
  {
    id: 'adu_adt_auto_calle_01',
    etapa: 'adultez',
    edad_min: 18,
    adulto: true,
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Te la bancaste callado',
    texto:
      'Se armó un quilombo de pareja en la esquina, de esos que terminan con todo el barrio ' +
      'en la vereda opinando. Vos sabías bastante más de lo que convenía saber y no abriste la boca ' +
      'ni cuando te preguntaron de frente. Eso se paga en respeto.',
    stats: { calle: 4 },
  },

  // -------------------- AUTOMATICOS: slot mana / atencion -------------------
  {
    id: 'adu_adt_auto_mana_01',
    etapa: 'adultez',
    edad_min: 18,
    adulto: true,
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Chamuyo de posgrado',
    texto:
      'Zafaste de una charla imposible improvisando una explicación tan larga y tan bien armada ' +
      'que hasta vos te la creíste a la mitad. Salir de esa te enseñó más que cualquier negocio.',
    stats: { mana: 5 },
  },

  // ------------------------------- DECISION --------------------------------
  {
    id: 'adu_adt_dec_01',
    etapa: 'adultez',
    edad_min: 18,
    adulto: true,
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'La del cumpleaños',
    texto:
      'Cumpleaños de cuarenta en un salón prestado, birra tibia y una playlist con todo lo que ' +
      'sonaba cuando eras pibe. Una que te viene mirando desde que llegaste se te sentó al lado ' +
      'y te tiró, sin anestesia, que su marido está en el otro salón. ' +
      'Y que se va a quedar en el otro salón.',
    opciones: [
      {
        texto: 'De una. Total, vida hay una sola',
        riesgo: 'alto',
        esfuerzo_fisico: false,
        minijuego: 'perderla_de_vista',
        prob_base: 0.5,
        resultados: {
          critico_exito: {
            texto:
              'Salieron por separado con quince minutos de diferencia, como profesionales. ' +
              'Nadie se enteró de nada y vos volviste al salón a comer torta con una cara ' +
              'de nada que deberías patentar.',
            stats: { mana: 7, fama: 3 },
          },
          exito: {
            texto: 'Salió todo bien y nadie preguntó nada. Milagro navideño en pleno octubre.',
            stats: { mana: 4, fama: 2 },
          },
          exito_con_costo: {
            texto:
              'Zafaste por poco: el marido apareció justo cuando volvías y te preguntó de dónde venías. ' +
              'Contestaste "del baño" con una seguridad que no tenías.',
            stats: { mana: 2, salud: -4 },
          },
          fracaso: {
            texto:
              'Los vio la hermana. La hermana. De todas las personas que había en ese salón, ' +
              'los vio la única que no se calla nada.',
            stats: { fama: -4, calle: -2 },
          },
          critico_fracaso: {
            texto:
              'Se armó en el medio del salón, con la torta todavía sin cortar y el DJ bajando la música ' +
              'para escuchar mejor. Te fuiste caminando seis cuadras porque el auto estaba bloqueado.',
            stats: { fama: -7, calle: -4, salud: -8 },
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Bancarte y seguir tomando',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.72,
        resultados: {
          critico_exito: {
            texto:
              'Le dijiste que no de la manera más elegante que se te ocurrió y terminaron charlando ' +
              'dos horas de cualquier cosa. Al final te presentó al marido, que resultó ser ' +
              'proveedor de algo que justo necesitabas.',
            stats: { mana: 6, fama: 3 },
            guita: 250_000,
          },
          exito: {
            texto: 'Te hiciste el gil con dignidad y seguiste tomando. Dormiste bien.',
            stats: { mana: 3, salud: 3 },
          },
          exito_con_costo: {
            texto:
              'Dijiste que no y ella lo tomó para el lado del orto. Se te complicó el resto de la noche ' +
              'y te fuiste temprano.',
            stats: { mana: 2, fama: -2 },
          },
          fracaso: {
            texto:
              'Te hiciste el santo y a la salida te enteraste de que ella se lo propuso a otro ' +
              'ocho minutos después. Se te movió algo raro en el ego.',
            stats: { fama: -2 },
          },
          critico_fracaso: {
            texto:
              'Dijiste que no, se ofendió y salió a contar la versión inversa. ' +
              'Ahora media fiesta cree que vos la encaraste a ella. Perdiste sin jugar.',
            stats: { fama: -5, calle: -2 },
          },
        },
      },
    ],
  },
  {
    id: 'adu_adt_dec_02',
    etapa: 'adultez',
    edad_min: 21,
    adulto: true,
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: false,
    titulo: 'La propuesta del boliche',
    texto:
      'El dueño del boliche de la ruta te ofrece manejarle la puerta y todo lo que pasa adentro: ' +
      'porcentaje de la barra, de la entrada y de lo que vos sepas hacer con eso. ' +
      'Es guita en serio y es visibilidad en serio. También es tener trescientas personas ' +
      'en pedo bajo tu responsabilidad todos los sábados hasta las siete de la mañana.',
    opciones: [
      {
        texto: 'Agarrar todo: puerta, barra y lo demás',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'empaquetar',
        prob_base: 0.54,
        resultados: {
          critico_exito: {
            texto:
              'Lo diste vuelta entero: en cuatro meses el boliche era el lugar donde había que estar ' +
              'y vos el que decidía quién entraba. Nunca más pagaste una entrada en tu vida.',
            stats: { fama: 10, calle: 6, salud: -8 },
            guita: 2_200_000,
            ventas: 3,
          },
          exito: {
            texto: 'Funcionó. Los sábados te comen la vida pero los lunes contás una guita linda.',
            stats: { fama: 6, calle: 4, salud: -6 },
            guita: 900_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto:
              'Entra plata, pero se te fue de las manos una noche y hubo que resolver un quilombo ' +
              'que llegó hasta la comisaría. Ahora tenés al boliche marcado y a vos también.',
            stats: { fama: 4, atencion: 18, salud: -10 },
            guita: 400_000,
            ventas: 1,
          },
          fracaso: {
            texto:
              'No pudiste con el ritmo: tres meses sin dormir un fin de semana y el dueño ' +
              'te terminó reemplazando por su sobrino.',
            stats: { fama: -3, salud: -14 },
            guita: -200_000,
          },
          critico_fracaso: {
            texto:
              'Se armó una batalla campal a las cinco de la mañana, clausuraron el lugar ' +
              'y tu nombre figuraba en el acta como responsable de la puerta.',
            stats: { fama: -6, calle: -3, atencion: 24, salud: -16 },
            guita: -600_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Solo la barra. Que la puerta la banque otro',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.64,
        resultados: {
          critico_exito: {
            texto:
              'Agarraste solo la barra, la ordenaste como un negocio de verdad y facturaste ' +
              'más que el que se comía todos los quilombos de la puerta. Trabajar con la cabeza, se llama.',
            stats: { mana: 8, fama: 4 },
            guita: 1_100_000,
            ventas: 2,
          },
          exito: {
            texto: 'La barra rindió y vos te fuiste a dormir a las tres. Buen arreglo.',
            stats: { mana: 5, fama: 2 },
            guita: 500_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto:
              'Rindió, pero el de la puerta se llevó todo el prestigio y la mitad de tu porcentaje ' +
              'sin que te dieras cuenta hasta el cuarto mes.',
            stats: { mana: 3, fama: -2 },
            guita: 150_000,
          },
          fracaso: {
            texto: 'Te robaron de adentro toda la temporada. Los propios pibes de la barra.',
            stats: { mana: 1, calle: -3 },
            guita: -300_000,
          },
          critico_fracaso: {
            texto:
              'Descubriste el afano tarde y mal, delante de todos, y quedaste como el que ' +
              'no sabe ni lo que pasa en su propia barra.',
            stats: { mana: -2, fama: -5, calle: -4 },
            guita: -500_000,
            socio: -6,
          },
        },
      },
    ],
  },
  {
    id: 'adu_adt_dec_03',
    etapa: 'adultez',
    edad_min: 24,
    adulto: true,
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Volvió la ex',
    texto:
      'Te escribió a las once de la noche un "hola, cómo andás" con punto final, que es la manera ' +
      'más agresiva de escribir un hola. Cuatro años sin hablarse. ' +
      'Y la cosa es que ahora vos tenés plata, y ella lo sabe, y vos sabés que ella lo sabe.',
    opciones: [
      {
        texto: 'Verla. Vas de curioso nomás',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.5,
        resultados: {
          critico_exito: {
            texto:
              'Se tomaron un café, se rieron de todo lo que se dijeron aquella vez y quedaron ' +
              'bien de verdad. Salir de ahí sin culpa y sin bronca fue lo más adulto que hiciste en años.',
            stats: { mana: 6, salud: 6 },
            hijo: 3,
          },
          exito: {
            texto: 'Charlaron, estuvo lindo y cada uno se fue para su lado. Cerrar cosas también sirve.',
            stats: { mana: 3, salud: 3 },
          },
          exito_con_costo: {
            texto:
              'La viste, se te removió todo y estuviste dos semanas mirando el teléfono ' +
              'como un pelotudo de veinte años.',
            stats: { mana: -2, salud: -5 },
          },
          fracaso: {
            texto:
              'Fuiste de curioso y volviste con un problema. Terminaste prestando plata ' +
              'que sabías perfectamente que no volvía.',
            guita: -400_000,
            stats: { mana: -3 },
            flags: ['deuda'],
          },
          critico_fracaso: {
            texto:
              'Era todo para llegar a algo tuyo, y lo peor es que funcionó. ' +
              'Cuando te diste cuenta ya le habías contado cosas que no se cuentan.',
            stats: { mana: -4, atencion: 14, fama: -3 },
            guita: -800_000,
            flags: ['buchon'],
          },
        },
      },
      {
        texto: 'Dejarla en visto y seguir con tu vida',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.7,
        resultados: {
          critico_exito: {
            texto:
              'La dejaste en visto y dormiste como un bebé. A los dos meses te enteraste ' +
              'del quilombo del que te salvaste y te reíste solo en el auto.',
            stats: { mana: 7, salud: 5 },
            flags: ['zafada'],
          },
          exito: {
            texto: 'Visto y a otra cosa. Hay una madurez rara en no contestar.',
            stats: { mana: 4 },
          },
          exito_con_costo: {
            texto:
              'No contestaste, pero te quedaste con la duda toda la semana y no rendiste ' +
              'en nada de lo que tenías que hacer.',
            stats: { mana: 2, salud: -4 },
          },
          fracaso: {
            texto:
              'No contestaste y salió a decir por ahí que te agrandaste con la plata. ' +
              'Algunos le creyeron.',
            stats: { fama: -4 },
          },
          critico_fracaso: {
            texto:
              'No contestaste y resultó que era en serio: había pasado algo grave y ' +
              'vos fuiste el único al que le escribió. Te enteraste tarde y mal.',
            stats: { salud: -8, mana: -3, fama: -3 },
            hijo: -4,
          },
        },
      },
    ],
  },
  {
    id: 'adu_adt_dec_04',
    etapa: 'adultez',
    edad_min: 26,
    adulto: true,
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'La despedida de soltero',
    texto:
      'Te tocó organizar la despedida del que te bancó cuando no te bancaba nadie. ' +
      'Tenés la guita para hacer algo demencial y las ganas también. ' +
      'El detalle es que la novia te pidió por favor, mirándote a los ojos, ' +
      'que no se te vaya la mano. Y falta una semana para el casamiento.',
    opciones: [
      {
        texto: 'Hacerla histórica. Se casa una sola vez',
        riesgo: 'alto',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.52,
        egoista: true,
        resultados: {
          critico_exito: {
            texto:
              'Fue épica y no se rompió nada ni nadie terminó donde no tenía que terminar. ' +
              'Se habla de esa noche hasta hoy y la novia nunca supo la mitad. La mitad buena.',
            stats: { fama: 9, calle: 4, salud: -8 },
            guita: -600_000,
            socio: 10,
          },
          exito: {
            texto: 'Salió zarpada y todos llegaron enteros al casamiento. Misión cumplida.',
            stats: { fama: 6, salud: -6 },
            guita: -400_000,
            socio: 6,
          },
          exito_con_costo: {
            texto:
              'Estuvo buenísima, pero el novio llegó al casamiento con una cara que no se ' +
              'arreglaba con nada y la novia sabe perfectamente de quién fue la idea.',
            stats: { fama: 4, salud: -10 },
            guita: -700_000,
            socio: 3,
            hijo: -3,
          },
          fracaso: {
            texto:
              'Se te fue de las manos: dos se pelearon, uno terminó en la guardia y ' +
              'tuviste que llamar a la novia a las seis de la mañana. Esa llamada no se olvida.',
            stats: { fama: -4, salud: -12 },
            guita: -900_000,
            socio: -8,
          },
          critico_fracaso: {
            texto:
              'Se suspendió el casamiento. No entremos en detalles. ' +
              'Perdiste a un amigo de veinte años por una noche que ni siquiera fue tan buena.',
            stats: { fama: -8, calle: -5, salud: -14 },
            guita: -1_200_000,
            socio: -20,
            flags: ['traicion'],
          },
        },
      },
      {
        texto: 'Un asado grande y nada más',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.75,
        resultados: {
          critico_exito: {
            texto:
              'Asado, vino, veinte tipos hablando de cuando eran pibes hasta las cuatro de la mañana. ' +
              'El novio te dijo, medio en pedo, que era exactamente lo que necesitaba. ' +
              'Y lo dijo en serio.',
            stats: { calle: 5, mana: 4, salud: 4 },
            guita: -200_000,
            socio: 12,
            hijo: 4,
            flags: ['palabra'],
          },
          exito: {
            texto: 'Un asadazo tranquilo. Nadie se rompió y todos llegaron bien al sábado.',
            stats: { calle: 3, salud: 2 },
            guita: -150_000,
            socio: 6,
          },
          exito_con_costo: {
            texto:
              'Estuvo lindo, pero un par se quejaron toda la noche de que faltaba acción. ' +
              'Los mismos que después no pusieron un peso.',
            stats: { calle: 2, fama: -3 },
            guita: -150_000,
            socio: 3,
          },
          fracaso: {
            texto:
              'Fue un plomo. Se fueron todos a las doce y el novio se quedó solo con vos ' +
              'mirando las brasas y diciendo que estaba todo bien.',
            stats: { fama: -3 },
            guita: -150_000,
          },
          critico_fracaso: {
            texto:
              'Fue tan aburrida que se fueron a seguirla por su cuenta sin avisarte, ' +
              'y ahí sí se pudrió todo. Organizaste la única despedida que salió mal por prudente.',
            stats: { fama: -6, calle: -3 },
            guita: -250_000,
            socio: -6,
          },
        },
      },
    ],
  },
];
