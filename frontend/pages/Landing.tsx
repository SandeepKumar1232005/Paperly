import React, { useRef, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp, Zap, Award, Sparkles, Users, BookOpen } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';
import Hero3DText from '../components/Hero3DText';
import FeatureIcon3D from '../components/FeatureIcon3D';
import ParticleTrail from '../components/ParticleTrail';
import Logo from '../components/Logo';

import HandwritingShowcase from '../components/landing/HandwritingShowcase';
import ProcessTimeline from '../components/landing/ProcessTimeline';
import TrustBento from '../components/landing/TrustBento';
import PricingEstimator from '../components/landing/PricingEstimator';

const BookScene = React.lazy(() => import('../components/BookScene'));
const GlowOrbs = React.lazy(() => import('../components/GlowOrbs'));

interface LandingProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const { scrollY } = useScroll();
  const scrollSectionRef = useRef<HTMLElement>(null);

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
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl px-6 py-3 flex justify-between items-center border-b border-white/5"
          >
            <div className="flex items-center gap-2">
              <Logo className="w-10 h-10" />
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
              <GlowButton onClick={() => onNavigate('REGISTER')} size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Start Free
              </GlowButton>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('LOGIN')}
                className="px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg hover:bg-[var(--surface-hover)] transition-all animated-border">
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
      <HandwritingShowcase />

      {/* ═══════ PROCESS TIMELINE ═══════ */}
      <ProcessTimeline />

      {/* ═══════ TRUST & SECURITY ═══════ */}
      <TrustBento />

      {/* ═══════ PRICING ESTIMATOR ═══════ */}
      <PricingEstimator onNavigate={onNavigate} />

      {/* ═══════ CTA SECTION ═══════ */}
      <section className="relative z-10 py-20 px-4">
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
                <Logo className="w-9 h-9" />
                <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight font-display">Paperly</span>
              </div>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">Study smarter, not harder. The #1 platform connecting students with expert writers for physical handwritten assignments.</p>
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
    </div>
  );
};

export default Landing;
