import { Panel, Titulo, Chip, InfoTip } from './base.jsx';
import {
  STATS,
  STAT_META,
  formatearGuita,
  formatearGuitaCorta,
  ETAPAS,
  DESTINOS_DUENIO,
} from '../core/constants.js';
import { progresoProximoHito } from '../core/territorio.js';
import { activosDelJugador } from '../core/mercado.js';
import { nombreRivalCompleto } from '../data/nombres.js';
import { GLOSARIO_STATS, GLOSARIO_CONTADORES, GLOSARIO_VINCULOS } from '../data/glosario.js';
import { etiquetaCamino } from '../core/camino.js';
import { etiquetaNegocio } from '../core/negocio.js';
import { vistaHijo, vistaSocio } from '../core/vinculos.js';

/** Flecha de tendencia contra el año anterior. */
function Tendencia({ delta, invertido }) {
  if (!delta) return <span className="w-4 text-humo-tenue">·</span>;
  const bueno = invertido ? delta < 0 : delta > 0;
  return (
    <span
      title={`${delta > 0 ? '+' : ''}${delta} desde el año pasado`}
      className={`w-4 text-xs font-bold ${bueno ? 'text-verde' : 'text-rojo'}`}
    >
      {delta > 0 ? '▲' : '▼'}
    </span>
  );
}

function BarraStat({ stat, valor, delta, alerta }) {
  const meta = STAT_META[stat];
  // Atención llena es lo peor que te puede pasar, así que se pinta al revés.
  const color = meta.invertido
    ? valor >= 80
      ? 'bg-rojo'
      : valor >= 50
        ? 'bg-dorado'
        : 'bg-humo'
    : stat === 'salud' && valor < 30
      ? 'bg-rojo'
      : 'bg-verde';

  return (
    <div className={alerta ? 'rounded-lg bg-rojo/8 px-2 py-1 -mx-2' : ''}>
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-sm">
          {meta.icono}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-humo">
          {meta.label}
          <InfoTip info={GLOSARIO_STATS[stat]} />
        </span>
        <span className="flex-1" />
        <Tendencia delta={delta} invertido={meta.invertido} />
        <span className="w-8 text-right font-mono text-sm font-bold tabular-nums text-tiza">
          {valor}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-noche">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${valor}%` }}
        />
      </div>
    </div>
  );
}

function TarjetaContador({ label, valor, icono, color = 'text-tiza', info }) {
  return (
    <div className="relative min-w-0 rounded-xl border border-borde bg-panel-alto px-1.5 py-3 text-center sm:px-2">
      {info && (
        <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5">
          <InfoTip info={info} />
        </span>
      )}
      <div aria-hidden className="text-base leading-none">
        {icono}
      </div>
      <div className={`num-grande num-ajustable mt-1.5 text-2xl sm:text-3xl ${color}`}>{valor}</div>
      <div className="mt-1 text-[9px] font-semibold uppercase leading-tight tracking-[0.08em] text-humo sm:text-[10px] sm:tracking-[0.15em]">
        {label}
      </div>
    </div>
  );
}

function DueloRival({ estado }) {
  const { rival, ventas } = estado;
  const total = Math.max(1, ventas + rival.ventas);
  const gana = ventas > rival.ventas;
  const empate = ventas === rival.ventas;

  return (
    <div>
      <Titulo>El duelo eterno</Titulo>
      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="font-bold text-tiza">Vos</span>
        <span
          className={`font-mono text-xs font-bold ${gana ? 'text-verde' : empate ? 'text-dorado' : 'text-rojo'}`}
        >
          {gana ? 'ARRIBA' : empate ? 'EMPATE' : 'ABAJO'}
        </span>
        <span className="font-bold text-humo">{rival.nombre}</span>
      </div>
      <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-noche">
        <div
          className="bg-verde transition-all duration-500"
          style={{ width: `${(ventas / total) * 100}%` }}
        />
        <div className="flex-1 bg-rojo/70" />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-xs tabular-nums">
        <span className="text-verde">{ventas} ventas</span>
        <span className="text-rojo/90">{rival.ventas} ventas</span>
      </div>
      <p className="mt-1.5 text-[11px] text-humo-tenue">{nombreRivalCompleto(rival)}</p>
    </div>
  );
}

const COLOR_VINCULO = {
  verde: { borde: 'border-verde/30 bg-verde-hondo/25', barra: 'bg-verde', texto: 'text-verde' },
  dorado: { borde: 'border-dorado/30 bg-dorado-hondo/20', barra: 'bg-dorado', texto: 'text-dorado' },
  rojo: { borde: 'border-rojo/30 bg-rojo-hondo/25', barra: 'bg-rojo', texto: 'text-rojo' },
  humo: { borde: 'border-borde bg-panel-alto', barra: 'bg-humo', texto: 'text-humo' },
};

/**
 * Los dos vinculos que el juego sigue de verdad. Se muestran juntos y solo
 * cuando existen: el hijo aparece si nacio, el socio si ya se presento.
 *
 * El hijo tiene barra porque su tracker es un numero que el jugador tiene que
 * poder mirar. El socio NO: su lealtad es un contador liviano y oculto, asi
 * que lo unico que se ve es como esta parado con vos.
 */
function LosTuyos({ estado }) {
  const hijo = vistaHijo(estado);
  const socio = estado.socio?.momentos?.length ? vistaSocio(estado) : null;
  if (!hijo && !socio) return null;

  return (
    <div>
      <Titulo>Los tuyos</Titulo>
      <div className="mt-2 space-y-2">
        {hijo && (
          <div className={`rounded-xl border p-3 ${COLOR_VINCULO[hijo.color].borde}`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-tiza">
                <span aria-hidden>🧒</span>
                {hijo.nombre}
                <span className="font-normal text-humo-tenue">{hijo.edadLabel}</span>
                <InfoTip info={GLOSARIO_VINCULOS.hijo} />
              </span>
              <span className="font-mono text-xs tabular-nums text-tiza">{hijo.tracker}/100</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-noche">
              <div
                className={`h-full rounded-full transition-all duration-500 ${COLOR_VINCULO[hijo.color].barra}`}
                style={{ width: `${hijo.tracker}%` }}
              />
            </div>
            <p className={`mt-1 text-[11px] ${COLOR_VINCULO[hijo.color].texto}`}>
              {hijo.icono} {hijo.label}
            </p>
          </div>
        )}
        {socio && (
          <div className={`rounded-xl border p-3 ${COLOR_VINCULO[socio.color].borde}`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-tiza">
                <span aria-hidden>🤝</span>
                Tu socio
                <InfoTip info={GLOSARIO_VINCULOS.socio} />
              </span>
              <span className="font-mono text-[10px] text-humo-tenue">
                {socio.momentos.length}/3 del arco
              </span>
            </div>
            <p className="mt-1 min-w-0 truncate text-sm text-tiza">{socio.completo}</p>
            <p className={`mt-0.5 text-[11px] ${COLOR_VINCULO[socio.color].texto}`}>
              {socio.icono} {socio.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgresoHito({ estado }) {
  const hito = progresoProximoHito(estado);
  if (hito.completo) {
    return (
      <div className="rounded-xl border border-dorado/40 bg-dorado/10 p-3 text-center">
        <p className="font-display text-sm uppercase tracking-widest text-dorado">
          Los cuatro territorios
        </p>
        <p className="mt-1 text-xs text-humo">No queda nada arriba tuyo.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Titulo>Próximo hito</Titulo>
        {hito.listo && <Chip color="dorado">¡Listo!</Chip>}
      </div>
      <p className="mt-1.5 text-sm font-bold text-tiza">{hito.label}</p>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-noche">
        <div
          className={`h-full rounded-full transition-all duration-500 ${hito.listo ? 'bg-dorado anim-brillo' : 'bg-dorado/60'}`}
          style={{ width: `${hito.progreso * 100}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-humo-tenue">Necesitás {hito.texto}</p>
    </div>
  );
}

function ActivosMercado({ estado }) {
  const activos = activosDelJugador(estado);
  if (activos.length === 0) return null;
  return (
    <div>
      <Titulo>Tus activos</Titulo>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {activos.map((item) => (
          <span
            key={item.id}
            title={`${item.nombre} — ${item.desc}`}
            className="flex items-center gap-1 rounded-lg border border-borde bg-panel-alto px-2 py-1 text-xs text-humo"
          >
            <span aria-hidden>{item.icono}</span>
            <span className="max-w-28 truncate">{item.nombre}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** La ficha completa del personaje, estilo "El Ídolo". */
export function Ficha({ estado, className = '' }) {
  const previo = estado.historial[estado.historial.length - 1];
  const deltaDe = (stat) => (previo ? estado.stats[stat] - previo.stats[stat] : 0);
  const camino = etiquetaCamino(estado);
  // De los 23 en adelante: en qué se fue convirtiendo.
  const negocio = etiquetaNegocio(estado);

  return (
    <Panel className={`textura-asfalto min-w-0 space-y-5 ${className}`}>
      {/* Cabecera: número grande + identidad */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="shrink-0 text-center">
          <div className="num-grande text-5xl text-verde sm:text-6xl">{estado.edad}</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-humo">
            años
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl leading-tight text-tiza sm:text-2xl">
            {estado.jugador.nombre}
          </h1>
          <p className="truncate text-sm italic text-dorado">"{estado.jugador.apodo}"</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip color="humo">{ETAPAS[estado.etapa].label}</Chip>
            <Chip
              color={estado.ubicacion.esOrigen ? 'verde' : 'dorado'}
              className="max-w-full min-w-0"
            >
              <span className="min-w-0 truncate">📍 {estado.ubicacion.nombre}</span>
            </Chip>
            {camino && (
              <Chip color={camino.id === 'estudiar' ? 'verde' : 'dorado'} className="max-w-full min-w-0">
                <span className="min-w-0 truncate">
                  {camino.icono} {camino.label}
                  {camino.reconvertido ? ' ↩' : ''}
                </span>
                <InfoTip info={GLOSARIO_VINCULOS.camino} />
              </Chip>
            )}
            {negocio && (
              <Chip color="humo" className="max-w-full min-w-0">
                <span className="min-w-0 truncate" title={negocio.desc}>
                  {negocio.icono} {negocio.label}
                </span>
                <InfoTip info={GLOSARIO_VINCULOS.negocio} />
              </Chip>
            )}
          </div>
        </div>
      </div>

      {/* Guita */}
      <div className="rounded-xl border border-verde/25 bg-verde-hondo/60 px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-verde/70">
          Guita
        </div>
        <div className="num-grande num-ajustable mt-0.5 text-2xl text-verde sm:text-3xl">
          {formatearGuita(estado.guita)}
        </div>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <TarjetaContador
          label="Ventas"
          valor={estado.ventas}
          icono="📦"
          color="text-verde"
          info={GLOSARIO_CONTADORES.ventas}
        />
        <TarjetaContador
          label="Movidas"
          valor={estado.movidas}
          icono="🎯"
          color="text-tiza"
          info={GLOSARIO_CONTADORES.movidas}
        />
        <TarjetaContador
          label="Territorios"
          valor={`${estado.territorios.length}/4`}
          icono="🗺️"
          color="text-dorado"
          info={GLOSARIO_CONTADORES.territorios}
        />
      </div>

      {/* Stats */}
      <div className="space-y-2.5">
        <Titulo>Los cinco</Titulo>
        {STATS.map((stat) => (
          <BarraStat
            key={stat}
            stat={stat}
            valor={estado.stats[stat]}
            delta={deltaDe(stat)}
            alerta={
              (stat === 'salud' && estado.stats.salud < 30) ||
              (stat === 'atencion' && estado.stats.atencion >= 80)
            }
          />
        ))}
        {estado.stats.salud < 30 && (
          <p className="text-xs text-rojo">
            ⚠️ Salud baja: te bloquea las opciones de riesgo alto con esfuerzo físico y te
            baja el ingreso.
          </p>
        )}
        {estado.stats.atencion >= 80 && (
          <p className="text-xs text-rojo">
            🚨 Te tienen marcado: 50% de caer preso en cualquier evento de riesgo.
          </p>
        )}
      </div>

      <DueloRival estado={estado} />
      <LosTuyos estado={estado} />
      <ProgresoHito estado={estado} />

      {estado.territorios.length > 0 && (
        <div>
          <Titulo>Territorios</Titulo>
          <ul className="mt-2 space-y-2">
            {estado.territorios.map((t) => {
              // Cuántos años faltan para tener que volver a bancarlo. Se
              // muestra porque perderlo es una posibilidad real y el jugador
              // tiene que poder verla venir.
              const faltan = (t.proximoMantenimiento ?? 0) - estado.anio;
              const vence = t.nivel !== 4 && faltan <= 1;
              const dest = t.duenio?.destino ? DESTINOS_DUENIO[t.duenio.destino] : null;
              return (
                <li key={`${t.nivel}-${t.nombre}`} className="text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="min-w-0 truncate text-dorado">👑 {t.nombre}</span>
                    <span className="shrink-0 text-humo-tenue">a los {t.edad}</span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]">
                    {t.nivel !== 4 && (
                      <span className={vence ? 'font-semibold text-rojo' : 'text-humo-tenue'}>
                        {faltan <= 0
                          ? '⚠️ hay que ir a bancarlo'
                          : `se afloja en ${faltan} ${faltan === 1 ? 'año' : 'años'}`}
                      </span>
                    )}
                    {dest && (
                      <span className="text-humo-tenue">
                        {dest.icono} {t.duenio.nombre}: {dest.label.toLowerCase()}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {estado.territoriosPerdidos?.length > 0 && (
        <div>
          <Titulo>Lo que se te cayó</Titulo>
          <ul className="mt-2 space-y-1">
            {estado.territoriosPerdidos.map((t, i) => (
              <li key={i} className="flex justify-between gap-2 text-xs">
                <span className="min-w-0 truncate text-humo-tenue line-through">{t.nombre}</span>
                <span className="shrink-0 text-rojo/70">a los {t.perdidoALos}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ActivosMercado estado={estado} />

      {estado.historial.length > 1 && (
        <div className="border-t border-borde-suave pt-3 text-[11px] text-humo-tenue">
          Último ingreso anual:{' '}
          <span className="font-mono text-humo">
            {formatearGuitaCorta(estado.historial[estado.historial.length - 1].ingreso)}
          </span>
        </div>
      )}
    </Panel>
  );
}
