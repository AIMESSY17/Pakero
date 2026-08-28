import { rndElem, rndInt } from './rng.js';
import { ECOS, ecoPorId } from '../data/memoria.js';
import {
  MEMORIA_ANIOS_MIN,
  MEMORIA_ANIOS_MAX,
  MEMORIA_ECOS_POR_ANIO,
} from './constants.js';

/**
 * Memoria de mediano plazo.
 *
 * Un evento puede dejar un flag. El flag no desbloquea nada ni condiciona
 * ningun otro evento: solo duerme, y entre 3 y 5 años despues vuelve una vez
 * como eco narrativo. Es lo mas barato que se podia hacer para que el mundo
 * parezca acordarse, sin volver a un arbol de dependencias.
 */

/** Anota un flag para que vuelva mas adelante. Ignora los desconocidos. */
export function recordar(estado, flag, contexto = null) {
  if (!flag || !ecoPorId(flag)) return null;
  const memoria = (estado.memoria ??= []);
  // Un mismo flag no se apila: se refresca el mas reciente.
  const previo = memoria.find((m) => m.flag === flag && !m.usado);
  if (previo) {
    previo.anio = estado.anio;
    previo.edad = estado.edad;
    return previo;
  }
  const entrada = {
    flag,
    anio: estado.anio,
    edad: estado.edad,
    contexto,
    // Cuando toca volver. Se sortea al anotarlo para que no vuelvan todos juntos.
    vencimiento: estado.anio + rndInt(estado.rng, MEMORIA_ANIOS_MIN, MEMORIA_ANIOS_MAX),
    usado: false,
  };
  memoria.push(entrada);
  return entrada;
}

/** Flags maduros que todavia no volvieron. */
export function ecosMaduros(estado) {
  return (estado.memoria ?? []).filter((m) => !m.usado && estado.anio >= m.vencimiento);
}

/**
 * Saca uno (como mucho) y lo devuelve armado para mostrar. Devuelve null si no
 * hay nada maduro. Se llama al construir el año.
 */
export function resurgir(estado) {
  const maduros = ecosMaduros(estado);
  if (maduros.length === 0) return null;

  const salida = [];
  for (let i = 0; i < MEMORIA_ECOS_POR_ANIO && maduros.length; i++) {
    const entrada = rndElem(estado.rng, maduros);
    if (!entrada) break;
    maduros.splice(maduros.indexOf(entrada), 1);
    entrada.usado = true;

    const eco = ECOS[entrada.flag];
    const ctx = {
      anios: estado.anio - entrada.anio,
      edad: estado.edad,
      edadEntonces: entrada.edad,
      jugador: estado.jugador,
      rival: estado.rival,
      socio: estado.socio,
      hijo: estado.hijo,
      contexto: entrada.contexto,
    };
    salida.push({
      flag: entrada.flag,
      titulo: eco.titulo,
      icono: eco.icono,
      texto: eco.texto(ctx),
      stats: eco.stats ?? null,
      hijo: eco.hijo ?? 0,
      socio: eco.socio ?? 0,
      anios: ctx.anios,
      edadEntonces: entrada.edad,
    });
  }
  return salida.length ? salida : null;
}

/** Para la biografia final: que se le quedo grabado al mundo. */
export function flagsDeCarrera(estado) {
  return (estado.memoria ?? []).map((m) => m.flag);
}

export function tuvoFlag(estado, flag) {
  return (estado.memoria ?? []).some((m) => m.flag === flag);
}
