import React from 'react';

type HandwritingStyle = 'Neat' | 'Cursive' | 'Bold' | 'Mixed';

interface StyleBadgeProps {
    style?: HandwritingStyle | string;
    confidence?: number;
    className?: string;
}

const StyleBadge: React.FC<StyleBadgeProps> = ({ style, confidence, className = '' }) => {
    if (!style) return null;

    const getStyleColor = (s: string) => {
        switch (s) {
            case 'Neat': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Cursive': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Bold': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'Mixed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-white/10 text-white/60 border-white/20';
        }
    };

    const getIcon = (s: string) => {
        switch (s) {
            case 'Neat': return '📏';
            case 'Cursive': return '✍️';
            case 'Bold': return '🖊️';
            case 'Mixed': return '📝';
            default: return '📄';
        }
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${getStyleColor(style)} ${className}`}>
            <span>{getIcon(style)}</span>
            <span>{style}</span>
            {confidence !== undefined && (
                <span className="opacity-75 text-[10px] ml-0.5">
                    {Math.round(confidence * 100)}%
                </span>
            )}
        </span>
    );
};

export default StyleBadge;
