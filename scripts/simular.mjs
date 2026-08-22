/**
 * Simulador de balance. Juega N partidas eligiendo opciones al azar y
 * reporta como se reparten los finales, la guita y los territorios.
 *
 *   node scripts/simular.mjs 500
 *
 * Sirve para ver si algo esta roto o desbalanceado sin tener que jugar a mano.
 */
import { crearPartida } from '../src/core/partida.js';
import {
  construirAnio,
  eventoActual,
  elegirOpcion,
  continuar,
  jugarConquista,
  cerrarConquista,
  siguienteAnio,
  opcionBloqueada,
  retirarse,
  puedeRetirarse,
} from '../src/core/engine.js';
import { mudarse, destinosDisponibles } from '../src/core/territorio.js';
import { validarPool } from '../src/data/eventos/index.js';
import { formatearGuita } from '../src/core/constants.js';

const N = Number(process.argv[2] ?? 300);

const problemas = validarPool();
if (problemas.length) {
  console.error('POOL CON PROBLEMAS:');
  for (const p of problemas) console.error('  - ' + p);
  process.exit(1);
}
console.log('Pool de eventos validado OK.\n');

const finales = new Map();
const rarezas = new Map();
let sumaGuita = 0;
let sumaEdad = 0;
let sumaTerr = 0;
let sumaNota = 0;
let contadorNotas = 0;
let ganoAlRival = 0;
let crisisDisparadas = 0;
let mudanzasHechas = 0;

for (let i = 0; i < N; i++) {
  const estado = crearPartida({ nombre: 'Test', seed: (i * 2654435761) >>> 0 });
  construirAnio(estado);

  let guarda = 0;
  while (!estado.final && guarda++ < 5000) {
    if (estado.fase === 'evento') {
      const actual = eventoActual(estado);
      if (!actual) {
        continuar(estado);
        continue;
      }
      const { def, runtime } = actual;
      if (def.tipo === 'decision' && !runtime.resuelto) {
        const validas = def.opciones
          .map((op, idx) => ({ op, idx }))
          .filter(({ op }) => !opcionBloqueada(estado, op));
        const elegida = validas[Math.floor(Math.random() * validas.length)];
        // Mitad de las veces "juega" el minijuego con un score random.
        const score = elegida.op.minijuego ? Math.random() : null;
        elegirOpcion(estado, elegida.idx, score);
        if (estado.anioActual?.crisis) crisisDisparadas++;
      } else {
        continuar(estado);
      }
    } else if (estado.fase === 'conquista') {
      const p = estado.pendienteConquista;
      if (!p.resultado) jugarConquista(estado, p.minijuego ? Math.random() : null);
      else cerrarConquista(estado);
    } else if (estado.fase === 'resumen') {
      sumaNota += estado.resumen.nota;
      contadorNotas++;
      // Un jugador random tambien se muda y se retira de vez en cuando.
      if (estado.edad >= 18 && Math.random() < 0.06) {
        const destinos = destinosDisponibles(estado);
        mudarse(estado, destinos[Math.floor(Math.random() * destinos.length)]);
        mudanzasHechas++;
      }
      if (puedeRetirarse(estado) && Math.random() < 0.05) {
        retirarse(estado);
        break;
      }
      siguienteAnio(estado);
    } else {
      break;
    }
  }

  if (guarda >= 5000) {
    console.error('LOOP INFINITO en la partida', i);
    process.exit(1);
  }

  const f = estado.final;
  finales.set(f.id, (finales.get(f.id) ?? 0) + 1);
  rarezas.set(f.rareza, (rarezas.get(f.rareza) ?? 0) + 1);
  sumaGuita += estado.guita;
  sumaEdad += estado.edad;
  sumaTerr += estado.territorios.length;
  if (estado.ventas > estado.rival.ventas) ganoAlRival++;
}

const pct = (n) => ((n / N) * 100).toFixed(1) + '%';

console.log(`=== ${N} partidas simuladas ===\n`);
console.log('FINALES');
for (const [id, n] of [...finales.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id.padEnd(22)} ${String(n).padStart(4)}  ${pct(n)}`);
}
console.log('\nRAREZA');
for (const [r, n] of [...rarezas.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${r.padEnd(22)} ${String(n).padStart(4)}  ${pct(n)}`);
}
console.log('\nPROMEDIOS');
console.log(`  Edad final:        ${(sumaEdad / N).toFixed(1)}`);
console.log(`  Guita final:       ${formatearGuita(sumaGuita / N)}`);
console.log(`  Territorios:       ${(sumaTerr / N).toFixed(2)} / 4`);
console.log(`  Nota del año:      ${(sumaNota / Math.max(1, contadorNotas)).toFixed(2)} / 10`);
console.log(`  Le ganó al rival:  ${pct(ganoAlRival)}`);
console.log(`  Eventos de crisis: ${crisisDisparadas}`);
console.log(`  Mudanzas:          ${mudanzasHechas}`);
console.log(`  Finales distintos: ${finales.size} / 14`);
