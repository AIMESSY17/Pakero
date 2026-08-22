import { useState } from 'react';
import { Boton, Panel, Titulo } from '../base.jsx';
import { STATS, STAT_META, formatearGuitaCorta } from '../../core/constants.js';
import { nombreRivalCompleto } from '../../data/nombres.js';

/**
 * Graficos en SVG a mano: no hace falta traer una libreria entera para tres
 * visualizaciones. Los colores de las series necesitan distinguirse entre si,
 * asi que suman dos tonos a la paleta base (celeste y violeta).
 */
const COLOR_SERIE = {
  calle: '#3ddc84',
  fama: '#f5c542',
  mana: '#5ec8f5',
  atencion: '#ff5252',
  salud: '#c88cff',
};

function GraficoLineas({ historial, visibles }) {
  const W = 640;
  const H = 260;
  const pad = { top: 14, right: 14, bottom: 26, left: 30 };
  const areaW = W - pad.left - pad.right;
  const areaH = H - pad.top - pad.bottom;

  const n = historial.length;
  const x = (i) => pad.left + (n <= 1 ? areaW / 2 : (i / (n - 1)) * areaW);
  const y = (v) => pad.top + areaH - (v / 100) * areaH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Evolución de los stats">
      {/* Rejilla */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={pad.left} y1={y(v)} x2={W - pad.right} y2={y(v)} stroke="#2a332d" strokeWidth="1" />
          <text x={pad.left - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#6b7a72">
            {v}
          </text>
        </g>
      ))}

      {/* Ejes de edad */}
      {historial.map((h, i) =>
        n <= 12 || i % Math.ceil(n / 10) === 0 ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7a72">
            {h.edad}
          </text>
        ) : null
      )}

      {/* Series */}
      {STATS.filter((s) => visibles[s]).map((stat) => {
        const puntos = historial.map((h, i) => `${x(i)},${y(h.stats[stat])}`).join(' ');
        return (
          <g key={stat}>
            <polyline
              points={puntos}
              fill="none"
              stroke={COLOR_SERIE[stat]}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {n <= 20 &&
              historial.map((h, i) => (
                <circle key={i} cx={x(i)} cy={y(h.stats[stat])} r="2.5" fill={COLOR_SERIE[stat]} />
              ))}
          </g>
        );
      })}
    </svg>
  );
}

function GraficoRival({ historial, rival, ventas }) {
  const W = 640;
  const H = 220;
  const pad = { top: 14, right: 14, bottom: 26, left: 34 };
  const areaW = W - pad.left - pad.right;
  const areaH = H - pad.top - pad.bottom;

  const max = Math.max(1, ventas, rival.ventas);
  const n = historial.length;
  const anchoGrupo = areaW / Math.max(1, n);
  const anchoBarra = Math.max(2, Math.min(12, anchoGrupo / 2.6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ventas contra el rival">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line
            x1={pad.left}
            y1={pad.top + areaH - f * areaH}
            x2={W - pad.right}
            y2={pad.top + areaH - f * areaH}
            stroke="#2a332d"
          />
          <text
            x={pad.left - 6}
            y={pad.top + areaH - f * areaH + 4}
            textAnchor="end"
            fontSize="10"
            fill="#6b7a72"
          >
            {Math.round(max * f)}
          </text>
        </g>
      ))}

      {historial.map((h, i) => {
        const cx = pad.left + i * anchoGrupo + anchoGrupo / 2;
        const hMio = (h.ventas / max) * areaH;
        const hSuyo = (h.rivalVentas / max) * areaH;
        return (
          <g key={i}>
            <rect
              x={cx - anchoBarra - 1}
              y={pad.top + areaH - hMio}
              width={anchoBarra}
              height={hMio}
              fill="#3ddc84"
              rx="1.5"
            />
            <rect
              x={cx + 1}
              y={pad.top + areaH - hSuyo}
              width={anchoBarra}
              height={hSuyo}
              fill="#ff5252"
              opacity="0.85"
              rx="1.5"
            />
            {(n <= 12 || i % Math.ceil(n / 10) === 0) && (
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="10" fill="#6b7a72">
                {h.edad}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Radar({ stats }) {
  const size = 240;
  const c = size / 2;
  const r = size / 2 - 34;
  const ejes = STATS;
  const ang = (i) => (Math.PI * 2 * i) / ejes.length - Math.PI / 2;
  const punto = (i, frac) => [c + Math.cos(ang(i)) * r * frac, c + Math.sin(ang(i)) * r * frac];

  const poligono = ejes.map((s, i) => punto(i, stats[s] / 100).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-56" role="img" aria-label="Perfil de stats">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={ejes.map((_, i) => punto(i, f).join(',')).join(' ')}
          fill="none"
          stroke="#2a332d"
        />
      ))}
      {ejes.map((_, i) => (
        <line key={i} x1={c} y1={c} x2={punto(i, 1)[0]} y2={punto(i, 1)[1]} stroke="#2a332d" />
      ))}
      <polygon points={poligono} fill="#3ddc84" fillOpacity="0.22" stroke="#3ddc84" strokeWidth="2" />
      {ejes.map((s, i) => {
        const [px, py] = punto(i, 1.22);
        return (
          <text
            key={s}
            x={px}
            y={py + 3}
            textAnchor="middle"
            fontSize="10"
            fill={COLOR_SERIE[s]}
            fontWeight="700"
          >
            {STAT_META[s].label}
          </text>
        );
      })}
    </svg>
  );
}

export function Estadisticas({ estado, onVolver }) {
  const [visibles, setVisibles] = useState(
    Object.fromEntries(STATS.map((s) => [s, true]))
  );
  const historial = estado.historial;

  if (historial.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-humo">Todavía no cerraste ningún año. No hay nada que graficar.</p>
        <Boton variante="fantasma" onClick={onVolver}>
          ← Volver
        </Boton>
      </div>
    );
  }

  const gana = estado.ventas > estado.rival.ventas;
  const mejorNota = historial.reduce((a, h) => (h.nota > a.nota ? h : a), historial[0]);
  const mejorIngreso = historial.reduce((a, h) => (h.ingreso > a.ingreso ? h : a), historial[0]);

  return (
    <div className="textura-asfalto min-h-dvh p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <h1 className="font-display text-3xl text-tiza">Estadísticas</h1>
          <p className="text-sm text-humo">
            {estado.jugador.nombre} "{estado.jugador.apodo}" · {historial.length}{' '}
            {historial.length === 1 ? 'año' : 'años'} de carrera
          </p>
        </header>

        {/* Números gordos */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Mejor nota', valor: mejorNota.nota.toFixed(1), sub: `a los ${mejorNota.edad}`, color: 'text-dorado' },
            { label: 'Mejor año', valor: formatearGuitaCorta(mejorIngreso.ingreso), sub: `a los ${mejorIngreso.edad}`, color: 'text-verde' },
            { label: 'Ventas', valor: estado.ventas, sub: `rival ${estado.rival.ventas}`, color: gana ? 'text-verde' : 'text-rojo' },
            { label: 'Movidas', valor: estado.movidas, sub: `${estado.territorios.length}/4 territorios`, color: 'text-tiza' },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-borde bg-panel p-3 text-center">
              <div className={`num-grande text-2xl ${t.color}`}>{t.valor}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-humo">{t.label}</div>
              <div className="text-[11px] text-humo-tenue">{t.sub}</div>
            </div>
          ))}
        </div>

        {/* Evolución de los stats */}
        <Panel className="space-y-3">
          <Titulo>Evolución de los cinco</Titulo>
          <GraficoLineas historial={historial} visibles={visibles} />
          <div className="flex flex-wrap gap-2">
            {STATS.map((s) => (
              <button
                key={s}
                onClick={() => setVisibles((v) => ({ ...v, [s]: !v[s] }))}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                  visibles[s] ? 'border-borde bg-panel-alto text-tiza' : 'border-borde-suave text-humo-tenue'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: visibles[s] ? COLOR_SERIE[s] : '#3a443d' }}
                />
                {STAT_META[s].label}
              </button>
            ))}
          </div>
        </Panel>

        {/* El duelo */}
        <Panel className="space-y-3">
          <div className="flex items-baseline justify-between">
            <Titulo>El duelo eterno</Titulo>
            <span className={`font-mono text-xs font-bold ${gana ? 'text-verde' : 'text-rojo'}`}>
              {gana ? 'VAS ARRIBA' : estado.ventas === estado.rival.ventas ? 'EMPATE' : 'VAS ABAJO'}
            </span>
          </div>
          <GraficoRival historial={historial} rival={estado.rival} ventas={estado.ventas} />
          <div className="flex items-center justify-center gap-5 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-verde" /> Vos ({estado.ventas})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-rojo" /> {nombreRivalCompleto(estado.rival)} (
              {estado.rival.ventas})
            </span>
          </div>
        </Panel>

        {/* Perfil actual */}
        <Panel className="space-y-2">
          <Titulo>Tu perfil hoy</Titulo>
          <Radar stats={estado.stats} />
        </Panel>

        <Boton variante="fantasma" className="w-full" onClick={onVolver}>
          ← Volver
        </Boton>
      </div>
    </div>
  );
}
