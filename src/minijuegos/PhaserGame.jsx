import { useEffect, useRef, useState } from 'react';
import { ANCHO, ALTO } from './tema.js';

/**
 * Wrapper de React para Phaser.
 *
 *  - Monta una instancia nueva de Phaser.Game al entrar y la destruye entera
 *    al salir (o al cambiar de minijuego). No queda ni un canvas colgado.
 *  - Phaser y las escenas se cargan con import() dinámico: no entran al bundle
 *    inicial, aparecen recién cuando hace falta un minijuego.
 *  - El resultado vuelve a React por callback (`onResultado(score 0..1)`).
 *
 * `onResultado` se guarda en un ref para que la escena siempre llame a la
 * versión actual sin tener que remontar el juego cuando React re-renderiza.
 */
export function PhaserGame({ tipo, bonusCombate = 0, onResultado }) {
  const contenedorRef = useRef(null);
  const juegoRef = useRef(null);
  const callbackRef = useRef(onResultado);
  const [error, setError] = useState(null);

  callbackRef.current = onResultado;

  useEffect(() => {
    let cancelado = false;
    const contenedor = contenedorRef.current;
    if (!contenedor) return undefined;

    (async () => {
      try {
        const [{ default: Phaser }, { escenaPara }] = await Promise.all([
          import('phaser'),
          import('./registro.js'),
        ]);
        if (cancelado) return;

        const def = escenaPara(tipo);
        if (!def) throw new Error(`Minijuego desconocido: ${tipo}`);

        const juego = new Phaser.Game({
          type: Phaser.AUTO,
          parent: contenedor,
          width: ANCHO,
          height: ALTO,
          backgroundColor: '#0a0c0b',
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          input: {
            activePointer: 1,
            touch: { capture: true },
          },
          // Sin fisicas: los minijuegos resuelven colisiones a mano.
          banner: false,
          audio: { noAudio: true },
        });

        juegoRef.current = juego;

        juego.scene.add(
          'minijuego',
          def.escena,
          true, // autoStart
          {
            config: def.config,
            bonusCombate,
            onResultado: (score) => callbackRef.current?.(score),
          }
        );
      } catch (e) {
        if (!cancelado) {
          console.error('[paquero] no se pudo iniciar el minijuego', e);
          setError(e.message ?? 'No se pudo cargar el minijuego');
        }
      }
    })();

    return () => {
      cancelado = true;
      // true = destruye tambien el canvas del DOM.
      juegoRef.current?.destroy(true);
      juegoRef.current = null;
    };
  }, [tipo, bonusCombate]);

  if (error) {
    return (
      <div className="flex aspect-[8/5] w-full flex-col items-center justify-center gap-3 rounded-xl border border-rojo/40 bg-rojo-hondo/40 p-6 text-center">
        <p className="text-rojo">Se rompió el minijuego.</p>
        <p className="text-xs text-humo">{error}</p>
        <button
          onClick={() => callbackRef.current?.(0.5)}
          className="rounded-lg border border-borde bg-panel-alto px-4 py-2 text-sm text-tiza"
        >
          Seguir sin bonus
        </button>
      </div>
    );
  }

  return (
    <div
      ref={contenedorRef}
      className="aspect-[8/5] w-full overflow-hidden rounded-xl border border-borde bg-noche
                 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
      style={{ touchAction: 'none' }}
    />
  );
}
