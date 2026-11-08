import React, { useEffect, useRef } from 'react';

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Stars definition
    const starCount = 85;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.008 + 0.003,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.3 ? '#ffffff' : Math.random() > 0.5 ? '#D4AF37' : '#93c5fd',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.45,
        height * 0.35,
        100,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, '#0d1329');
      bgGrad.addColorStop(0.35, '#090d21');
      bgGrad.addColorStop(0.7, '#060814');
      bgGrad.addColorStop(1, '#03040a');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle Gold Milkyway ribbon
      const ribbonGrad = ctx.createLinearGradient(0, 0, width, height);
      ribbonGrad.addColorStop(0, 'rgba(212, 175, 55, 0.02)');
      ribbonGrad.addColorStop(0.4, 'rgba(147, 51, 234, 0.04)');
      ribbonGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.03)');
      ribbonGrad.addColorStop(1, 'rgba(212, 175, 55, 0.015)');
      ctx.fillStyle = ribbonGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Stars
      for (const star of stars) {
        star.alpha += star.speed * star.twinkleDir;
        if (star.alpha > 0.85) {
          star.alpha = 0.85;
          star.twinkleDir = -1;
        } else if (star.alpha < 0.15) {
          star.alpha = 0.15;
          star.twinkleDir = 1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();

        // Add soft glow around gold stars
        if (star.color === '#D4AF37' && star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {/* Subtle cosmic nebula blobs */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-900/15 blur-[120px] animate-nebula pointer-events-none" 
      />
      <div 
        className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-blue-900/15 blur-[120px] pointer-events-none" 
      />
      <div 
        className="absolute top-[35%] left-[25%] w-[450px] h-[450px] rounded-full bg-[#D4AF37]/5 blur-[140px] pointer-events-none" 
      />
    </div>
  );
};
