import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const STYLES = [
  { name: 'Cursive Elegant', tag: 'Most Popular', font: 'font-serif', desc: 'Beautiful, flowing script perfect for formal assignments.' },
  { name: 'Neat Print', tag: 'High Readability', font: 'font-sans', desc: 'Clean, separated letters. Ideal for science & math.' },
  { name: 'Architect', tag: 'Professional', font: 'font-mono uppercase', desc: 'Sharp, consistent, all-caps technical writing.' },
  { name: 'Casual Flow', tag: 'Natural', font: 'font-serif italic', desc: 'Looks exactly like a dedicated student\'s natural hand.' },
];

const HandwritingShowcase: React.FC = () => {
  const horizontalSection = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!horizontalSection.current) return;
    const panels = horizontalSection.current.querySelectorAll('.writer-card');
    
    const tween = gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: horizontalSection.current,
        pin: true,
        scrub: 0.8,
        snap: {
          snapTo: 1 / (panels.length - 1),
          duration: { min: 0.3, max: 0.6 },
          ease: 'power2.inOut'
        },
        end: () => `+=${horizontalSection.current?.offsetWidth || 0}`
      }
    });

    panels.forEach((panel) => {
      gsap.fromTo(panel, 
        { scale: 0.85, opacity: 0.4 },
        {
          scale: 1, 
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween,
            start: 'left center',
            end: 'center center',
            scrub: true
          }
        }
      );
      gsap.to(panel, {
        scale: 0.85, 
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          containerAnimation: tween,
          start: 'center center',
          end: 'right center',
          scrub: true
        }
      });
    });

  }, { scope: horizontalSection });

  return (
    <section ref={horizontalSection} className="py-24 relative z-10 overflow-hidden bg-[var(--bg-primary)]">
      <div className="absolute top-16 left-0 w-full text-center pointer-events-none z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-4">
          Showcase
        </div>
        <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] font-display drop-shadow-md">
          A Style for Every Subject
        </h2>
      </div>

      <div className="flex w-[400vw] h-[80vh] items-center pt-20">
        {STYLES.map((style, i) => (
          <div key={i} className="writer-card w-[100vw] px-10 md:px-32 flex justify-center items-center">
            <div className="w-full max-w-2xl h-[400px] glass-card-premium p-10 md:p-16 rounded-3xl relative overflow-hidden flex flex-col justify-center transition-all duration-300">
              <div className="mb-8">
                <span className="text-xs font-bold tracking-widest uppercase text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-full">
                  {style.tag}
                </span>
              </div>
              
              <div className={`text-6xl md:text-8xl mb-6 text-[var(--text-primary)] ${style.font}`}>
                Aa
              </div>
              
              <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-4 font-display">{style.name}</h3>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                {style.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HandwritingShowcase;
