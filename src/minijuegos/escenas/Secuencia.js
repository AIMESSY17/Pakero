import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { COLOR, CSS, FUENTE } from '../tema.js';

/**
 * armar_porro: te muestran el orden de los pasos y después lo tenés que
 * repetir de memoria. Cada ronda suma un paso más.
 *
 * La grilla de pasos cambia de forma: 3x2 en apaisado, 2x3 en vertical. Asi
 * los botones quedan grandes para el dedo en las dos orientaciones.
 */

const PASOS = [
  { icono: '📄', label: 'Papel' },
  { icono: '🌿', label: 'Picar' },
  { icono: '🎚️', label: 'Repartir' },
  { icono: '🌀', label: 'Enrollar' },
  { icono: '👅', label: 'Pegar' },
  { icono: '🔥', label: 'Sellar' },
];

export class SecuenciaScene extends BaseMinijuego {
  arrancar() {
    this.rondas = this.cfg.rondas ?? 4;
    this.largoInicial = this.cfg.largoInicial ?? 3;
    this.ronda = 0;
    this.aciertos = 0;

    this.marcador = this.crearMarcador(this.A / 2, this.topJuego + this.fsn(13));
    this.aviso = this.add
      .text(this.A / 2, this.marcador.y + this.fsn(26), '', {
        fontFamily: FUENTE,
        fontSize: this.fs(17),
        color: CSS.humo,
        align: 'center',
        wordWrap: { width: this.A - this.margen * 2 },
      })
      .setOrigin(0.5);

    const cols = this.esVertical ? 2 : 3;
    const filas = Math.ceil(PASOS.length / cols);
    const hueco = Math.max(8, Math.min(18, Math.round(this.A * 0.025)));

    const anchoBoton = Math.floor((this.A - this.margen * 2 - hueco * (cols - 1)) / cols);
    const topGrilla = this.aviso.y + this.fsn(20);
    const altoDisponible = this.H - this.margen - topGrilla;
    const altoBoton = Phaser.Math.Clamp(
      Math.floor((altoDisponible - hueco * (filas - 1)) / filas),
      56,
      112
    );

    const altoGrilla = altoBoton * filas + hueco * (filas - 1);
    const y0 = topGrilla + (altoDisponible - altoGrilla) / 2 + altoBoton / 2;
    const x0 = this.A / 2 - ((cols - 1) * (anchoBoton + hueco)) / 2;

    this.botones = PASOS.map((paso, i) => {
      const cx = x0 + (i % cols) * (anchoBoton + hueco);
      const cy = y0 + Math.floor(i / cols) * (altoBoton + hueco);
      return this.botonGrande(cx, cy, anchoBoton, altoBoton, paso.icono, () => this.tocar(i), {
        sub: paso.label,
        tam: Math.round(Phaser.Math.Clamp(Math.min(anchoBoton * 0.3, altoBoton * 0.4), 22, 38)),
      });
    });

    this.siguienteRonda();
  }

  activar(activos) {
    for (const b of this.botones) {
      if (b.fondo.input) b.fondo.input.enabled = activos;
      b.setAlpha(activos ? 1 : 0.5);
    }
  }

  siguienteRonda() {
    if (this.terminado) return;
    if (this.ronda >= this.rondas) return this.cerrar();
    this.ronda += 1;
    this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);

    const largo = this.largoInicial + (this.ronda - 1);
    this.secuencia = Array.from({ length: largo }, () => Phaser.Math.Between(0, PASOS.length - 1));
    this.posicion = 0;
    this.activar(false);
    this.aviso.setText('Mirá el orden...').setColor(CSS.dorado);
    this.mostrarSecuencia();
  }

  mostrarSecuencia() {
    const velocidad = Math.max(360, 620 - this.ronda * 50);
    let i = 0;
    const paso = () => {
      if (this.terminado) return;
      if (i >= this.secuencia.length) {
        this.aviso.setText('Ahora repetilo').setColor(CSS.verde);
        this.activar(true);
        this.aceptando = true;
        return;
      }
      this.resaltar(this.secuencia[i], COLOR.dorado);
      i += 1;
      this.esperar(velocidad, paso);
    };
    this.esperar(600, paso);
  }

  resaltar(indice, color) {
    const b = this.botones[indice];
    b.fondo.setFillStyle(color, 0.85);
    b.txt.setScale(1.2);
    this.esperar(240, () => {
      if (!b.fondo.active) return;
      b.fondo.setFillStyle(COLOR.panelAlto, 1);
      b.txt.setScale(1);
    });
  }

  tocar(indice) {
    if (!this.aceptando || this.terminado) return;

    if (this.secuencia[this.posicion] === indice) {
      this.resaltar(indice, COLOR.verde);
      this.posicion += 1;
      if (this.posicion >= this.secuencia.length) {
        this.aceptando = false;
        this.activar(false);
        this.aciertos += 1;
        this.flash('¡ARMADO!', CSS.verde, this.aviso.y);
        this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);
        this.esperar(900, () => this.siguienteRonda());
      }
    } else {
      this.aceptando = false;
      this.activar(false);
      this.resaltar(indice, COLOR.rojo);
      this.cameras.main.shake(160, 0.008);
      this.flash('SE DESARMÓ', CSS.rojo, this.aviso.y);
      this.esperar(900, () => this.siguienteRonda());
    }
  }

  cerrar() {
    const score = this.aciertos / this.rondas;
    this.terminar(
      score,
      score === 1 ? '¡Impecable el armado!' : score >= 0.5 ? 'Salió andando' : 'Quedó cualquiera'
    );
  }
}
