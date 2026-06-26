import React, { useRef, Suspense, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp, Zap, Award, Sparkles, Users, BookOpen, Sun, Moon, ArrowUp } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';
import Hero3DText from '../components/Hero3DText';
import FeatureIcon3D from '../components/FeatureIcon3D';
import ParticleTrail from '../components/ParticleTrail';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import RevealOnScroll from '../components/RevealOnScroll';

import HandwritingShowcase from '../components/landing/HandwritingShowcase';
import ProcessTimeline from '../components/landing/ProcessTimeline';
import TrustBento from '../components/landing/TrustBento';
import PricingEstimator from '../components/landing/PricingEstimator';

import BookScene from '../components/BookScene';
import GlowOrbs from '../components/GlowOrbs';

interface LandingProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScroll();
  const scrollSectionRef = useRef<HTMLElement>(null);

  const [showPreloader, setShowPreloader] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('paperly_visited')) {
      setShowPreloader(true);
      sessionStorage.setItem('paperly_visited', 'true');
      const timer = setTimeout(() => setShowPreloader(false), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parallax transforms for hero depth layers
  const heroY1 = useTransform(scrollY, [0, 600], [0, -80]);   // fast layer
  const heroY2 = useTransform(scrollY, [0, 600], [0, -40]);   // medium layer
  const heroY3 = useTransform(scrollY, [0, 600], [0, -120]);  // fastest layer (3D scene)
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const features = [
    { iconType: 'clock' as const, title: 'Post & Pick Handwriting', desc: 'Upload requirements, set a deadline, and select a writer based on their handwriting samples.', color: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/20' },
    { iconType: 'shield' as const, title: 'Secure Escrow Payment', desc: 'Pay safely. Funds are held securely while your assignment is being handwritten.', color: 'from-violet-500 to-purple-500', shadowColor: 'shadow-violet-500/20' },
    { iconType: 'trophy' as const, title: 'Physical Delivery', desc: 'Receive your perfectly handwritten assignment delivered to your door via trusted courier.', color: 'from-fuchsia-500 to-pink-500', shadowColor: 'shadow-fuchsia-500/20' },
  ];

  return (
    <div className="relative overflow-hidden bg-[var(--bg-primary)] min-h-screen font-sans">
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0a0a14] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <Logo className="w-16 h-16" />
              <span className="text-4xl font-bold text-white tracking-tight font-display">Paperly</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      </div>

      {/* Floating Nav with Logo */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`rounded-2xl px-6 py-3 flex justify-between items-center transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isScrolled 
                ? 'backdrop-blur-xl bg-black/40 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
                : 'bg-transparent border-b border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 group cursor-none">
              <Logo className="w-10 h-10 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-all duration-300" />
              <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-display">Paperly</span>
            </div>
            <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden md:flex gap-6 items-center text-sm font-medium text-[var(--text-secondary)]">
                <a href="#showcase" className="hover:-translate-y-[2px] transition-transform duration-300 relative group cursor-none text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Showcase
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#a855f7] group-hover:w-full transition-all duration-300" />
                </a>
                <span className="text-[var(--text-tertiary)] opacity-60 font-semibold text-xs">•</span>
                <a href="#journey" className="hover:-translate-y-[2px] transition-transform duration-300 relative group cursor-none text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Journey
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#a855f7] group-hover:w-full transition-all duration-300" />
                </a>
                <span className="text-[var(--text-tertiary)] opacity-60 font-semibold text-xs">•</span>
                <a href="#trust" className="hover:-translate-y-[2px] transition-transform duration-300 relative group cursor-none text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Trust
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#a855f7] group-hover:w-full transition-all duration-300" />
                </a>
                <span className="text-[var(--text-tertiary)] opacity-60 font-semibold text-xs">•</span>
                <a href="#pricing" className="hover:-translate-y-[2px] transition-transform duration-300 relative group cursor-none text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#a855f7] group-hover:w-full transition-all duration-300" />
                </a>
              </div>
              <div className="flex gap-2 md:gap-3 items-center">
                {/* Theme Toggle */}
                <motion.button
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun size={18} />
                      </motion.div>
                    ) : (
                      <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <button onClick={() => onNavigate('LOGIN')} className="px-4 md:px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-none">
                  Log In
                </button>
                <GlowButton onClick={() => onNavigate('REGISTER')} size="sm" className="relative overflow-hidden group hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all duration-300 cursor-none">
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
                  Get Started
                </GlowButton>
              </div>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative z-10 pt-32 pb-16 px-4 min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Full-page 3D Background */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-auto">
          <Suspense fallback={null}>
            <BookScene />
          </Suspense>
        </div>

        <motion.div className="max-w-4xl mx-auto w-full relative z-10 pointer-events-none">
          <div className="flex flex-col items-center text-center">

            <motion.div style={{ y: heroY1 }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-8 pointer-events-auto">
                <Sparkles size={14} className="animate-pulse" />
                #1 Academic Platform
              </motion.div>
            </motion.div>

            <div className="mb-8">
              <Hero3DText line1="Ace Every" line2="Assignment" />
            </div>

            <motion.p style={{ y: heroY2 }} className="text-xl md:text-2xl text-[var(--text-primary)] font-medium mb-10 max-w-2xl leading-relaxed drop-shadow-md">
              Connect with verified writers. Get high-quality handwritten assignments delivered to your door. Every time.
            </motion.p>

            <motion.div style={{ y: heroY1 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-12 pointer-events-auto">
              <div className="relative group/btn cursor-none">
                <div className="absolute -inset-1 bg-purple-500 rounded-2xl blur-md opacity-0 group-hover/btn:opacity-30 group-hover/btn:animate-[pulse-ring_3s_infinite] transition-opacity duration-300"></div>
                <GlowButton onClick={() => onNavigate('REGISTER')} size="lg" className="relative cursor-none overflow-hidden hover:scale-[1.03] transition-transform duration-300">
                  <span className="flex items-center gap-2">
                    Start Free
                    <div className="relative w-5 h-5 flex items-center overflow-hidden">
                      <ArrowRight className="absolute left-0 w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-full group-hover/btn:opacity-0" />
                      <ArrowRight className="absolute left-0 w-5 h-5 -translate-x-full transition-transform duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
                    </div>
                  </span>
                </GlowButton>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('LOGIN')}
                className="px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg hover:bg-[var(--surface-hover)] transition-all animated-border cursor-none">
                Watch Demo
              </motion.button>
            </motion.div>

            <div className="flex items-center justify-center gap-8 text-[var(--text-primary)] text-sm font-semibold drop-shadow-md">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-green-400" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-yellow-400" />
                <span>Verified Writers</span>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ═══════ HANDWRITING SHOWCASE ═══════ */}
      <div id="showcase">
        <HandwritingShowcase />
      </div>

      {/* ═══════ PROCESS TIMELINE ═══════ */}
      <div id="journey">
        <ProcessTimeline />
      </div>

      {/* ═══════ TRUST & SECURITY ═══════ */}
      <div id="trust">
        <TrustBento />
      </div>

      {/* ═══════ PRICING ESTIMATOR ═══════ */}
      <div id="pricing">
        <PricingEstimator onNavigate={onNavigate} />
      </div>

      {/* ═══════ CTA SECTION ═══════ */}
      <section className="relative z-10 py-20 px-4">
        <Suspense fallback={null}>
          <GlowOrbs />
        </Suspense>
        <div className="max-w-4xl mx-auto text-center relative">
          <RevealOnScroll duration={0.8}>
            <div className="glass-card-premium p-12 md:p-16 relative overflow-hidden noise-overlay mesh-gradient border border-[var(--glass-border)] animate-[cta-border-glow_3s_infinite]">
              <div className="absolute inset-0 pointer-events-none z-0">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: ['-20px', '20px', '-20px'],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      position: 'absolute',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: '2px',
                      height: '2px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">Ready to get started?</h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">Join thousands of students who are already acing their assignments with Paperly.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <GlowButton onClick={() => onNavigate('REGISTER')} size="lg" icon={<ArrowRight size={20} />} className="cursor-none group hover:scale-[1.04] hover:shadow-[0_8px_30px_rgba(168,85,247,0.4)] transition-all overflow-hidden relative hover:bg-violet-500">
                    <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
                    Get Started Free
                  </GlowButton>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} onClick={() => onNavigate('LOGIN')}
                    className="cursor-none px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg transition-all border border-[var(--border)] hover:border-[#a855f7] hover:text-[#a855f7]">
                    Sign In
                  </motion.button>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="relative z-10 py-12 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Logo className="w-9 h-9" />
                <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight font-display">Paperly</span>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">Study smarter, not harder. The #1 platform connecting students with expert writers for physical handwritten assignments.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider mb-4">Quick Links</h4>
              <div className="space-y-2.5">
                <a href="#showcase" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Showcase</a>
                <a href="#journey" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Journey</a>
                <a href="#trust" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Trust</a>
                <a href="#pricing" className="block text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">Pricing</a>
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

      {/* Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] shadow-lg hover:shadow-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-none"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
