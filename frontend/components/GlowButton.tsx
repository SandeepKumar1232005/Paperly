import React from 'react';
import { motion } from 'framer-motion';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variants = {
  primary: {
    bg: 'from-violet-600 via-fuchsia-600 to-violet-600',
    glow: 'shadow-violet-500/40',
    glowHover: 'hover:shadow-violet-500/60',
    ring: 'from-violet-400 via-fuchsia-400 to-violet-400',
  },
  secondary: {
    bg: 'from-slate-600 via-slate-500 to-slate-600',
    glow: 'shadow-slate-500/20',
    glowHover: 'hover:shadow-slate-500/40',
    ring: 'from-slate-400 via-slate-300 to-slate-400',
  },
  emerald: {
    bg: 'from-emerald-600 via-teal-600 to-emerald-600',
    glow: 'shadow-emerald-500/40',
    glowHover: 'hover:shadow-emerald-500/60',
    ring: 'from-emerald-400 via-teal-400 to-emerald-400',
  },
};

const sizes = {
  sm: 'px-4 py-2.5 text-sm',
  md: 'px-6 py-3.5 text-base',
  lg: 'px-8 py-4 text-lg',
};

const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
}) => {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative overflow-hidden rounded-2xl font-bold text-white
        bg-gradient-to-r ${v.bg} bg-[length:200%_100%]
        shadow-lg ${v.glow} ${v.glowHover}
        transition-all duration-300
        disabled:opacity-60 disabled:cursor-not-allowed
        ${s} ${className}
      `}
      style={{ backgroundSize: '200% 100%' }}
    >
      {/* Animated gradient border ring */}
      <div className={`absolute -inset-[1px] rounded-[inherit] bg-gradient-to-r ${v.ring} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px] -z-10`} />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

export default GlowButton;
