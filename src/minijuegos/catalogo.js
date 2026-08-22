/**
 * Catalogo de los diez minijuegos: SOLO datos, cero Phaser.
 *
 * Esto es a proposito. La interfaz de React necesita el nombre y el icono de
 * un minijuego para pintar una opcion, pero no necesita el motor. Si este
 * archivo importara las escenas, Phaser (1.2 MB) entraria al bundle inicial.
 * Las escenas viven en registro.js, que solo carga PhaserGame con import().
 *
 * NO hay ni va a haber minijuegos de disparar o apuntar un arma a personas.
 */
export const CATALOGO = {
  pelear: {
    nombre: 'Pelear',
    icono: '🥊',
    escena: 'Pelear',
    config: {
      titulo: 'PELEAR',
      instrucciones: 'Puño le gana a patada · patada a cubrirse · cubrirse a puño. Al mejor de 3.',
      rondasParaGanar: 2,
      tiempoRonda: 3000,
    },
  },

  combate_prolongado: {
    nombre: 'Combate prolongado',
    icono: '🥋',
    escena: 'Pelear',
    config: {
      titulo: 'COMBATE PROLONGADO',
      instrucciones: 'Al mejor de 5, y cada ronda tenés menos tiempo para decidir.',
      rondasParaGanar: 3,
      tiempoRonda: 3000,
      decaimiento: 280,
      tiempoMinimo: 1400,
    },
  },

  escapar_policia: {
    nombre: 'Escapar de la policía',
    icono: '🚔',
    escena: 'Esquivar',
    config: {
      titulo: 'ESCAPAR DE LA YUTA',
      instrucciones: 'Arrastrá para esquivar. Aguantá hasta que se corte el tiempo.',
      modo: 'sobrevivir',
      duracion: 18000,
      vidas: 3,
    },
  },

  fuga_rescate: {
    nombre: 'Fuga y rescate',
    icono: '🆘',
    escena: 'Esquivar',
    config: {
      titulo: 'FUGA Y RESCATE',
      instrucciones: 'Juntá a los tuyos (los dorados) sin comerte los rojos.',
      modo: 'rescatar',
      duracion: 26000,
      aRescatar: 3,
      vidas: 3,
      intervaloSpawn: 560,
    },
  },

  cruce_frontera: {
    nombre: 'Cruce de frontera',
    icono: '🛂',
    escena: 'Carriles',
    config: {
      titulo: 'CRUCE DE FRONTERA',
      instrucciones: 'Tocá arriba para avanzar un carril. Cruzá dos veces sin que te vean.',
      cruces: 2,
      vidas: 3,
      duracion: 30000,
    },
  },

  pasar_droga: {
    nombre: 'Pasar la mercadería',
    icono: '🤝',
    escena: 'Timing',
    config: {
      titulo: 'PASAR LA MERCADERÍA',
      instrucciones: 'Frená el pulso en la franja verde. El centro dorado vale doble.',
      rondas: 5,
    },
  },

  prensado: {
    nombre: 'Prensado',
    icono: '🧱',
    escena: 'Presion',
    config: {
      titulo: 'PRENSADO',
      instrucciones: 'Mantené la presión adentro de la franja. Si te pasás, revienta.',
      duracion: 20000,
    },
  },

  empaquetar: {
    nombre: 'Empaquetar',
    icono: '📦',
    escena: 'Tocar',
    config: {
      titulo: 'EMPAQUETAR',
      instrucciones: 'Cerrá los paquetes verdes antes de que se achiquen. Los rojos no se tocan.',
      duracion: 22000,
      objetivo: 18,
    },
  },

  perderla_de_vista: {
    nombre: 'Perderla de vista',
    icono: '🥤',
    escena: 'Vasos',
    config: {
      titulo: 'NO LA PIERDAS DE VISTA',
      instrucciones: 'Mirá dónde queda y seguila mientras los mezclan.',
      rondas: 4,
    },
  },

  armar_porro: {
    nombre: 'Armar',
    icono: '🌀',
    escena: 'Secuencia',
    config: {
      titulo: 'ARMARLO BIEN',
      instrucciones: 'Memorizá el orden de los pasos y repetilo.',
      rondas: 4,
      largoInicial: 3,
    },
  },
};

export const minijuegoPorId = (id) => CATALOGO[id] ?? null;
export const IDS_MINIJUEGOS = Object.keys(CATALOGO);
