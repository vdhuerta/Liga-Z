
import React from 'react';

const GameBackground: React.FC = () => {
  const imageUrl = 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Fondo_LigaZ.png';

  const style: React.CSSProperties = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
    opacity: 0.4,
  };

  return <div style={style} aria-hidden="true" role="presentation" />;
};

export default GameBackground;