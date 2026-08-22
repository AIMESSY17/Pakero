import { itemPorId } from '../data/mercado.js';

/**
 * Junta en un solo objeto todos los efectos pasivos activos: staff comprado,
 * lujo y buffs de consumibles todavia sin gastar.
 */
export function calcularMods(estado) {
  const mods = {
    atencionPorAnio: 0,
    saludPorAnio: 0,
    ingresoPct: 0,
    bonusTirada: 0,
    bonusCombate: 0,
    reduceAtencionRiesgo: 0,
    avisoRiesgo: false,
    escudoPreso: 0,
  };

  for (const id of estado.mercado.staff) {
    const item = itemPorId(id);
    if (!item?.efectos) continue;
    for (const [k, v] of Object.entries(item.efectos)) {
      if (typeof v === 'boolean') mods[k] = mods[k] || v;
      else if (typeof v === 'number') mods[k] = (mods[k] ?? 0) + v;
    }
  }

  // Los escudos ya gastados no cuentan.
  mods.escudoPreso = Math.max(0, mods.escudoPreso - (estado.mercado.escudosGastados ?? 0));

  for (const buff of estado.mercado.buffs ?? []) {
    mods.bonusTirada += buff.bonusTirada ?? 0;
    mods.bonusCombate += buff.bonusCombate ?? 0;
  }

  return mods;
}

/** Gasta un uso de cada buff temporal y descarta los que se quedaron sin usos. */
export function consumirBuffs(estado) {
  estado.mercado.buffs = (estado.mercado.buffs ?? [])
    .map((b) => ({ ...b, usos: b.usos - 1 }))
    .filter((b) => b.usos > 0);
}
