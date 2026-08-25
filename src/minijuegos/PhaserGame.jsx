import { useEffect, useRef, useState } from 'react';
import { medidasPara } from './tema.js';

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
 *
 * --- Responsive ---
 * La resolución lógica del canvas NO es fija: se mide el hueco disponible y se
 * arma un canvas con esa misma relación de aspecto (ver `medidasPara`). En un
 * celular vertical el minijuego es alto y angosto y ocupa toda la pantalla, en
 * vez de quedar en una franja apaisada del tamaño de un sello. Con `Scale.FIT`
 * y el aspecto ya igualado, el canvas llena el contenedor sin deformarse y
 * sigue re-ajustándose solo si la ventana cambia de tamaño.
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

        // Se mide recién acá: el layout ya está resuelto y el contenedor tiene
        // su tamaño real, sea un celular vertical o una ventana de escritorio.
        const caja = contenedor.getBoundingClientRect();
        const { ancho, alto } = medidasPara(caja.width, caja.height);

        const juego = new Phaser.Game({
          type: Phaser.AUTO,
          parent: contenedor,
          width: ancho,
          height: alto,
          backgroundColor: '#0a0c0b',
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            // El aspecto ya coincide con el del hueco, asi que FIT lo llena
            // entero. Estos limites solo evitan casos raros de ventanas
            // diminutas mientras se rota el telefono.
            min: { width: 240, height: 240 },
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

  // Rotar el telefono o cambiar el tamaño de la ventana: Phaser reajusta el
  // canvas al nuevo hueco. La resolución lógica no cambia (eso reiniciaría la
  // partida en curso), solo el tamaño con el que se muestra.
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor || typeof ResizeObserver === 'undefined') return undefined;
    const obs = new ResizeObserver(() => juegoRef.current?.scale?.refresh());
    obs.observe(contenedor);
    return () => obs.disconnect();
  }, []);

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-rojo/40 bg-rojo-hondo/40 p-6 text-center">
        <p className="text-rojo">Se rompió el minijuego.</p>
        <p className="text-xs text-humo">{error}</p>
        <button
          onClick={() => callbackRef.current?.(0.5)}
          className="toque rounded-lg border border-borde bg-panel-alto px-4 py-2 text-sm text-tiza"
        >
          Seguir sin bonus
        </button>
      </div>
    );
  }

  return (
    <div
      ref={contenedorRef}
      className="h-full w-full overflow-hidden rounded-xl border border-borde bg-noche
                 [&>canvas]:block [&>canvas]:touch-none"
      style={{ touchAction: 'none' }}
    />
  );
}
