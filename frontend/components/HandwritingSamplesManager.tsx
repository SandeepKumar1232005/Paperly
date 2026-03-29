import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { User } from '../types';
import {
  Upload, X, Trash2, ImagePlus, AlertCircle, CheckCircle,
  Loader2, ZoomIn, Image as ImageIcon
} from 'lucide-react';

interface HandwritingSamplesManagerProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const MAX_SAMPLES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const HandwritingSamplesManager: React.FC<HandwritingSamplesManagerProps> = ({ user, onUpdateProfile }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samples = user.handwriting_samples || [];
  const remainingSlots = MAX_SAMPLES - samples.length;

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    clearMessages();
    const fileArray = Array.from(files);

    // Validate count
    if (fileArray.length + samples.length > MAX_SAMPLES) {
      setError(`You can only upload ${remainingSlots} more sample${remainingSlots !== 1 ? 's' : ''}. Maximum is ${MAX_SAMPLES}.`);
      return;
    }

    // Validate types
    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not supported. Use JPG, PNG, WebP, or PDF.`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    const newUrls: string[] = [];
    const total = fileArray.length;

    for (let i = 0; i < total; i++) {
      try {
        setUploadProgress(Math.round(((i) / total) * 100));
        const url = await api.uploadHandwritingSample(user.id, fileArray[i]);
        newUrls.push(url);
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      } catch (e: any) {
        setError(e.message || `Failed to upload "${fileArray[i].name}"`);
        break;
      }
    }

    if (newUrls.length > 0) {
      onUpdateProfile({
        handwriting_samples: [...samples, ...newUrls]
      });
      setSuccess(`${newUrls.length} sample${newUrls.length > 1 ? 's' : ''} uploaded successfully!`);
    }

    setUploading(false);
    setUploadProgress(0);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [samples, remainingSlots, user.id, onUpdateProfile]);

  const handleDelete = async (index: number) => {
    clearMessages();
    const sampleUrl = samples[index];
    setDeletingIndex(index);

    try {
      await api.deleteHandwritingSample(user.id, sampleUrl);
      const updatedSamples = samples.filter((_, i) => i !== index);
      onUpdateProfile({ handwriting_samples: updatedSamples });
      setSuccess('Sample deleted successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to delete sample.');
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            ✍️ Handwriting Samples
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              samples.length >= MAX_SAMPLES
                ? 'bg-red-500/10 text-red-500'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {samples.length}/{MAX_SAMPLES}
            </span>
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Upload clear photos of your handwriting to attract more students.
          </p>
        </div>
      </div>

      {/* Existing Samples Grid */}
      {samples.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          <AnimatePresence mode="popLayout">
            {samples.map((sample, index) => (
              <motion.div
                key={sample}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', damping: 20 }}
                className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]"
              >
                <img
                  src={sample}
                  alt={`Sample ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewUrl(sample)}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    disabled={deletingIndex === index}
                    className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Index Badge */}
                <div className="absolute top-1.5 left-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Zone */}
      {remainingSlots > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer relative ${
            isDragOver
              ? 'border-[var(--accent)] bg-[var(--accent-muted)] scale-[1.02]'
              : uploading
                ? 'border-[var(--border)] bg-[var(--surface)] cursor-wait'
                : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface)]'
          }`}
        >
          {uploading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Uploading...</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-[var(--border)] rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">{uploadProgress}% complete</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isDragOver
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-tertiary)] group-hover:text-[var(--accent)]'
              }`}>
                <ImagePlus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {isDragOver ? 'Drop files here' : 'Upload Samples'}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Drag & drop or click • JPG, PNG, WebP, PDF • {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
              }
            }}
          />
        </div>
      )}

      {/* Max limit reached message */}
      {remainingSlots <= 0 && (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-sm text-amber-500 font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Maximum {MAX_SAMPLES} samples reached
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Delete some samples to upload new ones.</p>
        </div>
      )}

      {/* Feedback Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Lightbox */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreviewUrl(null)}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-colors z-30"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={previewUrl}
              alt="Preview"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HandwritingSamplesManager;
