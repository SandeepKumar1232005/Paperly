import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight } from 'lucide-react';

const PricingEstimator: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [pages, setPages] = useState(5);
  const [urgency, setUrgency] = useState<'Standard' | 'Express' | 'Urgent'>('Standard');

  // Base price per page (approximate for estimation)
  const basePrice = 30; // ₹30/page

  const multipliers = {
    'Standard': 1,
    'Express': 1.5,
    'Urgent': 2.5
  };

  const estimatedTotal = pages * basePrice * multipliers[urgency];

  return (
    <section className="py-24 px-4 relative z-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[var(--bg-primary)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="glass-card-premium rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Calculator className="w-8 h-8 text-fuchsia-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 font-display">
              Transparent Pricing
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Estimate your cost before you post. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Controls */}
            <div className="space-y-8">
              {/* Pages Slider */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Number of Pages
                  </label>
                  <span className="text-2xl font-bold text-white font-display">{pages}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>

              {/* Urgency */}
              <div>
                <label className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 block">
                  Delivery Speed
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Standard', 'Express', 'Urgent'] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setUrgency(speed)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all ${
                        urgency === speed 
                          ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25' 
                          : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-[var(--text-tertiary)] flex justify-between">
                  <span>5-7 Days</span>
                  <span>2-4 Days</span>
                  <span>24 Hours</span>
                </div>
              </div>
            </div>

            {/* Total Display */}
            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 blur-[50px] rounded-full" />
              
              <div className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-widest mb-2 relative z-10">
                Estimated Total
              </div>
              <div className="text-5xl md:text-6xl font-black text-white mb-8 font-display relative z-10">
                <span className="text-fuchsia-400">₹</span>{estimatedTotal.toLocaleString()}
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('REGISTER')}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all relative z-10"
              >
                Post Request Now <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <p className="text-[10px] text-[var(--text-tertiary)] mt-4 relative z-10">
                *Final price depends on writer's individual rates. This is an estimate based on platform averages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingEstimator;
