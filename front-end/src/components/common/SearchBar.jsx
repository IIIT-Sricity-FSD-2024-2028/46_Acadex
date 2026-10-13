import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SearchBar = ({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
  maxWidth = 'max-w-md',
}) => {
  return (
    <div className={cn('relative flex-1', maxWidth, className)}>
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] hover:border-slate-300 transition-all shadow-2xs"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
