/**
 * Eventos de crisis: se disparan cuando el ingreso anual bajó o se estancó
 * 3 años seguidos ("mala racha"). Sirven para las dos etapas, asi que no
 * llevan `etapa`. Formato de decision normal (ver SCHEMA.md).
 */

export const EVENTOS_CRISIS = [
  {
    id: 'crisis_01',
    tipo: 'decision',
    esCrisis: true,
    categoria: 'movida',
    esfuerzo_fisico: true,
    titulo: 'Tres años en bajada',
    texto: 'La plata no entra hace rato, los que te debían no aparecen y el barrio ya lo nota. Algo hay que hacer y hay que hacerlo ahora.',
    opciones: [
      {
        texto: 'Salir a cobrar todo lo que te deben, uno por uno',
        riesgo: 'alto',
        esfuerzo_fisico: true,
        minijuego: 'combate_prolongado',
        prob_base: 0.5,
        resultados: {
          critico_exito: {
            texto: 'Cobraste hasta el último peso y de paso quedó claro que volviste.',
            stats: { calle: 8, fama: 5 },
            guita: 2_500_000,
            movidas: 2,
          },
          exito: {
            texto: 'Cobraste la mayoría. Se acabó el veranito de los deudores.',
            stats: { calle: 5, fama: 2, salud: -8 },
            guita: 1_200_000,
            movidas: 1,
          },
          exito_con_costo: {
            texto: 'Cobraste algo, pero uno te denunció y ahora tenés causa nueva.',
            stats: { calle: 3, atencion: 16, salud: -12 },
            guita: 500_000,
            movidas: 1,
          },
          fracaso: {
            texto: 'Te cerraron las puertas en la cara. Nadie te tiene miedo ya.',
            stats: { calle: -4, fama: -3, salud: -10 },
          },
          critico_fracaso: {
            texto: 'Se juntaron entre todos y te dieron una lección delante del barrio.',
            stats: { calle: -8, fama: -6, salud: -25 },
          },
        },
      },
      {
        texto: 'Rearmar todo de cero con lo poco que queda',
        riesgo: 'medio',
        esfuerzo_fisico: false,
        minijuego: 'prensado',
        prob_base: 0.55,
        resultados: {
          critico_exito: {
            texto: 'Reinventaste el negocio entero y te salió mejor que antes.',
            stats: { mana: 8, fama: 3 },
            guita: 1_800_000,
            movidas: 1,
          },
          exito: {
            texto: 'Volviste a tener algo que funcione. Despacio, pero funciona.',
            stats: { mana: 5 },
            guita: 700_000,
          },
          exito_con_costo: {
            texto: 'Arrancaste de nuevo pero te comiste todos los ahorros en el intento.',
            stats: { mana: 3, salud: -6 },
            guita: -300_000,
          },
          fracaso: {
            texto: 'Perdiste lo poco que habías puesto. Estás peor que antes.',
            stats: { mana: -2 },
            guita: -800_000,
          },
          critico_fracaso: {
            texto: 'Te fundiste del todo y encima quedaste debiéndole a gente pesada.',
            stats: { mana: -3, fama: -5, salud: -10 },
            guita: -1_500_000,
          },
        },
      },
      {
        texto: 'Bajar un cambio y esperar que pase la tormenta',
        riesgo: 'nulo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.7,
        resultados: {
          critico_exito: {
            texto: 'Te hiciste el muerto un año, bajó el calor y volviste con la cancha libre.',
            stats: { atencion: -20, salud: 10, mana: 3 },
          },
          exito: {
            texto: 'Un año tranquilo. No ganaste nada pero recuperaste el aire.',
            stats: { atencion: -12, salud: 6 },
          },
          exito_con_costo: {
            texto: 'Descansaste, pero te comieron media clientela mientras no estabas.',
            stats: { atencion: -8, fama: -4 },
          },
          fracaso: {
            texto: 'Desapareciste y cuando volviste ya no quedaba lugar para vos.',
            stats: { fama: -6, calle: -4 },
          },
          critico_fracaso: {
            texto: 'Te borraste tanto que hasta los tuyos se fueron con otro.',
            stats: { fama: -8, calle: -7 },
          },
        },
      },
    ],
  },
  {
    id: 'crisis_02',
    tipo: 'decision',
    esCrisis: true,
    categoria: 'venta',
    esfuerzo_fisico: false,
    titulo: 'La oferta desesperada',
    texto: 'Con la racha que traés, apareció gente de afuera ofreciéndote un negocio que en tu mejor momento hubieras rechazado sin pensar.',
    opciones: [
      {
        texto: 'Aceptar el negocio con los de afuera',
        riesgo: 'extremo',
        esfuerzo_fisico: false,
        minijuego: 'perderla_de_vista',
        prob_base: 0.45,
        resultados: {
          critico_exito: {
            texto: 'Diste el golpe del año y volviste a estar en boca de todos.',
            stats: { fama: 10, mana: 5 },
            guita: 6_000_000,
            ventas: 3,
          },
          exito: {
            texto: 'Salió bien. Volvés a tener plata en el bolsillo y aire para respirar.',
            stats: { fama: 4, mana: 2 },
            guita: 2_500_000,
            ventas: 2,
          },
          exito_con_costo: {
            texto: 'Ganaste, pero ahora les debés favores a gente que no perdona.',
            stats: { fama: 2, atencion: 20 },
            guita: 1_000_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Se cayó todo y quedaste debiendo la mercadería que ni viste.',
            stats: { atencion: 15, fama: -4 },
            guita: -1_800_000,
          },
          critico_fracaso: {
            texto: 'Era una cama de punta a punta. Perdiste la plata, la palabra y un dedo.',
            stats: { atencion: 28, fama: -8, salud: -25 },
            guita: -3_000_000,
          },
        },
      },
      {
        texto: 'Vender lo que tengas para levantar caja',
        riesgo: 'bajo',
        esfuerzo_fisico: false,
        minijuego: null,
        prob_base: 0.75,
        resultados: {
          critico_exito: {
            texto: 'Liquidaste todo a buen precio y hasta te sobró para reinvertir.',
            stats: { mana: 5 },
            guita: 1_500_000,
            ventas: 2,
          },
          exito: {
            texto: 'Sacaste lo justo para tapar los agujeros más urgentes.',
            stats: { mana: 2 },
            guita: 600_000,
            ventas: 1,
          },
          exito_con_costo: {
            texto: 'Vendiste de apuro y regalaste medio patrimonio.',
            stats: { fama: -3 },
            guita: 250_000,
            ventas: 1,
          },
          fracaso: {
            texto: 'Nadie te quiso comprar nada. Se nota la desesperación de lejos.',
            stats: { fama: -4, mana: -2 },
          },
          critico_fracaso: {
            texto: 'Te compraron todo por monedas y encima se rieron en tu cara.',
            stats: { fama: -6, calle: -4 },
            guita: 60_000,
          },
        },
      },
    ],
  },
];
