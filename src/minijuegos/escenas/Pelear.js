import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * Piedra / papel / tijera de barrio: puño, patada, cubrirse.
 *
 *   puño     le gana a  patada    (le entra antes)
 *   patada   le gana a  cubrirse  (le rompe la guardia)
 *   cubrirse le gana a  puño      (bloquea y contesta)
 *
 * Timer por ronda; si no elegís, perdés la ronda. Al mejor de 3 o de 5.
 * Con `decaimiento` el tiempo por ronda se acorta: eso es combate_prolongado.
 */

const GOLPES = [
  { id: 'puno', label: 'PUÑO', icono: '👊', vence: 'patada' },
  { id: 'patada', label: 'PATADA', icono: '🦵', vence: 'cubrirse' },
  { id: 'cubrirse', label: 'CUBRIRSE', icono: '🛡️', vence: 'puno' },
];

const porId = (id) => GOLPES.find((g) => g.id === id);

export class PelearScene extends BaseMinijuego {
  arrancar() {
    this.paraGanar = this.cfg.rondasParaGanar ?? 3;
    this.tiempoRonda = this.cfg.tiempoRonda ?? 3000;
    this.decaimiento = this.cfg.decaimiento ?? 0;
    this.tiempoMinimo = this.cfg.tiempoMinimo ?? 1200;

    this.misRondas = 0;
    this.susRondas = 0;
    this.ronda = 0;

    this.marcador = this.crearMarcador(ANCHO / 2, 92);
    this.textoRival = this.add
      .text(ANCHO / 2, 168, '', { fontFamily: FUENTE_DISPLAY, fontSize: '64px', color: CSS.tiza })
      .setOrigin(0.5);
    this.textoEstado = this.add
      .text(ANCHO / 2, 236, '', { fontFamily: FUENTE, fontSize: '17px', color: CSS.humo })
      .setOrigin(0.5);

    this.crearBotones();
    this.siguienteRonda();
  }

  crearBotones() {
    const ancho = 210;
    const separacion = 236;
    const y = ALTO - 90;
    this.botones = GOLPES.map((golpe, i) => {
      const x = ANCHO / 2 + (i - 1) * separacion;
      const cont = this.botonGrande(x, y, ancho, 118, golpe.icono, () => this.elegir(golpe.id), {
        sub: golpe.label,
      });
      cont.txt.setFontSize(48);
      return cont;
    });
  }

  activarBotones(activos) {
    for (const b of this.botones) {
      b.fondo.input && (b.fondo.input.enabled = activos);
      b.setAlpha(activos ? 1 : 0.45);
    }
  }

  siguienteRonda() {
    if (this.terminado) return;
    if (this.misRondas >= this.paraGanar || this.susRondas >= this.paraGanar) return this.cerrar();

    this.ronda += 1;
    this.eligio = false;
    this.actualizarMarcador();
    this.textoRival.setText('?').setColor(CSS.humoTenue);
    this.textoEstado.setText('Elegí antes de que se te venga encima');
    this.activarBotones(true);

    const dur = Math.max(this.tiempoMinimo, this.tiempoRonda - this.decaimiento * (this.ronda - 1));
    this.reloj?.detener();
    this.reloj = this.barraTiempo(dur, () => {
      if (!this.eligio) this.resolver(null);
    });
  }

  elegir(id) {
    if (this.eligio || this.terminado) return;
    this.eligio = true;
    this.reloj?.detener();
    this.activarBotones(false);
    this.resolver(id);
  }

  resolver(miId) {
    // El guardaespaldas te "arma" la ronda de vez en cuando.
    let suId;
    if (miId && this.bonusCombate > 0 && Phaser.Math.FloatBetween(0, 1) < this.bonusCombate) {
      suId = porId(miId).vence;
    } else {
      suId = Phaser.Utils.Array.GetRandom(GOLPES).id;
    }

    this.textoRival.setText(porId(suId).icono);

    let resultado;
    if (!miId) resultado = 'perdida';
    else if (miId === suId) resultado = 'empate';
    else if (porId(miId).vence === suId) resultado = 'ganada';
    else resultado = 'perdida';

    if (resultado === 'ganada') {
      this.misRondas += 1;
      this.textoEstado.setText('Se la comió').setColor(CSS.verde);
      this.flash('¡TOMÁ!', CSS.verde, 300);
    } else if (resultado === 'perdida') {
      this.susRondas += 1;
      this.textoEstado.setText(miId ? 'Te la comiste vos' : 'Te quedaste duro').setColor(CSS.rojo);
      this.flash(miId ? 'AY' : '¡TARDE!', CSS.rojo, 300);
      this.cameras.main.shake(160, 0.006);
    } else {
      this.textoEstado.setText('Chocaron los dos').setColor(CSS.dorado);
    }

    this.actualizarMarcador();
    this.esperar(900, () => this.siguienteRonda());
  }

  actualizarMarcador() {
    this.marcador.setText(`${this.misRondas}  —  ${this.susRondas}   (al mejor de ${this.paraGanar * 2 - 1})`);
    this.marcador.setColor(this.misRondas >= this.susRondas ? CSS.verde : CSS.rojo);
  }

  cerrar() {
    const gane = this.misRondas > this.susRondas;
    const margen = (this.misRondas - this.susRondas) / this.paraGanar;
    // Ganar arranca en 0.6 y sube con el margen; perder cae segun lo que aguantaste.
    const score = gane
      ? 0.6 + 0.4 * Phaser.Math.Clamp(margen, 0, 1)
      : 0.4 * Phaser.Math.Clamp(this.misRondas / this.paraGanar, 0, 1);
    this.terminar(score, gane ? '¡Lo diste vuelta!' : 'Te dieron');
  }
}
