import { useState } from 'react';
import { Boton, Panel, Titulo } from '../base.jsx';
import { NOMBRES_VILLEROS, APODOS } from '../../data/nombres.js';

const alAzar = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function Creacion({ onCrear, onVolver }) {
  const [nombre, setNombre] = useState('');
  const [apodo, setApodo] = useState('');

  const enviar = (e) => {
    e.preventDefault();
    onCrear({ nombre, apodo });
  };

  return (
    <div className="textura-asfalto flex min-h-dvh items-center justify-center p-6">
      <form onSubmit={enviar} className="anim-subir w-full max-w-md">
        <Panel className="space-y-6">
          <div>
            <Titulo>Empezás a los 12</Titulo>
            <h1 className="mt-1 font-display text-3xl text-tiza">¿Quién sos?</h1>
            <p className="mt-2 text-sm text-humo">
              Vas a arrancar el secundario en una villa que te toca por sorteo. De ahí en más,
              es todo tuyo.
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-humo">
              Nombre
            </span>
            <div className="mt-1.5 flex gap-2">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={20}
                placeholder="Como te llaman en el documento"
                className="min-w-0 flex-1 rounded-xl border border-borde bg-noche px-3 py-2.5 text-tiza
                           placeholder:text-humo-tenue focus:border-verde focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setNombre(alAzar(NOMBRES_VILLEROS))}
                className="shrink-0 rounded-xl border border-borde bg-panel-alto px-3 text-sm text-humo hover:text-tiza"
              >
                🎲
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-humo">
              Apodo
            </span>
            <div className="mt-1.5 flex gap-2">
              <input
                value={apodo}
                onChange={(e) => setApodo(e.target.value)}
                maxLength={20}
                placeholder="Como te llaman en la esquina"
                className="min-w-0 flex-1 rounded-xl border border-borde bg-noche px-3 py-2.5 text-tiza
                           placeholder:text-humo-tenue focus:border-verde focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setApodo(alAzar(APODOS))}
                className="shrink-0 rounded-xl border border-borde bg-panel-alto px-3 text-sm text-humo hover:text-tiza"
              >
                🎲
              </button>
            </div>
          </label>

          <p className="text-xs text-humo-tenue">
            Si los dejás vacíos te ponemos uno nosotros.
          </p>

          <div className="space-y-2">
            <Boton type="submit" className="w-full">
              Arrancar
            </Boton>
            <Boton type="button" variante="fantasma" className="w-full" onClick={onVolver}>
              Volver
            </Boton>
          </div>
        </Panel>
      </form>
    </div>
  );
}

/**
 * Cartel de arranque: quién sos, de dónde venís y por qué te metiste en esto.
 * Va justo después de crear el personaje, antes del primer evento.
 */
export function CartelIntro({ estado, onSeguir }) {
  const { jugador, origen, rival, streamer } = estado;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-noche/97 p-4 sm:p-6">
      <div className="anim-subir mx-auto my-auto flex min-h-full max-w-xl items-center">
        <div className="w-full rounded-3xl border border-borde bg-panel p-6 shadow-2xl sm:p-8">
          <p className="text-center font-display text-xs uppercase tracking-[0.35em] text-humo">
            Así empieza
          </p>

          <h1 className="mt-3 text-center font-display text-4xl leading-tight text-verde">
            {jugador.nombre}
          </h1>
          <p className="text-center text-lg italic text-dorado">"{jugador.apodo}"</p>

          <div className="mt-7 space-y-4 leading-relaxed text-tiza">
            <p>
              Naciste y te criaste en{' '}
              <strong className="text-verde">{origen.nombre}</strong>. Un lugar donde a los
              doce años ya sabés distinguir un cohete de lo que no es un cohete, y donde nadie
              te va a regalar absolutamente nada.
            </p>

            <p>
              Pero en los pasillos del secundario te diste cuenta de algo que a los demás se
              les pasaba por alto:{' '}
              <strong className="text-tiza">
                siempre hay alguien que quiere algo y no sabe dónde conseguirlo
              </strong>
              . Y vos sí sabías.
            </p>

            <p>
              Arrancaste chiquito. Cosas que iban de una mano a otra en el recreo, nada del
              otro mundo. La idea, en realidad, te la metió{' '}
              <strong className="text-dorado">@{streamer.handle}</strong>, ese {streamer.desc}.
            </p>

            <blockquote className="border-l-2 border-dorado bg-dorado-hondo/25 px-4 py-3">
              <p className="font-display text-lg leading-snug text-dorado">
                "El que reparte nunca pierde, muchachos."
              </p>
              <p className="mt-1.5 text-xs text-humo">
                Lo dijo al pedo, entre dos giros de ruleta, mientras perdía otra vez. Pero a
                vos se te quedó grabado.
              </p>
            </blockquote>

            <p>
              Nunca ganó un peso. Vos tampoco, mirándolo. La diferencia es que vos entendiste
              de qué lado del mostrador había que estar.
            </p>

            <p className="text-humo">
              Ah, y no vas a estar solo en esto. En el barrio hay otro pibe con las mismas
              ganas y la misma edad:{' '}
              <strong className="text-rojo">
                {rival.nombre} "{rival.apodo}"
              </strong>
              . Van a contar las ventas del otro toda la vida.
            </p>
          </div>

          {/* Orientación mínima para que sepa qué va a hacer */}
          <div className="mt-7 grid gap-2 rounded-2xl border border-borde bg-panel-alto p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-humo">
              Cómo es la cosa
            </p>
            {[
              ['🗓️', 'Un año por vuelta, de los 12 a los 45. Tres cosas te pasan y una la decidís vos.'],
              ['📦', 'Cada decisión te suma Ventas, Movidas, guita… o quilombo con la policía.'],
              ['👑', 'Hay cuatro territorios para conquistar. Nadie los ganó todos todavía.'],
            ].map(([icono, texto]) => (
              <p key={texto} className="flex gap-2.5 text-sm leading-relaxed text-humo">
                <span aria-hidden>{icono}</span>
                <span>{texto}</span>
              </p>
            ))}
          </div>

          <p className="mt-6 text-center font-display text-lg text-tiza">
            Tenés doce años y treinta y tres por delante.
          </p>

          <Boton className="mt-5 w-full" onClick={onSeguir}>
            Salir a la calle
          </Boton>
        </div>
      </div>
    </div>
  );
}

/** El 1%: pantalla de gala cuando sale "Nació un pibe maravilla". */
export function CartelPibeMaravilla({ estado, onSeguir }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-noche/96 p-6">
      <div className="anim-subir w-full max-w-lg text-center">
        <div className="rounded-3xl border-2 border-dorado/60 bg-dorado-hondo/30 p-8 shadow-2xl shadow-dorado/10 anim-latido">
          <div aria-hidden className="text-6xl">
            ⭐
          </div>
          <p className="mt-4 font-display text-xs uppercase tracking-[0.35em] text-dorado">
            Uno cada cien
          </p>
          <h1 className="num-grande mt-2 text-5xl text-dorado">NACIÓ UN PIBE MARAVILLA</h1>
          <p className="mt-5 leading-relaxed text-tiza">
            No pasa seguido. Cada tanto el barrio saca uno así: nace con la calle adentro, con
            el nombre puesto antes de hacer nada y con la suerte de arranque que otros no
            consiguen en toda la vida.
          </p>
          <p className="mt-3 leading-relaxed text-humo">
            {estado.jugador.nombre} "{estado.jugador.apodo}" es uno de esos.
          </p>

          <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left">
            <li className="flex justify-between rounded-lg border border-dorado/30 bg-noche/50 px-3 py-2">
              <span className="text-sm text-tiza">🧱 Calle</span>
              <span className="font-mono font-bold text-dorado">+30</span>
            </li>
            <li className="flex justify-between rounded-lg border border-dorado/30 bg-noche/50 px-3 py-2">
              <span className="text-sm text-tiza">📣 Fama</span>
              <span className="font-mono font-bold text-dorado">+25</span>
            </li>
            <li className="flex justify-between rounded-lg border border-dorado/30 bg-noche/50 px-3 py-2">
              <span className="text-sm text-tiza">💵 Guita inicial</span>
              <span className="font-mono font-bold text-dorado">×3</span>
            </li>
          </ul>

          <Boton variante="dorado" className="mt-7 w-full" onClick={onSeguir}>
            Que se note
          </Boton>
        </div>
      </div>
    </div>
  );
}
