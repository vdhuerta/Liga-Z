
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Character from './Character';
import Spaceship from './Spaceship';
// FIX: TILE_SIZE is obsolete; tileSize is now passed as a prop for dynamic sizing.
import type { Position, Direction } from '../types';
import { TileType } from '../types';
import { soundManager } from './soundManager';

// --- CONSTANTES DE LA ESCENA ---
const GRID_WIDTH = 25;
const GRID_HEIGHT = 18;
const SHIP_WIDTH = 3; 
const SHIP_HEIGHT = 2; 

const shipPosition = {
  row: Math.floor((GRID_HEIGHT - SHIP_HEIGHT) / 2) - 1,
  col: Math.floor((GRID_WIDTH - SHIP_WIDTH) / 2),
};

const entrancePosition = { row: shipPosition.row + SHIP_HEIGHT + 1, col: shipPosition.col + 1 };

enum SequenceState {
  VICTORY_MESSAGE,
  COCKPIT_MESSAGE,
  ZETA_WALK,
  AWAIT_INPUT,
  DEPARTURE,
}

// --- COMPONENTE TYPEWRITER ---
const Typewriter: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ text, speed = 80, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const onCompleteRef = React.useRef(onComplete);

    useEffect(() => {
        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i > text.length) {
                clearInterval(intervalId);
                if(onCompleteRef.current) {
                    onCompleteRef.current();
                }
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return <span>{displayedText}</span>;
};


// --- PANTALLA DE LA NAVE ---
const CockpitDisplay: React.FC<{ onMissionMessageComplete: () => void, tileSize: number }> = ({ onMissionMessageComplete, tileSize }) => {
    const [showMessage, setShowMessage] = useState(false);
    
    useEffect(() => {
      // Pequeño retraso para que la transición entre mensajes sea suave
      const timer = setTimeout(() => setShowMessage(true), 500);
      return () => clearTimeout(timer);
    }, []);

    return (
        <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 border-4 border-gray-700 rounded-b-lg shadow-2xl z-50 flex"
            style={{ width: `${12 * tileSize}px`, height: `${4 * tileSize}px` }}
        >
            {/* Izquierda: Ventana */}
            <div className="w-1/2 h-full border-r-4 border-gray-700 p-2">
                <div className="w-full h-full starfield animate-star-scroll rounded-md border-2 border-gray-600 shadow-inner"></div>
            </div>

            {/* Derecha: Panel de Control */}
            <div className="w-1/2 h-full p-2 grid grid-cols-6 grid-rows-3 gap-2">
                {/* Radar */}
                <div className="col-span-2 row-span-2 bg-black rounded-full border-2 border-green-500/50 relative overflow-hidden flex items-center justify-center shadow-inner shadow-black">
                    <div className="absolute inset-0 opacity-20">
                        <div className="w-full h-1/2 border-b border-dashed border-green-500"></div>
                        <div className="h-full w-1/2 border-r border-dashed border-green-500 absolute top-0 left-0"></div>
                    </div>
                    <div className="absolute w-full h-full animate-radar-sweep" style={{ transformOrigin: '50% 50%' }}>
                        <div className="w-1/2 h-full bg-gradient-to-r from-green-500/50 to-transparent"></div>
                    </div>
                </div>

                {/* Pantallas pequeñas */}
                <div className="col-span-4 bg-black border border-sky-400/50 rounded p-1 text-sky-300 font-arcade text-[7px] leading-tight animate-screen-flicker">
                    {showMessage ? (
                        <p className="text-green-400 text-[10px] leading-tight">
                             <Typewriter text="Sube a la nave para tu siguiente misión" speed={60} onComplete={onMissionMessageComplete} />
                        </p>
                    ) : (
                        <>
                            <p>ESTADO: EN LÍNEA</p>
                            <p>NAVEGACIÓN: ESPERA</p>
                            <p>ENERGÍA: 100%</p>
                        </>
                    )}
                </div>
                <div className="col-span-2 bg-black border border-purple-400/50 rounded p-1 text-purple-300 font-arcade text-[7px] leading-tight">
                    <p>OBJETIVO:</p>
                    <p>LIGA-Z HQ</p>
                </div>
                
                <button className="bg-red-600 rounded-sm animate-pulse-red border-b-2 border-red-900"></button>
                <button className="bg-yellow-500 rounded-sm animate-pulse-yellow border-b-2 border-yellow-800"></button>
                <button className="bg-blue-600 rounded-sm animate-pulse-blue border-b-2 border-blue-900"></button>
                <button className="bg-green-600 rounded-sm animate-pulse border-b-2 border-green-900"></button>
                <button className="bg-gray-600 rounded-full border-b-2 border-gray-800"></button>
                <button className="bg-purple-600 rounded-sm animate-pulse-inverter border-b-2 border-purple-900"></button>
            </div>
        </div>
    );
};


// --- COMPONENTES VISUALES ---
const WallTile: React.FC = () => (
  <div className="bg-gray-800 w-full h-full" style={{ imageRendering: 'pixelated' }}>
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <g fill="#374151" stroke="#1f2937" strokeWidth="1.5">
        <path d="M 8,12 C 4,12 4,18 8,18 S 12,18 12,14 C 12,10 8,10 8,12 Z" /><polygon points="52,8 58,10 56,16 50,14" /><path d="M 58,50 C 62,50 62,56 58,56 S 54,56 54,52 C 54,48 58,48 58,50 Z" /><polygon points="5,58 12,55 8,60" /><polygon points="8,30 14,28 12,36 6,34" /><path d="M 50,25 C 54,25 54,31 50,31 S 46,31 46,27 C 46,23 50,23 50,25 Z" /><polygon points="25,58 32,55 28,60" />
      </g>
      <polygon points="10,50 20,20 45,15 55,35 40,55 15,55" fill="#4b5563" stroke="#1f2937" strokeWidth="2"/><polygon points="20,20 45,15 40,25 25,25" fill="#6b7280"/><polygon points="15,55 40,55 35,45 20,45" fill="#374151"/><polygon points="22,22 28,20 26,25 22,27" fill="#9ca3af"/>
    </svg>
  </div>
);

// --- COMPONENTE PRINCIPAL DE LA ESCENA ---
// FIX: Add tileSize prop for dynamic sizing.
interface FinalSceneProps { onComplete: () => void; tileSize: number; }

const FinalScene: React.FC<FinalSceneProps> = ({ onComplete, tileSize }) => {
  const [playerPosition, setPlayerPosition] = useState({ row: GRID_HEIGHT - 2, col: Math.floor(GRID_WIDTH / 2) });
  const [facingDirection, setFacingDirection] = useState<Direction>('up');
  const [isEntering, setIsEntering] = useState(false);
  const [sequenceState, setSequenceState] = useState<SequenceState>(SequenceState.VICTORY_MESSAGE);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const finalMessage = "Has demostrado maestría sobre la dualidad. Has comprendido el Cero. El equilibrio ha sido restaurado";

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

  // Controla la secuencia de eventos
  useEffect(() => {
    // 1. Mostrar mensaje de victoria
    if (sequenceState === SequenceState.VICTORY_MESSAGE) {
      const timer = setTimeout(() => { setIsMessageVisible(true); soundManager.play('puzzleSuccess'); }, 1000);
      return () => clearTimeout(timer);
    }
    // 2. Caminar hacia la nave
    if (sequenceState === SequenceState.ZETA_WALK) {
      setFacingDirection('up');
      const targetRow = entrancePosition.row;
      const walkInterval = setInterval(() => {
        setPlayerPosition(prev => {
          if (prev.row <= targetRow) {
            clearInterval(walkInterval);
            setIsDoorOpen(true);
            soundManager.play('laserDoorOpen');
            setSequenceState(SequenceState.AWAIT_INPUT);
            return prev;
          }
          return { ...prev, row: prev.row - 1 };
        });
      }, 150);
      return () => clearInterval(walkInterval);
    }
     // 4. Despegue
    if (sequenceState === SequenceState.DEPARTURE) {
        soundManager.play('shipTakeoff', { trackable: true, volume: 0.5 });
        const departureTimer = setTimeout(onComplete, 4000); // Duración de la animación de despegue
        return () => clearTimeout(departureTimer);
    }
  }, [sequenceState, onComplete]);

  useEffect(() => {
    if (isTypingComplete) {
        const timer = setTimeout(() => {
            setIsMessageVisible(false);
            setSequenceState(SequenceState.COCKPIT_MESSAGE);
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [isTypingComplete]);

  const grid = useMemo(() => Array(GRID_HEIGHT).fill(0).map((_, r) => Array(GRID_WIDTH).fill(0).map((_, c) => (r === 0 || r === GRID_HEIGHT - 1 || c === 0 || c === GRID_WIDTH - 1) ? TileType.WALL : TileType.FLOOR)), []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (sequenceState !== SequenceState.AWAIT_INPUT) return;
    if (e.key === ' ' && playerPosition.row === entrancePosition.row && playerPosition.col === entrancePosition.col) {
      e.preventDefault();
      soundManager.play('laserDoorOpen'); // Sonido de cierre
      setIsEntering(true);
      setIsDoorOpen(false);
      setTimeout(() => setSequenceState(SequenceState.DEPARTURE), 1000);
    }
  }, [sequenceState, playerPosition]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`fixed inset-0 bg-gray-900 flex items-center justify-center font-arcade overflow-hidden`}>
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
      {sequenceState >= SequenceState.COCKPIT_MESSAGE && <CockpitDisplay onMissionMessageComplete={() => setSequenceState(SequenceState.ZETA_WALK)} tileSize={tileSize} />}
      <div
          className="relative"
          style={{
              // FIX: Use the tileSize prop for dynamic sizing.
              width: GRID_WIDTH * tileSize,
              height: GRID_HEIGHT * tileSize,
          }}
      >
        {grid.map((row, r) => row.map((_, c) => (
          // FIX: Use the tileSize prop for dynamic sizing.
          <div key={`${r}-${c}`} style={{ position: 'absolute', top: r * tileSize, left: c * tileSize, width: tileSize, height: tileSize }}>
            {grid[r][c] === TileType.WALL ? <WallTile /> : <div className="tile-floor w-full h-full" />}
          </div>
        )))}
        {/* FIX: Pass tileSize prop to Spaceship. */}
        <Spaceship isDoorOpen={isDoorOpen} isDeparting={sequenceState === SequenceState.DEPARTURE} tileSize={tileSize} />
        {/* FIX: Pass tileSize prop to Character to resolve rendering error. */}
        {!isEntering && <Character position={playerPosition} facingDirection={facingDirection} tileSize={tileSize} />}
      </div>
      <div 
           className="absolute left-1/2 -translate-x-1/2 w-full max-w-lg p-4 bg-black bg-opacity-75 border-2 border-yellow-400 rounded-lg shadow-2xl text-center transition-opacity duration-500"
           // FIX: Use the tileSize prop for dynamic sizing.
           style={{ top: `${(entrancePosition.row + 1) * tileSize}px`, opacity: isMessageVisible ? 1 : 0 }}
      >
          <p className="text-yellow-300 text-lg leading-relaxed" style={{ textShadow: '1px 1px 2px #000' }}>
               <Typewriter text={finalMessage} onComplete={() => setIsTypingComplete(true)} />
          </p>
      </div>
    </div>
  );
};

export default FinalScene;
