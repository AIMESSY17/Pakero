import { useEffect, useState } from 'react';
import { PhaserGame } from '../minijuegos/PhaserGame.jsx';
import { minijuegoPorId } from '../minijuegos/catalogo.js';
import { Boton } from './base.jsx';
import { BONUS_MINIJUEGO_MIN, BONUS_MINIJUEGO_MAX } from '../core/constants.js';

/**
 * A los cuántos segundos aparece la salida de emergencia.
 *
 * El minijuego más largo (`fuga_rescate`) dura 26 s, así que con 35 no molesta
 * a nadie que esté jugando de verdad.
 */
const SEGUNDOS_PARA_ESCAPE = 35;

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
  const [hayEscape, setHayEscape] = useState(false);
  const def = minijuegoPorId(tipo);

  /*
    Salida de emergencia.

    Una escena de Phaser que revienta adentro de un callback deja al jugador
    encerrado en el overlay sin ningún botón: la partida sigue viva pero no hay
    cómo volver a ella. Pasó dos veces (`prensado` leyendo `this.relleno` antes
    de que existiera, y `perderla_de_vista` con un `duration` mal escrito que
    cortaba la cadena de tweens), y las dos veces el síntoma fue el mismo.

    No es explotable: devuelve `null`, que es exactamente lo mismo que da el
    botón "Saltear" de la pantalla anterior. No hay nada que se pueda conseguir
    por acá que no se pudiera conseguir gratis antes de entrar.
  */
  useEffect(() => {
    if (!jugando) return undefined;
    setHayEscape(false);
    const t = setTimeout(() => setHayEscape(true), SEGUNDOS_PARA_ESCAPE * 1000);
    return () => clearTimeout(t);
  }, [jugando, tipo]);

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
        {hayEscape && (
          <div className="anim-subir shrink-0 px-3 pb-2 text-center">
            <button
              onClick={() => onFin(null)}
              className="toque-chico rounded-lg px-3 py-1.5 text-[11px] text-humo-tenue
                         underline decoration-dotted underline-offset-4 transition
                         hover:text-humo focus-visible:outline-2 focus-visible:outline-verde"
            >
              ¿Se colgó? Salir sin bonus
            </button>
          </div>
        )}
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
