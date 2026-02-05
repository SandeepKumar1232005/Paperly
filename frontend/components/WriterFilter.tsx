import React from 'react';
import { motion } from 'framer-motion';

interface WriterFilterProps {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}

const WriterFilter: React.FC<WriterFilterProps> = ({ currentFilter, onFilterChange }) => {
    const filters = ['All', 'Neat', 'Cursive', 'Bold', 'Mixed'];

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-sm font-bold text-white/40 uppercase tracking-wider">Filter by Style</span>
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto max-w-full no-scrollbar">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => onFilterChange(filter)}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap z-10 ${currentFilter === filter ? 'text-white' : 'text-white/50 hover:text-white'
                            }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        {currentFilter === filter && (
                            <motion.div
                                layoutId="activeFilter"
                                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg shadow-lg shadow-violet-500/30"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-20">{filter === 'All' ? 'View All' : filter}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WriterFilter;
