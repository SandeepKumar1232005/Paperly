import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface LocationPromptProps {
    onLocationGranted: (coords: { lat: number; lon: number }) => void;
    onSkip: () => void;
}

const LocationPrompt: React.FC<LocationPromptProps> = ({ onLocationGranted, onSkip }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGrantLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onLocationGranted({ lat: latitude, lon: longitude });
                setLoading(false);
            },
            (err) => {
                console.error(err);
                if (err.code === 1) setError("Location permission denied.");
                else if (err.code === 2) setError("Location unavailable.");
                else if (err.code === 3) setError("Location request timed out.");
                else setError("An unknown error occurred.");
                setLoading(false);
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">Enable Location?</h2>
                <p className="text-sm text-gray-600 mb-6">
                    We use your location to suggest nearby writers and show relevant local results.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 text-left border border-red-100">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 flex-col sm:flex-row">
                    <button
                        onClick={onSkip}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        disabled={loading}
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleGrantLocation}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            "Allow Access"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPrompt;
