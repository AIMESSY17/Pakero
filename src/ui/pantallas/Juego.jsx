import { useState } from 'react';
import { Ficha } from '../Ficha.jsx';
import { PanelEvento } from '../PanelEvento.jsx';
import { Mudanza } from '../Mudanza.jsx';
import { Boton, Panel } from '../base.jsx';
import { formatearGuitaCorta } from '../../core/constants.js';

function BotonBarra({ icono, children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`toque-chico flex items-center justify-center gap-1 rounded-lg border border-borde bg-panel
                  px-2 py-2 text-[11px] font-semibold whitespace-nowrap text-humo transition
                  hover:border-verde/50 hover:text-tiza disabled:opacity-40 sm:px-3 sm:text-xs
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde ${className}`}
    >
      <span aria-hidden>{icono}</span>
      <span>{children}</span>
    </button>
  );
}

function ConfirmarRetiro({ estado, onConfirmar, onCancelar }) {
  return (
    <div className="segura-toda fixed inset-0 z-40 overflow-y-auto bg-noche/92 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
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
      {/*
        Barra superior. En celular se parte en dos filas: identidad arriba y los
        cuatro accesos abajo, repartidos a lo ancho para que entren los dedos.
        A partir de `sm` vuelve a ser una sola fila.
      */}
      <header className="segura-arriba sticky top-0 z-20 border-b border-borde bg-noche/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4 sm:py-2.5">
          <span className="num-grande text-lg text-verde sm:text-xl">PAQUERO</span>
          <span className="ml-auto flex items-baseline gap-2 font-mono text-[11px] text-humo-tenue sm:ml-0 sm:mr-auto sm:text-xs">
            <span>
              Año {estado.anio} · {estado.edad} años
            </span>
            <span className="font-bold text-verde">{formatearGuitaCorta(estado.guita)}</span>
          </span>
          <div className="flex w-full gap-1.5 sm:w-auto sm:gap-2">
            <BotonBarra icono="🛒" className="flex-1 sm:flex-none" onClick={onMercado}>
              Mercado
            </BotonBarra>
            <BotonBarra
              icono="🚚"
              className="flex-1 sm:flex-none"
              onClick={() => setMudando(true)}
              disabled={!puedeMudarse}
            >
              Mudarse
            </BotonBarra>
            <BotonBarra icono="📊" className="flex-1 sm:flex-none" onClick={onEstadisticas}>
              Stats
            </BotonBarra>
            <BotonBarra icono="☰" className="flex-1 sm:flex-none" onClick={onMenu}>
              Menú
            </BotonBarra>
          </div>
        </div>
      </header>

      {/*
        En celular la decisión va PRIMERO: es lo que el jugador vino a hacer.
        La ficha, que es larga, queda abajo. En pantallas anchas vuelven a su
        lugar de siempre (ficha a la izquierda, evento a la derecha).
      */}
      <main className="segura-abajo mx-auto grid max-w-6xl gap-3 p-3 pb-8 sm:gap-4 sm:p-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Ficha estado={estado} className="order-2 lg:order-none" />
        <div className="order-1 min-w-0 lg:order-none lg:sticky lg:top-20 lg:self-start">
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
