import React from 'react';

// WhatsApp-style default profile avatar
// Circular silhouette with soft neutral background and clean white head & shoulders silhouette
const SIZES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
  '3xl': 'w-24 h-24',
};

export default function HumanAvatar({ name, size = 'md', className = '' }) {
  const hasCustomSize = className.includes('w-') && className.includes('h-');
  const sizeClass = hasCustomSize ? '' : (SIZES[size] || SIZES.md);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-[#DFE5E7] overflow-hidden select-none shadow-xs border border-slate-200/60 ${sizeClass} ${className}`}
      title={name || 'User Profile'}
    >
      {/* WhatsApp classic default silhouette icon */}
      <svg
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        className="w-full h-full transform translate-y-[10%] scale-110 drop-shadow-xs"
        aria-hidden="true"
      >
        {/* Head */}
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}
