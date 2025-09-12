
import React, { useState, useRef } from 'react';
import ArcadeButton from './ArcadeButton';
import GameBackground from './GameBackground';

interface VideoIntroProps {
  onComplete: () => void;
}

const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
  const videoUrl = 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/La%20Aventura%20de%20Z.mp4';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Due to browser policies, autoplaying videos must start muted.
  // This function allows the user to unmute with a single interaction.
  const handleUnmute = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans">
      <div className="absolute inset-0 z-0">
        <GameBackground />
      </div>
      <div className="relative z-10 w-full max-w-6xl p-2 border-4 rounded-xl animate-pulse-lava-frame bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted // Autoplay requires the video to be muted initially
          onEnded={onComplete}
          className="w-full rounded-lg"
          aria-label="Video de introducción a La Aventura de Z"
        />
        
        {isMuted && (
          <div 
            className="absolute inset-2 flex flex-col items-center justify-center bg-black bg-opacity-70 cursor-pointer rounded-lg"
            onClick={handleUnmute}
            role="button"
            aria-label="Activar sonido"
          >
            <div className="w-20 h-20 text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </div>
            <p className="font-arcade text-white text-2xl">Haz clic para activar el sonido</p>
          </div>
        )}
      </div>
      <div className="relative z-10 mt-4">
        <ArcadeButton onClick={onComplete} color="purple" size="md">
          Saltar
        </ArcadeButton>
      </div>
    </div>
  );
};

export default VideoIntro;
