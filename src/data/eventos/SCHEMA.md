# Schema de eventos de Paquero

Este archivo es la referencia para generar contenido. Todo evento es un objeto
JS plano.

Sigue sin haber `desbloquea`, `requiere` ni árbol de dependencias: el motor arma
cada año eligiendo del pool filtrado **por etapa, edad y —si el evento lo pide—
camino**. Un evento sin `camino` sirve para todos, que es la mayoría del pool.

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
| `titulo`          | string \| `(c) => string`         | sí          | va grande en el panel |
| `texto`           | string \| `(c) => string`         | sí          | 1-3 oraciones |
| `peso`            | number (default 1)                | no          | menor peso = aparece menos |
| `camino`          | `"estudiar"` \| `"calle"` \| `null`| no         | `null` = sirve para los dos |
| `sub`             | `"comunicacion"` \| `"administracion"` | no     | solo con `camino: "estudiar"` |

### Título y texto como función

La mayoría son strings pelados. Solo cuando el evento tiene que nombrar gente
que se genera en la partida (el socio, el hijo, el rival) o mostrar un número
calculado, se usa `(c) => string`. El contexto `c` está documentado en
[`core/texto.js`](../../core/texto.js): `c.socioNombre`, `c.hijoNombre`,
`c.rivalCompleto`, `c.costoReconversion`, `c.edad`, `c.ubicacion`, etc.

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
  estudio: 3,            // opcional, solo Secundario (ver más abajo)
  afinidad: 'fama',      // opcional, solo con `estudio`
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
      egoista: true,               // opcional: le baja la lealtad al socio
      usaEstudio: true,            // opcional: le suma el contador de estudio
      efecto: { camino: 'calle' }, // opcional: ver "Efectos"
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

- `texto` — qué pasó, 1-2 oraciones. También acepta `(c) => string`.
- `stats` — deltas de `calle`, `fama`, `mana`, `atencion`, `salud`. Todo opcional.
- `guita` — pesos que entran (o salen, en negativo). Opcional.
- `ventas` / `movidas` — cuánto suma al contador de carrera. Opcional.
- `hijo` — mueve el tracker del pibe (0-100). Solo aplica si ya nació. Opcional.
- `socio` — mueve la lealtad del socio (oculta, 0-100). Opcional.
- `estudio` / `afinidad` — puntos al contador oculto del Secundario. Opcional.
- `flags` — array de flags que van a **volver dentro de 3-5 años**. Opcional.

Un buen evento de decisión mueve **2 o 3 stats**, y cuando tiene sentido
narrativo mueve además el hijo o el socio. No hace falta que toque los cinco.

### Los 5 grados

Siempre los cinco. El motor los usa para la nota del año:
`critico_exito`=10, `exito`=8, `exito_con_costo`=6, `fracaso`=3, `critico_fracaso`=0.

### Minijuegos disponibles

`escapar_policia`, `fuga_rescate`, `pasar_droga`, `cruce_frontera`,
`combate_prolongado`, `empaquetar`, `prensado`, `perderla_de_vista`,
`armar_porro`, `pelear`.

El resultado del minijuego **suma un bonus** a la probabilidad (entre -0.10 y
+0.25). Nunca reemplaza la tirada.

## El contador oculto de estudio (`estudio` / `afinidad`)

Solo tiene sentido en el **Secundario**. Cualquier evento automático —o
cualquier resultado suelto de una decisión— puede traer:

- `estudio: n` — suma `n` al contador oculto `puntosEstudio`.
- `afinidad: 'fama' | 'mana'` — además inclina la balanza hacia una de las dos
  sub-variantes de Estudiar: `fama` → Comunicación, `mana` → Administración.

El jugador **nunca ve el número**. Lo único que ve es que a los 18, en el evento
de bifurcación, la opción de estudiar le sale bien o le sale mal, y qué carrera
le tocó. Todo el contenido de ese estilo vive en
[`caminos.js`](caminos.js).

## Flags de memoria (`flags`)

Un resultado puede dejar un flag. El flag **no desbloquea ni condiciona ningún
otro evento**: duerme entre 3 y 5 años y después vuelve una sola vez como eco
narrativo, con un empujón chico de stats.

Flags disponibles (el texto de cada uno vive en [`data/memoria.js`](../memoria.js)):

`traicion`, `desastre`, `buchon`, `conquista_fallida`, `zafada`, `abandono`,
`deuda`, `palabra`.

Un flag que no está en esa lista se ignora en silencio. Para agregar uno nuevo,
hay que sumarlo al banco `ECOS`.

## Eventos de crisis (mala racha)

Van en `crisis.js`, `tipo: 'decision'`, sin `etapa` (sirven para las dos).
Se disparan cuando el ingreso anual bajó o se estancó 3 años seguidos.

## Eventos especiales (`bisagras.js`)

Los que el motor **programa** en vez de sortear. Se marcan con `especial`:

| `especial`             | cuándo |
|------------------------|--------|
| `bifurcacion`          | a los 18, una sola vez, y ese año no pasa nada más |
| `segunda_chance`       | 25-30, solo si venís por la calle |
| `hijo`                 | 28-30, una sola vez |
| `socio_presentacion`   | 19-24 |
| `socio_prueba`         | 27-34, con `variante: 'leal' \| 'traicion'` según la lealtad |
| `socio_cierre`         | 36+, con `variante: 'leal' \| 'traicion'` |
| `bisagra`              | a los 20, 25, 30, 35 y 40 |
| `bisagra_terr`         | reemplaza a la bisagra si el hito de Territorio está al 70% o más |

Por lo demás son eventos de decisión comunes: mismos cinco grados, misma tirada,
mismo panel. Techo de **2 especiales por año** (`MAX_ESPECIALES_POR_ANIO`).

### Efectos (`efecto`)

Lo único que agregan los especiales. Se aplica **salga como salga la tirada**:
el azar define *cómo* te arranca, no *para dónde*.

| `efecto`                       | qué hace |
|--------------------------------|----------|
| `{ camino: 'estudiar'\|'calle' }` | fija el camino de los 18 (y la sub-variante) |
| `{ reconversion: true }`       | paga el costo y te pasa a Estudiar |
| `{ hijo: true }`               | nace el pibe |
| `{ socio: '<estado>' }`        | `presentacion`, `firme`, `traiciono`, `retirado`, `ultima`, `reconciliado`, `cerrado` |
| `{ empujeTerritorio: true }`   | te empuja hacia el próximo umbral de Territorio según el grado |

## Reglas de contenido

- **Nunca** contenido sexual ni romántico con menores, bajo ningún encuadre.
  El juego arranca a los 12 y el Secundario entero transcurre con el personaje
  menor de edad, así que esto no es una formalidad: es la regla que define qué
  puede pasar en la primera etapa.
