import Phaser from 'phaser';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY, estiloTitulo, estiloSubtitulo } from './tema.js';

/**
 * Base de todos los minijuegos. Se encarga de lo que se repite en los diez:
 * fondo, encabezado, cuenta regresiva de arranque, barra de tiempo, botones
 * grandes con soporte mouse + touch, y el cierre con el score.
 *
 * Las subclases implementan `arrancar()` y llaman a `this.terminar(score)`
 * con un numero 0..1. Ese score lo traduce el motor a un bonus de
 * probabilidad que SE SUMA a la tirada; nunca la reemplaza.
 */
export class BaseMinijuego extends Phaser.Scene {
  init(data) {
    this.opciones = data ?? {};
    this.cfg = this.opciones.config ?? {};
    this.bonusCombate = this.opciones.bonusCombate ?? 0;
    this.terminado = false;
    this.temporizadores = [];
  }

  // --- ciclo de vida -------------------------------------------------------

  create() {
    this.dibujarFondo();
    this.dibujarEncabezado(this.cfg.titulo ?? 'Minijuego', this.cfg.instrucciones ?? '');
    this.cuentaRegresiva(() => this.arrancar());
  }

  /** Las subclases lo pisan. */
  arrancar() {}

  /**
   * Cierra el minijuego. `score` va de 0 (desastre) a 1 (impecable).
   * Muestra un cartel corto y despues avisa a React.
   */
  terminar(score, mensaje) {
    if (this.terminado) return;
    this.terminado = true;
    for (const t of this.temporizadores) t?.remove?.();
    this.input.enabled = false;

    const s = Phaser.Math.Clamp(score, 0, 1);
    const bueno = s >= 0.5;
    const texto = mensaje ?? (s >= 0.8 ? '¡Impecable!' : bueno ? 'Bien ahí' : s >= 0.25 ? 'Flojito' : 'Un desastre');

    const capa = this.add.container(0, 0).setDepth(1000);
    capa.add(this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, COLOR.noche, 0.82));
    capa.add(
      this.add
        .text(ANCHO / 2, ALTO / 2 - 34, texto, {
          fontFamily: FUENTE_DISPLAY,
          fontSize: '44px',
          color: bueno ? CSS.verde : CSS.rojo,
        })
        .setOrigin(0.5)
    );
    capa.add(
      this.add
        .text(ANCHO / 2, ALTO / 2 + 18, `Bonus para la tirada: ${s >= 0.5 ? '+' : ''}${Math.round((-0.1 + s * 0.35) * 100)}%`, {
          fontFamily: FUENTE,
          fontSize: '17px',
          color: CSS.humo,
        })
        .setOrigin(0.5)
    );
    capa.setAlpha(0);
    this.tweens.add({ targets: capa, alpha: 1, duration: 220 });

    this.time.delayedCall(1250, () => this.opciones.onResultado?.(s));
  }

  // --- pintura compartida --------------------------------------------------

  dibujarFondo() {
    this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, COLOR.noche);
    const g = this.add.graphics();
    g.fillStyle(COLOR.verde, 0.05);
    g.fillCircle(120, 40, 260);
    g.fillStyle(COLOR.dorado, 0.035);
    g.fillCircle(ANCHO - 90, ALTO - 30, 240);
    // Rejilla tenue, para que se lea como asfalto.
    const rejilla = this.add.graphics();
    rejilla.lineStyle(1, COLOR.borde, 0.35);
    for (let x = 0; x <= ANCHO; x += 40) rejilla.lineBetween(x, 0, x, ALTO);
    for (let y = 0; y <= ALTO; y += 40) rejilla.lineBetween(0, y, ANCHO, y);
  }

  dibujarEncabezado(titulo, instrucciones) {
    this.add.rectangle(ANCHO / 2, 34, ANCHO, 68, COLOR.panel, 0.9);
    this.add.rectangle(ANCHO / 2, 68, ANCHO, 2, COLOR.borde);
    this.add.text(24, 16, titulo, { ...estiloTitulo, fontSize: '26px' });
    if (instrucciones) this.add.text(24, 46, instrucciones, estiloSubtitulo);
  }

  cuentaRegresiva(alTerminar) {
    let n = 3;
    const txt = this.add
      .text(ANCHO / 2, ALTO / 2, String(n), {
        fontFamily: FUENTE_DISPLAY,
        fontSize: '110px',
        color: CSS.dorado,
      })
      .setOrigin(0.5)
      .setDepth(900);

    const tick = () => {
      n -= 1;
      if (n <= 0) {
        txt.setText('¡DALE!').setFontSize(76).setColor(CSS.verde);
        this.tweens.add({
          targets: txt,
          alpha: 0,
          scale: 1.5,
          duration: 380,
          onComplete: () => {
            txt.destroy();
            alTerminar();
          },
        });
        return;
      }
      txt.setText(String(n));
      txt.setScale(1.6);
      this.tweens.add({ targets: txt, scale: 1, duration: 260 });
      this.time.delayedCall(600, tick);
    };
    this.tweens.add({ targets: txt, scale: 1, duration: 260, from: 1.6 });
    this.time.delayedCall(600, tick);
  }

  /** Barra de tiempo arriba a la derecha. Devuelve un objeto con `.detener()`. */
  barraTiempo(duracionMs, alAgotarse) {
    const ancho = 240;
    const x = ANCHO - ancho - 24;
    this.add.rectangle(x, 34, ancho, 12, COLOR.noche).setOrigin(0, 0.5);
    const barra = this.add.rectangle(x, 34, ancho, 12, COLOR.verde).setOrigin(0, 0.5);

    const tween = this.tweens.add({
      targets: barra,
      width: 0,
      duration: duracionMs,
      ease: 'Linear',
      onUpdate: () => {
        const frac = barra.width / ancho;
        barra.fillColor = frac > 0.45 ? COLOR.verde : frac > 0.2 ? COLOR.dorado : COLOR.rojo;
      },
      onComplete: () => alAgotarse?.(),
    });

    return {
      detener: () => tween.stop(),
      fraccionRestante: () => barra.width / ancho,
    };
  }

  /** Botón rectangular grande. Anda igual con mouse y con dedo. */
  botonGrande(x, y, ancho, alto, etiqueta, alTocar, { color = COLOR.panelAlto, sub = null } = {}) {
    const cont = this.add.container(x, y);
    const fondo = this.add.rectangle(0, 0, ancho, alto, color).setStrokeStyle(2, COLOR.borde);
    fondo.setInteractive({ useHandCursor: true });
    cont.add(fondo);

    const txt = this.add
      .text(0, sub ? -12 : 0, etiqueta, {
        fontFamily: FUENTE_DISPLAY,
        fontSize: '30px',
        color: CSS.tiza,
      })
      .setOrigin(0.5);
    cont.add(txt);

    if (sub) {
      cont.add(
        this.add
          .text(0, 22, sub, { fontFamily: FUENTE, fontSize: '14px', color: CSS.humo })
          .setOrigin(0.5)
      );
    }

    fondo.on('pointerover', () => fondo.setStrokeStyle(2, COLOR.verde));
    fondo.on('pointerout', () => fondo.setStrokeStyle(2, COLOR.borde));
    fondo.on('pointerdown', () => {
      this.tweens.add({ targets: cont, scale: 0.94, duration: 70, yoyo: true });
      alTocar();
    });

    cont.fondo = fondo;
    cont.txt = txt;
    return cont;
  }

  /** Texto centrado que aparece y se desvanece (feedback de acierto/error). */
  flash(texto, color = CSS.verde, y = ALTO / 2) {
    const t = this.add
      .text(ANCHO / 2, y, texto, { fontFamily: FUENTE_DISPLAY, fontSize: '48px', color })
      .setOrigin(0.5)
      .setDepth(800);
    this.tweens.add({
      targets: t,
      y: y - 50,
      alpha: 0,
      duration: 720,
      onComplete: () => t.destroy(),
    });
  }

  /** Marcador simple arriba, tipo "3 / 5". */
  crearMarcador(x = ANCHO / 2, y = 96) {
    const txt = this.add
      .text(x, y, '', { fontFamily: FUENTE_DISPLAY, fontSize: '24px', color: CSS.humo })
      .setOrigin(0.5);
    return txt;
  }

  /**
   * Cambia el tamaño de un Shape (Rectangle, Arc...).
   *
   * OJO: `Shape.setSize` de Phaser solo asigna width/height, no llama a
   * `updateDisplayOrigin()`. Como el renderer dibuja usando `_displayOriginX/Y`,
   * si cambiás el tamaño a mano el shape queda dibujado corrido respecto de su
   * posición. Reaplicar el origen fuerza el recálculo.
   */
  redimensionar(shape, ancho, alto) {
    shape.setSize(ancho, alto);
    shape.setOrigin(shape.originX, shape.originY);
    return shape;
  }

  esperar(ms, fn) {
    const t = this.time.delayedCall(ms, fn);
    this.temporizadores.push(t);
    return t;
  }
}
