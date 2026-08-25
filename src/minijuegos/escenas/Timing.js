import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { COLOR, CSS, FUENTE } from '../tema.js';

/**
 * pasar_droga: el pulso va y viene, vos lo frenás en la zona buena.
 * Cada ronda la zona se achica y el pulso va más rápido. Un toque en
 * cualquier lado frena el pulso.
 *
 * La pista ocupa el ancho que haya y las zonas se miden como fraccion de esa
 * pista, asi que la dificultad es la misma en cualquier pantalla.
 */
export class TimingScene extends BaseMinijuego {
  arrancar() {
    this.rondas = this.cfg.rondas ?? 5;
    this.ronda = 0;
    this.aciertos = 0;
    this.puntos = 0;

    const pad = this.margen + Math.round(this.A * 0.05);
    this.pistaX = pad;
    this.pistaAncho = this.A - pad * 2;

    this.marcador = this.crearMarcador(this.A / 2, this.topJuego + this.fsn(14));

    const pistaAlto = Phaser.Math.Clamp(Math.round(this.H * 0.1), 40, 60);
    const zonaTop = this.marcador.y + this.fsn(24);
    this.pistaY = (zonaTop + this.H) / 2;

    this.add
      .rectangle(this.A / 2, this.pistaY, this.pistaAncho, pistaAlto, COLOR.panel)
      .setStrokeStyle(2, COLOR.borde);
    this.zona = this.add.rectangle(0, this.pistaY, 10, pistaAlto, COLOR.verde, 0.35);
    this.zonaPerfecta = this.add.rectangle(0, this.pistaY, 4, pistaAlto, COLOR.dorado, 0.5);
    this.aguja = this.add.rectangle(
      this.pistaX,
      this.pistaY,
      6,
      Math.round(pistaAlto * 1.35),
      COLOR.tiza
    );
    this.pistaAlto = pistaAlto;

    this.pista = this.add
      .text(this.A / 2, this.H - this.margen - this.fsn(12), 'Tocá la pantalla para frenar el pulso', {
        fontFamily: FUENTE,
        fontSize: this.fs(16),
        color: CSS.humo,
        align: 'center',
        wordWrap: { width: this.A - this.margen * 2 },
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
    // Las zonas van del 27% al 9% de la pista, igual que en la version fija.
    const anchoZona = this.pistaAncho * Phaser.Math.Linear(0.27, 0.094, dificultad);
    const borde = anchoZona / 2 + this.pistaAncho * 0.03;
    const centro = Phaser.Math.Between(
      Math.round(this.pistaX + borde),
      Math.round(this.pistaX + this.pistaAncho - borde)
    );

    this.zona.setPosition(centro, this.pistaY);
    this.redimensionar(this.zona, anchoZona, this.pistaAlto);
    this.zonaPerfecta.setPosition(centro, this.pistaY);
    this.redimensionar(this.zonaPerfecta, Math.max(10, anchoZona * 0.22), this.pistaAlto);
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
    const perfecto = distancia <= Math.max(this.pistaAncho * 0.011, this.anchoZona * 0.11);
    const yFlash = this.pistaY - this.pistaAlto * 2;

    if (porTiempo) {
      this.flash('¡SE TE FUE!', CSS.rojo, yFlash);
    } else if (perfecto) {
      this.aciertos += 1;
      this.puntos += 1;
      this.flash('¡CLAVADO!', CSS.dorado, yFlash);
      this.cameras.main.flash(90, 245, 197, 66);
    } else if (dentro) {
      this.aciertos += 1;
      this.puntos += 0.65;
      this.flash('BIEN', CSS.verde, yFlash);
    } else {
      this.flash('AFUERA', CSS.rojo, yFlash);
      this.cameras.main.shake(140, 0.006);
    }

    this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);
    this.esperar(720, () => this.siguienteRonda());
  }

  cerrar() {
    this.terminar(
      this.puntos / this.rondas,
      this.aciertos === this.rondas
        ? '¡Pasó todo limpio!'
        : this.aciertos >= this.rondas / 2
          ? 'Pasó casi todo'
          : 'Se cayó la entrega'
    );
  }
}
