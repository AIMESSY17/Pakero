import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { COLOR, CSS } from '../tema.js';

/**
 * empaquetar: van cayendo paquetes sobre la mesa y hay que cerrarlos a tiempo.
 * Cada paquete se achica solo; si llega a cero se te arruina. Los rojos
 * (control) no se tocan.
 *
 * El radio de los paquetes sale del tamaño de la mesa: nunca queda un blanco
 * de toque mas chico que un dedo.
 */
export class TocarScene extends BaseMinijuego {
  arrancar() {
    this.duracion = this.cfg.duracion ?? 22000;
    this.objetivo = this.cfg.objetivo ?? 18;
    this.cerrados = 0;
    this.perdidos = 0;
    this.errores = 0;
    this.items = [];

    this.marcador = this.crearMarcador(this.A / 2, this.topJuego + this.fsn(13));
    this.zonaTop = this.marcador.y + this.fsn(22);

    this.add.rectangle(
      this.A / 2,
      (this.zonaTop + this.H) / 2,
      this.A - this.margen * 1.4,
      this.H - this.zonaTop - this.margen * 0.8,
      COLOR.asfalto,
      0.55
    );

    // Blanco comodo para el dedo, sin taparse entre ellos en pantalla chica.
    this.radioItem = Phaser.Math.Clamp(Math.round(Math.min(this.A, this.H) * 0.085), 26, 40);

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
    this.marcador.setText(
      `Cerrados ${this.cerrados}/${this.objetivo}    Arruinados ${this.perdidos + this.errores}`
    );
    this.marcador.setColor(this.cerrados >= this.objetivo * 0.6 ? CSS.verde : CSS.humo);
  }

  aparecer() {
    if (this.terminado) return;
    // Uno de cada cinco es un control: si lo tocás, cagaste.
    const esControl = Phaser.Math.FloatBetween(0, 1) < 0.2;
    const radio = this.radioItem;
    const x = Phaser.Math.Between(
      Math.round(this.margen + radio),
      Math.round(this.A - this.margen - radio)
    );
    const y = Phaser.Math.Between(
      Math.round(this.zonaTop + radio + 6),
      Math.round(this.H - this.margen - radio)
    );

    const c = this.add.circle(x, y, radio, esControl ? COLOR.rojo : COLOR.verde, 0.9);
    c.setStrokeStyle(3, esControl ? COLOR.rojoHondo : COLOR.verdeHondo);
    const icono = this.add
      .text(x, y, esControl ? '🚨' : '📦', { fontSize: `${Math.round(radio * 0.78)}px` })
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
      this.flash('¡ERA CONTROL!', CSS.rojo, this.zonaTop + this.fsn(38));
    } else {
      this.cerrados += 1;
      this.flash('+1', CSS.verde, c.y - this.radioItem);
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
