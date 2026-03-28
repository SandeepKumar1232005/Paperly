import React from 'react';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  const { theme } = useTheme();
  
  return (
    <div className="relative group flex items-center justify-center">
      <img
        src={theme === 'dark' ? logoDark : logoLight}
        alt="Paperly Logo"
        className={`object-contain transition-all duration-500 group-hover:scale-110 ${className}`}
        style={{ 
          filter: theme === 'dark' ? 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.4))' : 'none',
          pointerEvents: 'none' 
        }}
      />
      {/* Subtle background glow for dark mode visibility */}
      {theme === 'dark' && (
        <div className="absolute inset-0 bg-violet-500/10 blur-[20px] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}
    </div>
  );
};

export default Logo;
