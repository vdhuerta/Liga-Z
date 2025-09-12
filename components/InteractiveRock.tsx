import React, { useState, useEffect } from 'react';
import type { InteractiveRock as RockData } from '../types';
import { TILE_SIZE } from '../constants';

interface InteractiveRockProps {
  data: RockData;
  onLand: (rockId: number) => void;
}

const RockIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        {/* Cuerpo de la roca */}
        <path d="M 12,32 C 12,12 52,12 52,32 S 42,52 32,52 S 12,52 12,32 Z"
              fill="#4a5568" stroke="#1f2937" strokeWidth="2.5" />
        <path d="M 18,35 C 18,20 46,20 46,35 S 40,48 32,48 S 18,50 18,35 Z"
              fill="#2d3748" opacity="0.6"/>
        
        {/* Borde de lava animado */}
        <path d="M 12,32 C 12,12 52,12 52,32 S 42,52 32,52 S 12,52 12,32 Z"
              fill="none" stroke="#ff6b35" strokeWidth="4"
              className="animate-pulse-lava-rock" />

        {/* Grietas */}
        <line x1="25" y1="28" x2="38" y2="40" stroke="#1f2937" strokeWidth="1.5" />
        <line x1="45" y1="30" x2="35" y2="35" stroke="#1f2937" strokeWidth="1" />
    </svg>
);


const InteractiveRock: React.FC<InteractiveRockProps> = ({ data, onLand }) => {
    const { path, id } = data;
    const [pathIndex, setPathIndex] = useState(0);

    // This effect handles the step-by-step movement animation
    useEffect(() => {
        // If we are at the last step, set a timer to call onLand after the animation finishes
        if (pathIndex >= path.length - 1) {
            const landTimer = setTimeout(() => {
                onLand(id);
            }, 600); // This should match the CSS transition duration
            return () => clearTimeout(landTimer);
        }

        // Set a timer to advance to the next step in the path
        const hopTimer = setTimeout(() => {
            setPathIndex(prev => prev + 1);
        }, 600); // Duration of each "hop"

        return () => clearTimeout(hopTimer);
    }, [pathIndex, path.length, id, onLand]);
    
    const currentPos = path[pathIndex];
    if (!currentPos) return null; // Should not happen, but a good safeguard

    const style: React.CSSProperties = {
        top: `${currentPos.row * TILE_SIZE}px`,
        left: `${currentPos.col * TILE_SIZE}px`,
        width: `${TILE_SIZE}px`,
        height: `${TILE_SIZE}px`,
        transition: 'top 0.5s ease-in-out, left 0.5s ease-in-out',
        zIndex: 50,
    };

    return (
        <div style={style} className="absolute flex items-center justify-center p-1">
            <div className="w-full h-full">
                <RockIcon />
            </div>
        </div>
    );
};

export default InteractiveRock;