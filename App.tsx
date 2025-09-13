
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GameBoard from './components/GameBoard';
import Modal from './components/Modal';
import HelpModal from './components/HelpModal';
import GameBackground from './components/GameBackground';
import StoryIntro from './components/StoryIntro';
import IceCavern from './components/IceCavern';
import StartScreen from './components/StartScreen';
import VideoIntro from './components/VideoIntro';
import ArcadeButton from './components/ArcadeButton';
import WelcomeScreen from './components/WelcomeScreen';
import LavaBurstEffect from './components/LavaBurstEffect';
import EpisodeWelcomeModal from './components/EpisodeWelcomeModal';
import GameOverModal from './components/GameOverModal';
import FinalScene from './components/FinalScene';
import TouchControls from './components/TouchControls';
import { calculateTileSize, LEVEL_SOLUTIONS, VIEWPORT_HEIGHT_TILES, VIEWPORT_WIDTH_TILES } from './constants';
import { LEVELS } from './levels';
import { EPISODES, getNextLevelIndex } from './episode-data';
import type { Position, Cube, Prize, Key, Direction, LevelData, EvaporationEffectData, InteractiveRock, Fireball, HeartbreakEffectData, AssemblerGoal } from './types';
import { TileType } from './types';
import { soundManager } from './components/soundManager';

const MuteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const UnmuteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9 9 0 0119 10a9 9 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7 7 0 0017 10a7 7 0 00-2.343-5.657 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5 5 0 0115 10a5 5 0 01-1.757 3.536 1 1 0 01-1.415-1.414A3 3 0 0013 10a3 3 0 00-1.172-2.424 1 1 0 010-1.415z" clipRule="evenodd" />
    </svg>
);


const StatusBar: React.FC<{ lives: number; score: number; levelTitle: string; onHelp: () => void; levelIndex: number; isMuted: boolean; onToggleMute: () => void; }> = ({ lives, score, levelTitle, onHelp, levelIndex, isMuted, onToggleMute }) => {
  return (
    <div className="text-white p-1 md:p-2 border-t-4 border-purple-500 font-arcade text-[7px] md:text-sm h-[30%] md:h-auto">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-4">
          <span>VIDAS: <span className="text-yellow-400">{lives}</span></span>
          <span>PUNTAJE: <span className="text-yellow-400">{score.toString().padStart(6, '0')}</span></span>
        </div>
        <div className="flex gap-4 items-center">
           <span>{levelTitle}</span>
           <button onClick={onHelp} className="bg-yellow-400 text-black px-2 py-1 text-xs rounded-sm hover:bg-yellow-300 transition-colors">?</button>
           <button onClick={onToggleMute} className="bg-purple-600 text-white p-1 rounded-sm hover:bg-purple-500 transition-colors">
             {isMuted ? <MuteIcon /> : <UnmuteIcon />}
           </button>
        </div>
      </div>
    </div>
  );
};


type GameState = 'playing' | 'won' | 'gameOver';
type Scene = 'videoIntro' | 'welcome' | 'start' | 'intro' | 'iceCavern' | 'game' | 'finalScene';

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<Scene>('welcome');
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [level, setLevel] = useState<LevelData>(() => LEVELS[currentLevelIndex]);
  const [playerPosition, setPlayerPosition] = useState<Position>(() => level.playerStart);
  const [cubes, setCubes] = useState<Cube[]>(() => 
    level.cubes.map(c => ({...c, status: 'active'}))
  );
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [levelPhase, setLevelPhase] = useState(1);
  const [facingDirection, setFacingDirection] = useState<Direction>('up');
  
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [evaporationEffects, setEvaporationEffects] = useState<EvaporationEffectData[]>([]);
  const [prizeEffects, setPrizeEffects] = useState<EvaporationEffectData[]>([]);
  const [zeroEffects, setZeroEffects] = useState<EvaporationEffectData[]>([]);
  const [heartbreakEffects, setHeartbreakEffects] = useState<HeartbreakEffectData[]>([]);

  const [slotStates, setSlotStates] = useState<Record<string, 'empty' | 'correct' | 'incorrect'>>({});
  const [logicGateStates, setLogicGateStates] = useState<Record<string, boolean>>({});
  const [absoluteDoorStates, setAbsoluteDoorStates] = useState<Record<string, boolean>>({});
  const [balanceState, setBalanceState] = useState<'level' | 'A_down' | 'B_down'>('level');
  const [balanceSums, setBalanceSums] = useState({ a: 0, b: 0 });
  const [mobilePlatformUp, setMobilePlatformUp] = useState(false);
  const [isBalanceDoorOpen, setIsBalanceDoorOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [hintMessage, setHintMessage] = useState<{ text: string, id: number } | null>(null);
  
  const [interactiveRocks, setInteractiveRocks] = useState<InteractiveRock[]>([]);

  // E3-N2 State
  const [numericDepositStates, setNumericDepositStates] = useState<Record<string, { current: number; target: number }>>({});
  const [logicCalibratorStates, setLogicCalibratorStates] = useState<Record<string, { current: number; isCorrect: boolean }>>({});
  const [convertingCubeIds, setConvertingCubeIds] = useState<Set<number>>(new Set());
  
  // State for level transitions
  const [preppingTransition, setPreppingTransition] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextLevelData, setNextLevelData] = useState<LevelData | null>(null);
  const [showCongratsMessage, setShowCongratsMessage] = useState(false);
  const [showEpisodeWelcome, setShowEpisodeWelcome] = useState<{name: string, count: number} | null>(null);

  // E3-N3 Fireballs
  const [fireballs, setFireballs] = useState<Fireball[]>([]);
  const [gameOverMessage, setGameOverMessage] = useState<string>('');
  
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  // State for touch controls and responsive layout
  const [isTouch, setIsTouch] = useState(false);
  const [tileSize, setTileSize] = useState(() => calculateTileSize(isTouchDevice()));
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State for panning
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetAtStartRef = useRef({ x: 0, y: 0 });

  const nextCubeId = useRef(1000); // Start high to avoid collision with level-defined IDs
  const rockSpawnInterval = useRef<number | null>(null);
  const spawnRockFnRef = useRef<(() => void) | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const scoreAtLevelStart = useRef(score);

  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const prevLevelPhase = useRef(levelPhase);
  const prevLogicGateStates = useRef(logicGateStates);
  const prevAbsoluteDoorStates = useRef(absoluteDoorStates);
  const prevIsBalanceDoorOpen = useRef(isBalanceDoorOpen);
  const prevLives = useRef(lives);
  const prevNumericDepositStates = useRef(numericDepositStates);
  const prevLogicCalibratorStates = useRef(logicCalibratorStates);

  // Effect for detecting touch device and handling resize
  useEffect(() => {
    const isTouch = isTouchDevice();
    setIsTouch(isTouch);
    
    const handleResize = () => {
        setTileSize(calculateTileSize(isTouch));
    };
    handleResize(); // Llamada inicial para establecer el tamaño correcto

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      return () => {
          document.removeEventListener('fullscreenchange', handleFullscreenChange);
          document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      };
  }, [handleFullscreenChange]);

  useEffect(() => {
    soundManager.preload();
  }, []);

  const handleToggleMute = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.getIsMuted());
  };
  
  useEffect(() => {
    soundManager.stopAll();
    switch (currentScene) {
      case 'start':
        soundManager.play('menuMusic', { loop: true, volume: 0.08 });
        break;
      case 'intro':
        soundManager.play('prologueAmbience', { loop: true });
        break;
      case 'iceCavern':
        soundManager.play('iceCavernAmbience', { loop: true });
        break;
      case 'game':
        soundManager.play('gameMusic', { loop: true, volume: 0.08 });
        break;
    }
  }, [currentScene, isMuted]);

  const loadLevel = useCallback((index: number) => {
    // Save score at the beginning of the level
    scoreAtLevelStart.current = scoreRef.current;

    // Show welcome screen for the first level of an episode
    const episodeForNewLevel = EPISODES.find(ep => ep.startLevelIndex === index);
    if (episodeForNewLevel && index > currentLevelIndex) { // Only show on forward progress
        setShowEpisodeWelcome({ name: episodeForNewLevel.name, count: episodeForNewLevel.levelCount });
    }
    soundManager.play('levelStart');

    const newLevel = LEVELS[index];
    setCurrentLevelIndex(index);
    setLevel(newLevel);
    setPlayerPosition(newLevel.playerStart);
    setCubes(newLevel.cubes.map(c => ({ ...c, status: 'active' })));
    setPrizes(newLevel.prizes ? newLevel.prizes.map(p => ({ ...p, status: 'active' })) : []);
    setKeys(newLevel.key ? [{...newLevel.key, status: 'active'}] : []);
    setGameState('playing');
    setLevelPhase(1);
    setFacingDirection('up');
    setEvaporationEffects([]);
    setZeroEffects([]);
    setPrizeEffects([]);
    setHeartbreakEffects([]);
    setFeedbackMessage('');
    setHintMessage(null);
    setLogicGateStates({});
    setAbsoluteDoorStates({});
    setBalanceState('level');
    setBalanceSums({ a: 0, b: 0 });
    setMobilePlatformUp(false);
    setIsBalanceDoorOpen(false);
    setIsHelpModalOpen(false);
    setInteractiveRocks([]);
    setNumericDepositStates({});
    setLogicCalibratorStates({});
    setConvertingCubeIds(new Set());
    setFireballs([]);
    setGameOverMessage('');
    setPanOffset({ x: 0, y: 0 }); // Reset pan on level change

    // Reset transition states
    setPreppingTransition(false);
    setIsTransitioning(false);
    setNextLevelData(null);
    setShowCongratsMessage(false);

    // Nivel 2-1 (ahora índice 4)
    if (index === 4) {
      const initialSlots: Record<string, 'empty' | 'correct' | 'incorrect'> = {};
      const solution = LEVEL_SOLUTIONS[4];
      if (solution) {
        for (const key in solution) {
          initialSlots[key] = 'empty';
        }
      }
      setSlotStates(initialSlots);
    } else {
      setSlotStates({});
    }
  }, [currentLevelIndex]);
  
  const handlePlayAgain = useCallback(() => {
    const nextLevelIndex = 0;
    setScore(0);
    if (nextLevelIndex < LEVELS.length) {
      loadLevel(nextLevelIndex);
    } else {
      setLives(3);
      setCurrentScene('start');
    }
  }, [loadLevel]);

  const handleGameReset = useCallback(() => {
    setScore(0);
    setLives(3);
    setCurrentScene('welcome');
    soundManager.stopAll();
  }, []);

  const handleSelectEpisode = (index: number) => {
    setScore(0);
    loadLevel(index);
    if (index === 0) {
      setCurrentScene('intro');
    } else {
      setCurrentScene('game');
    }
  };
  
  const getCubeAt = useCallback((pos: Position): Cube | undefined => {
    return cubes.find(c => c.status === 'active' && c.position.row === pos.row && c.position.col === pos.col);
  }, [cubes]);

  const isObstacle = useCallback((pos: Position): boolean => {
    if (!pos || pos.row < 0 || pos.row >= level.grid.length || pos.col < 0 || pos.col >= level.grid[0].length) {
        return true;
    }
    const tile = level.grid[pos.row][pos.col];
    if (!tile || tile === TileType.WALL || tile === TileType.DISPENSER_ICE || tile === TileType.DISPENSER_LAVA) return true;
    if (tile === TileType.DOOR_STAGE_1 && levelPhase <= 1) return true;
    if (tile === TileType.DOOR_STAGE_2 && levelPhase <= 2) return true;
    if (tile === TileType.DOOR_ABS) {
      const doorKey = `${pos.row}-${pos.col}`;
      if (!absoluteDoorStates[doorKey]) return true;
    }

    // E2-3: La meta (GOAL) es un obstáculo hasta que se resuelven los puzzles finales.
    if (currentLevelIndex === 6 && tile === TileType.GOAL && !logicGateStates['main_gate']) {
      return true;
    }
    
    // Check for landed interactive rocks
    const isLandedRock = interactiveRocks.some(r => 
        r.status === 'landed' && 
        r.path.length > 0 && 
        r.path[r.path.length - 1].row === pos.row && 
        r.path[r.path.length - 1].col === pos.col
    );
    if (isLandedRock) return true;
    
    // Episodio 3
    if (tile === TileType.DOOR_STAGE_3 && !logicGateStates['main_gate']) return true;
    if (tile === TileType.LOGIC_GATE && !logicGateStates['main_gate']) return true;
    if (tile === TileType.SECRET_CHAMBER_GATE && !logicGateStates['secret_chamber_gate']) return true;
    if (tile === TileType.MOBILE_PLATFORM && !mobilePlatformUp) return true;
    if (tile === TileType.BALANCE_DOOR && !isBalanceDoorOpen) return true;
    return false;
  }, [level.grid, levelPhase, logicGateStates, mobilePlatformUp, isBalanceDoorOpen, absoluteDoorStates, interactiveRocks, currentLevelIndex]);


  const getPrizeAt = useCallback((pos: Position): Prize | undefined => {
    return prizes.find(p => p.status === 'active' && p.position.row === pos.row && p.position.col === pos.col);
  }, [prizes]);

  const getKeyAt = useCallback((pos: Position): Key | undefined => {
    return keys.find(k => k.status === 'active' && k.position.row === pos.row && k.position.col === pos.col);
  }, [keys]);

  const moveCube = useCallback((cubeId: number, newPos: Position) => {
    setCubes(prev => prev.map(c => c.id === cubeId ? { ...c, position: newPos } : c));
  }, []);

  const neutralizeCubes = useCallback((cube1: Cube, cube2: Cube) => {
    soundManager.play('cubeNeutralize');
    setScore(s => s + (Math.abs(cube1.value) * 100));
    const effectPos = cube2.position;
    setEvaporationEffects(prev => [...prev, { id: Date.now(), position: effectPos }]);
    setZeroEffects(prev => [...prev, { id: Date.now() + 1, position: effectPos }]);
    setCubes(prev => prev.map(c => (c.id === cube1.id || c.id === cube2.id) ? { ...c, status: 'evaporating' } : c));
    setTimeout(() => setCubes(prev => prev.filter(c => c.id !== cube1.id && c.id !== cube2.id)), 300);
  }, []);

  const handlePlayerMove = useCallback((dr: number, dc: number) => {
    const p_next = { row: playerPosition.row + dr, col: playerPosition.col + dc };
    if (isObstacle(p_next)) return;
    const cubeAtNext = getCubeAt(p_next);
    if (!cubeAtNext) {
      setPlayerPosition(p_next);
      return;
    }
    if ((currentLevelIndex === 4) && cubeAtNext.value === 0) return;

    const c_next = { row: p_next.row + dr, col: p_next.col + dc };
    if (isObstacle(c_next)) return;
    const otherCubeAtDest = getCubeAt(c_next);

    if (otherCubeAtDest) {
      if (currentLevelIndex <= 3 && cubeAtNext.value + otherCubeAtDest.value === 0) {
        neutralizeCubes(cubeAtNext, otherCubeAtDest);
        setPlayerPosition(p_next);
      }
      return;
    }
    moveCube(cubeAtNext.id, c_next);
    setPlayerPosition(p_next);
    
    const destTile = level.grid[c_next.row]?.[c_next.col];
    
    const slotTiles = new Set([
        TileType.SLOT_POS, TileType.SLOT_NEG, TileType.PLATE_ABS,
        TileType.COMPARISON_SLOT_A, TileType.COMPARISON_SLOT_B,
        TileType.SCANNER_PLATE, TileType.SYNTH_SLOT_A, TileType.SYNTH_SLOT_B,
        TileType.NUMERIC_DEPOSIT, TileType.LOGIC_CALIBRATOR,
    ]);

    if (destTile && slotTiles.has(destTile)) {
        soundManager.play('cubeInSlot');
    }
    
    if (destTile === TileType.INVERTER) {
      soundManager.play('inverter');
      setTimeout(() => {
        setCubes(prevCubes => 
          prevCubes.map(c => {
            if (c.id === cubeAtNext.id) {
              return {
                ...c,
                value: -c.value,
                type: c.type === 'ice' ? 'lava' : 'ice',
              };
            }
            return c;
          })
        );
        setFeedbackMessage('¡Polaridad invertida!');
        setTimeout(() => setFeedbackMessage(''), 1500);
      }, 100);
    }
    
  }, [playerPosition, isObstacle, getCubeAt, currentLevelIndex, moveCube, neutralizeCubes, level.grid]);

  const handleRebound = useCallback(() => {
    const playerAdjacentOffsets = [ { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 } ];
    const cubeAdjacentOffsets = [ { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 } ];

    for (const playerOffset of playerAdjacentOffsets) {
        const cubePos = { row: playerPosition.row + playerOffset.dr, col: playerPosition.col + playerOffset.dc };
        const cubeToRebound = getCubeAt(cubePos);
        if (!cubeToRebound || (currentLevelIndex === 4 && cubeToRebound.value === 0)) continue;

        let isStuck = false;
        for (const cubeOffset of cubeAdjacentOffsets) {
            const posToCheck = { row: cubeToRebound.position.row + cubeOffset.dr, col: cubeToRebound.position.col + cubeOffset.dc };
            if (posToCheck.row === playerPosition.row && posToCheck.col === playerPosition.col) continue;
            if (isObstacle(posToCheck) || getCubeAt(posToCheck)) {
                isStuck = true;
                break;
            }
        }
        if (!isStuck) continue;

        const reboundDestPos = { row: playerPosition.row - playerOffset.dr, col: playerPosition.col - playerOffset.dc };
        const isDestinationFree = !isObstacle(reboundDestPos) && !getCubeAt(reboundDestPos);

        if (isStuck && isDestinationFree) {
            soundManager.play('rebound');
            moveCube(cubeToRebound.id, reboundDestPos);
            return;
        }
    }
  }, [playerPosition, getCubeAt, isObstacle, moveCube, currentLevelIndex]);

  const secretDoorPositions = useMemo(() => {
      if (currentLevelIndex === 11) { // Nivel 3-4, Ensamblador
          return [
              { row: 42, col: 19, room: 1 }, // Sala 1 (abajo)
              { row: 27, col: 19, room: 2 }, // Sala 2 (medio)
              { row: 7, col: 19, room: 3 }, // Sala 3 (arriba)
          ];
      }
      return [];
  }, [currentLevelIndex]);

  const handleInteraction = useCallback(() => {
    if (secretDoorPositions.length > 0) {
        for (const door of secretDoorPositions) {
            // Check if player is to the left of the door on the right wall
            if (playerPosition.row === door.row && playerPosition.col === door.col - 1) {
                let message = '';
                if (door.room === 1) { // Sala 1
                    message = "Solución: Coloca 2 cubos de Hielo [-1] y 1 cubo de Lava [+1] en cualquiera de las 10 ranuras.\n(-1) + (-1) + (+1) = -1 (Suma correcta)\nSe usan 3 cubos en total (Cantidad correcta)";
                } else if (door.room === 2) { // Sala 2
                    message = "Solución: Necesitas 5 cubos de Hielo [-1]. Una forma de colocarlos es:\nFila Superior: Coloca 3 cubos de Hielo [-1] (p. ej., en las columnas 1, 2 y 4). La suma es -3 (impar).\nFila Inferior: Coloca los 2 cubos de Hielo [-1] restantes (p. ej., en las columnas 1 y 2).\nColumna del Medio (Columna 3): Déjala vacía. La suma es 0 (par).\nSe usan 5 cubos en total (más de 4).\nLa suma total es -5.";
                } else if (door.room === 3) { // Sala 3
                    message = `Una posible solución visual (L=Lava, H=Hielo, _=Vacío):\n
      C1  C2  C3  C4  C5   SUMA
Fila Sup:  L   H   H   _   H    -2 ✅
Fila Inf:  _   H   H   H   H    -4 ✅

Cond Col 1 > 0 ✅
Cond Col 5 < 0 ✅`;
                }
                
                if (message) {
                    soundManager.play('rockEmitter'); // Sound for revealing hint
                    setHintMessage({ text: message, id: Date.now() });
                    // Hide message after 15 seconds
                    setTimeout(() => setHintMessage(null), 15000);
                    return; // Don't perform rebound action
                }
            }
        }
    }
    handleRebound();
  }, [handleRebound, playerPosition, secretDoorPositions]);

  const handleTouchMove = useCallback((direction: Direction) => {
    if (currentScene !== 'game' || gameState !== 'playing' || isHelpModalOpen || isTransitioning || preppingTransition || showEpisodeWelcome || isPanning) return;
    setFacingDirection(direction);
    switch (direction) {
      case 'up': handlePlayerMove(-1, 0); break;
      case 'down': handlePlayerMove(1, 0); break;
      case 'left': handlePlayerMove(0, -1); break;
      case 'right': handlePlayerMove(0, 1); break;
    }
  }, [currentScene, gameState, handlePlayerMove, isHelpModalOpen, isTransitioning, preppingTransition, showEpisodeWelcome, isPanning]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (currentScene !== 'game' || gameState !== 'playing' || isHelpModalOpen || isTransitioning || preppingTransition || showEpisodeWelcome || isPanning) return;

    let direction: Direction | null = null;
    switch (e.key) {
      case 'ArrowUp': direction = 'up'; handlePlayerMove(-1, 0); break;
      case 'ArrowDown': direction = 'down'; handlePlayerMove(1, 0); break;
      case 'ArrowLeft': direction = 'left'; handlePlayerMove(0, -1); break;
      case 'ArrowRight': direction = 'right'; handlePlayerMove(0, 1); break;
      case ' ': e.preventDefault(); handleInteraction(); break;
      default: return;
    }
    if (direction) setFacingDirection(direction);
  }, [currentScene, gameState, handlePlayerMove, handleInteraction, isHelpModalOpen, isTransitioning, preppingTransition, showEpisodeWelcome, isPanning]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Developer shortcut to final scene
  useEffect(() => {
    const handleDevShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        setCurrentScene('finalScene');
      }
    };
    window.addEventListener('keydown', handleDevShortcut);
    return () => {
      window.removeEventListener('keydown', handleDevShortcut);
    };
  }, []);

  // Level progression logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    const activeCubes = cubes.filter(c => c.status === 'active');

    if (currentLevelIndex === 0) { // E1 - N1 (Procedural)
      const ALTO_SALA = 14;
      const filaDivisoria1 = (1 * (ALTO_SALA + 1)) - 1; // Divisor entre sala 2 y 3 (fila 14)
      const filaDivisoria2 = (2 * (ALTO_SALA + 1)) - 1; // Divisor entre sala 1 y 2 (fila 29)

      const sala3_despejada = !activeCubes.some(c => c.position.row > filaDivisoria2);
      const sala2_despejada = !activeCubes.some(c => c.position.row > filaDivisoria1 && c.position.row <= filaDivisoria2);

      if (sala3_despejada && sala2_despejada) {
        if (levelPhase < 3) setLevelPhase(3);
      } else if (sala3_despejada) {
        if (levelPhase < 2) setLevelPhase(2);
      }
    } else if (currentLevelIndex === 1) { // E1 - N2
      const activeCubeIds = new Set(activeCubes.map(c => c.id));
      const phase1CubesCleared = [11, 12].every(id => !activeCubeIds.has(id));
      const phase2CubesCleared = [13, 14, 15, 16].every(id => !activeCubeIds.has(id));

      if (phase1CubesCleared && phase2CubesCleared) {
          if (levelPhase < 3) setLevelPhase(3);
      } else if (phase1CubesCleared) {
          if (levelPhase < 2) setLevelPhase(2);
      }
    } else if (currentLevelIndex === 2) { // E1 - N3
        const activeCubeIds = new Set(activeCubes.map(c => c.id));
        const phase1CubesCleared = [21, 22].every(id => !activeCubeIds.has(id));
        const phase2CubesCleared = [23, 24, 25, 26, 27, 28].every(id => !activeCubeIds.has(id));
  
        if (phase1CubesCleared && phase2CubesCleared) {
            if (levelPhase < 3) setLevelPhase(3);
        } else if (phase1CubesCleared) {
            if (levelPhase < 2) setLevelPhase(2);
        }
    }
  }, [cubes, currentLevelIndex, gameState, levelPhase]);

  const checkSolution = useCallback(() => {
    if (currentLevelIndex !== 4) return;
    const solution = LEVEL_SOLUTIONS[4];
    if (!solution) return;
    const newSlotStates: Record<string, 'empty' | 'correct' | 'incorrect'> = {};
    let incorrectPlacement = false;
    for (const key in solution) {
      const [row, col] = key.split('-').map(Number);
      const expectedValue = solution[key];
      const currentCube = cubes.find(cube => cube.position.row === row && cube.position.col === col && cube.status === 'active');
      if (currentCube) {
        if (currentCube.value === expectedValue) newSlotStates[key] = 'correct';
        else {
          newSlotStates[key] = 'incorrect';
          if (!incorrectPlacement) {
            incorrectPlacement = true;
            soundManager.play('puzzleFail');
            setFeedbackMessage(`¡Error! ${currentCube.value > 0 ? `+${currentCube.value}`: currentCube.value} está en la casilla de ${expectedValue > 0 ? `+${expectedValue}` : expectedValue}.`);
          }
        }
      } else newSlotStates[key] = 'empty';
    }
    setSlotStates(newSlotStates);
    if (incorrectPlacement) setTimeout(() => setFeedbackMessage(''), 2500);
    else if (feedbackMessage && !incorrectPlacement) setFeedbackMessage('');
  }, [currentLevelIndex, cubes, feedbackMessage]);

  useEffect(() => {
    if (currentLevelIndex === 4 && gameState === 'playing') checkSolution();
  }, [cubes, currentLevelIndex, gameState, checkSolution]);

  // Level 2-1 Phase Progression
  useEffect(() => {
    if (currentLevelIndex !== 4 || gameState !== 'playing') return;
    const solution = LEVEL_SOLUTIONS[4];
    if (!solution) return;

    const ALTO_SALA = 14;
    const filaDivisoriaPuerta2 = (1 * (ALTO_SALA + 1)) - 1; // Fila 14
    const filaDivisoriaPuerta1 = (2 * (ALTO_SALA + 1)) - 1; // Fila 29

    let phase1Slots = 0, phase2Slots = 0;
    let correctPhase1 = 0, correctPhase2 = 0;

    for (const key in solution) {
        const row = parseInt(key.split('-')[0], 10);
        
        // Sala 1 (abajo) es Fase 1
        const isPhase1 = row > filaDivisoriaPuerta1;
        // Sala 2 (medio) es Fase 2
        const isPhase2 = row > filaDivisoriaPuerta2 && row <= filaDivisoriaPuerta1;

        if (isPhase1) phase1Slots++;
        if (isPhase2) phase2Slots++;

        if (slotStates[key] === 'correct') {
            if (isPhase1) correctPhase1++;
            if (isPhase2) correctPhase2++;
        }
    }

    const phase1Complete = phase1Slots > 0 && correctPhase1 === phase1Slots;
    const phase2Complete = phase2Slots > 0 && correctPhase2 === phase2Slots;

    if (phase1Complete && phase2Complete) {
        if (levelPhase !== 3) setLevelPhase(3);
    } else if (phase1Complete) {
        if (levelPhase !== 2) setLevelPhase(2);
    } else {
        if (levelPhase !== 1) setLevelPhase(1);
    }
}, [slotStates, currentLevelIndex, gameState, levelPhase]);

  // Level 3-1 Logic Gate and Phase Progression (Progressive Difficulty) - NOW INDEX 8
  useEffect(() => {
    if (currentLevelIndex !== 8 || gameState !== 'playing' || !level.logicLinks) return;

    const checkPuzzle = (id: string): boolean => {
      const link = level.logicLinks.find(l => l.id === id);
      if (!link) return false;
      const cubeA = getCubeAt(link.slot_a_pos);
      const cubeB = getCubeAt(link.slot_b_pos);
      if (!cubeA || !cubeB) return false;
      
      switch (link.operator) {
        case 'gt': return cubeA.value > cubeB.value;
        case 'lt': return cubeA.value < cubeB.value;
        case 'eq': return cubeA.value === cubeB.value;
        default: return false;
      }
    };
    
    // Check solutions for each puzzle
    const s1_eq = checkPuzzle('s1_eq');
    const s2_lt = checkPuzzle('s2_lt');
    const s2_gt = checkPuzzle('s2_gt');
    const s3_eq = checkPuzzle('s3_eq');
    const s3_lt = checkPuzzle('s3_lt');
    const s3_gt = checkPuzzle('s3_gt');
    
    // Update Level Phase
    if (s1_eq && s2_lt && s2_gt) {
      if (levelPhase < 3) setLevelPhase(3);
    } else if (s1_eq) {
      if (levelPhase < 2) setLevelPhase(2);
    } else {
      if (levelPhase !== 1) setLevelPhase(1);
    }

    // Update Gate States
    setLogicGateStates({
      main_gate: s1_eq && s2_lt && s2_gt && s3_eq && s3_lt && s3_gt, 
      secret_chamber_gate: s2_lt || s2_gt // Open with either puzzle in room 2
    });

  }, [cubes, currentLevelIndex, gameState, level.logicLinks, getCubeAt, levelPhase]);

  // Absolute Door Logic
  useEffect(() => {
    if (!level.absoluteLinks || gameState !== 'playing') {
      if (Object.keys(absoluteDoorStates).length > 0) setAbsoluteDoorStates({});
      return;
    }

    const doorToPlatesMap = new Map<string, { value: number; plate_pos: Position }[]>();

    level.absoluteLinks.forEach(link => {
        link.door_pos.forEach(doorPos => {
            const doorKey = `${doorPos.row}-${doorPos.col}`;
            if (!doorToPlatesMap.has(doorKey)) {
                doorToPlatesMap.set(doorKey, []);
            }
            doorToPlatesMap.get(doorKey)!.push({ value: link.value, plate_pos: link.plate_pos });
        });
    });

    const newDoorStates: Record<string, boolean> = {};

    for (const [doorKey, plates] of doorToPlatesMap.entries()) {
        const allPlatesActive = plates.every(plate => {
            const cubeOnPlate = getCubeAt(plate.plate_pos);
            return cubeOnPlate ? Math.abs(cubeOnPlate.value) === plate.value : false;
        });
        newDoorStates[doorKey] = allPlatesActive;
    }

    if (JSON.stringify(newDoorStates) !== JSON.stringify(absoluteDoorStates)) {
        setAbsoluteDoorStates(newDoorStates);
    }
  }, [cubes, level.absoluteLinks, getCubeAt, gameState]);

  // Level 1-4 and 2-4 Phase Progression (based on absolute doors)
  useEffect(() => {
      if (currentLevelIndex === 3 || currentLevelIndex === 7) {
          const door1_open = !!absoluteDoorStates['29-9'];
          const door2_open = !!absoluteDoorStates['14-9'];
          
          if (door2_open) {
              if (levelPhase !== 3) setLevelPhase(3);
          } else if (door1_open) {
              if (levelPhase !== 2) setLevelPhase(2);
          } else {
              if (levelPhase !== 1) setLevelPhase(1);
          }
      }
  }, [absoluteDoorStates, currentLevelIndex, levelPhase]);

  // Synthesizer Logic
  useEffect(() => {
    if (gameState !== 'playing' || !level.synthesizers) return;

    for (const synth of level.synthesizers) {
        const cubeA = getCubeAt(synth.slot_a);
        const cubeB = getCubeAt(synth.slot_b);
        const cubeOut = getCubeAt(synth.output);

        if (cubeA && cubeB && !cubeOut) {
            if (cubeA.status === 'evaporating' || cubeB.status === 'evaporating') continue;
            soundManager.play('inverter');
            setScore(s => s + 150);
            const newValue = cubeA.value + cubeB.value;
            const newType = newValue >= 0 ? 'lava' : 'ice';
            const newId = nextCubeId.current++;

            const newCube: Omit<Cube, 'status'> = {
                id: newId,
                type: newType,
                value: newValue,
                position: synth.output,
            };
            
            setFeedbackMessage(`Sintetizado: ${newValue > 0 ? `+${newValue}`: newValue}`);

            // 1. Mark inputs for evaporation
            setCubes(prev => prev.map(c =>
                (c.id === cubeA.id || c.id === cubeB.id)
                    ? { ...c, status: 'evaporating' }
                    : c
            ));

            // 2. Add visual effects
            setEvaporationEffects(prev => [
                ...prev,
                { id: Date.now(), position: synth.slot_a },
                { id: Date.now() + 1, position: synth.slot_b },
                { id: Date.now() + 2, position: synth.core }
            ]);

            // 3. After animation, remove inputs and add output
            setTimeout(() => {
                setCubes(prev => [
                    ...prev.filter(c => c.id !== cubeA.id && c.id !== cubeB.id),
                    { ...newCube, status: 'active' }
                ]);
                setTimeout(() => setFeedbackMessage(''), 1500);
            }, 300);
            
            return;
        }
    }
  }, [cubes, level.synthesizers, getCubeAt, gameState]);

  // Check for prize collection on player move
  useEffect(() => {
    if (currentLevelIndex === 8) { // NOW INDEX 8
      const prize = getPrizeAt(playerPosition);
      if (prize) {
        soundManager.play('collectPrize');
        setScore(s => s + 500);
        setPrizes(prev => prev.map(p => p.id === prize.id ? { ...p, status: 'collected' } : p));
        setPrizeEffects(prev => [...prev, { id: Date.now(), position: prize.position }]);
        setTimeout(() => setPrizes(prev => prev.filter(p => p.id !== prize.id)), 300);
      }
    }
  }, [playerPosition, getPrizeAt, currentLevelIndex]);
  
  const scannerPlatePositions = useMemo(() => {
    if (currentLevelIndex !== 5) return []; // NOW INDEX 5
    const positions: Position[] = [];
    level.grid.forEach((row, r) => {
        row.forEach((tile, c) => {
            if (tile === TileType.SCANNER_PLATE) {
                positions.push({ row: r, col: c });
            }
        });
    });
    return positions;
  }, [level.grid, currentLevelIndex]);

  const revealedCubeIds = useMemo(() => {
      if (scannerPlatePositions.length === 0) return [];
      return cubes
          .filter(c => 
              c.isMemory && 
              scannerPlatePositions.some(p => p.row === c.position.row && p.col === c.position.col)
          )
          .map(c => c.id);
  }, [cubes, scannerPlatePositions]);

  // Level 2-2 Memory Challenge Logic - NOW INDEX 5 (Multi-stage)
  useEffect(() => {
    if (currentLevelIndex !== 5 || gameState !== 'playing' || !level.logicLinks) return;
    
    const newLogicGateStates: Record<string, boolean> = {};

    const checkPuzzle = (link: NonNullable<LevelData['logicLinks']>[0]): boolean => {
      const cubeA = getCubeAt(link.slot_a_pos);
      const cubeB = getCubeAt(link.slot_b_pos);
      if (!cubeA || !cubeB) return false;
      
      switch (link.operator) {
        case 'gt': return cubeA.value > cubeB.value;
        case 'lt': return cubeA.value < cubeB.value;
        case 'eq': return cubeA.value === cubeB.value;
        default: return false;
      }
    };

    level.logicLinks.forEach(link => {
        newLogicGateStates[link.id] = checkPuzzle(link);
    });
    
    // Update Level Phase based on puzzle completion
    const phase1Complete = !!newLogicGateStates['s1_gt'];
    const phase2Complete = !!newLogicGateStates['s2_lt'] && !!newLogicGateStates['s2_eq'];

    if (phase1Complete && phase2Complete) {
      if (levelPhase < 3) setLevelPhase(3);
    } else if (phase1Complete) {
      if (levelPhase < 2) setLevelPhase(2);
    } else {
      if (levelPhase !== 1) setLevelPhase(1);
    }

    // Update main gate for final puzzle
    const finalPuzzlesComplete = !!newLogicGateStates['s3_gt'] && !!newLogicGateStates['s3_lt'] && !!newLogicGateStates['s3_eq'];
    newLogicGateStates['main_gate'] = finalPuzzlesComplete;
    
    // Update the state if it has changed
    if (JSON.stringify(newLogicGateStates) !== JSON.stringify(logicGateStates)) {
      setLogicGateStates(newLogicGateStates);
    }

  }, [cubes, currentLevelIndex, gameState, level.logicLinks, getCubeAt, levelPhase]);

  // NEW: Level 2-3 "El Entorno Reactivo" Logic (Rediseño) - NOW INDEX 6
  useEffect(() => {
    if (currentLevelIndex !== 6 || gameState !== 'playing' || !level.logicLinks) return;
    
    const newLogicGateStates: Record<string, boolean> = {};

    const checkPuzzle = (linkId: string): boolean => {
        const link = level.logicLinks?.find(l => l.id === linkId);
        if (!link) return false;
        const cubeA = getCubeAt(link.slot_a_pos);
        const cubeB = getCubeAt(link.slot_b_pos);
        if (!cubeA || !cubeB) return false;
        switch (link.operator) {
            case 'gt': return cubeA.value > cubeB.value;
            case 'lt': return cubeA.value < cubeB.value;
            case 'eq': return cubeA.value === cubeB.value;
            default: return false;
        }
    };

    const s1_solved = checkPuzzle('s1_gt');
    const s2_solved = checkPuzzle('s2_lt') && checkPuzzle('s2_eq');
    const s3_solved = checkPuzzle('s3_gt') && checkPuzzle('s3_lt') && checkPuzzle('s3_eq');

    // Update Level Phase for stage doors
    if (s1_solved && s2_solved) {
        if (levelPhase < 3) setLevelPhase(3);
    } else if (s1_solved) {
        if (levelPhase < 2) setLevelPhase(2);
    } else {
        if (levelPhase !== 1) setLevelPhase(1);
    }

    // Update main gate state for final puzzle
    newLogicGateStates['main_gate'] = s3_solved;
    
    if (JSON.stringify(newLogicGateStates) !== JSON.stringify(logicGateStates)) {
      setLogicGateStates(newLogicGateStates);
    }

  }, [cubes, currentLevelIndex, gameState, level.logicLinks, getCubeAt, levelPhase]);
  
  const ALTO_SALA = 14;

  const calculateKnightMovePath = useCallback((startPos: Position, roomBounds: { top: number; bottom: number; left: number; right: number; }, flyingRockPaths: Position[][]): Position[] | null => {
        const knightMoves = [
            { r: -2, c: -1 }, { r: -2, c: 1 }, { r: -1, c: -2 }, { r: -1, c: 2 },
            { r: 1, c: -2 }, { r: 1, c: 2 }, { r: 2, c: -1 }, { r: 2, c: 1 },
        ];

        let currentPos = startPos;
        const path: Position[] = [startPos];
        const pathAsStrings = new Set([`${startPos.row},${startPos.col}`]);
        const flyingRockPositions = new Set(flyingRockPaths.flat().map(p => `${p.row},${p.col}`));

        for (let i = 0; i < 3; i++) { // 3 moves
            // Shuffle moves to get random paths
            for (let j = knightMoves.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [knightMoves[j], knightMoves[k]] = [knightMoves[k], knightMoves[j]];
            }

            let moveFound = false;
            for (const move of knightMoves) {
                const nextPos = { row: currentPos.row + move.r, col: currentPos.col + move.c };
                const nextPosKey = `${nextPos.row},${nextPos.col}`;

                if (nextPos.row < roomBounds.top || nextPos.row >= roomBounds.bottom || nextPos.col < roomBounds.left || nextPos.col >= roomBounds.right) continue;
                if (isObstacle(nextPos) || getCubeAt(nextPos) || (nextPos.row === playerPosition.row && nextPos.col === playerPosition.col)) continue;
                if (pathAsStrings.has(nextPosKey) || flyingRockPositions.has(nextPosKey)) continue;

                path.push(nextPos);
                pathAsStrings.add(nextPosKey);
                currentPos = nextPos;
                moveFound = true;
                break;
            }

            if (!moveFound) return null;
        }

        return path;
    }, [isObstacle, getCubeAt, playerPosition]);

    spawnRockFnRef.current = () => {
        const currentRoomIndex = Math.floor(playerPosition.row / (ALTO_SALA + 1));

        const emittersInCurrentRoom: Position[] = [];
        const roomTop = currentRoomIndex * (ALTO_SALA + 1);
        const roomBottom = roomTop + ALTO_SALA + 1;

        for (let r = roomTop; r < roomBottom; r++) {
            if (level.grid[r]) {
                level.grid[r].forEach((tile, c) => {
                    if (tile === TileType.EMITTER) {
                        emittersInCurrentRoom.push({ row: r, col: c });
                    }
                });
            }
        }

        if (emittersInCurrentRoom.length === 0) return;
        
        const ANCHO_SALA = 20;
        const roomBounds = { top: roomTop + 1, bottom: roomTop + ALTO_SALA, left: 1, right: ANCHO_SALA - 2 };
        const flyingRockPaths = interactiveRocks.filter(r => r.status === 'flying').map(r => r.path);

        const possibleStartPositions: Position[] = [];
        for (const emitter of emittersInCurrentRoom) {
            const offsets = [{r: 0, c: 1}, {r: 0, c: -1}];
            for (const offset of offsets) {
                const pos = { row: emitter.row + offset.r, col: emitter.col + offset.c };
                if (pos.row >= 0 && pos.row < level.grid.length && pos.col >= 0 && pos.col < level.grid[0].length) {
                    if (!isObstacle(pos) && !getCubeAt(pos)) {
                        possibleStartPositions.push(pos);
                    }
                }
            }
        }

        if (possibleStartPositions.length === 0) return;
        
        for (let i = 0; i < 5; i++) { // Try to find a path 5 times
            const startPos = possibleStartPositions[Math.floor(Math.random() * possibleStartPositions.length)];
            const path = calculateKnightMovePath(startPos, roomBounds, flyingRockPaths);

            if (path) {
                soundManager.play('rockEmitter');
                setInteractiveRocks(prev => [...prev, { id: Date.now() + Math.random(), path, status: 'flying' }]);
                return;
            }
        }
    };

    // Global timer for radioactive rock spawning
    useEffect(() => {
        const isRadioactiveLevel = [6, 7, 8].includes(currentLevelIndex);

        if (isRadioactiveLevel && gameState === 'playing' && currentScene === 'game') {
            // Start a continuous interval that isn't tied to room changes.
            rockSpawnInterval.current = setInterval(() => {
                // The spawn function already knows to only spawn in the player's current room.
                spawnRockFnRef.current?.();
            }, 8000); // Rocks every 8 seconds, globally.

            // Cleanup function to stop the timer when the level ends or component unmounts.
            return () => {
                if (rockSpawnInterval.current) {
                    clearInterval(rockSpawnInterval.current);
                    rockSpawnInterval.current = null;
                }
            };
        }

        // If it's not a radioactive level or not playing, ensure the timer is cleared.
        return () => {
            if (rockSpawnInterval.current) {
                clearInterval(rockSpawnInterval.current);
                rockSpawnInterval.current = null;
            }
        };
    }, [currentLevelIndex, gameState, currentScene]);

    const handleRockLanded = useCallback((rockId: number) => {
        const rock = interactiveRocks.find(r => r.id === rockId);
        if (!rock || rock.path.length === 0) return;

        const finalPos = rock.path[rock.path.length - 1];
        const tileAtFinalPos = level.grid[finalPos.row]?.[finalPos.col];
        
        const isGameOverTile = [
            // Level 2-3 Tiles
            TileType.COMPARISON_SLOT_A,
            TileType.COMPARISON_SLOT_B,
            // Level 2-4 Tiles
            TileType.SYNTH_SLOT_A,
            TileType.SYNTH_SLOT_B,
            TileType.SYNTH_CORE,
            TileType.SYNTH_OUTPUT,
            TileType.PLATE_ABS
        ].includes(tileAtFinalPos);

        if (isGameOverTile) {
            setGameState('gameOver');
            setGameOverMessage('Una roca radioactiva ha bloqueado un puzzle.');
        } else {
            setInteractiveRocks(prev => prev.map(r => r.id === rockId ? { ...r, status: 'landed' } : r));
        }
    }, [interactiveRocks, level.grid]);

    // E3-N2 Dispenser Logic
    useEffect(() => {
        if (gameState !== 'playing' || !level.grid) return;
    
        const newCubes: Cube[] = [];
    
        level.grid.forEach((row, r) => {
            row.forEach((tile, c) => {
                let dispenserType: 'lava' | 'ice' | null = null;
                let outputPos: Position | null = null;
    
                if (tile === TileType.DISPENSER_LAVA) {
                    dispenserType = 'lava';
                    outputPos = { row: r, col: c + 1 };
                } else if (tile === TileType.DISPENSER_ICE) {
                    dispenserType = 'ice';
                    outputPos = { row: r, col: c - 1 };
                }
    
                if (dispenserType && outputPos) {
                    const isOccupied = getCubeAt(outputPos) || (playerPosition.row === outputPos.row && playerPosition.col === outputPos.col);
                    if (!isOccupied) {
                        newCubes.push({
                            id: nextCubeId.current++,
                            type: dispenserType,
                            value: dispenserType === 'lava' ? 1 : -1,
                            position: outputPos,
                            status: 'active',
                        });
                    }
                }
            });
        });
    
        if (newCubes.length > 0) {
            soundManager.play('dispenseCube');
            setCubes(prev => [...prev, ...newCubes]);
        }
    }, [cubes, playerPosition, level.grid, gameState, getCubeAt]);

    // E3-N2 Numeric Deposit and Door Logic
    useEffect(() => {
        if (gameState !== 'playing' || !level.numericDeposits) return;

        const newDepositStates: Record<string, { current: number; target: number }> = {};
        let allDepositsCorrectForPhase1 = true;
        let allDepositsCorrectForPhase2 = true;
        let allDepositsCorrectForPhase3 = true;

        for (const deposit of level.numericDeposits) {
            const sum = cubes
                .filter(c => deposit.positions.some(p => p.row === c.position.row && p.col === c.position.col))
                .reduce((acc, cube) => acc + cube.value, 0);
            
            newDepositStates[deposit.id] = { current: sum, target: deposit.target };

            const isCorrect = sum === deposit.target;
            const wasCorrect = prevNumericDepositStates.current[deposit.id] ? (prevNumericDepositStates.current[deposit.id].current === prevNumericDepositStates.current[deposit.id].target) : false;
    
            if (isCorrect && !wasCorrect) {
                soundManager.play('puzzleSuccess');
                setScore(s => s + 250);
            }

            if (deposit.controlsDoor === 1 && !isCorrect) allDepositsCorrectForPhase1 = false;
            if (deposit.controlsDoor === 2 && !isCorrect) allDepositsCorrectForPhase2 = false;
            if (deposit.controlsDoor === 3 && !isCorrect) allDepositsCorrectForPhase3 = false;
        }
        
        prevNumericDepositStates.current = newDepositStates;
        setNumericDepositStates(newDepositStates);

        if (allDepositsCorrectForPhase1 && allDepositsCorrectForPhase2 && allDepositsCorrectForPhase3) {
            setLogicGateStates(prev => ({ ...prev, main_gate: true }));
            if (levelPhase < 3) setLevelPhase(3); // Ensure phase is also updated
        } else if (allDepositsCorrectForPhase1 && allDepositsCorrectForPhase2) {
             if (levelPhase < 3) setLevelPhase(3);
        } else if (allDepositsCorrectForPhase1) {
            if (levelPhase < 2) setLevelPhase(2);
        }

    }, [cubes, level.numericDeposits, gameState, levelPhase]);

    // E3-N3 Logic Calibrator and Door Logic
    useEffect(() => {
        if (gameState !== 'playing' || !level.logicCalibrators) return;

        const newCalibratorStates: Record<string, { current: number; isCorrect: boolean }> = {};
        let allCalibratorsCorrectForPhase1 = true;
        let allCalibratorsCorrectForPhase2 = true;
        let allCalibratorsCorrectForPhase3 = true;

        const checkDoor2 = level.logicCalibrators.filter(c => c.controlsDoor === 2).map(c => c.id);

        for (const cal of level.logicCalibrators) {
            const sum = cubes
                .filter(c => c.status === 'active' && cal.positions.some(p => p.row === c.position.row && p.col === c.position.col))
                .reduce((acc, cube) => acc + cube.value, 0);
            
            let isCorrect = false;
            switch (cal.operator) {
                case 'gt': isCorrect = sum > cal.target; break;
                case 'lt': isCorrect = sum < cal.target; break;
                case 'eq': isCorrect = sum === cal.target; break;
            }
            
            newCalibratorStates[cal.id] = { current: sum, isCorrect };

            const wasCorrect = prevLogicCalibratorStates.current[cal.id]?.isCorrect;
            if (isCorrect && !wasCorrect) {
                soundManager.play('puzzleSuccess');
                setScore(s => s + 250);
            }

            if (cal.controlsDoor === 1 && !isCorrect) allCalibratorsCorrectForPhase1 = false;
            if (cal.controlsDoor === 3 && !isCorrect) allCalibratorsCorrectForPhase3 = false;
        }
        
        prevLogicCalibratorStates.current = newCalibratorStates;

        // Door 2 needs all its calibrators to be correct
        allCalibratorsCorrectForPhase2 = checkDoor2.every(id => newCalibratorStates[id]?.isCorrect);

        if (level.logicCalibrators.some(c => c.controlsDoor === 3)) {
             const checkDoor3 = level.logicCalibrators.filter(c => c.controlsDoor === 3).map(c => c.id);
             allCalibratorsCorrectForPhase3 = checkDoor3.every(id => newCalibratorStates[id]?.isCorrect);
        } else {
            allCalibratorsCorrectForPhase3 = true;
        }

        setLogicCalibratorStates(newCalibratorStates);

        if (allCalibratorsCorrectForPhase1 && allCalibratorsCorrectForPhase2 && allCalibratorsCorrectForPhase3) {
            setLogicGateStates(prev => ({ ...prev, main_gate: true }));
            if (levelPhase < 3) setLevelPhase(3);
        } else if (allCalibratorsCorrectForPhase1 && allCalibratorsCorrectForPhase2) {
             if (levelPhase < 3) setLevelPhase(3);
        } else if (allCalibratorsCorrectForPhase1) {
            if (levelPhase < 2) setLevelPhase(2);
        }

    }, [cubes, level.logicCalibrators, gameState, levelPhase]);
    
    // E3-N3 Mass Converter Logic
    useEffect(() => {
        if (gameState !== 'playing' || (currentLevelIndex !== 10 && currentLevelIndex !== 11)) return;

        const converterPositions: Position[] = [];
        level.grid.forEach((row, r) => {
            row.forEach((tile, c) => {
                if (tile === TileType.MASS_CONVERTER) {
                    converterPositions.push({ row: r, col: c });
                }
            });
        });
        if (converterPositions.length === 0) return;

        const cubesToConvert = cubes.filter(c => 
            c.status === 'active' &&
            c.value !== 0 &&
            !convertingCubeIds.has(c.id) && // Check if already being processed
            converterPositions.some(p => p.row === c.position.row && p.col === c.position.col)
        );

        if (cubesToConvert.length > 0) {
            soundManager.play('inverter');
            const idsToConvert = cubesToConvert.map(c => c.id);
            
            // Lock these cubes from being re-processed immediately
            setConvertingCubeIds(prev => new Set([...prev, ...idsToConvert]));

            setFeedbackMessage('¡Conversión de masa iniciada!');
            const effects = cubesToConvert.map(c => ({ id: Date.now() + c.id, position: c.position }));
            setEvaporationEffects(prev => [...prev, ...effects]);
            
            // Make them disappear
            setCubes(prev => prev.map(c => 
                idsToConvert.includes(c.id) ? { ...c, status: 'evaporating' } : c
            ));

            // After animation, convert them and make them reappear
            setTimeout(() => {
                setCubes(prev => prev.map(c => {
                    if (idsToConvert.includes(c.id)) {
                        return { ...c, value: -c.value, type: c.type === 'ice' ? 'lava' : 'ice', status: 'active' };
                    }
                    return c;
                }));
                setFeedbackMessage('¡Conversión completada!');
                setTimeout(() => setFeedbackMessage(''), 1500);

                // After a short cooldown, unlock the cubes so they can be converted again if needed
                setTimeout(() => {
                    setConvertingCubeIds(prev => {
                        const newSet = new Set(prev);
                        idsToConvert.forEach(id => newSet.delete(id));
                        return newSet;
                    });
                }, 500); // 500ms cooldown after reappearing

            }, 500); // 500ms for evaporation animation
        }
    }, [cubes, gameState, currentLevelIndex, level.grid, convertingCubeIds]);

    const assemblerCalculations = useMemo(() => {
        if (!level.assemblers) {
            return {};
        }
    
        const results: Record<string, {
            values: Record<string, number | string>,
            goalStates: boolean[],
            isComplete: boolean
        }> = {};
    
        for (const assembler of level.assemblers) {
            const plates = assembler.positions;
            const cubesOnPlates = cubes.filter(c =>
                c.status === 'active' &&
                plates.some(p => p.row === c.position.row && p.col === c.position.col)
            );
    
            const rows = [...new Set(plates.map(p => p.row))].sort((a,b) => a-b);
            const cols = [...new Set(plates.map(p => p.col))].sort((a,b) => a-b);
            
            const rowSums = rows.map(r => cubesOnPlates.filter(c => c.position.row === r).reduce((sum, c) => sum + c.value, 0));
            const colSums = cols.map(colValue => cubesOnPlates.filter(c => c.position.col === colValue).reduce((sum, c) => sum + c.value, 0));
            const totalSum = cubesOnPlates.reduce((sum, c) => sum + c.value, 0);
            const cubeCount = cubesOnPlates.length;
    
            const values: Record<string, number | string> = {
                totalSum,
                cubeCount,
            };
            rowSums.forEach((s, i) => values[`row_sum_${i}`] = s);
            colSums.forEach((s, i) => values[`col_sum_${i}`] = s);
            
            const goalStates = assembler.goals.map((goal: AssemblerGoal) => {
                let currentValue: number;
                switch (goal.type) {
                    case 'row_sum': currentValue = rowSums[goal.index!] ?? 0; break;
                    case 'col_sum': currentValue = colSums[goal.index!] ?? 0; break;
                    case 'total_sum': currentValue = totalSum; break;
                    case 'cube_count': currentValue = cubeCount; break;
                    case 'row_parity': currentValue = rowSums[goal.index!] ?? 0; break;
                    case 'col_parity': currentValue = colSums[goal.index!] ?? 0; break;
                    case 'total_parity': currentValue = totalSum; break;
                    default: return false;
                }
    
                switch(goal.condition) {
                    case 'eq': return currentValue === goal.value;
                    case 'gt': return currentValue > goal.value;
                    case 'lt': return currentValue < goal.value;
                    case 'even': return currentValue % 2 === 0;
                    case 'odd': return Math.abs(currentValue % 2) === 1;
                    default: return false;
                }
            });
            
            results[assembler.id] = {
                values,
                goalStates,
                isComplete: goalStates.every(s => s)
            };
        }
        return results;
    
    }, [cubes, level.assemblers]);

    const assemblerValues = useMemo(() => 
        Object.fromEntries(Object.entries(assemblerCalculations).map(([id, data]) => [id, data.values]))
    , [assemblerCalculations]);

    const assemblerStates = useMemo(() => 
        Object.fromEntries(Object.entries(assemblerCalculations).map(([id, data]) => [id, data.goalStates]))
    , [assemblerCalculations]);
        
    // E3-N4 Assembler Logic
    useEffect(() => {
        if (currentLevelIndex !== 11 || gameState !== 'playing' || !level.assemblers) return;
    
        let anyCompletedThisFrame = false;

        level.assemblers.forEach(assembler => {
            const isComplete = assemblerCalculations[assembler.id]?.isComplete;
            const wasComplete = prevLogicGateStates.current[`assembler_${assembler.id}`];

            if (isComplete && !wasComplete) {
                // The sound is now handled by the levelPhase useEffect to prevent repetition.
                setScore(s => s + 500);
                anyCompletedThisFrame = true;
            }
        });

        // Determine new phase
        const s1 = level.assemblers.find(a => a.controlsDoor === 1);
        const s2 = level.assemblers.find(a => a.controlsDoor === 2);
        const s3 = level.assemblers.find(a => a.controlsDoor === 3);
        
        const s1_complete = s1 ? assemblerCalculations[s1.id]?.isComplete : false;
        const s2_complete = s2 ? assemblerCalculations[s2.id]?.isComplete : false;
        const s3_complete = s3 ? assemblerCalculations[s3.id]?.isComplete : false;
        
        let newPhase = 1;
        if (s1_complete) newPhase = 2;
        if (s1_complete && s2_complete) newPhase = 3;
        if (levelPhase !== newPhase) setLevelPhase(newPhase);

        // Control final gate
        setLogicGateStates(prev => ({ ...prev, main_gate: !!s3_complete }));

        // Store completion state for sound effects
        const newCompletionStates: Record<string, boolean> = {};
        level.assemblers.forEach(assembler => {
            newCompletionStates[`assembler_${assembler.id}`] = assemblerCalculations[assembler.id]?.isComplete;
        });
        prevLogicGateStates.current = { ...prevLogicGateStates.current, ...newCompletionStates };

    }, [assemblerCalculations, currentLevelIndex, gameState, level.assemblers, levelPhase]);


    const handleRestartLevel = useCallback(() => {
        setLives(3);
        setScore(scoreAtLevelStart.current);
        loadLevel(currentLevelIndex);
    }, [loadLevel, currentLevelIndex]);


  const hasWonLevel = useMemo(() => {
    if (level.grid[playerPosition.row][playerPosition.col] !== TileType.GOAL) {
        return false;
    }

    switch (currentLevelIndex) {
        case 0:
        case 1:
        case 2:
            return cubes.every(c => c.status !== 'active');
        
        case 3: // Episodio 1-4: La Presión Absoluta
            // This level is won when the final absolute door is open.
            const finalDoorIsOpenE14 = !!absoluteDoorStates['1-9'];
            return finalDoorIsOpenE14;

        case 4: // Episodio 2-1: La Recta Numérica
            const solution = LEVEL_SOLUTIONS[4];
            if (!solution) return true;
            return Object.keys(solution).every(key => slotStates[key] === 'correct');

        case 5: // Episodio 2-2: Desafío de la Memoria
        case 6: // Episodio 2-3: El Entorno Reactivo
        case 8: // Episodio 3-1: El Laboratorio del Orden
        case 9: // Episodio 3-2: La Bóveda de Unidades
        case 10: // Episodio 3-3: Los Calibradores Lógicos
        case 11: // Episodio 3-4: El Corazón de la Torre
            return !!logicGateStates['main_gate'];
        
        case 7: // Episodio 2-4: El Sintetizador de Enteros
            const finalDoorIsOpenE24 = !!absoluteDoorStates['1-9'];
            return finalDoorIsOpenE24;
        
        default:
            return true;
    }
}, [playerPosition.row, playerPosition.col, level.grid, currentLevelIndex, cubes, slotStates, logicGateStates, absoluteDoorStates]);

  // Goal check and transition trigger
  useEffect(() => {
    if (isTransitioning || preppingTransition || gameState !== 'playing' || showEpisodeWelcome) return;

    if (hasWonLevel) {
      setShowCongratsMessage(true);
      
      const transitionDelay = currentLevelIndex === 11 ? 10000 : 2500;
      setTimeout(() => {
        setShowCongratsMessage(false);
        setScore(s => s + 1000);
        
        const nextIndex = getNextLevelIndex(currentLevelIndex);

        if (nextIndex !== null && nextIndex < LEVELS.length) {
            setNextLevelData(LEVELS[nextIndex]);
            setPreppingTransition(true);
        } else {
            if (currentLevelIndex === 11) { // Last level of the game
                soundManager.stopAll();
                setCurrentScene('finalScene');
            } else {
                setGameState('won');
            }
        }
      }, transitionDelay);
    }
  }, [hasWonLevel, isTransitioning, preppingTransition, gameState, currentLevelIndex, showEpisodeWelcome]);
  
  // Transition animation handler
  useEffect(() => {
    if (preppingTransition && nextLevelData) {
      requestAnimationFrame(() => {
        setIsTransitioning(true);
        setPreppingTransition(false);
  
        setTimeout(() => {
          const nextIndex = LEVELS.findIndex(l => l.title === nextLevelData.title && l.shortTitle === nextLevelData.shortTitle);
          if (nextIndex > -1) {
            loadLevel(nextIndex);
          }
        }, 1500); // Animation duration MUST match transition duration in JSX
      });
    }
  }, [preppingTransition, nextLevelData, loadLevel]);

  // E3-N3 Fireball Spawning
  useEffect(() => {
      if ((currentLevelIndex !== 10 && currentLevelIndex !== 11) || gameState !== 'playing' || currentScene !== 'game') {
          setFireballs([]); // Clear fireballs when not on the level or not playing
          return;
      }

      const goalPosition = level.grid.reduce((pos: Position | null, row, r) => {
        if (pos) return pos;
        const c = row.findIndex(tile => tile === TileType.GOAL);
        return c !== -1 ? { row: r, col: c } : null;
      }, null);
      
      const goalColumn = goalPosition ? goalPosition.col : -1;

      const spawnInterval = setInterval(() => {
          const boardWidth = level.grid[0].length;
          let spawnCol: number;
          
          do {
            spawnCol = Math.floor(Math.random() * boardWidth);
          } while (spawnCol === goalColumn);

          const newFireball: Fireball = {
              id: Date.now() + Math.random(),
              col: spawnCol,
              y: -tileSize * 2, // Start off-screen
              soundPlayed: false,
          };
          setFireballs(prev => [...prev, newFireball]);
      }, 2000); // Spawn every 2 seconds

      return () => clearInterval(spawnInterval);
  }, [currentLevelIndex, gameState, level.grid, currentScene, tileSize]);

  // E3-N3 Fireball Animation & Collision
  useEffect(() => {
    const FIREBALL_SPEED = 4.8; // pixels per frame

    const loop = () => {
        if (gameState !== 'playing' || (currentLevelIndex !== 10 && currentLevelIndex !== 11) || currentScene !== 'game') {
            gameLoopRef.current = requestAnimationFrame(loop);
            return;
        }

        setFireballs(prev => {
            const updatedFireballs: Fireball[] = [];
            let collisionDetected = false;

            for (const fb of prev) {
                const newY = fb.y + FIREBALL_SPEED;
                let soundPlayed = fb.soundPlayed;

                // Play sound when fireball is about to enter the screen
                if (!soundPlayed && newY >= -tileSize) {
                    soundManager.play('fireballFly');
                    soundPlayed = true;
                }

                const playerBox = { top: playerPosition.row * tileSize, bottom: (playerPosition.row + 1) * tileSize, left: playerPosition.col * tileSize, right: (playerPosition.col + 1) * tileSize };
                const fireballBox = { top: newY, bottom: newY + tileSize, left: fb.col * tileSize, right: (fb.col + 1) * tileSize };

                if (fireballBox.left < playerBox.right && fireballBox.right > playerBox.left && fireballBox.top < playerBox.bottom && fireballBox.bottom > playerBox.top) {
                    collisionDetected = true;
                } else if (newY < level.grid.length * tileSize) {
                    // Pass the updated soundPlayed status
                    updatedFireballs.push({ ...fb, y: newY, soundPlayed });
                }
            }

            if (collisionDetected) {
                setLives(l => l - 1);
                setHeartbreakEffects(prev => [...prev, { id: Date.now(), position: playerPosition }]);
            }

            return updatedFireballs;
        });

        gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
    };
  }, [gameState, currentLevelIndex, playerPosition, level.grid.length, currentScene, tileSize]);

  // Game Over from lives & Sound effects
  useEffect(() => {
    if (lives < prevLives.current) {
        soundManager.play('takeDamage');
        if (lives <= 0 && gameState === 'playing') {
            soundManager.play('gameOver');
            setGameState('gameOver');
            setGameOverMessage('¡Has sido alcanzado por una bola de fuego!');
        }
    }
    prevLives.current = lives;
  }, [lives, gameState]);
  
  // Sound effect for level phase change
  useEffect(() => {
    if (levelPhase > prevLevelPhase.current) {
        // En el nivel final, el sonido de éxito solo se reproduce cuando se abren las puertas láser,
        // no con cada movimiento de cubo que completa un puzzle.
        if (currentLevelIndex !== 11) {
            soundManager.play('puzzleSuccess');
        }
        setScore(s => s + 250);
    }
    prevLevelPhase.current = levelPhase;
  }, [levelPhase, currentLevelIndex]);
  
  // Sound effect for door opening
  useEffect(() => {
    // Check logic gate changes
    Object.keys(logicGateStates).forEach(key => {
        if (logicGateStates[key] && !prevLogicGateStates.current[key]) {
            soundManager.play('laserDoorOpen');
            setScore(s => s + 500);
        }
    });
    prevLogicGateStates.current = logicGateStates;

    // Check absolute door changes
    Object.keys(absoluteDoorStates).forEach(key => {
        if (absoluteDoorStates[key] && !prevAbsoluteDoorStates.current[key]) {
            soundManager.play('laserDoorOpen');
            setScore(s => s + 300);
        }
    });
    prevAbsoluteDoorStates.current = absoluteDoorStates;
    
    // Check balance door change
    if(isBalanceDoorOpen && !prevIsBalanceDoorOpen.current) {
        soundManager.play('laserDoorOpen');
        setScore(s => s + 500);
    }
    prevIsBalanceDoorOpen.current = isBalanceDoorOpen;

  }, [logicGateStates, absoluteDoorStates, isBalanceDoorOpen]);


  const handleEffectComplete = useCallback((id: number) => setEvaporationEffects(p => p.filter(e => e.id !== id)), []);
  const handlePrizeEffectComplete = useCallback((id: number) => setPrizeEffects(p => p.filter(e => e.id !== id)), []);
  const handleZeroEffectComplete = useCallback((id: number) => setZeroEffects(p => p.filter(e => e.id !== id)), []);
  const handleHeartbreakComplete = useCallback((id: number) => setHeartbreakEffects(p => p.filter(e => e.id !== id)), []);

  const viewportPixelHeight = VIEWPORT_HEIGHT_TILES * tileSize;
  const viewportPixelWidth = VIEWPORT_WIDTH_TILES * tileSize;
  
  const handlePanStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1 || !isTouch) return;
    panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panOffsetAtStartRef.current = panOffset;
    setIsPanning(true);
  }, [isTouch, panOffset]);

  const handlePanMove = useCallback((e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - panStartRef.current.x;
    const dy = e.touches[0].clientY - panStartRef.current.y;
    setPanOffset({
        x: panOffsetAtStartRef.current.x + dx,
        y: panOffsetAtStartRef.current.y + dy,
    });
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const calculateBoardStyle = useCallback((pPos: Position, lvl: LevelData) => {
    const boardPixelHeight = lvl.grid.length * tileSize;
    const boardPixelWidth = lvl.grid[0].length * tileSize;
    
    const cameraY = pPos.row * tileSize - (viewportPixelHeight * 2 / 3);
    const cameraX = pPos.col * tileSize - (viewportPixelWidth / 2);

    let translateX = -cameraX + panOffset.x;
    let translateY = -cameraY + panOffset.y;

    if (boardPixelWidth < viewportPixelWidth) {
        translateX = (viewportPixelWidth - boardPixelWidth) / 2;
    } else {
        translateX = Math.min(0, translateX);
        translateX = Math.max(viewportPixelWidth - boardPixelWidth, translateX);
    }

    if (boardPixelHeight < viewportPixelHeight) {
        translateY = (viewportPixelHeight - boardPixelHeight) / 2;
    } else {
        translateY = Math.min(0, translateY);
        translateY = Math.max(viewportPixelHeight - boardPixelHeight, translateY);
    }
    
    return {
      transform: `translate(${translateX}px, ${translateY}px)`,
      transition: isPanning ? 'none' : 'transform 0.1s ease-in-out',
    };
  }, [tileSize, viewportPixelHeight, viewportPixelWidth, panOffset, isPanning]);

  const assemblerOverlays = useMemo(() => {
    // Only show this overlay for the final level (index 11)
    if (currentLevelIndex !== 11 || !level.assemblers?.length) {
      return null;
    }

    // Determine which room/phase corresponds to the player's current vertical position.
    const playerRow = playerPosition.row;
    let playerRoomPhase: 1 | 2 | 3;
    if (playerRow < 15) { // Top room (final puzzle) -> controlled by door/phase 3
      playerRoomPhase = 3;
    } else if (playerRow < 30) { // Middle room -> controlled by door/phase 2
      playerRoomPhase = 2;
    } else { // Bottom room (start) -> controlled by door/phase 1
      playerRoomPhase = 1;
    }

    // Find the assembler configuration for the room the player is currently in.
    const assembler = level.assemblers.find(a => a.controlsDoor === playerRoomPhase);
    
    // If there's no assembler for this area, show nothing.
    if (!assembler) {
      return null;
    }

    const isComplete = assemblerCalculations[assembler.id]?.isComplete;

    // If the puzzle for the current room is solved, show the success message.
    if (isComplete) {
      return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[320px] bg-black bg-opacity-80 border-2 border-green-400 rounded-lg shadow-lg z-20 font-arcade p-2.5 text-center">
          <h3 className="text-center text-yellow-300 tracking-widest mb-2" style={{ fontSize: '9px' }}>SISTEMA ENSAMBLADOR</h3>
          <p className="text-green-400" style={{ fontSize: '11px' }}>CÁLCULO CORRECTO</p>
          <p className="text-white mt-1" style={{ fontSize: '9px' }}>SISTEMA ESTABLE</p>
        </div>
      );
    }

    // Otherwise, show the objectives for the current room's puzzle.
    const values = assemblerValues[assembler.id] || {};
    const states = assemblerStates[assembler.id] || [];

    const getCurrentValue = (goal: AssemblerGoal): number | string => {
        const val = (() => {
            switch (goal.type) {
                case 'row_sum': return values[`row_sum_${goal.index!}`];
                case 'col_sum': return values[`col_sum_${goal.index!}`];
                case 'total_sum': return values.totalSum;
                case 'cube_count': return values.cubeCount;
                case 'row_parity': return values[`row_sum_${goal.index!}`];
                case 'col_parity': return values[`col_sum_${goal.index!}`];
                case 'total_parity': return values.totalSum;
                default: return '??';
            }
        })();
        return val ?? 0;
    };
    
    return (
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[320px] bg-black bg-opacity-80 border-2 border-purple-400 rounded-lg shadow-lg z-20 font-arcade p-2.5">
        <h3 className="text-center text-yellow-300 tracking-widest mb-2" style={{ fontSize: '9px' }}>SISTEMA ENSAMBLADOR</h3>
        <table className="w-full text-white" style={{ borderSpacing: '0 4px', borderCollapse: 'separate' }}>
            <tbody className="divide-y divide-gray-700/50">
            {assembler.goals.map((goal, index) => {
                const isCorrect = states[index] === true;
                const currentValue = getCurrentValue(goal);
                
                let targetText = '';
                if (goal.condition === 'even') targetText = 'PAR';
                else if (goal.condition === 'odd') targetText = 'IMPAR';
                else {
                    const operator = goal.condition === 'gt' ? '>' : goal.condition === 'lt' ? '<' : '=';
                    const targetVal = goal.value > 0 ? `+${goal.value}` : goal.value;
                    targetText = `${operator} ${targetVal}`;
                }
                
                const isTotalRow = goal.type === 'total_sum' || goal.type === 'cube_count';

                return (
                    <tr key={index} className={isTotalRow ? 'bg-purple-900 bg-opacity-40' : ''}>
                        <td className="py-0.5 pr-2 text-green-400 w-[45%]" style={{ fontSize: '9px' }}>{goal.description}</td>
                        <td className="py-0.5 text-center text-yellow-400 w-[20%]" style={{ fontSize: '9px' }}>{typeof currentValue === 'number' && currentValue > 0 ? `+${currentValue}`: currentValue}</td>
                        <td className="py-0.5 pl-2 text-cyan-400 w-[25%]" style={{ fontSize: '9px' }}>{targetText}</td>
                        <td className="py-0.5 text-center w-[10%]" style={{ fontSize: '9px' }}>
                            {isCorrect ? <span className="text-green-500" style={{ fontSize: '10px' }}>✓</span> : <span className="text-red-500" style={{ fontSize: '10px' }}>X</span>}
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
      </div>
    );
  }, [currentLevelIndex, level.assemblers, playerPosition, assemblerCalculations, assemblerValues, assemblerStates]);

  if (currentScene === 'welcome') return <WelcomeScreen onWatchVideo={() => setCurrentScene('videoIntro')} onGoToGame={() => setCurrentScene('start')} />;
  if (currentScene === 'videoIntro') return <VideoIntro onComplete={() => setCurrentScene('start')} />;
  if (currentScene === 'start') return <StartScreen onSelectEpisode={handleSelectEpisode} />;
  if (currentScene === 'intro') return <StoryIntro onComplete={() => setCurrentScene('iceCavern')} />;
  if (currentScene === 'iceCavern') return <IceCavern onComplete={() => setCurrentScene('game')} />;
  // FIX: Pass tileSize prop to FinalScene.
  if (currentScene === 'finalScene') return <FinalScene onComplete={handleGameReset} tileSize={tileSize} />;

  const currentObjective = level.objectives[levelPhase] || " ";

  return (
    <div className="min-h-screen font-sans">
      <div className="fixed inset-0 z-0"><GameBackground /></div>
      <main className="relative z-10 min-h-screen flex flex-col font-sans">
        <header className="relative w-full p-4 flex justify-between items-center z-20">
          <div className="w-24"></div> {/* Spacer */}
          <h1 className="font-arcade text-base text-white text-center flex-grow" style={{ textShadow: '2px 2px #000' }}>
            {level.shortTitle}
          </h1>
          <div className="flex flex-col items-center">
            <ArcadeButton
              onClick={() => setCurrentScene('start')}
              color="purple"
              size="sm"
              className="w-24"
            >
              Volver
            </ArcadeButton>
            {isTouch && (
              <button
                onClick={toggleFullscreen}
                className="mt-2 p-1 bg-black/50 rounded-full border-2 border-purple-500 hover:bg-purple-900/50 transition-colors"
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
          </div>
        </header>
        <div className="flex-grow flex items-center justify-center p-4 pt-0 overflow-hidden">
          <div className="relative">
             {isTouch && <TouchControls onMove={handleTouchMove} onAction={handleInteraction} />}
            <div 
              className="border-4 border-purple-500 rounded-lg shadow-2xl overflow-hidden relative" 
              style={{ height: viewportPixelHeight, width: viewportPixelWidth }}
              onTouchStart={handlePanStart}
              onTouchMove={handlePanMove}
              onTouchEnd={handlePanEnd}
            >
              {assemblerOverlays}
              {hintMessage && (
                  <div 
                      key={hintMessage.id} 
                      className="absolute bottom-4 right-4 z-50 bg-black bg-opacity-80 border-2 border-yellow-400 rounded-lg p-3 max-w-sm font-arcade text-white shadow-lg animate-fade-in whitespace-pre-line text-right"
                      style={{ fontSize: '10px' }}
                  >
                      {hintMessage.text}
                  </div>
              )}
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Current Level Board */}
                <div key={currentLevelIndex} style={{
                  position: 'absolute', top: 0, left: 0,
                  transform: `${calculateBoardStyle(playerPosition, level).transform}`,
                  transition: isTransitioning ? 'none' : 'transform 0.1s ease-in-out',
                }}>
                  <GameBoard 
                    level={level} 
                    playerPosition={playerPosition} 
                    cubes={cubes} 
                    prizes={prizes}
                    keys={keys}
                    facingDirection={facingDirection}
                    levelPhase={levelPhase}
                    effects={evaporationEffects}
                    prizeEffects={prizeEffects}
                    onEffectComplete={handleEffectComplete}
                    onPrizeEffectComplete={handlePrizeEffectComplete}
                    zeroEffects={zeroEffects}
                    onZeroEffectComplete={handleZeroEffectComplete}
                    slotStates={slotStates}
                    logicGateStates={logicGateStates}
                    absoluteDoorStates={absoluteDoorStates}
                    balanceState={balanceState}
                    balanceSumA={balanceSums.a}
                    balanceSumB={balanceSums.b}
                    mobilePlatformUp={mobilePlatformUp}
                    isBalanceDoorOpen={isBalanceDoorOpen}
                    isRevealedCubeIds={revealedCubeIds}
                    interactiveRocks={interactiveRocks}
                    onRockLanded={handleRockLanded}
                    numericDepositStates={numericDepositStates}
                    logicCalibratorStates={logicCalibratorStates}
                    fireballs={fireballs}
                    heartbreakEffects={heartbreakEffects}
                    onHeartbreakComplete={handleHeartbreakComplete}
                    secretDoorPositions={secretDoorPositions}
                    tileSize={tileSize}
                  />
                </div>
                
                {/* Next Level Board */}
                {nextLevelData && (
                  <div style={{
                     position: 'absolute', top: 0, left: 0,
                     transition: 'transform 1.5s ease-in-out',
                     transform: `${calculateBoardStyle(nextLevelData.playerStart, nextLevelData).transform} translateY(${isTransitioning ? '0%' : '-100%'})`
                  }}>
                     <GameBoard
                       level={nextLevelData}
                       playerPosition={nextLevelData.playerStart}
                       cubes={nextLevelData.cubes.map(c => ({ ...c, status: 'active' }))}
                       prizes={nextLevelData.prizes ? nextLevelData.prizes.map(p => ({ ...p, status: 'active' })) : []}
                       keys={nextLevelData.key ? [{...nextLevelData.key, status: 'active'}] : []}
                       facingDirection="up"
                       levelPhase={1}
                       effects={[]}
                       prizeEffects={[]}
                       onEffectComplete={() => {}}
                       onPrizeEffectComplete={() => {}}
                       zeroEffects={[]}
                       onZeroEffectComplete={() => {}}
                       slotStates={{}}
                       logicGateStates={{}}
                       absoluteDoorStates={{}}
                       balanceState={'level'}
                       balanceSumA={0}
                       balanceSumB={0}
                       mobilePlatformUp={false}
                       isBalanceDoorOpen={false}
                       isRevealedCubeIds={[]}
                       interactiveRocks={[]}
                       onRockLanded={() => {}}
                       numericDepositStates={{}}
                       logicCalibratorStates={{}}
                       fireballs={[]}
                       heartbreakEffects={[]}
                       onHeartbreakComplete={() => {}}
                       secretDoorPositions={[]}
                       tileSize={tileSize}
                     />
                  </div>
                )}
              </div>
               {showCongratsMessage && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                  <div className="bg-black bg-opacity-80 border-4 border-yellow-400 rounded-lg p-6 text-center shadow-2xl">
                    <p className="font-arcade text-xl text-yellow-300" style={{ textShadow: '2px 2px #000' }}>
                      ¡Felicitaciones!
                    </p>
                    <p className="font-arcade text-xl text-yellow-300 mt-2" style={{ textShadow: '2px 2px #000' }}>
                      Has pasado al siguiente nivel
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full flex-shrink-0 bg-black">
          <div className="relative text-center p-2 font-arcade text-[7px] md:text-sm h-[70%] md:h-10 flex items-center justify-center">
            <LavaBurstEffect key={feedbackMessage + currentObjective} />
            <span className="relative z-10">
              {feedbackMessage ? (
                <span className="text-red-400 animate-pulse">{feedbackMessage}</span>
              ) : (
                <span className="text-purple-400">{currentObjective}</span>
              )}
            </span>
          </div>
          <StatusBar 
            lives={lives} score={score} levelTitle={level.title}
            onHelp={() => setIsHelpModalOpen(true)}
            levelIndex={currentLevelIndex}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </div>

        {gameState === 'won' && (
          <Modal title="¡Aventura Completada!" onClose={handlePlayAgain} buttonText={'Jugar de Nuevo'}>
            <p>¡Victoria! Tu puntaje final es {score}.</p>
          </Modal>
        )}
        {isHelpModalOpen && (
            <HelpModal level={currentLevelIndex} onClose={() => setIsHelpModalOpen(false)} />
        )}
        {showEpisodeWelcome && (
            <EpisodeWelcomeModal 
                episodeName={showEpisodeWelcome.name}
                levelCount={showEpisodeWelcome.count}
                onClose={() => setShowEpisodeWelcome(null)}
            />
        )}
        {gameState === 'gameOver' && (
            <GameOverModal onRestart={handleRestartLevel} message={gameOverMessage} />
        )}
      </main>
    </div>
  );
};

export default App;
