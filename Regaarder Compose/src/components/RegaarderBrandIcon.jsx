import React from "react";

/**
 * RegaarderBrandIcon
 * Exact brand identity icon matching the landing page squircle with fluid gradient and specular highlight.
 */
export default function RegaarderBrandIcon({ size = 48, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 shadow-xl shadow-pink-500/30 flex items-center justify-center transform rotate-12 relative overflow-hidden ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style
      }}
    >
      {/* Specular inner light refraction */}
      <div className="absolute top-1 left-1 w-1/2 h-1/2 bg-white rounded-full opacity-25 filter blur-[1px] pointer-events-none" />
      {/* Dynamic central specular core */}
      <div className="w-1/2 h-1/2 bg-white rounded-full opacity-20 -translate-x-0.5 -translate-y-0.5" />
    </div>
  );
}
