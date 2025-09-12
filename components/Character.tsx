
import React from 'react';
import type { Position, Direction } from '../types';

interface CharacterProps {
  position: Position;
  facingDirection: Direction;
  tileSize: number;
}

const ZetaFront: React.FC = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" width="100%" height="100%">
    {/* CUERPO PRINCIPAL */}
    {/* torso */}
    <rect className="pixel stroke" x="156" y="180" width="200" height="170" rx="8" fill="var(--metal)"/>
    <rect className="pixel" x="156" y="250" width="200" height="100" fill="var(--metal-2)" opacity=".6"/>
    {/* borde superior decorativo */}
    <rect className="pixel" x="156" y="180" width="200" height="16" fill="var(--accent)"/>

    {/* CABEZA */}
    <rect className="pixel stroke" x="176" y="96" width="160" height="90" rx="6" fill="var(--metal)"/>
    {/* franja */}
    <rect className="pixel" x="176" y="96" width="160" height="14" fill="var(--accent)"/>
    {/* ojos */}
    <rect className="pixel stroke" x="206" y="132" width="36" height="20" rx="2" fill="var(--blue)"/>
    <rect className="pixel stroke" x="270" y="132" width="36" height="20" rx="2" fill="var(--red)"/>
    {/* boca */}
    <rect className="pixel" x="220" y="162" width="72" height="10" fill="#7b859c"/>

    {/* BRAZOS */}
    {/* izquierdo */}
    <rect className="pixel stroke" x="110" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
    <rect className="pixel stroke" x="102" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>
    {/* derecho */}
    <rect className="pixel stroke" x="356" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
    <rect className="pixel stroke" x="356" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>

    {/* MANOS + ORBES (positivo/negativo) */}
    {/* mano izquierda (orbe azul = +) */}
    <rect className="pixel stroke" x="86" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
    <circle className="pixel stroke" cx="70" cy="272" r="22" fill="var(--blue)"/>
    <rect className="pixel gloss" x="57" y="260" width="13" height="9" fill="#fff"/>
    {/* símbolo + */}
    <rect className="pixel" x="67" y="267" width="6" height="20" fill="#fff"/>
    <rect className="pixel" x="59" y="275" width="22" height="6" fill="#fff"/>

    {/* mano derecha (orbe rojo = −) */}
    <rect className="pixel stroke" x="398" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
    <circle className="pixel stroke" cx="442" cy="272" r="22" fill="var(--red)"/>
    <rect className="pixel gloss" x="429" y="260" width="13" height="9" fill="#fff"/>
    {/* símbolo − */}
    <rect className="pixel" x="432" y="275" width="22" height="6" fill="#fff"/>

    {/* CINTURÓN */}
    <rect className="pixel stroke" x="176" y="342" width="160" height="18" fill="#8b95aa"/>
    <rect className="pixel" x="186" y="342" width="50" height="18" fill="#9fa9bf"/>
    <rect className="pixel" x="276" y="342" width="50" height="18" fill="#9fa9bf"/>

    {/* PIERNAS */}
    <rect className="pixel stroke" x="188" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
    <rect className="pixel stroke" x="280" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
    {/* botas */}
    <rect className="pixel stroke" x="176" y="422" width="68" height="26" rx="4" fill="#8892a8"/>
    <rect className="pixel stroke" x="268" y="422" width="68" height="26" rx="4" fill="#8892a8"/>

    {/* PECHO: LOGO ZETA (Z pixel) */}
    <g className="pixel stroke" transform="translate(206 208)">
      {/* placa */}
      <rect x="0" y="0" width="100" height="80" rx="6" fill="#ffffff"/>
      <rect x="4" y="4" width="92" height="72" rx="4" fill="#e9edf6"/>
      {/* Z en bloques */}
      <rect x="10" y="16" width="80" height="16" fill="var(--ink)"/>
      <rect x="26" y="32" width="48" height="16" fill="var(--ink)"/>
      <rect x="10" y="48" width="80" height="16" fill="var(--ink)"/>
      {/* línea de neón alrededor */}
      <rect x="2" y="2" width="96" height="76" rx="5" fill="none" stroke="var(--accent)" strokeWidth="4"/>
    </g>

    {/* CHISPAS DE CANCELACIÓN (detalle visual) */}
    <g opacity=".18">
      <polygon className="pixel" points="112,298 118,286 124,298" fill="var(--blue)"/>
      <polygon className="pixel" points="400,298 406,286 412,298" fill="var(--red)"/>
    </g>
  </svg>
);

const ZetaBack: React.FC = () => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" width="100%" height="100%">
      {/* CUERPO PRINCIPAL */}
      <rect className="pixel stroke" x="156" y="180" width="200" height="170" rx="8" fill="var(--metal)"/>
      <rect className="pixel" x="156" y="250" width="200" height="100" fill="var(--metal-2)" opacity=".6"/>
      
      {/* CABEZA (VISTA TRASERA) */}
      <rect className="pixel stroke" x="176" y="96" width="160" height="90" rx="6" fill="var(--metal)"/>
      <rect className="pixel" x="206" y="110" width="100" height="60" fill="var(--metal-2)"/>
      
      {/* BRAZOS */}
      <rect className="pixel stroke" x="110" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="102" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>
      <rect className="pixel stroke" x="356" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="356" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>

      {/* MANOS + ORBES (visibles desde atrás) */}
      <rect className="pixel stroke" x="86" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
      <circle className="pixel stroke" cx="70" cy="272" r="22" fill="var(--blue)"/>
      <rect className="pixel stroke" x="398" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
      <circle className="pixel stroke" cx="442" cy="272" r="22" fill="var(--red)"/>
      
      {/* CINTURÓN */}
      <rect className="pixel stroke" x="176" y="342" width="160" height="18" fill="#8b95aa"/>
      
      {/* PIERNAS */}
      <rect className="pixel stroke" x="188" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="280" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
      <rect className="pixel stroke" x="176" y="422" width="68" height="26" rx="4" fill="#8892a8"/>
      <rect className="pixel stroke" x="268" y="422" width="68" height="26" rx="4" fill="#8892a8"/>
  </svg>
);

const ZetaSideRight: React.FC = () => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" width="100%" height="100%">
      {/* Mueve todo el grupo para centrar el personaje de perfil */}
      <g transform="translate(30 0)">
          {/* Pierna trasera */}
          <rect className="pixel stroke" x="250" y="360" width="44" height="66" rx="4" fill="var(--metal-2)" />
          <rect className="pixel stroke" x="240" y="422" width="68" height="26" rx="4" fill="#7b859c" />

          {/* Torso */}
          <rect className="pixel stroke" x="226" y="180" width="110" height="170" rx="8" fill="var(--metal)"/>
          <rect className="pixel" x="226" y="180" width="110" height="16" fill="var(--accent)"/>
          
          {/* Cabeza */}
          <rect className="pixel stroke" x="236" y="96" width="100" height="90" rx="6" fill="var(--metal)"/>
          <rect className="pixel" x="236" y="96" width="100" height="14" fill="var(--accent)"/>
          
          {/* Ojo visible (rojo para la derecha) */}
          <rect className="pixel stroke" x="270" y="132" width="36" height="20" rx="2" fill="var(--red)"/>
          
          {/* Cinturón */}
          <rect className="pixel stroke" x="226" y="342" width="110" height="18" fill="#8b95aa"/>

          {/* Brazo visible (derecho) y orbe */}
          <rect className="pixel stroke" x="320" y="208" width="46" height="34" rx="4" fill="var(--metal)"/>
          <rect className="pixel stroke" x="328" y="236" width="54" height="30" rx="4" fill="var(--metal-2)"/>
          <rect className="pixel stroke" x="370" y="258" width="28" height="28" rx="4" fill="var(--metal)"/>
          <circle className="pixel stroke" cx="414" cy="272" r="22" fill="var(--red)"/>
          <rect className="pixel" x="404" y="275" width="22" height="6" fill="#fff"/>
          
          {/* Pierna delantera */}
          <rect className="pixel stroke" x="228" y="360" width="44" height="66" rx="4" fill="var(--metal)"/>
          <rect className="pixel stroke" x="216" y="422" width="68" height="26" rx="4" fill="#8892a8"/>
      </g>
  </svg>
);


const Character: React.FC<CharacterProps> = ({ position, facingDirection, tileSize }) => {
  const style: React.CSSProperties = {
    top: `${position.row * tileSize}px`,
    left: `${position.col * tileSize}px`,
    width: `${tileSize}px`,
    height: `${tileSize}px`,
    transition: 'top 0.1s ease-in-out, left 0.1s ease-in-out',
    transform: '',
  };
  
  const getRotation = () => {
    switch (facingDirection) {
      case 'up': return 'rotate(180deg)';
      case 'down': return 'rotate(0deg)';
      default: return 'rotate(0deg)';
    }
  };

  const renderCharacter = () => {
    switch (facingDirection) {
      case 'up':
        // La vista trasera ya está orientada 'hacia arriba', la rotamos 180 para que mire lejos
        return <div style={{ transform: getRotation(), width: '100%', height: '100%' }}><ZetaFront /></div>;
      case 'down':
        return <div style={{ transform: getRotation(), width: '100%', height: '100%' }}><ZetaFront /></div>;
      case 'left':
        // Voltea horizontalmente la vista lateral derecha
        return <div style={{ transform: 'scaleX(-1)', width: '100%', height: '100%' }}><ZetaSideRight /></div>;
      case 'right':
        return <ZetaSideRight />;
      default:
        return <ZetaFront />;
    }
  };

  return (
    <div
      style={style}
      className="absolute flex items-end justify-center"
      aria-label="ZETA"
    >
      {renderCharacter()}
    </div>
  );
};

export default Character;