import React, { useEffect } from 'react';
import { TILE_SIZE } from '../constants';
import type { Position } from '../types';

interface HeartbreakProps {
  id: number;
  position: Position;
  onComplete: (id: number) => void;
}

const Heartbreak: React.FC<HeartbreakProps> = ({ id, position, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(id), 1000); // Duration matches animation
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${position.col * TILE_SIZE}px`,
    top: `${position.row * TILE_SIZE}px`,
    width: TILE_SIZE,
    height: TILE_SIZE,
    zIndex: 60, // Above everything
    pointerEvents: 'none',
  };

  return (
    <div style={style} className="animate-fade-out-up flex items-center justify-center">
      <svg viewBox="0 0 24 24" className="w-full h-full text-red-500" style={{ filter: 'drop-shadow(0 0 5px #ef4444)' }}>
        {/* Heart shape */}
        <path 
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
        {/* Crack */}
        <path
          d="M12 6l-1 5 3 1.5-1 4"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="rotate(10 12 12)"
        />
      </svg>
    </div>
  );
};

export default Heartbreak;