import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import Logo from './Logo'

interface LoadingScreenProps {
  role?: 'STUDENT' | 'WRITER' | 'ADMIN' | null
  message?: string
}

const roleConfig = {
  STUDENT: {
    primary: '#7c3aed',
    secondary: '#a855f7',
    glow: 'rgba(124,58,237,0.25)',
    label: 'STUDENT PORTAL',
    messages: [
      'Loading your assignments...',
      'Connecting to writers...',
      'Fetching notifications...',
      'Almost ready...'
    ]
  },
  WRITER: {
    primary: '#059669',
    secondary: '#34d399',
    glow: 'rgba(5,150,105,0.25)',
    label: 'WRITER PORTAL',
    messages: [
      'Loading available work...',
      'Syncing your profile...',
      'Fetching assignment requests...',
      'Almost ready...'
    ]
  },
  ADMIN: {
    primary: '#dc2626',
    secondary: '#f87171',
    glow: 'rgba(220,38,38,0.25)',
    label: 'ADMIN PORTAL',
    messages: [
      'Loading system data...',
      'Fetching user records...',
      'Syncing platform metrics...',
      'Almost ready...'
    ]
  },
  DEFAULT: {
    primary: '#7c3aed',
    secondary: '#a855f7',
    glow: 'rgba(124,58,237,0.25)',
    label: 'PAPERLY',
    messages: [
      'Initializing Paperly...',
      'Setting things up...',
      'Almost ready...'
    ]
  }
}

const LoadingScreen = ({ role, message }: LoadingScreenProps) => {
  const config = role ? roleConfig[role] : roleConfig.DEFAULT
  
  const progressRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [msgIndex, setMsgIndex] = useState(0)
  const messages = message ? [message] : config.messages

  // Rotate messages every 1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [messages.length])

  // GSAP progress bar loop
  useEffect(() => {
    if (!progressRef.current) return
    gsap.fromTo(progressRef.current,
      { width: '0%' },
      {
        width: '100%',
        duration: 2.5,
        ease: 'power2.inOut',
        repeat: -1,
        onRepeat: () => {
          if (progressRef.current) {
            gsap.set(progressRef.current, { width: '0%' })
          }
        }
      }
    )
    
    // Glow pulse
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        scale: 1.2,
        opacity: 0.6,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      })
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0a0a14' }}
    >
      {/* Grid background */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Role-colored glow orb */}
      <div
        ref={glowRef}
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
          opacity: 0.4,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: config.primary,
              boxShadow: `0 0 30px ${config.glow}`
            }}
          >
            <Logo className="w-8 h-8" />
          </div>
          <motion.span
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white font-display font-bold text-2xl tracking-tight"
          >
            Paperly
          </motion.span>
        </motion.div>

        {/* Three concentric rings */}
        <div className="relative w-20 h-20 mt-2">
          {/* Ring 1 - outer */}
          <div className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: '2px solid rgba(255,255,255,0.06)',
              borderTopColor: config.primary,
              borderRightColor: config.secondary,
              animationDuration: '1.2s',
            }}
          />
          {/* Ring 2 - middle */}
          <div className="absolute inset-[10px] rounded-full animate-spin"
            style={{
              border: '2px solid rgba(255,255,255,0.04)',
              borderBottomColor: config.secondary,
              animationDirection: 'reverse',
              animationDuration: '0.8s',
            }}
          />
          {/* Ring 3 - inner */}
          <div className="absolute inset-[20px] rounded-full animate-spin"
            style={{
              border: '2px solid rgba(255,255,255,0.03)',
              borderLeftColor: config.primary + '99',
              animationDuration: '1.6s',
            }}
          />
          {/* Center dot */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              background: config.primary,
              boxShadow: `0 0 12px ${config.primary}`
            }}
          />
        </div>

        {/* Status message */}
        <div className="h-6 flex items-center mt-6">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-sm text-white/50 font-body text-center"
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-[2px] rounded-full overflow-hidden mt-6"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            ref={progressRef}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${config.primary}, ${config.secondary})`,
              boxShadow: `0 0 8px ${config.primary}`,
              width: '0%'
            }}
          />
        </div>

        {/* Role badge */}
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full mt-4"
          style={{
            border: `1px solid ${config.primary}40`,
            background: `${config.primary}15`
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: config.secondary }}
          />
          <span
            className="text-[10px] font-accent font-semibold tracking-[0.2em]"
            style={{ color: config.secondary }}
          >
            {config.label}
          </span>
        </div>

      </div>
    </motion.div>
  )
}

export default LoadingScreen
