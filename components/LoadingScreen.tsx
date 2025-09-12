import React, { useEffect } from 'react';
import GameBackground from './GameBackground';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans text-white p-4">
      <div className="absolute inset-0 z-0">
        <GameBackground />
      </div>
      <div className="relative z-10 text-center">
        <div className="bg-black bg-opacity-70 border-4 border-purple-500 rounded-lg p-8 shadow-2xl">
          <h1 className="font-arcade text-3xl text-yellow-300" style={{ textShadow: '2px 2px #000' }}>
            LIGA-Z: Aventura de Enteros
          </h1>
          <p className="font-arcade text-2xl mt-6 animate-pulse-loading">
            Cargando...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
