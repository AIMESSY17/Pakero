import { useState } from 'react';
import { Panel, Titulo, Boton, Chip, LineaEfecto } from './base.jsx';
import { MinijuegoOverlay } from './MinijuegoOverlay.jsx';
import { eventoActual, inspeccionarOpcion } from '../core/engine.js';
import { calcularMods } from '../core/mods.js';
import { minijuegoPorId } from '../minijuegos/catalogo.js';
import { GRADO_META, RIESGO_META, STAT_META, formatearGuitaCorta } from '../core/constants.js';
import { nombreRivalCompleto } from '../data/nombres.js';

const COLOR_TEXTO = { verde: 'text-verde', rojo: 'text-rojo', dorado: 'text-dorado', humo: 'text-humo' };

function Cabecera({ etiqueta, paso, color = 'humo' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`font-display text-xs uppercase tracking-[0.22em] ${COLOR_TEXTO[color]}`}
      >
        {etiqueta}
      </span>
      {paso && <span className="font-mono text-xs text-humo-tenue">{paso}</span>}
    </div>
  );
}

function CajaResultado({ grado, texto, lineas }) {
  const meta = GRADO_META[grado];
  return (
    <div className="anim-subir space-y-3">
      {meta && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
            meta.color === 'dorado'
              ? 'border-dorado/40 bg-dorado/10'
              : meta.color === 'verde'
                ? 'border-verde/35 bg-verde/10'
                : 'border-rojo/35 bg-rojo/10'
          }`}
        >
          <span aria-hidden className="text-lg">
            {meta.icono}
          </span>
          <span className={`font-display text-sm uppercase tracking-widest ${COLOR_TEXTO[meta.color]}`}>
            {meta.label}
          </span>
        </div>
      )}
      <p className="leading-relaxed text-tiza">{texto}</p>
      {lineas?.length > 0 && (
        <ul className="rounded-xl border border-borde bg-panel-alto px-3 py-1">
          {lineas.map((l, i) => (
            <LineaEfecto key={i} linea={l} />
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function VistaEvento({ estado, acciones }) {
  const [mini, setMini] = useState(null);
  const actual = eventoActual(estado);
  if (!actual) return null;

  const { def, runtime } = actual;
  const a = estado.anioActual;
  const paso = `Evento ${a.indice + 1} de ${a.eventos.length}`;
  const mods = calcularMods(estado);

  const etiqueta = def.esCrisis
    ? '⚠️ Crisis'
    : def.tipo === 'automatico'
      ? 'Pasó esto'
      : 'Hay que decidir';

  const elegir = (idx) => {
    const opcion = def.opciones[idx];
    if (opcion.minijuego) {
      setMini({ tipo: opcion.minijuego, idx });
    } else {
      acciones.elegirOpcion(idx, null);
    }
  };

  // Lo que pasó entre un año y el otro (crecimiento pasivo, staff) se aplica
  // en silencio: se muestra acá, al abrir el año, para que no sea invisible.
  const avisos = a.indice === 0 ? (estado.avisosDeAnio ?? []) : [];

  return (
    <>
      {avisos.length > 0 && (
        <Panel className="mb-4 space-y-3 border-borde-suave">
          <Cabecera etiqueta={`Pasó un año · ahora tenés ${estado.edad}`} color="dorado" />
          {avisos.map((av, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-tiza">{av.titulo}</p>
              <ul className="mt-1 rounded-xl border border-borde bg-panel-alto px-3 py-1">
                {av.lineas.map((l, j) => (
                  <LineaEfecto key={j} linea={l} />
                ))}
              </ul>
            </div>
          ))}
        </Panel>
      )}

      <Panel className="space-y-4">
        <Cabecera etiqueta={etiqueta} paso={paso} color={def.esCrisis ? 'rojo' : 'humo'} />

        <h2 className="font-display text-3xl leading-tight text-tiza">{def.titulo}</h2>
        <p className="leading-relaxed text-humo">{def.texto}</p>

        {def.categoria && (
          <Chip color={def.categoria === 'venta' ? 'verde' : 'dorado'}>
            {def.categoria === 'venta' ? '📦 Venta' : '🎯 Movida'}
          </Chip>
        )}

        {/* Automático: ya está resuelto, solo se muestra */}
        {def.tipo === 'automatico' && runtime.resuelto && (
          <>
            <ListaDeltas deltas={runtime.deltas} />
            <Boton className="w-full" onClick={acciones.continuar}>
              Continuar
            </Boton>
          </>
        )}

        {/* Decisión sin resolver: las opciones */}
        {def.tipo === 'decision' && !runtime.resuelto && (
          <div className="space-y-2.5">
            {def.opciones.map((op, i) => {
              const info = inspeccionarOpcion(estado, def, op);
              const riesgo = RIESGO_META[op.riesgo];
              const mj = op.minijuego ? minijuegoPorId(op.minijuego) : null;
              return (
                <button
                  key={i}
                  disabled={info.bloqueada}
                  onClick={() => elegir(i)}
                  className="group w-full rounded-xl border border-borde bg-panel-alto p-3.5 text-left
                             transition hover:border-verde/60 hover:bg-borde
                             disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-borde
                             disabled:hover:bg-panel-alto
                             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
                >
                  <span className="block font-semibold text-tiza">{op.texto}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Chip color={riesgo.color}>{riesgo.label}</Chip>
                    {op.esfuerzo_fisico && <Chip color="humo">💪 Físico</Chip>}
                    {mj && (
                      <Chip color="dorado">
                        {mj.icono} {mj.nombre}
                      </Chip>
                    )}
                    {info.probVisible != null && (
                      <Chip color="verde">📻 {info.probVisible}% real</Chip>
                    )}
                  </span>
                  {info.bloqueada && (
                    <span className="mt-2 block text-xs text-rojo">
                      🚫 No podés: tenés la salud muy baja para algo así.
                    </span>
                  )}
                </button>
              );
            })}
            {estado.stats.atencion >= 80 && (
              <p className="text-xs text-rojo">
                🚨 Ojo: con la Atención así, cualquier opción con riesgo tiene 50% de mandarte
                en cana.
              </p>
            )}
          </div>
        )}

        {/* Decisión resuelta: el resultado */}
        {def.tipo === 'decision' && runtime.resuelto && (
          <>
            <CajaResultado
              grado={runtime.grado}
              texto={runtime.texto}
              lineas={armarLineas(runtime.deltas, runtime.guita)}
            />
            {runtime.minijuego && (
              <p className="text-xs text-humo-tenue">
                Bonus del minijuego aplicado a la tirada:{' '}
                <span className={runtime.bonusMinijuego >= 0 ? 'text-verde' : 'text-rojo'}>
                  {runtime.bonusMinijuego >= 0 ? '+' : ''}
                  {Math.round(runtime.bonusMinijuego * 100)}%
                </span>
              </p>
            )}
            <Boton className="w-full" onClick={acciones.continuar}>
              Continuar
            </Boton>
          </>
        )}
      </Panel>

      {mini && (
        <MinijuegoOverlay
          tipo={mini.tipo}
          bonusCombate={mods.bonusCombate}
          contexto={def.titulo}
          onFin={(score) => {
            setMini(null);
            acciones.elegirOpcion(mini.idx, score);
          }}
        />
      )}
    </>
  );
}

function armarLineas(deltas, guita) {
  const lineas = [];
  for (const [stat, v] of Object.entries(deltas ?? {})) {
    const meta = STAT_META[stat];
    if (!meta || !v) continue;
    lineas.push({
      icono: meta.icono,
      label: meta.label,
      valor: v,
      bueno: meta.invertido ? v < 0 : v > 0,
    });
  }
  if (guita) lineas.push({ icono: '💵', label: 'Guita', valor: guita, bueno: guita > 0, esGuita: true });
  return lineas;
}

function ListaDeltas({ deltas, guita = 0 }) {
  const lineas = armarLineas(deltas, guita);
  if (lineas.length === 0) return null;
  return (
    <ul className="rounded-xl border border-borde bg-panel-alto px-3 py-1">
      {lineas.map((l, i) => (
        <LineaEfecto key={i} linea={l} />
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------

function VistaConquista({ estado, acciones }) {
  const [mini, setMini] = useState(false);
  const p = estado.pendienteConquista;
  const mods = calcularMods(estado);
  const mj = p.minijuego ? minijuegoPorId(p.minijuego) : null;

  if (p.resultado) {
    return (
      <Panel className="space-y-4">
        <Cabecera etiqueta="Conquista" color={p.resultado.gano ? 'dorado' : 'rojo'} />
        <h2 className="font-display text-3xl leading-tight text-tiza">
          {p.resultado.gano ? '¡Es tuyo!' : 'No pudiste'}
        </h2>
        <CajaResultado
          grado={p.resultado.gano ? 'critico_exito' : 'fracaso'}
          texto={p.resultado.texto}
        />
        {!p.resultado.gano && (
          <p className="text-sm text-humo">
            Podés volver a intentarlo el año que viene mientras sigas cumpliendo los requisitos.
          </p>
        )}
        <Boton className="w-full" variante={p.resultado.gano ? 'dorado' : 'primario'} onClick={acciones.cerrarConquista}>
          Continuar
        </Boton>
      </Panel>
    );
  }

  return (
    <>
      <Panel className="space-y-4 border-dorado/40">
        <Cabecera etiqueta="🏴 Hay territorio para tomar" color="dorado" />
        <h2 className="font-display text-3xl leading-tight text-dorado">{p.meta.label}</h2>
        <p className="leading-relaxed text-humo">{p.meta.descripcion}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl border border-borde bg-panel-alto p-3">
            <div className="text-[10px] uppercase tracking-widest text-humo">Chance base</div>
            <div className="num-grande mt-1 text-2xl text-dorado">{Math.round(p.prob * 100)}%</div>
          </div>
          <div className="rounded-xl border border-borde bg-panel-alto p-3">
            <div className="text-[10px] uppercase tracking-widest text-humo">Tu situación</div>
            <div className="mt-1 text-sm font-semibold text-tiza">
              {p.forastero ? 'Forastero' : 'En tu zona'}
            </div>
          </div>
        </div>

        {p.forastero && (
          <p className="text-xs text-rojo">
            Llegaste de afuera: acá nadie te debe nada y la conquista cuesta más.
          </p>
        )}

        {mj ? (
          <Boton className="w-full" variante="dorado" onClick={() => setMini(true)}>
            {mj.icono} Ir al frente — {mj.nombre}
          </Boton>
        ) : (
          <Boton className="w-full" variante="dorado" onClick={() => acciones.jugarConquista(null)}>
            👑 Jugártela por la corona
          </Boton>
        )}
        <Boton className="w-full" variante="fantasma" onClick={acciones.saltarConquista}>
          Dejarlo para más adelante
        </Boton>
      </Panel>

      {mini && (
        <MinijuegoOverlay
          tipo={p.minijuego}
          bonusCombate={mods.bonusCombate}
          contexto={`Conquista: ${p.meta.label}`}
          onFin={(score) => {
            setMini(false);
            acciones.jugarConquista(score);
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

function VistaResumen({ estado, acciones, onRetirarse }) {
  const r = estado.resumen;
  const colorNota = r.nota >= 7.5 ? 'text-verde' : r.nota >= 5 ? 'text-dorado' : 'text-rojo';
  const flechaIngreso = r.tendenciaIngreso > 0 ? '▲' : r.tendenciaIngreso < 0 ? '▼' : '▬';
  const colorIngreso =
    r.tendenciaIngreso > 0 ? 'text-verde' : r.tendenciaIngreso < 0 ? 'text-rojo' : 'text-humo';

  return (
    <Panel className="space-y-5">
      <Cabecera etiqueta={`Resumen · ${r.edad} años`} paso={`Año ${r.anio}`} color="dorado" />

      {/* Nota del año en box */}
      <div className="rounded-2xl border border-borde bg-panel-alto p-5 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-humo">Nota del año</div>
        <div className={`num-grande mt-1 text-7xl ${colorNota}`}>{r.nota.toFixed(1)}</div>
        <p className="mt-2 text-sm text-humo">{r.comentario}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {r.huboMovida && <Chip color="dorado">🎯 Movida +1</Chip>}
          {r.huboVenta && <Chip color="verde">📦 Venta +1</Chip>}
          {estado.stats.atencion >= 80 && <Chip color="rojo">🚨 Atención −1</Chip>}
        </div>
      </div>

      {/* Guita */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-borde bg-panel-alto p-3">
          <div className="text-[10px] uppercase tracking-widest text-humo">Ingreso del año</div>
          <div className={`num-grande mt-1 text-2xl ${colorIngreso}`}>
            {flechaIngreso} {formatearGuitaCorta(r.ingreso)}
          </div>
          {r.ingresoPrevio != null && (
            <div className="mt-0.5 text-[11px] text-humo-tenue">
              antes {formatearGuitaCorta(r.ingresoPrevio)}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-verde/25 bg-verde-hondo/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-verde/70">Guita total</div>
          <div className="num-grande mt-1 text-2xl text-verde">{formatearGuitaCorta(r.guita)}</div>
        </div>
      </div>

      {r.crisis && (
        <div className="rounded-xl border border-rojo/40 bg-rojo-hondo/40 p-3 text-sm text-rojo">
          ⚠️ Se te disparó una crisis: venías tres años sin levantar.
        </div>
      )}

      {/* Duelo con el rival */}
      <div className="rounded-xl border border-borde bg-panel-alto p-3">
        <Titulo>El duelo eterno</Titulo>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>
            <span className="font-bold text-verde">{r.ventas}</span>{' '}
            <span className="text-humo">tuyas</span>
            {r.ventasAnio > 0 && <span className="ml-1 text-xs text-verde">(+{r.ventasAnio})</span>}
          </span>
          <span className="font-mono text-xs text-humo-tenue">vs</span>
          <span>
            <span className="font-bold text-rojo">{r.rival.ventas}</span>{' '}
            <span className="text-humo">de {r.rival.nombre}</span>
            {r.rival.ventasAnio > 0 && (
              <span className="ml-1 text-xs text-rojo">(+{r.rival.ventasAnio})</span>
            )}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] text-humo-tenue">{nombreRivalCompleto(r.rival)}</p>
      </div>

      {/* Cómo quedaron los stats */}
      {r.lineasDeltas.length > 0 && (
        <div>
          <Titulo>Cómo cerraste el año</Titulo>
          <ul className="mt-2 rounded-xl border border-borde bg-panel-alto px-3 py-1">
            {r.lineasDeltas.map((l, i) => (
              <LineaEfecto key={i} linea={l} />
            ))}
          </ul>
        </div>
      )}

      {/* Lo que pasó */}
      <details className="rounded-xl border border-borde bg-panel-alto p-3">
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-humo">
          Lo que pasó este año ({r.log.length})
        </summary>
        <ul className="mt-3 space-y-3">
          {r.log.map((l, i) => (
            <li key={i} className="border-l-2 border-borde pl-3">
              <div className="flex items-center gap-2">
                {l.grado && <span aria-hidden>{GRADO_META[l.grado]?.icono}</span>}
                <span className="text-sm font-bold text-tiza">{l.titulo}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-humo">{l.texto}</p>
            </li>
          ))}
        </ul>
      </details>

      <div className="space-y-2">
        <Boton className="w-full" variante="dorado" onClick={acciones.siguienteAnio}>
          Siguiente año →
        </Boton>
        {estado.edad >= 18 && (
          <Boton className="w-full" variante="peligro" onClick={onRetirarse}>
            Colgar los botines (retirarse)
          </Boton>
        )}
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------------

export function PanelEvento({ estado, acciones, onRetirarse }) {
  if (estado.fase === 'conquista' && estado.pendienteConquista) {
    return <VistaConquista estado={estado} acciones={acciones} />;
  }
  if (estado.fase === 'resumen' && estado.resumen) {
    return <VistaResumen estado={estado} acciones={acciones} onRetirarse={onRetirarse} />;
  }
  return <VistaEvento estado={estado} acciones={acciones} />;
}
