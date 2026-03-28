import React from 'react';
import { LucideIcon } from 'lucide-react';
<<<<<<< HEAD
=======
import { motion } from 'framer-motion';
>>>>>>> master

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
    return (
<<<<<<< HEAD
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-rose-500/20 to-amber-500/20 p-5 rounded-2xl mb-5 backdrop-blur-sm border border-white/10">
                <Icon className="w-10 h-10 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/50 max-w-sm mb-8">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105"
                >
                    {action.label}
                </button>
            )}
        </div>
=======
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center glass-card border-dashed"
        >
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-5 rounded-2xl mb-5 border border-[var(--border)]"
            >
                <Icon className="w-10 h-10 text-[var(--accent)]" />
            </motion.div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8">{description}</p>
            {action && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 ripple"
                >
                    {action.label}
                </motion.button>
            )}
        </motion.div>
>>>>>>> master
    );
};

export default EmptyState;
<<<<<<< HEAD



=======
>>>>>>> master
