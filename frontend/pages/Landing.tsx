<<<<<<< HEAD
<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp, Users, FileText, Zap, Award, ChevronRight } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp, Zap, Award, Sparkles } from 'lucide-react';
>>>>>>> master
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';
=======
import React, { useRef, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp, Zap, Award, Sparkles, Users, BookOpen } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';
import Hero3DText from '../components/Hero3DText';
import FeatureIcon3D from '../components/FeatureIcon3D';
import ParticleTrail from '../components/ParticleTrail';
>>>>>>> master

const BookScene = React.lazy(() => import('../components/BookScene'));
const ScrollScene = React.lazy(() => import('../components/ScrollScene'));
const Logo3D = React.lazy(() => import('../components/Logo3D'));
const GlowOrbs = React.lazy(() => import('../components/GlowOrbs'));

interface LandingProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

<<<<<<< HEAD
<<<<<<< HEAD
// Animated Counter Component
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};
=======

>>>>>>> master

=======
>>>>>>> master
const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const { scrollY } = useScroll();
<<<<<<< HEAD
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);
<<<<<<< HEAD
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 200]);
=======
>>>>>>> master
=======
  const scrollSectionRef = useRef<HTMLElement>(null);
>>>>>>> master

  // Parallax transforms for hero depth layers
  const heroY1 = useTransform(scrollY, [0, 600], [0, -80]);   // fast layer
  const heroY2 = useTransform(scrollY, [0, 600], [0, -40]);   // medium layer
  const heroY3 = useTransform(scrollY, [0, 600], [0, -120]);  // fastest layer (3D scene)
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

<<<<<<< HEAD
  return (
    <div className="relative overflow-hidden bg-[#050508] min-h-screen font-sans">

      {/* Animated Gradient Background */}
      {/* Animated Gradient Background - Optimized */}
      {/* Animated Gradient Background - Premium */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#030305]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <motion.div style={{ y: y2 }} className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <motion.div style={{ y: y3 }} className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
=======
  const features = [
    { iconType: 'clock' as const, title: 'Post Your Request', desc: 'Upload requirements, set deadline, receive instant quotes from verified writers.', color: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/20' },
    { iconType: 'shield' as const, title: 'Secure Payment', desc: 'Pay safely with escrow protection. Funds released only when you approve.', color: 'from-violet-500 to-purple-500', shadowColor: 'shadow-violet-500/20' },
    { iconType: 'trophy' as const, title: 'Get A+ Results', desc: 'Receive plagiarism-free work, request revisions, and excel in your courses.', color: 'from-fuchsia-500 to-pink-500', shadowColor: 'shadow-fuchsia-500/20' },
  ];

  return (
    <div className="relative overflow-hidden bg-[var(--bg-primary)] min-h-screen font-sans">

      {/* Particle Trail (full-page cursor effect) */}
      <ParticleTrail />

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[var(--bg-primary)]" />
        <div className="dark:block hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          <motion.div style={{ y: useTransform(scrollY, [0, 1000], [0, 50]) }} className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] mix-blend-screen opacity-40" />
          <motion.div style={{ y: useTransform(scrollY, [0, 1000], [0, -30]) }} className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[140px] mix-blend-screen opacity-40" />
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[130px] mix-blend-screen opacity-30" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-fuchsia-50/30" />
        </div>
>>>>>>> master
      </div>

      {/* Floating Nav with 3D Logo */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
<<<<<<< HEAD
<<<<<<< HEAD
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/30">P</div>
              <span className="text-xl font-bold text-white tracking-tight">Paperly</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex text-sm font-medium text-white/60">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onNavigate('LOGIN')} className="px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white transition-colors">
                  Log In
                </button>
                <button onClick={() => onNavigate('REGISTER')} className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all">
                  Get Started
                </button>
=======
          <div className="glass rounded-2xl px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/30">P</div>
=======
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl px-6 py-3 flex justify-between items-center border-b border-white/5"
          >
            <div className="flex items-center gap-2">
              {/* 3D Animated Logo */}
              <Suspense fallback={
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/30">P</div>
              }>
                <Logo3D />
              </Suspense>
>>>>>>> master
              <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-display">Paperly</span>
            </div>
            <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden md:flex gap-6 text-sm font-medium text-[var(--text-secondary)]">
                <a href="#features" className="hover:text-[var(--text-primary)] transition-colors relative group">
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-300" />
                </a>
                <a href="#journey" className="hover:text-[var(--text-primary)] transition-colors relative group">
                  Journey
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-300" />
                </a>
              </div>
              <div className="flex gap-2 md:gap-3">
                <button onClick={() => onNavigate('LOGIN')} className="px-4 md:px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Log In
                </button>
                <GlowButton onClick={() => onNavigate('REGISTER')} size="sm">
                  Get Started
<<<<<<< HEAD
                </motion.button>
>>>>>>> master
=======
                </GlowButton>
>>>>>>> master
              </div>
            </div>
          </motion.div>
        </div>
      </nav>

<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> master
      {/* Hero Section */}
      <motion.section style={{ opacity: opacity1 }} className="relative z-10 pt-32 pb-16 px-4 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
<<<<<<< HEAD

            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-8">
                <Zap size={14} className="animate-pulse" />
                #1 Academic Platform
              </div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-8 tracking-tight"
              >
                Ace Every
                <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 animate-text">
                  {Array.from("Assignment").map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 100 }}
                      className="inline-block"
                    >
=======
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-8">
                <Sparkles size={14} className="animate-pulse" />
                #1 Academic Platform
              </motion.div>

              <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="text-5xl lg:text-7xl font-black text-[var(--text-primary)] leading-[1.05] mb-8 tracking-tight font-display">
                Ace Every
                <br />
                <span className="gradient-text-animate">
                  {Array.from("Assignment").map((letter, i) => (
                    <motion.span key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 100 }} className="inline-block">
>>>>>>> master
                      {letter}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

<<<<<<< HEAD
              <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed">
=======
              <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-lg leading-relaxed">
>>>>>>> master
=======
      {/* ═══════ HERO SECTION with Parallax Depth ═══════ */}
      <section className="relative z-10 pt-32 pb-16 px-4 min-h-screen flex items-center">
        <motion.div style={{ opacity: heroOpacity }} className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Parallax Layer 1 (medium speed) */}
            <motion.div style={{ y: heroY2 }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">

              {/* Parallax badge — fast layer */}
              <motion.div style={{ y: heroY1 }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-8">
                  <Sparkles size={14} className="animate-pulse" />
                  #1 Academic Platform
                </motion.div>
              </motion.div>

              {/* 3D Extruded Heading */}
              <div className="mb-8">
                <Hero3DText line1="Ace Every" line2="Assignment" />
              </div>

              <motion.p style={{ y: heroY2 }} className="text-lg text-[var(--text-secondary)] mb-10 max-w-lg leading-relaxed">
>>>>>>> master
                Connect with verified expert writers. Get high-quality, plagiarism-free work delivered on time. Every time.
              </motion.p>

<<<<<<< HEAD
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
<<<<<<< HEAD
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('REGISTER')}
                  className="group relative px-8 py-4 bg-white text-violet-950 rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.7)] hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
=======
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('REGISTER')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
>>>>>>> master
                  <span className="relative flex items-center justify-center gap-2">
                    Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
<<<<<<< HEAD
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('LOGIN')}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                >
=======
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('LOGIN')}
                  className="px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg hover:bg-[var(--surface-hover)] transition-all">
>>>>>>> master
=======
              <motion.div style={{ y: heroY1 }} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <GlowButton onClick={() => onNavigate('REGISTER')} size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Start Free
                </GlowButton>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('LOGIN')}
                  className="px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg hover:bg-[var(--surface-hover)] transition-all animated-border">
>>>>>>> master
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Trust Badges */}
<<<<<<< HEAD
              <div className="flex items-center justify-center lg:justify-start gap-6 text-white/40 text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-400" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
=======
              <div className="flex items-center justify-center lg:justify-start gap-6 text-[var(--text-tertiary)] text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-500" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-500" />
>>>>>>> master
                  <span>Verified Writers</span>
                </div>
              </div>
            </motion.div>

<<<<<<< HEAD
            {/* Right: Hero Visual */}
<<<<<<< HEAD
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ y: y1 }}
              className="relative"
            >
              <div className="relative">
                {/* Main Image Card */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-3 shadow-2xl">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={currentImageIndex}
                        src={heroImages[currentImageIndex]}
                        alt="Hero"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>


                  </div>
                </div>


=======
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.3 }} style={{ y: y1 }} className="relative">
              <div className="relative">
                <div className="glass-card p-3 shadow-2xl">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <AnimatePresence mode="popLayout">
                      <motion.img key={currentImageIndex} src={heroImages[currentImageIndex]} alt="Hero"
                        initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
=======
            {/* Right: 3D Book — Parallax Layer 3 (fastest) */}
            <motion.div style={{ y: heroY3 }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }} className="relative">
              <div className="relative aspect-square max-w-[500px] mx-auto">
                <div className="absolute inset-0 glass-card-premium rounded-3xl overflow-hidden noise-overlay">
                  <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                  }>
                    <BookScene />
                  </Suspense>
>>>>>>> master
                </div>

                {/* Floating stat card - top right */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 md:top-4 md:right-[-2rem] glass-card px-4 py-3 flex items-center gap-3 z-20 shadow-xl"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Delivered</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">10,429</p>
                  </div>
                </motion.div>

                {/* Floating stat card - bottom left */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 md:bottom-8 md:left-[-2rem] glass-card px-4 py-3 flex items-center gap-3 z-20 shadow-xl"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Rating</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">4.9 ★</p>
                  </div>
                </motion.div>
>>>>>>> master
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

<<<<<<< HEAD
<<<<<<< HEAD


      {/* Features Section */}
      <section id="features" className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">How It Works</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Three simple steps to academic success</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Post Your Request', desc: 'Upload requirements, set deadline, receive instant quotes from verified writers.', color: 'from-blue-500 to-cyan-500' },
              { icon: Shield, title: 'Secure Payment', desc: 'Pay safely with escrow protection. Funds released only when you approve.', color: 'from-violet-500 to-purple-500' },
              { icon: TrendingUp, title: 'Get A+ Results', desc: 'Receive plagiarism-free work, request revisions, and excel in your courses.', color: 'from-fuchsia-500 to-purple-500' },
            ].map((feature, i) => (
=======
      {/* Features Section */}
=======
      {/* ═══════ SCROLL-DRIVEN 3D Journey ═══════ */}
      <section id="journey" ref={scrollSectionRef} className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Your Journey
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">Watch It Happen</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">Scroll to see your assignment journey unfold in 3D.</p>
          </motion.div>

          <div className="glass-card-premium rounded-3xl overflow-hidden noise-overlay">
            <Suspense fallback={
              <div className="w-full h-[300px] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            }>
              <ScrollScene containerRef={scrollSectionRef} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES with 3D Icons ═══════ */}
>>>>>>> master
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-4">
              <Zap size={12} /> How It Works
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">Three Simple Steps</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">From posting your request to receiving A+ work — it's that easy.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
>>>>>>> master
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
<<<<<<< HEAD
<<<<<<< HEAD
                whileHover={{ y: -5 }}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 via-violet-600/0 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed font-medium">{feature.desc}</p>
=======
                whileHover={{ y: -8 }}
                className="group relative glass-card p-8 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                <div className="absolute top-4 right-4 text-6xl font-black text-[var(--text-primary)] opacity-[0.03] font-display">{i + 1}</div>
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg ${feature.shadowColor} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors font-display">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
>>>>>>> master
=======
              >
                <TiltCard className="h-full" tiltIntensity={12}>
                  <div className="glass-card-premium p-8 overflow-hidden h-full group relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                    <div className="absolute top-4 right-4 text-6xl font-black text-[var(--text-primary)] opacity-[0.03] font-display">{i + 1}</div>

                    {/* 3D Feature Icon */}
                    <div className="mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <FeatureIcon3D type={feature.iconType} />
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent)] transition-colors font-display">{feature.title}</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
                  </div>
                </TiltCard>
>>>>>>> master
              </motion.div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
<<<<<<< HEAD





      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center">
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} Paperly. All rights reserved.</p>
        <div className="flex justify-center gap-8 mt-4 text-white/30 text-sm">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
=======
      {/* CTA Section */}
=======
      {/* ═══════ CTA SECTION ═══════ */}
>>>>>>> master
      <section className="relative z-10 py-20 px-4">
        {/* 3D Glow Orbs floating behind CTA */}
        <Suspense fallback={null}>
          <GlowOrbs />
        </Suspense>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="glass-card-premium p-12 md:p-16 relative overflow-hidden noise-overlay">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">Ready to get started?</h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">Join thousands of students who are already acing their assignments with Paperly.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <GlowButton onClick={() => onNavigate('REGISTER')} size="lg" icon={<ArrowRight size={20} />}>
                    Get Started Free
                  </GlowButton>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('LOGIN')}
                    className="px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg transition-all animated-border">
                    Sign In
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 py-12 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Suspense fallback={
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-violet-500/30">P</div>
                }>
                  <Logo3D />
                </Suspense>
                <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight font-display">Paperly</span>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">Study smarter, not harder. The #1 platform connecting students with expert writers.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Features</a>
                <a href="#journey" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Journey</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider mb-4">Legal</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Terms of Service</a>
                <a href="#" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6">
            <p className="text-[var(--text-tertiary)] text-sm text-center">© {new Date().getFullYear()} Paperly. All rights reserved.</p>
          </div>
        </div>
      </footer>
>>>>>>> master
    </div>
  );
};

export default Landing;
<<<<<<< HEAD




=======
>>>>>>> master
