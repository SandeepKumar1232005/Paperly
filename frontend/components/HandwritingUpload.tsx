import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import StyleBadge from './StyleBadge';

interface HandwritingUploadProps {
    onAnalysisComplete: (style: string, confidence: number) => void;
    currentStyle?: string;
    currentConfidence?: number;
}

const HandwritingUpload: React.FC<HandwritingUploadProps> = ({ onAnalysisComplete, currentStyle, currentConfidence }) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload & Analyze
        setLoading(true);
        setError(null);
        try {
            const result = await api.analyzeHandwriting(file);
            onAnalysisComplete(result.style, result.confidence);
            // Optional: Toast notification could be triggered here or by parent
        } catch (err) {
            console.error(err);
            setError("Failed to analyze handwriting. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span>✍️</span> Handwriting Analysis
            </h3>

            <div className="flex gap-6 items-start">
                {/* Style Result Card */}
                <div className="flex-1 space-y-3">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center min-h-[100px] text-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-semibold text-slate-400">Analyzing strokes...</span>
                            </div>
                        ) : currentStyle ? (
                            <>
                                <span className="text-xs text-slate-400 font-medium mb-2">Detected Style</span>
                                <StyleBadge style={currentStyle} confidence={currentConfidence} className="text-sm px-3 py-1.5" />
                            </>
                        ) : (
                            <span className="text-xs text-slate-400 italic">No handwriting sample analyzed yet</span>
                        )}
                    </div>

                    {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
                </div>

                {/* Upload Section */}
                <div className="flex-1 flex flex-col items-center">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group relative"
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Sample" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Replace</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                </div>
                                <span className="text-xs font-semibold text-slate-500">Upload Sample</span>
                            </>
                        )}
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed text-center">
                Upload a clear photo of your handwriting to automatically detect its style (Neat, Cursive, Bold, etc.).
            </div>
        </div>
    );
};

export default HandwritingUpload;
