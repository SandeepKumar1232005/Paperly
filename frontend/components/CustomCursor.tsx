import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(true);
  
  // Custom cursor states
  const [isHovering, setIsHovering] = useState(false);
  const [isTextHover, setIsTextHover] = useState(false);

  // Use motion values for coordinates
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Springs for the large ring (lagging effect)
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only show on desktop
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      setIsDesktop(false);
      return;
    }
    
    setIsDesktop(true);

    const updateMousePosition = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if it's a clickable element
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer';

      // Check if it's text
      const isText = 
        target.tagName.toLowerCase() === 'p' ||
        target.tagName.toLowerCase() === 'h1' ||
        target.tagName.toLowerCase() === 'h2' ||
        target.tagName.toLowerCase() === 'h3' ||
        target.tagName.toLowerCase() === 'span' ||
        window.getComputedStyle(target).cursor === 'text';

      setIsHovering(!!isClickable);
      setIsTextHover(!isClickable && !!isText);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.style.cursor = 'auto';
    };
  }, [cursorX, cursorY]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Small exact circle */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHovering ? 0 : 1
        }}
        transition={{ duration: 0 }} // No lag
      />

      {/* Large lagging ring */}
      <motion.div
        className="fixed top-0 left-0 border rounded-full pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          borderColor: isHovering ? '#a855f7' : 'rgba(255, 255, 255, 0.3)',
          borderWidth: isHovering ? 2 : 1,
        }}
        animate={{
          width: isTextHover ? 4 : isHovering ? 52 : 36,
          height: isTextHover ? 20 : isHovering ? 52 : 36,
          borderRadius: isTextHover ? '2px' : '50%',
          backgroundColor: isHovering ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </>
  );
};

export default CustomCursor;
