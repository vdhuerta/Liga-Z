import React from 'react';
import Modal from './Modal';
import { IceCubeIcon, LavaCubeIcon, ZeroCubeIcon, MemoryCubeIcon } from './Cube';
import { TrophyIcon } from './Prize';
import { soundManager } from './soundManager';

// --- ÍCONOS PARA LA GUÍA ---

const InverterIcon: React.FC = () => (
    <svg viewBox="0 0 40 40" className="w-10 h-10 inline-block mr-2 flex-shrink-0">
        <circle cx="20" cy="20" r="16" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />
        <g style={{ transformOrigin: '20px 20px'}}>
            <path d="M 20 4 A 16 16 0 0 1 20 36" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 20 4 A 16 16 0 0 0 20 36" fill="none" stroke="#6d28d9" strokeWidth="2" strokeDasharray="4 4" />
        </g>
    </svg>
);

const AbsolutePlateIcon: React.FC = () => (
    <div className="w-10 h-10 inline-block mr-2 p-0.5 bg-sky-700 flex-shrink-0">
        <div className="w-full h-full bg-gray-800 rounded-sm flex items-center justify-center">
            <span className="font-arcade text-purple-300 text-xs" style={{textShadow: '1px 1px 1px black'}}>|N|</span>
        </div>
    </div>
);

const ComparisonIcon: React.FC = () => (
    <div className="w-10 h-10 inline-block mr-2 bg-sky-700 flex items-center justify-center flex-shrink-0">
        <span className="font-arcade text-xl text-yellow-300 opacity-80" style={{ textShadow: '1px 1px 2px black' }}>&gt;</span>
    </div>
);

const SynthIcon: React.FC = () => (
    <div className="w-10 h-10 inline-block mr-2 p-1 bg-sky-700 flex-shrink-0">
        <div className="w-full h-full bg-black bg-opacity-20 rounded-full border-2 border-sky-400 flex items-center justify-center">
            <span className="font-arcade text-2xl text-sky-300" style={{ textShadow: '0 0 4px #67e8f9' }}>+</span>
        </div>
    </div>
);

const DispenserIcon: React.FC = () => (
    <svg viewBox="0 0 40 40" className="w-10 h-10 inline-block mr-2 flex-shrink-0">
        <rect x="5" y="0" width="30" height="25" fill="#4a5568" rx="2"/>
        <path d="M 15,25 V 35 H 25 V 25 Z" fill="#4a5568" />
        <circle cx="20" cy="20" r="10" fill="#6ecbff" />
    </svg>
);

const MassConverterIcon: React.FC = () => (
    <svg viewBox="0 0 40 40" className="w-10 h-10 inline-block mr-2 flex-shrink-0">
        <circle cx="20" cy="20" r="16" fill="#4a044e" stroke="#a21caf" strokeWidth="2" />
        <g>
            <path d="M 20 8 L 12 16 H 17 V 23 H 23 V 16 H 28 Z" fill="#f0abfc" />
            <path d="M 20 32 L 12 24 H 17 V 17 H 23 V 24 H 28 Z" fill="#a855f7" />
        </g>
    </svg>
);

const ScannerPlateIcon: React.FC = () => (
    <div className="w-10 h-10 inline-block mr-2 p-0.5 bg-sky-700 flex-shrink-0">
        <div className="w-full h-full bg-gray-900 rounded-sm border-2 border-sky-500 flex items-center justify-center">
             <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 opacity-50 text-sky-300">
               <path fill="currentColor" d="M15.5,14h-.79l-.28-.27a6.5,6.5,0,0,0,1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.5,6.5,0,0,0-8.04,4.04c-1.21,3.53,1.2,7.2,4.68,7.5,1.06.09,2.07-.17,2.91-.69l.27.28v.79l5,5L20.49,19l-4.99-5Zm-6,0C7,14,5,12,5,9.5S7,5,9.5,5,14,7,14,9.5,12,14,9.5,14Z"/>
            </svg>
        </div>
    </div>
);

const DepositCalibratorIcon: React.FC = () => (
     <div className="w-10 h-10 inline-block mr-2 p-0.5 bg-sky-700 flex-shrink-0">
        <div className="w-full h-full bg-black bg-opacity-50 rounded-sm border-2 border-purple-400" />
    </div>
);

const EmitterIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10 inline-block mr-2 flex-shrink-0">
        <path d="M 12,32 C 12,12 52,12 52,32 S 42,52 32,52 S 12,52 12,32 Z" fill="#8b2f0a" stroke="#4a2c2a" strokeWidth="2.5" />
        <path d="M 12,32 C 12,12 52,12 52,32 S 42,52 32,52 S 12,52 12,32 Z" fill="none" stroke="#ff6b35" strokeWidth="4" />
    </svg>
);

const FireballIcon: React.FC = () => (
    <svg viewBox="0 0 64 64" className="w-10 h-10 inline-block mr-2 flex-shrink-0">
        <defs>
          <radialGradient id="gHelp" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="20%" stopColor="#ffe177" />
            <stop offset="60%" stopColor="#ff6b35" />
            <stop offset="100%" stopColor="rgba(201, 74, 26, 0)" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="24" fill="url(#gHelp)" />
    </svg>
);

interface HelpEntryProps {
    children: React.ReactNode;
}

const HelpEntry: React.FC<HelpEntryProps> = ({ children }) => (
    <div className="flex items-center mt-3">{children}</div>
);

interface HelpSectionProps {
    title: string;
    children: React.ReactNode;
}

const HelpSection: React.FC<HelpSectionProps> = ({ title, children }) => (
    <section className="mb-4">
        <h3 className="text-xl text-green-400 mb-2 border-b-2 border-green-700 pb-1" style={{ textShadow: '1px 1px #000' }}>
            {title}
        </h3>
        <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
            {children}
        </div>
    </section>
);


interface GeneralHelpModalProps {
  onClose: () => void;
}

const GeneralHelpModal: React.FC<GeneralHelpModalProps> = ({ onClose }) => {
  const handleClose = () => {
    soundManager.play('modalClose');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4 font-arcade">
        <div className="bg-[#0c1a1e] border-4 border-yellow-400 rounded-lg max-w-3xl w-full text-white shadow-2xl relative">
            <div className="p-6">
                <h2 className="text-3xl text-yellow-300 mb-4 text-center" style={{ textShadow: '2px 2px #000' }}>
                    GUÍA DEL JUEGO
                </h2>

                <div className="max-h-[70vh] overflow-y-auto pr-4 help-modal-content">
                    <HelpSection title="Controles Básicos">
                        <p>Usa las <strong className="text-yellow-300">TECLAS DE FLECHA</strong> para mover a ZETA por el nivel.</p>
                        <p>Para empujar un cubo, simplemente camina hacia él. Si el espacio detrás del cubo está libre, ZETA lo moverá.</p>
                        <p>Si un cubo está atascado, párate junto a él y presiona la <strong className="text-yellow-300">BARRA ESPACIADORA</strong> para usar la habilidad de <strong className="text-purple-400">REBOTE</strong>, que lo empujará a tu espalda si hay espacio.</p>
                    </HelpSection>

                    <HelpSection title="Conceptos Fundamentales">
                        <HelpEntry><LavaCubeIcon /><IceCubeIcon /><div><strong className="text-lg text-yellow-300">Neutralización:</strong> La regla principal. Un cubo de <strong className="text-red-400">Lava [+N]</strong> y uno de <strong className="text-blue-400">Hielo [-N]</strong> del mismo valor absoluto se cancelan al juntarse.</div></HelpEntry>
                        <HelpEntry><ZeroCubeIcon /><div><strong className="text-lg text-yellow-300">El Cero:</strong> Representa el equilibrio. Actúa como un punto fijo en la recta numérica y no se puede mover.</div></HelpEntry>
                        <HelpEntry><MemoryCubeIcon /><div><strong className="text-lg text-yellow-300">Cubos de Memoria:</strong> Su valor está oculto. Debes usar una Placa de Escáner para revelarlo.</div></HelpEntry>
                    </HelpSection>
                    
                    <HelpSection title="Máquinas y Herramientas">
                        <HelpEntry><InverterIcon /><div><strong className="text-purple-400">Máquina Inversora:</strong> Empuja un cubo aquí para invertir su valor y tipo. <strong className="text-yellow-300">[+N]</strong> se convierte en <strong className="text-yellow-300">[-N]</strong>, y viceversa.</div></HelpEntry>
                        <HelpEntry><SynthIcon /><div><strong className="text-blue-400">Sintetizador:</strong> Coloca dos cubos en las ranuras de entrada. La máquina los consumirá y creará un nuevo cubo con la suma de sus valores.</div></HelpEntry>
                        <HelpEntry><DispenserIcon /><div><strong className="text-gray-400">Dispensadores:</strong> Generan cubos de valor <strong className="text-yellow-300">[+1]</strong> o <strong className="text-yellow-300">[-1]</strong> de forma infinita cuando el espacio de salida está libre.</div></HelpEntry>
                        <HelpEntry><MassConverterIcon /><div><strong className="text-purple-400">Convertidor de Masa:</strong> Una versión especializada de la Inversora que solo funciona con cubos de valor <strong className="text-yellow-300">[+1]</strong> y <strong className="text-yellow-300">[-1]</strong>.</div></HelpEntry>
                    </HelpSection>

                    <HelpSection title="Zonas de Puzzle">
                        <HelpEntry><AbsolutePlateIcon /><div><strong className="text-purple-400">Placas de Valor Absoluto:</strong> Se activan con un cubo de valor <strong className="text-yellow-300">|N|</strong>, sin importar si es positivo o negativo.</div></HelpEntry>
                        <HelpEntry><ComparisonIcon /><div><strong className="text-yellow-300">Estaciones de Comparación:</strong> Coloca dos cubos para cumplir la condición matemática (<strong className="text-yellow-300">&gt;</strong>, <strong className="text-yellow-300">&lt;</strong>, <strong className="text-yellow-300">=</strong>) y abrir puertas.</div></HelpEntry>
                        <HelpEntry><ScannerPlateIcon /><div><strong className="text-blue-400">Placa de Escáner:</strong> Revela temporalmente el valor de un Cubo de Memoria que esté sobre ella.</div></HelpEntry>
                        <HelpEntry><DepositCalibratorIcon /><div><strong className="text-purple-400">Depósitos y Calibradores:</strong> Zonas donde la <strong className="text-yellow-300">suma total</strong> de los cubos debe cumplir un objetivo (ej: <strong className="text-yellow-300">= 4</strong>) o una condición lógica (ej: <strong className="text-yellow-300">&gt; -2</strong>).</div></HelpEntry>
                        <p className="mt-4"><strong className="text-lg text-purple-300">El Ensamblador:</strong> En el desafío final, encontrarás un gran panel donde debes colocar cubos para satisfacer <strong className="text-yellow-300">múltiples condiciones a la vez</strong> (suma de filas, columnas, total, etc.).</p>
                    </HelpSection>

                    <HelpSection title="Peligros y Coleccionables">
                        <HelpEntry><EmitterIcon /><div><strong className="text-red-500">Rocas Radioactivas:</strong> Los Emisores en las paredes lanzarán rocas que bloquean casillas de forma permanente. ¡Date prisa!</div></HelpEntry>
                        <HelpEntry><FireballIcon /><div><strong className="text-red-500">Bolas de Fuego:</strong> Caen del cielo en ciertos niveles. ¡Esquívalas o perderás una vida!</div></HelpEntry>
                        <HelpEntry><div className="w-10 h-10 inline-block mr-2 flex-shrink-0"><TrophyIcon /></div><div><strong className="text-yellow-300">Trofeos:</strong> ¡Recógelos para ganar puntos extra! A menudo se encuentran en cámaras secretas.</div></HelpEntry>
                    </HelpSection>
                </div>
                 <div className="text-center mt-6">
                    <button
                        onClick={handleClose}
                        className="font-arcade text-lg bg-purple-600 text-white py-2 px-6 rounded-lg border-b-4 border-purple-800 hover:bg-purple-500 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default GeneralHelpModal;