/**
 * El Mercado. Tres familias:
 *  - staff: se compra una vez, queda para siempre, da efectos pasivos.
 *  - consumible: un solo uso, se aplica al toque (o guarda un buff para el
 *    proximo evento de riesgo).
 *  - lujo: se compra una vez, sube Fama y queda como activo visible en la ficha.
 *
 * Efectos pasivos soportados por el motor (ver core/mods.js):
 *   atencionPorAnio   suma/resta Atencion cada fin de año
 *   saludPorAnio      suma/resta Salud cada fin de año
 *   ingresoPct        multiplica el ingreso anual (0.15 = +15%)
 *   bonusTirada       suma a la probabilidad de toda tirada con riesgo
 *   bonusCombate      suma extra en minijuegos de pelea
 *   reduceAtencionRiesgo  descuenta Atencion ganada por opciones de riesgo
 *   avisoRiesgo       muestra la probabilidad real antes de elegir
 *   escudoPreso       evita una (1) caida presa y se gasta
 *
 * Los precios estan calibrados contra la economia real del juego: una carrera
 * fuerte junta del orden de $100M, asi que la Isla privada es el techo.
 */

export const ITEMS_MERCADO = [
  // ---------------- STAFF ----------------
  {
    id: 'abogado',
    familia: 'staff',
    nombre: 'Abogado de confianza',
    icono: '⚖️',
    precio: 900_000,
    desc: 'Te baja el quilombo judicial todos los años y te salva de una caída.',
    efectos: { atencionPorAnio: -6, escudoPreso: 1 },
  },
  {
    id: 'medico_esquina',
    familia: 'staff',
    nombre: 'Médico de la esquina',
    icono: '🩺',
    precio: 600_000,
    desc: 'Cose, venda y no pregunta. Recuperás salud cada año.',
    efectos: { saludPorAnio: 6 },
  },
  {
    id: 'contador',
    familia: 'staff',
    nombre: 'Contador trucho',
    icono: '🧾',
    precio: 1_200_000,
    desc: 'Hace que la plata entre más limpia y más grande. +20% de ingreso.',
    efectos: { ingresoPct: 0.2 },
  },
  {
    id: 'guardaespaldas',
    familia: 'staff',
    nombre: 'Guardaespaldas',
    icono: '🦍',
    precio: 1_000_000,
    desc: 'Dos metros de razones. Te cubre el cuerpo y pega por vos.',
    efectos: { saludPorAnio: 3, bonusCombate: 0.12, bonusTirada: 0.03 },
  },
  {
    id: 'informante',
    familia: 'staff',
    nombre: 'Informante en la comisaría',
    icono: '📻',
    precio: 1_500_000,
    desc: 'Sabés antes que la yuta. Ves la probabilidad real y levantás menos perfil.',
    efectos: { bonusTirada: 0.07, reduceAtencionRiesgo: 0.4, avisoRiesgo: true },
  },

  // ---------------- CONSUMIBLES ----------------
  {
    id: 'salita',
    familia: 'consumible',
    nombre: 'Salita del barrio',
    icono: '🏥',
    precio: 40_000,
    desc: 'Cola larga y gasa vieja, pero algo te arregla. +12 Salud.',
    consumo: { stats: { salud: 12 } },
  },
  {
    id: 'medico_privado',
    familia: 'consumible',
    nombre: 'Médico privado',
    icono: '💉',
    precio: 350_000,
    desc: 'Sanatorio con aire acondicionado. +35 Salud.',
    consumo: { stats: { salud: 35 } },
  },
  {
    id: 'celular_limpio',
    familia: 'consumible',
    nombre: 'Celular limpio',
    icono: '📱',
    precio: 220_000,
    desc: 'Línea nueva, chip nuevo, historial en cero. -25 Atención.',
    consumo: { stats: { atencion: -25 } },
  },
  {
    id: 'bendicion',
    familia: 'consumible',
    nombre: 'La Bendición del Padre Cacho',
    icono: '🕯️',
    precio: 120_000,
    desc: 'Fe pura. +18% en la próxima tirada con riesgo.',
    consumo: { buff: { bonusTirada: 0.18, usos: 1 } },
  },
  {
    id: 'fixer_prensa',
    familia: 'consumible',
    nombre: 'Fixer de prensa',
    icono: '🎙️',
    precio: 500_000,
    desc: 'Te arman una nota donde quedás como un prócer. +12 Fama.',
    consumo: { stats: { fama: 12 } },
  },

  // ---------------- LUJO ----------------
  {
    id: 'auto',
    familia: 'lujo',
    nombre: 'Auto 0km',
    icono: '🚗',
    precio: 1_500_000,
    desc: 'Llantas que se ven de lejos. +6 Fama.',
    efectos: { famaAlComprar: 6 },
  },
  {
    id: 'casa',
    familia: 'lujo',
    nombre: 'Casa propia',
    icono: '🏠',
    precio: 5_000_000,
    desc: 'Techo tuyo, sin alquiler ni desalojo. +10 Fama.',
    efectos: { famaAlComprar: 10 },
  },
  {
    id: 'mansion',
    familia: 'lujo',
    nombre: 'Mansión',
    icono: '🏰',
    precio: 20_000_000,
    desc: 'Pileta con forma de riñón y portón eléctrico. +18 Fama.',
    efectos: { famaAlComprar: 18 },
  },
  {
    id: 'jet',
    familia: 'lujo',
    nombre: 'Jet privado',
    icono: '🛩️',
    precio: 60_000_000,
    desc: 'Ya no esperás en Ezeiza. +28 Fama.',
    efectos: { famaAlComprar: 28 },
  },
  {
    id: 'isla',
    familia: 'lujo',
    nombre: 'Isla privada',
    icono: '🏝️',
    precio: 150_000_000,
    desc: 'Un pedazo de mundo con tu nombre. +40 Fama.',
    efectos: { famaAlComprar: 40 },
  },
];

export const FAMILIAS_MERCADO = [
  { id: 'staff', label: 'Staff', icono: '👥', desc: 'Gente fija que te cubre las espaldas' },
  { id: 'consumible', label: 'Consumibles', icono: '🧪', desc: 'Un uso y se gastan' },
  { id: 'lujo', label: 'Lujo', icono: '💎', desc: 'Para que se note' },
];

export const itemPorId = (id) => ITEMS_MERCADO.find((i) => i.id === id);
