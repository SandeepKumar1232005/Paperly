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
            case 'Neat': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Cursive': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Bold': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Mixed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyleColor(style)} ${className}`}>
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
