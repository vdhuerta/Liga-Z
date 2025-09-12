import React from 'react';

const VolcanoBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f0f] via-[#4a1c1c] to-[#7a2828] overflow-hidden">
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 480">
        <style>
          {`
            .smoke {
              animation: drift 60s linear infinite alternate;
            }
            @keyframes drift {
              from { transform: translateX(-50px) scale(1); }
              to { transform: translateX(50px) scale(1.1); }
            }
            .smoke2 {
              animation: drift2 80s linear infinite alternate;
            }
            @keyframes drift2 {
              from { transform: translateX(30px) scale(0.9); }
              to { transform: translateX(-30px) scale(1); }
            }
          `}
        </style>

        {/* Far Volcano */}
        <path d="M 100,480 L 250,200 L 400,480 Z" fill="#2c1d1d" />
        <circle cx="250" cy="200" r="40" fill="#ff6b35" />

        {/* Near Volcano */}
        <path d="M 500,480 L 650,150 L 800,480 Z" fill="#3d2d2d" />
        <path d="M 620,160 C 630,140 670,140 680,160" fill="#ff6b35" />
        
        {/* Smoke Clouds */}
        <g opacity="0.4" className="smoke">
          <circle cx="250" cy="180" r="60" fill="#5a4d4d" />
          <circle cx="300" cy="190" r="70" fill="#4a3d3d" />
          <circle cx="200" cy="190" r="50" fill="#6a5d5d" />
        </g>
        <g opacity="0.5" className="smoke2">
          <circle cx="650" cy="130" r="80" fill="#5a4d4d" />
          <circle cx="710" cy="140" r="90" fill="#4a3d3d" />
          <circle cx="590" cy="140" r="70" fill="#6a5d5d" />
        </g>
      </svg>
    </div>
  );
};

export default VolcanoBackground;
