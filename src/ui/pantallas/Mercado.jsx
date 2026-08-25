import { useState } from 'react';
import { Boton, Chip } from '../base.jsx';
import { ITEMS_MERCADO, FAMILIAS_MERCADO } from '../../data/mercado.js';
import { yaComprado } from '../../core/mercado.js';
import { formatearGuita, formatearGuitaCorta } from '../../core/constants.js';

function TarjetaItem({ item, estado, onComprar }) {
  const tenido = yaComprado(estado, item);
  const alcanza = estado.guita >= item.precio;
  const deshabilitado = tenido || !alcanza;

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        tenido
          ? 'border-verde/40 bg-verde-hondo/25'
          : alcanza
            ? 'border-borde bg-panel-alto hover:border-verde/50'
            : 'border-borde-suave bg-panel-alto opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-3xl leading-none">
          {item.icono}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-tiza">{item.nombre}</h3>
          <p className="mt-1 text-xs leading-relaxed text-humo">{item.desc}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className={`font-mono text-sm font-bold ${alcanza ? 'text-verde' : 'text-rojo'}`}>
          {formatearGuita(item.precio)}
        </span>
        {tenido ? (
          <Chip color="verde">✓ Lo tenés</Chip>
        ) : (
          <button
            disabled={deshabilitado}
            onClick={() => onComprar(item.id)}
            className="toque-chico rounded-lg border border-verde bg-verde px-4 py-2 text-sm font-bold text-noche
                       transition hover:brightness-110 disabled:cursor-not-allowed
                       disabled:border-borde disabled:bg-transparent disabled:text-humo-tenue"
          >
            {alcanza ? 'Comprar' : 'No te alcanza'}
          </button>
        )}
      </div>

      {item.familia === 'consumible' && !tenido && (
        <p className="mt-2 text-[11px] text-humo-tenue">
          Se aplica al toque y se puede volver a comprar.
        </p>
      )}
    </div>
  );
}

export function Mercado({ estado, acciones, onVolver }) {
  const [familia, setFamilia] = useState('staff');
  const [aviso, setAviso] = useState(null);

  const comprar = (id) => {
    const res = acciones.comprar(id);
    setAviso(res);
    setTimeout(() => setAviso(null), 2600);
  };

  const items = ITEMS_MERCADO.filter((i) => i.familia === familia);
  const meta = FAMILIAS_MERCADO.find((f) => f.id === familia);

  return (
    <div className="pantalla-segura textura-asfalto min-h-dvh">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl text-tiza sm:text-3xl">El Mercado</h1>
            <p className="text-sm text-humo">Todo se compra. La cuestión es con qué.</p>
          </div>
          <div className="min-w-0 rounded-xl border border-verde/25 bg-verde-hondo/50 px-3 py-2 text-right sm:px-4">
            <div className="text-[10px] uppercase tracking-widest text-verde/70">Tu guita</div>
            <div className="num-grande num-ajustable text-2xl text-verde">
              {formatearGuitaCorta(estado.guita)}
            </div>
          </div>
        </header>

        <div className="flex gap-1.5 sm:gap-2">
          {FAMILIAS_MERCADO.map((f) => (
            <button
              key={f.id}
              onClick={() => setFamilia(f.id)}
              className={`toque min-w-0 flex-1 rounded-xl border px-2 py-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                familia === f.id
                  ? 'border-verde bg-verde/12 text-verde'
                  : 'border-borde bg-panel text-humo hover:text-tiza'
              }`}
            >
              <span aria-hidden className="mr-1">
                {f.icono}
              </span>
              <span className="align-middle">{f.label}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-humo-tenue">{meta.desc}</p>

        {aviso && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              aviso.ok
                ? 'border-verde/40 bg-verde/10 text-verde'
                : 'border-rojo/40 bg-rojo/10 text-rojo'
            }`}
          >
            {aviso.mensaje}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <TarjetaItem key={item.id} item={item} estado={estado} onComprar={comprar} />
          ))}
        </div>

        <Boton variante="fantasma" className="w-full" onClick={onVolver}>
          ← Volver a la calle
        </Boton>
      </div>
    </div>
  );
}
