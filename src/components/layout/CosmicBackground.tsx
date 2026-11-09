import React, { useEffect, useRef, useState } from 'react';
import milkyWayBg from '../../assets/images/milky_way_galaxy_1794181944904.jpg';

interface CosmicBackgroundProps {
  opacity?: number;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ opacity = 0.55 }) => {
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

    // Dynamic Starfield
    const starCount = 90;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.007 + 0.003,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.35 ? '#ffffff' : Math.random() > 0.5 ? '#D4AF37' : '#c084fc',
    }));

    // Shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      alpha: number;
      angle: number;
      active: boolean;
    }

    const shootingStars: ShootingStar[] = [];

    const spawnShootingStar = () => {
      if (Math.random() < 0.015 && shootingStars.length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 120 + 80,
          speed: Math.random() * 10 + 12,
          alpha: 1,
          angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
          active: true,
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Dynamic Twinkling Stars
      for (const star of stars) {
        star.alpha += star.speed * star.twinkleDir;
        if (star.alpha > 0.9) {
          star.alpha = 0.9;
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

        // Soft halo on bright gold stars
        if (star.color === '#D4AF37' && star.radius > 1.1) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
          ctx.fill();
        }
      }

      // Spawn & Render Shooting Stars across Milky Way
      spawnShootingStar();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) continue;

        ctx.save();
        ctx.globalAlpha = s.alpha;

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(212, 175, 55, 0)');
        grad.addColorStop(0.7, 'rgba(245, 224, 143, 0.6)');
        grad.addColorStop(1, '#ffffff');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        ctx.restore();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.015;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          s.active = false;
          shootingStars.splice(i, 1);
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Real High-Resolution Milky Way Galaxy Sky Photo Layer */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={milkyWayBg}
          alt="Milky Way Galaxy"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          style={{ opacity }}
        />

        {/* Cinematic Deep Space Obsidian & Vignette Blend */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#060814]/75 via-[#060814]/60 to-[#04060d]/90 mix-blend-multiply"
        />

        {/* Ambient Cosmic Core Highlight */}
        <div 
          className="absolute inset-0 bg-radial from-transparent via-[#060814]/40 to-[#020409]/95 pointer-events-none"
        />
      </div>

      {/* Interactive Twinkling Canvas and Shooting Stars */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Subtle Nebula Atmospheric Glows */}
      <div 
        className="absolute top-[5%] right-[10%] w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" 
      />
      <div 
        className="absolute top-[30%] left-[15%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" 
      />
    </div>
  );
};
