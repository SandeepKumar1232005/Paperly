import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Shield, Clock, TrendingUp, Zap, Award, Sparkles } from 'lucide-react';
import hero1 from '../assets/hero1.png';
import hero2 from '../assets/hero2.png';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';

const heroImages = [hero1, hero2, hero3, hero4, hero5];

interface LandingProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}



const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: Clock, title: 'Post Your Request', desc: 'Upload requirements, set deadline, receive instant quotes from verified writers.', color: 'from-blue-500 to-cyan-500', shadowColor: 'shadow-blue-500/20' },
    { icon: Shield, title: 'Secure Payment', desc: 'Pay safely with escrow protection. Funds released only when you approve.', color: 'from-violet-500 to-purple-500', shadowColor: 'shadow-violet-500/20' },
    { icon: TrendingUp, title: 'Get A+ Results', desc: 'Receive plagiarism-free work, request revisions, and excel in your courses.', color: 'from-fuchsia-500 to-pink-500', shadowColor: 'shadow-fuchsia-500/20' },
  ];


  return (
    <div className="relative overflow-hidden bg-[var(--bg-primary)] min-h-screen font-sans">

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[var(--bg-primary)]" />
        <div className="dark:block hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          <motion.div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] mix-blend-screen opacity-40" />
          <motion.div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[140px] mix-blend-screen opacity-40" />
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[130px] mix-blend-screen opacity-30" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-fuchsia-50/30" />
        </div>
      </div>

      {/* Floating Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-2xl px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/30">P</div>
              <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-display">Paperly</span>
            </div>
            <div className="flex items-center gap-4 md:gap-8">
              <div className="hidden md:flex gap-6 text-sm font-medium text-[var(--text-secondary)]">
                <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
              </div>
              <div className="flex gap-2 md:gap-3">
                <button onClick={() => onNavigate('LOGIN')} className="px-4 md:px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Log In
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('REGISTER')}
                  className="px-4 md:px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                >
                  Get Started
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section style={{ opacity: opacity1 }} className="relative z-10 pt-32 pb-16 px-4 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                      {letter}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

              <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-lg leading-relaxed">
                Connect with verified expert writers. Get high-quality, plagiarism-free work delivered on time. Every time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('REGISTER')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('LOGIN')}
                  className="px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg hover:bg-[var(--surface-hover)] transition-all">
                  Watch Demo
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-[var(--text-tertiary)] text-sm">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-500" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-500" />
                  <span>Verified Writers</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Hero Visual */}
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
                </div>

                {/* Floating stat cards */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 glass-card px-5 py-3 shadow-xl hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] font-medium">Completed</p>
                      <p className="font-bold text-lg text-[var(--text-primary)]">2,847</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-4 -right-4 glass-card px-5 py-3 shadow-xl hidden lg:block">
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <span className="font-bold text-sm text-[var(--text-primary)]">4.9</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="glass-card p-12 md:p-16 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">Ready to get started?</h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">Join thousands of students who are already acing their assignments with Paperly.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('REGISTER')}
                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center justify-center gap-2">
                    Get Started Free <ArrowRight size={20} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('LOGIN')}
                    className="px-8 py-4 glass text-[var(--text-primary)] rounded-2xl font-bold text-lg transition-all">
                    Sign In
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-[var(--border)] text-center">
        <p className="text-[var(--text-tertiary)] text-sm">© {new Date().getFullYear()} Paperly. All rights reserved.</p>
        <div className="flex justify-center gap-8 mt-4 text-[var(--text-tertiary)] text-sm">
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
