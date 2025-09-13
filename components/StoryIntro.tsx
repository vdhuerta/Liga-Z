import React, { useState, useEffect, useCallback } from 'react';
import { soundManager } from './soundManager';
import TouchControls from './TouchControls';
import type { Direction } from '../types';

// --- COMPONENTES SVG DE AYUDA ---

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

const ElevatorDoor: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
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


// --- CONSTANTES DE DIMENSIONES ---
const GROUND_BASE_VH = 9;
const GROUND_TOP_VH = 3;
const GROUND_TOTAL_VH = GROUND_BASE_VH + GROUND_TOP_VH;

const Building: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
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
        <ElevatorDoor isOpen={isOpen} />
    </div>
);

// --- COMPONENTE DE LA ESCENA DE FONDO ---
const GameSceneBackground: React.FC<{ scrollOffset: number }> = ({ scrollOffset }) => {
    const parallaxFactors = {
        volcano: 0.1,
        tree: 0.3,
        bush: 0.6,
        ground: 1.0,
    };

    const volcanoX = -scrollOffset * parallaxFactors.volcano;
    const treeX = -scrollOffset * parallaxFactors.tree;
    const bushX = -scrollOffset * parallaxFactors.bush;
    const groundX = -scrollOffset * parallaxFactors.ground;

    // Ubicaciones de los elementos en un mundo más ancho
    const volcanoPositions = [
        { left: '5%', width: '300px' },
        { left: '18%', width: '450px' },
        { left: '80%', width: '250px' },
    ];
    const treePositions = [{ left: '10%', width: '100px' }, { left: '30%', width: '80px' }, { left: '45%', width: '90px' }, { left: '70%', width: '100px' }, { left: '85%', width: '80px' }];
    const bushPositions = [{ left: '5%', width: '100px' }, { left: '25%', width: '120px' }, { left: '55%', width: '90px' }, { left: '80%', width: '110px' }];
    
    // El mundo es 250% más ancho para permitir el desplazamiento sin que aparezcan bordes.
    const worldWidth = '250%';

    const cloudData = [
      { top: '10vh', left: '15%', animationClass: 'animate-drift', color: '#D1D5DB' },
      { top: '25vh', left: '80%', animationClass: 'animate-drift-delay', color: '#9CA3AF' },
      { top: '18vh', left: '50%', animationClass: 'animate-drift', color: '#6B7280', scale: 4 },
      { top: '5vh', left: '5%', animationClass: 'animate-drift-delay', color: '#9CA3AF' },
      { top: '15vh', left: '95%', animationClass: 'animate-drift', color: '#D1D5DB' },
      { top: '22vh', left: '30%', animationClass: 'animate-drift-delay', color: '#6B7280' },
      { top: '30vh', left: '65%', animationClass: 'animate-drift', color: '#D1D5DB' },
      { top: '8vh', left: '120%', animationClass: 'animate-drift-delay', color: '#9CA3AF' },
      { top: '12vh', left: '150%', animationClass: 'animate-drift', color: '#6B7280', scale: 4 },
      { top: '28vh', left: '180%', animationClass: 'animate-drift', color: '#D1D5DB' },
      { top: '16vh', left: '210%', animationClass: 'animate-drift-delay', color: '#9CA3AF' },
      { top: '6vh', left: '240%', animationClass: 'animate-drift', color: '#6B7280' },
    ];

    return (
        <div className="relative w-full h-full bg-vito-sky overflow-hidden">
             {cloudData.map((cloud, index) => (
                <Cloud 
                    key={`cloud-${index}`}
                    style={{ top: cloud.top, left: cloud.left }}
                    animationClass={cloud.animationClass}
                    color={cloud.color}
                    scale={cloud.scale}
                />
            ))}

            {/* Capa de Volcanes LEJANOS (z-1) */}
            <div className="absolute inset-0 z-[1]" style={{ width: worldWidth, transform: `translateX(${volcanoX}px)` }}>
                {/* Volcano 1 (left) con opacidad */}
                <Volcano key="volcano-0" style={{ ...volcanoPositions[0], bottom: `${GROUND_TOTAL_VH}vh`, opacity: 0.4 }} />
                {/* Volcano 3 (right) */}
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
            
            {/* Capa de Bruma (z-2) */}
            <div 
                className="absolute left-0 z-[2]" 
                style={{ 
                    width: worldWidth, 
                    transform: `translateX(${volcanoX}px)`, // Se mueve con los volcanes
                    height: '338px',
                    bottom: `calc(${GROUND_TOTAL_VH}vh + 120px)`, // Posicionado para cubrir la mitad superior del volcán
                    background: 'linear-gradient(to top, rgba(229, 231, 235, 0) 0%, rgba(229, 231, 235, 0.7) 50%, rgba(229, 231, 235, 0) 100%)',
                    pointerEvents: 'none',
                }} 
            />

            {/* Capa de Volcán MEDIO (z-3) */}
            <div className="absolute inset-0 z-[3]" style={{ width: worldWidth, transform: `translateX(${volcanoX}px)` }}>
                <Volcano key="volcano-1" style={{ ...volcanoPositions[1], bottom: `${GROUND_TOTAL_VH}vh` }} />
            </div>
            
            {/* Capa de Árboles (media) -> now z-4 */}
            <div className="absolute inset-0 z-[4]" style={{ width: worldWidth, transform: `translateX(${treeX}px)` }}>
                {treePositions.map((pos, i) => <DeadTree key={`tree-${i}`} style={{ ...pos, bottom: `${GROUND_TOTAL_VH}vh` }} />)}
            </div>

            {/* Capa de Arbustos (cercana) -> now z-5 */}
            <div className="absolute inset-0 z-[5]" style={{ width: worldWidth, transform: `translateX(${bushX}px)` }}>
                 {bushPositions.map((pos, i) => <AshBush key={`bush-${i}`} style={{ ...pos, bottom: `${GROUND_TOTAL_VH-2}vh` }} />)}
            </div>
            
            {/* Capas del Suelo (lo más cercano) */}
            <div className="absolute bottom-0 left-0 z-10" style={{ width: worldWidth, transform: `translateX(${groundX}px)` }}>
                <div className="absolute bottom-0 left-0 bg-vito-dirt-base border-t-8 border-black" style={{ height: `${GROUND_BASE_VH}vh`, width: '100%' }} />
                <div className="absolute left-0 bg-vito-dirt-top" style={{ bottom: `${GROUND_BASE_VH}vh`, height: `${GROUND_TOP_VH}vh`, width: '100%' }} />
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE LA INTRODUCCIÓN ---
interface StoryIntroProps {
  onComplete: () => void;
}

const StoryIntro: React.FC<StoryIntroProps> = ({ onComplete }) => {
    const [showStory, setShowStory] = useState(true);
    const [zetaX, setZetaX] = useState(20);
    const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
    const [isDoorOpen, setIsDoorOpen] = useState(false);
    const [isZetaVisible, setIsZetaVisible] = useState(true);
    const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const enterElevator = useCallback(() => {
        soundManager.play('laserDoorOpen');
        setIsInteractionDisabled(true);
        setTimeout(() => setIsDoorOpen(true), 200);      // Abrir puerta
        setTimeout(() => setIsZetaVisible(false), 1400); // ZETA desaparece
        setTimeout(onComplete, 2200);                     // Transición al juego
    }, [onComplete]);

    const handleInteraction = useCallback(() => {
        const doorWidth = 60;
        const activationWidth = doorWidth;
        const buildingWidth = 200;
        const doorStart = window.innerWidth - buildingWidth + (buildingWidth - activationWidth) / 2;
        const doorEnd = doorStart + activationWidth;
        const zetaWidth = 80;

        if ((zetaX + zetaWidth) > doorStart && zetaX < doorEnd) {
            enterElevator();
        }
    }, [zetaX, enterElevator]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (showStory || isInteractionDisabled) return;

        const moveSpeed = 20;
        switch (e.key) {
            case 'ArrowLeft':
                setZetaX(x => Math.max(0, x - moveSpeed));
                setFacingDirection('left');
                break;
            case 'ArrowRight':
                setZetaX(x => Math.min(window.innerWidth - 80, x + moveSpeed));
                setFacingDirection('right');
                break;
            case ' ':
                e.preventDefault();
                handleInteraction();
                break;
        }
    }, [isInteractionDisabled, showStory, handleInteraction]);

    const handleTouchMove = useCallback((direction: Direction) => {
        if (showStory || isInteractionDisabled) return;
        const moveSpeed = 20;
        switch (direction) {
            case 'left':
                setZetaX(x => Math.max(0, x - moveSpeed));
                setFacingDirection('left');
                break;
            case 'right':
                setZetaX(x => Math.min(window.innerWidth - 80, x + moveSpeed));
                setFacingDirection('right');
                break;
            default:
                break;
        }
    }, [showStory, isInteractionDisabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    const zetaScaleX = facingDirection === 'right' ? 1 : -1;

    return (
        <div className="fixed inset-0 font-sans">
             {showStory && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0c1a1e] border-4 border-yellow-400 rounded-lg p-4 sm:p-6 max-w-2xl w-full text-white font-arcade shadow-2xl animate-fade-in max-h-[85vh] flex flex-col">
                        <h2 className="text-xl sm:text-2xl text-yellow-300 mb-4 text-center flex-shrink-0" style={{ textShadow: '2px 2px #000' }}>
                            PRÓLOGO: LA TORRE DE ENTEROS
                        </h2>
                        <div className="text-xs sm:text-sm space-y-3 leading-relaxed text-gray-300 overflow-y-auto pr-2 flex-grow help-modal-content">
                            <p>En el principio, solo existía la energía de <span className="text-red-400">LAVA [+]</span>, surgida de la necesidad de crear y añadir. Pero este poder ilimitado pronto reveló una limitación crucial: no podía representar el equilibrio.</p>
                            <p>¿Cómo se registraría la ausencia, la anulación, o el acto de deshacer?</p>
                            <p>Para completar el universo, se crearon las energías opuestas: el <span className="text-blue-400">HIELO [-]</span> y el gran <span className="text-yellow-200">CERO [0]</span>, el punto de equilibrio absoluto. Esto permitió que operaciones antes 'imposibles' como 'LAVA [+3] - LAVA [+5]' tuvieran una solución: HIELO [-2].</p>
                            <p>La Torre de Enteros, nuestra 'mesa de juego', ahora se extiende en ambas direcciones desde el CERO. Tu misión como ZETA es mantener este equilibrio.</p>
                        </div>
                        <div className="text-center mt-4 flex-shrink-0">
                             <p className="text-[10px] sm:text-xs text-gray-400 mb-2">(PD: Presiona barra espaciadora o el botón de acción para interactuar)</p>
                             <button
                                 onClick={() => {
                                    soundManager.play('buttonClick');
                                    setShowStory(false)}
                                 }
                                 className="font-arcade text-base sm:text-lg bg-purple-600 text-white py-2 px-6 rounded-lg border-b-4 border-purple-800 hover:bg-purple-500 active:border-b-0 active:translate-y-1 transition-all"
                             >
                                 Continuar
                             </button>
                        </div>
                    </div>
                </div>
            )}
            <GameSceneBackground scrollOffset={zetaX} />
            
            <Building isOpen={isDoorOpen} />

            <div
                className="absolute z-30 transition-opacity duration-300"
                style={{
                    width: '80px',
                    height: '80px',
                    left: `${zetaX}px`,
                    bottom: `${GROUND_TOTAL_VH - 2}vh`, // Ligeramente ajustado para que pise bien
                    opacity: isZetaVisible ? 1 : 0,
                    transform: `scaleX(${zetaScaleX})`,
                    transition: 'left 0.1s linear',
                    willChange: 'left, transform',
                }}
                aria-label="ZETA, el personaje del jugador"
            >
                <ZetaSideRight />
            </div>
            
            {isTouch && !showStory && !isInteractionDisabled && (
                <TouchControls onMove={handleTouchMove} onAction={handleInteraction} />
            )}
        </div>
    );
};

export default StoryIntro;