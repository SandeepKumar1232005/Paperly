import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    );
};

export default EmptyState;



