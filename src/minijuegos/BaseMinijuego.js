import Phaser from 'phaser';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY, estiloTitulo } from './tema.js';

/**
 * Base de todos los minijuegos. Se encarga de lo que se repite en los diez:
 * fondo, encabezado, cuenta regresiva de arranque, barra de tiempo, botones
 * grandes con soporte mouse + touch, y el cierre con el score.
 *
 * Las subclases implementan `arrancar()` y llaman a `this.terminar(score)`
 * con un numero 0..1. Ese score lo traduce el motor a un bonus de
 * probabilidad que SE SUMA a la tirada; nunca la reemplaza.
 *
 * --- Sobre las medidas ---
 * Nada de aca adentro usa numeros fijos de pantalla. El canvas se crea con la
 * relacion de aspecto del hueco real (ver `medidasPara` en tema.js), asi que
 * en un celular vertical la escena es alta y angosta y en desktop es apaisada.
 * Las escenas se dibujan con:
 *
 *   this.A / this.H     ancho y alto de la escena en px logicos
 *   this.esVertical     true cuando el alto le gana claramente al ancho
 *   this.topJuego       primer y libre debajo del encabezado
 *   this.fs(px)         tamaño de fuente escalado a la pantalla
 *   this.margen         margen lateral comodo
 */
export class BaseMinijuego extends Phaser.Scene {
  init(data) {
    this.opciones = data ?? {};
    this.cfg = this.opciones.config ?? {};
    this.bonusCombate = this.opciones.bonusCombate ?? 0;
    this.terminado = false;
    this.temporizadores = [];

    const { width, height } = this.scale.gameSize;
    this.A = width || ANCHO;
    this.H = height || ALTO;
    this.esVertical = this.H / this.A > 1.12;
    this.margen = this.esVertical ? 14 : 24;

    // Escala tipografica: en vertical el canvas logico es mas angosto, pero se
    // muestra casi 1:1 contra los px del celular, asi que las fuentes no pueden
    // encogerse en la misma proporcion que el ancho.
    this.esc = Phaser.Math.Clamp(this.A / ANCHO, 0.85, 1.15);

    this.topJuego = 0;
  }

  /** Tamaño de fuente escalado, listo para pasarle a Phaser. */
  fs(px) {
    return `${Math.round(px * this.esc)}px`;
  }

  /** Igual que `fs` pero devuelve el numero (para setFontSize). */
  fsn(px) {
    return Math.round(px * this.esc);
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
    const texto =
      mensaje ?? (s >= 0.8 ? '¡Impecable!' : bueno ? 'Bien ahí' : s >= 0.25 ? 'Flojito' : 'Un desastre');
    const anchoTexto = this.A - this.margen * 2;

    const capa = this.add.container(0, 0).setDepth(1000);
    capa.add(this.add.rectangle(this.A / 2, this.H / 2, this.A, this.H, COLOR.noche, 0.86));
    capa.add(
      this.add
        .text(this.A / 2, this.H / 2 - this.fsn(34), texto, {
          fontFamily: FUENTE_DISPLAY,
          fontSize: this.fs(this.esVertical ? 38 : 44),
          color: bueno ? CSS.verde : CSS.rojo,
          align: 'center',
          wordWrap: { width: anchoTexto },
        })
        .setOrigin(0.5)
    );
    capa.add(
      this.add
        .text(
          this.A / 2,
          this.H / 2 + this.fsn(24),
          `Bonus para la tirada: ${s >= 0.5 ? '+' : ''}${Math.round((-0.1 + s * 0.35) * 100)}%`,
          {
            fontFamily: FUENTE,
            fontSize: this.fs(17),
            color: CSS.humo,
            align: 'center',
            wordWrap: { width: anchoTexto },
          }
        )
        .setOrigin(0.5)
    );
    capa.setAlpha(0);
    this.tweens.add({ targets: capa, alpha: 1, duration: 220 });

    this.time.delayedCall(1250, () => this.opciones.onResultado?.(s));
  }

  // --- pintura compartida --------------------------------------------------

  dibujarFondo() {
    this.add.rectangle(this.A / 2, this.H / 2, this.A, this.H, COLOR.noche);
    const radio = Math.max(this.A, this.H) * 0.42;
    const g = this.add.graphics();
    g.fillStyle(COLOR.verde, 0.05);
    g.fillCircle(this.A * 0.15, this.H * 0.08, radio);
    g.fillStyle(COLOR.dorado, 0.035);
    g.fillCircle(this.A * 0.88, this.H * 0.94, radio * 0.92);
    // Rejilla tenue, para que se lea como asfalto.
    const paso = Math.max(34, Math.round(Math.min(this.A, this.H) / 12));
    const rejilla = this.add.graphics();
    rejilla.lineStyle(1, COLOR.borde, 0.35);
    for (let x = 0; x <= this.A; x += paso) rejilla.lineBetween(x, 0, x, this.H);
    for (let y = 0; y <= this.H; y += paso) rejilla.lineBetween(0, y, this.A, y);
  }

  /**
   * Encabezado elastico: mide el texto ya renderizado y de ahi sale el alto de
   * la barra. En vertical el titulo y las instrucciones ocupan todo el ancho y
   * la barra de tiempo se va abajo; en apaisado la barra entra a la derecha.
   */
  dibujarEncabezado(titulo, instrucciones) {
    const pad = this.margen;
    const fondo = this.add.rectangle(0, 0, this.A, 10, COLOR.panel, 0.92).setOrigin(0, 0);
    const linea = this.add.rectangle(0, 0, this.A, 2, COLOR.borde).setOrigin(0, 0);

    const anchoBarra = this.esVertical
      ? this.A - pad * 2
      : Phaser.Math.Clamp(Math.round(this.A * 0.28), 150, 240);
    const anchoTexto = this.esVertical ? this.A - pad * 2 : this.A - pad * 2 - anchoBarra - 20;

    let y = this.esVertical ? 10 : 12;

    const tTitulo = this.add.text(pad, y, titulo, {
      ...estiloTitulo,
      fontSize: this.fs(this.esVertical ? 24 : 26),
      wordWrap: { width: anchoTexto },
    });
    y += tTitulo.height + 3;

    if (instrucciones) {
      const tInstr = this.add.text(pad, y, instrucciones, {
        fontFamily: FUENTE,
        fontSize: this.fs(15),
        color: CSS.humo,
        wordWrap: { width: anchoTexto },
      });
      y += tInstr.height + 4;
    }

    if (this.esVertical) {
      // En vertical la barra de tiempo va en su propia linea, a lo ancho.
      this.slotBarra = { x: pad, y: y + 8, ancho: anchoBarra, alto: 10 };
      y += 20;
    }

    const alto = Math.max(this.esVertical ? 54 : 68, Math.round(y + (this.esVertical ? 8 : 10)));
    this.redimensionar(fondo, this.A, alto);
    linea.setPosition(0, alto - 2);

    if (!this.esVertical) {
      this.slotBarra = {
        x: this.A - anchoBarra - pad,
        y: Math.round(alto / 2),
        ancho: anchoBarra,
        alto: 12,
      };
    }

    this.headerAlto = alto;
    this.topJuego = alto + (this.esVertical ? 6 : 8);
    return alto;
  }

  cuentaRegresiva(alTerminar) {
    let n = 3;
    const tam = Phaser.Math.Clamp(Math.min(this.A, this.H) * 0.22, 62, 110);
    const txt = this.add
      .text(this.A / 2, this.H / 2, String(n), {
        fontFamily: FUENTE_DISPLAY,
        fontSize: `${Math.round(tam)}px`,
        color: CSS.dorado,
      })
      .setOrigin(0.5)
      .setDepth(900);

    const tick = () => {
      n -= 1;
      if (n <= 0) {
        txt
          .setText('¡DALE!')
          .setFontSize(Math.round(tam * 0.66))
          .setColor(CSS.verde);
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

  /**
   * Barra de tiempo. Se dibuja en el hueco que le dejo el encabezado, asi que
   * en vertical queda a lo ancho debajo del titulo y en apaisado a la derecha.
   * Devuelve un objeto con `.detener()` y `.fraccionRestante()`.
   */
  barraTiempo(duracionMs, alAgotarse) {
    const slot = this.slotBarra ?? {
      x: this.A - Math.min(240, this.A * 0.4) - this.margen,
      y: 34,
      ancho: Math.min(240, this.A * 0.4),
      alto: 12,
    };
    const ancho = slot.ancho;
    this.add.rectangle(slot.x, slot.y, ancho, slot.alto, COLOR.noche).setOrigin(0, 0.5);
    const barra = this.add
      .rectangle(slot.x, slot.y, ancho, slot.alto, COLOR.verde)
      .setOrigin(0, 0.5);

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

  /**
   * Botón rectangular grande. Anda igual con mouse y con dedo. Los tamaños de
   * texto salen de la caja del botón, asi que encogen bien en pantallas chicas.
   */
  botonGrande(
    x,
    y,
    ancho,
    alto,
    etiqueta,
    alTocar,
    { color = COLOR.panelAlto, sub = null, tam = null } = {}
  ) {
    const cont = this.add.container(x, y);
    const fondo = this.add.rectangle(0, 0, ancho, alto, color).setStrokeStyle(2, COLOR.borde);
    fondo.setInteractive({ useHandCursor: true });
    cont.add(fondo);

    const tamTexto = tam ?? Phaser.Math.Clamp(Math.round(Math.min(alto * 0.36, ancho * 0.34)), 15, 34);
    const tamSub = Phaser.Math.Clamp(Math.round(Math.min(alto * 0.18, ancho * 0.14)), 9, 15);
    const desplazado = sub ? Math.round(tamSub * 0.9) : 0;

    const txt = this.add
      .text(0, -desplazado, etiqueta, {
        fontFamily: FUENTE_DISPLAY,
        fontSize: `${tamTexto}px`,
        color: CSS.tiza,
        align: 'center',
      })
      .setOrigin(0.5);
    cont.add(txt);

    if (sub) {
      cont.add(
        this.add
          .text(0, Math.round(alto / 2 - tamSub * 1.2), sub, {
            fontFamily: FUENTE,
            fontSize: `${tamSub}px`,
            color: CSS.humo,
            align: 'center',
            wordWrap: { width: ancho - 8 },
          })
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
  flash(texto, color = CSS.verde, y = null) {
    const alturaY = y ?? this.H / 2;
    const t = this.add
      .text(this.A / 2, alturaY, texto, {
        fontFamily: FUENTE_DISPLAY,
        fontSize: this.fs(this.esVertical ? 38 : 48),
        color,
        align: 'center',
        wordWrap: { width: this.A - 16 },
      })
      .setOrigin(0.5)
      .setDepth(800);
    this.tweens.add({
      targets: t,
      y: alturaY - 50,
      alpha: 0,
      duration: 720,
      onComplete: () => t.destroy(),
    });
  }

  /** Marcador simple arriba, tipo "3 / 5". Por defecto justo bajo el encabezado. */
  crearMarcador(x = null, y = null) {
    const txt = this.add
      .text(x ?? this.A / 2, y ?? this.topJuego + this.fsn(14), '', {
        fontFamily: FUENTE_DISPLAY,
        fontSize: this.fs(this.esVertical ? 20 : 24),
        color: CSS.humo,
        align: 'center',
        wordWrap: { width: this.A - 16 },
      })
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
