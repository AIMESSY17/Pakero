/**
 * Banco de bloques de la biografía final.
 *
 * ---------------------------------------------------------------------------
 * LAS VARIABLES GATILLO
 * ---------------------------------------------------------------------------
 * Todo bloque recibe el mismo contexto `c` y decide con `cuando(c)`. Esta es
 * la lista completa de lo que puede mirar. Si algo no está acá, no existe para
 * la biografía:
 *
 *   c.jugador          { nombre, apodo }
 *   c.origen           { tipo, nombre }   la villa donde arrancó
 *   c.pibeMaravilla    boolean            salió el 1% al crear el personaje
 *   c.edad             edad final
 *   c.guita            plata final
 *   c.stats            { calle, fama, mana, atencion, salud }
 *   c.ventas c.movidas acumulados de carrera
 *
 *   c.camino           'estudiar' | 'calle' | null
 *   c.sub              'comunicacion' | 'administracion' | null
 *   c.reconvertido     boolean            usó la segunda chance (25-30)
 *   c.rubro            'comercio' | 'finanzas' | 'territorio' | 'politica'
 *                      | 'farandula' | null   — la afinidad de negocio más alta
 *   c.negocio          null | { total, dominante, disperso, reparto }
 *                      `dominante` solo si se lleva más de un tercio del total
 *   c.edadEleccion     a qué edad se definió el camino
 *
 *   c.hijo             null | { nombre, edad, tracker, estado, hitos }
 *                      estado: 'muy_bien' | 'bien' | 'complicado' | 'mal'
 *   c.socio            { nombre, completo, estado, humor, momentos, hitos }
 *                      estado: 'activo' | 'firme' | 'traiciono' | 'retirado'
 *                              | 'ultima' | 'reconciliado' | 'cerrado'
 *                      momentos: cuáles de los tres actos del arco se jugaron
 *
 *   c.territorioMax    0..4               el nivel más alto conquistado
 *   c.territorios      [{ nivel, tipo, nombre, edad, duenio }]
 *   c.duenios          [{ nombre, apodo, territorio, destino }]
 *                      destino: 'libre' | 'humillado' | 'aliado'
 *   c.territoriosPerdidos [{ nombre, perdidoALos }]  los que no supiste bancar
 *   c.mudanzas c.enElExterior c.volvioAlPais
 *
 *   c.duelo            'gano' | 'empate' | 'perdio'    contra el Rival
 *   c.diferencia       ventas tuyas menos las de él
 *   c.rival            { nombre, apodo, ventas }
 *
 *   c.finalId          cuál de los 14 finales salió
 *   c.causa            'picantillo' | 'muerte' | 'preso' | 'retiro' | 'edad'
 *   c.rareza           'Legendaria' | 'Rara' | 'Común'
 *   c.flags            flags que dejó la carrera (ver core/memoria.js)
 *   c.tuvo(flag)       helper: si alguna vez pasó
 *
 * ---------------------------------------------------------------------------
 * CÓMO SE ARMA
 * ---------------------------------------------------------------------------
 * Seis secciones, un bloque por sección. De todos los que dan `cuando(c)`
 * true, gana el de mayor `peso`; si empatan, desempata el azar con semilla
 * (así una partida cargada rearma la misma biografía).
 *
 * Cada sección tiene un bloque de peso 0 que siempre da true: es el piso, para
 * que nunca falte texto por más rara que sea la combinación.
 */

// ===========================================================================
// 1. ORIGEN — de dónde salió
// ===========================================================================

const ORIGEN = [
  {
    id: 'origen_base',
    seccion: 'origen',
    peso: 0,
    cuando: () => true,
    texto: (c) =>
      `${c.jugador.nombre}, al que todos terminaron llamando "${c.jugador.apodo}", salió de ${c.origen.nombre} ` +
      'como salen casi todos: sin plan, sin padrino y con la mochila liviana porque no había mucho que meterle adentro.',
  },
  {
    id: 'origen_maravilla',
    seccion: 'origen',
    peso: 3,
    cuando: (c) => c.pibeMaravilla,
    texto: (c) =>
      `En ${c.origen.nombre} se dan uno cada tanto y ese año tocó ${c.jugador.nombre}. ` +
      'Desde chico se le notaba algo que a los otros pibes no: caminaba distinto, hablaba distinto, ' +
      'y los grandes lo miraban de reojo sabiendo que ese iba a ser un problema o iba a ser alguien. ' +
      'Terminó siendo las dos cosas.',
  },
  {
    id: 'origen_fama_alta',
    seccion: 'origen',
    peso: 2,
    cuando: (c) => c.stats.fama >= 70,
    texto: (c) =>
      `Nadie en ${c.origen.nombre} podía imaginar hasta dónde iba a llegar el nombre de "${c.jugador.apodo}". ` +
      'Era un pibe más entre trescientos pibes iguales, con la misma remera y la misma vereda rota. ' +
      'La diferencia no estuvo en de dónde salió: estuvo en que no se quedó.',
  },
  {
    id: 'origen_salud_rota',
    seccion: 'origen',
    peso: 2,
    cuando: (c) => c.stats.salud < 30,
    texto: (c) =>
      `${c.jugador.nombre} arrancó en ${c.origen.nombre} con un cuerpo sano, que era lo único que tenía. ` +
      'Lo gastó entero. Cada golpe que se comió después venía descontado de ahí, ' +
      'de ese pibe de doce años que corría toda la tarde sin cansarse.',
  },
  {
    id: 'origen_forastero',
    seccion: 'origen',
    peso: 2,
    cuando: (c) => c.mudanzas >= 3,
    texto: (c) =>
      `Nació en ${c.origen.nombre} y no se quedó a averiguar qué se sentía pertenecer a un lugar. ` +
      `${c.mudanzas} mudanzas después, la respuesta a "de dónde sos" se le fue haciendo cada vez más larga ` +
      'y cada vez menos cierta.',
  },
  {
    id: 'origen_nunca_se_fue',
    seccion: 'origen',
    peso: 2,
    cuando: (c) => c.mudanzas === 0,
    texto: (c) =>
      `${c.jugador.nombre} nació en ${c.origen.nombre} y no se movió de ahí ni un día. ` +
      'Las mismas cuatro cuadras toda la vida. Hay quien lo llama lealtad y quien lo llama no haber tenido a dónde ir; ' +
      'la verdad es que él nunca se hizo la pregunta.',
  },
  {
    id: 'origen_plata',
    seccion: 'origen',
    peso: 2,
    cuando: (c) => c.guita >= 15_000_000,
    texto: (c) =>
      `De ${c.origen.nombre}, donde la plata se contaba en monedas arriba de la mesa de la cocina, ` +
      `${c.jugador.nombre} terminó manejando cifras que en esa cocina no entraban ni escritas. ` +
      'Nadie del barrio entendió bien cómo. Él tampoco lo explicó nunca.',
  },
];

// ===========================================================================
// 2. CAMINO — la bifurcación de los 18 y lo que salió de ahí
// ===========================================================================

const CAMINO = [
  {
    id: 'camino_base',
    seccion: 'camino',
    peso: 0,
    cuando: () => true,
    texto: () =>
      'A los dieciocho se le abrieron dos puertas al mismo tiempo, como se le abren a todos, ' +
      'y eligió sin saber que estaba eligiendo. Eso es lo que nadie te cuenta de los dieciocho.',
  },
  {
    id: 'camino_calle',
    seccion: 'camino',
    peso: 2,
    cuando: (c) => c.camino === 'calle' && !c.reconvertido,
    texto: () =>
      'A los dieciocho eligió la calle sin dudarlo, y hay que decir que tenía razones: era donde sabía moverse, ' +
      'donde ya lo conocían, donde la plata entraba el mismo día que salías a buscarla. ' +
      'La factura de esa decisión no llega el primer año. Llega mucho después, toda junta.',
  },
  {
    id: 'camino_calle_exito',
    seccion: 'camino',
    peso: 4,
    cuando: (c) => c.camino === 'calle' && !c.reconvertido && c.territorioMax >= 2,
    texto: () =>
      'Eligió la calle a los dieciocho y le dio la razón. Mientras los que se anotaron en la facultad ' +
      'hacían fila para una fotocopia, él ya tenía gente laburando para él. ' +
      'Todo el que le dijo que se estaba equivocando terminó pidiéndole algo.',
  },
  {
    id: 'camino_calle_mal',
    seccion: 'camino',
    peso: 4,
    cuando: (c) => c.camino === 'calle' && !c.reconvertido && c.territorioMax === 0,
    texto: () =>
      'Eligió la calle a los dieciocho porque parecía lo rápido y lo seguro. Nunca llegó a ser dueño de nada. ' +
      'Los que se anotaron ese mismo año en cualquier cosa hoy tienen algo, aunque sea poco, ' +
      'y él tiene las historias, que no se comen.',
  },
  {
    id: 'camino_estudiar',
    seccion: 'camino',
    peso: 2,
    cuando: (c) => c.camino === 'estudiar' && !c.reconvertido,
    texto: () =>
      'A los dieciocho hizo lo que casi nadie de su cuadra: se anotó. Cursaba de noche, ' +
      'volvía a las dos de la mañana en un bondi vacío y al otro día estaba igual en la esquina. ' +
      'Durante años tuvo dos vidas y ninguna de las dos sabía del todo de la otra.',
  },
  {
    id: 'camino_comunicacion',
    seccion: 'camino',
    peso: 4,
    cuando: (c) => c.camino === 'estudiar' && c.sub === 'comunicacion' && !c.reconvertido,
    texto: () =>
      'Se metió en Comunicación, que en el barrio sonaba a chiste hasta que dejó de sonar a chiste. ' +
      'Aprendió lo único que hacía falta aprender: que la misma historia contada de dos maneras distintas ' +
      'te abre una puerta o te cierra todas. Después de eso ya no hubo nadie que le ganara hablando.',
  },
  {
    id: 'camino_comunicacion_fama',
    seccion: 'camino',
    peso: 6,
    cuando: (c) => c.sub === 'comunicacion' && c.stats.fama >= 80,
    texto: () =>
      'Comunicación le enseñó a manejar lo único que nunca se le fue de las manos: su propio nombre. ' +
      'Aprendió cuándo hablar, cuándo callarse y, sobre todo, cuándo dejar que hablaran los otros por él. ' +
      'Para cuando terminó la cursada ya no necesitaba presentarse en ningún lado.',
  },
  {
    id: 'camino_administracion',
    seccion: 'camino',
    peso: 4,
    cuando: (c) => c.camino === 'estudiar' && c.sub === 'administracion' && !c.reconvertido,
    texto: () =>
      'Se metió en Administración de Empresas y ahí encontró algo que no esperaba: que todo lo que ' +
      'venía haciendo a ojo tenía nombre técnico, planilla y método. Dejó de improvisar. ' +
      'Al año siguiente sabía exactamente cuánta plata perdía por mes, que es la clase de cosa ' +
      'que separa a los que duran de los que no.',
  },
  {
    id: 'camino_administracion_plata',
    seccion: 'camino',
    peso: 6,
    cuando: (c) => c.sub === 'administracion' && c.guita >= 10_000_000,
    texto: () =>
      'Administración le dio lo que la calle nunca le iba a dar: la capacidad de mirar un número grande ' +
      'sin marearse. Estructuras, papeles, cuentas que aguantan que las miren. ' +
      'Terminó siendo el tipo al que los demás le preguntaban dónde meter la plata, ' +
      'y esa pregunta vale más que la plata.',
  },
  {
    id: 'camino_reconvertido',
    seccion: 'camino',
    peso: 5,
    cuando: (c) => c.reconvertido,
    texto: (c) =>
      `A los dieciocho eligió la calle y a los ${c.edadEleccion ?? 27} se le dio por volver. ` +
      'Pagó una fortuna para poder irse — porque eso es lo que nadie dice: salir cuesta plata, ' +
      'y cuanto más adentro estás, más cara sale la puerta. La pagó igual. ' +
      'Cursar a esa edad, con esa vida encima, no lo hace cualquiera.',
  },
  {
    id: 'camino_reconvertido_tarde',
    seccion: 'camino',
    peso: 7,
    cuando: (c) => c.reconvertido && c.stats.atencion >= 60,
    texto: () =>
      'Se reconvirtió de grande: pagó lo que había que pagar, se anotó y fue. ' +
      'Pero hay cosas que no se van con un título. La carpeta con su nombre siguió engordando ' +
      'en algún cajón mientras él rendía finales, y al final ninguna de las dos cosas canceló a la otra.',
  },
];

// ===========================================================================
// 3. OFICIO — territorio, duelo, carrera
// ===========================================================================

const OFICIO = [
  {
    id: 'oficio_base',
    seccion: 'oficio',
    peso: 0,
    cuando: () => true,
    texto: (c) =>
      `Cerró la carrera con ${c.ventas} ventas y ${c.movidas} movidas encima. ` +
      'Números que no dicen nada solos y lo dicen todo si sabés leerlos.',
  },
  {
    id: 'oficio_sin_territorio',
    seccion: 'oficio',
    peso: 2,
    cuando: (c) => c.territorioMax === 0,
    texto: (c) =>
      `Nunca fue dueño de una esquina. ${c.ventas} ventas, ${c.movidas} movidas, años de laburo, ` +
      'y ni un pedazo de vereda que llevara su nombre. Siempre trabajó adentro del terreno de otro ' +
      'y siempre le pareció que estaba a punto de dar el salto.',
  },
  {
    id: 'oficio_villa',
    seccion: 'oficio',
    peso: 3,
    cuando: (c) => c.territorioMax === 1,
    texto: (c) =>
      // Nada de pronombres para el lugar: los nombres tienen género propio
      // (La Matanza, Fuerte Apache) y el motor no lo sabe.
      `Mandó en ${c.territorios[0]?.nombre ?? 'su barrio'}, y de verdad: nadie entraba sin saludarlo. ` +
      'Para el que mira de afuera es poco. Para el que sabe cómo se consigue una sola cuadra, ' +
      'es exactamente todo lo que se puede pedir.',
  },
  {
    id: 'oficio_provincia',
    seccion: 'oficio',
    peso: 3,
    cuando: (c) => c.territorioMax === 2,
    texto: (c) =>
      `Le alcanzó para dejar de ser un problema del barrio y pasar a ser un problema de la provincia. ` +
      'Dos territorios propios. En algún expediente hay un mapa con su nombre escrito al costado, ' +
      'y esa clase de mapas no se dibujan para cualquiera.',
  },
  {
    id: 'oficio_pais',
    seccion: 'oficio',
    peso: 3,
    cuando: (c) => c.territorioMax === 3,
    texto: () =>
      'Cruzó la frontera y del otro lado también armó lo suyo. Tres territorios en tres escalas distintas. ' +
      'Muy pocos llegan a manejar algo afuera del país, y de esos muy pocos casi ninguno vuelve a contarlo.',
  },
  {
    id: 'oficio_picantillo',
    seccion: 'oficio',
    peso: 5,
    cuando: (c) => c.territorioMax === 4,
    texto: () =>
      'Los cuatro. Barrio, provincia, afuera y la corona. No queda nada por arriba y no hay mucha ' +
      'gente en la historia de esto que pueda decir lo mismo. ' +
      'Después de ganar el Picantillo de Oro ya no se compite contra nadie: se compite contra el recuerdo propio.',
  },
  {
    id: 'oficio_duelo_gano',
    seccion: 'oficio',
    peso: 4,
    cuando: (c) => c.duelo === 'gano' && c.diferencia >= 4,
    texto: (c) =>
      `Y después está lo de ${c.rival.nombre}. Corrieron toda la vida al lado, contando lo mismo, ` +
      `midiéndose sin decírselo, y al final quedó ${c.ventas} a ${c.rival.ventas}. ` +
      'No fue una diferencia: fue una respuesta. La clase de respuesta que dura más que los dos.',
  },
  {
    id: 'oficio_duelo_perdio',
    seccion: 'oficio',
    peso: 4,
    cuando: (c) => c.duelo === 'perdio' && c.diferencia <= -3,
    texto: (c) =>
      `Y después está lo de ${c.rival.nombre}. Empezaron juntos y terminó ${c.rival.ventas} a ${c.ventas}. ` +
      'Toda una carrera corriendo atrás del mismo tipo, viéndole la espalda, escuchando su nombre ' +
      'en cada mesa donde debería haber sonado el propio.',
  },
  {
    id: 'oficio_duelo_empate',
    seccion: 'oficio',
    peso: 4,
    cuando: (c) => c.diferencia === 0,
    texto: (c) =>
      `Y después está lo de ${c.rival.nombre}, que es lo más raro de toda esta historia: ` +
      `terminaron ${c.ventas} a ${c.rival.ventas}, clavados. Dos tipos que arrancaron en el mismo lugar, ` +
      'eligieron distinto en todo y llegaron exactamente al mismo número. ' +
      'Ninguno de los dos se va a quedar tranquilo con eso.',
  },
  {
    id: 'oficio_duelo_por_una',
    seccion: 'oficio',
    peso: 4,
    cuando: (c) => Math.abs(c.diferencia) === 1,
    texto: (c) =>
      `Y después está lo de ${c.rival.nombre}: ${c.ventas} a ${c.rival.ventas}. Una. ` +
      'Toda una vida midiéndose para terminar separados por una sola venta, ' +
      'que es la peor manera de ganar y la peor manera de perder al mismo tiempo.',
  },
  {
    id: 'oficio_rubro_comercio',
    seccion: 'oficio',
    peso: 7,
    cuando: (c) => c.negocio?.dominante && c.rubro === 'comercio',
    texto: () =>
      'Terminó siendo, de todas las cosas posibles, un tipo de logística. Rutas, galpones, ' +
      'quién carga y a qué hora. Nada de lo que hizo salía en ninguna película, y justamente ' +
      'por eso funcionó tantos años: mover cosas bien es un oficio y lo aprendió entero.',
  },
  {
    id: 'oficio_rubro_finanzas',
    seccion: 'oficio',
    peso: 7,
    cuando: (c) => c.negocio?.dominante && c.rubro === 'finanzas',
    texto: () =>
      'Se convirtió en el que ordena los números. Sociedades, facturas, un circuito que aguanta ' +
      'que lo miren de frente. Dejó de contar la plata arriba de una mesa y pasó a contarla en ' +
      'una planilla, que es el momento exacto en que uno deja de ser un pibe con guita ' +
      'y pasa a ser otra cosa.',
  },
  {
    id: 'oficio_rubro_territorio',
    seccion: 'oficio',
    peso: 7,
    cuando: (c) => c.negocio?.dominante && c.rubro === 'territorio',
    texto: () =>
      'No se movió del palo del que salió: zona, gente y control. Pudo haberse ido para el lado ' +
      'de los papeles o de los contactos y eligió quedarse donde las cosas se resuelven en persona. ' +
      'Es el camino más corto y el que más cuerpo cuesta.',
  },
  {
    id: 'oficio_rubro_politica',
    seccion: 'oficio',
    peso: 7,
    cuando: (c) => c.negocio?.dominante && c.rubro === 'politica',
    texto: () =>
      'Terminó del lado de los que firman. Despachos, favores devueltos y gente que atiende ' +
      'el teléfono a la primera. Descubrió temprano lo que a otros les cuesta media vida: ' +
      'que el poder de verdad no se ejerce en la esquina, se ejerce en una oficina con aire acondicionado.',
  },
  {
    id: 'oficio_rubro_farandula',
    seccion: 'oficio',
    peso: 7,
    cuando: (c) => c.negocio?.dominante && c.rubro === 'farandula',
    texto: (c) =>
      'Se convirtió en un personaje público. Auspicios, cámaras, gente que lo saluda en la calle ' +
      `sin saber bien por qué. Cerró con ${c.stats.fama} de Fama, que es el número que eligió ` +
      'hacer crecer por encima de todos los demás. El nombre le terminó valiendo más que cualquier mercadería.',
  },
  {
    id: 'oficio_rubro_disperso',
    seccion: 'oficio',
    peso: 6,
    cuando: (c) => c.negocio?.disperso && c.negocio.reparto.length >= 3,
    texto: (c) =>
      `Nunca se especializó en nada. Anduvo en ${c.negocio.reparto.length} rubros distintos ` +
      'sin quedarse del todo en ninguno: un poco de esto cuando aparecía, un poco de aquello ' +
      'cuando se caía lo anterior. Los que se dedicaron a una sola cosa llegaron más alto. ' +
      'Él llegó a más lugares.',
  },
  {
    id: 'oficio_perdio',
    seccion: 'oficio',
    peso: 6,
    cuando: (c) => c.territoriosPerdidos.length > 0,
    texto: (c) => {
      const p = c.territoriosPerdidos[0];
      const n = c.territoriosPerdidos.length;
      return (
        `Llegó a mandar en ${p.nombre} y a los ${p.perdidoALos} ya no. ` +
        (n > 1 ? `Y no fue el único lugar que se le cayó: fueron ${n}. ` : '') +
        'Conquistar tiene una noche y una foto; bancarlo tiene todos los otros días, ' +
        'y ahí es donde se le fue.'
      );
    },
  },
  {
    id: 'oficio_duenio_humillado',
    seccion: 'oficio',
    peso: 6,
    cuando: (c) => c.duenios.some((d) => d.destino === 'humillado'),
    texto: (c) => {
      const d = c.duenios.find((x) => x.destino === 'humillado');
      const n = c.duenios.filter((x) => x.destino === 'humillado').length;
      return (
        `A ${d.nombre} lo sacó de ${d.territorio} caminando por el medio, con todo el barrio mirando. ` +
        (n > 1 ? `Y no fue el único al que se lo hizo. ` : '') +
        'Le funcionó: nadie discutió nada por mucho tiempo. ' +
        'Lo que no calculó es que un tipo al que le sacaste todo y encima dejaste vivo ' +
        'se pasa el resto de su vida con una sola cosa que hacer.'
      );
    },
  },
  {
    id: 'oficio_duenio_aliado',
    seccion: 'oficio',
    peso: 6,
    cuando: (c) => c.duenios.some((d) => d.destino === 'aliado'),
    texto: (c) => {
      const d = c.duenios.find((x) => x.destino === 'aliado');
      return (
        `Cuando le sacó ${d.territorio} a ${d.nombre}, en vez de echarlo lo sentó a la mesa. ` +
        'Se rieron de eso durante meses, hasta que se dejaron de reír: ' +
        'el tipo conocía cada pasillo del lugar porque los había caminado veinte años, ' +
        'y esa información no se compra.'
      );
    },
  },
  {
    id: 'oficio_duenio_libre',
    seccion: 'oficio',
    peso: 5,
    cuando: (c) => c.duenios.length > 0 && c.duenios.every((d) => d.destino === 'libre'),
    texto: () =>
      'A todos los que les sacó algo los dejó irse enteros. Ni una escena, ni un mensaje, ' +
      'ni una foto para que circulara. En este rubro eso se lee de dos maneras y él ' +
      'nunca aclaró cuál era la suya.',
  },
  {
    id: 'oficio_exterior',
    seccion: 'oficio',
    peso: 5,
    cuando: (c) => c.enElExterior && !c.volvioAlPais,
    texto: () =>
      'La última vez que alguien del barrio lo vio, estaba subiendo a un micro con un bolso solo. ' +
      'Del otro lado de la frontera armó algo que acá nadie llegó a entender del todo. ' +
      'Manda saludos por gente que va y viene, y eso es lo más cerca que va a estar de volver.',
  },
];

// ===========================================================================
// 4. SANGRE — el hijo
// ===========================================================================

const SANGRE = [
  {
    id: 'sangre_sin_hijo',
    seccion: 'sangre',
    peso: 0,
    cuando: () => true,
    texto: () =>
      'No dejó hijos. Se le pasó, o no se dio, o lo esquivó a propósito y nunca lo dijo en voz alta. ' +
      'Es de las pocas cosas de las que no habló nunca, ni borracho.',
  },
  {
    id: 'sangre_muy_bien',
    seccion: 'sangre',
    peso: 4,
    cuando: (c) => c.hijo?.estado === 'muy_bien',
    texto: (c) =>
      `A ${c.hijo.nombre} le va bárbaro, y eso no pasó solo. Estuvo en los cumpleaños, ` +
      'puso la plata del colegio cuando no sobraba y se perdió negocios grandes por llegar a horario. ' +
      `Si algo hizo bien en toda su vida, ${c.hijo.nombre} es la prueba, y él lo sabe.`,
  },
  {
    id: 'sangre_muy_bien_contraste',
    seccion: 'sangre',
    peso: 6,
    cuando: (c) => c.hijo?.estado === 'muy_bien' && (c.stats.atencion >= 60 || c.causa === 'preso'),
    texto: (c) =>
      `Lo increíble es que a ${c.hijo.nombre} le va bien igual. Con el padre marcado, con la casa ` +
      'llena de gente rara y con los vecinos hablando bajito cuando pasaban. ' +
      'Se ve que alguna vez alguien hizo algo bien de verdad, y por una vez fue él.',
  },
  {
    id: 'sangre_bien',
    seccion: 'sangre',
    peso: 3,
    cuando: (c) => c.hijo?.estado === 'bien',
    texto: (c) =>
      `${c.hijo.nombre} anda bien. No perfecto, pero bien: va al colegio, tiene sus cosas, ` +
      'se ríe. Estuvo lo que pudo, que no fue todo lo que quería pero fue más de lo que le habían dado a él. ' +
      'En esta historia eso ya es haber roto una cadena.',
  },
  {
    id: 'sangre_complicado',
    seccion: 'sangre',
    peso: 3,
    cuando: (c) => c.hijo?.estado === 'complicado',
    texto: (c) =>
      `Con ${c.hijo.nombre} la cosa viene complicada. Faltó a cumpleaños que no se repiten, ` +
      'llegó tarde a cosas que pasaban una sola vez y siempre había un motivo, siempre uno bueno. ' +
      'El pibe no le reclama nada, que es exactamente lo que más le duele.',
  },
  {
    id: 'sangre_complicado_abandono',
    seccion: 'sangre',
    peso: 5,
    cuando: (c) => c.hijo?.estado === 'complicado' && c.tuvo('abandono'),
    texto: (c) =>
      `${c.hijo.nombre} aprendió temprano a no esperarlo. No hubo una sola vez que rompiera nada: ` +
      'fueron veinte veces chiquitas, cada una con su excusa razonable, hasta que un día el pibe ' +
      'dejó de preguntar a qué hora venía. Eso no se arregla con plata y él lo intentó con plata igual.',
  },
  {
    id: 'sangre_mal',
    seccion: 'sangre',
    peso: 4,
    cuando: (c) => c.hijo?.estado === 'mal',
    texto: (c) =>
      `A ${c.hijo.nombre} le va mal y hay un solo responsable. No hizo falta pegarle ni gritarle: ` +
      'alcanzó con no estar, sistemáticamente, durante todos los años en que estar era lo único que hacía falta. ' +
      'El pibe va a contar esta historia distinto, y va a tener razón.',
  },
  {
    id: 'sangre_mal_herencia',
    seccion: 'sangre',
    peso: 6,
    cuando: (c) => c.hijo?.estado === 'mal' && c.hijo.edad >= 12,
    texto: (c) =>
      `${c.hijo.nombre} ya tiene ${c.hijo.edad} y camina igual que él a esa edad. ` +
      'Misma esquina, misma cara, mismo apuro. Lo peor no es lo que le hizo: ' +
      'lo peor es que le enseñó, sin querer, exactamente todo lo que sabía.',
  },
];

// ===========================================================================
// 5. GENTE — el socio
// ===========================================================================

const GENTE = [
  {
    id: 'gente_base',
    seccion: 'gente',
    peso: 0,
    cuando: () => true,
    texto: () =>
      'Nunca tuvo un socio de verdad. Gente alrededor sí, mucha, toda la que quisiera; ' +
      'pero nadie a quien pudiera darle la espalda sin pensarlo. Anduvo solo casi todo el camino.',
  },
  {
    id: 'gente_solo_presentacion',
    seccion: 'gente',
    peso: 1,
    cuando: (c) => c.socio?.momentos?.includes('presentacion') && c.socio.momentos.length === 1,
    texto: (c) =>
      `${c.socio.completo} arrancó con él y estuvo ahí desde el principio. ` +
      'Nunca llegaron a la parte donde se ve de qué está hecho cada uno — ' +
      'la vida se cortó antes, o el camino se abrió y cada uno agarró para su lado sin pelearse.',
  },
  {
    id: 'gente_firme',
    seccion: 'gente',
    peso: 4,
    cuando: (c) => c.socio?.estado === 'firme' || c.socio?.estado === 'retirado',
    texto: (c) =>
      `${c.socio.completo} lo bancó. Y no de palabra: apareció a las dos de la mañana el año en que ` +
      'se le cayó todo, con un bolso y una lista de nombres, sin que se lo pidiera. ' +
      'Después de eso no hubo mucho para hablar. Hay lealtades que se dicen una sola vez y quedan dichas para siempre.',
  },
  {
    id: 'gente_retirado_bien',
    seccion: 'gente',
    peso: 6,
    cuando: (c) => c.socio?.estado === 'retirado',
    texto: (c) =>
      `Cuando ${c.socio.nombre} quiso salirse, lo dejó salir. Le dio su parte completa, ` +
      'los contactos y la puerta abierta, que es lo más caro de las tres cosas. ' +
      'En este rubro casi nadie se va entero, y él hizo que uno se fuera entero. ' +
      'Esa historia todavía se cuenta y le abrió más puertas que cualquier negocio.',
  },
  {
    id: 'gente_ultima',
    seccion: 'gente',
    peso: 6,
    cuando: (c) => c.socio?.estado === 'ultima',
    texto: (c) =>
      `${c.socio.nombre} quería salirse y él le pidió una más. Una sola, la grande, la que no se podía ` +
      'cerrar sin él. Le dijo que sí, porque los tipos como él siempre dicen que sí. ' +
      'Todo lo que pasó después arranca en esa pregunta que no debería haber hecho.',
  },
  {
    id: 'gente_traiciono',
    seccion: 'gente',
    peso: 5,
    cuando: (c) => c.socio?.estado === 'traiciono',
    texto: (c) =>
      `${c.socio.completo} habló. No de golpe: se fue rompiendo de a poco, en cada vez que ` +
      'lo dejaron afuera de una decisión, en cada cuenta que salió mal repartida. ' +
      'Cuando finalmente apareció el daño, ya nadie podía decir con honestidad que no se veía venir.',
  },
  {
    id: 'gente_reconciliado',
    seccion: 'gente',
    peso: 7,
    cuando: (c) => c.socio?.estado === 'reconciliado',
    texto: (c) =>
      `Lo más raro de esta historia es el final de ${c.socio.nombre}: volvió después de años, ` +
      'viejo y flaco, y él lo escuchó. Podría haberle cerrado la puerta y nadie lo hubiera juzgado. ' +
      'Se sentaron a hablar como dos tipos grandes. Algunas cosas se arreglan. No muchas, pero algunas.',
  },
  {
    id: 'gente_cerrado',
    seccion: 'gente',
    peso: 6,
    cuando: (c) => c.socio?.estado === 'cerrado',
    texto: (c) =>
      `${c.socio.nombre} volvió a golpearle la puerta al final, con una propuesta y la cara de siempre. ` +
      'No le abrió. No dijo nada, no gritó, no lo puteó: cerró y siguió. ' +
      'A veces la respuesta más dura que te pueden dar es que no valgas ni una discusión.',
  },
];

// ===========================================================================
// 6. CIERRE — uno por final, con variantes de tono
// ===========================================================================

const CIERRE = [
  {
    id: 'cierre_base',
    seccion: 'cierre',
    peso: 0,
    cuando: () => true,
    texto: (c) =>
      `Así quedó la cosa a los ${c.edad}. Ni tragedia ni epopeya: una vida, con lo que se pudo y lo que no. ` +
      'De todas las historias que se cuentan en el barrio, esta es la que le tocó a él.',
  },

  // --- Leyenda (picantillo) ---
  {
    id: 'cierre_leyenda',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'leyenda',
    texto: (c) =>
      `Ganó el Picantillo de Oro a los ${c.edad} y ahí se terminó la historia, porque arriba de eso ` +
      'no hay nada que contar. Los pibes que recién arrancan cuentan su nombre como se cuenta una amenaza ' +
      'y como se cuenta un sueño, según de qué lado de la mesa estén sentados.',
  },
  {
    id: 'cierre_leyenda_solo',
    seccion: 'cierre',
    peso: 7,
    cuando: (c) => c.finalId === 'leyenda' && (c.socio?.estado === 'traiciono' || !c.hijo),
    texto: (c) =>
      `Llegó a lo más alto que se puede llegar a los ${c.edad}. Y desde arriba de todo, ` +
      'cuando por fin se dio vuelta para ver quién había subido con él, no había nadie. ' +
      'Ganó el Picantillo de Oro. La foto se la sacó solo.',
  },

  // --- Finado (muerte) ---
  {
    id: 'cierre_finado',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'finado',
    texto: (c) =>
      `Se terminó a los ${c.edad}, de golpe, como se terminan estas cosas. ` +
      'Hubo velas en la esquina y una bandera con el apodo pintada a mano. ' +
      'A la semana ya había otro parado en su lugar, que es la única forma de homenaje que reparte la calle.',
  },
  {
    id: 'cierre_finado_hijo',
    seccion: 'cierre',
    peso: 8,
    cuando: (c) => c.finalId === 'finado' && c.hijo,
    texto: (c) =>
      `Se terminó a los ${c.edad}. ${c.hijo.nombre}, que tenía ${c.hijo.edad}, se enteró en el colegio ` +
      'y lo vinieron a buscar antes del recreo. Va a pasar el resto de la vida armando a su viejo ' +
      'con pedazos de lo que le cuenten, y cada uno le va a contar un tipo distinto.',
  },

  // --- Traidor ---
  {
    id: 'cierre_traidor',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'traidor',
    texto: (c) =>
      `Cayó a los ${c.edad} con la causa armada de antemano, porque alguien habló. ` +
      'Lo peor no fue la condena ni el tiempo: fue la lista corta de gente que podría haber sido, ' +
      'y darse cuenta de que en esa lista estaban todos los que quería.',
  },
  {
    id: 'cierre_traidor_socio',
    seccion: 'cierre',
    peso: 8,
    cuando: (c) => c.finalId === 'traidor' && c.socio?.estado === 'traiciono',
    texto: (c) =>
      `Cayó a los ${c.edad} y no hubo que investigar mucho para saber quién había hablado. ` +
      `${c.socio.completo} venía rompiéndose hace años y nadie lo quiso ver, él menos que nadie. ` +
      'Adentro tuvo tiempo de sobra para repasar en qué momento exacto lo perdió.',
  },

  // --- Preso ---
  {
    id: 'cierre_preso',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'preso',
    texto: (c) =>
      `Lo tenían marcado hace rato y a los ${c.edad} se les dio. Entró con todo el peso encima. ` +
      'Afuera la calle siguió andando sin él, que es lo que hace siempre. ' +
      'Le quedaron los recortes, el apodo y una cantidad de tiempo que nadie sabe cómo se usa.',
  },
  {
    id: 'cierre_preso_estudio',
    seccion: 'cierre',
    peso: 7,
    cuando: (c) => c.finalId === 'preso' && c.camino === 'estudiar',
    texto: (c) =>
      `Cayó a los ${c.edad}, con la libreta universitaria en un cajón de la casa de su vieja. ` +
      'Adentro se enteró de que había programa de estudio y se anotó el primer día, ' +
      'porque era lo único que sabía hacer que no dependiera de nadie. ' +
      'De todas las cosas que se llevó puestas, esa fue la única que le quedó entera.',
  },

  // --- Arrepentido ---
  {
    id: 'cierre_arrepentido',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'arrepentido',
    texto: (c) =>
      `Se bajó a los ${c.edad}, cuando todavía había con qué. Lo trataron de cagón y se lo bancó. ` +
      'Hoy tiene un laburo aburrido, duerme de noche y no mira la puerta cuando escucha un motor. ' +
      'Todos los que lo bardearon aquella vez ya no están para poder bardearlo ahora.',
  },

  // --- Capo ---
  {
    id: 'cierre_capo',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'capo',
    texto: (c) =>
      `Se retiró entero a los ${c.edad}, con lo suyo hecho y sin deberle nada a nadie. ` +
      'No lo apadrinó ningún grande: cada metro lo peleó él. ' +
      'Ahora mira desde el balcón y los que mandan todavía preguntan cómo hizo.',
  },
  {
    id: 'cierre_capo_familia',
    seccion: 'cierre',
    peso: 7,
    cuando: (c) => c.finalId === 'capo' && (c.hijo?.estado === 'bien' || c.hijo?.estado === 'muy_bien'),
    texto: (c) =>
      `Se retiró a los ${c.edad} con todo hecho y — esto es lo raro — con la familia entera. ` +
      `${c.hijo.nombre} creció sabiendo quién era el padre y sin tener que elegir entre quererlo y entenderlo. ` +
      'De todo lo que consiguió, salir con eso puesto fue lo más difícil.',
  },

  // --- Fantasma de la frontera ---
  {
    id: 'cierre_fantasma_frontera',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'fantasma_frontera',
    texto: () =>
      'Cruzó y del otro lado se quedó. Nunca volvió a pisar el barrio. ' +
      'Allá es un tipo raro con acento y con plata que nadie sabe de dónde salió; ' +
      'acá quedó el nombre escrito en una pared que ya nadie repinta.',
  },

  // --- Fantasma ---
  {
    id: 'cierre_fantasma',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'fantasma',
    texto: (c) =>
      `${c.mudanzas} mudanzas y ni un solo lugar que fuera suyo. Siempre llegaba de afuera, ` +
      'siempre era el nuevo, siempre se iba antes de que lo conocieran. ' +
      'Pasó por todos lados sin dejar marca en ninguno, y eso también es una manera de elegir.',
  },

  // --- El que la pegó ---
  {
    id: 'cierre_la_pego',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'la_pego',
    texto: () =>
      'Juntó una fortuna sin llegar a mandar en ningún lado. Se llenó los bolsillos y se fue ' +
      'antes de que alguien le pidiera cuentas. Los que se quedaron todavía discuten si fue el más vivo ' +
      'o el más cagón, y la discusión no se va a cerrar nunca.',
  },

  // --- El que zafó ---
  {
    id: 'cierre_zafo',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'zafo',
    texto: (c) =>
      `Terminó con ${c.stats.salud} de salud y respirando, que ya es bastante más de lo que se podía pedir. ` +
      'Se salvó de cosas que a otros los mataron y ni sabe bien cómo. ' +
      'No fue talento ni cabeza: fue culo, y el culo también cuenta en la tabla final.',
  },

  // --- Eterno segundo ---
  {
    id: 'cierre_eterno_segundo',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'eterno_segundo',
    texto: (c) =>
      `Cerró con ${c.ventas} ventas contra las ${c.rival.ventas} de ${c.rival.nombre}. ` +
      'Toda la carrera atrás del mismo tipo, y el tipo nunca aflojó el paso. ' +
      'Fue bueno. El otro fue el que contaron.',
  },
  {
    id: 'cierre_eterno_segundo_terr',
    seccion: 'cierre',
    peso: 7,
    cuando: (c) => c.finalId === 'eterno_segundo' && c.territorioMax >= 2,
    texto: (c) =>
      `Tuvo ${c.territorioMax} territorios, plata y gente, y le va a quedar grabado ` +
      `${c.rival.ventas} a ${c.ventas} igual. Así funciona esto: no importa lo que junte uno, ` +
      'importa el número del otro. Se va a morir haciendo esa cuenta.',
  },

  // --- Curtido ---
  {
    id: 'cierre_curtido',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'curtido',
    texto: (c) =>
      `Llegó a los ${c.edad} sin morirse y sin caer preso, que en esta historia es prácticamente un milagro. ` +
      'Comió palos, perdió gente, se quedó sin nada dos o tres veces y siempre se volvió a parar. ' +
      'Nadie le hizo un monumento pero todos saben que aguantó lo que otros no.',
  },

  // --- Nunca aflojó ---
  {
    id: 'cierre_nunca_aflojo',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'nunca_aflojo',
    texto: (c) =>
      `Nunca se bajó. Ni cuando había plata para irse, ni cuando el cuerpo pedía parar. ` +
      `A los ${c.edad} seguía firme en la misma esquina, con la misma cara. ` +
      'Algunos le dicen aguante. Otros le dicen no saber cuándo parar. Las dos cosas son ciertas.',
  },
  {
    id: 'cierre_nunca_aflojo_roto',
    seccion: 'cierre',
    peso: 7,
    cuando: (c) => c.finalId === 'nunca_aflojo' && c.stats.salud < 40,
    texto: (c) =>
      `A los ${c.edad} seguía ahí, con ${c.stats.salud} de salud y la misma cara de siempre. ` +
      'Ya no podía correr, ya no podía pelear, y seguía saliendo igual todas las mañanas. ' +
      'Hay una palabra para eso y no es coraje, pero desde afuera se le parece bastante.',
  },

  // --- Perdido ---
  {
    id: 'cierre_perdido',
    seccion: 'cierre',
    peso: 4,
    cuando: (c) => c.finalId === 'perdido',
    texto: (c) =>
      `Se fue a los ${c.edad} y casi nadie se enteró. Ni gloria, ni cana, ni tumba: ` +
      'una puerta que se cerró y ya. De vez en cuando alguien pregunta qué fue de él ' +
      'y se hace un silencio corto antes de que cambien de tema.',
  },
];

export const BLOQUES_BIOGRAFIA = [...ORIGEN, ...CAMINO, ...OFICIO, ...SANGRE, ...GENTE, ...CIERRE];

/** El orden en que se leen las secciones en la pantalla final. */
export const SECCIONES_BIOGRAFIA = [
  { id: 'origen', titulo: 'De dónde salió' },
  { id: 'camino', titulo: 'La bifurcación' },
  { id: 'oficio', titulo: 'El oficio' },
  { id: 'sangre', titulo: 'La sangre' },
  { id: 'gente', titulo: 'La gente' },
  { id: 'cierre', titulo: 'Cómo termina' },
];
