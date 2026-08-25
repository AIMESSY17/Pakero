import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { COLOR, CSS, FUENTE } from '../tema.js';

/**
 * perderla_de_vista: el clásico de los tres vasos. Te muestran dónde quedó,
 * se mezclan, y tenés que seguirla con la vista. Cada ronda se mezclan más
 * rápido y más veces.
 *
 * La separación entre vasos se calcula sobre el ancho disponible, asi que los
 * tres entran siempre en pantalla sin salirse por los costados.
 */
export class VasosScene extends BaseMinijuego {
  arrancar() {
    this.rondas = this.cfg.rondas ?? 4;
    this.ronda = 0;
    this.aciertos = 0;

    this.cantidad = 3;

    this.marcador = this.crearMarcador(this.A / 2, this.topJuego + this.fsn(14));

    this.aviso = this.add
      .text(this.A / 2, this.H - this.margen - this.fsn(14), '', {
        fontFamily: FUENTE,
        fontSize: this.fs(16),
        color: CSS.humo,
        align: 'center',
        wordWrap: { width: this.A - this.margen * 2 },
      })
      .setOrigin(0.5);

    const top = this.marcador.y + this.fsn(22);
    const bottom = this.aviso.y - this.fsn(20);
    this.y = (top + bottom) / 2;

    // Los tres vasos se reparten el ancho util, con un respiro entre ellos, y
    // el alto sale de lo que sobra a lo largo. El ancho final se recorta contra
    // el alto para que en una pantalla muy apaisada no queden aplastados.
    const util = this.A - this.margen * 2;
    this.separacion = util / this.cantidad;
    const anchoMax = Math.round(this.separacion * 0.72);
    const altoMax = Phaser.Math.Clamp((bottom - top) * 0.55, 78, 170);
    this.altoVaso = Math.round(Phaser.Math.Clamp(anchoMax * 1.14, 78, altoMax));
    this.anchoVaso = Math.min(anchoMax, Math.round(this.altoVaso / 1.14));
    this.levantada = Math.round(this.altoVaso * 0.5);

    this.posiciones = Array.from(
      { length: this.cantidad },
      (_, i) => this.A / 2 + (i - (this.cantidad - 1) / 2) * this.separacion
    );

    this.vasos = this.posiciones.map((x, i) => {
      const cont = this.add.container(x, this.y);
      const cuerpo = this.add
        .rectangle(0, 0, this.anchoVaso, this.altoVaso, COLOR.panelAlto)
        .setStrokeStyle(3, COLOR.borde);
      const tapa = this.add.rectangle(
        0,
        -this.altoVaso / 2,
        Math.round(this.anchoVaso * 1.14),
        Math.max(10, Math.round(this.altoVaso * 0.12)),
        COLOR.borde
      );
      cont.add([cuerpo, tapa]);
      cont.cuerpo = cuerpo;
      cont.indice = i;
      cuerpo.setInteractive({ useHandCursor: true });
      cuerpo.on('pointerdown', () => this.elegir(cont));
      return cont;
    });

    this.radioBolita = Phaser.Math.Clamp(Math.round(this.anchoVaso * 0.15), 12, 20);
    this.yBolita = this.y + this.altoVaso * 0.26;
    this.bolita = this.add
      .circle(0, this.yBolita, this.radioBolita, COLOR.dorado)
      .setStrokeStyle(3, COLOR.doradoHondo);
    this.bolita.setVisible(false);

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
    this.bolita.setPosition(this.posiciones[this.correcto], this.yBolita).setVisible(true);

    // Levantar el vasito, mostrar, bajar, mezclar.
    const vaso = this.vasos[this.correcto];
    this.tweens.add({
      targets: vaso,
      y: this.y - this.levantada,
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
      const arco = (a < b ? -1 : 1) * Math.round(this.altoVaso * 0.26);
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
    this.bolita.setPosition(ganador.x, this.yBolita).setVisible(true);

    this.tweens.add({
      targets: ganador,
      y: this.y - this.levantada,
      duration: 260,
      yoyo: true,
      hold: 500,
    });

    const yFlash = this.y - this.altoVaso;
    if (acerto) {
      this.aciertos += 1;
      this.flash('¡AHÍ ESTABA!', CSS.verde, yFlash);
    } else {
      this.flash('LA PERDISTE', CSS.rojo, yFlash);
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
