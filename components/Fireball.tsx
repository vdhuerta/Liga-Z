import React from 'react';
import { TILE_SIZE } from '../constants';
import type { Fireball as FireballData } from '../types';

interface FireballProps {
  data: FireballData;
}

const Fireball: React.FC<FireballProps> = ({ data }) => {
  const { col, y } = data;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${col * TILE_SIZE}px`,
    top: `${y}px`,
    width: TILE_SIZE,
    height: TILE_SIZE,
    zIndex: 45, // Above board but below character/effects
  };

  return (
    <div style={style} className="animate-fireball-glow">
      <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="fireballGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="20%" stopColor="#ffe177" />
            <stop offset="60%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="rgba(201, 74, 26, 0)" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="24" fill="url(#fireballGradient)" />
        <circle cx="32" cy="32" r="12" fill="#ffb44a" className="animate-pulse-lava-rock" />
      </svg>
    </div>
  );
};

export default Fireball;
