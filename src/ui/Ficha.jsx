import { Panel, Titulo, Chip, InfoTip } from './base.jsx';
import { STATS, STAT_META, formatearGuita, formatearGuitaCorta, ETAPAS } from '../core/constants.js';
import { progresoProximoHito } from '../core/territorio.js';
import { activosDelJugador } from '../core/mercado.js';
import { nombreRivalCompleto } from '../data/nombres.js';
import { GLOSARIO_STATS, GLOSARIO_CONTADORES } from '../data/glosario.js';

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
    <div className="relative flex-1 rounded-xl border border-borde bg-panel-alto px-2 py-3 text-center">
      {info && (
        <span className="absolute right-1.5 top-1.5">
          <InfoTip info={info} />
        </span>
      )}
      <div aria-hidden className="text-base leading-none">
        {icono}
      </div>
      <div className={`num-grande mt-1.5 text-3xl ${color}`}>{valor}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-humo">
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
export function Ficha({ estado }) {
  const previo = estado.historial[estado.historial.length - 1];
  const deltaDe = (stat) => (previo ? estado.stats[stat] - previo.stats[stat] : 0);

  return (
    <Panel className="textura-asfalto space-y-5">
      {/* Cabecera: número grande + identidad */}
      <div className="flex items-start gap-4">
        <div className="shrink-0 text-center">
          <div className="num-grande text-6xl text-verde">{estado.edad}</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-humo">
            años
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl leading-tight text-tiza">
            {estado.jugador.nombre}
          </h1>
          <p className="truncate text-sm italic text-dorado">"{estado.jugador.apodo}"</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip color="humo">{ETAPAS[estado.etapa].label}</Chip>
            <Chip color={estado.ubicacion.esOrigen ? 'verde' : 'dorado'}>
              📍 {estado.ubicacion.nombre}
            </Chip>
          </div>
        </div>
      </div>

      {/* Guita */}
      <div className="rounded-xl border border-verde/25 bg-verde-hondo/60 px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-verde/70">
          Guita
        </div>
        <div className="num-grande mt-0.5 text-3xl text-verde">
          {formatearGuita(estado.guita)}
        </div>
      </div>

      {/* Contadores */}
      <div className="flex gap-2">
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
      <ProgresoHito estado={estado} />

      {estado.territorios.length > 0 && (
        <div>
          <Titulo>Territorios</Titulo>
          <ul className="mt-2 space-y-1">
            {estado.territorios.map((t) => (
              <li key={`${t.nivel}-${t.nombre}`} className="flex justify-between text-xs">
                <span className="text-dorado">👑 {t.nombre}</span>
                <span className="text-humo-tenue">a los {t.edad}</span>
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
