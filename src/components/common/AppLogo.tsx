import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-2xl ${className}`}
    >
      {/* Blue Squircle Background */}
      <rect width="100" height="100" rx="24" fill="#1877F2" />

      {/* Left Page of Open Book */}
      <path
        d="M20.5 31.8C26 31 38 31.8 49 44V73.5C38 66 26.5 64.5 20.5 64.5V31.8Z"
        fill="white"
      />

      {/* Right Page of Open Book with curve */}
      <path
        d="M51 44C62 31.8 74 31 79.5 31.8V64.5C73.5 64.5 62 66 51 73.5V44Z"
        fill="white"
      />

      {/* Gleaming 4-point Star / Sparkle in Top-Right of Book */}
      <path
        d="M71 18.5C71.3 24 74 27.5 79.5 28C74 28.5 71.3 32 71 37.5C70.7 32 68 28.5 62.5 28C68 27.5 70.7 24 71 18.5Z"
        fill="white"
      />
    </svg>
  );
};
