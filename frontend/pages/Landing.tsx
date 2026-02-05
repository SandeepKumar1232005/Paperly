import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#0a0a1a] min-h-screen font-sans">

      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Floating Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-violet-500/30">P</div>
              <span className="text-xl font-bold text-white tracking-tight">Paperly</span>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-medium text-white/60">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#writers" className="hover:text-white transition-colors">Writers</a>
              <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
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

              <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-8 tracking-tight">
                Ace Every
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
                  Assignment
                </span>
              </h1>

              <p className="text-lg text-white/60 mb-10 max-w-lg leading-relaxed">
                Connect with verified expert writers. Get high-quality, plagiarism-free work delivered on time. Every time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <button
                  onClick={() => onNavigate('REGISTER')}
                  className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={() => onNavigate('LOGIN')}
                  className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Watch Demo
                </button>
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
                    {heroImages.map((img, index) => (
                      <img
                        key={img}
                        src={img}
                        alt="Hero"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                      />
                    ))}

                    {/* Overlay Stats Card */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Project Status</p>
                          <p className="text-sm font-bold text-slate-900">Completed ✓</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Floating Rating Badge */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute -top-4 -left-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">4.9</p>
                    <p className="text-xs text-slate-500">10K+ Reviews</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Bar */}
      <section className="relative z-10 py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 15000, suffix: '+', label: 'Happy Students', icon: Users },
              { value: 500, suffix: '+', label: 'Expert Writers', icon: Award },
              { value: 98, suffix: '%', label: 'Success Rate', icon: TrendingUp },
              { value: 50000, suffix: '+', label: 'Projects Done', icon: FileText },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <p className="text-3xl lg:text-4xl font-black text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-white/50 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4">
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
              { icon: TrendingUp, title: 'Get A+ Results', desc: 'Receive plagiarism-free work, request revisions, and excel in your courses.', color: 'from-fuchsia-500 to-pink-500' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Writers Marquee */}
      <section id="writers" className="relative z-10 py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-2">Top Writers</h2>
              <p className="text-white/50">Verified PhDs and Masters from top institutions</p>
            </div>
            <button onClick={() => onNavigate('REGISTER')} className="text-violet-400 font-bold hover:text-white transition-colors flex items-center gap-2">
              View All <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-6 animate-[marquee_40s_linear_infinite] w-max">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-[280px] bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`} className="w-14 h-14 rounded-full bg-slate-700" alt="Writer" />
                <div>
                  <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">Dr. Writer {i + 1}</h4>
                  <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Literature Expert</p>
                  <div className="flex text-yellow-400 text-xs gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill="currentColor" />)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Student Reviews</h2>
            <p className="text-white/50 text-lg">Trusted by thousands of students worldwide</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "The quality exceeded my expectations. My professor was impressed with the research depth.", author: "Jessica M.", role: "Psychology Major", rating: 5 },
              { text: "Saved my semester! Quick turnaround and flawless work. Will definitely use again.", author: "Marcus T.", role: "Law Student", rating: 5 },
              { text: "The writer understood exactly what I needed. Communication was excellent throughout.", author: "Priya K.", role: "MBA Candidate", rating: 5 },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl"
              >
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                </div>
                <p className="text-white/70 mb-6 leading-relaxed italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                    {review.author[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white">{review.author}</p>
                    <p className="text-white/40 text-sm">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-[3rem] p-12 lg:p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-black/20 rounded-full blur-3xl" />

            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 relative z-10">
              Ready to Excel?
            </h2>
            <p className="text-white/80 text-xl mb-10 max-w-2xl mx-auto relative z-10">
              Join 15,000+ students who trust Paperly for their academic success.
            </p>
            <button
              onClick={() => onNavigate('REGISTER')}
              className="px-10 py-5 bg-white text-violet-600 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-2xl hover:-translate-y-1 relative z-10"
            >
              Create Free Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center">
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} Paperly. All rights reserved.</p>
        <div className="flex justify-center gap-8 mt-4 text-white/30 text-sm">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>

      {/* Marquee Animation CSS */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
