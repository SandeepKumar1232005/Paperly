import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { api } from '../services/api';
import {
  X, Star, MapPin, CheckCircle, Briefcase, Clock,
  ChevronLeft, ChevronRight, ZoomIn, ImageOff, Loader2
} from 'lucide-react';
import StyleBadge from './StyleBadge';

interface WriterProfileModalProps {
  writer: User | null;
  onClose: () => void;
  onHire: (writerId: string) => void;
}

const WriterProfileModal: React.FC<WriterProfileModalProps> = ({ writer, onClose, onHire }) => {
  const [samples, setSamples] = useState<string[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch samples when modal opens
  useEffect(() => {
    if (writer) {
      setLoadingSamples(true);
      api.getWriterSamples(writer.id)
        .then((data) => {
          setSamples(data);
        })
        .catch(() => {
          // Fallback to writer object samples
          setSamples(writer.handwriting_samples || []);
        })
        .finally(() => setLoadingSamples(false));
    } else {
      setSamples([]);
      setLightboxIndex(null);
    }
  }, [writer]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else {
          onClose();
        }
      }
    };
    if (writer) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [writer, lightboxIndex, onClose]);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : samples.length - 1);
    } else {
      setLightboxIndex(lightboxIndex < samples.length - 1 ? lightboxIndex + 1 : 0);
    }
  }, [lightboxIndex, samples.length]);

  // Lightbox keyboard nav
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, navigateLightbox]);

  if (!writer) return null;

  return (
    <AnimatePresence>
      {writer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" id="writer-profile-modal">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-3xl shadow-2xl flex flex-col"
            style={{ background: 'var(--bg-secondary)' }}
          >
            {/* Gradient Header */}
            <div className="relative h-36 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-700 flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgOHYtMmgydjJoLTJ6bTAgMGgtMnYtMmgydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-fuchsia-400/20 rounded-full blur-2xl" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white p-2.5 rounded-xl transition-colors backdrop-blur-md z-20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 w-full">
              <div className="px-8 pb-8">
                {/* Avatar + Status */}
                <div className="relative -mt-14 mb-5 flex justify-between items-end">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl border-4 shadow-xl overflow-hidden p-0.5" style={{ borderColor: 'var(--bg-secondary)' }}>
                      <img
                        src={writer.avatar}
                        alt={writer.name}
                        className="w-full h-full rounded-xl object-cover bg-[var(--surface)]"
                      />
                    </div>
                    <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 ${
                      writer.availability_status === 'ONLINE' ? 'bg-emerald-500' :
                      writer.availability_status === 'BUSY' ? 'bg-amber-500' : 
                      'bg-gray-400 dark:bg-white/30'
                    }`} style={{ borderColor: 'var(--bg-secondary)' }} />
                  </div>
                  <div className="mb-1 bg-[var(--accent-muted)] px-3 py-1.5 rounded-full border border-[var(--accent)]/20">
                    <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide">
                      {writer.availability_status || 'ONLINE'}
                    </span>
                  </div>
                </div>

                {/* Name + Title */}
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
                    {writer.name}
                    {writer.is_verified && <CheckCircle className="w-5 h-5 text-[var(--accent)]" />}
                  </h2>
                  <p className="text-[var(--text-secondary)] font-medium text-sm mt-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Academic Writing Specialist
                  </p>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 py-4 border-y border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-amber-400 fill-current" />
                    <span className="font-bold text-[var(--text-primary)] text-lg">{writer.average_rating || '4.9'}</span>
                  </div>
                  <div className="h-8 w-px bg-[var(--border)]" />
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="font-semibold text-sm truncate max-w-[120px]">{writer.address || 'Unknown'}</span>
                  </div>
                  {writer.pricePerPage && (
                    <>
                      <div className="h-8 w-px bg-[var(--border)]" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold text-lg">₹{writer.pricePerPage}</span>
                        <span className="text-[var(--text-tertiary)] text-xs">/page</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Handwriting Style */}
                {writer.handwriting_style && (
                  <div className="mt-5">
                    <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Handwriting Style</h4>
                    <StyleBadge style={writer.handwriting_style} confidence={writer.handwriting_confidence} />
                  </div>
                )}


                {/* Handwriting Samples Gallery */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ZoomIn className="w-3.5 h-3.5" />
                    Handwriting Samples
                    {samples.length > 0 && (
                      <span className="bg-[var(--accent-muted)] text-[var(--accent)] px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {samples.length}
                      </span>
                    )}
                  </h4>

                  {loadingSamples ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
                    </div>
                  ) : samples.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {samples.map((sample, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] h-36 relative group cursor-pointer"
                          onClick={() => setLightboxIndex(index)}
                        >
                          <img
                            src={sample}
                            alt={`Handwriting sample ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                            <span className="text-white text-xs font-bold flex items-center gap-1">
                              <ZoomIn className="w-3 h-3" /> View Full
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass rounded-xl p-8 text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--surface)] flex items-center justify-center">
                        <ImageOff className="w-7 h-7 text-[var(--text-tertiary)]" />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] font-medium">
                        This writer hasn't uploaded any samples yet.
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">
                        Check back later or hire based on their rating and reviews.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-[var(--border)] flex gap-3 flex-shrink-0 sticky bottom-0 z-50" style={{ background: 'var(--bg-secondary)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onHire(writer.id)}
                className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all ripple"
              >
                Hire This Writer
              </motion.button>
              <button
                onClick={onClose}
                className="px-6 py-3.5 glass text-[var(--text-secondary)] font-bold rounded-xl hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>

          {/* Fullscreen Lightbox */}
          <AnimatePresence>
            {lightboxIndex !== null && samples[lightboxIndex] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center"
                onClick={() => setLightboxIndex(null)}
              >
                {/* Close */}
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors z-30"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Counter */}
                <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-xl z-30">
                  {lightboxIndex + 1} / {samples.length}
                </div>

                {/* Navigation */}
                {samples.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors z-30"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors z-30"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image */}
                <motion.img
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 20 }}
                  src={samples[lightboxIndex]}
                  alt={`Sample ${lightboxIndex + 1}`}
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WriterProfileModal;
