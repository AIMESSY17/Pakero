/**
 * RNG con semilla (mulberry32). La semilla vive dentro del GameState, asi que
 * una partida guardada retoma exactamente la misma secuencia de azar.
 *
 * Uso: todas las funciones toman y devuelven el estado del RNG de forma
 * imperativa sobre un objeto { seed } para no ensuciar las firmas.
 */

export function crearRng(seed = Date.now() >>> 0) {
  return { seed: seed >>> 0 };
}

/** Numero flotante en [0, 1). Muta rng.seed. */
export function rnd(rng) {
  rng.seed = (rng.seed + 0x6d2b79f5) >>> 0;
  let t = rng.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Entero en [min, max] inclusive. */
export function rndInt(rng, min, max) {
  return Math.floor(rnd(rng) * (max - min + 1)) + min;
}

/** Elemento random de un array. */
export function rndElem(rng, arr) {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(rnd(rng) * arr.length)];
}

/** true con probabilidad p (0..1). */
export function chance(rng, p) {
  return rnd(rng) < p;
}

/** Copia barajada (Fisher-Yates). */
export function barajar(rng, arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd(rng) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Elige un elemento respetando `peso` (default 1). Sirve para que un evento
 * raro aparezca menos seguido sin sacarlo del pool.
 */
export function rndPonderado(rng, arr, pesoDe = (x) => x.peso ?? 1) {
  if (!arr || arr.length === 0) return undefined;
  const total = arr.reduce((a, x) => a + Math.max(0, pesoDe(x)), 0);
  if (total <= 0) return rndElem(rng, arr);
  let r = rnd(rng) * total;
  for (const x of arr) {
    r -= Math.max(0, pesoDe(x));
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
}
