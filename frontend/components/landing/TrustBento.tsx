import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileCheck, EyeOff, Award } from 'lucide-react';

const TrustBento: React.FC = () => {
  return (
    <section className="py-24 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-4 font-display">
            Built on Trust
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            We take your academic integrity and privacy seriously.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          {/* Large Main Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-2 glass-card-premium rounded-[2rem] p-8 md:p-12 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:opacity-100 opacity-50 transition-opacity duration-700" />
            
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-md">
                <FileCheck className="w-8 h-8 text-fuchsia-400" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">100% Plagiarism Free</h3>
              <p className="text-[var(--text-secondary)] text-lg max-w-md">
                Because every assignment is physically written by hand by a human expert, it naturally passes all AI-detectors and plagiarism scanners with a perfect 0% score.
              </p>
            </div>
          </motion.div>

          {/* Small Box 1 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card-premium rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Award className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Verified Experts</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Every writer undergoes a strict handwriting and background verification process.
            </p>
          </motion.div>

          {/* Small Box 2 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card-premium rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <EyeOff className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Total Confidentiality</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Your identity is never shared with writers. Your data is encrypted and securely deleted.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustBento;
