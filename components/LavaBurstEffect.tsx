
import React, { useRef, useEffect } from 'react';

const PARTICLE_COUNT = 180; // Aumentado para mayor abundancia
const GRAVITY = 0.08;
const FADE_RATE = 0.01;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 200;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
  color: string;
}

const LavaBurstEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  // FIX: useRef was called without an initial value, which can cause issues with some TypeScript/React type versions. Initialize with null.
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Inicializar partículas solo una vez
    if (particlesRef.current.length === 0) {
      // Crear múltiples puntos de explosión para un efecto más amplio y abundante
      const burstPointsX = [CANVAS_WIDTH * 0.2, CANVAS_WIDTH * 0.5, CANVAS_WIDTH * 0.8];
      const centerY = CANVAS_HEIGHT; // Empezar desde la parte inferior
      const colors = ['#ff6b35', '#ffb44a', '#ffe177', '#c94a1a', '#8b2f0a'];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const originX = burstPointsX[i % burstPointsX.length]; // Alternar entre los puntos de explosión

        const angle = Math.random() * Math.PI; // Hemisferio superior para una explosión hacia arriba
        const speed = Math.random() * 5 + 2.5; // Velocidad ligeramente aumentada para más altura
        particlesRef.current.push({
          x: originX,
          y: centerY,
          vx: Math.cos(angle - Math.PI / 2) * speed, // Crea el arco de la fuente
          vy: -Math.sin(angle) * speed * 1.5, // Empuja las partículas hacia arriba
          alpha: 1,
          radius: Math.random() * 4 + 2, // Partículas más grandes
          color: colors[i % colors.length],
        });
      }
    }

    const animate = () => {
      if (!canvasRef.current || !ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      let allFaded = true;
      particlesRef.current.forEach(p => {
        if (p.alpha > 0) {
          allFaded = false;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += GRAVITY;
          p.alpha -= FADE_RATE;

          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      ctx.globalAlpha = 1;

      if (!allFaded) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    bottom: '100%', // Posicionarlo justo encima del padre
    transform: 'translateX(-50%)',
    width: `${CANVAS_WIDTH}px`,
    height: `${CANVAS_HEIGHT}px`,
    pointerEvents: 'none',
    zIndex: 5,
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={style}
      aria-hidden="true"
    />
  );
};

export default LavaBurstEffect;
