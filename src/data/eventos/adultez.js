/**
 * Eventos de prueba de la etapa Adultez (18-45).
 * Solo para probar el motor. El contenido real va aparte.
 * Formato definitivo: ver SCHEMA.md
 */

export const EVENTOS_ADULTEZ = [
  // ------------------- AUTOMATICOS: slot calle -------------------
  {
    id: 'adu_auto_calle_01',
    etapa: 'adultez',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: true,
    titulo: 'Bancaste la esquina',
    texto: 'Vinieron a marcar territorio en tu cuadra y no te moviste ni un metro. Se fueron ellos.',
    stats: { calle: 4 },
  },
  {
    id: 'adu_auto_calle_02',
    etapa: 'adultez',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Pusiste la plata para el asado',
    texto: 'Cumpleaños de la señora del fondo y vos pusiste la carne para cincuenta personas. En el barrio eso no se olvida.',
    stats: { calle: 3 },
  },

  // ------------------- AUTOMATICOS: slot fama -------------------
  {
    id: 'adu_auto_fama_01',
    etapa: 'adultez',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Saliste en el noticiero',
    texto: 'Un móvil del canal hizo una nota en tu cuadra y ahí estabas vos, de fondo, con cara de dueño.',
    stats: { fama: 4 },
  },
  {
    id: 'adu_auto_fama_02',
    etapa: 'adultez',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Te nombraron en una canción',
    texto: 'Un pibe de la esquina sacó un tema y te tiró un saludo con tu apodo. Lo escuchan hasta en la otra punta.',
    stats: { fama: 5 },
  },

  // ------------------- AUTOMATICOS: slot mana / baja atencion -------------------
  {
    id: 'adu_auto_mana_01',
    etapa: 'adultez',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Aprendiste a leer un contrato',
    texto: 'Un tipo te quiso pasar por arriba con la letra chica y esta vez lo viste venir de lejos.',
    stats: { mana: 4 },
  },
  {
    id: 'adu_auto_atencion_01',
    etapa: 'adultez',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Cambió el comisario',
    texto: 'Se llevaron al que te tenía marcado y el nuevo llegó sin saber quién sos. Aire fresco.',
    stats: { atencion: -8 },
  },

  // ------------------- DECISION -------------------
  {
    id: 'adu_dec_01',
    etapa: 'adultez',
    tipo: 'decision',
    categoria: 'venta',
    esfuerzo_fisico: false,
    titulo: 'Encargo grande',
    texto: 'Un tipo de traje que nunca viste quiere volumen y paga en el acto. Demasiado prolijo para ser casualidad.',
    opciones: [
      {
        texto: 'Aceptar y entregar vos mismo',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'pasar_droga',
        prob_base: 0.5,
        resultados: {
          critico_exito: {
            texto: 'Entrega perfecta y el tipo te pidió que seas su proveedor fijo.',
            stats: { fama: 6, calle: 3, mana: 2 },
            guita: 1_800_000,
            ventas: 3,
          },
          exito: {
            texto: 'Salió todo como estaba hablado. Plata en mano y un cliente nuevo.',
            stats: { fama: 3, mana: 1 },
            guita: 900_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto: 'Cobraste, pero te siguieron hasta la esquina y ahora sabés que te miran.',
            stats: { fama: 1, atencion: 10 },
            guita: 450_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'El tipo no apareció y vos quedaste una hora parado con todo encima.',
            stats: { atencion: 12 },
            guita: -150_000,
          },
          critico_fracaso: {
            texto: 'Era un operativo. Zafaste de milagro tirando todo en una alcantarilla.',
            stats: { atencion: 25, salud: -12, fama: -3 },
            guita: -400_000,
          },
        },
      },
      {
        texto: 'Mandar a un pibe de confianza',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.55,
        resultados: {
          critico_exito: {
            texto: 'El pibe la rompió y volvió con hasta el último peso. Encontraste a tu mano derecha.',
            stats: { mana: 5, fama: 3 },
            guita: 1_100_000,
            ventas: 2,
          },
          exito: {
            texto: 'Volvió con la plata y vos no te moviste del sillón.',
            stats: { mana: 3 },
            guita: 600_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Volvió con menos de lo hablado y una excusa flojísima.',
            stats: { mana: 1, calle: -1 },
            guita: 250_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Se asustó y volvió con todo sin entregar. Perdiste al cliente.',
            stats: { fama: -3 },
            guita: -80_000,
          },
          critico_fracaso: {
            texto: 'Lo agarraron y dio tu nombre en la primera hora.',
            stats: { atencion: 22, fama: -4 },
            guita: -300_000,
          },
        },
      },
      {
        texto: 'Rechazarlo. Huele mal',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.85,
        resultados: {
          critico_exito: {
            texto: 'Dos días después cayó todo el que le vendió a ese tipo. Vos ni figurás.',
            stats: { mana: 5, atencion: -8 },
          },
          exito: {
            texto: 'Le dijiste que no y se fue sin insistir. Instinto que no falla.',
            stats: { mana: 2, atencion: -4 },
          },
          exito_con_costo: {
            texto: 'Zafaste, pero se corrió que le tenés miedo a los negocios grandes.',
            stats: { mana: 1, fama: -3 },
          },
          fracaso: {
            texto: 'Era legítimo y se lo llevó tu competencia. Plata que dejaste pasar.',
            stats: { fama: -2 },
          },
          critico_fracaso: {
            texto: 'Se lo tomó personal y mandó a que te rompan el local igual.',
            stats: { salud: -10, fama: -4 },
            guita: -200_000,
          },
        },
      },
    ],
  },
  {
    id: 'adu_dec_02',
    etapa: 'adultez',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'Cayó un cargamento',
    texto: 'Un camión quedó parado en la ruta con la carga adentro y el chofer durmiendo en la cabina. Hay una ventana de veinte minutos.',
    opciones: [
      {
        texto: 'Vaciarlo ahora, rápido y en silencio',
        riesgo: 'extremo',
        esfuerzo_fisico: true,
        minijuego: 'empaquetar',
        prob_base: 0.42,
        resultados: {
          critico_exito: {
            texto: 'Se llevaron todo en dieciocho minutos y nadie se despertó. Obra de arte.',
            stats: { calle: 7, fama: 6, mana: 4 },
            guita: 4_500_000,
            movidas: 2,
          },
          exito: {
            texto: 'Sacaron la mitad y se fueron antes de que amaneciera.',
            stats: { calle: 4, fama: 3 },
            guita: 2_000_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Salió, pero el chofer se despertó y te vio la cara.',
            stats: { calle: 3, atencion: 18, salud: -8 },
            guita: 900_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'Sonó la alarma a los tres minutos y salieron todos corriendo con las manos vacías.',
            stats: { atencion: 15, salud: -10 },
          },
          critico_fracaso: {
            texto: 'Había custodia esperando. Te fuiste arrastrando y dejaste a dos atrás.',
            stats: { atencion: 30, salud: -30, fama: -4 },
          },
        },
      },
      {
        texto: 'Avisar a los grandes y cobrar comisión',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.7,
        resultados: {
          critico_exito: {
            texto: 'Cobraste el dato y encima quedaste bien con gente que mueve de verdad.',
            stats: { mana: 5, fama: 4 },
            guita: 800_000,
            movidas: 1,
          },
          exito: {
            texto: 'Te pagaron el dato sin discutir. Plata limpia sin mover un dedo.',
            stats: { mana: 3 },
            guita: 400_000,
          },
          exito_con_costo: {
            texto: 'Te pagaron menos de lo hablado y no estás en posición de reclamar.',
            stats: { mana: 1, calle: -2 },
            guita: 150_000,
          },
          fracaso: {
            texto: 'Llegaron tarde y te culparon a vos del dato quemado.',
            stats: { fama: -3, calle: -2 },
          },
          critico_fracaso: {
            texto: 'Salió mal y te vinieron a cobrar el error a tu casa.',
            stats: { salud: -22, fama: -5, calle: -3 },
            guita: -500_000,
          },
        },
      },
      {
        texto: 'Pasar de largo',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.9,
        resultados: {
          critico_exito: {
            texto: 'Al otro día se supo que era una trampa armada. Dormiste como un bebé.',
            stats: { mana: 4, atencion: -6 },
          },
          exito: {
            texto: 'Seguiste de largo y no pasó nada. A veces eso es ganar.',
            stats: { atencion: -3 },
          },
          exito_con_costo: {
            texto: 'No pasó nada, pero te comieron la cabeza toda la semana con lo que podrías haber sacado.',
            stats: { atencion: -2, mana: -1 },
          },
          fracaso: {
            texto: 'Lo vaciaron otros y se hicieron millonarios delante tuyo.',
            stats: { fama: -3 },
          },
          critico_fracaso: {
            texto: 'Te vieron pasar y te acusaron igual de haber sido parte.',
            stats: { atencion: 12, fama: -3 },
          },
        },
      },
    ],
  },
  {
    id: 'adu_dec_03',
    etapa: 'adultez',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'Se llevaron a uno de los tuyos',
    texto: 'Agarraron a un pibe que labura con vos y lo tienen en un galpón del otro lado de la vía. Piden plata y respeto.',
    opciones: [
      {
        texto: 'Ir a sacarlo por la fuerza',
        riesgo: 'extremo',
        esfuerzo_fisico: true,
        minijuego: 'fuga_rescate',
        prob_base: 0.4,
        resultados: {
          critico_exito: {
            texto: 'Lo sacaste entero y encima les dejaste un mensaje que van a recordar años.',
            stats: { calle: 10, fama: 8 },
            movidas: 2,
          },
          exito: {
            texto: 'Salieron los dos caminando. Costó, pero salieron.',
            stats: { calle: 6, fama: 4, salud: -15 },
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Lo sacaste, pero vos quedaste hecho pelota y ellos saben dónde vivís.',
            stats: { calle: 4, atencion: 15, salud: -30 },
            movidas: 1,
          },
          fracaso: {
            texto: 'No pudiste entrar. Volviste solo y con la cara rota.',
            stats: { fama: -4, salud: -20 },
          },
          critico_fracaso: {
            texto: 'Fue una emboscada. Zafaste de casualidad y el pibe no volvió.',
            stats: { calle: -5, fama: -7, salud: -35, atencion: 20 },
          },
        },
      },
      {
        texto: 'Pagar el rescate y comerse el orgullo',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.75,
        resultados: {
          critico_exito: {
            texto: 'Negociaste a la mitad y encima quedaron en deuda con vos.',
            stats: { mana: 6, calle: 2 },
            guita: -300_000,
            movidas: 1,
          },
          exito: {
            texto: 'Pagaste, volvió entero y el asunto se cerró ahí.',
            stats: { mana: 3 },
            guita: -800_000,
          },
          exito_con_costo: {
            texto: 'Volvió, pero se corrió que a vos se te aprieta y se cobra.',
            stats: { mana: 1, calle: -4, fama: -2 },
            guita: -1_200_000,
          },
          fracaso: {
            texto: 'Pagaste y no lo soltaron. Pidieron más.',
            stats: { calle: -5, fama: -4 },
            guita: -1_500_000,
          },
          critico_fracaso: {
            texto: 'Se quedaron con la plata, con el pibe y con tu reputación.',
            stats: { calle: -8, fama: -6 },
            guita: -2_000_000,
          },
        },
      },
      {
        texto: 'No hacer nada. Que se arregle solo',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        resultados: {
          critico_exito: {
            texto: 'Se escapó solo y volvió más leal que antes. Vos ni te ensuciaste.',
            stats: { mana: 3, atencion: -4 },
          },
          exito: {
            texto: 'Lo soltaron a los dos días. No pasó nada y no gastaste un peso.',
            stats: { atencion: -2 },
          },
          exito_con_costo: {
            texto: 'Volvió, pero no te mira igual y los demás tampoco.',
            stats: { calle: -4, fama: -2 },
          },
          fracaso: {
            texto: 'Habló todo lo que sabía y ahora saben todo de vos.',
            stats: { atencion: 20, calle: -5 },
          },
          critico_fracaso: {
            texto: 'No volvió más. En el barrio te señalan como el que lo dejó tirado.',
            stats: { calle: -10, fama: -8, atencion: 15 },
          },
        },
      },
    ],
  },
];
