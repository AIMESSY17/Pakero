/**
 * Eventos de prueba de la etapa Secundario (12-17).
 * Son solo para probar el motor de punta a punta. El contenido real va aparte.
 * Formato definitivo: ver SCHEMA.md
 */

export const EVENTOS_SECUNDARIO = [
  // ------------------- AUTOMATICOS: slot calle -------------------
  {
    id: 'sec_auto_calle_01',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: true,
    titulo: 'Se armó en el recreo',
    texto: 'Le quisieron sacar la mochila a un pibe de tu curso y fuiste el único que se paró de manos. Perdiste, pero te vieron.',
    stats: { calle: 3 },
  },
  {
    id: 'sec_auto_calle_02',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'calle',
    categoria: null,
    esfuerzo_fisico: true,
    titulo: 'Picadito bravo en el potrero',
    texto: 'Jugaste contra los pibes grandes del fondo y no sacaste la pierna ni una vez. Volviste raspado y con respeto.',
    stats: { calle: 2 },
  },

  // ------------------- AUTOMATICOS: slot fama -------------------
  {
    id: 'sec_auto_fama_01',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Te grabaron y se viralizó',
    texto: 'Alguien te filmó contestándole al preceptor y el video dio la vuelta a las tres escuelas del barrio.',
    stats: { fama: 3 },
  },
  {
    id: 'sec_auto_fama_02',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'fama',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Cantaste en el acto',
    texto: 'Te subieron al escenario del acto del 25 y largaste unas rimas que no estaban en el libreto. Quedó en la memoria de todos.',
    stats: { fama: 2 },
  },

  // ------------------- AUTOMATICOS: slot mana / baja atencion -------------------
  {
    id: 'sec_auto_mana_01',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Zafaste del boletín',
    texto: 'Interceptaste la nota antes de que llegara a tu casa y falsificaste la firma sin que nadie pestañee.',
    stats: { mana: 3 },
  },
  {
    id: 'sec_auto_atencion_01',
    etapa: 'secundario',
    tipo: 'automatico',
    slot: 'mana_atencion',
    categoria: null,
    esfuerzo_fisico: false,
    titulo: 'Un mes tranquilo',
    texto: 'Fuiste a clase, volviste derecho a tu casa y no te cruzaste con nadie. El patrullero dejó de frenar en tu esquina.',
    stats: { atencion: -4 },
  },

  // ------------------- DECISION -------------------
  {
    id: 'sec_dec_01',
    etapa: 'secundario',
    tipo: 'decision',
    categoria: 'venta',
    esfuerzo_fisico: false,
    titulo: 'El kiosco de la esquina',
    texto: 'Conseguiste una caja de alfajores a mitad de precio. En el recreo se venden solos, pero el preceptor viene oliendo el negocio.',
    opciones: [
      {
        texto: 'Vender en el recreo, a la vista de todos',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.65,
        resultados: {
          critico_exito: {
            texto: 'Vendiste la caja entera antes del segundo timbre y te encargaron dos más.',
            stats: { mana: 3, fama: 2 },
            guita: 18000,
            ventas: 2,
          },
          exito: {
            texto: 'Se fue casi todo. Volviste a tu casa con los bolsillos llenos de monedas.',
            stats: { mana: 2 },
            guita: 9000,
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Vendiste, pero el preceptor te vio y te tiene entre ceja y ceja.',
            stats: { mana: 1, atencion: 4 },
            guita: 5000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Te decomisaron la caja en el pasillo. Adiós inversión.',
            stats: { atencion: 5 },
            guita: -3000,
          },
          critico_fracaso: {
            texto: 'Te llevaron a dirección, llamaron a tu casa y te dejaron sin nada.',
            stats: { atencion: 9, fama: -2 },
            guita: -6000,
          },
        },
      },
      {
        texto: 'Armar una red: que vendan otros y vos cobrás',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.45,
        resultados: {
          critico_exito: {
            texto: 'Cuatro pibes trabajando para vos y ni te movés del banco. Naciste para esto.',
            stats: { mana: 5, fama: 3, calle: 2 },
            guita: 35000,
            ventas: 3,
          },
          exito: {
            texto: 'Dos pibes vendieron por vos y te trajeron la plata sin chistar.',
            stats: { mana: 3, fama: 1 },
            guita: 16000,
            ventas: 2,
          },
          exito_con_costo: {
            texto: 'Funcionó, pero uno se quedó con parte y tuviste que ir a buscarlo.',
            stats: { mana: 2, calle: 1, salud: -4 },
            guita: 7000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Los pibes se comieron la mercadería y se hicieron los boludos.',
            stats: { fama: -2 },
            guita: -4000,
          },
          critico_fracaso: {
            texto: 'Uno habló, cayeron todos y el nombre que dieron fue el tuyo.',
            stats: { atencion: 12, fama: -3 },
            guita: -8000,
          },
        },
      },
      {
        texto: 'Dejarlo. No vale el quilombo',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.95,
        resultados: {
          critico_exito: {
            texto: 'Devolviste la caja y encima te devolvieron la plata. Salís limpio.',
            stats: { atencion: -3 },
            guita: 2000,
          },
          exito: {
            texto: 'La regalaste entre tus compañeros. No ganaste nada pero nadie te jode.',
            stats: { atencion: -2, fama: 1 },
          },
          exito_con_costo: {
            texto: 'Te bajaste, pero los pibes te bardearon toda la semana.',
            stats: { atencion: -2, fama: -1 },
          },
          fracaso: {
            texto: 'Los alfajores se pusieron duros en tu mochila. Plata tirada.',
            guita: -3000,
          },
          critico_fracaso: {
            texto: 'Te encontraron la caja igual y te sancionaron por nada.',
            stats: { atencion: 4, fama: -1 },
            guita: -3000,
          },
        },
      },
    ],
  },
  {
    id: 'sec_dec_02',
    etapa: 'secundario',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'Te esperan en la salida',
    texto: 'Los pibes del otro colegio quedaron en cruzarte a la salida. Todo el curso ya sabe y va a ir a mirar.',
    opciones: [
      {
        texto: 'Ir de frente y bancársela',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'pelear',
        prob_base: 0.5,
        resultados: {
          critico_exito: {
            texto: 'Los diste vuelta a los dos y ni te despeinaste. Ese día naciste de nuevo.',
            stats: { calle: 8, fama: 6 },
            movidas: 1,
          },
          exito: {
            texto: 'Ganaste la pelea. Te duele la mano pero valió cada golpe.',
            stats: { calle: 5, fama: 3, salud: -5 },
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Quedaste parado al final, pero te dejaron el ojo cerrado una semana.',
            stats: { calle: 3, fama: 1, salud: -14 },
            movidas: 1,
          },
          fracaso: {
            texto: 'Te dieron una paliza delante de todos. Nadie se metió.',
            stats: { calle: -2, fama: -3, salud: -18 },
          },
          critico_fracaso: {
            texto: 'Terminaste en la salita con dos costillas fisuradas y el video dando vueltas.',
            stats: { calle: -3, fama: -5, salud: -28 },
          },
        },
      },
      {
        texto: 'Salir por el portón de atrás',
        riesgo: 'bajo',
        esfuerzo_fisico: true,
        minijuego: null,
        prob_base: 0.75,
        resultados: {
          critico_exito: {
            texto: 'Te fuiste sin que nadie te viera y encima hiciste correr que ellos no fueron.',
            stats: { mana: 4, atencion: -2 },
          },
          exito: {
            texto: 'Zafaste limpio. Mañana es otro día.',
            stats: { mana: 2 },
          },
          exito_con_costo: {
            texto: 'Zafaste, pero alguien te vio salir corriendo y lo contó.',
            stats: { mana: 2, fama: -3 },
          },
          fracaso: {
            texto: 'Te estaban esperando ahí también. Corriste tres cuadras.',
            stats: { fama: -4, salud: -6 },
          },
          critico_fracaso: {
            texto: 'Te agarraron escapando. Peor que perder peleando.',
            stats: { calle: -4, fama: -6, salud: -12 },
          },
        },
      },
      {
        texto: 'Llamar a los pibes del barrio',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.6,
        resultados: {
          critico_exito: {
            texto: 'Aparecieron quince. No hubo pelea: hubo mensaje. Nadie te toca más.',
            stats: { calle: 6, fama: 5 },
            movidas: 1,
          },
          exito: {
            texto: 'Vinieron cuatro y los otros se rajaron antes de que sonara nada.',
            stats: { calle: 3, fama: 2 },
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Se resolvió, pero ahora les debés una y te lo van a cobrar.',
            stats: { calle: 2, atencion: 5 },
          },
          fracaso: {
            texto: 'No vino nadie. Quedaste solo esperando en la vereda.',
            stats: { fama: -4 },
          },
          critico_fracaso: {
            texto: 'Se armó de verdad, cayó la policía y quedaron todos anotados.',
            stats: { atencion: 14, salud: -10 },
          },
        },
      },
    ],
  },
  {
    id: 'sec_dec_03',
    etapa: 'secundario',
    tipo: 'decision',
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'La bici sin candado',
    texto: 'Hay una bici nueva apoyada contra el árbol de la esquina, sin cadena, sin dueño a la vista. Es media hora de plata en el desarmadero.',
    opciones: [
      {
        texto: 'Llevártela y salir pedaleando',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'escapar_policia',
        prob_base: 0.55,
        resultados: {
          critico_exito: {
            texto: 'Volaste seis cuadras sin que nadie reaccione y la vendiste esa misma tarde.',
            stats: { calle: 4, mana: 3 },
            guita: 45000,
            movidas: 1,
          },
          exito: {
            texto: 'La sacaste limpio y sacaste una buena plata.',
            stats: { calle: 2, mana: 2, atencion: 3 },
            guita: 25000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Te la quedaste pero el dueño te vio la cara y anda preguntando.',
            stats: { calle: 2, atencion: 9 },
            guita: 12000,
            movidas: 1,
          },
          fracaso: {
            texto: 'Te corrieron dos cuadras, la soltaste y volviste con las manos vacías.',
            stats: { atencion: 8, salud: -6 },
          },
          critico_fracaso: {
            texto: 'Te agarró el dueño con dos amigos y quedaste tirado en el cordón.',
            stats: { atencion: 12, salud: -20, fama: -3 },
          },
        },
      },
      {
        texto: 'Avisarle al dueño que se la van a robar',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.9,
        resultados: {
          critico_exito: {
            texto: 'Era el ferretero del barrio. Te dio una recompensa y ahora te fía lo que quieras.',
            stats: { fama: 3, atencion: -4 },
            guita: 15000,
          },
          exito: {
            texto: 'Te agradeció y te tiró unos mangos. Nada mal por no hacer nada.',
            stats: { atencion: -3 },
            guita: 5000,
          },
          exito_con_costo: {
            texto: 'Te lo agradeció, pero los pibes te vieron y ahora sos "el buchón".',
            stats: { atencion: -3, calle: -3 },
          },
          fracaso: {
            texto: 'Pensó que se la querías robar vos y te echó a los gritos.',
            stats: { fama: -2 },
          },
          critico_fracaso: {
            texto: 'Llamó a la policía y el que quedó anotado fuiste vos.',
            stats: { atencion: 10, fama: -3 },
          },
        },
      },
    ],
  },
];
