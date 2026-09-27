import React from 'react';
import {
  Globe,
  Mail,
  MapPin,
  Award,
  ShieldCheck,
  Target,
  Sparkles,
  TrendingUp,
  Activity,
  Users,
  Cpu,
  PieChart,
  BarChart3,
  LineChart,
  Table
} from 'lucide-react';

// Exact vector background renderer mirroring canvas vectorWaveStyle
export const SlideDeckExactVectorBackground = ({ slide, width = 820, height = 461.25 }) => {
  const waveStyle = slide?.vectorWaveStyle || 'original-pitch';
  const c1 = slide?.vectorColor1 || '#0055ff';
  const c2 = slide?.vectorColor2 || '#00f0ff';
  const uid = React.useId().replace(/:/g, '');

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden"
      viewBox="0 0 900 650"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id={`exDynGrad1_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.05" />
          <stop offset="50%" stopColor={c1} stopOpacity="0.5" />
          <stop offset="100%" stopColor={c1} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`exDynGrad2_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c2} stopOpacity="0.05" />
          <stop offset="50%" stopColor={c2} stopOpacity="0.4" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`exDynGradCobalt_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c1 || "#0055ff"} stopOpacity="0.08" />
          <stop offset="50%" stopColor={c1 || "#0066ff"} stopOpacity="0.65" />
          <stop offset="100%" stopColor={c2 || "#00f0ff"} stopOpacity="0.95" />
        </linearGradient>
        <filter id={`exBloom_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="12" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {waveStyle === 'agenda-bottom-wave' ? (
        <g>
          {Array.from({ length: 36 }).map((_, i) => {
            const ratio = i / 36;
            const offset = ratio * 130;
            const opacity = 0.15 + (1 - ratio) * 0.7;
            const thickness = 0.8 + ratio * 2;
            const d = `M -30 ${610 + offset * 0.3} C ${120 + offset * 0.7} ${530 - ratio * 60}, ${260 + offset * 0.9} ${580 + ratio * 20}, ${480 + ratio * 80} ${540 - ratio * 70} C ${620 + ratio * 50} ${500 - ratio * 60}, ${740 + ratio * 30} ${570}, ${860 + offset * 0.8} 680`;
            return <path key={`cyan-${i}`} d={d} stroke={`url(#exDynGrad1_${uid})`} strokeWidth={thickness} opacity={opacity} fill="none" />;
          })}
          {Array.from({ length: 28 }).map((_, i) => {
            const ratio = i / 28;
            const offset = ratio * 100;
            const opacity = 0.2 + (1 - ratio) * 0.75;
            const thickness = 0.9 + ratio * 2.2;
            const d = `M -30 ${580 + offset * 0.4} C ${140 + offset * 0.6} ${500 - ratio * 70}, ${300 + offset * 0.8} ${530 - ratio * 40}, ${520 + ratio * 70} ${480 - ratio * 90} C ${660 + ratio * 40} ${440 - ratio * 80}, ${760 + ratio * 20} ${530}, ${880 + offset * 0.7} 660`;
            return <path key={`mag-${i}`} d={d} stroke={`url(#exDynGrad2_${uid})`} strokeWidth={thickness} opacity={opacity} fill="none" />;
          })}
        </g>
      ) : waveStyle === 'toroid-ring' ? (
        <g>
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i / 32) * Math.PI * 2;
            const cx = 710 + Math.cos(angle) * 140;
            const cy = 300 + Math.sin(angle) * 70;
            const rx = 24 + Math.abs(Math.sin(angle)) * 12;
            const ry = 42 + Math.abs(Math.cos(angle)) * 16;
            const opacity = 0.2 + (Math.sin(angle) + 1) * 0.35;
            return (
              <ellipse 
                key={i} 
                cx={cx} 
                cy={cy} 
                rx={rx} 
                ry={ry} 
                transform={`rotate(${(angle * 180) / Math.PI + 90} ${cx} ${cy})`} 
                stroke={i % 2 === 0 ? `url(#exDynGrad1_${uid})` : `url(#exDynGrad2_${uid})`} 
                strokeWidth="1.2" 
                fill="none" 
                opacity={opacity} 
              />
            );
          })}
          {Array.from({ length: 14 }).map((_, i) => {
            const rX = 90 + i * 14;
            const rY = 45 + i * 7;
            const opacity = 0.15 + (1 - Math.abs(i - 7) / 7) * 0.65;
            return (
              <ellipse key={i} cx="710" cy="300" rx={rX} ry={rY} stroke={`url(#exDynGradCobalt_${uid})`} strokeWidth="1.4" fill="none" opacity={opacity} />
            );
          })}
        </g>
      ) : waveStyle === 'dna-double-helix' ? (
        <g>
          {Array.from({ length: 48 }).map((_, i) => {
            const ratio = i / 48;
            const x = 320 + ratio * 580;
            const angle = ratio * Math.PI * 5;
            const y1 = 300 + Math.sin(angle) * 120;
            const y2 = 300 - Math.sin(angle) * 120;
            const zDepth = Math.cos(angle);
            const opacity = 0.2 + (zDepth + 1) * 0.4;
            return (
              <g key={i}>
                {i % 2 === 0 && (
                  <line x1={x} y1={y1} x2={x} y2={y2} stroke={`url(#exDynGrad2_${uid})`} strokeWidth="1.5" opacity={opacity * 0.8} />
                )}
                <circle cx={x} cy={y1} r={3 + zDepth * 1.5} fill="#00f0ff" opacity={opacity + 0.2} />
                <circle cx={x} cy={y2} r={3 - zDepth * 1.5} fill="#ec4899" opacity={0.3 + (1 - zDepth) * 0.4} />
              </g>
            );
          })}
        </g>
      ) : (
        /* Startup Keynote Hero Wave (Original Pitch) */
        <g>
          {Array.from({ length: 28 }).map((_, i) => {
            const ratio = i / 28;
            const offset = ratio * 140;
            const opacity = 0.2 + (1 - ratio) * 0.65;
            const thickness = 0.8 + ratio * 2.2;
            const d = `M ${460 + offset * 1.1} -30 C ${470 + offset * 0.8} 180, ${510 + offset * 0.6} 410, ${710 + offset * 0.4} 400 C ${830 + offset * 0.2} 380, ${920 + offset * 0.1} 260, 990 ${180 - offset * 0.3}`;
            return <path key={`blue-${i}`} d={d} stroke={`url(#exDynGradCobalt_${uid})`} strokeWidth={thickness} opacity={opacity} fill="none" />;
          })}
          {Array.from({ length: 20 }).map((_, i) => {
            const ratio = i / 20;
            const offset = ratio * 90;
            const opacity = 0.3 + (1 - ratio) * 0.6;
            const thickness = 0.9 + ratio * 1.8;
            const d = `M ${520 + offset * 0.8} -20 C ${530 + offset * 0.6} 190, ${550 + offset * 0.4} 390, ${730 + offset * 0.3} 380 C ${840 + offset * 0.2} 360, ${930 + offset * 0.1} 240, 990 ${150 - offset * 0.2}`;
            return <path key={`mag-${i}`} d={d} stroke={`url(#exDynGrad2_${uid})`} strokeWidth={thickness} opacity={opacity} fill="none" />;
          })}
          <path d="M 550 -15 C 560 190, 600 375, 750 350 C 850 330, 930 220, 990 120" stroke="#00f0ff" strokeWidth="4.5" fill="none" opacity="0.95" filter={`url(#exBloom_${uid})`} />
          <path d="M 565 -15 C 575 185, 615 370, 760 345 C 860 325, 940 215, 990 115" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.98" filter={`url(#exBloom_${uid})`} />
        </g>
      )}
    </svg>
  );
};

// ── Layout Renderers matching canvas live elements 1:1 (clean, zero drag listeners) ──

const RenderStartupCover = ({ slide }) => {
  const c1 = slide?.vectorColor1 || '#0055ff';
  const c2 = slide?.vectorColor2 || '#00f0ff';
  const isBusiness = slide?.layoutStyle === 'Business Plan Cover' || slide?.title === 'Business Plan Cover';
  const uid = React.useId().replace(/:/g, '');

  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-8 pt-5 pb-3.5 overflow-hidden">
      {/* Top-Right Neon Vortex Wave */}
      {!slide?.coverTopNeon_hidden && (
        <div
          style={{
            position: 'absolute',
            top: -25,
            right: -20,
            width: slide?.coverTopNeon_width ? `${slide.coverTopNeon_width}px` : '440px',
            height: slide?.coverTopNeon_height ? `${slide.coverTopNeon_height}px` : '340px',
            transform: `translate(${slide?.coverTopNeon_posX || 0}px, ${slide?.coverTopNeon_posY || 0}px)`,
            zIndex: 3
          }}
          className="overflow-visible select-none pointer-events-none"
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 440 340" fill="none">
            <defs>
              <linearGradient id={`cvCyan_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
                <stop offset="35%" stopColor="#2563eb" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>
              <linearGradient id={`cvMag_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b0764" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85" />
                <stop offset="85%" stopColor="#ec4899" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
              </linearGradient>
              <filter id={`cvBloom_${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur1" />
                <feGaussianBlur stdDeviation="12" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {Array.from({ length: 24 }).map((_, i) => {
              const ratio = i / 24;
              const offset = ratio * 100;
              const opacity = 0.2 + (1 - ratio) * 0.65;
              const thickness = 0.8 + ratio * 2;
              const d = `M ${200 + offset * 1.1} -20 C ${210 + offset * 0.8} 120, ${240 + offset * 0.6} 270, ${330 + offset * 0.4} 250 C ${380 + offset * 0.2} 240, ${420 + offset * 0.1} 160, 460 ${110 - offset * 0.3}`;
              return <path key={`cblue-${i}`} d={d} stroke={`url(#cvCyan_${uid})`} strokeWidth={thickness} opacity={opacity} fill="none" />;
            })}
            {Array.from({ length: 18 }).map((_, i) => {
              const ratio = i / 18;
              const offset = ratio * 60;
              const opacity = 0.3 + (1 - ratio) * 0.6;
              const thickness = 0.9 + ratio * 1.8;
              const d = `M ${240 + offset * 0.8} -15 C ${250 + offset * 0.6} 125, ${270 + offset * 0.4} 260, ${340 + offset * 0.3} 240 C ${390 + offset * 0.2} 230, ${430 + offset * 0.1} 150, 460 ${90 - offset * 0.2}`;
              return <path key={`cmag-${i}`} d={d} stroke={`url(#cvMag_${uid})`} strokeWidth={thickness} opacity={opacity} fill="none" />;
            })}
            <path d="M 260 -15 C 270 125, 290 250, 350 235 C 400 220, 440 145, 460 80" stroke="#00f0ff" strokeWidth="3.5" fill="none" opacity="0.95" filter={`url(#cvBloom_${uid})`} />
            <path d="M 270 -15 C 280 120, 300 245, 355 230 C 405 215, 445 140, 460 75" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.98" filter={`url(#cvBloom_${uid})`} />
            <ellipse cx="400" cy="180" rx="90" ry="50" fill={`url(#cvCyan_${uid})`} opacity="0.3" filter={`url(#cvBloom_${uid})`} />
            <ellipse cx="420" cy="150" rx="50" ry="30" fill="#ffffff" opacity="0.45" filter={`url(#cvBloom_${uid})`} />
          </svg>
        </div>
      )}

      {/* Bottom-Left Ambient Neon Loop */}
      {!slide?.coverBottomNeon_hidden && (
        <div
          style={{
            position: 'absolute',
            bottom: -15,
            left: -15,
            width: slide?.coverBottomNeon_width ? `${slide.coverBottomNeon_width}px` : '240px',
            height: slide?.coverBottomNeon_height ? `${slide.coverBottomNeon_height}px` : '130px',
            transform: `translate(${slide?.coverBottomNeon_posX || 0}px, ${slide?.coverBottomNeon_posY || 0}px)`,
            zIndex: 3
          }}
          className="overflow-visible select-none pointer-events-none"
        >
          <svg className="w-full h-full overflow-visible" viewBox="0 0 240 130" fill="none">
            {Array.from({ length: 12 }).map((_, i) => {
              const ratio = i / 12;
              const offset = ratio * 50;
              const opacity = 0.25 + (1 - ratio) * 0.6;
              const thickness = 0.8 + ratio * 1.5;
              const d = `M -20 ${110 + offset * 0.4} C ${40 + offset * 0.5} ${80 - ratio * 20}, ${110 + offset * 0.6} ${40 - ratio * 15}, ${160 + offset * 0.4} ${60 + ratio * 15} C ${200 + offset * 0.3} ${90 + ratio * 20}, 220 120, 240 135`;
              return <path key={`cbot-${i}`} d={d} stroke={i % 2 === 0 ? "#00f0ff" : "#a855f7"} strokeWidth={thickness} opacity={opacity} fill="none" />;
            })}
            <path d="M -20 115 C 40 75, 115 35, 165 58 C 205 85, 225 120, 240 135" stroke="#00f0ff" strokeWidth="2" fill="none" opacity="0.9" />
            <path d="M -15 110 C 45 73, 118 33, 167 56 C 207 83, 227 118, 240 135" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.9" />
          </svg>
        </div>
      )}

      {/* Top-Left Company Tagline */}
      {!slide?.taglineHidden && (
        <div className="z-20 pt-1">
          <span className="text-[13.5px] italic text-slate-300 font-serif leading-none tracking-wide">
            {slide?.tagline || (isBusiness ? 'Strategic Execution Plan' : 'Novaris Company')}
          </span>
        </div>
      )}

      {/* Center Headline & Presenter Pill */}
      <div className="flex flex-col justify-center items-start my-auto z-20 pl-0.5">
        <h1 className="text-[48px] leading-[0.98] font-[900] tracking-tight text-white uppercase whitespace-pre-line font-sans mb-3.5">
          {slide?.headline || (isBusiness ? 'BUSINESS PLAN\n2026 – 2029' : 'STARTUP\nPITCH DECK')}
        </h1>

        {!slide?.presenterHidden && !isBusiness && (
          <div
            style={{
              width: '275px',
              height: '38px',
              borderRadius: slide?.presenterShape || '9999px',
              background: slide?.presenterBg || 'linear-gradient(90deg, #4d3663 0%, #373d6b 40%, #1e2c56 100%)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.45)',
              border: '1.2px solid rgba(255,255,255,0.25)'
            }}
            className="flex items-center justify-center text-center relative shadow-xl overflow-hidden"
          >
            <div
              className="absolute -inset-[200%] pointer-events-none"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg 180deg, ${c1} 250deg, ${c2} 310deg, #7c4dff 360deg)`,
                opacity: 0.45
              }}
            />
            <span className="relative z-20 text-[11px] font-[900] tracking-[0.16em] uppercase text-white font-sans leading-none px-2">
              {slide?.presenter || 'PRESENT BY ALEX CHEN'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Contact Bar */}
      <div className="flex items-center justify-around w-full pt-1.5 pb-0.5 z-20 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm">
            <Globe size={10} />
          </div>
          <span className="text-[9.5px] text-slate-300 font-sans tracking-wide">
            {slide?.contactWeb || 'www.reallygreatsite.com'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm">
            <Mail size={10} />
          </div>
          <span className="text-[9.5px] text-slate-300 font-sans tracking-wide">
            {slide?.contactEmail || 'hello@reallygreatsite.com'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm">
            <MapPin size={10} />
          </div>
          <span className="text-[9.5px] text-slate-300 font-sans tracking-wide">
            {slide?.contactAddress || '123 Anywhere Street'}
          </span>
        </div>
      </div>
    </div>
  );
};

const RenderStartupAgenda = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-6 py-4">
      {/* Top Tagline */}
      <div className="flex items-center justify-start z-20 mb-1">
        <span className="text-[13.5px] italic text-slate-400 font-normal tracking-wide">
          {slide?.tagline || 'Novaris Company'}
        </span>
      </div>

      {/* Main Content: Left Headline + Right 2-Column Table */}
      <div className="flex items-start gap-8 my-auto w-full z-20 flex-1">
        {/* Left Column */}
        <div className="w-[30%] shrink-0 pt-4">
          <h1 className="text-[44px] leading-[0.98] font-[900] tracking-tight text-white uppercase whitespace-pre-line font-sans">
            {slide?.headline || "TODAY'S\nAGENDA"}
          </h1>
        </div>

        {/* Right Column: 2-Column Numbered Table */}
        <div className="w-[70%] flex-1 relative flex items-stretch">
          {/* Column 1: Items 01 - 05 */}
          <div className="w-1/2 flex flex-col justify-between pr-5">
            {[
              { numKey: 'agendaNum1', titleKey: 'agendaTitle1', defNum: '01', defTitle: 'Introduction' },
              { numKey: 'agendaNum2', titleKey: 'agendaTitle2', defNum: '02', defTitle: 'Problem\nStatement' },
              { numKey: 'agendaNum3', titleKey: 'agendaTitle3', defNum: '03', defTitle: 'Our Innovative\nSolutions' },
              { numKey: 'agendaNum4', titleKey: 'agendaTitle4', defNum: '04', defTitle: 'Discover Our\nServices' },
              { numKey: 'agendaNum5', titleKey: 'agendaTitle5', defNum: '05', defTitle: 'Size of Market' }
            ].map((row, idx) => (
              <div key={idx} className="flex flex-col justify-center min-h-[44px]">
                <div className="flex items-center gap-3.5 py-1">
                  <span className="text-[26px] font-[900] text-white tracking-tight shrink-0 w-10 font-sans leading-none">
                    {slide?.[row.numKey] || row.defNum}
                  </span>
                  <span className="text-[13px] font-bold text-white tracking-normal leading-[1.15] whitespace-pre-line flex-1 font-sans">
                    {slide?.[row.titleKey] || row.defTitle}
                  </span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-white/30 via-cyan-400/60 to-transparent mt-0.5" />
              </div>
            ))}
          </div>

          {/* Vertical Central Laser Beam */}
          <div className="w-px self-stretch bg-gradient-to-b from-white/35 via-cyan-400 to-white/10 shadow-[0_0_8px_rgba(0,240,255,0.7)] shrink-0 my-1" />

          {/* Column 2: Items 06 - 10 */}
          <div className="w-1/2 flex flex-col justify-between pl-5">
            {[
              { numKey: 'agendaNum6', titleKey: 'agendaTitle6', defNum: '06', defTitle: 'Key Competitors\nAdvantage' },
              { numKey: 'agendaNum7', titleKey: 'agendaTitle7', defNum: '07', defTitle: 'Traction' },
              { numKey: 'agendaNum8', titleKey: 'agendaTitle8', defNum: '08', defTitle: 'Revenue Model' },
              { numKey: 'agendaNum9', titleKey: 'agendaTitle9', defNum: '09', defTitle: 'Accomplishments to\nDate' },
              { numKey: 'agendaNum10', titleKey: 'agendaTitle10', defNum: '10', defTitle: 'Use of Funds' }
            ].map((row, idx) => (
              <div key={idx} className="flex flex-col justify-center min-h-[44px]">
                <div className="flex items-center gap-3.5 py-1">
                  <span className="text-[26px] font-[900] text-white tracking-tight shrink-0 w-10 font-sans leading-none">
                    {slide?.[row.numKey] || row.defNum}
                  </span>
                  <span className="text-[13px] font-bold text-white tracking-normal leading-[1.15] whitespace-pre-line flex-1 font-sans">
                    {slide?.[row.titleKey] || row.defTitle}
                  </span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-white/30 via-cyan-400/60 to-transparent mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-1" />
    </div>
  );
};

const RenderStartupIntro = ({ slide }) => {
  return (
    <div className="flex flex-col justify-start h-full w-full relative z-10 px-5 pt-3 pb-3">
      {/* Header Headline */}
      <div className="flex items-center justify-start z-20 mb-2 pl-0.5">
        <h1 className="text-[38px] font-[900] tracking-wider text-white uppercase font-sans leading-none">
          {slide?.headline || 'INTRODUCTION'}
        </h1>
      </div>

      {/* Bento Grid */}
      <div className="flex-1 grid grid-cols-12 gap-3.5 w-full z-20 min-h-0 max-h-[82%]">
        {/* Left Column (Span 4): Studio Card */}
        <div 
          className="col-span-4 rounded-2xl overflow-hidden relative flex flex-col justify-between p-3 shadow-xl border border-white/20"
          style={{
            backgroundColor: 'rgba(196, 181, 253, 0.10)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="relative z-10 w-full h-[60%] rounded-xl overflow-hidden border border-black/10 bg-black/85 shadow-xl flex items-center justify-center">
            <img 
              src={slide?.introMainImg || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'} 
              alt="Design Your Future With Us"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 mt-auto pt-1 flex flex-col">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 border border-white/20 text-[9px] font-bold text-cyan-300 w-fit tracking-wider">
              <span>STUDIO EDITION</span>
            </div>
            <h3 className="text-white font-[900] text-[13px] leading-tight tracking-tight mt-1 uppercase font-sans">
              DESIGN YOUR FUTURE WITH US.
            </h3>
          </div>
        </div>

        {/* Right Column (Span 8): Dual Horizontal Narrative Bento Cards */}
        <div className="col-span-8 flex flex-col justify-between gap-3 min-h-0">
          {/* Top Card */}
          <div 
            className="flex-1 rounded-2xl border border-white/20 p-4 shadow-xl backdrop-blur-xl flex items-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(23, 37, 84, 0.35) 0%, rgba(30, 27, 75, 0.18) 50%, rgba(15, 23, 42, 0.35) 100%)'
            }}
          >
            <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
            <p className="text-[12px] leading-[1.45] font-normal text-slate-100 font-sans">
              {slide?.introCard1Text || "We're your dedicated partners in propelling startups toward success. With a blend of expertise and innovation, we offer comprehensive solutions tailored to meet the specific needs of each venture we work with. From strategic guidance to brand development and digital marketing, we're committed to empowering startups to thrive in competitive markets."}
            </p>
          </div>

          {/* Bottom Row Split */}
          <div className="h-[48%] grid grid-cols-12 gap-3 min-h-0">
            <div className="col-span-5 rounded-2xl overflow-hidden border border-white/20 bg-black/70 relative shadow-lg flex items-center justify-center">
              <img 
                src={slide?.introSubImg || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80'} 
                alt="Holographic Laptop Visual"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="col-span-7 flex flex-col justify-center pr-1">
              <p className="text-[11.5px] leading-[1.45] font-normal text-slate-300 font-sans">
                {slide?.introCard2Text || "Our collaborative approach ensures that we're not just service providers but invested advocates for your growth. Let us be the catalyst for your startup's journey, guiding you towards achieving your goals and beyond."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Anchor */}
      <div className="flex items-center justify-end z-20 pt-1 pr-1 mt-auto">
        <span className="text-[11.5px] italic font-normal tracking-wide text-slate-400">
          {slide?.footer || 'Novaris Company'}
        </span>
      </div>
    </div>
  );
};

const RenderStartupProblem = ({ slide }) => {
  return (
    <div className="flex flex-col justify-center h-full w-full relative z-10 px-6 pt-2 pb-4">
      <div className="flex-1 grid grid-cols-12 gap-6 w-full z-20 min-h-0 max-h-[76%] items-start my-auto">
        {/* Left Column: Heading */}
        <div className="col-span-5 flex flex-col justify-center pl-1 self-center">
          <h1 className="text-[40px] font-[900] tracking-tight text-white uppercase font-sans leading-[1.02] whitespace-pre-line">
            {slide?.headline || 'PROBLEM\nSTATEMENT'}
          </h1>
        </div>

        {/* Right Column: 3 Glassmorphic Cards */}
        <div className="col-span-7 grid grid-cols-3 gap-3.5 h-full min-h-0 py-1 items-stretch">
          {[
            {
              num: slide?.card1Num || '01',
              title: slide?.card1Title || 'LACK OF BRAND DIFFERENTIATION',
              body: slide?.card1Text || 'Startups often find it hard to make their brand unique in a crowded market. Without a clear way to stand out, they struggle to catch the eye of potential customers and lose out to bigger competitors.',
              bg: slide?.card1Bg || 'linear-gradient(180deg, rgba(167, 139, 250, 0.16) 0%, rgba(99, 102, 241, 0.08) 50%, rgba(30, 27, 75, 0.4) 100%)'
            },
            {
              num: slide?.card2Num || '02',
              title: slide?.card2Title || 'INCONSISTENT BRAND MESSAGING',
              body: slide?.card2Text || 'Inconsistency in brand messaging across various marketing channels confuses potential customers and dilutes brand perception.',
              bg: slide?.card2Bg || 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
            },
            {
              num: slide?.card3Num || '03',
              title: slide?.card3Title || 'KEEPING UP WITH TRENDS',
              body: slide?.card3Text || 'The marketing landscape evolves fast, and startups often struggle to keep up. With limited resources and time, staying on top of trends is a hurdle.',
              bg: slide?.card3Bg || 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
            }
          ].map((c, idx) => (
            <div
              key={idx}
              style={{
                background: c.bg,
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1.2px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
              }}
              className="flex flex-col items-center justify-start p-3 shadow-xl overflow-hidden"
            >
              <span className="text-[26px] font-[900] text-white tracking-tight font-sans leading-none mb-1.5">
                {c.num}
              </span>
              <h3 className="text-white font-[900] text-[10px] leading-tight tracking-tight uppercase font-sans text-center mb-2">
                {c.title}
              </h3>
              <p className="text-[9px] text-slate-300 leading-relaxed font-normal text-center overflow-hidden">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RenderStartupSolutions = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-6 pt-2 pb-4 overflow-hidden">
      {/* Background Layer: Flowing Neon Curved Wave */}
      <div className="absolute top-0 right-0 w-[72%] h-[190px] pointer-events-none select-none z-10">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="solWaveGrad1_ex" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#818cf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="solWaveGrad2_ex" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.75" />
              <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path d="M 0 135 C 200 35, 420 185, 700 75" stroke="url(#solWaveGrad1_ex)" strokeWidth="4.5" fill="none" opacity="0.95" />
          <path d="M 20 150 C 220 45, 450 195, 700 90" stroke="#00f0ff" strokeWidth="2" fill="none" opacity="0.9" />
          <path d="M 40 125 C 240 25, 400 175, 700 60" stroke="url(#solWaveGrad2_ex)" strokeWidth="3" fill="none" opacity="0.8" />
        </svg>
      </div>

      {/* Headline */}
      <div className="z-30 pt-1 pl-1">
        <h1 className="text-[38px] font-[900] tracking-tight text-white uppercase font-sans leading-[1.02] whitespace-pre-line">
          {slide?.headline || 'OUR INNOVATIVE\nSOLUTIONS'}
        </h1>
      </div>

      {/* 3 Solution Bento Cards */}
      <div className="grid grid-cols-3 gap-4 w-full z-20 min-h-0 flex-1 items-stretch mt-auto pt-7 pb-1">
        {[
          {
            icon: Award,
            title: slide?.card1Title || 'FIND UNIQUE SELLING POINT',
            body: slide?.card1Text || 'Help startups figure out what makes them special and build their brand around it. This involves learning about competitors and creating a clear message that sets them apart.',
            bg: slide?.card1Bg || 'linear-gradient(180deg, rgba(56, 44, 77, 0.6) 0%, rgba(32, 34, 63, 0.5) 50%, rgba(15, 22, 46, 0.6) 100%)'
          },
          {
            icon: ShieldCheck,
            title: slide?.card2Title || 'BRAND MESSAGING GUIDELINES',
            body: slide?.card2Text || "Make sure all marketing materials send the same message. Clear guidelines for how to talk about the brand and communicate the value proposition effectively.",
            bg: slide?.card2Bg || 'linear-gradient(180deg, rgba(50, 40, 70, 0.6) 0%, rgba(30, 31, 59, 0.5) 50%, rgba(14, 20, 40, 0.6) 100%)'
          },
          {
            icon: Target,
            title: slide?.card3Title || 'AGILE MARKETING STRATEGY',
            body: slide?.card3Text || 'Help startups adapt quickly to changes in the market. Keeping an eye on what works, analyzing data, and iterating rapidly.',
            bg: slide?.card3Bg || 'linear-gradient(180deg, rgba(124, 92, 153, 0.55) 0%, rgba(62, 50, 100, 0.45) 50%, rgba(25, 28, 61, 0.55) 100%)'
          }
        ].map((c, idx) => {
          const IconComp = c.icon;
          return (
            <div
              key={idx}
              style={{
                background: c.bg,
                borderRadius: '18px',
                border: '1.2px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.65)'
              }}
              className="relative flex flex-col items-center justify-start pt-7 pb-4 px-3 shadow-xl"
            >
              {/* Floating Circular Badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg border-2 border-indigo-200 flex items-center justify-center z-40">
                <IconComp size={18} className="text-blue-600" />
              </div>
              <h3 className="text-white font-[900] text-[10px] leading-tight tracking-tight uppercase font-sans text-center mb-1.5 mt-1">
                {c.title}
              </h3>
              <p className="text-[9px] text-slate-300 leading-relaxed font-normal text-center overflow-hidden">
                {c.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RenderStartupMarket = ({ slide }) => {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full relative z-10 px-6 py-3 overflow-hidden">
      {/* Outer Glassmorphic Card Container */}
      <div 
        style={{
          background: 'linear-gradient(180deg, rgba(8,12,28,0.92) 0%, rgba(5,8,18,0.96) 100%)',
          borderRadius: '20px',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          borderTop: '1.5px solid rgba(0, 240, 255, 0.6)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
        className="relative grid grid-cols-12 gap-5 p-4 w-full h-[96%] z-20 items-stretch"
      >
        {/* Left Column: Headline, Narrative & 3 TAM / SAM / SOM Rows */}
        <div className="col-span-7 flex flex-col justify-start h-full pr-1 min-h-0">
          <h1 className="text-[24px] font-[900] tracking-tight text-white uppercase font-sans leading-none mb-1">
            {slide?.headline || 'SIZE OF MARKET'}
          </h1>
          <p className="text-[9px] leading-[1.3] text-slate-300 font-normal font-sans mb-3 line-clamp-3">
            {slide?.marketDesc || "Understanding the market size is important for us. In the US, there are about 32 million small businesses. We're aiming at technology, e-commerce, and services (9.6M SAM). Our SOM target is 480,000 businesses."}
          </p>

          <div className="flex flex-col justify-start gap-2 min-h-0">
            {[
              { badge: 'TOTAL ADDRESSABLE MARKET (TAM)', val: slide?.tamValue || '32 MILLION', bg: 'linear-gradient(180deg, #7c5c99 0%, #3e3264 50%, #191c3d 100%)' },
              { badge: 'SERVICEABLE ADDRESSABLE MARKET (SAM)', val: slide?.samValue || '9.6 MILLION', bg: 'linear-gradient(180deg, #322846 0%, #1e1f3b 50%, #0e1428 100%)' },
              { badge: 'SERVICEABLE OBTAINABLE MARKET (SOM)', val: slide?.somValue || '480,000', bg: 'linear-gradient(180deg, #322846 0%, #1e1f3b 50%, #0e1428 100%)' }
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  background: row.bg,
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}
                className="flex items-center justify-between px-3 py-1.5 h-[36px]"
              >
                <span className="text-[8px] font-bold text-white uppercase tracking-wider font-sans leading-tight">
                  {row.badge}
                </span>
                <span className="text-[12px] font-[900] text-cyan-300 font-sans tracking-wide">
                  {row.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Multi-series Chart Visual */}
        <div className="col-span-5 rounded-xl border border-white/20 bg-white/5 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Market Analysis</span>
            <BarChart3 size={13} className="text-cyan-400" />
          </div>
          {/* Chart preview bars */}
          <div className="flex items-end justify-around gap-2 h-28 pt-2">
            {[
              { label: 'TAM', h: '85%', color: '#a855f7' },
              { label: 'SAM', h: '55%', color: '#38bdf8' },
              { label: 'SOM', h: '25%', color: '#00f0ff' }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div 
                  className="w-full rounded-t-md shadow-lg"
                  style={{ height: bar.h, backgroundColor: bar.color }}
                />
                <span className="text-[7.5px] font-bold text-slate-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RenderStartupCompetitors = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-8 pt-4 pb-2.5 overflow-hidden">
      {/* Side-by-Side Direct vs Indirect Columns */}
      <div className="flex-1 flex flex-row items-stretch justify-between w-full z-20 min-h-0 my-auto gap-8 px-4">
        {/* Direct Competitor */}
        <div className="flex-1 flex flex-col justify-start items-center text-center p-2 rounded-2xl">
          <div
            style={{
              background: 'linear-gradient(180deg, #322846 0%, #1e1f3b 50%, #0e1428 100%)',
              borderRadius: '12px',
              border: '1.2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}
            className="w-full max-w-[260px] h-[38px] px-3 flex items-center justify-center text-center shrink-0 mb-3 shadow-lg"
          >
            <span className="text-[12px] font-[900] uppercase tracking-[0.14em] text-white">
              {slide?.directHeader || 'DIRECT COMPETITOR'}
            </span>
          </div>

          <div className="w-full flex flex-col justify-between flex-1 min-h-0">
            {[
              slide?.direct1 || 'Offers similar services or products to ours.',
              slide?.direct2 || 'Targets the same customer base and market segments.',
              slide?.direct3 || 'Competes directly with us in terms of pricing and features.',
              slide?.direct4 || 'Easily identified and recognized as a competitor by customers.'
            ].map((text, idx) => (
              <div key={idx} className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-200 font-normal leading-[1.35] text-center py-1">
                  {text}
                </p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/35 to-transparent my-0.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Central Vertical Laser Beam */}
        <div className="w-px self-stretch bg-gradient-to-b from-white/35 via-cyan-400 to-white/10 shadow-[0_0_8px_rgba(0,240,255,0.7)] shrink-0 my-2" />

        {/* Indirect Competitor */}
        <div className="flex-1 flex flex-col justify-start items-center text-center p-2 rounded-2xl">
          <div
            style={{
              background: 'linear-gradient(180deg, #7c5c99 0%, #3e3264 50%, #191c3d 100%)',
              borderRadius: '12px',
              border: '1.2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}
            className="w-full max-w-[260px] h-[38px] px-3 flex items-center justify-center text-center shrink-0 mb-3 shadow-lg"
          >
            <span className="text-[12px] font-[900] uppercase tracking-[0.14em] text-white">
              {slide?.indirectHeader || 'INDIRECT COMPETITOR'}
            </span>
          </div>

          <div className="w-full flex flex-col justify-between flex-1 min-h-0">
            {[
              slide?.indirect1 || 'Provides different services or products solving similar needs.',
              slide?.indirect2 || 'Targets overlapping or adjacent market segments.',
              slide?.indirect3 || 'Offers complementary products that could substitute ours.',
              slide?.indirect4 || 'Companies from different industries indirectly impacting our market.'
            ].map((text, idx) => (
              <div key={idx} className="w-full flex flex-col items-center">
                <p className="text-[10px] text-slate-200 font-normal leading-[1.35] text-center py-1">
                  {text}
                </p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/35 to-transparent my-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RenderStartupTimeline = ({ slide }) => {
  return (
    <div className="flex flex-row items-stretch h-full w-full relative z-10 px-8 pt-3.5 pb-3 overflow-hidden gap-6">
      {/* Far-Left Vertical Headline Block */}
      <div className="flex flex-col justify-center items-center h-full shrink-0 z-20 pr-1">
        <div className="flex flex-col items-center justify-center text-center">
          <span
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              letterSpacing: '0.12em'
            }}
            className="text-[14px] font-[900] text-white uppercase font-sans leading-none my-0.5"
          >
            {slide?.headline || 'ACCOMPLISHMENTS'}
          </span>
          <span
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'upright',
              letterSpacing: '0.12em'
            }}
            className="text-[14px] font-[900] text-white uppercase font-sans leading-none mt-2"
          >
            {slide?.subHeadline || 'DATE'}
          </span>
        </div>
      </div>

      {/* Central Vertical Laser Spine with 4 Spheres */}
      <div className="flex flex-col items-center justify-around h-full relative z-20 py-1 shrink-0 px-1">
        <div className="absolute top-3 bottom-3 w-0.5 bg-gradient-to-b from-white/70 via-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
        {[0, 1, 2, 3].map((sIdx) => (
          <div
            key={sIdx}
            style={{
              boxShadow: '0 0 16px rgba(0,240,255,0.9), 0 0 8px rgba(255,255,255,0.95)',
              background: '#ffffff'
            }}
            className="w-6 h-6 rounded-full border-2 border-white relative z-10 shrink-0"
          />
        ))}
      </div>

      {/* Right Column: 4 Stacked Milestone Bento Cards */}
      <div className="flex-1 flex flex-col justify-between h-full min-h-0 gap-2.5 z-20 py-0.5">
        {[
          {
            year: slide?.timeline1Year || '2021',
            desc: slide?.timeline1Desc || 'In our first year, we successfully launched a new product/service, received positive feedback from early users, and formed key partnerships.',
            bg: 'linear-gradient(90deg, rgba(62,44,78,0.85) 0%, rgba(35,38,72,0.88) 45%, rgba(16,32,85,0.92) 100%)'
          },
          {
            year: slide?.timeline2Year || '2023',
            desc: slide?.timeline2Desc || 'We expanded into new markets, improved operational efficiency, and saw an increase in customer satisfaction.',
            bg: 'linear-gradient(90deg, rgba(62,44,78,0.85) 0%, rgba(35,38,72,0.88) 45%, rgba(16,32,85,0.92) 100%)'
          },
          {
            year: slide?.timeline3Year || '2025',
            desc: slide?.timeline3Desc || 'We secured funding for growth, refined our offerings based on customer feedback, and formed strategic partnerships.',
            bg: 'linear-gradient(90deg, rgba(62,44,78,0.85) 0%, rgba(35,38,72,0.88) 45%, rgba(16,32,85,0.92) 100%)'
          },
          {
            year: slide?.timeline4Year || 'PRESENT',
            desc: slide?.timeline4Desc || 'We achieved profitability, expanded our product line, and strengthened our brand reputation through positive customer feedback.',
            bg: 'linear-gradient(90deg, rgba(165,130,215,0.95) 0%, rgba(115,85,200,0.95) 35%, rgba(55,80,185,0.95) 75%, rgba(25,35,120,0.98) 100%)'
          }
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              background: item.bg,
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
            }}
            className="flex items-center gap-4 px-4 py-2 flex-1"
          >
            <span className="text-[16px] font-[900] text-cyan-300 tracking-tight shrink-0 font-sans">
              {item.year}
            </span>
            <p className="text-[10px] text-slate-200 leading-tight font-normal font-sans line-clamp-2">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RenderStartupFunds = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-8 pt-3.5 pb-2.5 overflow-hidden">
      {/* Top Headline */}
      <div className="flex flex-col gap-0.5 mb-2 z-20 max-w-[620px]">
        <h1 className="text-[28px] font-[900] tracking-tight text-white uppercase font-sans leading-none">
          {slide?.headline || 'USE OF FUNDS'}
        </h1>
        <p className="text-[9px] leading-[1.3] text-slate-300 font-normal font-sans line-clamp-2">
          {slide?.fundsDesc || "Our plan for using funds generated from investors is straightforward. 40% Product R&D, 30% Marketing & Sales, 20% Infrastructure, 10% Expansion."}
        </p>
      </div>

      {/* Main Content Layout: Left Donut Chart + Right 4 Allocation Rows */}
      <div className="flex-1 grid grid-cols-12 gap-6 w-full z-20 min-h-0 items-stretch pb-1">
        {/* Left Column: Glassmorphic Chart */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(38,28,64,0.8) 0%, rgba(18,16,40,0.92) 100%)',
            borderRadius: '18px',
            border: '1.2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
          }}
          className="col-span-5 flex flex-col justify-center items-center p-3 rounded-2xl relative"
        >
          {/* SVG Pie Chart */}
          <svg className="w-32 h-32" viewBox="0 0 100 100">
            {/* 40% slice (0 - 144 deg) */}
            <circle cx="50" cy="50" r="35" fill="none" stroke="#a855f7" strokeWidth="22" strokeDasharray="88 220" strokeDashoffset="0" />
            {/* 30% slice (144 - 252 deg) */}
            <circle cx="50" cy="50" r="35" fill="none" stroke="#38bdf8" strokeWidth="22" strokeDasharray="66 220" strokeDashoffset="-88" />
            {/* 20% slice (252 - 324 deg) */}
            <circle cx="50" cy="50" r="35" fill="none" stroke="#00f0ff" strokeWidth="22" strokeDasharray="44 220" strokeDashoffset="-154" />
            {/* 10% slice (324 - 360 deg) */}
            <circle cx="50" cy="50" r="35" fill="none" stroke="#ec4899" strokeWidth="22" strokeDasharray="22 220" strokeDashoffset="-198" />
          </svg>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider mt-2">Capital Allocation</span>
        </div>

        {/* Right Column: 4 Allocation Rows */}
        <div className="col-span-7 flex flex-col justify-between min-h-0 gap-2">
          {[
            { val: slide?.fund1Val || '40%', label: slide?.fund1Label || 'PRODUCT DEVELOPMENT', color: '#a855f7' },
            { val: slide?.fund2Val || '30%', label: slide?.fund2Label || 'MARKETING AND SALES', color: '#38bdf8' },
            { val: slide?.fund3Val || '20%', label: slide?.fund3Label || 'INFRASTRUCTURE AND OPERATIONS', color: '#00f0ff' },
            { val: slide?.fund4Val || '10 %', label: slide?.fund4Label || 'EXPANSION AND GROWTH INITIATIVES', color: '#ec4899' }
          ].map((fund, idx) => (
            <div
              key={idx}
              style={{
                background: 'linear-gradient(90deg, #9d78cd 0%, #7e57c2 30%, #3f51b5 70%, #1e3a8a 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
              className="flex items-center justify-between px-4 py-2"
            >
              <span className="text-[10px] font-bold text-white uppercase font-sans tracking-wide">
                {fund.label}
              </span>
              <span className="text-[13px] font-[900] text-cyan-300 font-sans tracking-tight">
                {fund.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RenderStartupTeam = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-8 pt-3.5 pb-2.5 overflow-hidden">
      {/* Top Headline */}
      <div className="flex flex-col gap-0.5 mb-1 z-20 max-w-[580px]">
        <h1 className="text-[26px] font-[900] tracking-tight text-white uppercase font-sans leading-none">
          {slide?.headline || 'MEET THE TEAM'}
        </h1>
        <p className="text-[9px] text-slate-300 font-normal font-sans">
          {slide?.teamSub || 'Thank you for your time! Reach out to us for questions.'}
        </p>
      </div>

      {/* 2x2 Grid of Bento Cards */}
      <div className="flex-1 grid grid-cols-2 gap-3.5 w-full z-20 min-h-0 items-center py-1">
        {[
          {
            name: slide?.member1Name || 'DANI MARTINEZ',
            role: slide?.member1Role || 'Chief Executive Officer',
            photo: slide?.member1Photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=faces'
          },
          {
            name: slide?.member2Name || 'HARPER RUSSO',
            role: slide?.member2Role || 'Chief Technology Officer',
            photo: slide?.member2Photo || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=faces'
          },
          {
            name: slide?.member3Name || 'MORGAN MAXWELL',
            role: slide?.member3Role || 'Chief Product Officer',
            photo: slide?.member3Photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces'
          },
          {
            name: slide?.member4Name || 'ALEX CHEN',
            role: slide?.member4Role || 'Director of Operations',
            photo: slide?.member4Photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces'
          }
        ].map((m, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(90deg, rgba(62,44,78,0.85) 0%, rgba(35,38,72,0.88) 45%, rgba(16,32,85,0.92) 100%)',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
            }}
            className="flex items-center gap-3.5 p-2.5"
          >
            <img 
              src={m.photo} 
              alt={m.name} 
              className="w-12 h-12 rounded-xl object-cover border border-white/40 shrink-0" 
            />
            <div className="flex flex-col">
              <span className="text-[12px] font-[900] text-white uppercase font-sans tracking-wide">
                {m.name}
              </span>
              <span className="text-[9px] text-cyan-300 font-sans tracking-normal">
                {m.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RenderStartupThankYou = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-8 pt-5 pb-3.5 overflow-hidden">
      {/* Top Company Tagline */}
      <div className="z-20 pt-1">
        <span className="text-[13.5px] italic text-slate-300 font-serif leading-none tracking-wide">
          {slide?.tagline || 'Novaris Company'}
        </span>
      </div>

      {/* Center Concluding Hero Stage */}
      <div className="flex-1 flex flex-col items-center justify-center text-center z-20 my-auto min-h-0">
        <h1 className="text-[44px] font-[900] tracking-tight text-white uppercase font-sans leading-none mb-1">
          {slide?.headline || 'THANK YOU'}
        </h1>
        <p className="text-[11px] font-[900] tracking-[0.22em] text-slate-200 uppercase font-sans leading-none mb-3.5">
          {slide?.thankSub || 'FOR YOUR TIME AND ATTENTION'}
        </p>

        <div
          style={{
            width: '275px',
            height: '38px',
            background: 'linear-gradient(90deg, #9d78cd 0%, #7e57c2 30%, #3f51b5 70%, #1e3a8a 100%)',
            borderRadius: '9999px',
            border: '1.2px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.65)'
          }}
          className="flex items-center justify-center text-center rounded-full shadow-xl"
        >
          <span className="text-[11px] font-[900] tracking-[0.14em] uppercase text-white font-sans leading-none">
            {slide?.presenterText || 'PRESENT BY ALEX CHEN'}
          </span>
        </div>
      </div>

      {/* Bottom Contact Bar */}
      <div className="flex items-center justify-around w-full pt-1.5 pb-0.5 z-20 rounded-xl">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm">
            <Globe size={9} />
          </div>
          <span className="text-[9px] text-slate-300 font-medium font-sans">
            {slide?.contactWeb || 'www.reallygreatsite.com'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm">
            <Mail size={9} />
          </div>
          <span className="text-[9px] text-slate-300 font-medium font-sans">
            {slide?.contactEmail || 'hello@reallygreatsite.com'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm">
            <MapPin size={9} />
          </div>
          <span className="text-[9px] text-slate-300 font-medium font-sans">
            {slide?.contactAddress || '123 Anywhere St., Any City'}
          </span>
        </div>
      </div>
    </div>
  );
};

const RenderBusinessPlanCover = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-8 pt-6 pb-4 overflow-hidden">
      <div className="z-20 pt-1">
        <span className="text-[13px] font-bold text-cyan-400 uppercase tracking-widest font-sans">
          {slide?.tagline || 'STRATEGIC EXECUTION PLAN'}
        </span>
      </div>

      <div className="flex flex-col justify-center items-start my-auto z-20">
        <h1 className="text-[46px] leading-[1.0] font-[900] tracking-tight text-white uppercase whitespace-pre-line font-sans mb-3">
          {slide?.headline || 'BUSINESS PLAN\n2026 – 2029'}
        </h1>
        <div className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-200">
            {slide?.presenter || 'PREPARED FOR BOARD & INVESTORS'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/15 pt-2 z-20">
        <span>{slide?.footer || 'Regaarder Corporation'}</span>
        <span>Contact: exec@regaarder.com</span>
      </div>
    </div>
  );
};

const RenderBusinessPlanCapital = ({ slide }) => {
  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-9 pt-5 pb-4 overflow-hidden">
      <div className="flex flex-col gap-0.5 z-20 max-w-[80%] mb-2">
        <span className="text-[10.5px] font-bold uppercase tracking-widest text-pink-400">
          {slide?.tagline || '09 / CAPITAL ALLOCATION'}
        </span>
        <h1 className="text-[28px] leading-[1.05] font-[900] text-white tracking-tight uppercase whitespace-pre-line">
          {slide?.headline || 'FUNDING ASK & CAPITAL USE'}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3.5 my-auto z-20">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/70 to-slate-900/90 backdrop-blur-xl border border-purple-500/40 flex flex-col justify-between shadow-2xl">
          <div>
            <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">Series A Financing Ask</span>
            <div className="text-[38px] font-[900] text-white tracking-tight leading-none my-1.5">
              {slide?.askAmount || '$6,000,000'}
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed font-normal">
              {slide?.askDesc || 'Series A Equity Financing to accelerate enterprise sales and scale our WASM computational engine.'}
            </p>
          </div>
          <div className="mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[9.5px] font-bold border border-cyan-400/50">⚡ 18-Month Operational Runway</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {[
            { key: 'split1', def: '45% R&D & Core Engine', color: '#00f0ff' },
            { key: 'split2', def: '35% Go-To-Market & Sales', color: '#a855f7' },
            { key: 'split3', def: '12% Security & Compliance', color: '#10b981' },
            { key: 'split4', def: '8% Operations & Working Cap', color: '#f59e0b' }
          ].map((sItem, sIdx) => (
            <div key={sIdx} className="px-3.5 py-2 rounded-xl bg-zinc-950/80 backdrop-blur-xl border border-white/25 flex items-center justify-between shadow-lg">
              <span className="text-[11.5px] font-bold text-white">
                {slide?.[sItem.key] || sItem.def}
              </span>
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: sItem.color }} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-white/15 pt-1.5 z-20">
        <span>{slide?.footer || 'Regaarder Corporation'}</span>
        <span>Contact: exec@regaarder.com</span>
      </div>
    </div>
  );
};

const RenderGenericFallbackSlide = ({ slide }) => {
  const headline = slide?.headline || slide?.title || 'Presentation Slide';
  const tagline = slide?.tagline || slide?.section || '';
  const blurb = slide?.blurb || slide?.marketDesc || '';

  return (
    <div className="flex flex-col justify-between h-full w-full relative z-10 px-8 py-6 select-none">
      <div className="flex items-center justify-start z-20">
        {tagline && (
          <span className="text-[12px] italic text-slate-300 font-serif tracking-wide">
            {tagline}
          </span>
        )}
      </div>

      <div className="my-auto z-20 max-w-[85%]">
        <h1 className="text-[40px] font-[900] tracking-tight text-white uppercase whitespace-pre-line leading-[1.05] mb-3">
          {headline}
        </h1>
        {blurb && (
          <p className="text-[13px] text-slate-300 leading-relaxed font-sans line-clamp-3">
            {blurb}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2 z-20">
        <span>{slide?.footer || 'Regaarder Corporation'}</span>
        <span className="font-mono">16:9 Widescreen</span>
      </div>
    </div>
  );
};

// ── Root Virtual Scaled Canvas Component ─────────────────────────────────────
export const SlideDeckExactCanvas = ({ slide, index = 0 }) => {
  const layout = slide?.layoutStyle || slide?.title || '';
  const bgColor = slide?.backgroundColor || '#05070B';

  const renderLayoutContent = () => {
    if (layout === 'Startup Pitch Deck' || layout === 'Startup Cover' || slide?.title === 'Startup Pitch Deck') {
      return <RenderStartupCover slide={slide} />;
    }
    if (layout === 'Business Plan Cover' || slide?.title === 'Business Plan Cover') {
      return <RenderBusinessPlanCover slide={slide} />;
    }
    if (layout === "Startup Today's Agenda" || layout === "Startup Agenda" || slide?.title === "Today's Agenda") {
      return <RenderStartupAgenda slide={slide} />;
    }
    if (layout === "Startup Introduction" || layout === "Startup Intro" || slide?.title === "Introduction") {
      return <RenderStartupIntro slide={slide} />;
    }
    if (layout === "Startup Problem Statement" || layout === "Startup Problem" || slide?.title === "Problem Statement") {
      return <RenderStartupProblem slide={slide} />;
    }
    if (layout === "Startup Innovative Solutions" || layout === "Startup Solutions" || layout === "Our Innovative Solutions" || slide?.title === "Our Innovative Solutions") {
      return <RenderStartupSolutions slide={slide} />;
    }
    if (layout === "Startup Size of Market" || layout === "Startup Market Size" || layout === "Size of Market" || slide?.title === "Size of Market") {
      return <RenderStartupMarket slide={slide} />;
    }
    if (layout === "Startup Competitor Analysis" || layout === "Startup Competitors" || layout === "Key Competitors Advantage" || slide?.title === "Key Competitors Advantage") {
      return <RenderStartupCompetitors slide={slide} />;
    }
    if (layout === "Startup Timeline" || layout === "Startup Accomplishments" || layout === "Accomplishments" || slide?.title === "Accomplishments & Roadmap" || slide?.title === "Accomplishments") {
      return <RenderStartupTimeline slide={slide} />;
    }
    if (layout === "Startup Use of Funds" || layout === "Use of Funds" || layout === "Startup Capital Allocation" || slide?.title === "Use of Funds & Capital Allocation" || slide?.title === "Use of Funds") {
      return <RenderStartupFunds slide={slide} />;
    }
    if (layout === "Startup Team" || layout === "Startup Meet the Team" || layout === "Meet the Team" || slide?.title === "Leadership & Team" || slide?.title === "Meet the Team") {
      return <RenderStartupTeam slide={slide} />;
    }
    if (layout === "Startup Thank You" || layout === "Startup Outro" || layout === "Thank You" || slide?.title === "Thank You & Contact" || slide?.title === "Thank You") {
      return <RenderStartupThankYou slide={slide} />;
    }
    if (layout === 'Business Plan Capital' || slide?.title === 'Funding Ask') {
      return <RenderBusinessPlanCapital slide={slide} />;
    }
    return <RenderGenericFallbackSlide slide={slide} />;
  };

  return (
    <div
      style={{
        width: 820,
        height: 461.25,
        backgroundColor: bgColor
      }}
      className="relative overflow-hidden pointer-events-none select-none"
    >
      <SlideDeckExactVectorBackground slide={slide} />
      {renderLayoutContent()}
    </div>
  );
};

export default SlideDeckExactCanvas;
