import React, { useEffect, useState } from 'react';
import RegaarderBrandIcon from './RegaarderBrandIcon';

/**
 * SplashScreen Component
 * Apple-tier minimalist brand introduction.
 * Features the exact glowing brand squircle at center stage with ambient mesh glow,
 * gentle breathing pulse, and seamless fade transition.
 */
export default function SplashScreen({ onFinish, durationMs = 3000 }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start smooth fade-out 600ms before transition completes
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, Math.max(0, durationMs - 600));

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-white select-none transition-all duration-700 ease-out ${
        fadeOut ? 'opacity-0 scale-[1.02] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* Blurred Mesh Background (Identical palette to landing page) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-300/35 mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-300/35 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-pink-300/35 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Central Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-pink-400/25 via-purple-400/25 to-orange-300/20 filter blur-[60px] pointer-events-none" />

      {/* Center Brand Icon with Apple-style subtle breathing micro-interaction */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative transform transition-transform duration-1000 animate-pulse hover:scale-105">
          <RegaarderBrandIcon size={72} className="text-slate-900 dark:text-white drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
}
