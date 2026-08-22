# Paquero

Simulador de vida de los 12 a los 45. Cinco stats, un rival que te corre de
atrás toda la carrera, cuatro territorios para conquistar y catorce finales
distintos según cómo termines.

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
    partida.js       Creación del personaje (incluye el 1% de pibe maravilla)
    storage.js       localStorage

  data/            Contenido puro, sin lógica.
    eventos/         SCHEMA.md + los pools por etapa
    finales.js       Los 14 finales con sus condiciones
    lugares.js       Villas, provincias, países, umbrales de territorio
    mercado.js       Staff, consumibles, lujo
    nombres.js       Nombres y apodos para el rival

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
puede armar un año.

## Reglas de contenido — no negociables

- **Nunca** contenido sexual ni romántico con menores, bajo ningún encuadre.
- **Nunca** personas reales. Siempre parodias inventadas.
- **Nunca** minijuegos de disparar o apuntar un arma a personas. "Shooter" y
  "recargar" están descartados para siempre.

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
  retoma exactamente la misma secuencia.
