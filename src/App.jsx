import { useEffect, useState } from 'react';
import { useJuego } from './store/useJuego.js';
import { vistaPreviaGuardado, borrarPartida } from './core/storage.js';
import { MenuPrincipal } from './ui/pantallas/MenuPrincipal.jsx';
import { Creacion, CartelIntro, CartelPibeMaravilla } from './ui/pantallas/Creacion.jsx';
import { Juego } from './ui/pantallas/Juego.jsx';
import { Mercado } from './ui/pantallas/Mercado.jsx';
import { Estadisticas } from './ui/pantallas/Estadisticas.jsx';
import { Final } from './ui/pantallas/Final.jsx';

export default function App() {
  const { estado, acciones } = useJuego();
  const [pantalla, setPantalla] = useState('menu');
  // A dónde vuelve el botón "Volver" de Estadísticas: se puede llegar tanto
  // desde el menú principal como desde adentro de la partida.
  const [volverDeStats, setVolverDeStats] = useState('juego');
  const [guardado, setGuardado] = useState(() => vistaPreviaGuardado());

  // Si hay una partida en curso al abrir el juego, se carga sola.
  useEffect(() => {
    if (guardado && !guardado.terminada) {
      acciones.cargarGuardado();
      setPantalla('juego');
    }
    // Solo en el arranque: despues la navegacion la maneja el usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const irAlMenu = () => {
    setGuardado(vistaPreviaGuardado());
    setPantalla('menu');
  };

  const empezar = (datos) => {
    acciones.nuevaPartida(datos);
    setPantalla('juego');
  };

  // --- Menú y creación: no hace falta que haya estado cargado ---------------

  if (pantalla === 'menu') {
    return (
      <MenuPrincipal
        guardado={guardado}
        onNueva={() => setPantalla('creacion')}
        onContinuar={() => {
          acciones.cargarGuardado();
          setPantalla('juego');
        }}
        onEstadisticas={() => {
          acciones.cargarGuardado();
          setVolverDeStats('menu');
          setPantalla('estadisticas');
        }}
        onBorrar={() => {
          borrarPartida();
          setGuardado(null);
          acciones.abandonar();
        }}
      />
    );
  }

  if (pantalla === 'creacion') {
    return <Creacion onCrear={empezar} onVolver={irAlMenu} />;
  }

  // --- De acá para abajo hace falta una partida cargada ---------------------

  if (!estado) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-humo">Cargando…</div>
    );
  }

  if (pantalla === 'estadisticas') {
    return (
      <Estadisticas
        estado={estado}
        onVolver={() => (volverDeStats === 'menu' ? irAlMenu() : setPantalla('juego'))}
      />
    );
  }

  if (pantalla === 'mercado') {
    return <Mercado estado={estado} acciones={acciones} onVolver={() => setPantalla('juego')} />;
  }

  // La pantalla de fin de partida reemplaza al juego cuando hay final.
  if (estado.final) {
    return (
      <Final
        estado={estado}
        onNueva={() => setPantalla('creacion')}
        onMenu={irAlMenu}
        onEstadisticas={() => {
          setVolverDeStats('juego');
          setPantalla('estadisticas');
        }}
      />
    );
  }

  return (
    <>
      <Juego
        estado={estado}
        acciones={acciones}
        onMenu={irAlMenu}
        onMercado={() => setPantalla('mercado')}
        onEstadisticas={() => {
          setVolverDeStats('juego');
          setPantalla('estadisticas');
        }}
      />
      {/* Carteles de arranque, de a uno: intro y, si salió el 1%, pibe maravilla. */}
      {estado.carteles?.[0] === 'intro' && (
        <CartelIntro estado={estado} onSeguir={acciones.cerrarCartel} />
      )}
      {estado.carteles?.[0] === 'pibe_maravilla' && (
        <CartelPibeMaravilla estado={estado} onSeguir={acciones.cerrarCartel} />
      )}
    </>
  );
}
