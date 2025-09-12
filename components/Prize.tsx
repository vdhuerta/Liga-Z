import React from 'react';
import type { Prize as PrizeData } from '../types';
import { TILE_SIZE } from '../constants';

interface PrizeProps {
  data: PrizeData;
}

export const TrophyIcon: React.FC = () => (
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g transform="scale(1.1)" transform-origin="center">
      {/* Base */}
      <rect x="20" y="50" width="24" height="6" rx="2" fill="#a88532" stroke="#423411" strokeWidth="1.5" />
      {/* Stem */}
      <rect x="28" y="42" width="8" height="8" fill="#e6b33e" stroke="#423411" strokeWidth="1.5" />
      {/* Cup */}
      <path d="M 18,20 C 18,10 46,10 46,20 L 46,42 L 18,42 Z" fill="#ffd700" stroke="#423411" strokeWidth="1.5" />
      {/* Handles */}
      <path d="M 18,25 C 8,25 8,35 18,35" fill="none" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
      <path d="M 46,25 C 56,25 56,35 46,35" fill="none" stroke="#ffd700" strokeWidth="3" strokeLinecap="round" />
       {/* Shine */}
      <path d="M 22,22 Q 28,24 25,38" fill="rgba(255, 255, 255, 0.5)" />
    </g>
  </svg>
);


const Prize: React.FC<PrizeProps> = ({ data }) => {
  const { position, status } = data;

  const style: React.CSSProperties = {
    top: `${position.row * TILE_SIZE}px`,
    left: `${position.col * TILE_SIZE}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    zIndex: 5,
  };

  const statusClasses = status === 'collected'
    ? 'opacity-0 scale-150'
    : 'opacity-100 scale-100';

  return (
    <div
      style={style}
      className={`absolute flex items-center justify-center p-1 transition-all duration-300 ease-in-out ${statusClasses}`}
      role="img"
      aria-label="Trofeo de premio"
    >
        <TrophyIcon />
    </div>
  );
};

export default Prize;