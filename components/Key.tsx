
import React from 'react';
import type { Key as KeyData } from '../types';
import { TILE_SIZE } from '../constants';

interface KeyProps {
  data: KeyData;
}

// FIX: Export KeyIcon to resolve import error in GeneralHelpModal.tsx.
export const KeyIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
    className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
    <path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" 
          stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


const Key: React.FC<KeyProps> = ({ data }) => {
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
    : 'opacity-100 scale-100 animate-pulse-yellow';

  return (
    <div
      style={style}
      className={`absolute flex items-center justify-center p-1.5 transition-all duration-300 ease-in-out ${statusClasses}`}
      role="img"
      aria-label="Llave dorada"
    >
        <KeyIcon />
    </div>
  );
};

export default Key;
