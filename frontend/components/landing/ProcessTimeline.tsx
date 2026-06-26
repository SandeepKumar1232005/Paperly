import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Upload, QrCode, CheckCircle, Truck } from 'lucide-react';
import RevealOnScroll from '../RevealOnScroll';

const STEPS = [
  {
    icon: Upload,
    title: 'Post Your Request',
    desc: 'Upload your digital document, specify the deadline, and choose your preferred handwriting style.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: QrCode,
    title: 'Direct UPI Payment',
    desc: 'Pay your writer directly by scanning their secure UPI QR code. No middleman, no hidden platform fees.',
    color: 'from-violet-500 to-purple-500'
  },
  {
    icon: CheckCircle,
    title: 'Expert Handwriting & QA',
    desc: 'A verified writer physically handwrites your assignment. Our QA team verifies quality and plagiarism.',
    color: 'from-fuchsia-500 to-pink-500'
  },
  {
    icon: Truck,
    title: 'Express Delivery to Door',
    desc: 'The finished physical document is carefully packaged and express-shipped directly to your doorstep.',
    color: 'from-orange-500 to-amber-500'
  }
];

const Counter = ({ from, to }: { from: number, to: number }) => {
  const [count, setCount] = useState(from);
  useEffect(() => {
    let current = from;
    const timer = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= to) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [from, to]);
  return <span>{count}</span>;
};

const ProcessTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-24 px-4 relative z-10 bg-[var(--bg-secondary)]/50">
      <div className="max-w-4xl mx-auto relative">
        <RevealOnScroll className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">
            How It Works
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            A seamless bridge from digital request to physical delivery.
          </p>
        </RevealOnScroll>

        <div className="relative">
          {/* Animated SVG Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 overflow-hidden pointer-events-none">
            <svg width="4" height="100%" className="absolute inset-0">
              <motion.line
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
                stroke="rgba(168, 85, 247, 0.5)"
                strokeWidth="4"
                strokeDasharray="10 10"
                initial={{ strokeDashoffset: 1000 }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 1.5, ease: "linear" }}
              />
            </svg>
          </div>

          <div className="space-y-16 relative z-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;
              const isActive = activeStep === i;
              
              return (
                <RevealOnScroll key={i} delay={i * 0.15}>
                  <div 
                    onMouseEnter={() => setActiveStep(i)}
                    className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''} transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-70'}`}
                  >
                    <div className={`flex-1 w-full md:text-${isEven ? 'left' : 'right'}`}>
                      <div className={`glass p-8 rounded-3xl transition-all duration-300 relative group cursor-pointer ${isActive ? 'scale-[1.02] border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'hover:bg-white/[0.03]'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 ${isActive ? 'opacity-10' : 'group-hover:opacity-5'} rounded-3xl transition-opacity duration-500`} />
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 font-display">
                          Step <Counter from={0} to={i + 1} />: {step.title}
                        </h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                      </div>
                    </div>

                    <div className="relative flex-shrink-0 mx-4 md:mx-0 z-10 group">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${step.color} shadow-lg shadow-black/50 p-[2px] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                        <div className="w-full h-full bg-[var(--bg-primary)] rounded-full flex items-center justify-center group-hover:animate-[bounce-small_0.4s_ease-in-out]">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
