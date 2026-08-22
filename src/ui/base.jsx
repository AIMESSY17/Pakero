/** Primitivas visuales compartidas por todas las pantallas. */
import { useEffect, useRef, useState } from 'react';

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
      className={`rounded-xl border px-5 py-3 font-semibold tracking-wide transition
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
      className={`rounded-2xl border border-borde bg-panel p-4 shadow-lg shadow-black/30 ${className}`}
    >
      {children}
    </div>
  );
}

export function Titulo({ children, className = '' }) {
  return (
    <h2
      className={`font-display text-xs uppercase tracking-[0.22em] text-humo ${className}`}
    >
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
 * Botoncito "?" que muestra una explicación corta: qué es, cómo se consigue,
 * para qué sirve. Se abre con click/tap (así funciona en celular) y también
 * con hover en desktop. Se cierra tocando afuera.
 */
export function InfoTip({ info, className = '' }) {
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrarSiEsAfuera = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('pointerdown', cerrarSiEsAfuera);
    return () => document.removeEventListener('pointerdown', cerrarSiEsAfuera);
  }, [abierto]);

  if (!info) return null;

  return (
    <span ref={raiz} className={`group/tip relative inline-flex ${className}`}>
      <button
        type="button"
        aria-expanded={abierto}
        aria-label="Más información"
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-humo-tenue/60
                   text-[10px] font-bold leading-none text-humo-tenue transition
                   hover:border-verde hover:text-verde
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
      >
        i
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 rounded-xl border border-borde
                    bg-panel-alto p-3 text-left shadow-xl shadow-black/40 transition
                    ${abierto ? 'visible opacity-100' : 'invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100'}`}
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
      <span className="flex items-center gap-2.5 text-sm text-tiza">
        <span aria-hidden className="text-base">
          {linea.icono}
        </span>
        {linea.label}
      </span>
      <span
        className={`font-mono text-sm font-bold tabular-nums ${linea.bueno ? 'text-verde' : 'text-rojo'}`}
      >
        {valor}
      </span>
    </li>
  );
}
