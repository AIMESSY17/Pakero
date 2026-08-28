/**
 * Dos o tres líneas propias para cada lugar de `lugares.js`.
 *
 * Las usan los eventos de conquista, acercamiento y mantenimiento: cuando el
 * juego dice "Zavaleta" o "Jujuy" tiene que sonar a ESE lugar y no a un nombre
 * intercambiable en una plantilla.
 *
 * Criterio de escritura: la línea habla del LUGAR — su geografía, su clima, su
 * ruido, su comida, a qué hora se mueve — nunca de cómo sería la gente que
 * vive ahí. Un barrio se describe por sus pasillos y su cancha, una provincia
 * por su paisaje y su horario. Todo lo demás es escribir un prejuicio y
 * llamarlo ambientación.
 */

export const FLAVOR_LUGAR = {
  // ------------------------------------------------------------------ villas
  'Fuerte Apache': [
    'Los monoblocks tapan el sol a partir de las cuatro y abajo se hace de noche antes que arriba.',
    'Todo el mundo sabe qué pasa en cada piso y nadie lo dice en voz alta en el ascensor.',
    'La cancha de atrás no tiene arcos hace años y se sigue jugando con dos camperas.',
  ],
  'La Cava': [
    'Está en una hondonada: cuando llueve fuerte, el agua baja de todos lados a la vez.',
    'Desde arriba se ven los techos de chapa como un mar oxidado que llega hasta la avenida.',
    'A dos cuadras empiezan los countries, y las dos cosas conviven mirándose de reojo.',
  ],
  'Ciudad Oculta': [
    'La torre inconclusa se ve desde la autopista y nadie que pase sabe cómo se llama.',
    'Los pasillos doblan tantas veces que el que no es de acá se pierde en la primera cuadra.',
    'Es un barrio adentro de la ciudad al que la ciudad decidió no mirar.',
  ],
  'Villa 31': [
    'Vive abajo de la autopista, con los autos pasando a diez metros de las ventanas.',
    'Está a cinco minutos de Retiro: la terminal, los trenes y toda la plata del país al lado.',
    'De noche el ruido de arriba no para nunca, y ya nadie lo escucha.',
  ],
  'La Matanza': [
    'Es más grande que muchas provincias y tiene barrios que no se conocen entre sí.',
    'La Ruta 3 la parte al medio y todo lo que se mueve, se mueve por ahí.',
    'Acá se termina el conurbano y empieza el campo sin que haya un cartel que lo diga.',
  ],
  'Barrio Carlos Gardel': [
    'Lleva el nombre del que cantaba y en las paredes todavía queda algún mural viejo.',
    'Los pasillos son angostos y todo el mundo saluda porque no queda otra que cruzarse.',
    'Los sábados sale una murga que ensaya desde marzo y se escucha a tres cuadras.',
  ],
  Zavaleta: [
    'Pegado al Riachuelo, con ese olor que en verano no se va ni cerrando todo.',
    'El puente de la autopista le pasa por encima y deja una sombra que dura todo el día.',
    'Está a quince minutos del centro y a un mundo de distancia.',
  ],

  // -------------------------------------------------------------- provincias
  'Buenos Aires': [
    'La provincia más grande de todas: se puede manejar diez horas y seguir adentro.',
    'Tiene el puerto, la industria y la mitad de la gente del país; todo pasa por acá.',
  ],
  CABA: [
    'Doce cuadras separan la torre de vidrio del barrio donde nadie entra de noche.',
    'Es la ciudad donde se decide todo y la que menos se parece al resto del país.',
  ],
  Catamarca: [
    'Valles secos entre cerros, y un sol que a las dos de la tarde no deja a nadie en la calle.',
    'La minería mueve la plata grande y se ve en las camionetas nuevas sobre calles viejas.',
  ],
  Chaco: [
    'Calor húmedo de los que no aflojan ni de noche, y monte cerrado apenas salís del asfalto.',
    'El Impenetrable arranca de golpe: un día hay ruta y al siguiente ya no.',
  ],
  Chubut: [
    'Viento todo el año, tanto que los árboles crecen torcidos para el mismo lado.',
    'La meseta es tan grande y tan vacía que se puede manejar dos horas sin cruzar a nadie.',
  ],
  Córdoba: [
    'Las sierras se ven desde cualquier lado y todo el mundo mide las distancias con ellas.',
    'Segunda ciudad del país, con universidad vieja y noche larga.',
  ],
  Corrientes: [
    'El Paraná al lado, ancho como un mar marrón, y el chamamé sonando en cualquier esquina.',
    'En carnaval se para todo, literalmente todo, durante un mes.',
  ],
  'Entre Ríos': [
    'Entre dos ríos, como dice el nombre, y con lomadas verdes que no se terminan nunca.',
    'Termas, citrus y pueblos donde a las nueve de la noche ya no queda nadie en la calle.',
  ],
  Formosa: [
    'Frontera con Paraguay: el río se cruza en chalana y a nadie le llama la atención.',
    'El calor llega a extremos que en el resto del país no se entienden.',
  ],
  Jujuy: [
    'Se sube desde el valle hasta la puna y en el camino cambia el aire, el color y la respiración.',
    'La Quebrada tiene cerros de siete colores y no es una exageración de folleto.',
  ],
  'La Pampa': [
    'Llano hasta donde llega la vista, con el horizonte siempre a la misma distancia.',
    'Pueblos cada ochenta kilómetros, y entre uno y otro no hay absolutamente nada.',
  ],
  'La Rioja': [
    'Seco, con olivares y viñas peleándole el agua a un sol que no perdona.',
    'El Talampaya son paredones colorados de doscientos metros y un silencio raro.',
  ],
  Mendoza: [
    'El Aconcagua de fondo y todo el agua bajando por acequias que cruzan la ciudad entera.',
    'La vitivinicultura mueve la provincia, y el paso a Chile mueve todo lo demás.',
  ],
  Misiones: [
    'Tierra colorada que mancha todo lo que toca y selva que crece si te distraés una semana.',
    'Frontera con Brasil y Paraguay al mismo tiempo, con las Cataratas de postal en el medio.',
  ],
  Neuquén: [
    'Vaca Muerta cambió todo: la plata del petróleo llegó de golpe y no todos la vieron pasar.',
    'Al oeste empiezan los lagos y la cordillera; al este, la estepa pelada.',
  ],
  'Río Negro': [
    'El valle del río parte la provincia en dos y ahí están las chacras de manzanas y peras.',
    'De un lado Bariloche y el turismo; del otro, cientos de kilómetros de meseta sola.',
  ],
  Salta: [
    'Colonial y verde, con cerros alrededor de la ciudad y peñas que arrancan tarde.',
    'Frontera con Bolivia arriba: por ahí pasa desde siempre todo lo que tiene que pasar.',
  ],
  'San Juan': [
    'Sol casi todos los días del año y viento zonda que baja de la cordillera y pone a todos de mal humor.',
    'Terremotos en la memoria: la ciudad se reconstruyó entera y se nota en lo baja que es.',
  ],
  'San Luis': [
    'Sierras suaves y rutas nuevas que la cruzan de punta a punta.',
    'Está justo en el medio del camino a Mendoza, y de eso vive mucha gente.',
  ],
  'Santa Cruz': [
    'Vacía de verdad: hay más ovejas que personas y las distancias se miden en horas.',
    'El viento patagónico es un ruido de fondo permanente que se deja de escuchar recién al irse.',
  ],
  'Santa Fe': [
    'Rosario y el puerto de granos: por ahí sale la mitad de lo que el país le vende al mundo.',
    'El río Paraná con sus islas enfrente, donde uno se mete y no lo encuentra nadie.',
  ],
  'Santiago del Estero': [
    'La ciudad más vieja del país y una siesta que se respeta como institución.',
    'Calor seco, monte de quebracho y chacarera que arranca cuando baja el sol.',
  ],
  'Tierra del Fuego': [
    'El fin del mundo literal: abajo ya no hay nada hasta la Antártida.',
    'En invierno amanece a las diez y oscurece a las cinco; en verano no se hace de noche.',
  ],
  Tucumán: [
    'La más chica y la más llena: cañaverales verdes hasta el pie del cerro.',
    'La ciudad no para nunca y el azúcar marcó todo lo que pasó en esta provincia.',
  ],

  // ------------------------------------------------------------------ países
  Colombia: [
    'Montañas por todos lados: dos ciudades a cien kilómetros pueden estar a seis horas.',
    'Acá el negocio tiene reglas viejas, escritas mucho antes de que vos llegaras.',
    'Nadie te conoce y ese es el problema y la ventaja al mismo tiempo.',
  ],
  'España / Europa': [
    'Todo funciona, todo está filmado y todo queda registrado en algún lado.',
    'Se habla el mismo idioma y aun así hay que aprender a decir las cosas de nuevo.',
    'Hay mucha guita dando vueltas y muy poca tolerancia al desprolijo.',
  ],
  'Estados Unidos': [
    'Las distancias son otra cosa: acá se maneja seis horas para ir a laburar a otro estado.',
    'Las penas son largas de verdad y no hay quien las acomode con una llamada.',
    'Si sale bien, sale más grande que en cualquier otro lado. Si sale mal, también.',
  ],
};

/**
 * Una línea al azar del lugar. Devuelve `null` si el lugar no tiene flavor
 * cargado, para que quien la use pueda omitir la oración en vez de meter un
 * texto genérico de relleno.
 */
export function flavorDe(nombre, rng, rndElem) {
  const lineas = FLAVOR_LUGAR[nombre];
  if (!lineas?.length) return null;
  return rndElem(rng, lineas);
}

/** Todas las líneas de un lugar, para pantallas que quieran mostrarlas juntas. */
export const flavorCompleto = (nombre) => FLAVOR_LUGAR[nombre] ?? [];
