
import React from 'react';
import Modal from './Modal';
import { soundManager } from './soundManager';

interface HelpModalProps {
  level: number;
  onClose: () => void;
}

const GeneralHelp: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Hola, soy ZETA! Mi misión es restaurar el equilibrio en la Torre de Enteros.</p>
        <p>Usa las <strong className="text-yellow-300">flechas</strong> para moverte. Párate junto a un cubo y pulsa una flecha en su dirección para empujarlo.</p>
        <p>Si un cubo está atascado, párate junto a él y usa <strong className="text-yellow-300">ESPACIO</strong> para usar la habilidad de REBOTE y moverlo al otro lado.</p>
    </div>
);

const Level1_1Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Bienvenido a la Torre de Enteros!</p>
        <p>Tu misión es despejar todos los cubos para avanzar.</p>
        <p>Junta un cubo de <strong className="text-red-400">lava (+)</strong> con uno de <strong className="text-blue-400">hielo (-)</strong> del mismo valor para que se neutralicen y desaparezcan.</p>
    </div>
);

const Level1_2Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Has encontrado una <strong className="text-purple-400">Máquina Inversora</strong>!</p>
        <p>Empuja cualquier cubo sobre esta casilla especial para invertir su valor y tipo.</p>
        <p>Un cubo de <strong className="text-red-400">lava [+N]</strong> se convertirá en uno de <strong className="text-blue-400">hielo [-N]</strong>, y viceversa.</p>
        <p>Usa esta máquina para crear los pares que necesitas para despejar el nivel.</p>
    </div>
);

const Level1_3Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Este es un desafío de lógica! Las cámaras laterales contienen cubos <strong className="text-yellow-300">duplicados</strong>.</p>
        <p>No puedes mover cubos de una cámara a otra. La única forma de crear un par que se neutralice es usando la <strong className="text-purple-400">Máquina Inversora</strong> que hay en cada cámara.</p>
        <p>Convierte a uno de los duplicados en su opuesto para despejar el camino. ¡Piensa con simetría!</p>
    </div>
);

const Level1_4Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Nuevas placas de presión! Estas reaccionan al <strong className="text-purple-400">valor absoluto</strong> de un cubo.</p>
        <p>Una placa marcada con <strong className="text-yellow-300">|N|</strong> se activará tanto si colocas un cubo de <strong className="text-red-400">lava [+N]</strong> como uno de <strong className="text-blue-400">hielo [-N]</strong>.</p>
        <p>Puede que necesites dejar un cubo en una placa para mantener una puerta abierta mientras resuelves otra parte del puzzle.</p>
    </div>
);

const Level2_1Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>El Cero es el centro del universo. Tu misión es ordenar los cubos en la recta numérica.</p>
        <p>Los cubos de <strong className="text-blue-400">hielo (-)</strong> deben ir a la izquierda del cero, y los de <strong className="text-red-400">lava (+)</strong> a la derecha.</p>
        <p>Coloca cada cubo en su casilla correcta, del menor al mayor, para abrir las puertas.</p>
    </div>
);

const Level2_2_MemoryHelp: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Bienvenido al Desafío de la Memoria!</p>
        <p>Los cubos de esta sala son <strong className="text-gray-400">Cubos de Memoria</strong>. ¡No puedes ver su valor a simple vista!</p>
        <p>Empuja un cubo sobre la <strong className="text-blue-400">Placa de Escáner</strong> en el centro de la sala para revelar temporalmente su valor.</p>
        <p>Usa tu memoria para identificar los cubos correctos y resolver la <strong className="text-yellow-300">Estación de Comparación</strong> para abrir la puerta final.</p>
    </div>
);

const Level2_3_RadioactiveHelp: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡CUIDADO! Este es un <strong className="text-red-500">Entorno Radioactivo</strong>.</p>
        <p>Las paredes de cada sala contienen <strong className="text-orange-400">Emisores Radioactivos</strong>. Periódicamente, lanzarán rocas incandescentes que bloquearán casillas de forma permanente. ¡Muévete rápido y planifica con antelación!</p>
        <p>Para avanzar, debes resolver las <strong className="text-yellow-300">Estaciones de Comparación</strong> en cada sala. La dificultad aumentará con cada puerta que abras.</p>
        <p>No dejes que la lluvia de rocas te impida pensar con lógica.</p>
    </div>
);

const Level2_4_SynthHelp: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Bienvenido al <strong className="text-blue-400">Sintetizador de Enteros</strong>!</p>
        <p className="text-red-400">¡ALERTA! Este entorno también es <strong className="text-orange-400">radioactivo</strong>. Las rocas caerán y bloquearán casillas permanentemente.</p>
        <p>En este nivel, no tienes todos los cubos que necesitas. ¡Debes crearlos!</p>
        <p>Coloca dos cubos en las ranuras de entrada del sintetizador. La máquina los <strong className="text-yellow-300">consumirá</strong> y creará un nuevo cubo en la plataforma de salida con la <strong className="text-green-400">suma</strong> de sus valores.</p>
        <p>Ejemplo: [+2] y [-5] se convierten en [-3]. En la sala final, deberás usar dos sintetizadores para crear los valores correctos y activar las placas de presión que abren la puerta a la meta.</p>
    </div>
);

const Level3_1Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Bienvenido al Laboratorio del Orden! Aquí, la lógica abre las puertas.</p>
        <p className="text-red-400">¡PRECAUCIÓN! <strong className="text-orange-400">TODO este nivel es radioactivo</strong>. En cada sala, las rocas caerán y bloquearán casillas permanentemente.</p>
        <p>Encontrarás <strong className="text-yellow-300">Estaciones de Comparación</strong> con los símbolos &gt; (mayor que), &lt; (menor que) y = (igual que).</p>
        <p>Resuelve los puzzles en cada sala para abrir las puertas de progreso. En la segunda sala, resolver cualquiera de los dos puzzles abrirá una <strong className="text-purple-400">cámara secreta</strong>.</p>
        <p>¡La cámara secreta contiene trofeos! Camina sobre ellos para recogerlos y ganar puntos. ¡Resuelve todos los puzzles del nivel para abrir la puerta final!</p>
    </div>
);

const Level3_2Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p className="text-red-400">¡CUIDADO! Bolas de fuego incandescentes caerán desde arriba. ¡Esquívalas o perderás una vida!</p>
        <p>¡Bienvenido a la Bóveda de Unidades! Aquí, los cubos no tienen valor... ¡tú se lo das!</p>
        <p>Usa los <strong className="text-yellow-300">Dispensadores</strong> en las paredes para generar cubos de <strong className="text-red-400">[+1]</strong> y <strong className="text-blue-400">[-1]</strong>.</p>
        <p>Tu objetivo es colocar cubos en el <strong className="text-purple-400">Depósito Numérico</strong> hasta que la suma total sea igual al número objetivo que se muestra en la pantalla.</p>
        <p>Ejemplo: Para un objetivo de [+4], coloca 4 cubos de <strong className="text-red-400">[+1]</strong> en el depósito. Si te equivocas y pones un cubo de [-1], ¡la suma bajará a [+3]!</p>
    </div>
);

const Level3_3Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Bienvenido a los Calibradores Lógicos!</p>
        <p className="text-red-400">¡CUIDADO! Bolas de fuego incandescentes caerán desde arriba. ¡Esquívalas o perderás una vida!</p>
        <p>Los depósitos ahora tienen condiciones lógicas. Se activarán cuando la suma de los cubos en su interior cumpla la condición (p.ej., &gt; 3, &lt; -2).</p>
        <p>En la sala final, encontrarás un <strong className="text-purple-400">Convertidor de Masa</strong>. Coloca cubos unitarios (+1 o -1) sobre esta máquina para invertir su tipo y valor.</p>
        <p>Gestiona tus recursos con cuidado para satisfacer todas las condiciones lógicas y alcanzar la meta.</p>
    </div>
);

const Level3_4Help: React.FC = () => (
    <div className="text-left text-base space-y-2">
        <p>¡Bienvenido al Ensamblador de Enteros, la prueba final!</p>
        <p>Tu objetivo es "programar" el gran panel en el suelo, llamado el <strong className="text-yellow-300">Ensamblador</strong>, para que cumpla MÚLTIPLES condiciones a la vez.</p>
        <p>Usa los <strong className="text-purple-400">Dispensadores</strong> para generar cubos de [+1] y [-1] y el <strong className="text-purple-400">Convertidor de Masa</strong> si necesitas invertir sus valores.</p>
        <p>El panel <strong className="text-cyan-400">SISTEMA ENSAMBLADOR</strong> te mostrará en tiempo real tu progreso para cada condición. Debes satisfacer todas las de una sala para abrir la siguiente puerta.</p>
        <p>En la sala final, ¡debes cumplir 6 condiciones simultáneamente para ganar! ¡Planifica con cuidado la distribución de tus cubos!</p>
    </div>
);


const HelpModal: React.FC<HelpModalProps> = ({ level, onClose }) => {
  let specificHelp;
  let title = "Instrucciones";

  const handleClose = () => {
    soundManager.play('modalClose');
    onClose();
  }

  switch (level) {
    case 0:
      specificHelp = <Level1_1Help />;
      title = "Episodio 1.1: Ayuda";
      break;
    case 1:
      specificHelp = <Level1_2Help />;
      title = "Episodio 1.2: Ayuda";
      break;
    case 2:
      specificHelp = <Level1_3Help />;
      title = "Episodio 1.3: Ayuda";
      break;
    case 3:
      specificHelp = <Level1_4Help />;
      title = "Episodio 1.4: Ayuda";
      break;
    case 4:
      specificHelp = <Level2_1Help />;
      title = "Episodio 2.1: Ayuda";
      break;
    case 5:
      specificHelp = <Level2_2_MemoryHelp />;
      title = "Episodio 2.2: Ayuda";
      break;
    case 6:
      specificHelp = <Level2_3_RadioactiveHelp />;
      title = "Episodio 2.3: Ayuda";
      break;
    case 7:
        specificHelp = <Level2_4_SynthHelp />;
        title = "Episodio 2.4: Ayuda";
        break;
    case 8:
      specificHelp = <Level3_1Help />;
      title = "Episodio 3.1: Ayuda";
      break;
    case 9:
      specificHelp = <Level3_2Help />;
      title = "Episodio 3.2: Ayuda";
      break;
    case 10:
      specificHelp = <Level3_3Help />;
      title = "Episodio 3.3: Ayuda";
      break;
    case 11:
      specificHelp = <Level3_4Help />;
      title = "Episodio 3.4: Ayuda";
      break;
    default:
      specificHelp = null;
  }

  return (
    <Modal title={title} onClose={handleClose} buttonText="¡Entendido!">
      <GeneralHelp />
      <hr className="my-4 border-gray-600"/>
      {specificHelp}
    </Modal>
  );
};

export default HelpModal;
