import React from 'react';

export const HippoIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Left Ear */}
      <path d="M 6 7 C 4.2 5.2, 4.8 3.2, 6.8 3.8 C 7.8 4.1, 8.2 5.4, 8 7" />
      {/* Right Ear */}
      <path d="M 18 7 C 19.8 5.2, 19.2 3.2, 17.2 3.8 C 16.2 4.1, 15.8 5.4, 16 7" />
      {/* Forehead */}
      <path d="M 7.8 7 C 9 5.2, 15 5.2, 16.2 7" />
      {/* Eyes */}
      <circle cx="8.5" cy="8" r="1" fill="currentColor" />
      <circle cx="15.5" cy="8" r="1" fill="currentColor" />
      {/* Big Hippo Muzzle / Snout */}
      <path d="M 4.5 12.5 C 4.5 9.2, 19.5 9.2, 19.5 12.5 C 19.5 18.5, 4.5 18.5, 4.5 12.5 Z" />
      {/* Nostrils */}
      <ellipse cx="9" cy="13" rx="1" ry="1.3" fill="currentColor" />
      <ellipse cx="15" cy="13" rx="1" ry="1.3" fill="currentColor" />
      {/* Cute Smile */}
      <path d="M 10 16.2 C 11.2 17, 12.8 17, 14 16.2" />
    </svg>
  );
};
