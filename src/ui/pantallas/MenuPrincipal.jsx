import { Boton } from '../base.jsx';
import { formatearGuitaCorta } from '../../core/constants.js';

export function MenuPrincipal({ guardado, onNueva, onContinuar, onEstadisticas, onBorrar }) {
  return (
    <div className="pantalla-segura textura-asfalto flex min-h-dvh flex-col items-center justify-center">
      <div className="anim-subir w-full max-w-md text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-humo sm:text-xs sm:tracking-[0.4em]">
          Una vida entera
        </p>
        <h1 className="num-grande mt-2 text-6xl text-verde min-[400px]:text-7xl sm:text-8xl">
          PAQUERO
        </h1>
        <p className="mt-3 text-sm text-humo">
          De los 12 a los 45. Cinco stats, un rival y una sola esquina para hacerse un nombre.
        </p>

        <div className="mt-8 space-y-3 sm:mt-10">
          {guardado && (
            <>
              <Boton className="w-full" variante="dorado" onClick={onContinuar}>
                Continuar partida
              </Boton>
              <div className="rounded-xl border border-borde bg-panel px-4 py-3 text-left text-xs text-humo">
                <div className="truncate font-bold text-tiza">
                  {guardado.nombre} "{guardado.apodo}"
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{guardado.edad} años</span>
                  <span>{formatearGuitaCorta(guardado.guita)}</span>
                  <span>{guardado.territorios}/4 territorios</span>
                  <span>📍 {guardado.ubicacion}</span>
                </div>
                {guardado.terminada && (
                  <div className="mt-1.5 text-dorado">Partida terminada — mirá el final</div>
                )}
              </div>
            </>
          )}

          <Boton className="w-full" variante={guardado ? 'panel' : 'primario'} onClick={onNueva}>
            {guardado ? 'Empezar de cero' : 'Nueva partida'}
          </Boton>

          <Boton className="w-full" variante="fantasma" onClick={onEstadisticas} disabled={!guardado}>
            📊 Estadísticas
          </Boton>

          {guardado && (
            <button
              onClick={onBorrar}
              className="toque-chico w-full pt-2 text-xs text-humo-tenue underline underline-offset-4 hover:text-rojo"
            >
              Borrar la partida guardada
            </button>
          )}
        </div>

        <p className="mt-10 text-[11px] leading-relaxed text-humo-tenue sm:mt-12">
          Todos los personajes, marcas y lugares son parodias inventadas.
          <br />
          Cualquier parecido con la realidad es problema tuyo.
        </p>
      </div>
    </div>
  );
}
