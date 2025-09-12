import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from './soundManager';

// --- Componentes SVG para la escena final ---

const ZetaFinalScene: React.FC<{ glowingLogo: boolean }> = ({ glowingLogo }) => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" width="100%" height="100%">
      {/* CUERPO PRINCIPAL */}
      <rect className="pixel stroke" x="156" y="180" width="200" height="170" rx="8" fill="var(--metal)"/>
      <rect className="pixel" x="156" y="250" width="200" height="100" fill="var(--metal-2)" opacity=".6"/>
      <rect className="pixel" x="156" y="180" width="200" height="16" fill="var(--accent)"/>
  
      {/* CABEZA */}
      <rect className="pixel stroke" x="176" y="96" width="160" height="90" rx="6" fill="var(--metal)"/>
      <rect className="pixel" x="176" y="96" width="160" height="14" fill="var(--accent)"/>
      <rect className="pixel stroke" x="206" y="132" width="36" height="20" rx="2" fill="var(--blue)"/>
      <rect className="pixel stroke" x="270" y="132" width="36" height="20" rx="2" fill="var(--red)"/>
      <rect className="pixel" x="220" y="162" width="72" height="10" fill="#7b859c"/>
  
      {/* BRAZOS */}
      <rect className="pixel stroke" x="110" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="102" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>
      <rect className="pixel stroke" x="356" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="356" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>
  
      {/* MANOS + ORBES */}
      <rect className="pixel stroke" x="86" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
      <circle className="pixel stroke" cx="70" cy="272" r="22" fill="var(--blue)"/>
      <rect className="pixel gloss" x="57" y="260" width="13" height="9" fill="#fff"/>
      <rect className="pixel" x="67" y="267" width="6" height="20" fill="#fff"/>
      <rect className="pixel" x="59" y="275" width="22" height="6" fill="#fff"/>
  
      <rect className="pixel stroke" x="398" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
      <circle className="pixel stroke" cx="442" cy="272" r="22" fill="var(--red)"/>
      <rect className="pixel gloss" x="429" y="260" width="13" height="9" fill="#fff"/>
      <rect className="pixel" x="432" y="275" width="22" height="6" fill="#fff"/>
  
      {/* CINTURÓN */}
      <rect className="pixel stroke" x="176" y="342" width="160" height="18" fill="#8b95aa"/>
      <rect className="pixel" x="186" y="342" width="50" height="18" fill="#9fa9bf"/>
      <rect className="pixel" x="276" y="342" width="50" height="18" fill="#9fa9bf"/>
  
      {/* PIERNAS */}
      <rect className="pixel stroke" x="188" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="280" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="176" y="422" width="68" height="26" rx="4" fill="#8892a8"/>
      <rect className="pixel stroke" x="268" y="422" width="68" height="26" rx="4" fill="#8892a8"/>
  
      {/* PECHO: LOGO ZETA */}
      <g className="pixel stroke" transform="translate(206 208)">
        <rect x="0" y="0" width="100" height="80" rx="6" fill="#ffffff"/>
        <rect x="4" y="4" width="92" height="72" rx="4" fill="#e9edf6"/>
        <rect x="10" y="16" width="80" height="16" fill="var(--ink)"/>
        <rect x="26" y="32" width="48" height="16" fill="var(--ink)"/>
        <rect x="10" y="48" width="80" height="16" fill="var(--ink)"/>
        <rect x="2" y="2" width="96" height="76" rx="5" fill="none" stroke={glowingLogo ? 'white' : 'var(--accent)'} strokeWidth="4"
            className={glowingLogo ? 'animate-pulse-glow' : ''}
            style={{
                animation: glowingLogo ? 'pulse-glow 2s infinite ease-in-out' : 'none',
                boxShadow: glowingLogo ? '0 0 25px 8px #fff, inset 0 0 10px #fff' : 'none'
            }}
        />
      </g>
    </svg>
);


const Architect: React.FC = () => (
    <svg viewBox="0 0 200 300" width="200" height="300" style={{ filter: 'drop-shadow(0 0 20px #a7f3d0)' }}>
        <defs>
            <linearGradient id="architect-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="hologram-glow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <g opacity="0.8" filter="url(#hologram-glow)">
            {/* Main body shape - abstract and geometric */}
            <path d="M 100,10 L 150,80 L 120,290 L 80,290 L 50,80 Z" fill="url(#architect-gradient)" />
            {/* Core */}
            <circle cx="100" cy="100" r="20" fill="white" className="animate-pulse" />
            {/* Floating geometric elements */}
            <rect x="30" y="150" width="20" height="40" fill="white" opacity="0.7" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <rect x="150" y="150" width="20" height="40" fill="white" opacity="0.7" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <circle cx="100" cy="250" r="10" fill="white" className="animate-pulse" style={{ animationDelay: '1s' }} />
        </g>
    </svg>
);

const Typewriter: React.FC<{ text: string; speed?: number; onComplete?: () => void, className?: string }> = ({ text, speed = 80, onComplete, className }) => {
    const [displayedText, setDisplayedText] = useState('');
    const onCompleteRef = React.useRef(onComplete);
    
    useEffect(() => {
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                soundManager.play('menuNavigate', { volume: 0.05 });
            }
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i > text.length) {
                clearInterval(intervalId);
                if (onCompleteRef.current) {
                    onCompleteRef.current();
                }
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return <p className={className}>{displayedText}</p>;
};

interface FinalSceneProps {
  onComplete: () => void;
}

const FinalScene: React.FC<FinalSceneProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [sceneScale, setSceneScale] = useState(1);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        soundManager.stopAll();
        soundManager.play('prologueAmbience', { loop: true }); // A fitting ambient sound

        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setStep(1), 500)); // ZETA appears
        timers.push(setTimeout(() => setStep(2), 2500)); // Architect materializes
        timers.push(setTimeout(() => setStep(3), 4500)); // Text starts typing
        timers.push(setTimeout(() => setStep(4), 13000)); // Architect dissolves
        timers.push(setTimeout(() => setStep(5), 15000)); // ZETA levitates, logo glows
        timers.push(setTimeout(() => setStep(6), 16000)); // Orbs appear
        timers.push(setTimeout(() => { // Camera zooms out
            setSceneScale(0.5);
            setStep(7);
        }, 18000));
        // Architect dissolves at 13s, end scene 10s later at 23s.
        timers.push(setTimeout(() => onCompleteRef.current(), 23000)); // End scene

        return () => {
            timers.forEach(clearTimeout);
            soundManager.stopAll();
        };
    }, []);
    
    const ORB_COUNT = 10;
    const orbs = Array.from({ length: ORB_COUNT }).map((_, i) => {
        const angle = (i / ORB_COUNT) * 2 * Math.PI;
        return {
            id: i,
            isLava: i % 2 === 0,
            style: {
                '--angle': `${angle}rad`,
                '--radius': '120px',
                '--duration': '8s',
                '--delay': `${-i * (8 / ORB_COUNT)}s`
            } as React.CSSProperties
        };
    });

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center font-arcade overflow-hidden">
            <style>{`
                .orbit {
                    position: absolute;
                    animation: orbit var(--duration) linear var(--delay) infinite;
                }
                @keyframes orbit {
                    from { transform: rotate(var(--angle)) translateY(var(--radius)) rotate(-var(--angle)); }
                    to { transform: rotate(calc(var(--angle) + 2 * 3.14159rad)) translateY(var(--radius)) rotate(-calc(var(--angle) + 2 * 3.14159rad)); }
                }
                .levitate {
                    animation: levitate 4s ease-in-out infinite;
                }
                @keyframes levitate {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
            `}</style>
            
            {/* Background */}
            <div className="absolute inset-0 bg-white" style={{
                background: 'radial-gradient(ellipse at center, #f7fafc 0%, #e2e8f0 100%)'
            }} />
            <div className="absolute inset-0 opacity-10" style={{
                backgroundSize: '80px 80px',
                backgroundImage: 'linear-gradient(to right, #cbd5e0 1px, transparent 1px), linear-gradient(to bottom, #cbd5e0 1px, transparent 1px)'
            }} />

            {/* Main scene container for scaling */}
            <div className="relative transition-transform duration-[5000ms] ease-in-out" style={{ transform: `scale(${sceneScale})` }}>

                {/* ZETA */}
                <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-1000 ${step >= 5 ? 'levitate' : ''}`}
                    style={{
                        width: '200px', height: '200px',
                        bottom: step >= 1 ? '25vh' : '-250px',
                    }}
                >
                    <ZetaFinalScene glowingLogo={step >= 5} />
                </div>
                
                {/* Orbiting Orbs */}
                {step >= 6 && (
                    <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 'calc(25vh + 100px)' }}>
                        {orbs.map(orb => (
                            <div key={orb.id} className="orbit" style={orb.style}>
                                <div className={`w-5 h-5 rounded-full ${orb.isLava ? 'bg-red-500 shadow-[0_0_10px_#f87171]' : 'bg-blue-500 shadow-[0_0_10px_#60a5fa]'}`} />
                            </div>
                        ))}
                    </div>
                )}


                {/* Architect */}
                <div className="absolute left-1/2 -translate-x-1/2 transition-opacity duration-1000"
                    style={{ opacity: (step === 2 || step === 3) ? 1 : 0, top: '5vh' }}
                >
                    <Architect />
                </div>
                
                {/* Energy Transfer Beam */}
                {step === 4 && (
                    <div className="absolute w-2 h-[200px] bg-gradient-to-t from-white via-green-200 to-transparent left-1/2 -translate-x-1/2 animate-fade-out-up" style={{ top: 'calc(5vh + 100px)' }} />
                )}

                {/* Text */}
                {step === 3 && (
                    <div className="absolute w-[600px] left-1/2 -translate-x-1/2 text-center text-gray-700"
                         style={{ top: 'calc(5vh + 320px)' }}
                    >
                        <Typewriter
                            className="text-[14px] leading-relaxed"
                            text="Has demostrado maestría sobre la dualidad. Has comprendido el Cero. El equilibrio ha sido restaurado."
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinalScene;
