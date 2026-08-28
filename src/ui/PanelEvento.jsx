import { useState } from 'react';
import { Panel, Titulo, Boton, Chip, LineaEfecto } from './base.jsx';
import { MinijuegoOverlay } from './MinijuegoOverlay.jsx';
import { eventoActual, inspeccionarOpcion, lineasDeDeltas } from '../core/engine.js';
import { calcularMods } from '../core/mods.js';
import { ctxTexto, resolverTexto } from '../core/texto.js';
import { minijuegoPorId } from '../minijuegos/catalogo.js';
import { GRADO_META, RIESGO_META, formatearGuitaCorta } from '../core/constants.js';
import { nombreRivalCompleto } from '../data/nombres.js';

const COLOR_TEXTO = { verde: 'text-verde', rojo: 'text-rojo', dorado: 'text-dorado', humo: 'text-humo' };

function Cabecera({ etiqueta, paso, color = 'humo' }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <span className={`font-display text-xs uppercase tracking-[0.22em] ${COLOR_TEXTO[color]}`}>
        {etiqueta}
      </span>
      {paso && <span className="font-mono text-xs whitespace-nowrap text-humo-tenue">{paso}</span>}
    </div>
  );
}

function ListaLineas({ lineas }) {
  if (!lineas?.length) return null;
  return (
    <ul className="rounded-xl border border-borde bg-panel-alto px-3 py-1">
      {lineas.map((l, i) => (
        <LineaEfecto key={i} linea={l} />
      ))}
    </ul>
  );
}

/** La lealtad del socio no tiene barra: cuando se mueve, se dice con una frase. */
function NotaSocio({ nota }) {
  if (!nota) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl border border-borde-suave bg-panel-alto px-3 py-2 text-sm text-humo">
      <span aria-hidden>🤝</span>
      <span className="italic">{nota}</span>
    </p>
  );
}

function CajaResultado({ grado, texto, lineas, notaSocio }) {
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
      <ListaLineas lineas={lineas} />
      <NotaSocio nota={notaSocio} />
    </div>
  );
}

/**
 * Los ecos: algo que hiciste hace 3-5 años y volvió este año. No es un evento
 * (no se juega, no tiene opciones): es el mundo acordándose de vos.
 */
function BloqueEcos({ ecos }) {
  if (!ecos?.length) return null;
  return (
    <Panel className="mb-4 space-y-3 border-dorado/30 bg-dorado-hondo/10">
      <Cabecera etiqueta="Vuelve" color="dorado" />
      {ecos.map((eco, i) => (
        <div key={i} className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-bold text-dorado">
            <span aria-hidden>{eco.icono}</span>
            {eco.titulo}
            <span className="font-mono text-[10px] font-normal text-humo-tenue">
              hace {eco.anios} años
            </span>
          </p>
          <p className="text-sm leading-relaxed text-humo">{eco.texto}</p>
          <ListaLineas lineas={eco.lineas} />
          <NotaSocio nota={eco.notaSocio} />
        </div>
      ))}
    </Panel>
  );
}

// ---------------------------------------------------------------------------

/**
 * La cabecera que anuncia de qué va el evento. Un mapa y no una cadena de
 * ternarios: son ocho tipos de especial y sumar el noveno tiene que ser
 * agregar una línea, no anidar un nivel más.
 */
const ETIQUETA_ESPECIAL = {
  bifurcacion: '🔀 El cruce de los 18',
  segunda_chance: '🎓 Segunda chance',
  hijo: '🧒 Se agranda la familia',
  socio_presentacion: '🤝 Tu socio',
  socio_prueba: '🤝 Tu socio',
  socio_cierre: '🤝 Tu socio',
  duenio: '👑 El dueño anterior',
  mantenimiento: '🏚️ Se te afloja',
  acercamiento: '🎯 Falta poco',
  tension_terr: '⚔️ Roce entre tus zonas',
  bisagra: '⏳ Año bisagra',
  bisagra_terr: '⏳ Año bisagra',
};

function etiquetaDe(def) {
  if (def.esCrisis) return '⚠️ Crisis';
  if (def.especial && ETIQUETA_ESPECIAL[def.especial]) return ETIQUETA_ESPECIAL[def.especial];
  return def.tipo === 'automatico' ? 'Pasó esto' : 'Hay que decidir';
}

function VistaEvento({ estado, acciones }) {
  const [mini, setMini] = useState(null);
  const actual = eventoActual(estado);
  if (!actual) return null;

  const { def, runtime } = actual;
  const a = estado.anioActual;
  const paso = `Evento ${a.indice + 1} de ${a.eventos.length}`;
  const mods = calcularMods(estado);
  // Los eventos especiales nombran gente que se genera en la partida, así que
  // título y texto pueden venir como función. Ver core/texto.js.
  const ctx = ctxTexto(estado);
  const titulo = resolverTexto(def.titulo, ctx);

  const etiqueta = etiquetaDe(def);

  const colorEtiqueta = def.esCrisis ? 'rojo' : def.especial ? 'dorado' : 'humo';

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
  const primerEvento = a.indice === 0;
  const avisos = primerEvento ? (estado.avisosDeAnio ?? []) : [];

  return (
    <>
      {avisos.length > 0 && (
        <Panel className="mb-4 space-y-3 border-borde-suave">
          <Cabecera etiqueta={`Pasó un año · ahora tenés ${estado.edad}`} color="dorado" />
          {avisos.map((av, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-tiza">{av.titulo}</p>
              <div className="mt-1">
                <ListaLineas lineas={av.lineas} />
              </div>
            </div>
          ))}
        </Panel>
      )}

      {primerEvento && <BloqueEcos ecos={a.ecos} />}

      <Panel className={`space-y-4 ${def.especial ? 'border-dorado/35' : ''}`}>
        <Cabecera etiqueta={etiqueta} paso={paso} color={colorEtiqueta} />

        <h2 className="font-display text-2xl leading-tight text-tiza sm:text-3xl">{titulo}</h2>
        <p className="leading-relaxed text-humo">{resolverTexto(def.texto, ctx)}</p>

        {def.categoria && (
          <Chip color={def.categoria === 'venta' ? 'verde' : 'dorado'}>
            {def.categoria === 'venta' ? '📦 Venta' : '🎯 Movida'}
          </Chip>
        )}

        {/* Automático: ya está resuelto, solo se muestra */}
        {def.tipo === 'automatico' && runtime.resuelto && (
          <>
            <ListaLineas lineas={lineasDeDeltas(runtime.deltas)} />
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
                  className="group toque w-full rounded-xl border border-borde bg-panel-alto p-3.5 text-left
                             transition hover:border-verde/60 hover:bg-borde
                             disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-borde
                             disabled:hover:bg-panel-alto
                             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde"
                >
                  <span className="block font-semibold leading-snug text-tiza">
                    {resolverTexto(op.texto, ctx)}
                  </span>
                  <span className="mt-2 flex flex-wrap items-center gap-1.5">
                    {/* El riesgo "nulo" no se anuncia: si el jugador supiera
                        de antemano que una opción no tiene nada en juego,
                        dejaría de sentir que todas las decisiones pesan. Las
                        demás franjas de riesgo sí se muestran igual. */}
                    {op.riesgo !== 'nulo' && <Chip color={riesgo.color}>{riesgo.label}</Chip>}
                    {op.esfuerzo_fisico && <Chip color="humo">💪 Físico</Chip>}
                    {mj && (
                      <Chip color="dorado">
                        {mj.icono} {mj.nombre}
                      </Chip>
                    )}
                    {/* El contador de estudio fue oculto toda la partida; el
                        día que se cobra tiene que verse que se cobró. */}
                    {info.bonusEstudio > 0 && (
                      <Chip color="verde">🎓 Cabeza +{info.bonusEstudio}%</Chip>
                    )}
                    {/* Lo que decidiste con el dueño anterior de este lugar,
                        volviendo a cobrarse años después. */}
                    {info.bonusDuenio !== 0 && (
                      <Chip color={info.bonusDuenio > 0 ? 'verde' : 'rojo'}>
                        {info.duenioDestino === 'aliado' ? '🤝' : '👞'}{' '}
                        {info.bonusDuenio > 0 ? '+' : ''}
                        {info.bonusDuenio}%
                      </Chip>
                    )}
                    {info.estudioViable === false && (
                      <Chip color="rojo">📉 No hiciste la cabeza</Chip>
                    )}
                    {info.probVisible != null && (
                      <Chip color="verde">📻 {info.probVisible}% real</Chip>
                    )}
                  </span>
                  {info.bloqueada && (
                    <span className="mt-2 block text-xs text-rojo">🚫 {info.motivoBloqueo}</span>
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
              lineas={lineasDeDeltas(runtime.deltas, runtime.guita, {
                hijo: runtime.hijo,
                hijoNombre: estado.hijo?.nombre,
              })}
              notaSocio={runtime.notaSocio}
            />
            {(runtime.minijuego || runtime.bonusEstudio > 0) && (
              <p className="space-x-3 text-xs text-humo-tenue">
                {runtime.minijuego && (
                  <span>
                    Minijuego:{' '}
                    <span className={runtime.bonusMinijuego >= 0 ? 'text-verde' : 'text-rojo'}>
                      {runtime.bonusMinijuego >= 0 ? '+' : ''}
                      {Math.round(runtime.bonusMinijuego * 100)}%
                    </span>
                  </span>
                )}
                {runtime.bonusEstudio > 0 && (
                  <span>
                    Cabeza: <span className="text-verde">+{Math.round(runtime.bonusEstudio * 100)}%</span>
                  </span>
                )}
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
          contexto={titulo}
          onFin={(score) => {
            setMini(null);
            acciones.elegirOpcion(mini.idx, score);
          }}
        />
      )}
    </>
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
        <h2 className="font-display text-2xl leading-tight text-tiza sm:text-3xl">
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
        <h2 className="font-display text-2xl leading-tight text-dorado sm:text-3xl">{p.meta.label}</h2>
        <p className="leading-relaxed text-humo">{p.meta.descripcion}</p>

        <div className="grid grid-cols-1 gap-2 text-sm min-[380px]:grid-cols-2">
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

const COLOR_BORDE = {
  verde: 'border-verde/35 bg-verde-hondo/25',
  rojo: 'border-rojo/35 bg-rojo-hondo/25',
  dorado: 'border-dorado/35 bg-dorado-hondo/20',
  humo: 'border-borde bg-panel-alto',
};

/**
 * "Cómo quedó la gente": el Rival, el hijo y el socio en el mismo bloque.
 * Antes el duelo con el Rival vivía solo; ahora las tres cosas que te miden
 * contra alguien se leen juntas, que es como se piensan.
 */
function ComoQuedoLaGente({ r }) {
  return (
    <div className="space-y-2">
      <Titulo>Cómo quedó la gente</Titulo>

      {/* Rival */}
      <div className="rounded-xl border border-borde bg-panel-alto p-3">
        <div className="text-[10px] uppercase tracking-widest text-humo">El duelo eterno</div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
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

      {/* Hijo */}
      {r.hijo && (
        <div className={`rounded-xl border p-3 ${COLOR_BORDE[r.hijo.color]}`}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] uppercase tracking-widest text-humo">
              {r.hijo.nombre} · {r.hijo.edadLabel}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-tiza">
              {r.hijo.tracker}/100
              {r.hijo.deltaAnio ? (
                <span className={r.hijo.deltaAnio > 0 ? 'text-verde' : 'text-rojo'}>
                  {r.hijo.deltaAnio > 0 ? '▲' : '▼'}
                  {Math.abs(r.hijo.deltaAnio)}
                </span>
              ) : null}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-noche">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                r.hijo.color === 'verde'
                  ? 'bg-verde'
                  : r.hijo.color === 'dorado'
                    ? 'bg-dorado'
                    : 'bg-rojo'
              }`}
              style={{ width: `${r.hijo.tracker}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-humo">
            {r.hijo.icono} {r.hijo.label}
          </p>
        </div>
      )}

      {/* Socio */}
      {r.socio && (
        <div className={`rounded-xl border p-3 ${COLOR_BORDE[r.socio.color]}`}>
          <div className="text-[10px] uppercase tracking-widest text-humo">Tu socio</div>
          <p className="mt-1 text-sm font-semibold text-tiza">{r.socio.completo}</p>
          <p className="mt-0.5 text-xs text-humo">
            {r.socio.icono} {r.socio.label}
          </p>
        </div>
      )}
    </div>
  );
}

function VistaResumen({ estado, acciones, onRetirarse }) {
  const r = estado.resumen;
  const colorNota = r.nota >= 7.5 ? 'text-verde' : r.nota >= 5 ? 'text-dorado' : 'text-rojo';
  const flechaIngreso = r.tendenciaIngreso > 0 ? '▲' : r.tendenciaIngreso < 0 ? '▼' : '▬';
  const colorIngreso =
    r.tendenciaIngreso > 0 ? 'text-verde' : r.tendenciaIngreso < 0 ? 'text-rojo' : 'text-humo';
  const d = r.decision;

  return (
    <Panel className="space-y-5">
      <Cabecera etiqueta={`Resumen · ${r.edad} años`} paso={`Año ${r.anio}`} color="dorado" />

      {/*
        La decisión del año va PRIMERO y grande. Es lo único del año que el
        jugador eligió: todo lo demás le pasó. Si hubo un especial (bifurcación,
        hijo, socio, bisagra) ese le gana al evento con decisión común.
      */}
      {d && (
        <div
          className={`rounded-2xl border p-4 ${
            d.esCrisis ? 'border-rojo/40 bg-rojo-hondo/20' : 'border-dorado/40 bg-dorado-hondo/15'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="font-display text-[10px] uppercase tracking-[0.22em] text-dorado">
              {d.esCrisis ? 'La crisis del año' : d.especial ? 'El momento del año' : 'Tu decisión del año'}
            </span>
            {d.grado && (
              <span className="flex items-center gap-1 text-xs text-humo">
                <span aria-hidden>{GRADO_META[d.grado]?.icono}</span>
                {GRADO_META[d.grado]?.label}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 font-display text-xl leading-tight text-tiza">{d.titulo}</h3>
          {d.opcion && (
            <p className="mt-1 text-sm text-humo">
              <span className="text-humo-tenue">Elegiste:</span>{' '}
              <span className="italic text-tiza">{d.opcion}</span>
            </p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-humo">{d.texto}</p>
          {d.lineas?.length > 0 && (
            <div className="mt-2">
              <ListaLineas lineas={d.lineas} />
            </div>
          )}
          {d.notaSocio && (
            <div className="mt-2">
              <NotaSocio nota={d.notaSocio} />
            </div>
          )}
        </div>
      )}

      {/* Nota del año en box */}
      <div className="rounded-2xl border border-borde bg-panel-alto p-4 text-center sm:p-5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-humo">Nota del año</div>
        <div className={`num-grande mt-1 text-6xl sm:text-7xl ${colorNota}`}>{r.nota.toFixed(1)}</div>
        <p className="mt-2 text-sm text-humo">{r.comentario}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {r.huboMovida && <Chip color="dorado">🎯 Movida +1</Chip>}
          {r.huboVenta && <Chip color="verde">📦 Venta +1</Chip>}
          {estado.stats.atencion >= 80 && <Chip color="rojo">🚨 Atención −1</Chip>}
        </div>
      </div>

      {/* Guita */}
      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <div className="rounded-xl border border-borde bg-panel-alto p-3">
          <div className="text-[10px] uppercase tracking-widest text-humo">Ingreso del año</div>
          <div className={`num-grande num-ajustable mt-1 text-2xl ${colorIngreso}`}>
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
          <div className="num-grande num-ajustable mt-1 text-2xl text-verde">
            {formatearGuitaCorta(r.guita)}
          </div>
        </div>
      </div>

      {r.crisis && (
        <div className="rounded-xl border border-rojo/40 bg-rojo-hondo/40 p-3 text-sm text-rojo">
          ⚠️ Se te disparó una crisis: venías tres años sin levantar.
        </div>
      )}

      <ComoQuedoLaGente r={r} />

      {/* Cómo quedaron los stats */}
      {r.lineasDeltas.length > 0 && (
        <div>
          <Titulo>Cómo cerraste el año</Titulo>
          <div className="mt-2">
            <ListaLineas lineas={r.lineasDeltas} />
          </div>
        </div>
      )}

      {/* Lo que pasó */}
      <details className="rounded-xl border border-borde bg-panel-alto p-3">
        <summary className="toque-chico flex cursor-pointer items-center text-xs font-semibold uppercase tracking-widest text-humo">
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

      {/*
        El gancho. Va SIEMPRE y va último, pegado al botón de seguir: es lo
        último que el jugador lee antes de decidir si sigue jugando.
      */}
      {r.cliffhanger && (
        <div className="anim-subir rounded-2xl border border-dorado/30 bg-dorado-hondo/15 p-4">
          <div className="font-display text-[10px] uppercase tracking-[0.22em] text-dorado">
            Y algo más
          </div>
          <p className="mt-1.5 leading-relaxed text-tiza italic">{r.cliffhanger}</p>
        </div>
      )}

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
