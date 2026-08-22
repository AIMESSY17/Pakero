import { STORAGE_KEY, STORAGE_VERSION } from './constants.js';

/**
 * Guardado en localStorage con el GameState completo. Al abrir el juego, si
 * hay partida en curso, se carga sola.
 */

export function guardarPartida(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    return true;
  } catch (e) {
    console.warn('[paquero] no se pudo guardar la partida', e);
    return false;
  }
}

export function cargarPartida() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const estado = JSON.parse(raw);
    if (estado?.version !== STORAGE_VERSION) {
      console.warn('[paquero] partida guardada de otra versión, se descarta');
      return null;
    }
    return estado;
  } catch (e) {
    console.warn('[paquero] partida guardada corrupta', e);
    return null;
  }
}

export function hayPartidaGuardada() {
  try {
    return localStorage.getItem(STORAGE_KEY) != null;
  } catch {
    return false;
  }
}

export function borrarPartida() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nada que hacer */
  }
}

/** Resumen corto para el botón "Continuar" del menú principal. */
export function vistaPreviaGuardado() {
  const e = cargarPartida();
  if (!e) return null;
  return {
    nombre: e.jugador?.nombre ?? '—',
    apodo: e.jugador?.apodo ?? '',
    edad: e.edad,
    guita: e.guita,
    territorios: e.territorios?.length ?? 0,
    terminada: !!e.final,
    ubicacion: e.ubicacion?.nombre ?? '',
  };
}
