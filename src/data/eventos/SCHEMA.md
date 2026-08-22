# Schema de eventos de Paquero

Este archivo es la referencia para generar contenido (por ejemplo con Deepseek).
Todo evento es un objeto JS plano. No hay `desbloquea`, `requiere`, rutas ni
ramas: el motor arma cada año eligiendo del pool filtrado **solo por etapa y
edad**.

## Campos comunes

| campo             | tipo                              | obligatorio | notas |
|-------------------|-----------------------------------|-------------|-------|
| `id`              | string único                      | sí          | prefijo por etapa, ej. `sec_auto_calle_01` |
| `etapa`           | `"secundario"` \| `"adultez"`     | sí          | |
| `edad_min`        | number                            | no          | default: mínimo de la etapa |
| `edad_max`        | number                            | no          | default: máximo de la etapa |
| `tipo`            | `"automatico"` \| `"decision"`    | sí          | |
| `categoria`       | `"movida"` \| `"venta"` \| `null` | sí          | suma +1 a la nota del año si ocurre |
| `esfuerzo_fisico` | boolean                           | sí          | en `decision` se define además por opción |
| `titulo`          | string                            | sí          | va grande en el panel |
| `texto`           | string                            | sí          | 1-3 oraciones |
| `peso`            | number (default 1)                | no          | menor peso = aparece menos |

## Eventos automáticos (`tipo: "automatico"`)

Sin opciones. Suben un stat directo. Cada año salen **tres**, uno por slot:

- `slot: "calle"` → sube Calle
- `slot: "fama"` → sube Fama
- `slot: "mana_atencion"` → sube Maña **o** baja Atención

```js
{
  id: 'sec_auto_calle_01',
  etapa: 'secundario',
  tipo: 'automatico',
  slot: 'calle',
  categoria: null,
  esfuerzo_fisico: true,
  titulo: 'Se armó en el recreo',
  texto: 'Le levantaron la mochila a un pibe de tu curso y vos fuiste el único que se paró.',
  stats: { calle: 3 },   // un solo stat, coherente con el slot
}
```

## Eventos con decisión (`tipo: "decision"`)

2 o más opciones. Cada opción se resuelve con una tirada.

```js
{
  id: 'adu_dec_venta_01',
  etapa: 'adultez',
  tipo: 'decision',
  categoria: 'venta',
  esfuerzo_fisico: false,
  titulo: 'Encargo grande',
  texto: 'Un tipo de traje quiere volumen y paga en el acto.',
  opciones: [
    {
      texto: 'Aceptar y entregar vos mismo',
      riesgo: 'alto',              // nulo | bajo | medio | alto | extremo
      esfuerzo_fisico: true,       // con Salud < 30 se bloquea si riesgo es alto/extremo
      minijuego: 'pasar_droga',    // null si no tiene
      prob_base: 0.55,             // 0..1, antes de stats/minijuego/buffs
      resultados: {
        critico_exito:  { texto: '...', stats: { fama: 4 }, guita: 900000, ventas: 2 },
        exito:          { texto: '...', stats: { fama: 2 }, guita: 500000, ventas: 1 },
        exito_con_costo:{ texto: '...', stats: { salud: -8 }, guita: 300000, ventas: 1 },
        fracaso:        { texto: '...', stats: { atencion: 8 } },
        critico_fracaso:{ texto: '...', stats: { salud: -20, atencion: 15 } },
      },
    },
  ],
}
```

### Campos de resultado

- `texto` — qué pasó, 1-2 oraciones.
- `stats` — deltas de `calle`, `fama`, `mana`, `atencion`, `salud`. Todo opcional.
- `guita` — pesos que entran (o salen, en negativo). Opcional.
- `ventas` / `movidas` — cuánto suma al contador de carrera. Opcional.

### Los 5 grados

Siempre los cinco. El motor los usa para la nota del año:
`critico_exito`=10, `exito`=8, `exito_con_costo`=6, `fracaso`=3, `critico_fracaso`=0.

### Minijuegos disponibles

`escapar_policia`, `fuga_rescate`, `pasar_droga`, `cruce_frontera`,
`combate_prolongado`, `empaquetar`, `prensado`, `perderla_de_vista`,
`armar_porro`, `pelear`.

El resultado del minijuego **suma un bonus** a la probabilidad (entre -0.10 y
+0.25). Nunca reemplaza la tirada.

## Eventos de crisis (mala racha)

Van en `crisis.js`, `tipo: 'decision'`, sin `etapa` (sirven para las dos).
Se disparan cuando el ingreso anual bajó o se estancó 3 años seguidos.

## Reglas de contenido — no negociables

- **Nunca** contenido sexual ni romántico con menores, bajo ningún encuadre.
- **Nunca** personas reales. Siempre parodias inventadas.
- **Nunca** minijuegos de disparar o apuntar un arma a personas.
