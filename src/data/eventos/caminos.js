/**
 * Eventos ligados al camino.
 *
 * Dos mitades:
 *
 * 1. SECUNDARIO — eventos "estudio friendly". Son los que van llenando el
 *    contador oculto `puntosEstudio` y, de paso, inclinan la balanza entre las
 *    dos sub-variantes (`afinidad: 'fama'` tira para Comunicacion,
 *    `afinidad: 'mana'` para Administracion). El jugador nunca ve el numero:
 *    lo unico que ve, a los 18, es si la opcion de estudiar le sale bien.
 *
 * 2. ADULTEZ — eventos con `camino` (y a veces `sub`). Solo entran al pool si
 *    el jugador viene por ese lado. No son mejores ni peores que los comunes:
 *    cambian el sabor de la etapa, nada mas. El grueso del pool sigue siendo
 *    sin `camino`, disponible para los dos.
 *
 * Los campos `estudio` y `afinidad` se pueden poner en un evento automatico
 * (arriba de todo) o en un resultado suelto de una decision.
 */

// ===========================================================================
// Secundario: los que suman cabeza
// ===========================================================================

const SECUNDARIO_ESTUDIO = [
  {
    id: 'sec_est_auto_calle_01',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Te pusieron de delegado',
    texto:
      'Se armó lío con un profesor y el curso entero te votó para que fueras vos a hablar con la ' +
      'directora. Volviste con la sanción levantada y sin haber levantado la voz.',
    stats: { calle: 3 },
    estudio: 3,
    afinidad: 'fama',
  },
  {
    id: 'sec_est_auto_fama_01',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Ganaste el concurso de oratoria',
    texto:
      'Te anotaron sin preguntarte y terminaste hablando quince minutos delante de tres escuelas. ' +
      'Al final aplaudieron hasta los que te iban a bardear.',
    stats: { fama: 4 },
    estudio: 3,
    afinidad: 'fama',
  },
  {
    id: 'sec_est_auto_fama_02',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'La feria de ciencias',
    texto:
      'Presentaste un proyecto armado con cosas del taller de tu tío y salió segundo a nivel distrital. ' +
      'Tu vieja tiene la foto colgada todavía.',
    stats: { fama: 3, mana: 1 },
    estudio: 3,
    afinidad: 'mana',
  },
  {
    id: 'sec_est_auto_mana_01',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Le llevás la caja al kiosquero',
    texto:
      'El del kiosco de la esquina no sabe sumar y vos sí. Le ordenaste las cuentas de todo el mes ' +
      'a cambio de facturas y de que te fíe.',
    stats: { mana: 4 },
    estudio: 3,
    afinidad: 'mana',
  },
  {
    id: 'sec_est_auto_mana_02',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Una profesora te cazó',
    texto:
      'La de Lengua te frenó en el pasillo y te dijo, sin vueltas, que escribías mejor que la mitad ' +
      'del curso y que no lo desperdiciaras. Te quedó picando una semana.',
    stats: { mana: 2, atencion: -3 },
    estudio: 4,
    afinidad: 'fama',
  },
  {
    id: 'sec_est_auto_calle_02',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'El negocio de los resúmenes',
    texto:
      'Armaste los resúmenes de todas las materias y los vendiste fotocopiados a los cursos de arriba. ' +
      'Nadie te tocó en todo el año: los necesitaban.',
    stats: { calle: 2, mana: 2 },
    estudio: 3,
    afinidad: 'mana',
  },

  {
    id: 'sec_est_dec_01',
    etapa: 'secundario',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 14,
    titulo: 'La beca del municipio',
    texto:
      'Abrieron una beca para pibes del barrio: plata todos los meses hasta terminar el secundario, ' +
      'a cambio de mantener las notas y ir a un taller los sábados. Los sábados son justo el día ' +
      'que se mueve la esquina.',
    opciones: [
      {
        texto: 'Anotarte y bancar los sábados',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        resultados: {
          critico_exito: {
            texto:
              'Te dieron la beca y encima el del taller te tomó de ayudante. Plata fija, cabeza ocupada ' +
              'y un tipo grande que te banca.',
            stats: { mana: 5, fama: 2 },
            guita: 30_000,
            estudio: 6,
            afinidad: 'mana',
          },
          exito: {
            texto: 'Te dieron la beca. Los sábados son un plomo pero la plata entra igual.',
            stats: { mana: 3 },
            guita: 18_000,
            estudio: 5,
            afinidad: 'mana',
          },
          exito_con_costo: {
            texto:
              'Te dieron la beca, pero perderte los sábados te fue corriendo del grupo. ' +
              'Cuando volvés ya se habían reído de algo que no viste.',
            stats: { mana: 3, calle: -3 },
            guita: 12_000,
            estudio: 4,
            afinidad: 'mana',
          },
          fracaso: {
            texto: 'No entraste: pedían un promedio que no tenías. Igual fuiste dos sábados.',
            stats: { mana: 1 },
            estudio: 2,
          },
          critico_fracaso: {
            texto:
              'No entraste y encima se enteró todo el curso de que lo habías intentado. ' +
              'Una semana de cargadas.',
            stats: { fama: -2 },
            estudio: 1,
          },
        },
      },
      {
        texto: 'Los sábados no se tocan. Que se la quede otro',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.7,
        resultados: {
          critico_exito: {
            texto: 'Ese sábado hiciste en una tarde lo que la beca te pagaba en tres meses.',
            stats: { calle: 4, mana: 2 },
            guita: 40_000,
            ventas: 1,
          },
          exito: {
            texto: 'Te quedaste en la esquina y entró plata. Poca, pero sin taller de por medio.',
            stats: { calle: 3 },
            guita: 15_000,
          },
          exito_con_costo: {
            texto: 'Entró algo, pero tu vieja se enteró de lo de la beca y no te habló una semana.',
            stats: { calle: 2, salud: -3 },
            guita: 8_000,
          },
          fracaso: {
            texto: 'No pasó nada ese sábado. Ni el sábado siguiente. La beca ya la tenía otro.',
            stats: { fama: -2 },
          },
          critico_fracaso: {
            texto:
              'Ese sábado se armó, cayó la policía y estuviste tres horas en la comisaría. ' +
              'El del taller te vio pasar en el patrullero.',
            stats: { atencion: 10, salud: -5 },
          },
        },
      },
    ],
  },
  {
    id: 'sec_est_dec_02',
    etapa: 'secundario',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 15,
    titulo: 'Se pudre el último año',
    texto:
      'Te quedaron cuatro materias y el preceptor te lo dijo derecho: así no terminás. ' +
      'Podés meterle a full a las mesas de diciembre o dejarlo correr, que total el título es ' +
      'un papel y en la esquina no te lo pide nadie.',
    opciones: [
      {
        texto: 'Encerrarte a estudiar y sacarlas todas',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.55,
        resultados: {
          critico_exito: {
            texto:
              'Las sacaste todas y con notas que nadie esperaba. Hasta el preceptor te dio la mano.',
            stats: { mana: 7, fama: 3 },
            estudio: 7,
            afinidad: 'mana',
          },
          exito: {
            texto: 'Sacaste las cuatro, raspando, pero las sacaste. Terminás en tiempo.',
            stats: { mana: 5 },
            estudio: 5,
            afinidad: 'mana',
          },
          exito_con_costo: {
            texto:
              'Sacaste tres de cuatro y la que queda te la llevás a marzo. Dos meses sin salir de tu casa.',
            stats: { mana: 4, calle: -4, salud: -4 },
            estudio: 4,
          },
          fracaso: {
            texto: 'Estudiaste y te fue mal igual, que es lo peor de todo.',
            stats: { mana: 2, fama: -2 },
            estudio: 2,
          },
          critico_fracaso: {
            texto: 'Te encerraste dos meses para nada: repetís. Un año entero de regalo.',
            stats: { mana: 1, fama: -5, salud: -6 },
            estudio: 1,
          },
        },
      },
      {
        texto: 'Arreglar con alguien para zafar',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.5,
        resultados: {
          critico_exito: {
            texto:
              'Conseguiste los temas de las cuatro mesas antes de rendir. Aprobaste todo sin abrir un libro ' +
              'y aprendiste algo mucho más útil que las materias.',
            stats: { mana: 6, calle: 4 },
            estudio: 2,
            afinidad: 'mana',
          },
          exito: {
            texto: 'Arreglaste dos y las otras dos las pasaste copiándote. Terminás igual.',
            stats: { mana: 4, calle: 2 },
            estudio: 1,
          },
          exito_con_costo: {
            texto: 'Zafaste, pero quedaste debiéndole un favor a alguien a quien no querés deberle nada.',
            stats: { mana: 3, atencion: 6 },
            estudio: 1,
            flags: ['deuda'],
          },
          fracaso: {
            texto: 'El arreglo se cayó a último momento y te comiste las cuatro.',
            stats: { fama: -3 },
          },
          critico_fracaso: {
            texto:
              'Te agarraron copiándote en dos mesas seguidas. Expulsión, acta y tu vieja llorando en dirección.',
            stats: { fama: -6, atencion: 8, salud: -5 },
          },
        },
      },
    ],
  },
  {
    id: 'sec_est_dec_03',
    etapa: 'secundario',
    tipo: 'decision',
    categoria: null,
    esfuerzo_fisico: false,
    edad_min: 13,
    titulo: 'El taller del centro cultural',
    texto:
      'Abrieron un taller gratis en el centro cultural: uno de radio y comunicación, otro de ' +
      'computación y administración. Van pibes de todos lados y hay una máquina por cabeza. ' +
      'Hay que elegir uno solo.',
    opciones: [
      {
        texto: 'El de radio: aprender a hablarle a la gente',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.68,
        resultados: {
          critico_exito: {
            texto:
              'Terminaste conduciendo el programa de los viernes. Te escuchan hasta en la otra villa ' +
              'y ya te piden que presentes cosas.',
            stats: { fama: 6, mana: 2 },
            estudio: 6,
            afinidad: 'fama',
          },
          exito: {
            texto: 'Aprendiste a hablar sin trabarte y a que no se te note el nervio. Sirve más de lo que parece.',
            stats: { fama: 4 },
            estudio: 5,
            afinidad: 'fama',
          },
          exito_con_costo: {
            texto: 'Te fue bien, pero el micrófono te agarró la lengua floja y bardeaste a quien no debías.',
            stats: { fama: 3, atencion: 5 },
            estudio: 4,
            afinidad: 'fama',
          },
          fracaso: {
            texto: 'Fuiste tres veces y te dio vergüenza. No volviste.',
            stats: { fama: -1 },
            estudio: 1,
            afinidad: 'fama',
          },
          critico_fracaso: {
            texto: 'Te trabaste al aire, se rieron y el audio circuló por todos los celulares del barrio.',
            stats: { fama: -4 },
            estudio: 1,
          },
        },
      },
      {
        texto: 'El de computación: aprender a manejar los números',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.68,
        resultados: {
          critico_exito: {
            texto:
              'A los dos meses le estabas armando las planillas a los del taller. ' +
              'Te dieron una llave para venir cuando quisieras.',
            stats: { mana: 6, calle: 1 },
            estudio: 6,
            afinidad: 'mana',
          },
          exito: {
            texto: 'Aprendiste planillas, facturas y cómo se ordena una caja. Suena aburrido; no lo es.',
            stats: { mana: 4 },
            estudio: 5,
            afinidad: 'mana',
          },
          exito_con_costo: {
            texto: 'Aprendiste, pero te la pasaste adentro y perdiste pisada en la esquina.',
            stats: { mana: 4, calle: -3 },
            estudio: 4,
            afinidad: 'mana',
          },
          fracaso: {
            texto: 'Te aburriste a la tercera clase y no volviste.',
            stats: { mana: 1 },
            estudio: 1,
            afinidad: 'mana',
          },
          critico_fracaso: {
            texto: 'Te echaron por usar las máquinas para otra cosa. Quedaste vetado del centro cultural.',
            stats: { fama: -3, atencion: 4 },
          },
        },
      },
    ],
  },
];

// ===========================================================================
// Adultez: el sabor de cada camino
// ===========================================================================

const ADULTEZ_CALLE = [
  {
    id: 'adu_calle_auto_01',
    etapa: 'adultez',
    camino: 'calle',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: true,
    titulo: 'Sos el que atiende',
    texto:
      'Ya no hace falta que estés en la esquina: la esquina viene a preguntarte a vos. ' +
      'Toda la semana golpeando la puerta gente que quiere hablar "dos minutos".',
    stats: { calle: 5 },
  },
  {
    id: 'adu_calle_auto_02',
    etapa: 'adultez',
    camino: 'calle',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Tu nombre en la pared',
    texto:
      'Amaneció pintado en el paredón de la entrada, con letra grande y bien hecha. ' +
      'Nadie te dijo quién fue y vos no preguntaste.',
    stats: { fama: 5 },
  },
  {
    id: 'adu_calle_auto_03',
    etapa: 'adultez',
    camino: 'calle',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Aprendiste a leer el aire',
    texto:
      'Entraste a un lugar, viste cómo estaban parados dos tipos y te fuiste antes de sentarte. ' +
      'Al otro día te enteraste de que hiciste bien.',
    stats: { mana: 4 },
  },
  {
    id: 'adu_calle_dec_01',
    etapa: 'adultez',
    camino: 'calle',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'Los que no estudiaron tampoco',
    texto:
      'Se juntaron los que quedaron del secundario, los que no se fueron a ningún lado. ' +
      'Traen una idea que necesita gente de confianza y vos sos el único que sabe manejar a todos. ' +
      'Es plata grande y es gente que te conoce desde los doce.',
    opciones: [
      {
        texto: 'Armar la banda vos y repartir parejo',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'combate_prolongado',
        prob_base: 0.55,
        resultados: {
          critico_exito: {
            texto:
              'Salió como en las películas y repartiste hasta el último peso a la vista de todos. ' +
              'Desde ese día no discuten más quién manda.',
            stats: { calle: 8, fama: 6 },
            guita: 1_600_000,
            movidas: 2,
            socio: 10,
            flags: ['palabra'],
          },
          exito: {
            texto: 'Salió y repartiste parejo. Todos se fueron contentos, que es más raro que ganar.',
            stats: { calle: 5, fama: 3 },
            guita: 700_000,
            movidas: 1,
            socio: 6,
          },
          exito_con_costo: {
            texto: 'Salió, pero uno se llevó una mala y lo tuviste que bancar vos con tu parte.',
            stats: { calle: 4, salud: -10 },
            guita: 250_000,
            movidas: 1,
            socio: 4,
          },
          fracaso: {
            texto: 'Se cayó y quedaron todos mirándote a vos, que habías dicho que era segura.',
            stats: { calle: -3, fama: -4 },
            socio: -5,
          },
          critico_fracaso: {
            texto:
              'Se cayó fea, cayó uno preso y las familias te vinieron a buscar a tu casa. ' +
              'Los amigos de los doce no perdonan como los otros.',
            stats: { calle: -7, fama: -7, salud: -15, atencion: 16 },
            socio: -12,
            hijo: -5,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Quedarte con la parte grande sin decirles',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        egoista: true,
        resultados: {
          critico_exito: {
            texto:
              'Te quedaste con el doble y nadie se enteró nunca. Nadie. Eso también es un talento.',
            stats: { mana: 7, calle: 3 },
            guita: 2_000_000,
            movidas: 1,
          },
          exito: {
            texto: 'Te quedaste con más y no preguntaron. La confianza es cómoda cuando es de ellos.',
            stats: { mana: 4 },
            guita: 1_100_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Te quedaste con más y uno sacó la cuenta. No dijo nada, pero sacó la cuenta.',
            stats: { mana: 3, fama: -3 },
            guita: 800_000,
            movidas: 1,
            socio: -8,
          },
          fracaso: {
            texto: 'Sacaron la cuenta entre todos y te lo cobraron en respeto.',
            stats: { calle: -6, fama: -5 },
            socio: -12,
            flags: ['traicion'],
          },
          critico_fracaso: {
            texto:
              'Se enteraron, y no eran cualquiera: eran los que te conocen de pibe. ' +
              'Perdiste la plata, la gente y el único lugar donde no tenías que actuar.',
            stats: { calle: -10, fama: -8, salud: -12 },
            guita: -500_000,
            socio: -20,
            flags: ['traicion'],
          },
        },
      },
    ],
  },
];

const ADULTEZ_ESTUDIAR = [
  {
    id: 'adu_est_auto_01',
    etapa: 'adultez',
    camino: 'estudiar',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Aprobaste una que no ibas a aprobar',
    texto:
      'Rendiste con dos horas de sueño y saliste con un siete. Los de la comisión te miraron ' +
      'distinto: ninguno sabe de dónde venís ni a qué hora estudiás.',
    stats: { mana: 5 },
  },
  {
    id: 'adu_est_auto_02',
    etapa: 'adultez',
    camino: 'estudiar',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Nadie te busca en la facultad',
    texto:
      'Entre la cursada y la biblioteca pasaste medio año en un lugar donde ningún patrullero ' +
      'frena a preguntar. Te bajó hasta la presión.',
    stats: { atencion: -8 },
  },
  {
    id: 'adu_est_auto_03',
    etapa: 'adultez',
    camino: 'estudiar',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Volvés distinto los fines de semana',
    texto:
      'En el barrio te empezaron a decir "el estudiante" con una mezcla de cargada y de orgullo ' +
      'que no terminás de descifrar. Igual, cuando hay quilombo te llaman a vos.',
    stats: { calle: 3 },
  },
  {
    id: 'adu_com_auto_01',
    etapa: 'adultez',
    camino: 'estudiar',
    sub: 'comunicacion',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Te dieron el micrófono en serio',
    texto:
      'Un trabajo práctico terminó siendo un programa real en la radio de la facultad. ' +
      'Le pusiste el tono del barrio y funcionó justamente por eso.',
    stats: { fama: 6 },
  },
  {
    id: 'adu_com_auto_02',
    etapa: 'adultez',
    camino: 'estudiar',
    sub: 'comunicacion',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Sabés dónde mirar la cámara',
    texto:
      'Aprendiste algo que no se enseña en ningún lado del barrio: cómo se para uno cuando lo filman. ' +
      'La diferencia entre sonar temerario y sonar peligroso son dos palabras.',
    stats: { fama: 5 },
  },
  {
    id: 'adu_com_dec_01',
    etapa: 'adultez',
    camino: 'estudiar',
    sub: 'comunicacion',
    tipo: 'decision',
    categoria: 'venta',
    esfuerzo_fisico: false,
    titulo: 'La productora quiere tu historia',
    texto:
      'Una productora chica te ofreció plata por contar de dónde venís: entrevistas, cámara, todo. ' +
      'Es guita fácil y visibilidad de la buena. También es dejar por escrito cosas que hasta hoy ' +
      'solo existen en la memoria de gente que no habla.',
    opciones: [
      {
        texto: 'Contarla, pero contarla vos y con tus reglas',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        resultados: {
          critico_exito: {
            texto:
              'Saliste impecable: contaste lo justo, sonaste como un tipo grande y la nota la vieron ' +
              'en todos lados. Te llamaron tres lugares más al otro día.',
            stats: { fama: 12, mana: 4 },
            guita: 900_000,
            ventas: 2,
          },
          exito: {
            texto: 'Saliste bien y cobraste. Nadie quedó expuesto y tu nombre creció.',
            stats: { fama: 8, mana: 2 },
            guita: 500_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto:
              'Salió bien pero editaron una parte que no querías y ahora hay una frase tuya circulando ' +
              'sin contexto.',
            stats: { fama: 6, atencion: 12 },
            guita: 350_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'La nota no la vio nadie y encima quedó tu cara pegada a un tema que preferías lejos.',
            stats: { fama: -3, atencion: 8 },
            guita: 80_000,
          },
          critico_fracaso: {
            texto:
              'Te sacaron de contexto entero y quedaste como el villano del capítulo. ' +
              'Del barrio te llamaron para preguntarte qué mierda hiciste.',
            stats: { fama: -8, calle: -6, atencion: 18 },
            socio: -10,
            flags: ['buchon'],
          },
        },
      },
      {
        texto: 'Decir que no y usar el contacto para otra cosa',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.58,
        resultados: {
          critico_exito: {
            texto:
              'Dijiste que no a la historia y les vendiste otra cosa: producción, contactos, logística. ' +
              'Terminaste facturándoles el triple y sin decir una palabra de vos.',
            stats: { mana: 9, fama: 5 },
            guita: 1_200_000,
            ventas: 2,
          },
          exito: {
            texto: 'Dijiste que no y te quedaste con el contacto, que valía más que la nota.',
            stats: { mana: 5, fama: 2 },
            guita: 400_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Dijiste que no y se ofendieron. Igual el contacto quedó, medio frío.',
            stats: { mana: 3, fama: -2 },
            guita: 150_000,
          },
          fracaso: {
            texto: 'Dijiste que no y la hicieron igual, con otro, hablando de vos en tercera persona.',
            stats: { fama: -4, atencion: 6 },
          },
          critico_fracaso: {
            texto:
              'Dijiste que no y salieron a buscar la historia por otro lado. Encontraron gente ' +
              'con menos códigos y más ganas de hablar.',
            stats: { fama: -6, atencion: 16 },
            flags: ['buchon'],
          },
        },
      },
    ],
  },
  {
    id: 'adu_adm_auto_01',
    etapa: 'adultez',
    camino: 'estudiar',
    sub: 'administracion',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'El que ordena los números',
    texto:
      'Empezaron a mandarte a vos las cuentas de gente que ni conocés, porque se corrió que sabés ' +
      'ordenar un desastre sin hacer preguntas.',
    stats: { fama: 4 },
  },
  {
    id: 'adu_adm_auto_02',
    etapa: 'adultez',
    camino: 'estudiar',
    sub: 'administracion',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Aprendiste dónde mirar',
    texto:
      'Una materia entera sobre flujo de caja y de golpe entendiste por qué te venían robando ' +
      'hace tres años. No dijiste nada: lo corregiste y listo.',
    stats: { mana: 6 },
  },
  {
    id: 'adu_adm_dec_01',
    etapa: 'adultez',
    camino: 'estudiar',
    sub: 'administracion',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: false,
    titulo: 'La estructura que nadie ve',
    texto:
      'Con lo que aprendiste podrías armar algo que ordene toda la plata que se mueve alrededor tuyo: ' +
      'sociedades, facturas, un circuito que aguante que lo miren. Lleva meses y cuesta guita, ' +
      'y mientras lo armás no estás afuera generando.',
    opciones: [
      {
        texto: 'Armar la estructura completa, en serio',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: 'prensado',
        prob_base: 0.58,
        resultados: {
          critico_exito: {
            texto:
              'Quedó una máquina. Todo entra por un lado y sale por otro con papel, y nadie que mire ' +
              'de afuera entiende nada. Te acabás de comprar diez años de tranquilidad.',
            stats: { mana: 10, atencion: -20 },
            guita: 1_500_000,
            movidas: 2,
          },
          exito: {
            texto: 'Quedó funcionando. Menos ruido, más margen, y por primera vez sabés cuánto tenés.',
            stats: { mana: 7, atencion: -12 },
            guita: 700_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto:
              'Funciona, pero te comió seis meses y en ese tiempo se te fue negocio a la competencia.',
            stats: { mana: 5, calle: -5, atencion: -8 },
            guita: 100_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'La armaste mal y se cayó sola. Perdiste tiempo, plata y confianza en tu propia cabeza.',
            stats: { mana: 2, fama: -3 },
            guita: -500_000,
          },
          critico_fracaso: {
            texto:
              'La estructura dejaba un rastro que no habías visto y alguien lo siguió hasta el final. ' +
              'Lo que armaste para taparte te dejó todo por escrito.',
            stats: { mana: 1, atencion: 25 },
            guita: -900_000,
            flags: ['desastre'],
          },
        },
      },
      {
        texto: 'Al carajo. Seguir a mano, como siempre',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.66,
        resultados: {
          critico_exito: {
            texto:
              'A mano, de memoria y sin un papel. No hay nada que allanar porque no hay nada escrito. ' +
              'A veces lo viejo es lo mejor.',
            stats: { mana: 5, calle: 4, atencion: -6 },
            guita: 600_000,
            movidas: 1,
          },
          exito: {
            texto: 'Seguiste como siempre y como siempre funcionó.',
            stats: { calle: 3 },
            guita: 350_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Funcionó, pero te diste cuenta de que no tenés idea de cuánta plata perdés por año.',
            stats: { calle: 2, mana: -2 },
            guita: 150_000,
          },
          fracaso: {
            texto: 'Sin estructura te robaron de adentro y ni te enteraste hasta que faltó mucho.',
            stats: { fama: -3 },
            guita: -400_000,
            socio: -6,
          },
          critico_fracaso: {
            texto:
              'Todo a mano y todo en la cabeza, hasta que te la revolvieron. Un allanamiento y ' +
              'cinco años de desprolijidad quedaron arriba de una mesa.',
            stats: { atencion: 22, fama: -5 },
            guita: -1_200_000,
            flags: ['desastre'],
          },
        },
      },
    ],
  },
];

export const EVENTOS_CAMINOS = [...SECUNDARIO_ESTUDIO, ...ADULTEZ_CALLE, ...ADULTEZ_ESTUDIAR];
