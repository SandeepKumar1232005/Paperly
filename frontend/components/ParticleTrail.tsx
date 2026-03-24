import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface AmbientParticle {
  x: number;
  y: number;
  baseY: number;
  size: number;
  speed: number;
  alpha: number;
  color: string;
  phase: number;      // unique oscillation phase
  driftSpeed: number;  // horizontal drift
}

const COLORS = ['#8b5cf6', '#d946ef', '#c084fc', '#a855f7', '#818cf8', '#f0abfc'];
const AMBIENT_COLORS = ['#8b5cf6', '#6366f1', '#c084fc', '#818cf8', '#a78bfa', '#e9d5ff'];

const ParticleTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ambientRef = useRef<AmbientParticle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const scrollRef = useRef(0);
  const rafRef = useRef<number>(0);
  const initializedRef = useRef(false);

  const createParticle = useCallback((x: number, y: number) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.3;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.5,
      size: Math.random() * 3 + 1.5,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: Math.random() * 40 + 20,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Initialize ambient particles (spread across full page height)
    if (!initializedRef.current) {
      const count = 60;
      for (let i = 0; i < count; i++) {
        ambientRef.current.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          baseY: Math.random() * window.innerHeight,
          size: Math.random() * 2.5 + 0.5,
          speed: Math.random() * 0.3 + 0.1,
          alpha: Math.random() * 0.4 + 0.1,
          color: AMBIENT_COLORS[Math.floor(Math.random() * AMBIENT_COLORS.length)],
          phase: Math.random() * Math.PI * 2,
          driftSpeed: (Math.random() - 0.5) * 0.3,
        });
      }
      initializedRef.current = true;
    }

    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY));
      }
      if (particlesRef.current.length > 120) {
        particlesRef.current = particlesRef.current.slice(-100);
      }
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = performance.now() * 0.001;
      const scroll = scrollRef.current;

      // ─── Ambient background particles ───
      ambientRef.current.forEach((p) => {
        // Scroll-reactive: particles drift upward relative to scroll
        const scrollOffset = (scroll * p.speed * 0.15) % canvas.height;

        // Oscillating position
        const drawX = p.x + Math.sin(time * p.speed + p.phase) * 30 + p.driftSpeed * time * 10;
        let drawY = (p.baseY - scrollOffset + canvas.height) % canvas.height;

        // Gentle vertical oscillation
        drawY += Math.cos(time * p.speed * 0.7 + p.phase) * 15;

        // Pulse alpha based on scroll proximity to mouse
        const dx = drawX - mouseRef.current.x;
        const dy = drawY - mouseRef.current.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - distToMouse / 200);
        const pulseAlpha = p.alpha + mouseInfluence * 0.4;

        // Pulse size
        const pulseSize = p.size + Math.sin(time * 2 + p.phase) * 0.3 + mouseInfluence * 1.5;

        ctx.save();
        ctx.globalAlpha = Math.min(pulseAlpha, 0.7);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6 + mouseInfluence * 10;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(
          ((drawX % canvas.width) + canvas.width) % canvas.width,
          drawY,
          pulseSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      });

      // ─── Cursor trail particles ───
      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.alpha = 1 - p.life / p.maxLife;
        p.size *= 0.98;

        if (p.life >= p.maxLife || p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // ─── Cursor glow ───
      const { x, y } = mouseRef.current;
      if (x > 0 && y > 0) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 35);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
        gradient.addColorStop(0.5, 'rgba(217, 70, 239, 0.05)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 35, y - 35, 70, 70);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default ParticleTrail;
