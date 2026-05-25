import React from 'react';
import { motion } from 'framer-motion';
import { Upload, QrCode, CheckCircle, Truck } from 'lucide-react';

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

const ProcessTimeline: React.FC = () => {
  return (
    <section className="py-24 px-4 relative z-10 bg-[var(--bg-secondary)]/50">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">
            How It Works
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            A seamless bridge from digital request to physical delivery.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />

          <div className="space-y-16">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;
              
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className={`flex-1 w-full md:text-${isEven ? 'left' : 'right'}`}>
                    <div className="glass p-8 rounded-3xl hover:bg-white/[0.03] transition-colors relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />
                      <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 font-display">{step.title}</h3>
                      <p className="text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  <div className="relative flex-shrink-0 mx-4 md:mx-0 z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${step.color} shadow-lg shadow-black/50 p-[2px]`}>
                      <div className="w-full h-full bg-[var(--bg-primary)] rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
