import React from 'react';

type HandwritingStyle = 'Neat' | 'Cursive' | 'Bold' | 'Mixed';

interface WriterFilterProps {
    currentFilter: string;
    onFilterChange: (filter: string) => void;
}

const WriterFilter: React.FC<WriterFilterProps> = ({ currentFilter, onFilterChange }) => {
    const filters = ['All', 'Neat', 'Cursive', 'Bold', 'Mixed'];

    return (
        <div className="flex gap-2 items-center mb-6 overflow-x-auto pb-2">
            <span className="text-sm font-semibold text-gray-500 mr-2">Filter by Style:</span>
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                        ${currentFilter === filter
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    {filter === 'All' ? 'View All' : filter}
                </button>
            ))}
        </div>
    );
};

export default WriterFilter;
