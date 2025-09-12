import React from 'react';

interface BalanceIndicatorProps {
  balanceState: 'level' | 'A_down' | 'B_down';
}

const BalanceIndicator: React.FC<BalanceIndicatorProps> = ({ balanceState }) => {
  const rotation = {
    level: 0,
    A_down: -15,
    B_down: 15,
  }[balanceState];

  return (
    <svg viewBox="0 0 200 50" width="100%" height="100%" style={{ 
      transition: 'transform 0.5s ease-in-out', 
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'center 37.5px', // Pivot around the fulcrum tip
      filter: 'drop-shadow(3px 3px 3px rgba(0,0,0,0.4))'
    }}>
      {/* Beam */}
      <rect x="10" y="20" width="180" height="10" rx="3" fill="#a1a1aa" stroke="#4a5568" strokeWidth="2" />
      {/* End caps */}
      <circle cx="10" cy="25" r="5" fill="#71717a" />
      <circle cx="190" cy="25" r="5" fill="#71717a" />
      {/* Fulcrum (drawn separately so it doesn't rotate) */}
      <polygon points="90,30 110,30 100,45" fill="#71717a" stroke="#4a5568" strokeWidth="2" 
        style={{ transform: `rotate(${-rotation}deg)`, transformOrigin: 'center 37.5px' }}
      />
    </svg>
  );
};

export default BalanceIndicator;