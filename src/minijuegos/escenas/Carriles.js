import Phaser from 'phaser';
import { BaseMinijuego } from '../BaseMinijuego.js';
import { ANCHO, COLOR, CSS, FUENTE, FUENTE_DISPLAY } from '../tema.js';

/**
 * cruce_frontera: pasar de un lado al otro entre carriles de patrulleros.
 * Tocá arriba del pibe para avanzar un carril, abajo para retroceder, y
 * arrastrá para moverte de costado. Te tocan y volvés al principio.
 *
 * Los carriles se reparten el alto libre y las patrullas van a una velocidad
 * proporcional al ancho, asi que tardan lo mismo en cruzar la pantalla en un
 * celular que en desktop.
 */
export class CarrilesScene extends BaseMinijuego {
  arrancar() {
    this.crucesNecesarios = this.cfg.cruces ?? 2;
    this.cruces = 0;
    this.vidas = this.cfg.vidas ?? 3;
    this.vidasMax = this.vidas;
    this.duracion = this.cfg.duracion ?? 30000;

    this.hud = this.add.text(this.margen, this.topJuego, '', {
      fontFamily: FUENTE,
      fontSize: this.fs(16),
      color: CSS.humo,
    });

    const top = this.topJuego + this.hud.height + 10;
    const disponible = this.H - this.margen - top;

    /*
     * De arriba abajo entran: media zona de llegada, `cant` carriles, la zona
     * de largada y la otra media zona. O sea `cant + 2` alturas de carril.
     * Si con cinco carriles quedan demasiado finos (celular apaisado, ventana
     * baja) se juega con menos: mejor tres carriles jugables que cinco en los
     * que no entra el pibe.
     */
    const altoCon = (cant) => disponible / (cant + 2);
    this.cantCarriles = [5, 4, 3].find((c) => altoCon(c) >= 46) ?? 3;
    this.altoCarril = Phaser.Math.Clamp(altoCon(this.cantCarriles), 38, 84);

    this.abajoY = this.H - this.margen - this.altoCarril / 2;
    this.arribaY = this.abajoY - this.altoCarril * (this.cantCarriles + 1);

    const anchoPista = this.A - this.margen * 1.4;
    const escalaX = this.A / ANCHO;

    // Zonas segura de arriba (destino) y de abajo (largada)
    this.add.rectangle(this.A / 2, this.arribaY, anchoPista, this.altoCarril, COLOR.verdeHondo, 0.75);
    this.add
      .text(this.A / 2, this.arribaY, 'DEL OTRO LADO', {
        fontFamily: FUENTE_DISPLAY,
        fontSize: this.fs(18),
        color: CSS.verde,
      })
      .setOrigin(0.5);
    this.add.rectangle(this.A / 2, this.abajoY, anchoPista, this.altoCarril, COLOR.panel, 0.75);

    this.patrullas = [];
    for (let i = 1; i <= this.cantCarriles; i++) {
      const y = this.abajoY - i * this.altoCarril;
      this.add.rectangle(this.A / 2, y, anchoPista, this.altoCarril - 4, COLOR.asfalto, 0.5);
      const haciaDerecha = i % 2 === 0;
      const velocidad = Phaser.Math.Between(90, 175) * escalaX * (haciaDerecha ? 1 : -1);
      const cantidad = Phaser.Math.Between(2, 3);
      for (let k = 0; k < cantidad; k++) {
        const ancho = Phaser.Math.Between(
          Math.round(this.A * 0.08),
          Math.round(this.A * 0.14)
        );
        const x =
          this.margen + (k * (this.A - this.margen * 2)) / cantidad + Phaser.Math.Between(-20, 20);
        const p = this.add.rectangle(
          x,
          y,
          ancho,
          Math.max(14, this.altoCarril - 14),
          COLOR.rojo,
          0.8
        );
        p.setStrokeStyle(2, COLOR.rojoHondo);
        p.vx = velocidad;
        this.patrullas.push(p);
      }
    }

    this.carrilActual = 0; // 0 = largada
    // El pibe nunca puede ser mas alto que el carril donde se para.
    this.radioJugador = Phaser.Math.Clamp(
      Math.round(Math.min(Math.min(this.A, this.H) * 0.036, this.altoCarril * 0.32)),
      11,
      20
    );
    this.jugador = this.add
      .circle(this.A / 2, this.abajoY, this.radioJugador, COLOR.verde)
      .setStrokeStyle(3, COLOR.tiza);
    this.destinoX = this.jugador.x;
    this.bordeX = this.radioJugador + this.margen;

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
    const corazones =
      '❤'.repeat(Math.max(0, this.vidas)) + '·'.repeat(this.vidasMax - Math.max(0, this.vidas));
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
    this.flash('¡PASASTE!', CSS.verde, this.arribaY + this.altoCarril);
    if (this.cruces >= this.crucesNecesarios) return this.cerrar(true);
    this.esperar(420, () => {
      this.carrilActual = 0;
      this.jugador.y = this.abajoY;
    });
  }

  update(_, dt) {
    if (this.terminado || !this.jugador) return;
    const paso = dt / 1000;

    this.destinoX = Phaser.Math.Clamp(this.destinoX, this.bordeX, this.A - this.bordeX);
    this.jugador.x = Phaser.Math.Linear(this.jugador.x, this.destinoX, Math.min(1, 12 * paso));

    for (const p of this.patrullas) {
      p.x += p.vx * paso;
      if (p.vx > 0 && p.x - p.width / 2 > this.A) p.x = -p.width / 2;
      if (p.vx < 0 && p.x + p.width / 2 < 0) p.x = this.A + p.width / 2;

      const enCarril = Math.abs(p.y - this.jugador.y) < this.altoCarril / 2;
      const encima = Math.abs(p.x - this.jugador.x) < p.width / 2 + this.radioJugador * 0.85;
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
    this.flash('¡TE VIERON!', CSS.rojo, this.H * 0.45);

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
