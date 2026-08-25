/** Primitivas visuales compartidas por todas las pantallas. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const VARIANTES = {
  primario: 'bg-verde text-noche hover:brightness-110 border-verde',
  peligro: 'bg-rojo/15 text-rojo hover:bg-rojo/25 border-rojo/40',
  dorado: 'bg-dorado text-noche hover:brightness-110 border-dorado',
  fantasma: 'bg-transparent text-humo hover:text-tiza hover:bg-panel-alto border-borde',
  panel: 'bg-panel-alto text-tiza hover:bg-borde border-borde',
};

export function Boton({ variante = 'primario', className = '', children, ...props }) {
  return (
    <button
      {...props}
      className={`toque rounded-xl border px-4 py-2.5 font-semibold tracking-wide transition sm:px-5 sm:py-3
        disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde
        ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Panel({ className = '', children, ...props }) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-borde bg-panel p-3.5 shadow-lg shadow-black/30 sm:p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function Titulo({ children, className = '' }) {
  return (
    <h2 className={`font-display text-xs uppercase tracking-[0.22em] text-humo ${className}`}>
      {children}
    </h2>
  );
}

const COLORES_CHIP = {
  verde: 'bg-verde/12 text-verde border-verde/30',
  rojo: 'bg-rojo/12 text-rojo border-rojo/30',
  dorado: 'bg-dorado/12 text-dorado border-dorado/30',
  humo: 'bg-humo/10 text-humo border-humo/25',
};

export function Chip({ color = 'humo', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${COLORES_CHIP[color]} ${className}`}
    >
      {children}
    </span>
  );
}

const COLORES_RAREZA = {
  Legendaria: 'border-dorado/60 bg-dorado/15 text-dorado anim-latido',
  Rara: 'border-verde/50 bg-verde/12 text-verde',
  Común: 'border-humo/35 bg-humo/10 text-humo',
};

export function BadgeRareza({ rareza }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 font-display text-xs uppercase tracking-[0.2em] ${COLORES_RAREZA[rareza] ?? COLORES_RAREZA['Común']}`}
    >
      {rareza}
    </span>
  );
}

/**
 * `true` mientras el viewport sea más angosto que `maxPx`.
 *
 * Lo usan los gráficos SVG, que no pueden resolverse solo con clases: un
 * viewBox de 640 de ancho encogido a 330 px deja las etiquetas en 5 px y no
 * se lee nada. En celular se dibuja un gráfico más chico y con texto más
 * grande en vez de escalar el de escritorio.
 */
export function usaPantallaAngosta(maxPx = 640) {
  const consulta = `(max-width: ${maxPx - 0.02}px)`;
  const [angosta, setAngosta] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(consulta).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const alCambiar = (e) => setAngosta(e.matches);
    setAngosta(mq.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, [consulta]);

  return angosta;
}

/**
 * Botoncito "?" que muestra una explicación corta: qué es, cómo se consigue,
 * para qué sirve. Se abre con click/tap (así funciona en celular) y también
 * con hover en desktop. Se cierra tocando afuera.
 *
 * El globo se posiciona con `fixed` y coordenadas calculadas: centrado sobre
 * el botón cuando entra, y pegado al borde de la pantalla cuando no. Con un
 * `translate(-50%)` a secas se salía de pantalla en cuanto el tip estaba cerca
 * de un costado, que en celular es casi siempre.
 */
export function InfoTip({ info, className = '' }) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState(null);
  const raiz = useRef(null);
  const globo = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrarSiEsAfuera = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAbierto(false);
    };
    const cerrar = () => setAbierto(false);
    document.addEventListener('pointerdown', cerrarSiEsAfuera);
    window.addEventListener('resize', cerrar);
    // Si el usuario scrollea, el globo quedaría flotando lejos de su botón.
    window.addEventListener('scroll', cerrar, true);
    return () => {
      document.removeEventListener('pointerdown', cerrarSiEsAfuera);
      window.removeEventListener('resize', cerrar);
      window.removeEventListener('scroll', cerrar, true);
    };
  }, [abierto]);

  useLayoutEffect(() => {
    if (!abierto || !raiz.current) return;
    const boton = raiz.current.getBoundingClientRect();
    const ancho = Math.min(260, window.innerWidth - 20);
    const alto = globo.current?.offsetHeight ?? 150;
    const margen = 10;

    let left = boton.left + boton.width / 2 - ancho / 2;
    left = Math.max(margen, Math.min(left, window.innerWidth - ancho - margen));

    // Si abajo no entra, se abre para arriba.
    const abajo = boton.bottom + 8;
    const arriba = boton.top - alto - 8;
    const top = abajo + alto > window.innerHeight - margen && arriba > margen ? arriba : abajo;

    setPos({ left, top, ancho });
  }, [abierto]);

  if (!info) return null;

  return (
    <span ref={raiz} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-label="Más información"
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-humo-tenue/60
                   text-[10px] font-bold leading-none text-humo-tenue transition
                   hover:border-verde hover:text-verde
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
      >
        i
      </button>
      {abierto && (
        <div
          ref={globo}
          onClick={(e) => e.stopPropagation()}
          style={
            pos
              ? { left: pos.left, top: pos.top, width: pos.ancho }
              : { left: 0, top: 0, width: 260, visibility: 'hidden' }
          }
          className="fixed z-50 rounded-xl border border-borde bg-panel-alto p-3 text-left shadow-xl shadow-black/40"
        >
          <p className="text-xs leading-relaxed text-tiza">{info.que}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-humo">
            <span className="font-semibold text-verde">Cómo se consigue: </span>
            {info.como}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-humo">
            <span className="font-semibold text-dorado">Para qué sirve: </span>
            {info.sirve}
          </p>
        </div>
      )}
    </span>
  );
}

/** Línea con ícono para los resultados de eventos y el resumen del año. */
export function LineaEfecto({ linea }) {
  const signo = linea.valor > 0 ? '+' : '';
  const valor = linea.esGuita
    ? (linea.valor > 0 ? '+' : '−') + '$' + Math.abs(linea.valor).toLocaleString('es-AR')
    : `${signo}${linea.valor}`;
  return (
    <li className="flex items-center justify-between gap-3 border-b border-borde-suave/60 py-2 last:border-0">
      <span className="flex min-w-0 items-center gap-2.5 text-sm text-tiza">
        <span aria-hidden className="text-base">
          {linea.icono}
        </span>
        <span className="truncate">{linea.label}</span>
      </span>
      <span
        className={`shrink-0 font-mono text-sm font-bold tabular-nums ${linea.bueno ? 'text-verde' : 'text-rojo'}`}
      >
        {valor}
      </span>
    </li>
  );
}
