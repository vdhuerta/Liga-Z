import React from 'react';
import type { Direction } from '../types';

interface TouchControlsProps {
  onMove: (direction: Direction) => void;
  onAction: () => void;
}

const ArrowIcon: React.FC<{ rotation: number }> = ({ rotation }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-2/3 w-2/3 text-white" // Made responsive
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const TouchControls: React.FC<TouchControlsProps> = ({ onMove, onAction }) => {
  const handleTouch = (e: React.TouchEvent, action: () => void) => {
    e.preventDefault();
    action();
  };

  const actionButtonSize = 'clamp(4.5rem, 15vmin, 6rem)';
  const dPadSize = 'clamp(8rem, 25vmin, 10rem)';

  return (
    <>
      {/* Action Button (Left) */}
      <div className="fixed left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30">
        <button
          className="bg-red-600/75 rounded-full flex items-center justify-center border-4 border-red-800/90 active:bg-red-500/90 transition-colors"
          style={{ width: actionButtonSize, height: actionButtonSize }}
          onTouchStart={(e) => handleTouch(e, onAction)}
          aria-label="Acción de Rebote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-1/2 w-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l-5 2 1-6z" />
          </svg>
        </button>
      </div>

      {/* D-Pad (Right) - New cross layout */}
      <div
        className="fixed right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 relative"
        style={{ width: dPadSize, height: dPadSize }}
      >
        <button
          className="absolute top-0 left-1/3 w-1/3 h-1/2 bg-gray-800/75 rounded-t-lg active:bg-gray-700/90 flex items-center justify-center"
          onTouchStart={(e) => handleTouch(e, () => onMove('up'))}
          aria-label="Mover hacia arriba"
        >
          <ArrowIcon rotation={0} />
        </button>
        <button
          className="absolute bottom-0 left-1/3 w-1/3 h-1/2 bg-gray-800/75 rounded-b-lg active:bg-gray-700/90 flex items-center justify-center"
          onTouchStart={(e) => handleTouch(e, () => onMove('down'))}
          aria-label="Mover hacia abajo"
        >
          <ArrowIcon rotation={180} />
        </button>
        <button
          className="absolute left-0 top-1/3 w-1/2 h-1/3 bg-gray-800/75 rounded-l-lg active:bg-gray-700/90 flex items-center justify-center"
          onTouchStart={(e) => handleTouch(e, () => onMove('left'))}
          aria-label="Mover hacia la izquierda"
        >
          <ArrowIcon rotation={-90} />
        </button>
        <button
          className="absolute right-0 top-1/3 w-1/2 h-1/3 bg-gray-800/75 rounded-r-lg active:bg-gray-700/90 flex items-center justify-center"
          onTouchStart={(e) => handleTouch(e, () => onMove('right'))}
          aria-label="Mover hacia la derecha"
        >
          <ArrowIcon rotation={90} />
        </button>
      </div>
    </>
  );
};

export default TouchControls;