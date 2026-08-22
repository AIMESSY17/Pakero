import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * armar_porro: te muestran el orden de los pasos y después lo tenés que
 * repetir de memoria. Cada ronda suma un paso más.
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

    const cols = 3;
    const anchoBoton = 190;
    const altoBoton = 96;
    const x0 = ANCHO / 2 - anchoBoton - 16;
    const y0 = 220;

    this.botones = PASOS.map((paso, i) => {
      const cx = x0 + (i % cols) * (anchoBoton + 16);
      const cy = y0 + Math.floor(i / cols) * (altoBoton + 18);
      const cont = this.botonGrande(cx, cy, anchoBoton, altoBoton, paso.icono, () => this.tocar(i), {
        sub: paso.label,
      });
      cont.txt.setFontSize(34);
      return cont;
    });

    this.marcador = this.crearMarcador(ANCHO / 2, 104);
    this.aviso = this.add
      .text(ANCHO / 2, 160, '', { fontFamily: FUENTE, fontSize: '18px', color: CSS.humo })
      .setOrigin(0.5);

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
        this.flash('¡ARMADO!', CSS.verde, 180);
        this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);
        this.esperar(900, () => this.siguienteRonda());
      }
    } else {
      this.aceptando = false;
      this.activar(false);
      this.resaltar(indice, COLOR.rojo);
      this.cameras.main.shake(160, 0.008);
      this.flash('SE DESARMÓ', CSS.rojo, 180);
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
