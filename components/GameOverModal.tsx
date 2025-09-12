
import React from 'react';
import ArcadeButton from './ArcadeButton';
import { soundManager } from './soundManager';

interface GameOverModalProps {
  onRestart: () => void;
  message: string;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart, message }) => {
  const handleRestart = () => {
    soundManager.play('modalClose');
    onRestart();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 font-arcade">
      <div className="bg-gray-900 border-4 border-red-500 rounded-lg p-8 w-full max-w-md text-red-500 shadow-2xl text-center">
        <h2 className="text-6xl mb-8 animate-pulse" style={{ textShadow: '3px 3px #000' }}>
          GAME OVER
        </h2>
        <p className="text-white text-lg mb-8">
          {message || 'Has sido derrotado.'}
        </p>
        {/* FIX: Explicitly call onRestart to prevent passing the MouseEvent from onClick, resolving a potential argument mismatch. */}
        <ArcadeButton onClick={handleRestart} color="red" size="lg">
          OK
        </ArcadeButton>
      </div>
    </div>
  );
};

export default GameOverModal;