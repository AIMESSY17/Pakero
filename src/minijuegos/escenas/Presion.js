import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * prensado: mantené apretado para que suba la presión y soltá para que baje.
 * Hay que sostenerla dentro de la franja verde. Si te pasás, se arruina el
 * ladrillo; si te quedás corto, no prensa nada. La franja se mueve sola.
 *
 * El medidor toma el alto que sobra entre el marcador y el pie, asi que en
 * vertical queda bien largo y en apaisado mas compacto.
 */
export class PresionScene extends BaseMinijuego {
  arrancar() {
    this.duracion = this.cfg.duracion ?? 20000;
    this.presion = 20;
    this.tiempoEnZona = 0;
    this.tiempoTotal = 0;
    this.reventadas = 0;

    const x = this.A / 2;

    this.marcador = this.crearMarcador(x, this.topJuego + this.fsn(14));

    this.ayuda = this.add
      .text(
        x,
        this.H - this.margen - this.fsn(12),
        'Mantené apretado para subir la presión. Soltá para bajarla.',
        {
          fontFamily: FUENTE,
          fontSize: this.fs(15),
          color: CSS.humo,
          align: 'center',
          wordWrap: { width: this.A - this.margen * 2 },
        }
      )
      .setOrigin(0.5);

    const top = this.marcador.y + this.fsn(20);
    const bottom = this.ayuda.y - this.ayuda.height / 2 - 12;
    // Deja lugar arriba para la etiqueta "PRESIÓN".
    this.medidorAlto = Phaser.Math.Clamp(bottom - top - this.fsn(34), 160, 340);
    this.medidorY = bottom - this.medidorAlto / 2;
    this.medidorAncho = Phaser.Math.Clamp(Math.round(this.A * 0.22), 86, 130);

    this.add
      .rectangle(x, this.medidorY, this.medidorAncho, this.medidorAlto, COLOR.panel)
      .setStrokeStyle(2, COLOR.borde);

    this.franja = this.add.rectangle(
      x,
      this.medidorY,
      this.medidorAncho + 14,
      60,
      COLOR.verde,
      0.28
    );
    this.franja.setStrokeStyle(2, COLOR.verde);

    this.anchoRelleno = this.medidorAncho - 8;
    this.relleno = this.add.rectangle(
      x,
      this.medidorY + this.medidorAlto / 2,
      this.anchoRelleno,
      0,
      COLOR.verde
    );
    this.relleno.setOrigin(0.5, 1);

    this.etiqueta = this.add
      .text(x, this.medidorY - this.medidorAlto / 2 - this.fsn(20), 'PRESIÓN', {
        fontFamily: FUENTE_DISPLAY,
        fontSize: this.fs(21),
        color: CSS.humo,
      })
      .setOrigin(0.5);

    this.apretando = false;
    this.input.on('pointerdown', () => (this.apretando = true));
    this.input.on('pointerup', () => (this.apretando = false));
    this.input.on('pointerupoutside', () => (this.apretando = false));
    this.input.keyboard?.on('keydown-SPACE', () => (this.apretando = true));
    this.input.keyboard?.on('keyup-SPACE', () => (this.apretando = false));

    /*
      Red de seguridad a nivel DOM.

      Este es el único minijuego de mantener apretado, así que es el único al
      que le importa que el "soltar" llegue SIEMPRE. Si el dedo (o el mouse)
      arranca adentro del canvas y se suelta afuera — que en un celular es
      tan fácil como pasarse del borde — los eventos de Phaser no llegan y
      `apretando` queda trabado en true: la presión se va a 100, revienta en
      loop y el minijuego se siente roto sin estarlo.

      `window` recibe el pointerup pase lo que pase. Se escucha con captura
      para ganarle a cualquier cosa que corte la propagación.
    */
    this.soltarGlobal = () => {
      this.apretando = false;
    };
    for (const ev of ['pointerup', 'pointercancel', 'mouseup', 'touchend', 'touchcancel', 'blur']) {
      window.addEventListener(ev, this.soltarGlobal, true);
    }
    // `shutdown` corre cuando la escena se destruye: sin esto, los listeners
    // quedan colgados de `window` y se acumulan cada vez que se abre un
    // minijuego, apuntando a escenas que ya no existen.
    this.events.once('shutdown', () => this.limpiarEscuchas());
    this.events.once('destroy', () => this.limpiarEscuchas());

    this.moverFranja();
    this.reloj = this.barraTiempo(this.duracion, () => this.cerrar());
  }

  /** Saca los listeners de `window` que puso `arrancar`. Idempotente. */
  limpiarEscuchas() {
    if (!this.soltarGlobal) return;
    for (const ev of ['pointerup', 'pointercancel', 'mouseup', 'touchend', 'touchcancel', 'blur']) {
      window.removeEventListener(ev, this.soltarGlobal, true);
    }
    this.soltarGlobal = null;
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
    // `update()` arranca a correr apenas se crea la escena, pero `arrancar()`
    // (donde se crea `this.relleno`) recien corre cuando termina la cuenta
    // regresiva de 3-2-1. Sin este guard, las primeras vueltas de update()
    // revientan leyendo propiedades que todavia no existen y el minijuego se
    // queda tildado antes de arrancar.
    if (this.terminado || !this.relleno) return;
    const paso = dt / 1000;
    this.tiempoTotal += paso;

    this.presion += (this.apretando ? 34 : -26) * paso;

    if (this.presion >= 100) {
      // Reventó: vuelve a cero y te cuesta puntos.
      this.presion = 12;
      this.reventadas += 1;
      this.cameras.main.shake(200, 0.012);
      this.flash('¡SE REVENTÓ!', CSS.rojo, this.medidorY - this.medidorAlto / 2 - this.fsn(52));
    }
    this.presion = Phaser.Math.Clamp(this.presion, 0, 100);

    const dentro = this.presion >= this.zonaMin && this.presion <= this.zonaMax;
    if (dentro) this.tiempoEnZona += paso;

    this.redimensionar(this.relleno, this.anchoRelleno, (this.presion / 100) * this.medidorAlto);
    this.relleno.fillColor = dentro
      ? COLOR.verde
      : this.presion > this.zonaMax
        ? COLOR.rojo
        : COLOR.humo;

    const pct = Math.round((this.tiempoEnZona / Math.max(0.001, this.tiempoTotal)) * 100);
    this.marcador.setText(`En zona: ${pct}%`);
    this.marcador.setColor(pct >= 55 ? CSS.verde : pct >= 30 ? CSS.dorado : CSS.rojo);
  }

  cerrar() {
    const proporcion = this.tiempoEnZona / Math.max(0.001, this.tiempoTotal);
    // La proporcion real ronda 0.5-0.7 jugando bien, asi que se estira un poco.
    let score = Phaser.Math.Clamp(proporcion * 1.4, 0, 1);
    score *= Math.max(0.4, 1 - this.reventadas * 0.18);
    this.terminar(
      score,
      score >= 0.7 ? '¡Quedó prolijo!' : score >= 0.4 ? 'Zafa' : 'Quedó cualquier cosa'
    );
  }
}
