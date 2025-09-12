import React from 'react';

const Tree: React.FC = () => (
  <svg viewBox="0 0 100 200" width="100%" height="200" style={{ filter: 'drop-shadow(3px 3px 2px rgba(0,0,0,0.5))' }}>
    <path d="M 50,200 L 50,50 L 40,50 L 40,200 Z" fill="#4a2c2a" />
    <path d="M 50,50 L 20,80 L 30,80 L 10,110 L 40,110 L 20,140 L 50,140 Z" fill="#4a2c2a" />
    <path d="M 50,50 L 80,80 L 70,80 L 90,110 L 60,110 L 80,140 L 50,140 Z" fill="#4a2c2a" />
    <circle cx="50" cy="50" r="50" fill="#2a3a2a" />
    <circle cx="30" cy="60" r="40" fill="#3a4a3a" />
    <circle cx="70" cy="60" r="40" fill="#3a4a3a" />
  </svg>
);

const Bush: React.FC = () => (
  <svg viewBox="0 0 100 80" width="100" height="80" style={{ filter: 'drop-shadow(3px 3px 2px rgba(0,0,0,0.5))' }}>
    <circle cx="50" cy="40" r="40" fill="#1a2a1a" />
    <circle cx="30" cy="50" r="30" fill="#2a3a2a" />
    <circle cx="70" cy="50" r="30" fill="#2a3a2a" />
  </svg>
);

interface ParallaxSceneryProps {
  progress: number;
  speed: number;
  type: 'far' | 'mid' | 'near';
}

const sceneryConfig = {
    far: {
        items: [{ left: '10%', bottom: '0px', width: '80px' }, { left: '80%', bottom: '10px', width: '70px' }],
        Component: Tree,
        zIndex: 5,
        baseY: 'calc(60% - 200px)',
        height: '200px',
    },
    mid: {
        items: [{ left: '30%', bottom: '5px', width: '100px' }, { left: '60%', bottom: '-5px', width: '110px' }],
        Component: Tree,
        zIndex: 15,
        baseY: 'calc(60% - 200px)',
        height: '200px',
    },
    near: {
        items: [
            { left: '5%', bottom: '0px', width: '90px' }, 
            { left: '45%', bottom: '10px', width: '120px' }, 
            { left: '95%', bottom: '-10px', width: '100px' }
        ],
        Component: Bush,
        zIndex: 25,
        baseY: 'calc(60% - 80px)',
        height: '80px',
    }
}

const ParallaxScenery: React.FC<ParallaxSceneryProps> = ({ progress, speed, type }) => {
  const transformX = -progress * speed * 5;
  const config = sceneryConfig[type];

  return (
    <div 
        className="absolute left-0 w-full" 
        style={{
            transform: `translateX(${transformX}px)`,
            zIndex: config.zIndex,
            top: config.baseY,
            height: config.height,
            width: '200%', // Make wider to avoid popping in/out at edges
            left: '-50%',
        }}
    >
        {config.items.map((item, index) => (
            <div key={index} className="absolute" style={{ left: item.left, bottom: item.bottom, width: item.width }}>
                <config.Component />
            </div>
        ))}
    </div>
  );
};


export default ParallaxScenery;
