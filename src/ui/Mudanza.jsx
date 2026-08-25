import { useState } from 'react';
import { Boton, Panel, Titulo, Chip } from './base.jsx';
import { destinosDisponibles } from '../core/territorio.js';
import { COSTO_MUDANZA } from '../data/lugares.js';
import { STAT_META } from '../core/constants.js';

const GRUPOS = [
  { tipo: 'villa', label: 'Villas', icono: '🏚️' },
  { tipo: 'provincia', label: 'Provincias', icono: '🇦🇷' },
  { tipo: 'pais', label: 'Afuera', icono: '✈️' },
];

/**
 * Desde los 18 te podés mudar a cualquier lado en cualquier momento.
 * Cuesta Calle (allá nadie te conoce) y uno o dos stats más, y desde ese
 * momento conquistás como forastero: la chance baja de 70% a 50%.
 */
export function Mudanza({ estado, acciones, onCerrar }) {
  const [grupo, setGrupo] = useState('villa');
  const [resultado, setResultado] = useState(null);

  const destinos = destinosDisponibles(estado).filter((d) => d.tipo === grupo);
  const visitadas = new Set(estado.zonasVisitadas.map((z) => z.nombre));

  if (resultado) {
    return (
      <Modal>
        <Panel className="anim-subir space-y-5 text-center">
          <div aria-hidden className="text-5xl">
            🚚
          </div>
          <h2 className="font-display text-2xl text-tiza sm:text-3xl">Te mudaste</h2>
          <p className="text-lg font-bold text-dorado">{resultado.destino.nombre}</p>

          <div className="rounded-xl border border-borde bg-panel-alto p-4 text-left">
            <Titulo>El motivo</Titulo>
            <p className="mt-2 italic leading-relaxed text-humo">"{resultado.motivo}"</p>
          </div>

          <ul className="rounded-xl border border-rojo/30 bg-rojo-hondo/25 px-3 py-1 text-left">
            {Object.entries(resultado.deltas).map(([stat, v]) => (
              <li
                key={stat}
                className="flex items-center justify-between border-b border-borde-suave/50 py-2 text-sm last:border-0"
              >
                <span className="flex items-center gap-2 text-tiza">
                  <span aria-hidden>{STAT_META[stat]?.icono}</span>
                  {STAT_META[stat]?.label}
                </span>
                <span className="font-mono font-bold text-rojo">{v}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-humo-tenue">
            Desde acá conquistás como forastero: 50% en vez de 70%.
          </p>

          <Boton className="w-full" onClick={onCerrar}>
            Instalarse
          </Boton>
        </Panel>
      </Modal>
    );
  }

  return (
    <Modal>
      <Panel className="anim-subir flex max-h-[calc(100dvh-4rem)] flex-col gap-4">
        <div>
          <Titulo>Estás en {estado.ubicacion.nombre}</Titulo>
          <h2 className="mt-1 font-display text-2xl text-tiza">Mudarse</h2>
        </div>

        <div className="rounded-xl border border-rojo/30 bg-rojo-hondo/20 p-3 text-xs leading-relaxed text-humo">
          Irte cuesta: <span className="font-bold text-rojo">{COSTO_MUDANZA.calle} de Calle</span>{' '}
          más uno o dos stats al azar. Allá arrancás de cero y conquistás como forastero (50%
          en vez de 70%).
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          {GRUPOS.map((g) => (
            <button
              key={g.tipo}
              onClick={() => setGrupo(g.tipo)}
              className={`toque min-w-0 flex-1 rounded-xl border px-2 py-2 text-xs font-semibold transition sm:text-sm ${
                grupo === g.tipo
                  ? 'border-verde bg-verde/12 text-verde'
                  : 'border-borde bg-panel-alto text-humo hover:text-tiza'
              }`}
            >
              <span aria-hidden className="mr-1">
                {g.icono}
              </span>
              {g.label}
            </button>
          ))}
        </div>

        <div className="scroll-fino min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {destinos.map((d) => (
            <button
              key={d.nombre}
              onClick={() => setResultado(acciones.mudarse(d))}
              className="toque flex w-full items-center justify-between gap-2 rounded-xl border border-borde
                         bg-panel-alto px-3 py-2.5 text-left transition hover:border-verde/60 hover:bg-borde"
            >
              <span className="min-w-0 flex-1 text-sm text-tiza">{d.nombre}</span>
              {visitadas.has(d.nombre) && <Chip color="humo">Ya estuviste</Chip>}
            </button>
          ))}
        </div>

        <Boton variante="fantasma" className="w-full" onClick={onCerrar}>
          Quedarme donde estoy
        </Boton>
      </Panel>
    </Modal>
  );
}

function Modal({ children }) {
  return (
    <div className="segura-toda fixed inset-0 z-40 overflow-y-auto bg-noche/92 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
