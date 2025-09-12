
import React from 'react';
import ArcadeButton from './ArcadeButton';
import GameBackground from './GameBackground';

interface WelcomeScreenProps {
  onWatchVideo: () => void;
  onGoToGame: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onWatchVideo, onGoToGame }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans text-white p-4">
      <div className="absolute inset-0 z-0">
        <GameBackground />
      </div>
      <div className="relative z-10 w-full max-w-6xl p-8 border-8 rounded-xl bg-gray-200 text-black shadow-2xl animate-pulse-lava-frame"
           style={{ borderColor: '#4a2c2a' }}>
        <h1 className="font-arcade text-5xl md:text-6xl text-center text-purple-700" style={{ textShadow: '2px 2px 0px #c4b5fd' }}>
          ¡Bienvenido a LIGA-Z!
        </h1>

        <div className="font-arcade text-base md:text-lg mt-8 text-gray-800 space-y-4 text-left leading-relaxed px-4">
          <p>
            LIGA-Z: Aventura de Enteros es un juego de puzzles de vista cenital. En el rol del héroe ZETA, tu misión es resolver acertijos numéricos en complejos laberintos. Para ello, debes empujar cubos de lava (números positivos) y de hielo (números negativos).
          </p>
          <p>
            La mecánica principal consiste en juntar un cubo positivo y uno negativo del mismo valor para que se neutralicen y desaparezcan, despejando así el camino para avanzar.
          </p>
          <p className="mt-4">
            Para conocer el origen de este conflicto, te invito a revisar el video que narra la historia de los cubos de lava y hielo.
          </p>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-6">
          <ArcadeButton onClick={onWatchVideo} color="blue" size="lg">
            Ver Video
          </ArcadeButton>
          <ArcadeButton onClick={onGoToGame} color="green" size="lg">
            Ir al Juego
          </ArcadeButton>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
