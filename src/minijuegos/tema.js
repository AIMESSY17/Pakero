/** Mismo lenguaje visual que la interfaz de React, pero en numeros para Phaser. */

/**
 * Medidas de referencia. Los minijuegos ya NO estan atados a estos numeros:
 * cada escena se dibuja con `this.A` / `this.H`, que salen del tamaño real del
 * contenedor. Quedan como valor por defecto (desktop apaisado) y como base
 * para escalar tipografias.
 */
export const ANCHO = 800;
export const ALTO = 500;

/**
 * Traduce el tamaño en pixeles CSS del contenedor a la resolucion logica del
 * canvas. La idea es que la relacion de aspecto del canvas sea SIEMPRE la del
 * hueco disponible: asi `Scale.FIT` lo llena entero y no queda una franja
 * apaisada en el medio de un celular vertical.
 *
 * Ademas mantiene los pixeles logicos cerca de los pixeles CSS (escala ~1x en
 * celular, ~1.5x en tablet, ~1.2x en desktop), que es lo que hace que los
 * textos y los botones se lean igual de bien en todos lados.
 */
export function medidasPara(anchoCss, altoCss) {
  const seguro = (v, alt) => (Number.isFinite(v) && v > 0 ? v : alt);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const w = seguro(anchoCss, ANCHO);
  const h = seguro(altoCss, ALTO);

  // Relaciones absurdas (una ventanita de 3000x200) se recortan para que el
  // juego siga siendo jugable.
  const r = clamp(w / h, 0.42, 2.4);

  // Los limites mantienen la escala cerca de 1:1 contra los px CSS: es lo que
  // hace que el texto salga nitido y que un boton mida lo mismo en un celular
  // que en una tablet.
  if (r >= 1) {
    const alto = Math.round(clamp(h, 400, 620));
    return { ancho: Math.round(alto * r), alto };
  }
  const ancho = Math.round(clamp(w, 360, 760));
  return { ancho, alto: Math.round(ancho / r) };
}

export const COLOR = {
  noche: 0x0a0c0b,
  asfalto: 0x121614,
  panel: 0x171c19,
  panelAlto: 0x1e2521,
  borde: 0x2a332d,
  tiza: 0xe9efea,
  humo: 0x9aa8a0,
  humoTenue: 0x6b7a72,
  verde: 0x3ddc84,
  verdeHondo: 0x14352a,
  rojo: 0xff5252,
  rojoHondo: 0x3a1618,
  dorado: 0xf5c542,
  doradoHondo: 0x3a2f10,
};

export const CSS = {
  tiza: '#e9efea',
  humo: '#9aa8a0',
  humoTenue: '#6b7a72',
  verde: '#3ddc84',
  rojo: '#ff5252',
  dorado: '#f5c542',
  noche: '#0a0c0b',
};

export const FUENTE = 'Inter, system-ui, sans-serif';
export const FUENTE_DISPLAY = 'Anton, Arial Narrow, sans-serif';

export const estiloTitulo = {
  fontFamily: FUENTE_DISPLAY,
  fontSize: '34px',
  color: CSS.tiza,
};

export const estiloSubtitulo = {
  fontFamily: FUENTE,
  fontSize: '15px',
  color: CSS.humo,
};

export const estiloEtiqueta = {
  fontFamily: FUENTE,
  fontSize: '18px',
  color: CSS.tiza,
  fontStyle: 'bold',
};

export const estiloMarcador = {
  fontFamily: FUENTE_DISPLAY,
  fontSize: '26px',
  color: CSS.verde,
};
