# Paquero

Simulador de vida de los 12 a los 45. Cinco stats, un rival que te corre de
atrás toda la carrera, cuatro territorios para conquistar y catorce finales
distintos según cómo termines.

Arriba de eso: una bifurcación a los 18 que se venía cocinando desde los 12, un
hijo y un socio con arco propio, cosas que hiciste hace cinco años y vuelven, y
una biografía final armada con 71 bloques que combinan todo eso.

Cada territorio tiene un dueño al que se lo sacaste, hay que volver a bancarlo
cada dos o tres años y se puede perder. Y ningún año cierra sin un gancho.

React + Vite + Tailwind v4. Minijuegos en Phaser 3.

## Correr el proyecto

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

### Simulador de balance

```bash
node scripts/simular.mjs 500
```

Juega N partidas eligiendo al azar y reporta cómo se reparten los finales, la
guita, los territorios y el duelo con el rival. Sirve para detectar que algo se
rompió o se desbalanceó sin tener que jugar a mano. También valida el pool de
eventos, así que conviene correrlo después de agregar contenido.

## Mapa del código

```
src/
  core/            El motor. No sabe que existe React.
    constants.js     Todas las perillas del balance en un solo lugar
    formulas.js      Ingreso anual, nota del año, rareza del final
    rng.js           Azar con semilla (las partidas guardadas son reproducibles)
    tirada.js        Los cinco grados de resultado
    engine.js        El año: eventos, límites, cierre, paso de año
    territorio.js    Conquistas y mudanzas
    mercado.js       Compras
    mods.js          Junta los efectos pasivos del staff y los buffs
    finales.js       Elige cuál de los 14 finales corresponde
    biografia.js     Arma la biografía del final combinando el banco de bloques
    camino.js        La bifurcación de los 18 y la segunda chance
    negocio.js       Las 5 afinidades de negocio de los 23 en adelante
    vinculos.js      El hijo y el socio (sus trackers y el arco)
    memoria.js       Flags que vuelven 3-5 años después
    cliffhanger.js   Elige el gancho con que cierra cada año
    texto.js         Resuelve títulos/textos que son función (nombran gente)
    partida.js       Creación del personaje (incluye el 1% de pibe maravilla)
    storage.js       localStorage

  data/            Contenido puro, sin lógica.
    eventos/         SCHEMA.md + los pools
      secundario.js    12-17
      adultez.js       18-45
      caminos.js       Eventos que suman "cabeza" + los de cada camino
      adultos.js       Contenido 18+ (el validador hace cumplir la edad)
      negocios.js      Los 20 eventos de negocio, 23+ (5 rubros)
      bisagras.js      Los especiales que el motor programa
      territorio.js    Acercamiento, dueño anterior, mantenimiento, tensión
      crisis.js        Mala racha
    finales.js       Los 14 finales con sus condiciones
    biografia.js     Banco de 71 bloques + la lista de variables gatillo
    memoria.js       Los ecos: qué se dice cuando un flag vuelve
    cliffhangers.js  Banco de 29 ganchos de cierre de año
    flavor.js        2-3 líneas propias para cada uno de los 34 lugares
    duenios.js       Arquetipos del dueño anterior de cada territorio
    lugares.js       Villas, provincias, países, umbrales de territorio
    mercado.js       Staff, consumibles, lujo
    nombres.js       Nombres y apodos para el rival, el socio y el hijo

  minijuegos/      Phaser, aislado del resto.
    catalogo.js      Solo datos (nombre, ícono, config). Sin Phaser.
    registro.js      Las escenas. Arrastra Phaser: solo lo carga PhaserGame.
    PhaserGame.jsx   Wrapper de React: monta/desmonta y devuelve el resultado
    BaseMinijuego.js Lo que comparten las diez escenas
    escenas/         8 escenas que cubren los 10 minijuegos

  ui/              React.
  store/useJuego.js Un solo lugar donde vive el GameState
```

### Por qué `catalogo.js` está separado de `registro.js`

Phaser pesa 1.2 MB. La interfaz necesita el nombre y el ícono de un minijuego
para pintar una opción, pero no el motor. Si el catálogo importara las escenas,
Phaser entraría al bundle inicial. Separados, el arranque son 300 KB y Phaser
se carga con `import()` recién cuando entrás a un minijuego.

## Agregar contenido de eventos

Los eventos que hay ahora son **de prueba**: alcanzan para que el motor corra de
punta a punta y nada más. El formato definitivo está documentado en
[`src/data/eventos/SCHEMA.md`](src/data/eventos/SCHEMA.md) — ese archivo es el
que hay que pasarle a un modelo para que genere contenido.

Para sumar un archivo nuevo: creralo en `src/data/eventos/`, importalo en
`index.js` y sumalo al spread. Después corré el simulador, que valida el pool.

**El motor necesita, como mínimo, por etapa:** un evento automático de cada slot
(`calle`, `fama`, `mana_atencion`) y un evento con decisión. Con menos que eso no
puede armar un año. El simulador lo chequea para las cuatro combinaciones de
etapa + camino (`validarCobertura`), así que si un evento nuevo con `camino`
deja algún hueco, lo dice antes de que se note jugando.

## Reglas de contenido

- **Nunca** contenido sexual ni romántico con menores, bajo ningún encuadre.
  El juego arranca a los 12 y el Secundario entero transcurre con el personaje
  menor de edad: no es una formalidad, es la regla que define qué puede pasar
  en la primera etapa.

Las otras dos reglas que estaban acá — no usar personas reales y no hacer
minijuegos de disparo — quedaron levantadas. Los streamers de `nombres.js`
siguen siendo inventados porque así se escribieron, no porque no se pueda
hacer otra cosa.

**Contenido adulto (18+).** Vive en
[`eventos/adultos.js`](src/data/eventos/adultos.js), marcado `adulto: true`.
El registro es la comedia picaresca argentina: chamuyo, levante, quilombo de
telo, el amigo que te deja pagando. Se insinúa, se hace el chiste y se corta
en la puerta del cuarto — el gag es el papelón, no la escena.

El corte por edad es **mecánico**: `validarPool()` exige `etapa: "adultez"` y
`edad_min >= 18` en todo evento marcado `adulto`, y el simulador aborta si
alguno no cumple. El Secundario no puede tocar ese pool ni por accidente ni
por un descuido de quien escriba contenido nuevo.

## La estructura de una vida

Arriba del año (1-2 automáticos + 1 decisión) hay una capa de cosas que el
motor **programa** en vez de sortear. Viven en `data/eventos/bisagras.js` y
`data/eventos/territorio.js`, y se marcan con el campo `especial`. Techo de dos
por año, y la bifurcación es exclusiva: el año que te definís no pasa nada más.

### El ritmo del año

Antes salían los **tres** slots automáticos todos los años: el jugador apretaba
"Continuar" tres veces antes de llegar a la única decisión real. Ahora salen
**uno o dos**, sorteando cuáles.

Bajar de 3 a ~1,5 es también un recorte de balance encubierto, así que hay dos
compensaciones explícitas en `constants.js`, con el número que las justifica en
el comentario:

- **`MULT_AUTOMATICO` (x2)** — los deltas de los automáticos se duplican al
  aplicarse. Sin esto, en 400 partidas simuladas la edad final se caía de 26,4
  a 22,5 y los territorios de 2,0 a 0,97.
- **`ATENCION_ENFRIAMIENTO_ANUAL` (−3)** — la Atención baja sola un poco cada
  año. El slot `mana_atencion` era el único freno que tenía, y al salir la
  mitad de las veces dejó de alcanzar: el **100%** de las partidas terminaba
  presa, siempre, por acumulación pura. Un regulador que depende del sorteo de
  slots es un regulador roto; este es pasivo y además es lo que pasa de verdad
  (lo que no alimentás, se enfría).
- **`MULT_ATENCION_RIESGO` (0,6)** — cada decisión cobra menos Atención por
  riesgo, porque ahora hay más decisiones por año (~1,7 contra ~1,2).

Con las tres, la edad final promedio volvió a 26,4: exactamente donde estaba
antes del cambio de ritmo.

### Territorio: lo que pasa alrededor de la conquista

Conquistar era un botón que se apretaba una vez y pagaba renta para siempre.
Ahora tiene antes, durante y después:

- **Acercamiento** — cuando te faltan entre 1 y 9 puntos para el umbral, la
  zona se entera antes que vos y hay que decidir si te mostrás o te callás.
- **El dueño anterior** — ningún lugar está vacío. Al conquistar aparece un
  tipo con nombre, apodo y arquetipo, y hay que decidir: dejarlo ir,
  humillarlo o sumarlo. No es sabor: cada salida cambia para siempre lo que
  cuesta **bancar ese territorio** (`aliado` +15%, `humillado` −15%), y se ve
  como un chip en las opciones del mantenimiento.
- **Mantenimiento** — cada 2-3 años por territorio hay que volver a bancarlo.
  La opción de dejarlo correr lo pierde en `fracaso` **y** en desastre. Un
  territorio perdido se va de verdad: deja de pagar renta y queda listado en la
  ficha como lo que se te cayó.
- **Tensión** — con dos o más territorios a la vez, la gente de uno y la del
  otro se rozan y te vienen a buscar a vos.

Cuando se cae un territorio siempre se cae el de **nivel más alto**, no el que
nombra el evento: `nivelDisponible` usa `territorios.length`, así que perder el
del medio dejaría un agujero en la escalera de niveles.

### El flavor de cada lugar

Los 34 lugares de `lugares.js` tienen 2-3 líneas propias en
[`data/flavor.js`](src/data/flavor.js), y aparecen en sus eventos de conquista
y mantenimiento. El criterio de escritura está arriba del archivo: la línea
habla del **lugar** — su geografía, su clima, su ruido, a qué hora se mueve —
nunca de cómo sería la gente que vive ahí. Un barrio se describe por sus
pasillos y su cancha; todo lo demás es escribir un prejuicio y llamarlo
ambientación.

Ojo con los nombres: tienen género propio (La Matanza, La Cava y Ciudad Oculta
son femeninos; Fuerte Apache es masculino) y el motor no lo sabe. Por eso los
textos rodean el problema con verbos —"ahora mandás en X", "hace tres años que
manejás X"— en vez de escribir "X es tuyo".

### El cliffhanger

Cada resumen de año cierra con un gancho, **sin excepción**. Banco de 29 en
[`data/cliffhangers.js`](src/data/cliffhangers.js), elegido por el contexto
real del año: la Atención, el rival, el hijo, el socio, un territorio que se
cayó, un dueño al que humillaste hace años.

Cinco entradas tienen `peso: 0` y `cuando: () => true` — son el piso, para que
un año sin nada particular tampoco cierre siempre igual. `elegirCliffhanger`
devuelve texto siempre, incluso si el banco quedara vacío: un resumen sin
gancho es el bug que este sistema existe para evitar, y el simulador cuenta
cuántos resúmenes salieron sin uno (tiene que dar cero).

### La bifurcación de los 18

Durante todo el Secundario se junta un contador **oculto** de `puntosEstudio`.
El jugador nunca ve el número: lo ve a los 18, cuando la opción "anotarte" le
sale bien o le sale mal. La opción tiene una `prob_base` deliberadamente baja
(0.30) y lo que la levanta —hasta +35%— es la cabeza que hizo antes.

Si elige estudiar, la **sub-variante** sale sola de qué tipo de eventos
`estudio_friendly` le tocaron: los de `afinidad: 'fama'` lo empujan a
Comunicación, los de `afinidad: 'mana'` a Administración de Empresas. Ya la
eligió sin saberlo, durante seis años.

Las sub-variantes **no son rutas**: cambian el sabor de algunos eventos de la
etapa. El filtro del pool sigue siendo etapa + edad, con dos campos opcionales
(`camino`, `sub`) que la mayoría de los eventos ni usa.

### A los 23 se termina la facultad

Los eventos con `camino: "estudiar"` salen del pool a los 23, **haya estudiado
o no**: a los treinta nadie sigue rindiendo el primer final. El corte lo hace
`poolDelAnio()` mirando la etiqueta `camino`, así que no hay que ponerle un
`edad_max` a cada evento de facultad ni acordarse al escribir contenido nuevo.

El evento de **segunda chance sigue existiendo** (25-30): no es contenido
recurrente de cursada, es un pivote de vida que ocurre una sola vez, y era una
mecánica pedida aparte. Lo que se corta es la facultad como escenografía
repetida, no la posibilidad de volver a estudiar.

### En qué te convertís: las 5 afinidades de negocio

A partir de los 23 los eventos de negocio ocupan ese lugar y son el mecanismo
por el que el personaje define su vida adulta. Cinco afinidades — **comercio**
(rutas, mercadería), **finanzas** (estructuras, blanqueo), **territorio**
(zona, bandas), **política** (favores, poder formal) y **farándula** (vida
pública, auspicios, medios; prioriza Fama).

No son rutas. Es el mismo truco que `puntosEstudio`, escalado a cinco lados: un
contador liviano que se llena **con lo que el jugador elige** y que solo
inclina el sorteo.

```
peso_efectivo = peso × (1 + 1.2 × proporción_de_esa_afinidad)
```

El multiplicador nunca baja de 1, así que **ningún evento queda excluido**. Un
tipo con 100% de finanzas sigue viendo eventos de calle y de farándula: los ve
menos seguido, nada más.

Cada evento tiene un `rubro` (de qué palo es, inclina el sorteo) y cada opción
un `negocio` (en qué te convierte, suma al contador). Casi todos los eventos
ofrecen opciones de rubros distintos — ahí está la decisión.

Medido con bots que eligen siempre lo mismo: la afinidad elegida queda
dominante en el 49-71% de las partidas, y sus eventos suben del 20% base a un
20-25% del total. Inclina; no rutea.

### La segunda chance (25-30)

Reconvertirse a estudiar de grande cuesta guita, y la cuenta la escribe la
carrera del jugador: `base + calleAcumulada × por_punto`, todo multiplicado por
`1 + Calle/100 × peso`. Cuanto más metido en la calle está, más cara le sale
la puerta de salida. Si no le alcanza, la opción se bloquea con ese motivo.

### El hijo (28-30)

Tracker propio de 0 a 100. No entra en **ninguna** fórmula de ingreso ni de
tirada: lo único que hace es cambiar cómo le va al pibe y qué dice de vos la
biografía. Se mueve con el campo `hijo` de los resultados y con una deriva
anual chica (Atención en zona roja lo baja, un año de nota alta lo sube).

### El socio

Tres momentos de arco: se suma (19-24), se prueba (27-34) y se cierra (36+).
Cuál de las dos variantes sale en la prueba lo decide un contador de lealtad
**liviano y oculto**: no tiene barra ni entra en ninguna fórmula. Las opciones
marcadas `egoista: true` se la bajan sin avisar. Si llegó al momento de la
prueba quebrado, te da vuelta la cara; si no, aparece a las dos de la mañana
con un bolso. En la ficha se ve cómo está parado con vos, nunca el número.

### Bisagras cada 5 años

A los 20, 25, 30, 35 y 40 cae un evento que habla de la edad que tenés. Si el
próximo hito de Territorio está al 70% o más, la bisagra de ese año pasa a ser
la que **te empuja adentro o te hace perder el envión** (`efecto:
{ empujeTerritorio: true }`). Es el punto donde las dos mecánicas se tocan.

Ese empujón es la única subida del juego que se saltea el rendimiento
decreciente, a propósito: el freno existe para que el contenido generoso no
lleve los stats al techo solo, y acá el jugador se la está jugando en un evento
de riesgo alto por exactamente esto.

### Memoria de mediano plazo

Un resultado puede dejar un `flag`. El flag **no desbloquea ni condiciona
ningún otro evento**: duerme entre 3 y 5 años y vuelve una sola vez como eco
narrativo al abrir el año ("te acordás de aquella vez..."), con un empujón
chico. Es lo más barato que se podía hacer para que el mundo parezca acordarse
sin volver a un árbol de dependencias.

### La biografía final

67 bloques repartidos en seis secciones: origen, camino, oficio, sangre, gente
y cierre. Una sección = un bloque: de todos los que matchean gana el de mayor
`peso`, y si empatan desempata el azar con semilla.

La lista completa de variables gatillo está arriba de todo en
[`data/biografia.js`](src/data/biografia.js) — si un bloque quiere mirar algo
que no está en esa lista, hay que agregarlo ahí primero. La sección `cierre`
tiene 22 bloques para 14 finales, así que ninguno cae en el genérico.

Cada sección tiene un bloque de `peso: 0` que siempre da true: es el piso, para
que nunca falte texto por más rara que sea la combinación.

### El resumen del año

La decisión que tomó el jugador va **primero y grande**: es lo único del año
que eligió, todo lo demás le pasó. Si hubo un especial, ese le gana al evento
con decisión común. Abajo, el Rival, el hijo y el socio se leen en un solo
bloque ("Cómo quedó la gente"), que es como se piensan.

## Decisiones de diseño que hubo que tomar

Tres cosas de la especificación original quedaban ambiguas o rompían el juego al
implementarlas literal. Están todas concentradas en `core/constants.js` para que
sean fáciles de revertir.

### 1. Crecimiento pasivo repartido, no por stat

`+1/+2 anual a Calle/Fama/Maña` se implementó como **+1/+2 a uno solo de los
tres, al azar**. Con la lectura literal (+1/+2 a cada uno) la Fama llega sola a
95 alrededor de los 24 y el Picantillo de Oro se ganaba en el **83%** de las
partidas simuladas.

De los 30 en adelante bajan los tres, que es donde se siente el peso de la edad.

### 2. Rendimiento decreciente en Calle, Fama y Maña

Freno propio del motor, no estaba en la especificación:
`factor = 1 - (valor/100)² × 0.75`. En 0 vale ×1, en 50 ×0.81, en 95 ×0.32.

Sin esto, contenido generoso empuja los stats al techo sin importar cómo juegues,
y los umbrales de territorio dejan de significar algo. Las bajadas pegan
completas: solo se frena la subida.

### 3. El rival corre en paralelo de verdad

Si te le escapás por más de 2 ventas, aprieta. Si van parejos, avanza despacio.
Si va ganando, afloja. Con un ritmo fijo el duelo se decidía solo por cuántos
eventos de venta te tocaban, y "El Eterno Segundo" salía en el 100% de las
partidas.

Ese final además pide una diferencia de 3 ventas o más: perder por una no te
define la carrera.

### 4. Calle y Fama pesan poco en el ingreso; los Territorios pagan renta

La fórmula original pagaba `(Calle×10.000 + Fama×20.000) × bonus_edad` todos los
años. Como Calle/Fama suben solas con el crecimiento pasivo (decisión #1), la
guita terminaba ganándose sola con el paso de los años, sin que el jugador
hiciera nada.

Se bajó ese término a `Calle×1.500 + Fama×3.000` y se agregó
`Territorios×800.000` dentro del mismo paréntesis (afectado por `bonus_edad`
igual que antes). Ahora el ingreso lo mueven sobre todo los eventos (pagan
guita directo), las Ventas y Movidas acumuladas, y los Territorios conquistados
—que además siguen pagando todos los años, no solo el año que se ganan—. Calle
y Fama solas, sin jugar, ya casi no generan nada.

## Cosas que conviene saber

- **Guita no es un stat.** Es un contador de plata aparte, calculado por ingreso
  anual. No tiene barra ni progresión.
- **Movidas y Ventas son acumulados de carrera**, no del año. La fórmula de
  ingreso usa los totales: la carrera que venís construyendo es lo que te da de
  comer todos los años.
- **El minijuego nunca reemplaza la tirada.** Se traduce a un bonus de entre
  -10% y +25% que se *suma* a la probabilidad. El azar sigue jugando siempre.
- **La partida se guarda sola** en cada acción y se carga al abrir el juego.
- **El azar tiene semilla** guardada en el estado, así que una partida cargada
  retoma exactamente la misma secuencia. La biografía del final se arma sobre
  una *copia* del RNG: pedirla no corre la secuencia de la partida.
- **El tracker del hijo tiene barra; la lealtad del socio no.** Es a propósito:
  el pibe es un número que el jugador tiene que poder mirar, y el socio se lee
  en lo que hace, no en un medidor. Cuando se mueve, el juego lo dice con una
  frase.
- **Ni el hijo ni el socio entran en ninguna fórmula** de ingreso, tirada o
  final. Cambian el contenido que te toca y la biografía, nada más.
- **La clave de guardado subió a `v2`.** El GameState sumó `camino`, `socio`,
  `hijo`, `memoria` y `especialesJugados`, y una partida vieja no los tiene: en
  vez de migrarla a mano, `storage.js` la descarta sola por versión.
- **El pool sigue sin árbol de dependencias.** Los flags de memoria no
  desbloquean eventos: solo agregan un párrafo 3-5 años después.
- **La clave de guardado subió a `v3`.** El GameState sumó `duenios`,
  `territoriosPerdidos`, `pendienteDuenio` y `focoTerritorio`, y los
  territorios ahora llevan `proximoMantenimiento`. Una partida `v2` no los
  tiene, así que `storage.js` la descarta sola por versión.
- **Los territorios ya no son permanentes.** Cada uno tiene
  `proximoMantenimiento`, la ficha muestra cuántos años faltan, y perderlo
  saca la renta de $800.000 anuales. En la simulación con juego al azar se
  pierde alrededor de un territorio por partida.
- **Un solo evento de acercamiento por nivel.** Se marca como
  `<id>:n<nivel>` en `especialesJugados`, así el mismo evento puede volver
  para el hito siguiente sin repetirse dentro del mismo.
