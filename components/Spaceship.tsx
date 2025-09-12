
import React from 'react';
// FIX: TILE_SIZE is obsolete; tileSize is now passed as a prop for dynamic sizing.

const GRID_WIDTH = 25;
const GRID_HEIGHT = 18;
const SHIP_WIDTH = 3; 
const SHIP_HEIGHT = 2; 

const shipPosition = {
  row: Math.floor((GRID_HEIGHT - SHIP_HEIGHT) / 2) - 1,
  col: Math.floor((GRID_WIDTH - SHIP_WIDTH) / 2),
};

interface SpaceshipProps {
  isDoorOpen: boolean;
  isDeparting: boolean;
  tileSize: number;
}

const Spaceship: React.FC<SpaceshipProps> = ({ isDoorOpen, isDeparting, tileSize }) => (
    <div
        className={`absolute pixel ${isDeparting ? 'animate-ship-depart' : ''}`}
        style={{
            // FIX: Use the tileSize prop for dynamic sizing.
            width: `${SHIP_WIDTH * tileSize}px`,
            height: `${(SHIP_HEIGHT + 2) * tileSize}px`,
            top: `${shipPosition.row * tileSize}px`,
            left: `${shipPosition.col * tileSize}px`,
        }}
    >
        <div className={isDeparting ? 'animate-ship-shake' : ''} style={{width: '100%', height: '100%'}}>
            <svg viewBox="0 0 120 120" width="100%" height="100%" className="overflow-visible">
                <g className="stroke" strokeWidth="1.5">
                    {/* Rampa (ahora marco de la puerta) */}
                    <polygon points="40,80 80,80 90,110 30,110" fill="var(--metal-2)"/>
                    <rect x="30" y="80" width="60" height="30" fill="#1f2937" />
                    <rect x="42" y="85" width="36" height="3" fill="#7b859c" className="stroke-none"/>
                    <rect x="42" y="93" width="36" height="3" fill="#7b859c" className="stroke-none"/>
                    <rect x="42" y="101" width="36" height="3" fill="#7b859c" className="stroke-none"/>

                    {/* Motores y fuselaje */}
                    <polygon points="0,30 30,30 40,80 10,80" fill="var(--metal)"/><rect x="5" y="35" width="20" height="10" fill="var(--accent)" className="stroke-none"/><rect x="5" y="35" width="20" height="40" fill="var(--metal-2)" opacity="0.5" className="stroke-none"/>
                    <polygon points="120,30 90,30 80,80 110,80" fill="var(--metal)"/><rect x="95" y="35" width="20" height="10" fill="var(--accent)" className="stroke-none"/><rect x="95" y="35" width="20" height="40" fill="var(--metal-2)" opacity="0.5" className="stroke-none"/>
                    <polygon points="60,0 80,40 40,40" fill="var(--metal)"/><polygon points="40,40 80,40 90,80 30,80" fill="var(--metal)"/><rect x="35" y="70" width="50" height="10" fill="var(--metal-2)"/>
                    <polygon points="45,45 75,45 80,60 40,60" fill="var(--accent)" className="stroke-none"/>
                    <polygon points="60,10 75,40 45,40" fill="#101018" stroke="#3f3f46" strokeWidth="1"/><polygon points="60,15 70,35 50,35" fill="white" opacity="0.2" className="stroke-none"/>
                    <rect x="50" y="80" width="20" height="10" fill="#1f2937"/>
                </g>

                {/* Puerta animada */}
                <g style={{ transition: 'transform 0.8s ease-in-out', transform: isDoorOpen ? 'translateY(-100%)' : 'translateY(0)' }}>
                    <polygon points="35,80 85,80 90,95 30,95" fill="var(--metal)" className="stroke" strokeWidth="1.5" />
                    <rect x="58" y="83" width="4" height="10" fill="var(--accent)" className="stroke-none" />
                </g>

                {/* Luces y efectos de motor */}
                <circle cx="15" cy="70" r="4" className="animate-pulse-red" /><circle cx="105" cy="70" r="4" className="animate-pulse-red" /><circle cx="60" y="85" r="5" className="animate-pulse-blue" fill="#3b82f6" />
                {isDeparting && (
                    <><defs><radialGradient id="thrustGradient"><stop offset="0%" stopColor="white" /><stop offset="30%" stopColor="#93c5fd" /><stop offset="100%" stopColor="rgba(59, 130, 246, 0)" /></radialGradient></defs><g className="animate-pulse"><ellipse cx="15" cy="85" rx="10" ry="25" fill="url(#thrustGradient)" /><ellipse cx="105" cy="85" rx="10" ry="25" fill="url(#thrustGradient)" /></g></>
                )}
            </svg>
        </div>
    </div>
);

export default Spaceship;
