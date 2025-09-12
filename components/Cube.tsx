

import React from 'react';
import type { Cube as CubeData } from '../types';

interface CubeProps {
  data: CubeData;
  isRevealed?: boolean;
  tileSize: number;
}

// FIX: Export IceCubeIcon to resolve import error in GeneralHelpModal.tsx.
export const IceCubeIcon: React.FC = () => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g transform="scale(1.25)" transform-origin="center">
      {/* Cubo base */}
      <rect x="12" y="12" width="40" height="40" rx="6" ry="6"
            fill="#6ecbff" stroke="#1a4a73" strokeWidth="2"/>

      {/* Brillos */}
      <rect x="18" y="16" width="10" height="6" rx="2" ry="2" fill="#b3e5ff"/>
      <rect x="30" y="14" width="8" height="4" rx="2" ry="2" fill="#d6f4ff"/>

      {/* Sombras internas */}
      <rect x="14" y="34" width="30" height="10" rx="4" ry="4" fill="#3a94c9" opacity="0.6"/>

      {/* Gotas alrededor */}
      <circle cx="10" cy="45" r="3" fill="#6ecbff" stroke="#1a4a73" strokeWidth="1"/>
      <circle cx="52" cy="20" r="2.5" fill="#6ecbff" stroke="#1a4a73" strokeWidth="1"/>
      <circle cx="48" cy="50" r="3" fill="#6ecbff" stroke="#1a4a73" strokeWidth="1"/>
    </g>
  </svg>
);

// FIX: Export LavaCubeIcon to resolve import error in GeneralHelpModal.tsx.
export const LavaCubeIcon: React.FC = () => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g transform="scale(1.25)" transform-origin="center">
      {/* Cubo base */}
      <rect x="12" y="12" width="40" height="40" rx="6" ry="6"
            fill="#ff6b35" stroke="#8b2f0a" strokeWidth="2"/>

      {/* Brillos (ascuas) */}
      <rect x="18" y="16" width="10" height="6" rx="2" ry="2" fill="#ffb44a"/>
      <rect x="30" y="14" width="8" height="4" rx="2" ry="2" fill="#ffe177"/>

      {/* Sombras internas (brillo) */}
      <rect x="14" y="34" width="30" height="10" rx="4" ry="4" fill="#c94a1a" opacity="0.6"/>

      {/* Chispas alrededor */}
      <circle cx="10" cy="45" r="3" fill="#ff6b35" stroke="#8b2f0a" strokeWidth="1"/>
      <circle cx="52" cy="20" r="2.5" fill="#ff6b35" stroke="#8b2f0a" strokeWidth="1"/>
      <circle cx="48" cy="50" r="3" fill="#ff6b35" stroke="#8b2f0a" strokeWidth="1"/>
    </g>
  </svg>
);

// FIX: Export ZeroCubeIcon to resolve import error in GeneralHelpModal.tsx.
export const ZeroCubeIcon: React.FC = () => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g transform="scale(1.25)" transform-origin="center">
      {/* Cubo de piedra base */}
      <rect x="12" y="12" width="40" height="40" rx="6" ry="6"
            fill="#a1a1aa" stroke="#4a5568" strokeWidth="2"/>

      {/* Brillos sutiles */}
      <rect x="18" y="16" width="10" height="6" rx="2" ry="2" fill="#d4d4d8"/>
      
      {/* Sombras */}
      <rect x="14" y="34" width="30" height="10" rx="4" ry="4" fill="#71717a" opacity="0.6"/>
      
      {/* Grietas */}
      <line x1="20" y1="20" x2="35" y2="38" stroke="#4a5568" strokeWidth="1.5" />
      <line x1="45" y1="18" x2="40" y2="30" stroke="#4a5568" strokeWidth="1" />
    </g>
  </svg>
);

export const MemoryCubeIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <g transform="scale(1.25)" transform-origin="center">
        {/* Cubo de metal base */}
        <rect x="12" y="12" width="40" height="40" rx="6" ry="6"
              fill="#71717a" stroke="#27272a" strokeWidth="2"/>
  
        {/* Brillos metálicos */}
        <rect x="18" y="16" width="10" height="6" rx="2" ry="2" fill="#a1a1aa"/>
        
        {/* Sombras */}
        <rect x="14" y="34" width="30" height="10" rx="4" ry="4" fill="#52525b" opacity="0.6"/>
        
        {/* Símbolo de pregunta */}
        <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle" 
              fontFamily="'Press Start 2P', cursive" fontSize="20" fill="#e4e4e7"
              stroke="#18181b" strokeWidth="1"
        >?</text>
      </g>
    </svg>
  );


const Cube: React.FC<CubeProps> = ({ data, isRevealed, tileSize }) => {
  const { type, value, position, status, isMemory } = data;

  const style = {
    top: `${position.row * tileSize}px`,
    left: `${position.col * tileSize}px`,
    width: `${tileSize}px`,
    height: `${tileSize}px`,
  };

  const statusClasses = status === 'evaporating'
    ? 'opacity-0 scale-0'
    : 'opacity-100 scale-100';

  const getCubeIcon = () => {
    if (isMemory && !isRevealed) {
        return <MemoryCubeIcon />;
    }
    if (value === 0) {
      return <ZeroCubeIcon />;
    }
    return type === 'ice' ? <IceCubeIcon /> : <LavaCubeIcon />;
  };

  return (
    <div
      style={style}
      className={`absolute flex items-center justify-center p-1 transition-all duration-200 ease-in ${statusClasses}`}
      role="img"
      aria-label={`Cubo de ${type} con valor ${value}`}
    >
      <div className="w-full h-full relative flex items-center justify-center">
        <div className="absolute inset-0">
          {getCubeIcon()}
        </div>
        <span
          className="relative text-xl font-bold text-white"
          style={{ textShadow: '0px 0px 5px black, 0px 0px 5px black' }}
        >
          {(isRevealed || !isMemory) && (value > 0 ? `+${value}` : value)}
        </span>
      </div>
    </div>
  );
};

export default Cube;