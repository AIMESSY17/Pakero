import { useState } from 'react';
import { Boton, Panel, Titulo, BadgeRareza, Chip } from '../base.jsx';
import { resumenParaCopiar } from '../../core/finales.js';
import { STATS, STAT_META, formatearGuita } from '../../core/constants.js';
import { nombreRivalCompleto } from '../../data/nombres.js';

const BORDE_COLOR = {
  dorado: 'border-dorado/50 bg-dorado-hondo/25',
  verde: 'border-verde/40 bg-verde-hondo/25',
  rojo: 'border-rojo/40 bg-rojo-hondo/25',
  humo: 'border-borde bg-panel',
};
const TEXTO_COLOR = {
  dorado: 'text-dorado',
  verde: 'text-verde',
  rojo: 'text-rojo',
  humo: 'text-humo',
};

export function Final({ estado, onNueva, onMenu, onEstadisticas }) {
  const [copiado, setCopiado] = useState(false);
  const f = estado.final;

  const copiar = async () => {
    const texto = resumenParaCopiar(estado, f);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2400);
    } catch {
      // Sin permiso de portapapeles: al menos que lo pueda seleccionar a mano.
      window.prompt('Copiá tu resumen de carrera:', texto);
    }
  };

  const gana = estado.ventas > estado.rival.ventas;
  const empate = estado.ventas === estado.rival.ventas;

  return (
    <div className="textura-asfalto min-h-dvh p-4 sm:p-6">
      <div className="anim-subir mx-auto max-w-2xl space-y-4">
        {/* El final */}
        <div className={`rounded-3xl border-2 p-8 text-center shadow-2xl ${BORDE_COLOR[f.color]}`}>
          <div aria-hidden className="text-6xl">
            {f.icono}
          </div>
          <p className="mt-4 font-display text-xs uppercase tracking-[0.3em] text-humo">
            Así termina la historia
          </p>
          <h1 className={`num-grande mt-2 text-5xl ${TEXTO_COLOR[f.color]}`}>{f.titulo}</h1>
          <p className="mt-3 font-display text-lg tracking-wider text-tiza">"{f.apodo}"</p>
          <div className="mt-4">
            <BadgeRareza rareza={f.rareza} />
          </div>
          <p className="mx-auto mt-6 max-w-lg leading-relaxed text-humo">{f.texto}</p>
        </div>

        {/* Cómo cerraste */}
        <Panel className="space-y-4">
          <Titulo>Cómo cerraste</Titulo>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { l: 'Edad', v: estado.edad },
              { l: 'Ventas', v: estado.ventas },
              { l: 'Movidas', v: estado.movidas },
              { l: 'Territorios', v: `${estado.territorios.length}/4` },
            ].map((t) => (
              <div key={t.l} className="rounded-xl border border-borde bg-panel-alto p-3 text-center">
                <div className="num-grande text-2xl text-tiza">{t.v}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-humo">{t.l}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-verde/25 bg-verde-hondo/40 p-4 text-center">
            <div className="text-[10px] uppercase tracking-widest text-verde/70">Guita final</div>
            <div className="num-grande mt-1 text-3xl text-verde">{formatearGuita(estado.guita)}</div>
          </div>

          <ul className="space-y-1.5">
            {STATS.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span aria-hidden>{STAT_META[s].icono}</span>
                <span className="w-20 text-xs text-humo">{STAT_META[s].label}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-noche">
                  <span
                    className="block h-full rounded-full bg-humo"
                    style={{ width: `${estado.stats[s]}%` }}
                  />
                </span>
                <span className="w-8 text-right font-mono text-xs text-tiza">{estado.stats[s]}</span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* El Duelo Eterno */}
        <Panel className="space-y-3">
          <Titulo>El duelo eterno</Titulo>
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`rounded-xl border p-4 text-center ${gana ? 'border-verde/50 bg-verde-hondo/30' : 'border-borde bg-panel-alto'}`}
            >
              <div className="text-xs text-humo">Vos</div>
              <div className={`num-grande mt-1 text-4xl ${gana ? 'text-verde' : 'text-tiza'}`}>
                {estado.ventas}
              </div>
              <div className="mt-1 text-[11px] text-humo-tenue">
                {estado.jugador.nombre} "{estado.jugador.apodo}"
              </div>
            </div>
            <div
              className={`rounded-xl border p-4 text-center ${!gana && !empate ? 'border-rojo/50 bg-rojo-hondo/30' : 'border-borde bg-panel-alto'}`}
            >
              <div className="text-xs text-humo">El rival</div>
              <div className={`num-grande mt-1 text-4xl ${!gana && !empate ? 'text-rojo' : 'text-tiza'}`}>
                {estado.rival.ventas}
              </div>
              <div className="mt-1 text-[11px] text-humo-tenue">{nombreRivalCompleto(estado.rival)}</div>
            </div>
          </div>
          <p
            className={`text-center text-sm font-bold ${gana ? 'text-verde' : empate ? 'text-dorado' : 'text-rojo'}`}
          >
            {gana
              ? 'Le ganaste. Al final el que quedó en la historia fuiste vos.'
              : empate
                ? 'Terminaron iguales. Ninguno de los dos se va tranquilo.'
                : 'Te ganó. Vas a seguir escuchando su nombre toda la vida.'}
          </p>
        </Panel>

        {/* Zonas visitadas */}
        <Panel className="space-y-3">
          <Titulo>Por dónde pasaste</Titulo>
          <ol className="space-y-2">
            {estado.zonasVisitadas.map((z, i) => {
              const conquistada = estado.territorios.some((t) => t.nombre === z.nombre);
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-humo-tenue">{z.edad}</span>
                  <span className="flex-1 text-sm text-tiza">{z.nombre}</span>
                  {z.origen && <Chip color="verde">Origen</Chip>}
                  {conquistada && <Chip color="dorado">👑 Conquistada</Chip>}
                </li>
              );
            })}
          </ol>
          {estado.territorios.length > 0 && (
            <div className="border-t border-borde-suave pt-3">
              <div className="text-[10px] uppercase tracking-widest text-humo">Territorios tuyos</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {estado.territorios.map((t) => (
                  <Chip key={t.nombre} color="dorado">
                    👑 {t.nombre}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <div className="space-y-2">
          <Boton className="w-full" variante="panel" onClick={copiar}>
            {copiado ? '✓ Copiado' : '📋 Copiar resumen de carrera'}
          </Boton>
          <Boton className="w-full" variante="fantasma" onClick={onEstadisticas}>
            📊 Ver estadísticas
          </Boton>
          <Boton className="w-full" onClick={onNueva}>
            Otra vuelta
          </Boton>
          <Boton className="w-full" variante="fantasma" onClick={onMenu}>
            Menú principal
          </Boton>
        </div>
      </div>
    </div>
  );
}
