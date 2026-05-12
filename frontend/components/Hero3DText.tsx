import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Hero3DTextProps {
  line1: string;
  line2: string;
}

const Hero3DText: React.FC<Hero3DTextProps> = ({ line1, line2 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateY(x * 12);
    setRotateX(-y * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Generate layered shadows for 3D depth effect
  const generate3DShadow = (color: string, depth: number) => {
    const shadows = [];
    for (let i = 1; i <= depth; i++) {
      shadows.push(`${i * 0.5}px ${i * 0.5}px 0px ${color}`);
    }
    return shadows.join(', ');
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '800px' }}
      className="cursor-default select-none"
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Line 1 */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl lg:text-7xl font-black text-[var(--text-primary)] leading-[1.05] tracking-tight font-display"
          style={{
            textShadow: isHovered
              ? generate3DShadow('rgba(139, 92, 246, 0.15)', 6)
              : generate3DShadow('rgba(0,0,0,0.05)', 3),
            transform: 'translateZ(20px)',
            transition: 'text-shadow 0.4s ease',
          }}
        >
          {line1}
        </motion.div>

        {/* Line 2 — gradient animated */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            transform: 'translateZ(35px)',
            textShadow: isHovered
              ? generate3DShadow('rgba(217, 70, 239, 0.2)', 8)
              : generate3DShadow('rgba(139, 92, 246, 0.1)', 4),
            transition: 'text-shadow 0.4s ease',
          }}
        >
          <span className="text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight font-display gradient-text-animate inline-block">
            {line2.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  delay: 0.5 + i * 0.06,
                  type: 'spring',
                  stiffness: 120,
                  damping: 12,
                }}
                className="inline-block"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        </motion.div>

        {/* 3D depth reflection line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.6 }}
          className="h-1 mt-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-transparent origin-left"
          style={{
            transform: 'translateZ(10px)',
            opacity: isHovered ? 0.8 : 0.3,
            transition: 'opacity 0.4s ease',
          }}
        />
      </motion.div>
    </div>
  );
};

export default Hero3DText;
