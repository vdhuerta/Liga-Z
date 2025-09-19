
import React, { useState, useEffect, useCallback } from 'react';
import ArcadeButton from './ArcadeButton';
import GameBackground from './GameBackground';

interface WelcomeScreenProps {
  onWatchVideo: () => void;
  onGoToGame: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onWatchVideo, onGoToGame }) => {
  const [isTouch, setIsTouch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
    setIsFullscreen(isFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const element = document.documentElement as any;
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) { // Safari
        element.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) { // Safari
        (document as any).webkitExitFullscreen();
      }
    }
  }, []);
  
  useEffect(() => {
    const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(isTouchDevice());
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans text-white p-4">
      {isTouch && (
          <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-50 p-1 bg-black/50 rounded-lg border-2 border-purple-500 hover:bg-purple-900/50 transition-colors"
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Entrar a pantalla completa'}
          >
              <img
                  src={isFullscreen
                      ? 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_SalirPantallaCompleta.png'
                      : 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_PantallaCompleta.png'
                  }
                  alt={isFullscreen ? 'Salir Pantalla Completa' : 'Entrar Pantalla Completa'}
                  className="w-10 h-10 object-contain"
              />
          </button>
      )}
      <div className="absolute inset-0 z-0">
        <GameBackground />
      </div>
      <div className="relative z-10 w-full max-w-lg md:max-w-2xl lg:max-w-4xl p-4 md:p-8 border-8 rounded-xl bg-gray-200 text-black shadow-2xl animate-pulse-lava-frame max-h-[95vh] overflow-y-auto"
           style={{ borderColor: '#4a2c2a' }}>
        <h1 className="font-arcade text-3xl sm:text-4xl md:text-6xl text-center text-purple-700" style={{ textShadow: '2px 2px 0px #c4b5fd' }}>
          ¡Bienvenido a LIGA-Z!
        </h1>

        <div className="font-arcade text-xs sm:text-sm md:text-base mt-6 text-gray-800 space-y-4 text-left leading-relaxed px-2 md:px-4">
          <p>
            LIGA-Z: Aventura de Enteros es un juego de puzzles de vista cenital. En el rol del héroe ZETA, tu misión es resolver acertijos numéricos en complejos laberintos. Para ello, debes empujar cubos de lava (números positivos) y de hielo (números negativos).
          </p>
          <p>
            La mecánica principal consiste en juntar un cubo positivo y uno negativo del mismo valor para que se neutralicen y desaparezcan, despejando así el camino para avanzar.
          </p>
          <p className="mt-4">
            Para conocer el origen de este conflicto, te invito a revisar el video que narra la historia de los cubos de lava y hielo.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
          <ArcadeButton onClick={onWatchVideo} color="blue" size="md" className="w-full sm:w-auto">
            Ver Video
          </ArcadeButton>
          <ArcadeButton onClick={onGoToGame} color="green" size="md" className="w-full sm:w-auto">
            Ir al Juego
          </ArcadeButton>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
