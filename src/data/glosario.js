/**
 * Texto breve para explicar cada stat y cada contador al tocarlos/pasar el
 * mouse. Se muestra en la Ficha (ver ui/Ficha.jsx). Todo en base a las
 * fórmulas reales de core/formulas.js y core/engine.js, para no mentir.
 */

export const GLOSARIO_STATS = {
  calle: {
    que: 'Cuánto respeto y aguante tenés en la esquina.',
    como: 'Peleando, bancando la parada, movidas con riesgo físico.',
    sirve: 'Es la llave para conquistar Barrio/Villa y Provincia. Suma poco a la guita por sí sola: la plata sale de jugar, no de tener el número alto.',
  },
  fama: {
    que: 'Cuánto suena tu nombre fuera de tu cuadra.',
    como: 'Ventas grandes, prensa, comprar activos de lujo.',
    sirve: 'Abre Provincia/País/Picantillo y define qué tan rara sale tu final. Suma poco a la guita por sí sola: la plata sale de jugar, no de tener el número alto.',
  },
  mana: {
    que: 'Viveza para zafar de líos y negociar mejor.',
    como: 'Resolver bien las decisiones, sobre todo las Movidas.',
    sirve: 'Mejora la chance de éxito en Ventas y Movidas con riesgo.',
  },
  atencion: {
    que: 'Cuánto te tiene marcado la yuta.',
    como: 'Movidas arriesgadas, fracasos, opciones de riesgo alto.',
    sirve: 'Nada bueno: al 100% vas preso directo, y entre 80-99% tenés 50% de caer en cualquier evento de riesgo. Conviene tenerla baja.',
  },
  salud: {
    que: 'El cuerpo que te queda después de todo lo que aguantaste.',
    como: 'Baja con golpes y riesgo; sube con médicos y descanso.',
    sirve: 'Si llega a 0, te morís. Por debajo de 30 te bloquea las opciones de riesgo físico alto y te baja el ingreso.',
  },
};

export const GLOSARIO_CONTADORES = {
  ventas: {
    que: 'Negocios de venta que cerraste en toda tu carrera.',
    como: 'Elegir y ganar eventos de categoría Venta.',
    sirve: 'Suma $20.000 al ingreso anual por cada una, y es lo que te mide contra el Rival en el duelo eterno.',
  },
  movidas: {
    que: 'Jugadas arriesgadas que hiciste en toda tu carrera.',
    como: 'Elegir y ganar eventos de categoría Movida.',
    sirve: 'Suma $25.000 al ingreso anual por cada una.',
  },
  territorios: {
    que: 'Zonas que conquistaste, de 0 a 4.',
    como: 'Cumplir el umbral de stats de cada nivel y ganar el minijuego de conquista.',
    sirve: 'Paga $800.000 de renta cada año que lo tengas, sube Calle y Fama al conquistarlo, y define junto con la Fama qué tan raro sale tu final.',
  },
};

/** Lo que sumó la bifurcación de los 18 y los dos vínculos que el juego sigue. */
export const GLOSARIO_VINCULOS = {
  camino: {
    que: 'El camino que elegiste a los 18: seguir estudiando o meterle a la calle.',
    como: 'Se define en el evento de los 18. Si estudiás, la carrera que te toca sale sola de qué tipo de eventos "de cabeza" te fueron saliendo en el secundario.',
    sirve: 'Cambia parte de los eventos que te salen en la adultez y pesa fuerte en la biografía del final. Desde los 25 a los 30 hay una segunda chance de reconvertirte, pagando.',
  },
  hijo: {
    que: 'Cómo le está yendo a tu pibe, de 0 a 100.',
    como: 'Sube cuando le ponés plata, tiempo y presencia; baja cuando elegís la movida por encima de él, y baja solo si vivís marcado o roto.',
    sirve: 'No entra en ninguna fórmula de guita ni de tirada: define el bloque de la biografía final que habla de él. Es la única cosa del juego que no se mide en plata.',
  },
  socio: {
    que: 'El único tipo que te acompaña toda la carrera además del Rival.',
    como: 'Aparece entre los 19 y los 24 y tiene tres momentos: cuando se suma, cuando se prueba y cuando se cierra el arco.',
    sirve: 'Cómo lo trataste decide si en el momento de crisis te salva o te da vuelta la cara. La lealtad no tiene barra a propósito: se nota en lo que él hace, no en un número.',
  },
};
