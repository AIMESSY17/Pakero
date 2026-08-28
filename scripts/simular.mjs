/**
 * Simulador de balance. Juega N partidas eligiendo opciones al azar y
 * reporta como se reparten los finales, la guita y los territorios.
 *
 *   node scripts/simular.mjs 500
 *
 * Sirve para ver si algo esta roto o desbalanceado sin tener que jugar a mano.
 * Ademas valida el pool de eventos y el banco de bloques de la biografia, asi
 * que conviene correrlo despues de agregar contenido.
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
import { validarPool, validarCobertura } from '../src/data/eventos/index.js';
import { inventarioBiografia } from '../src/core/biografia.js';
import { formatearGuita } from '../src/core/constants.js';

const N = Number(process.argv[2] ?? 300);

const problemas = [...validarPool(), ...validarCobertura()];
if (problemas.length) {
  console.error('POOL CON PROBLEMAS:');
  for (const p of problemas) console.error('  - ' + p);
  process.exit(1);
}
const bio = inventarioBiografia();
console.log('Pool de eventos validado OK.');
console.log(
  `Biografia: ${bio.total} bloques — ` +
    Object.entries(bio.porSeccion)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ') +
    '\n'
);

const finales = new Map();
const rarezas = new Map();
const bloquesUsados = new Map();
let sumaGuita = 0;
let sumaEdad = 0;
let sumaTerr = 0;
let sumaNota = 0;
let contadorNotas = 0;
let ganoAlRival = 0;
let crisisDisparadas = 0;
let mudanzasHechas = 0;

// Lo que agrego la bifurcacion de los 18 y los vinculos.
const via = { estudiar: 0, calle: 0, sinDefinir: 0, comunicacion: 0, administracion: 0, reconversion: 0 };
const vinc = { hijo: 0, socioPresentacion: 0, socioPrueba: 0, socioCierre: 0, traicion: 0 };
const hijoTracker = [];
let ecosResurgidos = 0;
let bisagras = 0;
let bisagrasTerritorio = 0;

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
        // Puede no quedar ninguna (salud en el piso, o no le alcanza la guita
        // para reconvertirse): en ese caso el evento se saltea.
        if (validas.length === 0) {
          continuar(estado);
          continue;
        }
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
      ecosResurgidos += estado.resumen.ecos?.length ?? 0;
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
  for (const b of f.biografia ?? []) bloquesUsados.set(b.id, (bloquesUsados.get(b.id) ?? 0) + 1);
  sumaGuita += estado.guita;
  sumaEdad += estado.edad;
  sumaTerr += estado.territorios.length;
  if (estado.ventas > estado.rival.ventas) ganoAlRival++;

  const c = estado.camino;
  if (!c.elegido) via.sinDefinir++;
  else via[c.elegido]++;
  if (c.subVariante) via[c.subVariante]++;
  if (c.reconversion) via.reconversion++;

  if (estado.hijo) {
    vinc.hijo++;
    hijoTracker.push(estado.hijo.tracker);
  }
  const m = estado.socio?.momentos ?? [];
  if (m.includes('presentacion')) vinc.socioPresentacion++;
  if (m.includes('prueba')) vinc.socioPrueba++;
  if (m.includes('cierre')) vinc.socioCierre++;
  if (estado.socio?.estado === 'traiciono') vinc.traicion++;

  for (const id of estado.especialesJugados ?? []) {
    if (id.includes('bisagra_terr')) bisagrasTerritorio++;
    else if (id.includes('bisagra')) bisagras++;
  }
}

const pct = (n) => ((n / N) * 100).toFixed(1) + '%';
const prom = (arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '—');

console.log(`=== ${N} partidas simuladas ===\n`);
console.log('FINALES');
for (const [id, n] of [...finales.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id.padEnd(22)} ${String(n).padStart(4)}  ${pct(n)}`);
}
console.log('\nRAREZA');
for (const [r, n] of [...rarezas.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${r.padEnd(22)} ${String(n).padStart(4)}  ${pct(n)}`);
}

console.log('\nCAMINO (bifurcacion de los 18)');
console.log(`  Estudiar:          ${pct(via.estudiar)}   (Comunicación ${via.comunicacion} / Administración ${via.administracion})`);
console.log(`  Calle:             ${pct(via.calle)}`);
console.log(`  Reconversiones:    ${pct(via.reconversion)}   (segunda chance a los 25-30)`);
if (via.sinDefinir) console.log(`  ⚠ Sin definir:     ${via.sinDefinir} partidas`);

console.log('\nVINCULOS');
console.log(`  Tuvieron hijo:     ${pct(vinc.hijo)}   tracker final promedio ${prom(hijoTracker)}/100`);
console.log(`  Socio presentado:  ${pct(vinc.socioPresentacion)}`);
console.log(`  Llegó a la prueba: ${pct(vinc.socioPrueba)}   te traicionó ${pct(vinc.traicion)}`);
console.log(`  Cerró el arco:     ${pct(vinc.socioCierre)}`);

console.log('\nPROMEDIOS');
console.log(`  Edad final:        ${(sumaEdad / N).toFixed(1)}`);
console.log(`  Guita final:       ${formatearGuita(sumaGuita / N)}`);
console.log(`  Territorios:       ${(sumaTerr / N).toFixed(2)} / 4`);
console.log(`  Nota del año:      ${(sumaNota / Math.max(1, contadorNotas)).toFixed(2)} / 10`);
console.log(`  Le ganó al rival:  ${pct(ganoAlRival)}`);
console.log(`  Eventos de crisis: ${crisisDisparadas}`);
console.log(`  Mudanzas:          ${mudanzasHechas}`);
console.log(`  Ecos resurgidos:   ${ecosResurgidos}   (${(ecosResurgidos / N).toFixed(2)} por partida)`);
console.log(`  Bisagras:          ${bisagras} de edad + ${bisagrasTerritorio} enganchadas a Territorio`);
console.log(`  Finales distintos: ${finales.size} / 14`);
console.log(`  Bloques de bio:    ${bloquesUsados.size} / ${bio.total} usados al menos una vez`);
