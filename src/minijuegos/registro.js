import { PelearScene } from './escenas/Pelear.js';
import { EsquivarScene } from './escenas/Esquivar.js';
import { CarrilesScene } from './escenas/Carriles.js';
import { TimingScene } from './escenas/Timing.js';
import { PresionScene } from './escenas/Presion.js';
import { TocarScene } from './escenas/Tocar.js';
import { VasosScene } from './escenas/Vasos.js';
import { SecuenciaScene } from './escenas/Secuencia.js';
import { CATALOGO } from './catalogo.js';

/**
 * Las escenas de Phaser. Este archivo arrastra Phaser entero, asi que SOLO lo
 * importa PhaserGame.jsx con import() dinamico. La interfaz de React usa
 * catalogo.js, que son datos sueltos y no pesa nada.
 *
 * Ocho escenas cubren los diez minijuegos: `pelear` y `combate_prolongado`
 * comparten motor (cambia el largo y el timer), igual que `escapar_policia`
 * y `fuga_rescate` (cambia el objetivo).
 */
const ESCENAS = {
  Pelear: PelearScene,
  Esquivar: EsquivarScene,
  Carriles: CarrilesScene,
  Timing: TimingScene,
  Presion: PresionScene,
  Tocar: TocarScene,
  Vasos: VasosScene,
  Secuencia: SecuenciaScene,
};

/** Devuelve { escena, config } listo para montar, o null si el id no existe. */
export function escenaPara(id) {
  const def = CATALOGO[id];
  if (!def) return null;
  const escena = ESCENAS[def.escena];
  if (!escena) return null;
  return { escena, config: def.config };
}
