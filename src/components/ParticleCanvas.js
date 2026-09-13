import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas({ particles, theme }) {
  const canvasRef = useRef(null);
  const activeParticlesRef = useRef([]);

  useEffect(() => {
    if (particles && particles.length > 0) {
      // Spawn new particles from cleared cells
      particles.forEach(p => {
        const color = theme.blockColors[p.color] || theme.accent;
        const count = 12; // 12 particles per cleared block cell
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 6;
          activeParticlesRef.current.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1, // slight upward pop
            size: 4 + Math.random() * 6,
            color: color,
            alpha: 1,
            decay: 0.02 + Math.random() * 0.02,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
          });
        }
      });
    }
  }, [particles, theme]);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      activeParticlesRef.current = activeParticlesRef.current.filter(p => p.alpha > 0.05);

      activeParticlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity effect
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        // Draw rounded particle square or gem shard
        ctx.beginPath();
        ctx.roundRect(-p.size / 2, -p.size / 2, p.size, p.size, 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={640}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50
      }}
    />
  );
}
