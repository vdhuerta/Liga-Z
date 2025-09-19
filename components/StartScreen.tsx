
import React, { useState, useEffect, useCallback } from 'react';
import GameBackground from './GameBackground';
import ArcadeButton from './ArcadeButton';
import GeneralHelpModal from './GeneralHelpModal';
import { EPISODES } from '../episode-data';
import { soundManager } from './soundManager';

interface StartScreenProps {
  onSelectEpisode: (levelIndex: number) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onSelectEpisode }) => {
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Fullscreen logic
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

  const handleToggleEpisode = (index: number) => {
    soundManager.play('menuNavigate');
    setExpandedEpisode(prev => (prev === index ? null : index));
  };

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
      <div className="relative z-10 text-center w-full max-w-2xl">
        <h1 className="font-arcade text-5xl sm:text-6xl md:text-8xl text-yellow-300" style={{ textShadow: '4px 4px 0px #000, 0 0 20px #eab308' }}>
          LIGA-Z
        </h1>
        <h2 className="font-arcade text-base sm:text-lg md:text-2xl mt-2 md:mt-4 text-white" style={{ textShadow: '2px 2px 0px #000' }}>
          Aventura de Enteros
        </h2>

        <div className="mt-10 md:mt-16 w-full flex flex-col items-center gap-4">
          {EPISODES.map((episode, index) => (
            <div key={episode.name} className="w-full">
              <ArcadeButton 
                onClick={() => handleToggleEpisode(index)} 
                color={episode.color} 
                size="lg"
                className={`w-full ${expandedEpisode === index ? 'transform scale-105' : ''}`}
              >
                {episode.shortName}
              </ArcadeButton>

              <div className={`level-container ${expandedEpisode === index ? 'expanded' : ''}`}>
                <div className="bg-black bg-opacity-50 p-4 rounded-lg border-2 border-purple-500">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: episode.levelCount }).map((_, levelNum) => {
                      const levelIndex = episode.startLevelIndex + levelNum;
                      return (
                        <ArcadeButton
                          key={levelIndex}
                          onClick={() => onSelectEpisode(levelIndex)}
                          color="purple"
                          size="md"
                        >
                          {`Nivel ${levelNum + 1}`}
                        </ArcadeButton>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4">
          <ArcadeButton onClick={() => setIsHelpOpen(true)} color="gray" size="md">
            Ayuda
          </ArcadeButton>
        </div>

      </div>
      {isHelpOpen && <GeneralHelpModal onClose={() => setIsHelpOpen(false)} />}
    </div>
  );
};

export default StartScreen;
