import { useState } from 'react';
import { PhaserGame } from '../minijuegos/PhaserGame.jsx';
import { minijuegoPorId } from '../minijuegos/catalogo.js';
import { Boton } from './base.jsx';
import { BONUS_MINIJUEGO_MIN, BONUS_MINIJUEGO_MAX } from '../core/constants.js';

/**
 * Modal que envuelve al minijuego: primero explica qué se juega, después monta
 * Phaser, y cuando termina devuelve el score.
 *
 * `onFin(score)` recibe un número 0..1, o `null` si el jugador salteó.
 *
 * Mientras se juega, el overlay ocupa TODA la pantalla: en un celular el
 * minijuego necesita cada pixel disponible, no una tarjeta con márgenes.
 */
export function MinijuegoOverlay({ tipo, bonusCombate = 0, contexto, onFin }) {
  const [jugando, setJugando] = useState(false);
  const def = minijuegoPorId(tipo);

  if (!def) {
    // Un id de minijuego mal escrito en el contenido no debe cortar la partida.
    onFin(null);
    return null;
  }

  const min = Math.round(BONUS_MINIJUEGO_MIN * 100);
  const max = Math.round(BONUS_MINIJUEGO_MAX * 100);

  if (jugando) {
    return (
      <div className="segura-toda fixed inset-0 z-50 flex flex-col bg-noche">
        <div className="flex min-h-0 flex-1 items-center justify-center p-1.5 sm:p-4">
          <div className="h-full w-full max-w-5xl">
            <PhaserGame
              tipo={tipo}
              bonusCombate={bonusCombate}
              onResultado={(score) => onFin(score)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="segura-toda fixed inset-0 z-50 overflow-y-auto bg-noche/95 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="anim-subir w-full max-w-md">
          <div className="rounded-2xl border border-borde bg-panel p-5 text-center shadow-2xl sm:p-7">
            <div aria-hidden className="text-4xl sm:text-5xl">
              {def.icono}
            </div>
            <h2 className="mt-3 font-display text-2xl leading-tight text-tiza sm:text-3xl">
              {def.config.titulo}
            </h2>
            {contexto && <p className="mt-1 text-sm italic text-dorado">{contexto}</p>}
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-humo">
              {def.config.instrucciones}
            </p>

            <div className="mx-auto mt-5 max-w-md rounded-xl border border-borde bg-panel-alto p-3 text-xs leading-relaxed text-humo">
              Cómo te va acá se traduce en un bonus de entre{' '}
              <span className="font-mono font-bold text-rojo">{min}%</span> y{' '}
              <span className="font-mono font-bold text-verde">+{max}%</span> que se{' '}
              <strong className="text-tiza">suma</strong> a la tirada. No la reemplaza: el azar
              sigue jugando.
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-center sm:gap-3">
              <Boton className="toque w-full sm:w-auto" onClick={() => setJugando(true)}>
                Jugarlo
              </Boton>
              <Boton
                variante="fantasma"
                className="toque w-full sm:w-auto"
                onClick={() => onFin(null)}
              >
                Saltear (sin bonus)
              </Boton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
