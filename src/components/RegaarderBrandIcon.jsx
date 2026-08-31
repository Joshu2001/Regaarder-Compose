import React from "react";

/**
 * RegaarderBrandIcon — Pure architectural Apple-aesthetic brand mark.
 *
 * Implements the official Regaarder Image 3 silhouette glyph directly:
 *   - Completely unconstrained by app-icon badges, tiles, bubbles, or neon squircle containers.
 *   - Monochromatic vector mark that inherits typography color (currentColor) or takes custom color.
 *   - True Apple minimalism: crisp, flat, geometric, and authoritative.
 */
export default function RegaarderBrandIcon({
  size = 18,
  className = "",
  style = {},
  color = "currentColor"
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 184 190"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={style}
    >
      {/* Top Loop */}
      <path d="M 0 0 L 102 0 C 148 0 184 34 184 78 C 184 96 179 113 176 126 L 139 126 C 145 110 148 95 148 78 C 148 49 127 31 101 31 L 31 31 Z" />
      {/* Middle Bar & Diagonal Leg */}
      <path d="M 0 82 L 96 82 L 183 189 L 143 189 L 80 113 L 31 113 Z" />
      {/* Bottom Left Foot */}
      <path d="M 25 158 L 65 158 L 40 189 L 0 189 Z" />
    </svg>
  );
}
