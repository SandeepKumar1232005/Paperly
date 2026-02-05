import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import StyleBadge from './StyleBadge';
import { Upload } from 'lucide-react';

interface HandwritingUploadProps {
    onAnalysisComplete: (style: string, confidence: number) => void;
    currentStyle?: string;
    currentConfidence?: number;
    currentSampleUrl?: string;
}

const HandwritingUpload: React.FC<HandwritingUploadProps> = ({ onAnalysisComplete, currentStyle, currentConfidence, currentSampleUrl }) => {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (currentSampleUrl) {
            setPreview(currentSampleUrl);
        }
    }, [currentSampleUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        setLoading(true);
        setError(null);
        try {
            const result = await api.analyzeHandwriting(file);
            onAnalysisComplete(result.style, result.confidence);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze handwriting. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <span>✍️</span> Handwriting Analysis
            </h3>

            <div className="flex gap-6 items-start">
                <div className="flex-1 space-y-3">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center justify-center min-h-[100px] text-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-semibold text-white/40">Analyzing strokes...</span>
                            </div>
                        ) : currentStyle ? (
                            <>
                                <span className="text-xs text-white/40 font-medium mb-2">Detected Style</span>
                                <StyleBadge style={currentStyle} confidence={currentConfidence} className="text-sm px-3 py-1.5" />
                            </>
                        ) : (
                            <span className="text-xs text-white/40 italic">No handwriting sample analyzed yet</span>
                        )}
                    </div>

                    {error && <p className="text-xs text-red-400 font-medium text-center">{error}</p>}
                </div>

                <div className="flex-1 flex flex-col items-center">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group relative"
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Sample" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Replace</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-full bg-white/10 text-white/40 flex items-center justify-center mb-2 group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-colors">
                                    <Upload size={16} />
                                </div>
                                <span className="text-xs font-semibold text-white/40">Upload Sample</span>
                            </>
                        )}
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="text-[10px] text-white/30 leading-relaxed text-center">
                Upload a clear photo of your handwriting to automatically detect its style (Neat, Cursive, Bold, etc.).
            </div>
        </div>
    );
};

export default HandwritingUpload;
