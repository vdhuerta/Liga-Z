import React from 'react';

const IceSurface: React.FC = () => {
  return (
    <svg width="100%" height="100%">
      <defs>
        <pattern id="icePattern" patternUnits="userSpaceOnUse" width="80" height="80">
          <g>
            {/* Base */}
            <rect x="0" y="0" width="80" height="80" fill="#6ecbff"/>
            {/* Shadows */}
            <rect x="0" y="50" width="80" height="20" fill="#3a94c9" opacity="0.6"/>
            {/* Highlights */}
            <rect x="10" y="5" width="20" height="12" rx="4" fill="#b3e5ff"/>
            <rect x="40" y="10" width="16" height="8" rx="4" fill="#d6f4ff"/>
            {/* Cracks */}
            <line x1="5" y1="5" x2="75" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <line x1="75" y1="5" x2="5" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#icePattern)" />
    </svg>
  );
};

export default IceSurface;
