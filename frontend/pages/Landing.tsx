import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp, Users, FileText, Zap, Award, ChevronRight } from 'lucide-react';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';

const heroImages = [hero1, hero2, hero3, hero4, hero5];

interface LandingProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

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

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 200]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
      </div>

      {/* Floating Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
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
              </div>
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <motion.section style={{ opacity: opacity1 }} className="relative z-10 pt-32 pb-16 px-4 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

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
                      {letter}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

              <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed">
                Connect with verified expert writers. Get high-quality, plagiarism-free work delivered on time. Every time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('REGISTER')}
                  className="group relative px-8 py-4 bg-white text-violet-950 rounded-2xl font-bold text-lg shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_-10px_rgba(139,92,246,0.7)] hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-2">
                    Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('LOGIN')}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Watch Demo
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-white/40 text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-400" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  <span>Verified Writers</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Hero Visual */}
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


              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>



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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 via-violet-600/0 to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>






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
    </div>
  );
};

export default Landing;




