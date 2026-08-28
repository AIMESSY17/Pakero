import { FINALES } from '../data/finales.js';
import { rarezaFinal } from './formulas.js';
import { formatearGuita } from './constants.js';
import { nombreRivalCompleto } from '../data/nombres.js';
import { armarBiografia } from './biografia.js';
import { etiquetaCamino } from './camino.js';
import { vistaHijo, vistaSocio } from './vinculos.js';

/**
 * Elige el final. Sin tabla de prioridad ni puntajes: recorre la lista y se
 * queda con la primera condicion que da true (la ultima siempre da true).
 */
export function resolverFinal(estado, causa) {
  const ctx = {
    causa,
    edad: estado.edad,
    stats: estado.stats,
    guita: estado.guita,
    ventas: estado.ventas,
    movidas: estado.movidas,
    territorios: estado.territorios.length,
    mudanzas: estado.mudanzas,
    enElExterior: estado.enElExterior,
    volvioAlPais: estado.volvioAlPais,
    rival: estado.rival,
    ultimaMovidaFallida: estado.ultimaMovidaFallida,
    seRetiro: estado.seRetiro,
    // Lo que sumo la bifurcacion de los 18 y los vinculos. Hoy ninguna de las
    // 14 condiciones lo usa, pero esta disponible para las que vengan.
    camino: estado.camino?.elegido ?? null,
    subVariante: estado.camino?.subVariante ?? null,
    reconvertido: !!estado.camino?.reconversion,
    hijo: estado.hijo ? { ...estado.hijo } : null,
    socio: estado.socio ? { ...estado.socio } : null,
  };

  const final = FINALES.find((f) => f.condicion(ctx)) ?? FINALES[FINALES.length - 1];

  const resuelto = {
    id: final.id,
    titulo: final.titulo,
    apodo: final.apodo,
    icono: final.icono,
    color: final.color,
    texto: final.texto(ctx),
    rareza: rarezaFinal(ctx.territorios, estado.stats.fama),
    causa,
    ctx,
  };

  // La biografia se arma una sola vez, al cerrar la partida, y queda guardada
  // dentro del final: asi la pantalla de fin no depende de recalcular nada y
  // una partida cargada muestra exactamente el mismo texto.
  resuelto.biografia = armarBiografia(estado, resuelto);
  resuelto.camino = etiquetaCamino(estado);
  resuelto.hijo = vistaHijo(estado);
  resuelto.socio = estado.socio?.momentos?.length ? vistaSocio(estado) : null;

  return resuelto;
}

/** Texto plano para el botón "Copiar resumen de carrera". */
export function resumenParaCopiar(estado, final) {
  const L = [];
  const j = estado.jugador;
  L.push('PAQUERO — Resumen de carrera');
  L.push('================================');
  L.push(`${j.nombre} "${j.apodo}"`);
  L.push(`${final.titulo} — "${final.apodo}"  [${final.rareza}]`);
  L.push('');
  L.push(`Edad final: ${estado.edad}`);
  L.push(`Guita: ${formatearGuita(estado.guita)}`);
  L.push(`Ventas: ${estado.ventas}   Movidas: ${estado.movidas}`);
  L.push(
    `Stats — Calle ${estado.stats.calle} | Fama ${estado.stats.fama} | Maña ${estado.stats.mana} | Atención ${estado.stats.atencion} | Salud ${estado.stats.salud}`
  );
  L.push('');
  if (final.camino) {
    L.push('EL CAMINO');
    L.push(`  ${final.camino.icono} ${final.camino.label}${final.camino.reconvertido ? ' (reconversión de grande)' : ''}`);
    L.push('');
  }
  if (final.hijo) {
    L.push('LA SANGRE');
    L.push(`  ${final.hijo.nombre}, ${final.hijo.edadLabel} — ${final.hijo.label} (${final.hijo.tracker}/100)`);
    L.push('');
  }
  if (final.socio) {
    L.push('EL SOCIO');
    L.push(`  ${final.socio.completo} — ${final.socio.label}`);
    L.push('');
  }
  L.push('EL DUELO ETERNO');
  L.push(`  Vos: ${estado.ventas} ventas`);
  L.push(`  ${nombreRivalCompleto(estado.rival)}: ${estado.rival.ventas} ventas`);
  L.push(
    `  ${estado.ventas > estado.rival.ventas ? 'Le ganaste.' : estado.ventas === estado.rival.ventas ? 'Empate técnico.' : 'Te ganó.'}`
  );
  L.push('');
  L.push(`TERRITORIOS (${estado.territorios.length}/4)`);
  if (estado.territorios.length === 0) L.push('  Ninguno.');
  for (const t of estado.territorios) L.push(`  Nivel ${t.nivel} — ${t.nombre} (a los ${t.edad})`);
  L.push('');
  L.push('ZONAS QUE PISASTE');
  for (const z of estado.zonasVisitadas) {
    L.push(`  ${z.nombre}${z.origen ? ' (origen)' : ''} — a los ${z.edad}`);
  }
  return L.join('\n');
}
