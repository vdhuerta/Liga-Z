import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from './Modal';
import { KeyIcon } from './Key';
import { soundManager } from './soundManager';

// --- START: COMPONENTS COPIED FROM StoryIntro.tsx FOR TRANSITION ---

const Volcano: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute" style={style}>
        <svg viewBox="0 0 250 200" width="100%" height="auto" style={{ filter: 'drop-shadow(3px 3px 5px rgba(0,0,0,0.3))' }}>
            <path d="M 0,200 L 125,0 L 250,200 Z" fill="#4A5568" />
            <path d="M 125,0 L 250,200 L 160,200 Z" fill="#2D3748" />
            <path d="M 125,0 L 110,50 L 115,50 L 100,100 L 110,100 L 90,150 L 105,150 L 125, 120 Z" fill="rgba(0,0,0,0.15)" />
            <path d="M 125,0 L 140,60 L 135,60 L 150,110 L 140,110 L 160,160 L 145,160 L 125, 130 Z" fill="rgba(0,0,0,0.2)" />
        </svg>
    </div>
);

const DeadTree: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute" style={style}>
        <svg viewBox="0 0 100 200" width="100%" height="auto" style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.5))' }}>
            <path d="M 48,200 L 48,40 L 52,40 L 52,200 Z" fill="#4a2c2a" />
            <path d="M 50,50 L 20,80 L 25,82 L 50,55 Z" fill="#4a2c2a" />
            <path d="M 50,70 L 80,100 L 75,102 L 50,75 Z" fill="#4a2c2a" />
            <path d="M 50,60 L 30,30 L 35,32 L 50,65 Z" fill="#4a2c2a" />
            <path d="M 50,80 L 90,60 L 88,65 L 50,85 Z" fill="#4a2c2a" />
        </svg>
    </div>
);

const AshBush: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="absolute" style={style}>
        <svg viewBox="0 0 100 80" width="100%" height="auto" style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.5))' }}>
            <circle cx="50" cy="40" r="40" fill="#5A5A5A" />
            <circle cx="30" cy="50" r="30" fill="#6B6B6B" />
            <circle cx="70" cy="50" r="30" fill="#4F4F4F" />
        </svg>
    </div>
);

const Cloud: React.FC<{ style: React.CSSProperties, animationClass: string, color: string, scale?: number }> = ({ style, animationClass, color, scale = 1 }) => (
    <div className={`absolute ${animationClass} z-0`} style={{...style, transform: `scale(${scale})`}}>
        <div className="relative w-32 h-10 rounded-full" style={{backgroundColor: color, opacity: 0.7}}>
            <div className="absolute -top-5 left-8 w-20 h-16 rounded-full" style={{backgroundColor: color, opacity: 0.7}}></div>
            <div className="absolute -top-3 right-6 w-16 h-12 rounded-full" style={{backgroundColor: color, opacity: 0.7}}></div>
        </div>
    </div>
);

const IntroElevatorDoor: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const doorPanelStyle: React.CSSProperties = {
        transition: 'transform 1s ease-in-out',
    };
    return (
        <div className="absolute inset-x-0 bottom-0 h-[80px] w-[60px] mx-auto">
            <div className="absolute inset-0 border-4 border-gray-900 bg-black"></div>
            <div className="absolute left-0 top-0 w-1/2 h-full bg-gray-500 border-r-2 border-gray-900" style={{ ...doorPanelStyle, transform: isOpen ? 'translateX(-100%)' : 'translateX(0%)' }}></div>
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gray-500 border-l-2 border-gray-900" style={{ ...doorPanelStyle, transform: isOpen ? 'translateX(100%)' : 'translateX(0%)' }}></div>
        </div>
    );
};

const GROUND_BASE_VH = 9;
const GROUND_TOP_VH = 3;
const GROUND_TOTAL_VH = GROUND_BASE_VH + GROUND_TOP_VH;

const IntroBuilding: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <div
        className="absolute h-full w-[200px] bg-gray-800 z-20 border-l-4 border-black"
        style={{ right: '0', bottom: `${GROUND_TOTAL_VH - 2}vh`, transform: 'translateY(-7px)' }}
    >
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-1/5 border-b-2 border-gray-900 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-around px-4">
                    <div className="w-1/3 h-1/2 bg-gray-700 opacity-50 rounded-sm"></div>
                    <span className="font-arcade text-yellow-400 text-lg" style={{ textShadow: '1px 1px 2px black' }}>
                        {5 - i}
                    </span>
                    <div className="w-1/3 h-1/2 bg-gray-700 opacity-50 rounded-sm"></div>
                </div>
            </div>
        ))}
        <IntroElevatorDoor isOpen={isOpen} />
    </div>
);

const IntroSceneBackground: React.FC<{ scrollOffset: number }> = ({ scrollOffset }) => {
    const parallaxFactors = { volcano: 0.1, tree: 0.3, bush: 0.6, ground: 1.0 };
    const volcanoX = -scrollOffset * parallaxFactors.volcano;
    const treeX = -scrollOffset * parallaxFactors.tree;
    const bushX = -scrollOffset * parallaxFactors.bush;
    const groundX = -scrollOffset * parallaxFactors.ground;
    const volcanoPositions = [ { left: '5%', width: '300px' }, { left: '18%', width: '450px' }, { left: '80%', width: '250px' }];
    const treePositions = [{ left: '10%', width: '100px' }, { left: '30%', width: '80px' }, { left: '45%', width: '90px' }, { left: '70%', width: '100px' }, { left: '85%', width: '80px' }];
    const bushPositions = [{ left: '5%', width: '100px' }, { left: '25%', width: '120px' }, { left: '55%', width: '90px' }, { left: '80%', width: '110px' }];
    const worldWidth = '250%';
    const cloudData = [
      { top: '10vh', left: '15%', animationClass: 'animate-drift', color: '#D1D5DB' }, { top: '25vh', left: '80%', animationClass: 'animate-drift-delay', color: '#9CA3AF' }, { top: '18vh', left: '50%', animationClass: 'animate-drift', color: '#6B7280', scale: 4 }, { top: '5vh', left: '5%', animationClass: 'animate-drift-delay', color: '#9CA3AF' }, { top: '15vh', left: '95%', animationClass: 'animate-drift', color: '#D1D5DB' }, { top: '22vh', left: '30%', animationClass: 'animate-drift-delay', color: '#6B7280' }, { top: '30vh', left: '65%', animationClass: 'animate-drift', color: '#D1D5DB' }, { top: '8vh', left: '120%', animationClass: 'animate-drift-delay', color: '#9CA3AF' }, { top: '12vh', left: '150%', animationClass: 'animate-drift', color: '#6B7280', scale: 4 }, { top: '28vh', left: '180%', animationClass: 'animate-drift', color: '#D1D5DB' }, { top: '16vh', left: '210%', animationClass: 'animate-drift-delay', color: '#9CA3AF' }, { top: '6vh', left: '240%', animationClass: 'animate-drift', color: '#6B7280' },
    ];

    return (
        <div className="relative w-full h-full bg-vito-sky overflow-hidden">
             {cloudData.map((cloud, index) => <Cloud key={`cloud-${index}`} style={{ top: cloud.top, left: cloud.left }} animationClass={cloud.animationClass} color={cloud.color} scale={cloud.scale} />)}

            {/* Capa de Volcanes LEJANOS (z-[1]) */}
            <div className="absolute inset-0 z-[1]" style={{ width: worldWidth, transform: `translateX(${volcanoX}px)` }}>
                <Volcano key="volcano-0" style={{ ...volcanoPositions[0], bottom: `${GROUND_TOTAL_VH}vh`, opacity: 0.4 }} />
                <Volcano key="volcano-2" style={{ ...volcanoPositions[2], bottom: `${GROUND_TOTAL_VH}vh` }} />
            </div>

            {/* Capa de Bruma Anaranjada Superior (z-2) */}
            <div 
                className="absolute left-0 z-[2]" 
                style={{ 
                    width: worldWidth, 
                    transform: `translateX(${volcanoX}px)`,
                    height: '250px',
                    top: 0,
                    background: 'linear-gradient(to bottom, rgba(252, 165, 3, 0.6) 0%, rgba(252, 165, 3, 0) 100%)',
                    pointerEvents: 'none',
                }} 
            />

            {/* Capa de Bruma (z-[2]) */}
            <div 
                className="absolute left-0 z-[2]" 
                style={{ 
                    width: worldWidth, 
                    transform: `translateX(${volcanoX}px)`,
                    height: '338px',
                    bottom: `calc(${GROUND_TOTAL_VH}vh + 120px)`,
                    background: 'linear-gradient(to top, rgba(229, 231, 235, 0) 0%, rgba(229, 231, 235, 0.7) 50%, rgba(229, 231, 235, 0) 100%)',
                    pointerEvents: 'none',
                }} 
            />

            {/* Capa de Volcán MEDIO (z-[3]) */}
            <div className="absolute inset-0 z-[3]" style={{ width: worldWidth, transform: `translateX(${volcanoX}px)` }}>
                <Volcano key="volcano-1" style={{ ...volcanoPositions[1], bottom: `${GROUND_TOTAL_VH}vh` }} />
            </div>
            
            {/* Capa de Árboles (z-[4]) */}
            <div className="absolute inset-0 z-[4]" style={{ width: worldWidth, transform: `translateX(${treeX}px)` }}>
                {treePositions.map((pos, i) => <DeadTree key={`tree-${i}`} style={{ ...pos, bottom: `${GROUND_TOTAL_VH}vh` }} />)}
            </div>

            {/* Capa de Arbustos (z-[5]) */}
            <div className="absolute inset-0 z-[5]" style={{ width: worldWidth, transform: `translateX(${bushX}px)` }}>
                 {bushPositions.map((pos, i) => <AshBush key={`bush-${i}`} style={{ ...pos, bottom: `${GROUND_TOTAL_VH-2}vh` }} />)}
            </div>
            
            {/* Capas del Suelo (z-10) */}
            <div className="absolute bottom-0 left-0 z-10" style={{ width: worldWidth, transform: `translateX(${groundX}px)` }}>
                <div className="absolute bottom-0 left-0 bg-vito-dirt-base border-t-8 border-black" style={{ height: `${GROUND_BASE_VH}vh`, width: '100%' }} />
                <div className="absolute left-0 bg-vito-dirt-top" style={{ bottom: `${GROUND_BASE_VH}vh`, height: `${GROUND_TOP_VH}vh`, width: '100%' }} />
            </div>
        </div>
    );
};

// --- END: COPIED COMPONENTS ---

// --- ORIGINAL IceCavern.tsx COMPONENTS (some may be adjusted) ---

const ZetaSideRight: React.FC = () => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" width="100%" height="100%">
      <g transform="translate(30 0)">
          <rect className="pixel stroke" x="250" y="360" width="44" height="66" rx="4" fill="var(--metal-2)" />
          <rect className="pixel stroke" x="240" y="422" width="68" height="26" rx="4" fill="#7b859c" />
          <rect className="pixel stroke" x="226" y="180" width="110" height="170" rx="8" fill="var(--metal)"/>
          <rect className="pixel" x="226" y="180" width="110" height="16" fill="var(--accent)"/>
          <rect className="pixel stroke" x="236" y="96" width="100" height="90" rx="6" fill="var(--metal)"/>
          <rect className="pixel" x="236" y="96" width="100" height="14" fill="var(--accent)"/>
          <rect className="pixel stroke" x="270" y="132" width="36" height="20" rx="2" fill="var(--red)"/>
          <rect className="pixel stroke" x="226" y="342" width="110" height="18" fill="#8b95aa"/>
          <rect className="pixel stroke" x="320" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
          <rect className="pixel stroke" x="328" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>
          <rect className="pixel stroke" x="370" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
          <circle className="pixel stroke" cx="414" cy="272" r="22" fill="var(--red)"/>
          <rect className="pixel" x="404" y="275" width="22" height="6" fill="#fff"/>
          <rect className="pixel stroke" x="228" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
          <rect className="pixel stroke" x="216" y="422" width="68" height="26" rx="4" fill="#8892a8"/>
      </g>
  </svg>
);

const DecorativeIceCube: React.FC = () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect x="12" y="12" width="40" height="40" rx="6" ry="6" fill="#6ecbff" stroke="#1a4a73" strokeWidth="2" />
        <rect x="18" y="16" width="10" height="6" rx="2" ry="2" fill="#b3e5ff" />
        <rect x="14" y="34" width="30" height="10" rx="4" ry="4" fill="#3a94c9" opacity="0.6" />
    </svg>
);

const decorativeCubes = [
    { top: '15%', left: '10%', width: '80px', opacity: 0.4, transform: 'rotate(-15deg)' }, { top: '70%', left: '5%', width: '50px', opacity: 0.4, transform: 'rotate(10deg)' }, { top: '30%', left: '35%', width: '40px', opacity: 0.4, transform: 'rotate(5deg)' }, { top: '85%', left: '40%', width: '100px', opacity: 0.4, transform: 'rotate(-5deg)' }, { top: '50%', left: '60%', width: '60px', opacity: 0.4, transform: 'rotate(20deg)' }, { top: '5%', left: '85%', width: '70px', opacity: 0.4, transform: 'rotate(-10deg)' }, { top: '60%', left: '90%', width: '50px', opacity: 0.4, transform: 'rotate(15deg)' },
];

const CavernBackground: React.FC = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 2 + 2}px`, // 2px to 4px
            duration: `${Math.random() * 10 + 8}s`, // 8 to 18 seconds
            delay: `${Math.random() * 18}s`,
        }));
    }, []);

    return (
    <div className="absolute inset-0 bg-[#aedff7] overflow-hidden">
        <svg width="100%" height="100%" className="absolute inset-0 z-0" preserveAspectRatio="none">
            <defs>
                <linearGradient id="crackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.5 }} />
                    <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
                </linearGradient>
            </defs>
            <path d="M 0,100 Q 200,200 400,150 T 800,250 L 800,0 L 0,0 Z" stroke="url(#crackGradient)" strokeWidth="3" fill="none" opacity="0.5" />
            <path d="M 0,350 Q 300,300 500,400 T 800,380" stroke="url(#crackGradient)" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M 100,0 Q 150,200 50,400 T 200,480" stroke="url(#crackGradient)" strokeWidth="4" fill="none" opacity="0.6"/>
            <path d="M 700,0 Q 650,150 750,300 T 600,480" stroke="url(#crackGradient)" strokeWidth="2" fill="none" opacity="0.8"/>
        </svg>

        {decorativeCubes.map((cube, index) => (
            <div key={index} className="absolute" style={{ ...cube }}>
                <DecorativeIceCube />
            </div>
        ))}
        
        {particles.map(p => (
            <div
                key={p.id}
                className="absolute bg-white rounded-full"
                style={{
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    animation: `float-ice ${p.duration} linear ${p.delay} infinite`,
                    opacity: 0, 
                    boxShadow: '0 0 6px rgba(255, 255, 255, 0.9)',
                }}
            />
        ))}
    </div>
    );
};

const CavernElevatorDoor: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const doorPanelStyle: React.CSSProperties = {
        transition: 'transform 1s ease-in-out',
    };
    return (
        <div className="absolute inset-0">
            <div className="absolute inset-0 border-4 border-gray-900 bg-black"></div>
            <div className="absolute left-0 top-0 w-1/2 h-full bg-gray-500 border-r-2 border-gray-900" style={{ ...doorPanelStyle, transform: isOpen ? 'translateX(-100%)' : 'translateX(0%)' }}></div>
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gray-500 border-l-2 border-gray-900" style={{ ...doorPanelStyle, transform: isOpen ? 'translateX(100%)' : 'translateX(0%)' }}></div>
        </div>
    );
};

const CavernBuilding: React.FC<{ activeFloor: number; isOpen: boolean }> = ({ activeFloor, isOpen }) => {
    const floors = [-1, -2, -3, -4];
    return (
        <div className="absolute top-0 right-0 h-full w-[200px] bg-gray-800 z-20 border-l-4 border-black">
            {floors.map((floor) => {
                const isActive = floor === activeFloor;
                return (
                    <div key={floor} className="h-1/4 border-b-2 border-gray-900 flex items-start justify-around relative px-4 pt-6">
                        <div
                            className={`w-1/3 rounded-sm transition-all duration-300 ${isActive ? 'bg-yellow-300 shadow-[0_0_15px_5px_#fef08a]' : 'bg-gray-700 opacity-50'}`}
                            style={{ height: '55px' }}
                        ></div>
                        <div className="flex items-start" style={{ height: '55px' }}>
                             <span className={`font-arcade text-lg transition-colors duration-300 ${isActive ? 'text-yellow-300' : 'text-gray-500'}`} style={{ textShadow: '1px 1px 2px black' }}>
                                {floor}
                            </span>
                        </div>
                        <div
                            className={`w-1/3 rounded-sm transition-all duration-300 ${isActive ? 'bg-yellow-300 shadow-[0_0_15px_5px_#fef08a]' : 'bg-gray-700 opacity-50'}`}
                            style={{ height: '55px' }}
                        ></div>
                    </div>
                );
            })}
            <div className="absolute h-[80px] w-[60px]" style={{ bottom: '5vh', left: '50%', transform: 'translateX(-50%)' }}>
                <CavernElevatorDoor isOpen={isOpen} />
            </div>
        </div>
    );
};

const TransitionZero: React.FC = () => (
    <div
        className="absolute z-30"
        style={{
            left: 'calc(100vw - 100px)',
            top: 'calc(100vh - 4.5vh)', // Centered on the lower, darker ground strip
            transform: 'translate(-50%, -50%)',
        }}
    >
        <span 
            className="font-arcade text-4xl text-yellow-300 animate-zero-glow"
            style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
        >
            0
        </span>
    </div>
);


// --- MAIN COMPONENT ---
interface IceCavernProps {
  onComplete: () => void;
}

const IceCavern: React.FC<IceCavernProps> = ({ onComplete }) => {
    const [sceneState, setSceneState] = useState<'transitioning' | 'descending' | 'exploring' | 'modal'>('transitioning');
    const [activeFloor, setActiveFloor] = useState(0);
    const [doorOpen, setDoorOpen] = useState(false);
    const [zetaVisible, setZetaVisible] = useState(false);
    const [zetaX, setZetaX] = useState(window.innerWidth - 130);
    const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('left');
    
    const onCompleteRef = React.useRef(onComplete);

    useEffect(() => {
        if (sceneState === 'transitioning') {
            const timer = setTimeout(() => {
                setSceneState('descending');
            }, 3000); // Duration of the scroll animation
            return () => clearTimeout(timer);
        }
        
        if (sceneState === 'descending') {
            const descentTimer = (floor: number) => {
                if (floor < -4) {
                    soundManager.play('laserDoorOpen');
                    setTimeout(() => setDoorOpen(true), 500);
                    setTimeout(() => {
                        setZetaVisible(true);
                        setSceneState('exploring');
                    }, 1500);
                    return;
                }
                soundManager.play('menuNavigate');
                setTimeout(() => {
                    setActiveFloor(floor);
                    descentTimer(floor - 1);
                }, 750);
            };
            descentTimer(-1);
        }
    }, [sceneState]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (sceneState !== 'exploring') return;

        const moveSpeed = 20;
        let newX = zetaX;
        switch (e.key) {
            case 'ArrowLeft':
                newX = Math.max(0, zetaX - moveSpeed);
                setFacingDirection('left');
                break;
            case 'ArrowRight':
                newX = Math.min(window.innerWidth - 80, zetaX + moveSpeed);
                setFacingDirection('right');
                break;
        }
        setZetaX(newX);

        const questionMarkX = window.innerWidth / 2;
        const zetaCenterX = newX + 40;
        if (Math.abs(zetaCenterX - questionMarkX) < 40) {
            soundManager.play('collectPrize');
            setSceneState('modal');
        }
    }, [sceneState, zetaX]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleModalClose = () => {
        soundManager.play('modalClose');
        onCompleteRef.current();
    }
    
    return (
        <div className="fixed inset-0 font-sans text-white bg-black overflow-hidden">
            <div
                className="absolute inset-x-0 w-full h-[200vh] transition-transform duration-[3000ms] ease-in-out"
                style={{
                    transform: `translateY(${sceneState === 'transitioning' ? '0' : '-100vh'})`,
                    top: 0,
                }}
            >
                {/* Upper part: The Intro Scene */}
                <div className="relative w-full h-[100vh]">
                    <IntroSceneBackground scrollOffset={window.innerWidth - 180} />
                    <IntroBuilding isOpen={false} />
                </div>
                
                <TransitionZero />

                {/* Lower part: The Cavern Scene */}
                <div className="relative w-full h-[100vh]">
                    <CavernBackground />
                    <CavernBuilding activeFloor={activeFloor} isOpen={doorOpen} />
                    <div className="absolute bottom-0 left-0 w-full z-10 bg-[#082f49]" style={{ height: 'calc(3vh + 17px)' }}/>

                    <div className="absolute inset-0 z-40">
                        {zetaVisible && (
                             <div
                                className="absolute"
                                style={{
                                    width: '80px', height: '80px',
                                    left: `${zetaX}px`,
                                    bottom: 'calc(3vh + 9px)',
                                    transform: `scaleX(${facingDirection === 'right' ? 1 : -1})`,
                                    transition: 'left 0.1s linear',
                                    willChange: 'left, transform',
                                }}
                            >
                                <ZetaSideRight />
                            </div>
                        )}
                        {(sceneState === 'exploring' || sceneState === 'modal') && (
                             <div className="absolute animate-bounce" style={{ width: '60px', height: '60px', bottom: 'calc(3vh + 19px)', left: '50%', transform: 'translateX(-50%)' }}>
                                <KeyIcon />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {sceneState === 'modal' && (
                <Modal
                    title="¡Bienvenido a LIGA-Z!"
                    onClose={handleModalClose}
                    buttonText="¡Empezar Aventura!"
                >
                    <div className="text-left text-base space-y-2">
                        <p>¡Hola, soy ZETA! Mi misión es restaurar el equilibrio en la Torre de Enteros.</p>
                        <p>Usa las <strong className="text-yellow-300">flechas</strong> para moverte. ¡Párate junto a un cubo y pulsa <strong className="text-yellow-300">ESPACIO</strong> para empujarlo!</p>
                        <p>Junta un cubo de <strong className="text-red-400">lava (+)</strong> con uno de <strong className="text-blue-400">hielo (-)</strong> del mismo valor para que se neutralicen y desaparezcan.</p>
                        <p>¡Despeja todos los cubos para avanzar! ¡Contamos contigo!</p>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default IceCavern;