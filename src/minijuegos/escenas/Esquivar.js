import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ALTO, COLOR, CSS, FUENTE } from '../tema.js';

/**
 * Corrida esquivando. Arrastrás con el dedo o el mouse (o flechas) y el pibe
 * te sigue. Dos modos:
 *
 *   'sobrevivir' → escapar_policia: aguantar hasta que se corte el tiempo.
 *   'rescatar'   → fuga_rescate: juntar a los tuyos mientras esquivás.
 *
 * Todo lo que se mueve escala con el alto de la escena: en vertical la pista
 * es mas larga, asi que los obstaculos van proporcionalmente mas rapido y el
 * tiempo que tardan en llegar de arriba abajo es el mismo en cualquier
 * pantalla.
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

    this.hud = this.add.text(this.margen, this.topJuego, '', {
      fontFamily: FUENTE,
      fontSize: this.fs(16),
      color: CSS.humo,
    });

    this.zonaY = this.topJuego + this.hud.height + 8;
    this.altoPista = this.H - this.zonaY;
    // La velocidad se expresa contra la pista de referencia (500 px de alto).
    this.velocidadBase = (this.cfg.velocidad ?? 210) * (this.altoPista / (ALTO - 120));

    this.obstaculos = [];
    this.premios = [];

    // Carril de juego
    this.add.rectangle(
      this.A / 2,
      (this.zonaY + this.H) / 2,
      this.A - this.margen * 1.4,
      this.altoPista - this.margen * 0.8,
      COLOR.asfalto,
      0.6
    );

    this.radioJugador = Phaser.Math.Clamp(Math.round(Math.min(this.A, this.H) * 0.042), 14, 22);
    this.bordeX = this.radioJugador + this.margen;
    this.jugador = this.add.circle(
      this.A / 2,
      this.H - this.radioJugador * 2.6,
      this.radioJugador,
      COLOR.verde
    );
    this.jugador.setStrokeStyle(3, COLOR.tiza);
    this.destinoX = this.jugador.x;

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
    const corazones =
      '❤'.repeat(Math.max(0, this.vidas)) + '·'.repeat(this.vidasMax - Math.max(0, this.vidas));
    const extra =
      this.modo === 'rescatar' ? `    Rescatados ${this.rescatados}/${this.aRescatar}` : '';
    this.hud.setText(`${corazones}${extra}`);
  }

  soltarObstaculo() {
    if (this.terminado) return;
    // Los obstaculos ocupan siempre la misma fraccion del ancho de la pista.
    const ancho = Phaser.Math.Between(Math.round(this.A * 0.11), Math.round(this.A * 0.26));
    const x = Phaser.Math.Between(
      Math.round(this.margen + ancho / 2),
      Math.round(this.A - this.margen - ancho / 2)
    );
    const alto = Phaser.Math.Clamp(Math.round(this.H * 0.035), 16, 26);
    const rect = this.add.rectangle(x, this.zonaY, ancho, alto, COLOR.rojo, 0.85);
    rect.setStrokeStyle(2, COLOR.rojoHondo);
    // Se van poniendo mas rapidos a medida que pasa el tiempo.
    const avance = (this.time.now - this.inicio) / this.duracion;
    rect.vy = this.velocidadBase * (1 + avance * 0.9);
    this.obstaculos.push(rect);
  }

  soltarPremio() {
    if (this.terminado || this.rescatados >= this.aRescatar) return;
    const radio = Math.round(this.radioJugador * 0.8);
    const x = Phaser.Math.Between(this.margen + radio * 2, this.A - this.margen - radio * 2);
    const c = this.add.circle(x, this.zonaY, radio, COLOR.dorado);
    c.setStrokeStyle(3, COLOR.doradoHondo);
    c.vy = this.velocidadBase * 0.8;
    this.premios.push(c);
  }

  update(_, dt) {
    if (this.terminado || !this.jugador) return;
    const paso = dt / 1000;

    // Movimiento: sigue al puntero, con teclado como alternativa.
    const velTeclado = this.A * 0.55;
    if (this.teclas?.left.isDown) this.destinoX -= velTeclado * paso;
    if (this.teclas?.right.isDown) this.destinoX += velTeclado * paso;
    this.destinoX = Phaser.Math.Clamp(this.destinoX, this.bordeX, this.A - this.bordeX);
    this.jugador.x = Phaser.Math.Linear(this.jugador.x, this.destinoX, Math.min(1, 12 * paso));

    this.moverYChequear(this.obstaculos, paso, (o) => this.recibirGolpe(o));
    this.moverYChequear(this.premios, paso, (p) => this.juntar(p));
  }

  moverYChequear(lista, paso, alTocar) {
    const margenColision = this.radioJugador * 0.9;
    for (let i = lista.length - 1; i >= 0; i--) {
      const o = lista[i];
      o.y += o.vy * paso;

      const anchoO = o.width ?? o.radius * 2;
      const altoO = o.height ?? o.radius * 2;
      const cerca =
        Math.abs(o.x - this.jugador.x) < anchoO / 2 + margenColision &&
        Math.abs(o.y - this.jugador.y) < altoO / 2 + margenColision;

      if (cerca) {
        lista.splice(i, 1);
        alTocar(o);
        o.destroy();
        continue;
      }
      if (o.y > this.H + 40) {
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
    this.flash('¡PUM!', CSS.rojo, this.H * 0.45);
    if (this.vidas <= 0) this.cerrar(false);
  }

  juntar() {
    this.rescatados += 1;
    this.actualizarHud();
    this.flash('+1', CSS.dorado, this.H * 0.45);
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
