import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * prensado: mantené apretado para que suba la presión y soltá para que baje.
 * Hay que sostenerla dentro de la franja verde. Si te pasás, se arruina el
 * ladrillo; si te quedás corto, no prensa nada. La franja se mueve sola.
 */
export class PresionScene extends BaseMinijuego {
  arrancar() {
    this.duracion = this.cfg.duracion ?? 20000;
    this.presion = 20;
    this.tiempoEnZona = 0;
    this.tiempoTotal = 0;
    this.reventadas = 0;

    const x = ANCHO / 2;
    this.medidorAlto = 260;
    this.medidorY = 300;

    this.add
      .rectangle(x, this.medidorY, 120, this.medidorAlto, COLOR.panel)
      .setStrokeStyle(2, COLOR.borde);

    this.franja = this.add.rectangle(x, this.medidorY, 132, 60, COLOR.verde, 0.28);
    this.franja.setStrokeStyle(2, COLOR.verde);

    this.relleno = this.add.rectangle(x, this.medidorY + this.medidorAlto / 2, 112, 0, COLOR.verde);
    this.relleno.setOrigin(0.5, 1);

    this.etiqueta = this.add
      .text(x, this.medidorY - this.medidorAlto / 2 - 34, 'PRESIÓN', {
        fontFamily: FUENTE_DISPLAY,
        fontSize: '22px',
        color: CSS.humo,
      })
      .setOrigin(0.5);

    this.marcador = this.crearMarcador(ANCHO / 2, 110);
    this.add
      .text(ANCHO / 2, ALTO - 46, 'Mantené apretado para subir la presión. Soltá para bajarla.', {
        fontFamily: FUENTE,
        fontSize: '16px',
        color: CSS.humo,
      })
      .setOrigin(0.5);

    this.apretando = false;
    this.input.on('pointerdown', () => (this.apretando = true));
    this.input.on('pointerup', () => (this.apretando = false));
    this.input.on('pointerupoutside', () => (this.apretando = false));
    this.input.keyboard?.on('keydown-SPACE', () => (this.apretando = true));
    this.input.keyboard?.on('keyup-SPACE', () => (this.apretando = false));

    this.moverFranja();
    this.reloj = this.barraTiempo(this.duracion, () => this.cerrar());
  }

  /** La zona buena se corre cada tanto: no alcanza con dejar el dedo puesto. */
  moverFranja() {
    if (this.terminado) return;
    const centro = Phaser.Math.Between(28, 78);
    const alto = Phaser.Math.Between(16, 26);
    this.zonaMin = centro - alto / 2;
    this.zonaMax = centro + alto / 2;

    const yCentro = this.medidorY + this.medidorAlto / 2 - (centro / 100) * this.medidorAlto;
    this.tweens.add({
      targets: this.franja,
      y: yCentro,
      displayHeight: (alto / 100) * this.medidorAlto,
      duration: 500,
      ease: 'Sine.InOut',
    });

    this.esperar(Phaser.Math.Between(3200, 4800), () => this.moverFranja());
  }

  update(_, dt) {
    if (this.terminado) return;
    const paso = dt / 1000;
    this.tiempoTotal += paso;

    this.presion += (this.apretando ? 34 : -26) * paso;

    if (this.presion >= 100) {
      // Reventó: vuelve a cero y te cuesta puntos.
      this.presion = 12;
      this.reventadas += 1;
      this.cameras.main.shake(200, 0.012);
      this.flash('¡SE REVENTÓ!', CSS.rojo, 200);
    }
    this.presion = Phaser.Math.Clamp(this.presion, 0, 100);

    const dentro = this.presion >= this.zonaMin && this.presion <= this.zonaMax;
    if (dentro) this.tiempoEnZona += paso;

    this.redimensionar(this.relleno, 112, (this.presion / 100) * this.medidorAlto);
    this.relleno.fillColor = dentro ? COLOR.verde : this.presion > this.zonaMax ? COLOR.rojo : COLOR.humo;

    const pct = Math.round((this.tiempoEnZona / Math.max(0.001, this.tiempoTotal)) * 100);
    this.marcador.setText(`En zona: ${pct}%`);
    this.marcador.setColor(pct >= 55 ? CSS.verde : pct >= 30 ? CSS.dorado : CSS.rojo);
  }

  cerrar() {
    const proporcion = this.tiempoEnZona / Math.max(0.001, this.tiempoTotal);
    // La proporcion real ronda 0.5-0.7 jugando bien, asi que se estira un poco.
    let score = Phaser.Math.Clamp(proporcion * 1.4, 0, 1);
    score *= Math.max(0.4, 1 - this.reventadas * 0.18);
    this.terminar(score, score >= 0.7 ? '¡Quedó prolijo!' : score >= 0.4 ? 'Zafa' : 'Quedó cualquier cosa');
  }
}
