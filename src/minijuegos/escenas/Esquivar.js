import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * Corrida esquivando. Arrastrás con el dedo o el mouse (o flechas) y el pibe
 * te sigue. Dos modos:
 *
 *   'sobrevivir' → escapar_policia: aguantar hasta que se corte el tiempo.
 *   'rescatar'   → fuga_rescate: juntar a los tuyos mientras esquivás.
 */
export class EsquivarScene extends BaseMinijuego {
  arrancar() {
    this.modo = this.cfg.modo ?? 'sobrevivir';
    this.duracion = this.cfg.duracion ?? 18000;
    this.vidas = this.cfg.vidas ?? 3;
    this.vidasMax = this.vidas;
    this.aRescatar = this.cfg.aRescatar ?? 3;
    this.rescatados = 0;
    this.golpes = 0;
    this.velocidadBase = this.cfg.velocidad ?? 210;

    this.zonaY = 120;
    this.obstaculos = [];
    this.premios = [];

    // Carril de juego
    this.add.rectangle(ANCHO / 2, (this.zonaY + ALTO) / 2, ANCHO - 40, ALTO - this.zonaY - 20, COLOR.asfalto, 0.6);

    this.jugador = this.add.circle(ANCHO / 2, ALTO - 62, 18, COLOR.verde);
    this.jugador.setStrokeStyle(3, COLOR.tiza);
    this.destinoX = this.jugador.x;

    this.hud = this.add.text(24, 92, '', { fontFamily: FUENTE, fontSize: '16px', color: CSS.humo });
    this.actualizarHud();

    // Mouse y touch: el dedo manda. Phaser normaliza los dos.
    this.input.on('pointermove', (p) => {
      if (p.isDown || p.wasTouch) this.destinoX = p.x;
    });
    this.input.on('pointerdown', (p) => {
      this.destinoX = p.x;
    });
    this.teclas = this.input.keyboard?.createCursorKeys();

    this.spawner = this.time.addEvent({
      delay: this.cfg.intervaloSpawn ?? 520,
      loop: true,
      callback: () => this.soltarObstaculo(),
    });
    this.temporizadores.push(this.spawner);

    if (this.modo === 'rescatar') {
      this.spawnerPremios = this.time.addEvent({
        delay: 2400,
        loop: true,
        callback: () => this.soltarPremio(),
      });
      this.temporizadores.push(this.spawnerPremios);
    }

    this.reloj = this.barraTiempo(this.duracion, () => this.cerrar(true));
    this.inicio = this.time.now;
  }

  actualizarHud() {
    const corazones = '❤'.repeat(Math.max(0, this.vidas)) + '·'.repeat(this.vidasMax - Math.max(0, this.vidas));
    const extra =
      this.modo === 'rescatar' ? `    Rescatados ${this.rescatados}/${this.aRescatar}` : '';
    this.hud.setText(`${corazones}${extra}`);
  }

  soltarObstaculo() {
    if (this.terminado) return;
    const ancho = Phaser.Math.Between(46, 96);
    const x = Phaser.Math.Between(30 + ancho / 2, ANCHO - 30 - ancho / 2);
    const alto = 22;
    const rect = this.add.rectangle(x, this.zonaY, ancho, alto, COLOR.rojo, 0.85);
    rect.setStrokeStyle(2, COLOR.rojoHondo);
    // Se van poniendo mas rapidos a medida que pasa el tiempo.
    const avance = (this.time.now - this.inicio) / this.duracion;
    rect.vy = this.velocidadBase * (1 + avance * 0.9);
    this.obstaculos.push(rect);
  }

  soltarPremio() {
    if (this.terminado || this.rescatados >= this.aRescatar) return;
    const x = Phaser.Math.Between(50, ANCHO - 50);
    const c = this.add.circle(x, this.zonaY, 14, COLOR.dorado);
    c.setStrokeStyle(3, COLOR.doradoHondo);
    c.vy = this.velocidadBase * 0.8;
    this.premios.push(c);
  }

  update(_, dt) {
    if (this.terminado || !this.jugador) return;
    const paso = dt / 1000;

    // Movimiento: sigue al puntero, con teclado como alternativa.
    if (this.teclas?.left.isDown) this.destinoX -= 420 * paso;
    if (this.teclas?.right.isDown) this.destinoX += 420 * paso;
    this.destinoX = Phaser.Math.Clamp(this.destinoX, 40, ANCHO - 40);
    this.jugador.x = Phaser.Math.Linear(this.jugador.x, this.destinoX, Math.min(1, 12 * paso));

    this.moverYChequear(this.obstaculos, paso, (o) => this.recibirGolpe(o));
    this.moverYChequear(this.premios, paso, (p) => this.juntar(p));
  }

  moverYChequear(lista, paso, alTocar) {
    for (let i = lista.length - 1; i >= 0; i--) {
      const o = lista[i];
      o.y += o.vy * paso;

      const anchoO = o.width ?? o.radius * 2;
      const altoO = o.height ?? o.radius * 2;
      const cerca =
        Math.abs(o.x - this.jugador.x) < anchoO / 2 + 16 &&
        Math.abs(o.y - this.jugador.y) < altoO / 2 + 16;

      if (cerca) {
        lista.splice(i, 1);
        alTocar(o);
        o.destroy();
        continue;
      }
      if (o.y > ALTO + 40) {
        lista.splice(i, 1);
        o.destroy();
      }
    }
  }

  recibirGolpe() {
    this.vidas -= 1;
    this.golpes += 1;
    this.actualizarHud();
    this.cameras.main.shake(180, 0.01);
    this.cameras.main.flash(120, 255, 82, 82);
    this.flash('¡PUM!', CSS.rojo, 300);
    if (this.vidas <= 0) this.cerrar(false);
  }

  juntar() {
    this.rescatados += 1;
    this.actualizarHud();
    this.flash('+1', CSS.dorado, 300);
    if (this.modo === 'rescatar' && this.rescatados >= this.aRescatar) this.cerrar(true);
  }

  cerrar(sobrevivio) {
    this.reloj?.detener();
    const fraccionTiempo = Phaser.Math.Clamp((this.time.now - this.inicio) / this.duracion, 0, 1);

    let score;
    if (this.modo === 'rescatar') {
      const rescate = this.rescatados / this.aRescatar;
      score = rescate * 0.7 + (sobrevivio ? 0.3 : fraccionTiempo * 0.2);
    } else {
      score = fraccionTiempo * (sobrevivio ? 1 : 0.6);
    }
    // Cada golpe recibido descuenta.
    score *= Math.max(0.3, 1 - this.golpes * 0.14);

    this.terminar(
      score,
      this.modo === 'rescatar'
        ? this.rescatados >= this.aRescatar
          ? '¡Los sacaste a todos!'
          : 'Quedaron algunos adentro'
        : sobrevivio
          ? '¡Los perdiste de vista!'
          : 'Te alcanzaron'
    );
  }
}
