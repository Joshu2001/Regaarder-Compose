import React from "react";

/**
 * RegaarderBrandIcon
 * Executive-tier Apple-aesthetic vector brand identity.
 * Features a continuous curvature squircle base with multi-stop refractive sunset-fuchsia gradient,
 * specular edge refraction, and an interlocking proprietary Regaarder optical aperture core.
 */
export default function RegaarderBrandIcon({ size = 48, className = "", style = {} }) {
  const gradientId = React.useId().replace(/:/g, "-");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={style}
    >
      <defs>
        {/* Primary Ambient Body Gradient */}
        <linearGradient
          id={`rg-grad-${gradientId}`}
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FF6B4A" />
          <stop offset="35%" stopColor="#FF3366" />
          <stop offset="70%" stopColor="#C428EB" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Specular Edge Ring Gradient */}
        <linearGradient
          id={`rg-specular-${gradientId}`}
          x1="12"
          y1="4"
          x2="36"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Inner Dome Highlight */}
        <radialGradient
          id={`rg-radial-${gradientId}`}
          cx="18"
          cy="12"
          r="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Soft Glow Underlay */}
      <rect
        x="5"
        y="5"
        width="38"
        height="38"
        rx="11.5"
        fill={`url(#rg-grad-${gradientId})`}
        opacity="0.35"
        className="filter blur-[3px]"
      />

      {/* Main Continuous Curvature Squircle Body */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="12"
        fill={`url(#rg-grad-${gradientId})`}
      />

      {/* Specular Ambient Dome */}
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="12"
        fill={`url(#rg-radial-${gradientId})`}
      />

      {/* Outer 1px Specular Chamfer Stroke */}
      <rect
        x="4.5"
        y="4.5"
        width="39"
        height="39"
        rx="11.5"
        stroke={`url(#rg-specular-${gradientId})`}
        strokeWidth="1"
      />

      {/* Regaarder Proprietary Optical Aperture Symbol */}
      <g transform="translate(14, 14)" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path
          d="M10 2.5C5.86 2.5 2.5 5.86 2.5 10C2.5 14.14 5.86 17.5 10 17.5C13.5 17.5 16.4 15.1 17.2 11.8C17.3 11.3 16.9 10.8 16.4 10.8C13.5 10.8 11.2 8.5 11.2 5.6C11.2 5.1 10.7 4.7 10.2 4.8C10.13 4.8 10.07 4.8 10 4.8"
          opacity="0.95"
        />
        <circle cx="10" cy="10" r="1.6" fill="#FFFFFF" stroke="none" />
      </g>
    </svg>
  );
}
