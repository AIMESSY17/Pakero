import { useState } from 'react';
import { Ficha } from '../Ficha.jsx';
import { PanelEvento } from '../PanelEvento.jsx';
import { Mudanza } from '../Mudanza.jsx';
import { Boton, Panel } from '../base.jsx';
import { formatearGuitaCorta } from '../../core/constants.js';

function BotonBarra({ children, ...props }) {
  return (
    <button
      {...props}
      className="rounded-lg border border-borde bg-panel px-3 py-2 text-xs font-semibold text-humo
                 transition hover:border-verde/50 hover:text-tiza disabled:opacity-40
                 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
    >
      {children}
    </button>
  );
}

function ConfirmarRetiro({ estado, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-noche/92 p-4 backdrop-blur-sm">
      <Panel className="anim-subir w-full max-w-sm space-y-4 text-center">
        <div aria-hidden className="text-4xl">
          🥾
        </div>
        <h2 className="font-display text-2xl text-tiza">¿Colgar los botines?</h2>
        <p className="text-sm leading-relaxed text-humo">
          Te bajás a los {estado.edad}, con {estado.territorios.length} de 4 territorios y{' '}
          {formatearGuitaCorta(estado.guita)} en el bolsillo. No hay vuelta atrás: esto cierra
          la partida.
        </p>
        <div className="space-y-2">
          <Boton variante="peligro" className="w-full" onClick={onConfirmar}>
            Sí, me bajo
          </Boton>
          <Boton variante="fantasma" className="w-full" onClick={onCancelar}>
            No, sigo
          </Boton>
        </div>
      </Panel>
    </div>
  );
}

export function Juego({ estado, acciones, onMenu, onMercado, onEstadisticas }) {
  const [mudando, setMudando] = useState(false);
  const [confirmandoRetiro, setConfirmandoRetiro] = useState(false);

  // Solo se puede mudar o ir al mercado entre eventos, no en medio de una decisión.
  const puedeMudarse = estado.edad >= 18 && estado.fase !== 'conquista';

  return (
    <div className="textura-asfalto min-h-dvh">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-borde bg-noche/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2.5">
          <span className="num-grande mr-2 text-xl text-verde">PAQUERO</span>
          <span className="mr-auto font-mono text-xs text-humo-tenue">
            Año {estado.anio} · {estado.edad} años
          </span>
          <BotonBarra onClick={onMercado}>🛒 Mercado</BotonBarra>
          <BotonBarra onClick={() => setMudando(true)} disabled={!puedeMudarse}>
            🚚 Mudarse
          </BotonBarra>
          <BotonBarra onClick={onEstadisticas}>📊 Stats</BotonBarra>
          <BotonBarra onClick={onMenu}>☰ Menú</BotonBarra>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Ficha estado={estado} />
        <div className="lg:sticky lg:top-20 lg:self-start">
          <PanelEvento
            estado={estado}
            acciones={acciones}
            onRetirarse={() => setConfirmandoRetiro(true)}
          />
        </div>
      </main>

      {mudando && (
        <Mudanza estado={estado} acciones={acciones} onCerrar={() => setMudando(false)} />
      )}
      {confirmandoRetiro && (
        <ConfirmarRetiro
          estado={estado}
          onConfirmar={() => {
            setConfirmandoRetiro(false);
            acciones.retirarse();
          }}
          onCancelar={() => setConfirmandoRetiro(false)}
        />
      )}
    </div>
  );
}
