import { useCallback, useRef, useState } from 'react';
import { crearPartida } from '../core/partida.js';
import {
  construirAnio,
  continuar as engContinuar,
  elegirOpcion as engElegirOpcion,
  jugarConquista as engJugarConquista,
  cerrarConquista as engCerrarConquista,
  saltarConquista as engSaltarConquista,
  siguienteAnio as engSiguienteAnio,
  retirarse as engRetirarse,
} from '../core/engine.js';
import { comprar as engComprar } from '../core/mercado.js';
import { mudarse as engMudarse } from '../core/territorio.js';
import { guardarPartida, cargarPartida, borrarPartida } from '../core/storage.js';

/**
 * Un solo lugar donde vive el GameState. Toda accion:
 *   1. clona el estado    2. deja que el motor lo mute    3. guarda en localStorage
 *
 * Se usa un ref ademas del state para que las acciones encadenadas nunca lean
 * una version vieja del estado.
 */
export function useJuego() {
  const [estado, setEstado] = useState(null);
  const ref = useRef(null);

  const instalar = useCallback((nuevo) => {
    ref.current = nuevo;
    setEstado(nuevo);
    if (nuevo) guardarPartida(nuevo);
    return nuevo;
  }, []);

  /** Corre `fn` sobre una copia del estado y devuelve lo que `fn` devuelva. */
  const aplicar = useCallback(
    (fn) => {
      if (!ref.current) return undefined;
      const copia = structuredClone(ref.current);
      const salida = fn(copia);
      instalar(copia);
      return salida;
    },
    [instalar]
  );

  const acciones = {
    nuevaPartida: useCallback(
      (datos) => {
        const nuevo = crearPartida(datos);
        construirAnio(nuevo);
        return instalar(nuevo);
      },
      [instalar]
    ),

    cargarGuardado: useCallback(() => {
      const guardado = cargarPartida();
      if (guardado) instalar(guardado);
      return guardado;
    }, [instalar]),

    abandonar: useCallback(() => {
      borrarPartida();
      ref.current = null;
      setEstado(null);
    }, []),

    /** Saca el cartel de adelante de la cola y muestra el siguiente (si hay). */
    cerrarCartel: useCallback(
      () => aplicar((s) => void (s.carteles = (s.carteles ?? []).slice(1))),
      [aplicar]
    ),

    continuar: useCallback(() => aplicar(engContinuar), [aplicar]),

    elegirOpcion: useCallback(
      (idx, scoreMinijuego = null) => aplicar((s) => engElegirOpcion(s, idx, scoreMinijuego)),
      [aplicar]
    ),

    jugarConquista: useCallback(
      (score = null) => aplicar((s) => engJugarConquista(s, score)),
      [aplicar]
    ),
    cerrarConquista: useCallback(() => aplicar(engCerrarConquista), [aplicar]),
    saltarConquista: useCallback(() => aplicar(engSaltarConquista), [aplicar]),

    siguienteAnio: useCallback(() => aplicar(engSiguienteAnio), [aplicar]),

    retirarse: useCallback(() => aplicar(engRetirarse), [aplicar]),

    comprar: useCallback((itemId) => aplicar((s) => engComprar(s, itemId)), [aplicar]),

    mudarse: useCallback((destino) => aplicar((s) => engMudarse(s, destino)), [aplicar]),
  };

  return { estado, acciones };
}
