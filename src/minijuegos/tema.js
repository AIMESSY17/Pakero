/** Mismo lenguaje visual que la interfaz de React, pero en numeros para Phaser. */

export const ANCHO = 800;
export const ALTO = 500;

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
