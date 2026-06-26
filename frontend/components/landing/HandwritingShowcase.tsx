import React from 'react';
import { motion } from 'framer-motion';
import RevealOnScroll from '../RevealOnScroll';

const STYLES = [
  { name: 'Cursive Elegant', tag: 'Most Popular', font: 'font-serif', desc: 'Beautiful, flowing script perfect for formal assignments.' },
  { name: 'Neat Print', tag: 'High Readability', font: 'font-sans', desc: 'Clean, separated letters. Ideal for science & math.' },
  { name: 'Architect', tag: 'Professional', font: 'font-mono uppercase', desc: 'Sharp, consistent, all-caps technical writing.' },
  { name: 'Casual Flow', tag: 'Natural', font: 'font-serif italic', desc: 'Looks exactly like a dedicated student\'s natural hand.' },
];

const HandwritingShowcase: React.FC = () => {
  return (
    <section className="py-24 px-4 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-4">
            Showcase
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">
            A Style for Every Subject
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Choose from hundreds of verified writers, each offering a unique, beautiful handwriting style to match your exact needs.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STYLES.map((style, i) => (
            <RevealOnScroll key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -10 }}
                className="h-full glass-card-premium p-6 rounded-3xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="mb-8">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
                    {style.tag}
                  </span>
                </div>
                
                <div className={`text-3xl mb-4 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors ${style.font}`}>
                  Aa
                </div>
                
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">{style.name}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {style.desc}
                </p>
              </motion.div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HandwritingShowcase;
