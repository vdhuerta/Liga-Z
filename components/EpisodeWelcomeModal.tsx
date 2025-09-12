import React, { useState, useEffect } from 'react';
import { soundManager } from './soundManager';

interface EpisodeWelcomeModalProps {
  episodeName: string;
  levelCount: number;
  onClose: () => void;
}

const Typewriter: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ text, speed = 50, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const onCompleteRef = React.useRef(onComplete);
    
    useEffect(() => {
        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i > text.length) {
                clearInterval(intervalId);
                if(onCompleteRef.current) {
                    onCompleteRef.current();
                }
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    return <span>{displayedText}</span>;
};

const EpisodeWelcomeModal: React.FC<EpisodeWelcomeModalProps> = ({ episodeName, levelCount, onClose }) => {
    const [showButton, setShowButton] = useState(false);
    
    const message1 = `EPISODIO ${episodeName.split(':')[0].replace('Episodio ', '')}`;
    const message2 = `${episodeName.split(':')[1].trim()}`;
    const message3 = `(${levelCount} NIVEL${levelCount > 1 ? 'ES' : ''})`;

    const handleClose = () => {
        soundManager.play('modalClose');
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 font-arcade">
            <style>{`
                .blinking-cursor {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    from, to { color: transparent; }
                    50% { color: #fef08a; }
                }
            `}</style>
            <div className="bg-gray-900 border-4 border-purple-500 rounded-lg p-8 w-full max-w-3xl text-yellow-300 shadow-2xl text-center">
                <div className="text-3xl mb-4" style={{ textShadow: '2px 2px #000' }}>
                   <Typewriter text={message1} />
                   <span className="blinking-cursor">_</span>
                </div>
                <div className="text-xl mb-2" style={{ textShadow: '1px 1px #000' }}>
                   <Typewriter text={message2} speed={40} />
                </div>
                <div className="text-base text-gray-400 mb-8">
                   <Typewriter text={message3} speed={30} onComplete={() => setTimeout(() => setShowButton(true), 300)} />
                </div>
                
                {showButton && (
                    <button
                        onClick={handleClose}
                        className="font-arcade text-lg bg-yellow-400 text-black py-2 px-6 rounded-lg border-b-4 border-yellow-600 hover:bg-yellow-300 active:border-b-0 active:translate-y-1 transition-all animate-pulse-yellow"
                    >
                        COMENZAR
                    </button>
                )}
            </div>
        </div>
    );
};

export default EpisodeWelcomeModal;