import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { LevelData, Position, Cube as CubeData, Direction, EvaporationEffectData, Prize as PrizeData, Key as KeyData, InteractiveRock as InteractiveRockData, Fireball as FireballData, HeartbreakEffectData, AssemblerGoal } from '../types';
import { TileType } from '../types';
import { TILE_SIZE } from '../constants';
import Character from './Character';
import Cube from './Cube';
import Prize from './Prize';
import Key from './Key';
import BalanceIndicator from './BalanceIndicator';
import InteractiveRock from './InteractiveRock';
import Fireball from './Fireball';
import Heartbreak from './Heartbreak';

// --- Nuevo Componente de Efecto de Partículas ---

interface EvaporationEffectProps {
  position: Position;
  onComplete: () => void;
}

const PARTICLE_COUNT = 30;
const GRAVITY = 0.05;
const FADE_RATE = 0.015;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
  color: string;
}

const EvaporationEffect: React.FC<EvaporationEffectProps> = ({ position, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (particlesRef.current.length === 0) {
      const centerX = TILE_SIZE / 2;
      const centerY = TILE_SIZE / 2;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          radius: Math.random() * 3 + 1,
          color: i % 3 === 0 ? '#ffd84a' : (i % 3 === 1 ? '#6ecbff' : '#ff6b35'), // Added yellow for prizes
        });
      }
    }

    let animationFrameId: number;
    
    const animate = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
      
      let allFaded = true;
      particlesRef.current.forEach(p => {
        if (p.alpha > 0) {
          allFaded = false;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += GRAVITY;
          p.alpha -= FADE_RATE;

          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      ctx.globalAlpha = 1;

      if (allFaded) {
        cancelAnimationFrame(animationFrameId);
        onCompleteRef.current();
      } else {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const style: React.CSSProperties = {
    top: `${position.row * TILE_SIZE}px`,
    left: `${position.col * TILE_SIZE}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    pointerEvents: 'none',
    zIndex: 50,
  };

  return (
    <canvas
      ref={canvasRef}
      width={TILE_SIZE}
      height={TILE_SIZE}
      className="absolute"
      style={style}
      aria-hidden="true"
    />
  );
};

// --- Fin del Componente de Efecto ---

// --- Nuevo Componente Cero de Neutralización ---

interface NeutralizationZeroProps {
  position: Position;
  onComplete: () => void;
}

const NeutralizationZero: React.FC<NeutralizationZeroProps> = ({ position, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Aparece después de que los cubos se desvanecen (200ms)
    const appearTimer = setTimeout(() => {
      setVisible(true);
    }, 200);

    // Se mantiene visible 150ms, después de su animación de entrada (200ms)
    const disappearTimer = setTimeout(() => {
      setVisible(false);
    }, 200 + 200 + 150);

    // Llama a onComplete después de la animación de salida (otros 200ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 200 + 200 + 150 + 200);

    return () => {
      clearTimeout(appearTimer);
      clearTimeout(disappearTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const style: React.CSSProperties = {
    top: `${position.row * TILE_SIZE}px`,
    left: `${position.col * TILE_SIZE}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    pointerEvents: 'none',
  };

  return (
    <div
      style={style}
      className={`absolute flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      <span 
        className="font-arcade text-yellow-300 text-3xl"
        style={{ textShadow: '2px 2px 4px #000' }}
      >
        0
      </span>
    </div>
  );
};
// --- Fin del Componente Cero ---

interface GameBoardProps {
  level: LevelData;
  playerPosition: Position;
  cubes: CubeData[];
  prizes: PrizeData[];
  keys: KeyData[];
  facingDirection: Direction;
  levelPhase: number;
  effects: EvaporationEffectData[];
  prizeEffects: EvaporationEffectData[];
  onEffectComplete: (id: number) => void;
  onPrizeEffectComplete: (id: number) => void;
  zeroEffects: EvaporationEffectData[];
  onZeroEffectComplete: (id: number) => void;
  slotStates: Record<string, 'empty' | 'correct' | 'incorrect'>;
  logicGateStates: Record<string, boolean>;
  absoluteDoorStates: Record<string, boolean>;
  balanceState: 'level' | 'A_down' | 'B_down';
  balanceSumA: number;
  balanceSumB: number;
  mobilePlatformUp: boolean;
  isBalanceDoorOpen: boolean;
  isRevealedCubeIds: number[];
  interactiveRocks: InteractiveRockData[];
  onRockLanded: (rockId: number) => void;
  numericDepositStates: Record<string, { current: number; target: number }>;
  logicCalibratorStates: Record<string, { current: number; isCorrect: boolean }>;
  fireballs: FireballData[];
  heartbreakEffects: HeartbreakEffectData[];
  onHeartbreakComplete: (id: number) => void;
  secretDoorPositions?: { row: number, col: number }[];
}

const AbsoluteDoor: React.FC<{ open: boolean }> = ({ open }) => {
  const [state, setState] = useState<'closed' | 'color-change' | 'opening'>('closed');

  useEffect(() => {
    if (open) {
      setState('color-change');
      const timer = setTimeout(() => setState('opening'), 100);
      return () => clearTimeout(timer);
    } else {
      setState('closed');
    }
  }, [open]);

  const beamColorClass = state === 'closed'
    ? 'bg-purple-500 shadow-[0_0_10px_2px_#c084fc]'
    : 'bg-yellow-400 shadow-[0_0_10px_2px_#facc15]';

  return (
    <div className="col-span-2 w-full h-full bg-gray-900 flex items-center justify-between p-1 relative">
      <div className="w-2 h-6 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
      <div className="absolute left-0 right-0 mx-auto w-full h-full flex items-center overflow-hidden">
        <div 
          className={`h-1.5 w-full ${beamColorClass} ${state === 'opening' ? 'transition-transform duration-[1000ms] ease-linear' : ''}`}
          style={{ transform: state === 'opening' ? 'scaleX(0)' : 'scaleX(1)', transformOrigin: 'center' }}
        ></div>
      </div>
      <div className="w-2 h-6 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
    </div>
  );
};

const WideDoor: React.FC<{ open: boolean, color?: 'red' | 'green' }> = ({ open, color = 'red' }) => {
  const [state, setState] = useState<'closed' | 'color-change' | 'opening'>('closed');

  useEffect(() => {
    if (open) {
      setState('color-change');
      const timer = setTimeout(() => setState('opening'), 100);
      return () => clearTimeout(timer);
    } else {
      setState('closed');
    }
  }, [open]);

  const beamColorClass = state === 'closed'
    ? 'bg-red-500 shadow-[0_0_10px_2px_#ef4444]'
    : 'bg-green-500 shadow-[0_0_10px_2px_#22c55e]';

  return (
    <div className="col-span-2 w-full h-full bg-gray-900 flex items-center justify-between p-1 relative">
      <div className="w-2 h-6 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
      <div className="absolute left-0 right-0 mx-auto w-full h-full flex items-center overflow-hidden">
        <div 
          className={`h-1.5 w-full ${beamColorClass} ${state === 'opening' ? 'transition-transform duration-[1000ms] ease-linear' : ''}`}
          style={{ transform: state === 'opening' ? 'scaleX(0)' : 'scaleX(1)', transformOrigin: 'center' }}
        ></div>
      </div>
      <div className="w-2 h-6 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
    </div>
  );
};

const LogicGate: React.FC<{ open: boolean, color?: 'red' | 'green' }> = ({ open, color = 'red' }) => {
    const [state, setState] = useState<'closed' | 'color-change' | 'opening'>('closed');

    useEffect(() => {
        if (open) {
            setState('color-change');
            const timer = setTimeout(() => setState('opening'), 100);
            return () => clearTimeout(timer);
        } else {
            setState('closed');
        }
    }, [open]);

    const beamColorClass = color === 'red'
      ? (state === 'closed' ? 'bg-red-500 shadow-[0_0_10px_2px_#ef4444]' : 'bg-green-500 shadow-[0_0_10px_2px_#22c55e]')
      : 'bg-green-500 shadow-[0_0_10px_2px_#22c55e]';


    return (
        <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-between p-1 relative">
            <div className="w-6 h-2 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
            <div className="absolute top-0 bottom-0 my-auto w-full h-full flex justify-center overflow-hidden">
                <div
                    className={`w-1.5 h-full ${beamColorClass} ${state === 'opening' ? 'transition-transform duration-1000 ease-linear' : ''}`}
                    style={{ transform: state === 'opening' ? 'scaleY(0)' : 'scaleY(1)', transformOrigin: 'center' }}
                ></div>
            </div>
            <div className="w-6 h-2 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
        </div>
    );
};

const HorizontalGate: React.FC<{ open: boolean, color?: 'red' | 'green' }> = ({ open, color = 'green' }) => {
  const [state, setState] = useState<'closed' | 'color-change' | 'opening'>('closed');

  useEffect(() => {
    if (open) {
      setState('color-change');
      const timer = setTimeout(() => setState('opening'), 100);
      return () => clearTimeout(timer);
    } else {
      setState('closed');
    }
  }, [open]);

  const beamColorClass = color === 'red'
      ? (state === 'closed' ? 'bg-red-500 shadow-[0_0_10px_2px_#ef4444]' : 'bg-green-500 shadow-[0_0_10px_2px_#22c55e]')
      : 'bg-green-500 shadow-[0_0_10px_2px_#22c55e]';


  return (
    <div className="w-full h-full bg-gray-900 flex items-center justify-between p-1 relative">
      <div className="w-2 h-6 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
      <div className="absolute left-0 right-0 mx-auto w-full h-full flex items-center overflow-hidden">
        <div 
          className={`h-1.5 w-full ${beamColorClass} ${state === 'opening' ? 'transition-transform duration-[1000ms] ease-linear' : ''}`}
          style={{ transform: state === 'opening' ? 'scaleX(0)' : 'scaleX(1)', transformOrigin: 'center' }}
        ></div>
      </div>
      <div className="w-2 h-6 bg-gray-700 border border-gray-500 rounded-sm z-10"></div>
    </div>
  );
};

interface TileComponentProps {
  levelPhase: number;
  row: number;
  col: number;
  grid: TileType[][];
  level: LevelData;
  slotStates: GameBoardProps['slotStates'];
  logicGateStates: GameBoardProps['logicGateStates'];
  absoluteDoorStates: GameBoardProps['absoluteDoorStates'];
  balanceState: GameBoardProps['balanceState'];
  mobilePlatformUp: GameBoardProps['mobilePlatformUp'];
  isBalanceDoorOpen: GameBoardProps['isBalanceDoorOpen'];
}

const LavaRockEmitterIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <g transform="scale(1.1)" transform-origin="center">
            {/* Cuerpo de la roca */}
            <path d="M 12,32 C 12,12 52,12 52,32 S 42,52 32,52 S 12,52 12,32 Z"
                  fill="#8b2f0a" stroke="#4a2c2a" strokeWidth="2.5" />
            <path d="M 18,35 C 18,20 46,20 46,35 S 40,48 32,48 S 18,50 18,35 Z"
                  fill="#c94a1a" opacity="0.8"/>
            
            {/* Brillo de lava animado */}
            <path d="M 12,32 C 12,12 52,12 52,32 S 42,52 32,52 S 12,52 12,32 Z"
                  fill="none" stroke="#ff6b35" strokeWidth="4"
                  className="animate-pulse-lava-rock" />
        </g>
    </svg>
);

const DispenserIcon: React.FC<{ type: 'lava' | 'ice' }> = ({ type }) => {
    const mainColor = type === 'lava' ? '#ff6b35' : '#6ecbff';
    const darkColor = type === 'lava' ? '#c94a1a' : '#3a94c9';
    const dripColor = type === 'lava' ? '#ff6b35' : '#6ecbff';

    return (
        <svg viewBox="0 0 40 40" className="w-full h-full overflow-visible">
            {/* Faucet body */}
            <rect x="5" y="0" width="30" height="25" fill="#4a5568" rx="2"/>
            <rect x="8" y="3" width="24" height="20" fill="#2d3748" rx="1"/>
            {/* Pipe */}
            <path d="M 15,25 V 35 H 25 V 25 Z" fill="#4a5568" />
            <path d="M 15,35 C 15,40 25,40 25,35" fill="#4a5568" />
            <circle cx="20" cy="20" r="12" fill={darkColor} />
            <circle cx="20" cy="20" r="10" fill={mainColor} className="animate-pulse" />
            {/* Dripping animation */}
            <circle cx="20" cy="35" r="4" fill={dripColor} className="animate-drip" />
        </svg>
    );
};

const MassConverterIcon: React.FC = () => (
    <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="rgba(0,0,0,0.2)" rx="4" />
        <circle cx="20" cy="20" r="16" fill="#4a044e" stroke="#a21caf" strokeWidth="2" className="animate-pulse-inverter" />
        <g style={{ transformOrigin: '20px 20px'}} className="animate-spin-slow">
            <path d="M 20 8 L 12 16 H 17 V 23 H 23 V 16 H 28 Z" fill="#f0abfc" />
            <path d="M 20 32 L 12 24 H 17 V 17 H 23 V 24 H 28 Z" fill="#a855f7" />
        </g>
    </svg>
);

const getTileComponent = (tile: TileType, key: string, props: TileComponentProps) => {
  const { levelPhase, row, col, grid, slotStates, logicGateStates, absoluteDoorStates, isBalanceDoorOpen, level } = props;
  
  switch (tile) {
    case TileType.WALL:
      return (
        <div key={key} className="bg-gray-800 w-full h-full" style={{ imageRendering: 'pixelated' }}>
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <g fill="#374151" stroke="#1f2937" strokeWidth="1.5">
              <path d="M 8,12 C 4,12 4,18 8,18 S 12,18 12,14 C 12,10 8,10 8,12 Z" /><polygon points="52,8 58,10 56,16 50,14" /><path d="M 58,50 C 62,50 62,56 58,56 S 54,56 54,52 C 54,48 58,48 58,50 Z" /><polygon points="5,58 12,55 8,60" /><polygon points="8,30 14,28 12,36 6,34" /><path d="M 50,25 C 54,25 54,31 50,31 S 46,31 46,27 C 46,23 50,23 50,25 Z" /><polygon points="25,58 32,55 28,60" />
            </g>
            <polygon points="10,50 20,20 45,15 55,35 40,55 15,55" fill="#4b5563" stroke="#1f2937" strokeWidth="2"/><polygon points="20,20 45,15 40,25 25,25" fill="#6b7280"/><polygon points="15,55 40,55 35,45 20,45" fill="#374151"/><polygon points="22,22 28,20 26,25 22,27" fill="#9ca3af"/>
          </svg>
        </div>
      );
    case TileType.GOAL:
      return (
        <div key={key} className="bg-gray-800 flex items-center justify-center">
          <div className="w-3/4 h-3/4 bg-purple-900 rounded-t-full border-t-4 border-l-4 border-r-4 border-purple-500 animate-pulse"></div>
        </div>
      );
    case TileType.DOOR_STAGE_1: {
      const isOpen = levelPhase > 1;
      if (grid[row]?.[col + 1] === TileType.DOOR_STAGE_1) return <WideDoor key={key} open={isOpen} />;
      if (grid[row]?.[col - 1] === TileType.DOOR_STAGE_1) return null;
      return <LogicGate key={key} open={isOpen} color="red" />;
    }
    case TileType.DOOR_STAGE_2: {
       const isOpen = levelPhase > 2;
       if (grid[row]?.[col + 1] === TileType.DOOR_STAGE_2) return <WideDoor key={key} open={isOpen} />;
       if (grid[row]?.[col - 1] === TileType.DOOR_STAGE_2) return null;
       return <LogicGate key={key} open={isOpen} color="red" />;
    }
    case TileType.DOOR_ABS: {
      const isOpen = !!absoluteDoorStates[`${row}-${col}`];
      if (grid[row]?.[col + 1] === TileType.DOOR_ABS) return <AbsoluteDoor key={key} open={isOpen} />;
      if (grid[row]?.[col - 1] === TileType.DOOR_ABS) return null;
      return <div key={key} className="bg-gray-900"></div>; // Should not happen with 2-wide doors
    }
     case TileType.DOOR_STAGE_3: {
      const isOpen = !!logicGateStates['main_gate'];
      if (grid[row]?.[col + 1] === TileType.DOOR_STAGE_3) return <WideDoor key={key} open={isOpen} color="green"/>;
      if (grid[row]?.[col - 1] === TileType.DOOR_STAGE_3) return null;
       return <div key={key} className="bg-gray-900"></div>;
    }
    case TileType.SECRET_CHAMBER_GATE:
       return <LogicGate key={key} open={!!logicGateStates['secret_chamber_gate']} color="red" />;
    case TileType.LOGIC_GATE:
        return <LogicGate key={key} open={!!logicGateStates['main_gate']} color="green" />;
    case TileType.BALANCE_DOOR:
        return <HorizontalGate key={key} open={isBalanceDoorOpen} />;
    case TileType.EMITTER:
        return (
            <div key={key} className="bg-gray-900 w-full h-full p-1">
                <LavaRockEmitterIcon />
            </div>
        );
    case TileType.DISPENSER_LAVA:
        return <div key={key}><DispenserIcon type="lava"/></div>;
    case TileType.DISPENSER_ICE:
        return <div key={key}><DispenserIcon type="ice"/></div>;
    case TileType.NUMERIC_DEPOSIT:
    case TileType.LOGIC_CALIBRATOR:
        return (
            <div key={key} className="tile-floor flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-black bg-opacity-50 rounded-md border-2 animate-pulse-deposit" />
            </div>
        );
    case TileType.ASSEMBLER_PLATE:
        return (
            <div key={key} className="tile-floor flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-black bg-opacity-50 rounded-md border-2 animate-pulse-deposit border-green-400" />
            </div>
        );
    case TileType.MASS_CONVERTER:
        return <div key={key} className="tile-floor p-1"><MassConverterIcon /></div>;
    case TileType.INVERTER:
        return (
            <div key={key} className="tile-floor flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                    <rect width="40" height="40" fill="rgba(0,0,0,0.2)" />
                    <circle cx="20" cy="20" r="16" className="animate-pulse-inverter" strokeWidth="2" />
                    <g style={{ transformOrigin: '20px 20px'}} className="animate-spin-slow">
                        <path d="M 20 4 A 16 16 0 0 1 20 36" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M 20 4 A 16 16 0 0 0 20 36" fill="none" stroke="#6d28d9" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx="20" cy="12" r="3" fill="white" />
                        <circle cx="20" cy="28" r="3" fill="#6d28d9" />
                    </g>
                </svg>
            </div>
        );
    case TileType.SCANNER_PLATE:
        return (
            <div key={key} className="tile-floor flex items-center justify-center">
                <div className="w-full h-full p-0.5">
                    <div className="w-full h-full bg-gray-900 rounded-md animate-pulse-blue flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 opacity-30 text-sky-300">
                           <path fill="currentColor" d="M15.5,14h-.79l-.28-.27a6.5,6.5,0,0,0,1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.5,6.5,0,0,0-8.04,4.04c-1.21,3.53,1.2,7.2,4.68,7.5,1.06.09,2.07-.17,2.91-.69l.27.28v.79l5,5L20.49,19l-4.99-5Zm-6,0C7,14,5,12,5,9.5S7,5,9.5,5,14,7,14,9.5,12,14,9.5,14Z"/>
                        </svg>
                    </div>
                </div>
            </div>
        );
    case TileType.PLATE_ABS: {
      const link = level.absoluteLinks?.find(l => l.plate_pos.row === row && l.plate_pos.col === col);
      return (
        <div key={key} className="tile-floor flex items-center justify-center">
          <div className="w-full h-full p-0.5">
            <div className="w-full h-full bg-gray-800 rounded-md animate-pulse-pressure-plate flex items-center justify-center">
              <span className="font-arcade text-purple-300 text-lg" style={{textShadow: '1px 1px 2px black'}}>
                {link ? `|${link.value}|` : '|?|'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    case TileType.SLOT_NEG:
    case TileType.SLOT_POS: {
      const slotKey = `${row}-${col}`;
      const state = slotStates[slotKey] || 'empty';
      const sign = tile === TileType.SLOT_NEG ? '-' : '+';
      return (
         <div key={key} className={`tile-floor relative`}>
            <div className={`absolute inset-0.5 slot-base slot-${state} flex items-center justify-center`}><span className="text-white opacity-10 font-bold text-2xl">{sign}</span></div>
         </div>
      );
    }
    case TileType.COMPARISON_SLOT_A:
    case TileType.COMPARISON_SLOT_B:
       return <div key={key} className="tile-floor"><div className="w-full h-full bg-black bg-opacity-30 inset-0.5 border-2 border-dashed rounded-md animate-pulse-blue"></div></div>;
    case TileType.SYNTH_SLOT_A:
    case TileType.SYNTH_SLOT_B:
        return <div key={key} className="tile-floor"><div className="w-full h-full bg-gray-900 bg-opacity-40 inset-0.5 border-2 border-dashed rounded-lg animate-pulse-blue"></div></div>;
    case TileType.SYNTH_CORE:
        return (
            <div key={key} className="tile-floor">
                <div className="w-full h-full bg-black bg-opacity-20 rounded-full animate-pulse-synth-core flex items-center justify-center">
                    <span 
                        className="font-arcade text-3xl text-sky-300 animate-spin-slow opacity-70" 
                        style={{ textShadow: '0 0 8px #67e8f9' }}
                        aria-hidden="true"
                    >
                        +
                    </span>
                </div>
            </div>
        );
    case TileType.SYNTH_OUTPUT:
        return (
            <div key={key} className="tile-floor flex items-center justify-center">
                <svg width="100%" height="100%"><defs><pattern id="synth_out" patternUnits="userSpaceOnUse" width="10" height="10"><path d="M-5,0 L0,5 L5,0 L0,-5 Z" strokeWidth="1" stroke="#3b82f6" fill="rgba(96, 165, 250, 0.2)"></path></pattern></defs><rect width="100%" height="100%" fill="url(#synth_out)"></rect></svg>
            </div>
        );
    case TileType.COMPARISON_GT:
    case TileType.COMPARISON_LT:
    case TileType.COMPARISON_EQ:
      let operator = ' ';
      if (tile === TileType.COMPARISON_GT) operator = '>';
      if (tile === TileType.COMPARISON_LT) operator = '<';
      if (tile === TileType.COMPARISON_EQ) operator = '=';
      return <div key={key} className="tile-floor flex items-center justify-center"><span className="font-arcade text-3xl text-yellow-300 opacity-50" style={{ textShadow: '1px 1px 2px black' }}>{operator}</span></div>;
    case TileType.BALANCE_SLOT_A:
    case TileType.BALANCE_SLOT_B: {
        const { balanceState } = props;
        const isSideA = tile === TileType.BALANCE_SLOT_A;
        const isDown = (isSideA && balanceState === 'A_down') || (!isSideA && balanceState === 'B_down');
        const isUp = (isSideA && balanceState === 'B_down') || (!isSideA && balanceState === 'A_down');
        let platformStyle = 'bg-gray-700 bg-opacity-30 border-gray-500';
        if (isDown) platformStyle = 'bg-red-900 bg-opacity-50 border-red-600 shadow-inner shadow-black';
        if (isUp) platformStyle = 'bg-green-900 bg-opacity-50 border-green-500 shadow-lg shadow-green-500/30 scale-105';
        return <div key={key} className="tile-floor"><div className={`w-full h-full border-4 rounded-md transition-all duration-300 transform ${platformStyle}`}></div></div>;
    }
    case TileType.MOBILE_PLATFORM: {
      const { mobilePlatformUp } = props;
      const platformStyle = mobilePlatformUp 
        ? 'bg-green-500 shadow-lg shadow-green-500/50 scale-100' 
        : 'bg-gray-900 shadow-inner shadow-black scale-90';
      return <div key={key} className="tile-floor flex items-center justify-center p-1"><div className={`w-full h-full rounded-sm ${platformStyle} transition-all duration-500`}></div></div>;
    }
    case TileType.KEY:
      return <div key={key} className="tile-floor"></div>;
    case TileType.FLOOR:
    default:
      return <div key={key} className="tile-floor"></div>;
  }
};


const GameBoard: React.FC<GameBoardProps> = ({ 
  level, playerPosition, cubes, prizes, keys, facingDirection, levelPhase, 
  effects, onEffectComplete, prizeEffects, onPrizeEffectComplete, zeroEffects, onZeroEffectComplete, 
  slotStates, logicGateStates, absoluteDoorStates, balanceState, balanceSumA, balanceSumB, mobilePlatformUp, isBalanceDoorOpen,
  isRevealedCubeIds, interactiveRocks, onRockLanded, numericDepositStates, logicCalibratorStates, fireballs,
  heartbreakEffects, onHeartbreakComplete, secretDoorPositions
}) => {
  const { grid } = level;
  const boardHeight = grid.length * TILE_SIZE;
  const boardWidth = grid[0].length * TILE_SIZE;

  const tileProps: TileComponentProps = { level, levelPhase, grid, slotStates, logicGateStates, absoluteDoorStates, balanceState, mobilePlatformUp, isBalanceDoorOpen, row: 0, col: 0 };

  const numericDepositOverlays = useMemo(() => {
    return level.numericDeposits?.map(deposit => {
        const state = numericDepositStates[deposit.id] || { current: 0, target: deposit.target };
        const isCorrect = state.current === state.target;
        const textColor = isCorrect ? 'text-green-400' : 'text-yellow-400';

        if (deposit.positions.length === 0) return null;

        // Calculate bounding box to correctly position the overlay over multi-cell areas
        const minRow = Math.min(...deposit.positions.map(p => p.row));
        const minCol = Math.min(...deposit.positions.map(p => p.col));
        const maxCol = Math.max(...deposit.positions.map(p => p.col));

        const width = (maxCol - minCol + 1) * TILE_SIZE;
        
        return (
            <div 
                key={deposit.id} 
                className={`absolute pointer-events-none z-10 font-arcade text-center p-1 bg-black bg-opacity-60 rounded ${textColor}`}
                style={{
                    top: `${(minRow - 0.8) * TILE_SIZE}px`, // Position above the deposit area
                    left: `${minCol * TILE_SIZE}px`,
                    width: `${width}px`,
                    textShadow: '1px 1px 2px black',
                    fontSize: '0.8rem'
                }}
            >
                {state.current} / {deposit.target > 0 ? `+${deposit.target}` : deposit.target}
            </div>
        );
    });
  }, [level.numericDeposits, numericDepositStates]);

  const logicCalibratorOverlays = useMemo(() => {
    return level.logicCalibrators?.map(cal => {
        const state = logicCalibratorStates[cal.id] || { current: 0, isCorrect: false };
        const textColor = state.isCorrect ? 'text-green-400' : 'text-yellow-400';
        const operator = cal.operator === 'gt' ? '>' : cal.operator === 'lt' ? '<' : '=';
        const targetText = cal.target > 0 ? `+${cal.target}` : cal.target;

        if (cal.positions.length === 0) return null;

        const minRow = Math.min(...cal.positions.map(p => p.row));
        const minCol = Math.min(...cal.positions.map(p => p.col));
        const maxCol = Math.max(...cal.positions.map(p => p.col));
        const width = (maxCol - minCol + 1) * TILE_SIZE;
        
        return (
            <div 
                key={cal.id} 
                className={`absolute pointer-events-none z-10 font-arcade text-center p-1 bg-black bg-opacity-60 rounded ${textColor}`}
                style={{
                    top: `${(minRow - 0.8) * TILE_SIZE}px`,
                    left: `${minCol * TILE_SIZE}px`,
                    width: `${width}px`,
                    textShadow: '1px 1px 2px black',
                    fontSize: '0.8rem'
                }}
            >
                {`${state.current} ${operator} ${targetText}`}
            </div>
        );
    });
  }, [level.logicCalibrators, logicCalibratorStates]);


  return (
    <div className="relative bg-black" style={{ width: boardWidth, height: boardHeight }}>
      <div
        className="grid absolute"
        style={{
          gridTemplateRows: `repeat(${grid.length}, ${TILE_SIZE}px)`,
          gridTemplateColumns: `repeat(${grid[0].length}, ${TILE_SIZE}px)`,
          width: boardWidth,
          height: boardHeight,
        }}
      >
        {grid.flat().map((tile, index) => {
          const row = Math.floor(index / grid[0].length);
          const col = index % grid[0].length;
          return getTileComponent(tile, `tile-${index}`, { ...tileProps, row, col });
        })}
      </div>

      {numericDepositOverlays}
      {logicCalibratorOverlays}
      
      {secretDoorPositions?.map((pos, index) => (
        <div
            key={`secret-door-${index}`}
            className="absolute bg-yellow-400/80 animate-pulse-glow rounded-full"
            style={{
                top: `${pos.row * TILE_SIZE}px`,
                left: `${pos.col * TILE_SIZE}px`,
                width: '4px',
                height: `${TILE_SIZE}px`,
                zIndex: 1, // Above tile, below character
            }}
        />
      ))}

      {level.balanceFulcrum && (
        <>
          <div className="absolute" style={{ 
            top: `${level.balanceFulcrum.row * TILE_SIZE}px`, 
            left: `${(level.balanceFulcrum.col - 2) * TILE_SIZE}px`, 
            width: `${4 * TILE_SIZE}px`, 
            height: `${TILE_SIZE}px`, 
            pointerEvents: 'none', 
            zIndex: 1
          }}>
            <BalanceIndicator balanceState={balanceState} />
          </div>
          <div className="absolute font-arcade text-white text-center p-1 bg-black bg-opacity-75 rounded flex items-center justify-center" style={{
            top: `${(level.balanceFulcrum.row + 1) * TILE_SIZE}px`,
            left: `${(level.balanceFulcrum.col - 2) * TILE_SIZE}px`,
            width: `${TILE_SIZE}px`,
            height: `${TILE_SIZE}px`,
            textShadow: '1px 1px 2px black'
          }}>
             {balanceSumA}
          </div>
           <div className="absolute font-arcade text-white text-center p-1 bg-black bg-opacity-75 rounded flex items-center justify-center" style={{
            top: `${(level.balanceFulcrum.row + 1) * TILE_SIZE}px`,
            left: `${(level.balanceFulcrum.col + 1) * TILE_SIZE}px`,
            width: `${TILE_SIZE}px`,
            height: `${TILE_SIZE}px`,
            textShadow: '1px 1px 2px black'
          }}>
             {balanceSumB}
          </div>
        </>
      )}
      
      {prizes.map(prize => (
        <Prize key={prize.id} data={prize} />
      ))}
      
      {keys.map(key => (
        <Key key={key.id} data={key} />
      ))}

      {cubes.map(cube => (
        <Cube 
            key={cube.id} 
            data={cube} 
            isRevealed={isRevealedCubeIds.includes(cube.id)}
        />
      ))}

      {interactiveRocks.map(rock => (
        <InteractiveRock key={rock.id} data={rock} onLand={onRockLanded} />
      ))}
      
      {fireballs.map(fireball => (
        <Fireball key={fireball.id} data={fireball} />
      ))}

      {effects.map(effect => (
        <EvaporationEffect
          key={effect.id}
          position={effect.position}
          onComplete={() => onEffectComplete(effect.id)}
        />
      ))}
      
      {prizeEffects.map(effect => (
        <EvaporationEffect
          key={effect.id}
          position={effect.position}
          onComplete={() => onPrizeEffectComplete(effect.id)}
        />
      ))}

      {zeroEffects.map(effect => (
        <NeutralizationZero
          key={effect.id}
          position={effect.position}
          onComplete={() => onZeroEffectComplete(effect.id)}
        />
      ))}
      
      <Character position={playerPosition} facingDirection={facingDirection} />
      
      {heartbreakEffects.map(effect => (
        <Heartbreak
          key={effect.id}
          id={effect.id}
          position={effect.position}
          onComplete={onHeartbreakComplete}
        />
      ))}
    </div>
  );
};

export default GameBoard;