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
}

export function Writers({ onNavigate, onHire }: WritersProps) {
    const [writers, setWriters] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWriter, setSelectedWriter] = useState<User | null>(null);
    const [handwritingFilter, setHandwritingFilter] = useState('All');

    const filteredWriters = writers.filter(writer => {
        if (handwritingFilter === 'All') return true;
        return writer.handwriting_style === handwritingFilter;
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
            transition: {
                staggerChildren: 0.1
            }
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
        <div className="min-h-screen bg-[#0a0a1a]">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {/* Header */}
                <div className="mb-10">
                    <button
                        onClick={() => onNavigate('DASHBOARD')}
                        className="group flex items-center text-white/50 hover:text-violet-400 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-white tracking-tight">Find a Writer</h1>
                        <p className="mt-3 text-lg text-white/50 max-w-2xl">Connect with top-rated academic experts. Filter by handwriting style to find your perfect match.</p>
                    </motion.div>
                </div>

                {/* Filter */}
                <div className="mb-8">
                    <WriterFilter currentFilter={handwritingFilter} onFilterChange={setHandwritingFilter} />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="h-2 w-2 bg-violet-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>
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
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <img
                                                    src={writer.avatar}
                                                    alt={writer.name}
                                                    className="h-16 w-16 rounded-2xl bg-white/5 object-cover border-2 border-white/10"
                                                />
                                                <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0a0a1a] ${writer.availability_status === 'ONLINE' ? 'bg-emerald-500' :
                                                    writer.availability_status === 'BUSY' ? 'bg-amber-500' :
                                                        'bg-white/30'
                                                    }`}></span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h3 className="text-lg font-bold text-white">{writer.name}</h3>
                                                    {writer.is_verified && <CheckCircle className="w-4 h-4 text-violet-400 fill-violet-400/20" />}
                                                </div>
                                                <div className="flex items-center text-sm font-medium text-amber-400 mt-0.5">
                                                    <Star className="h-3.5 w-3.5 fill-current" />
                                                    <span className="ml-1">4.9</span>
                                                    <span className="text-white/30 ml-1 font-normal">(120+ reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center text-white/50">
                                                <MapPin className="h-4 w-4 mr-2 text-white/30" />
                                                <span className="truncate max-w-[140px]">{writer.address || 'Global'}</span>
                                            </div>
                                            {/* @ts-ignore */}
                                            {writer.distance_km !== undefined && (
                                                <span className="bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded text-xs font-semibold">
                                                    {writer.distance_km}km
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center text-sm text-white/50">
                                            <Award className="h-4 w-4 mr-2 text-white/30" />
                                            <span>98% Make It Right Guarantee</span>
                                        </div>

                                        <div className="pt-2">
                                            {writer.handwriting_style && (
                                                <StyleBadge style={writer.handwriting_style} confidence={writer.handwriting_confidence} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/10 flex gap-3">
                                        <button
                                            onClick={() => onHire(writer.id)}
                                            className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                                        >
                                            Hire Now
                                        </button>
                                        <button
                                            onClick={() => setSelectedWriter(writer)}
                                            className="px-4 py-3 bg-white/5 border border-white/10 text-white/70 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
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
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedWriter(null)}
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-[#12122a] border border-white/10 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                        >
                            {/* Header */}
                            <div className="relative h-32 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 flex-shrink-0">
                                <button
                                    onClick={() => setSelectedWriter(null)}
                                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors backdrop-blur-md"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-8 pb-8 overflow-y-auto flex-1">
                                <div className="relative -mt-12 mb-6 flex justify-between items-end">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-2xl border-4 border-[#12122a] shadow-xl bg-white/10 overflow-hidden p-0.5">
                                            <img src={selectedWriter.avatar} alt={selectedWriter.name} className="w-full h-full rounded-xl object-cover" />
                                        </div>
                                        <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-[#12122a] ${selectedWriter.availability_status === 'ONLINE' ? 'bg-emerald-500' :
                                            selectedWriter.availability_status === 'BUSY' ? 'bg-amber-500' : 'bg-white/30'
                                            }`}></span>
                                    </div>
                                    <div className="mb-1 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                                        <span className="text-xs font-bold text-violet-400 uppercase tracking-wide">
                                            {selectedWriter.availability_status || 'ONLINE'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        {selectedWriter.name}
                                        {selectedWriter.is_verified && <CheckCircle className="w-5 h-5 text-violet-400" />}
                                    </h2>
                                    <p className="text-white/50 font-medium text-sm mt-1 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> Academic Writing Specialist
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 mt-6 py-4 border-y border-white/10">
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-5 h-5 text-amber-400 fill-current" />
                                        <span className="font-bold text-white text-lg">4.9</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/10"></div>
                                    <div className="flex items-center gap-1.5 text-white/50">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        <span className="font-semibold text-sm">98% Success</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/10"></div>
                                    <div className="flex items-center gap-1.5 text-white/50">
                                        <MapPin className="w-5 h-5 text-white/30" />
                                        <span className="font-semibold text-sm truncate max-w-[120px]">{selectedWriter.address || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Expertise</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {['History', 'Literature', 'Psychology', 'Sociology', 'Research'].map(tag => (
                                            <span key={tag} className="px-3 py-1.5 bg-white/5 text-white/60 text-xs font-semibold rounded-lg border border-white/10 hover:border-violet-500/30 hover:text-violet-400 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">About</h4>
                                    <p className="text-sm text-white/60 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                                        Professional academic writer with over 5 years of experience in Thesis, Essay, and Research writing. Committed to delivering high-quality work on time. Specializes in clear, concise structured writing.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3 flex-shrink-0 sticky bottom-0">
                                <button
                                    onClick={() => {
                                        onHire(selectedWriter.id);
                                        setSelectedWriter(null);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                                >
                                    Hire Now
                                </button>
                                <button
                                    onClick={() => setSelectedWriter(null)}
                                    className="px-6 py-3.5 bg-white/5 border border-white/10 text-white/70 font-bold rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
