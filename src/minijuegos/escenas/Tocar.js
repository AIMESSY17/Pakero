import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * empaquetar: van cayendo paquetes sobre la mesa y hay que cerrarlos a tiempo.
 * Cada paquete se achica solo; si llega a cero se te arruina. Los rojos
 * (control) no se tocan.
 */
export class TocarScene extends BaseMinijuego {
  arrancar() {
    this.duracion = this.cfg.duracion ?? 22000;
    this.objetivo = this.cfg.objetivo ?? 18;
    this.cerrados = 0;
    this.perdidos = 0;
    this.errores = 0;
    this.items = [];

    this.zonaTop = 120;
    this.add.rectangle(ANCHO / 2, (this.zonaTop + ALTO) / 2, ANCHO - 40, ALTO - this.zonaTop - 20, COLOR.asfalto, 0.55);

    this.marcador = this.crearMarcador(ANCHO / 2, 96);
    this.actualizarMarcador();

    this.spawner = this.time.addEvent({
      delay: this.cfg.intervalo ?? 620,
      loop: true,
      callback: () => this.aparecer(),
    });
    this.temporizadores.push(this.spawner);

    this.reloj = this.barraTiempo(this.duracion, () => this.cerrar());
  }

  actualizarMarcador() {
    this.marcador.setText(`Cerrados ${this.cerrados}/${this.objetivo}    Arruinados ${this.perdidos + this.errores}`);
    this.marcador.setColor(this.cerrados >= this.objetivo * 0.6 ? CSS.verde : CSS.humo);
  }

  aparecer() {
    if (this.terminado) return;
    // Uno de cada cinco es un control: si lo tocás, cagaste.
    const esControl = Phaser.Math.FloatBetween(0, 1) < 0.2;
    const x = Phaser.Math.Between(70, ANCHO - 70);
    const y = Phaser.Math.Between(this.zonaTop + 50, ALTO - 60);
    const radio = 34;

    const c = this.add.circle(x, y, radio, esControl ? COLOR.rojo : COLOR.verde, 0.9);
    c.setStrokeStyle(3, esControl ? COLOR.rojoHondo : COLOR.verdeHondo);
    const icono = this.add
      .text(x, y, esControl ? '🚨' : '📦', { fontSize: '26px' })
      .setOrigin(0.5);

    c.setInteractive({ useHandCursor: true });
    c.esControl = esControl;
    c.icono = icono;
    c.on('pointerdown', () => this.tocar(c));

    const vida = Phaser.Math.Between(1100, 1700);
    c.tweenVida = this.tweens.add({
      targets: [c, icono],
      scale: 0.2,
      duration: vida,
      onComplete: () => {
        if (!c.active) return;
        // Un control que se va solo está bien: no lo tocaste.
        if (!c.esControl) {
          this.perdidos += 1;
          this.actualizarMarcador();
        }
        this.quitar(c);
      },
    });

    this.items.push(c);
  }

  quitar(c) {
    c.tweenVida?.stop();
    c.icono?.destroy();
    c.destroy();
    const i = this.items.indexOf(c);
    if (i >= 0) this.items.splice(i, 1);
  }

  tocar(c) {
    if (this.terminado || !c.active) return;
    if (c.esControl) {
      this.errores += 1;
      this.cameras.main.shake(180, 0.01);
      this.cameras.main.flash(110, 255, 82, 82);
      this.flash('¡ERA CONTROL!', CSS.rojo, 300);
    } else {
      this.cerrados += 1;
      this.flash('+1', CSS.verde, c.y - 40);
    }
    this.actualizarMarcador();
    this.quitar(c);
    if (this.cerrados >= this.objetivo) this.cerrar();
  }

  cerrar() {
    if (this.terminado) return;
    this.reloj?.detener();
    this.spawner?.remove();
    const base = Phaser.Math.Clamp(this.cerrados / this.objetivo, 0, 1);
    const castigo = Math.max(0.3, 1 - this.errores * 0.16 - this.perdidos * 0.05);
    this.terminar(
      base * castigo,
      this.cerrados >= this.objetivo ? '¡Salió todo empaquetado!' : 'Quedó mercadería sin cerrar'
    );
  }
}
