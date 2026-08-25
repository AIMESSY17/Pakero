import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * Piedra / papel / tijera de barrio: puño, patada, cubrirse.
 *
 *   puño     le gana a  patada    (le entra antes)
 *   patada   le gana a  cubrirse  (le rompe la guardia)
 *   cubrirse le gana a  puño      (bloquea y contesta)
 *
 * Timer por ronda; si no elegís, perdés la ronda. Al mejor de 3 o de 5.
 * Con `decaimiento` el tiempo por ronda se acorta: eso es combate_prolongado.
 *
 * Los tres botones se reparten el ancho que haya, asi que en un celular
 * vertical quedan igual de anchos que en desktop, solo que mas angostos.
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

    this.crearBotones();

    // Lo que queda entre el encabezado y los botones es el "ring".
    const ringTop = this.topJuego + this.fsn(26);
    const ringBottom = this.yBotones - this.altoBoton / 2 - 12;
    const centro = (ringTop + ringBottom) / 2;

    this.marcador = this.crearMarcador(this.A / 2, this.topJuego + this.fsn(13));

    const tamRival = Phaser.Math.Clamp(Math.min(this.A, ringBottom - ringTop) * 0.42, 40, 72);
    this.textoRival = this.add
      .text(this.A / 2, centro - tamRival * 0.15, '', {
        fontFamily: FUENTE_DISPLAY,
        fontSize: `${Math.round(tamRival)}px`,
        color: CSS.tiza,
      })
      .setOrigin(0.5);

    this.textoEstado = this.add
      .text(this.A / 2, centro + tamRival * 0.62, '', {
        fontFamily: FUENTE,
        fontSize: this.fs(16),
        color: CSS.humo,
        align: 'center',
        wordWrap: { width: this.A - this.margen * 2 },
      })
      .setOrigin(0.5);

    this.siguienteRonda();
  }

  crearBotones() {
    const hueco = Math.max(8, Math.min(20, Math.round(this.A * 0.025)));
    const ancho = Math.min(210, Math.floor((this.A - this.margen * 2 - hueco * 2) / 3));
    const alto = Phaser.Math.Clamp(Math.round(this.H * 0.2), 86, 130);
    const y = this.H - alto / 2 - this.margen * 1.4;

    this.altoBoton = alto;
    this.yBotones = y;

    this.botones = GOLPES.map((golpe, i) => {
      const x = this.A / 2 + (i - 1) * (ancho + hueco);
      const cont = this.botonGrande(x, y, ancho, alto, golpe.icono, () => this.elegir(golpe.id), {
        sub: golpe.label,
        tam: Math.round(Phaser.Math.Clamp(Math.min(ancho * 0.42, alto * 0.4), 26, 48)),
      });
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
    this.textoEstado.setText('Elegí antes de que se te venga encima').setColor(CSS.humo);
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

    this.textoRival.setText(porId(suId).icono).setColor(CSS.tiza);

    let resultado;
    if (!miId) resultado = 'perdida';
    else if (miId === suId) resultado = 'empate';
    else if (porId(miId).vence === suId) resultado = 'ganada';
    else resultado = 'perdida';

    const yFlash = this.textoRival.y;
    if (resultado === 'ganada') {
      this.misRondas += 1;
      this.textoEstado.setText('Se la comió').setColor(CSS.verde);
      this.flash('¡TOMÁ!', CSS.verde, yFlash);
    } else if (resultado === 'perdida') {
      this.susRondas += 1;
      this.textoEstado.setText(miId ? 'Te la comiste vos' : 'Te quedaste duro').setColor(CSS.rojo);
      this.flash(miId ? 'AY' : '¡TARDE!', CSS.rojo, yFlash);
      this.cameras.main.shake(160, 0.006);
    } else {
      this.textoEstado.setText('Chocaron los dos').setColor(CSS.dorado);
    }

    this.actualizarMarcador();
    this.esperar(900, () => this.siguienteRonda());
  }

  actualizarMarcador() {
    this.marcador.setText(
      `${this.misRondas}  —  ${this.susRondas}   (al mejor de ${this.paraGanar * 2 - 1})`
    );
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
