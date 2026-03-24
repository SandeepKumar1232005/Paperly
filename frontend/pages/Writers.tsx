import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Star, MapPin, CheckCircle, Briefcase, ArrowLeft, Clock, Award, X, Search, Filter } from 'lucide-react';
import WriterFilter from '../components/WriterFilter';
import StyleBadge from '../components/StyleBadge';
import { motion, AnimatePresence } from 'framer-motion';

interface WritersProps {
    onNavigate: (view: any) => void;
    onHire: (writerId: string) => void;
    currentUser: User;
}

export function Writers({ onNavigate, onHire, currentUser }: WritersProps) {
    const [writers, setWriters] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWriter, setSelectedWriter] = useState<User | null>(null);
    const [handwritingFilter, setHandwritingFilter] = useState('All');

    const filteredWriters = writers.filter(writer => {
        if (handwritingFilter !== 'All' && writer.handwriting_style !== handwritingFilter) return false;

        const studentAddr = (currentUser?.address || '').toLowerCase().trim();
        const writerAddr = (writer.address || '').toLowerCase().trim();

        if (studentAddr) {
            if (!writerAddr || (!writerAddr.includes(studentAddr) && !studentAddr.includes(writerAddr))) {
                return false;
            }
        }

        return true;
    });

    useEffect(() => {
        loadWriters();
    }, []);

    const loadWriters = async () => {
        try {
            const storedCoords = sessionStorage.getItem('user_coords');
            let coords;
            if (storedCoords) {
                coords = JSON.parse(storedCoords);
            }
            const data = await api.getWriters(coords);
            setWriters(data);
        } catch (error) {
            console.error('Failed to load writers', error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", bounce: 0.3 }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="dark:block hidden">
                    <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
                </div>
                <div className="dark:hidden block">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-fuchsia-50/20 to-blue-50/50" />
                </div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => onNavigate('DASHBOARD')}
                        className="group flex items-center text-[var(--text-secondary)] hover:text-[var(--accent)] mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight font-display">Find a Writer</h1>
                        <p className="mt-3 text-lg text-[var(--text-secondary)] max-w-2xl">Connect with top-rated academic experts. Filter by handwriting style to find your perfect match.</p>
                    </motion.div>
                </div>

                {/* Filter */}
                <div className="mb-8">
                    <WriterFilter currentFilter={handwritingFilter} onFilterChange={setHandwritingFilter} />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--accent)]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="h-2 w-2 bg-[var(--accent)] rounded-full"></span>
                            </div>
                        </div>
                    </div>
                ) : filteredWriters.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-12 text-center max-w-2xl mx-auto mt-8"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                            <Search className="w-10 h-10 text-[var(--accent)]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display">No Writers Found</h3>
                        <p className="text-[var(--text-secondary)] mb-6">There are no writers near you matching your criteria.</p>
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setHandwritingFilter('All')}
                            className="px-6 py-3 glass hover:bg-[var(--surface-hover)] text-[var(--text-primary)] rounded-xl font-bold transition-all border border-[var(--border)]"
                        >
                            Clear Filters
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredWriters.map((writer) => (
                            <motion.div
                                key={writer.id}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                className="glass-card overflow-hidden group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={writer.avatar}
                                                    alt={writer.name}
                                                    className="h-16 w-16 rounded-2xl bg-[var(--surface)] object-cover border-2 border-[var(--border)]"
                                                />
                                                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[var(--bg-secondary)] ${writer.availability_status === 'ONLINE' ? 'bg-emerald-500' :
                                                    writer.availability_status === 'BUSY' ? 'bg-amber-500' :
                                                        'bg-gray-400 dark:bg-white/30'
                                                    }`}></span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{writer.name}</h3>
                                                    {writer.is_verified && <CheckCircle className="w-4 h-4 text-[var(--accent)] fill-[var(--accent-muted)]" />}
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center text-[var(--text-secondary)]">
                                                <MapPin className="h-4 w-4 mr-2 text-[var(--text-tertiary)]" />
                                                <span className="truncate max-w-[140px]">{writer.address || 'Global'}</span>
                                            </div>
                                            {/* @ts-ignore */}
                                            {writer.distance_km !== undefined && (
                                                <span className="bg-[var(--accent-muted)] text-[var(--accent)] px-2 py-0.5 rounded text-xs font-semibold">
                                                    {writer.distance_km}km
                                                </span>
                                            )}
                                        </div>



                                        <div className="pt-2">
                                            {writer.handwriting_style && (
                                                <StyleBadge style={writer.handwriting_style} confidence={writer.handwriting_confidence} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-[var(--border)] flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => onHire(writer.id)}
                                            className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all ripple"
                                        >
                                            Hire Now
                                        </motion.button>
                                        <button
                                            onClick={() => setSelectedWriter(writer)}
                                            className="px-4 py-3 glass text-[var(--text-secondary)] rounded-xl text-sm font-bold hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                                        >
                                            Profile
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>

            {/* Writer Profile Modal */}
            <AnimatePresence>
                {selectedWriter && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
                            onClick={() => setSelectedWriter(null)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="glass-card w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                            style={{ background: 'var(--bg-secondary)' }}
                        >
                            <div className="overflow-y-auto flex-1 w-full">
                                {/* Header */}
                                <div className="relative h-32 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 flex-shrink-0">
                                    <button
                                        onClick={() => setSelectedWriter(null)}
                                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors backdrop-blur-md"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="px-8 pb-8">
                                    <div className="relative -mt-12 mb-6 flex justify-between items-end">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl border-4 border-[var(--bg-secondary)] shadow-xl bg-[var(--surface)] overflow-hidden p-0.5">
                                            <img src={selectedWriter.avatar} alt={selectedWriter.name} className="w-full h-full rounded-xl object-cover" />
                                        </div>
                                        <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-[var(--bg-secondary)] ${selectedWriter.availability_status === 'ONLINE' ? 'bg-emerald-500' :
                                            selectedWriter.availability_status === 'BUSY' ? 'bg-amber-500' : 'bg-gray-400 dark:bg-white/30'
                                            }`}></span>
                                    </div>
                                    <div className="mb-1 bg-[var(--accent-muted)] px-3 py-1 rounded-full border border-[var(--accent)]/20">
                                        <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide">
                                            {selectedWriter.availability_status || 'ONLINE'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
                                        {selectedWriter.name}
                                        {selectedWriter.is_verified && <CheckCircle className="w-5 h-5 text-[var(--accent)]" />}
                                    </h2>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 mt-6 py-4 border-y border-[var(--border)]">
                                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                        <MapPin className="w-5 h-5 text-[var(--text-tertiary)]" />
                                        <span className="font-semibold text-sm truncate max-w-[120px]">{selectedWriter.address || 'Unknown'}</span>
                                    </div>
                                </div>



                                {((selectedWriter.handwriting_samples && selectedWriter.handwriting_samples.length > 0) || selectedWriter.handwriting_sample_url) && (
                                    <div className="mt-6">
                                        <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Handwriting Samples</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedWriter.handwriting_samples?.map((sample, index) => (
                                                <div key={index} className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] h-32 relative group cursor-pointer w-full" onClick={() => window.open(sample, '_blank')}>
                                                    <img src={sample} alt={`Sample ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">Zoom</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!selectedWriter.handwriting_samples || selectedWriter.handwriting_samples.length === 0) && selectedWriter.handwriting_sample_url && (
                                                <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] h-32 relative group cursor-pointer w-full" onClick={() => window.open(selectedWriter.handwriting_sample_url, '_blank')}>
                                                    <img src={selectedWriter.handwriting_sample_url} alt="Sample" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">Zoom</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-elevated)] flex gap-3 flex-shrink-0 sticky bottom-0">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        onHire(selectedWriter.id);
                                        setSelectedWriter(null);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all ripple"
                                >
                                    Hire Now
                                </motion.button>
                                <button
                                    onClick={() => setSelectedWriter(null)}
                                    className="px-6 py-3.5 glass text-[var(--text-secondary)] font-bold rounded-xl hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >
        </div >
    );
}
