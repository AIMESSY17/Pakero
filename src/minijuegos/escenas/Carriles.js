import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, ALTO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * cruce_frontera: pasar de un lado al otro entre carriles de patrulleros.
 * Tocá arriba del pibe para avanzar un carril, abajo para retroceder, y
 * arrastrá para moverte de costado. Te tocan y volvés al principio.
 */
export class CarrilesScene extends BaseMinijuego {
  arrancar() {
    this.crucesNecesarios = this.cfg.cruces ?? 2;
    this.cruces = 0;
    this.vidas = this.cfg.vidas ?? 3;
    this.vidasMax = this.vidas;
    this.duracion = this.cfg.duracion ?? 30000;

    this.arribaY = 112;
    this.abajoY = ALTO - 42;
    this.cantCarriles = 5;
    this.altoCarril = (this.abajoY - this.arribaY) / (this.cantCarriles + 1);

    // Zonas segura de arriba (destino) y de abajo (largada)
    this.add.rectangle(ANCHO / 2, this.arribaY, ANCHO - 40, this.altoCarril, COLOR.verdeHondo, 0.75);
    this.add
      .text(ANCHO / 2, this.arribaY, 'DEL OTRO LADO', {
        fontFamily: FUENTE_DISPLAY,
        fontSize: '18px',
        color: CSS.verde,
      })
      .setOrigin(0.5);
    this.add.rectangle(ANCHO / 2, this.abajoY, ANCHO - 40, this.altoCarril, COLOR.panel, 0.75);

    this.patrullas = [];
    for (let i = 1; i <= this.cantCarriles; i++) {
      const y = this.abajoY - i * this.altoCarril;
      this.add.rectangle(ANCHO / 2, y, ANCHO - 40, this.altoCarril - 4, COLOR.asfalto, 0.5);
      const haciaDerecha = i % 2 === 0;
      const velocidad = Phaser.Math.Between(90, 175) * (haciaDerecha ? 1 : -1);
      const cantidad = Phaser.Math.Between(2, 3);
      for (let k = 0; k < cantidad; k++) {
        const ancho = Phaser.Math.Between(64, 104);
        const x = 40 + (k * (ANCHO - 80)) / cantidad + Phaser.Math.Between(-20, 20);
        const p = this.add.rectangle(x, y, ancho, this.altoCarril - 14, COLOR.rojo, 0.8);
        p.setStrokeStyle(2, COLOR.rojoHondo);
        p.vx = velocidad;
        this.patrullas.push(p);
      }
    }

    this.carrilActual = 0; // 0 = largada
    this.jugador = this.add.circle(ANCHO / 2, this.abajoY, 15, COLOR.verde).setStrokeStyle(3, COLOR.tiza);
    this.destinoX = this.jugador.x;

    this.hud = this.add.text(24, 92, '', { fontFamily: FUENTE, fontSize: '16px', color: CSS.humo });
    this.actualizarHud();

    this.input.on('pointerdown', (p) => this.tocar(p));
    this.input.on('pointermove', (p) => {
      if (p.isDown) this.destinoX = p.x;
    });
    this.teclas = this.input.keyboard?.createCursorKeys();
    this.teclas?.up.on('down', () => this.moverCarril(1));
    this.teclas?.down.on('down', () => this.moverCarril(-1));

    this.reloj = this.barraTiempo(this.duracion, () => this.cerrar(false));
    this.inicio = this.time.now;
  }

  actualizarHud() {
    const corazones = '❤'.repeat(Math.max(0, this.vidas)) + '·'.repeat(this.vidasMax - Math.max(0, this.vidas));
    this.hud.setText(`${corazones}    Cruces ${this.cruces}/${this.crucesNecesarios}`);
  }

  tocar(p) {
    this.destinoX = p.x;
    if (p.y < this.jugador.y - 12) this.moverCarril(1);
    else if (p.y > this.jugador.y + 12) this.moverCarril(-1);
  }

  moverCarril(dir) {
    if (this.terminado) return;
    this.carrilActual = Phaser.Math.Clamp(this.carrilActual + dir, 0, this.cantCarriles + 1);
    const destinoY =
      this.carrilActual === 0
        ? this.abajoY
        : this.carrilActual > this.cantCarriles
          ? this.arribaY
          : this.abajoY - this.carrilActual * this.altoCarril;
    this.tweens.add({ targets: this.jugador, y: destinoY, duration: 110 });

    if (this.carrilActual > this.cantCarriles) this.cruzo();
  }

  cruzo() {
    this.cruces += 1;
    this.actualizarHud();
    this.flash('¡PASASTE!', CSS.verde, 260);
    if (this.cruces >= this.crucesNecesarios) return this.cerrar(true);
    this.esperar(420, () => {
      this.carrilActual = 0;
      this.jugador.y = this.abajoY;
    });
  }

  update(_, dt) {
    if (this.terminado || !this.jugador) return;
    const paso = dt / 1000;

    this.destinoX = Phaser.Math.Clamp(this.destinoX, 36, ANCHO - 36);
    this.jugador.x = Phaser.Math.Linear(this.jugador.x, this.destinoX, Math.min(1, 12 * paso));

    for (const p of this.patrullas) {
      p.x += p.vx * paso;
      if (p.vx > 0 && p.x - p.width / 2 > ANCHO) p.x = -p.width / 2;
      if (p.vx < 0 && p.x + p.width / 2 < 0) p.x = ANCHO + p.width / 2;

      const enCarril = Math.abs(p.y - this.jugador.y) < this.altoCarril / 2;
      const encima = Math.abs(p.x - this.jugador.x) < p.width / 2 + 13;
      if (enCarril && encima) this.chocar();
    }
  }

  chocar() {
    if (this.invulnerable) return;
    this.invulnerable = true;
    this.vidas -= 1;
    this.actualizarHud();
    this.cameras.main.shake(200, 0.012);
    this.cameras.main.flash(140, 255, 82, 82);
    this.flash('¡TE VIERON!', CSS.rojo, 300);

    this.carrilActual = 0;
    this.jugador.y = this.abajoY;
    this.esperar(700, () => (this.invulnerable = false));

    if (this.vidas <= 0) this.cerrar(false);
  }

  cerrar(logrado) {
    this.reloj?.detener();
    const avance = this.cruces / this.crucesNecesarios;
    const tiempoRestante = this.reloj?.fraccionRestante?.() ?? 0;
    let score = logrado ? 0.6 + 0.4 * tiempoRestante : avance * 0.5;
    score *= Math.max(0.35, 1 - (this.vidasMax - this.vidas) * 0.15);
    this.terminar(score, logrado ? '¡Del otro lado!' : 'No pudiste pasar');
  }
}
