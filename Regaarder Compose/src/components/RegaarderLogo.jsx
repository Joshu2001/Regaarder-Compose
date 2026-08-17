import React from 'react';

/**
 * Regaarder Brand Logo
 * Geometric, minimalist Apple-tier aesthetic with gradient and crisp vector styling.
 */
export default function RegaarderLogo({ size = 64, className = '', animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'transition-transform duration-700 hover:scale-105' : ''}`}
    >
      <defs>
        <linearGradient id="regaarder-grad-primary" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="45%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="regaarder-grad-glow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
        </linearGradient>
        <filter id="logo-drop-shadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#8B5CF6" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Main Rounded Squircle Background */}
      <rect
        x="12"
        y="12"
        width="76"
        height="76"
        rx="22"
        fill="url(#regaarder-grad-primary)"
        filter="url(#logo-drop-shadow)"
      />

      {/* Inner Subtle Glass/Specular Highlight */}
      <rect
        x="13.5"
        y="13.5"
        width="73"
        height="73"
        rx="20.5"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.35"
        fill="none"
      />

      {/* Modern Dynamic 'R' + Overlapping Loop Geometry */}
      <path
        d="M36 70V30C36 30 46 30 54 30C62 30 67 35 67 42C67 49 61 54 53 54H36"
        stroke="white"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M51 54L66 70"
        stroke="white"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Accent Orbital Sparkle Dot */}
      <circle cx="68" cy="28" r="4.5" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
}
