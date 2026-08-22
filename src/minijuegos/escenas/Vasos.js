import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * perderla_de_vista: el clásico de los tres vasos. Te muestran dónde quedó,
 * se mezclan, y tenés que seguirla con la vista. Cada ronda se mezclan más
 * rápido y más veces.
 */
export class VasosScene extends BaseMinijuego {
  arrancar() {
    this.rondas = this.cfg.rondas ?? 4;
    this.ronda = 0;
    this.aciertos = 0;

    this.cantidad = 3;
    this.y = 280;
    this.separacion = 180;
    this.posiciones = Array.from(
      { length: this.cantidad },
      (_, i) => ANCHO / 2 + (i - (this.cantidad - 1) / 2) * this.separacion
    );

    this.vasos = this.posiciones.map((x, i) => {
      const cont = this.add.container(x, this.y);
      const cuerpo = this.add.rectangle(0, 0, 116, 132, COLOR.panelAlto).setStrokeStyle(3, COLOR.borde);
      const tapa = this.add.rectangle(0, -66, 132, 16, COLOR.borde);
      cont.add([cuerpo, tapa]);
      cont.cuerpo = cuerpo;
      cont.indice = i;
      cuerpo.setInteractive({ useHandCursor: true });
      cuerpo.on('pointerdown', () => this.elegir(cont));
      return cont;
    });

    this.bolita = this.add.circle(0, this.y + 34, 17, COLOR.dorado).setStrokeStyle(3, COLOR.doradoHondo);
    this.bolita.setVisible(false);

    this.marcador = this.crearMarcador(ANCHO / 2, 110);
    this.aviso = this.add
      .text(ANCHO / 2, ALTO - 76, '', { fontFamily: FUENTE, fontSize: '17px', color: CSS.humo })
      .setOrigin(0.5);

    this.siguienteRonda();
  }

  activarVasos(activos) {
    for (const v of this.vasos) {
      if (v.cuerpo.input) v.cuerpo.input.enabled = activos;
      v.cuerpo.setStrokeStyle(3, activos ? COLOR.verde : COLOR.borde);
    }
  }

  siguienteRonda() {
    if (this.terminado) return;
    if (this.ronda >= this.rondas) return this.cerrar();
    this.ronda += 1;
    this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);
    this.activarVasos(false);

    // Reordenar visualmente y elegir dónde queda la bolita.
    this.vasos.forEach((v, i) => {
      v.x = this.posiciones[i];
      v.indice = i;
      v.y = this.y;
    });
    this.correcto = Phaser.Math.Between(0, this.cantidad - 1);

    this.aviso.setText('Mirá bien dónde queda').setColor(CSS.humo);
    this.bolita.setPosition(this.posiciones[this.correcto], this.y + 34).setVisible(true);

    // Levantar el vasito, mostrar, bajar, mezclar.
    const vaso = this.vasos[this.correcto];
    this.tweens.add({
      targets: vaso,
      y: this.y - 66,
      duration: 320,
      yoyo: true,
      hold: 750,
      onComplete: () => {
        this.bolita.setVisible(false);
        this.mezclar();
      },
    });
  }

  mezclar() {
    const dificultad = (this.ronda - 1) / Math.max(1, this.rondas - 1);
    const cantidad = Math.round(Phaser.Math.Linear(4, 10, dificultad));
    const duracion = Phaser.Math.Linear(340, 150, dificultad);
    this.aviso.setText('Seguila...').setColor(CSS.dorado);

    let hechos = 0;
    const paso = () => {
      if (this.terminado) return;
      if (hechos >= cantidad) {
        this.aviso.setText('¿Dónde quedó?').setColor(CSS.verde);
        this.activarVasos(true);
        this.esperandoRespuesta = true;
        return;
      }
      hechos += 1;

      const a = Phaser.Math.Between(0, this.cantidad - 1);
      let b = Phaser.Math.Between(0, this.cantidad - 1);
      while (b === a) b = Phaser.Math.Between(0, this.cantidad - 1);

      const vasoA = this.vasos.find((v) => v.indice === a);
      const vasoB = this.vasos.find((v) => v.indice === b);
      vasoA.indice = b;
      vasoB.indice = a;
      if (this.correcto === a) this.correcto = b;
      else if (this.correcto === b) this.correcto = a;

      // Arco para que se vea el cruce.
      const arco = a < b ? -34 : 34;
      this.tweens.add({
        targets: vasoA,
        x: this.posiciones[b],
        y: { value: this.y + arco, duration: duracion / 2, yoyo: true },
        duration,
        ease: 'Sine.InOut',
      });
      this.tweens.add({
        targets: vasoB,
        x: this.posiciones[a],
        y: { value: this.y - arco, duration: duracion / 2, yoyo: true },
        duration,
        ease: 'Sine.InOut',
        onComplete: paso,
      });
    };
    this.esperar(300, paso);
  }

  elegir(vaso) {
    if (!this.esperandoRespuesta || this.terminado) return;
    this.esperandoRespuesta = false;
    this.activarVasos(false);

    const acerto = vaso.indice === this.correcto;
    const ganador = this.vasos.find((v) => v.indice === this.correcto);
    this.bolita.setPosition(ganador.x, this.y + 34).setVisible(true);

    this.tweens.add({ targets: ganador, y: this.y - 66, duration: 260, yoyo: true, hold: 500 });

    if (acerto) {
      this.aciertos += 1;
      this.flash('¡AHÍ ESTABA!', CSS.verde, 180);
    } else {
      this.flash('LA PERDISTE', CSS.rojo, 180);
      this.cameras.main.shake(150, 0.007);
    }
    this.marcador.setText(`Ronda ${this.ronda} / ${this.rondas}    Aciertos ${this.aciertos}`);

    this.esperar(1400, () => {
      this.bolita.setVisible(false);
      this.siguienteRonda();
    });
  }

  cerrar() {
    const score = this.aciertos / this.rondas;
    this.terminar(
      score,
      score === 1 ? '¡No la perdiste nunca!' : score >= 0.5 ? 'La seguiste casi siempre' : 'Te marearon'
    );
  }
}
