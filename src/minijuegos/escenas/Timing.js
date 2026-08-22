import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * pasar_droga: el pulso va y viene, vos lo frenás en la zona buena.
 * Cada ronda la zona se achica y el pulso va más rápido. Un toque en
 * cualquier lado frena el pulso.
 */
export class TimingScene extends BaseMinijuego {
  arrancar() {
    this.rondas = this.cfg.rondas ?? 5;
    this.ronda = 0;
    this.aciertos = 0;
    this.puntos = 0;

    this.pistaX = 70;
    this.pistaAncho = ANCHO - 140;
    this.pistaY = 260;

    this.add.rectangle(ANCHO / 2, this.pistaY, this.pistaAncho, 46, COLOR.panel).setStrokeStyle(2, COLOR.borde);
    this.zona = this.add.rectangle(0, this.pistaY, 10, 46, COLOR.verde, 0.35);
    this.zonaPerfecta = this.add.rectangle(0, this.pistaY, 4, 46, COLOR.dorado, 0.5);
    this.aguja = this.add.rectangle(this.pistaX, this.pistaY, 6, 62, COLOR.tiza);

    this.marcador = this.crearMarcador(ANCHO / 2, 110);
    this.pista = this.add
      .text(ANCHO / 2, ALTO - 90, 'Tocá la pantalla para frenar el pulso', {
        fontFamily: FUENTE,
        fontSize: '17px',
        color: CSS.humo,
      })
      .setOrigin(0.5);

    this.input.on('pointerdown', () => this.frenar());
    this.input.keyboard?.on('keydown-SPACE', () => this.frenar());

    this.siguienteRonda();
  }

  siguienteRonda() {
    if (this.terminado) return;
    if (this.ronda >= this.rondas) return this.cerrar();
    this.ronda += 1;
    this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);

    const dificultad = (this.ronda - 1) / Math.max(1, this.rondas - 1);
    const anchoZona = Phaser.Math.Linear(180, 62, dificultad);
    const centro = Phaser.Math.Between(
      this.pistaX + anchoZona / 2 + 20,
      this.pistaX + this.pistaAncho - anchoZona / 2 - 20
    );

    this.zona.setPosition(centro, this.pistaY);
    this.redimensionar(this.zona, anchoZona, 46);
    this.zonaPerfecta.setPosition(centro, this.pistaY);
    this.redimensionar(this.zonaPerfecta, Math.max(14, anchoZona * 0.22), 46);
    this.centroZona = centro;
    this.anchoZona = anchoZona;

    const duracion = Phaser.Math.Linear(1300, 620, dificultad);
    this.frenada = false;
    this.tweenAguja?.stop();
    this.aguja.x = this.pistaX;
    this.tweenAguja = this.tweens.add({
      targets: this.aguja,
      x: this.pistaX + this.pistaAncho,
      duration: duracion,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // Si te dormís, cuenta como fallada.
    this.esperar(duracion * 4, () => {
      if (!this.frenada) this.frenar(true);
    });
  }

  frenar(porTiempo = false) {
    if (this.frenada || this.terminado || !this.tweenAguja) return;
    this.frenada = true;
    this.tweenAguja.stop();

    const distancia = Math.abs(this.aguja.x - this.centroZona);
    const dentro = distancia <= this.anchoZona / 2;
    const perfecto = distancia <= Math.max(7, this.anchoZona * 0.11);

    if (porTiempo) {
      this.flash('¡SE TE FUE!', CSS.rojo, 340);
    } else if (perfecto) {
      this.aciertos += 1;
      this.puntos += 1;
      this.flash('¡CLAVADO!', CSS.dorado, 340);
      this.cameras.main.flash(90, 245, 197, 66);
    } else if (dentro) {
      this.aciertos += 1;
      this.puntos += 0.65;
      this.flash('BIEN', CSS.verde, 340);
    } else {
      this.flash('AFUERA', CSS.rojo, 340);
      this.cameras.main.shake(140, 0.006);
    }

    this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);
    this.esperar(720, () => this.siguienteRonda());
  }

  cerrar() {
    this.terminar(
      this.puntos / this.rondas,
      this.aciertos === this.rondas ? '¡Pasó todo limpio!' : this.aciertos >= this.rondas / 2 ? 'Pasó casi todo' : 'Se cayó la entrega'
    );
  }
}
