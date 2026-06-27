import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Upload, QrCode, CheckCircle, Truck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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

const Counter = ({ to }: { to: number }) => {
  const numRef = useRef<HTMLSpanElement>(null);
  
  useGSAP(() => {
    if (!numRef.current) return;
    gsap.from(numRef.current, {
      textContent: 0,
      duration: 2,
      ease: 'power2.out',
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: numRef.current,
        start: 'top 80%',
        once: true
      },
      onUpdate: function() {
        if(numRef.current) {
            numRef.current.innerHTML = Math.ceil(Number(this.targets()[0].textContent)).toString();
        }
      }
    });
  }, { scope: numRef });

  return <span ref={numRef}>{to}</span>;
};

const ProcessTimeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useGSAP(() => {
    // Reveal line
    gsap.fromTo('.timeline-line', 
      { strokeDashoffset: 1000 },
      { 
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.steps-section',
          start: 'top 50%',
          end: 'bottom 50%',
          scrub: true
        }
      }
    );

    // Animate each step card individually as it scrolls into view
    const cards = gsap.utils.toArray('.step-card');
    cards.forEach((card: any) => {
      gsap.from(card, {
        x: -60,
        opacity: 0,
        duration: 1.0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        }
      });
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 px-4 relative z-10 bg-[var(--bg-secondary)]/50 steps-section overflow-hidden">
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">
            How It Works
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            A seamless bridge from digital request to physical delivery.
          </p>
        </div>

        <div className="relative">
          {/* Animated SVG Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 overflow-hidden pointer-events-none z-0">
            <svg width="4" height="100%" className="absolute inset-0">
              <line
                className="timeline-line"
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
                stroke="rgba(168, 85, 247, 0.5)"
                strokeWidth="4"
                strokeDasharray="10 10"
              />
            </svg>
          </div>

          <div className="space-y-16 relative z-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;
              const isActive = activeStep === i;
              
              return (
                <div 
                  key={i}
                  onMouseEnter={() => setActiveStep(i)}
                  className={`step-card flex flex-col md:flex-row items-start md:items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''} transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-70'}`}
                >
                  <div className={`flex-1 w-full md:text-${isEven ? 'left' : 'right'}`}>
                    <div className={`glass p-8 rounded-3xl transition-all duration-300 relative group cursor-pointer ${isActive ? 'scale-[1.02] border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'hover:bg-white/[0.03]'}`}>
                      <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 ${isActive ? 'opacity-10' : 'group-hover:opacity-5'} rounded-3xl transition-opacity duration-500`} />
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 font-display">
                        Step <Counter to={i + 1} />: {step.title}
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
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
