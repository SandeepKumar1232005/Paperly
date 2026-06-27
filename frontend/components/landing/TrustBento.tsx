import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Shield, FileCheck, EyeOff, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TrustBento: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.bento-header', {
      y: 40,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.bento-header',
        start: 'top 80%',
        once: true
      }
    });

    gsap.from('.bento-card', {
      y: 60,
      opacity: 0,
      duration: 1.0,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.bento-grid',
        start: 'top 75%',
        once: true
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 bento-header">
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">
            Built on Trust
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            We take your academic integrity and privacy seriously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px] bento-grid">
          {/* Large Main Box */}
          <div className="bento-card md:col-span-2 md:row-span-2 h-full">
            <div className="h-full glass-card-premium rounded-[2rem] p-8 md:p-12 relative overflow-hidden group hover:-translate-y-[6px] hover:border-purple-500/40 hover:shadow-[0_20px_40px_rgba(124,58,237,0.15)] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]">
              {/* Premium Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
              
              {/* Scan Line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-purple-500/30 -translate-y-full group-hover:animate-[scan-line_0.6s_ease-in-out] pointer-events-none" />

              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:opacity-100 opacity-50 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-md group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ease-out">
                  <FileCheck className="w-8 h-8 text-fuchsia-400" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">100% Plagiarism Free</h3>
                <p className="text-[var(--text-secondary)] text-lg max-w-md">
                  Because every assignment is physically written by hand by a human expert, it naturally passes all AI-detectors and plagiarism scanners with a perfect 0% score.
                </p>
              </div>
            </div>
          </div>

          {/* Small Box 1 */}
          <div className="bento-card h-full">
            <div className="h-full glass-card-premium rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-[6px] hover:border-purple-500/40 hover:shadow-[0_20px_40px_rgba(124,58,237,0.15)] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-purple-500/30 -translate-y-full group-hover:animate-[scan-line_0.6s_ease-in-out] pointer-events-none" />

              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ease-out">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">Verified Experts</h3>
              <p className="text-sm text-[var(--text-secondary)] relative z-10">
                Every writer undergoes a strict handwriting and background verification process.
              </p>
            </div>
          </div>

          {/* Small Box 2 */}
          <div className="bento-card h-full">
            <div className="h-full glass-card-premium rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:-translate-y-[6px] hover:border-purple-500/40 hover:shadow-[0_20px_40px_rgba(124,58,237,0.15)] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-purple-500/30 -translate-y-full group-hover:animate-[scan-line_0.6s_ease-in-out] pointer-events-none" />

              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ease-out">
                <EyeOff className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">Total Confidentiality</h3>
              <p className="text-sm text-[var(--text-secondary)] relative z-10">
                Your identity is never shared with writers. Your data is encrypted and securely deleted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBento;
