import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface FlipDigitProps {
  digit: string;
  delay: number;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit, delay }) => {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setFlipped(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, delay]);

  const isNumber = !isNaN(Number(digit));

  return (
    <div ref={ref} className="relative inline-block" style={{ perspective: '400px' }}>
      <div
        className="relative"
        style={{
          width: isNumber ? '2.2em' : '1em',
          height: '2.8em',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Static digit (shown initially) */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-lg transition-opacity duration-300 ${
            flipped ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="text-3xl md:text-4xl font-black text-[var(--text-primary)] font-display">
            {digit === '0' ? '0' : digit}
          </span>
        </div>

        {/* Flipping card */}
        {isNumber && (
          <>
            {/* Top half (stays) */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={flipped ? { rotateX: 0 } : {}}
              className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-lg"
              style={{
                backfaceVisibility: 'hidden',
                transformOrigin: 'bottom center',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div className="flex items-end justify-center h-full pb-0">
                <span className="text-3xl md:text-4xl font-black text-[var(--text-primary)] font-display translate-y-[55%]">
                  {digit}
                </span>
              </div>
            </motion.div>

            {/* Bottom half with flip animation */}
            <motion.div
              initial={{ rotateX: -90 }}
              animate={flipped ? { rotateX: 0 } : { rotateX: -90 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                delay: 0.1,
              }}
              className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-lg"
              style={{
                backfaceVisibility: 'hidden',
                transformOrigin: 'top center',
                background: 'var(--bg-secondary)',
              }}
            >
              <div className="flex items-start justify-center h-full pt-0">
                <span className="text-3xl md:text-4xl font-black text-[var(--text-primary)] font-display -translate-y-[45%]">
                  {digit}
                </span>
              </div>
            </motion.div>
          </>
        )}

        {/* Non-number characters */}
        {!isNumber && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={flipped ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-3xl md:text-4xl font-black text-[var(--accent)] font-display">
              {digit}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface FlipCounterProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  staggerDelay?: number;
}

const FlipCounter: React.FC<FlipCounterProps> = ({ value, label, icon, staggerDelay = 0 }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-0.5">
        {value.split('').map((char, i) => (
          <FlipDigit key={i} digit={char} delay={staggerDelay + i * 120} />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] font-medium">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
};

export default FlipCounter;
