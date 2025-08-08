import React from "react";

function hashToHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export default function PlayerAvatar({ name = "Guest", onClick }) {
  const hue = hashToHue(name || "Guest");
  const shirt = `hsl(${(hue + 210) % 360} 70% 55%)`;
  const chair = `hsl(${(hue + 30) % 360} 15% 35%)`;
  const hair = `hsl(${(hue + 300) % 360} 25% 20%)`;

  return (
    <div
      role="button"
      onClick={onClick}
      className="relative w-[18rem] h-[18rem] mx-auto select-none cursor-pointer group"
      title="Click to continue"
    >
      <svg viewBox="0 0 220 220" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
        <defs>
          <radialGradient id="glow" cx="60%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.35" />
          </filter>
        </defs>
        <rect x="0" y="0" width="220" height="220" fill="url(#glow)" />
        <rect x="0" y="170" width="220" height="18" fill="#cbd5e1" />
        <g filter="url(#shadow)">
          <rect x="120" y="76" width="78" height="52" rx="7" fill="#1f2937" />
          <rect x="125" y="81" width="68" height="42" rx="5" className="fill-slate-900 animate-pulse" />
          <rect x="38" y="84" width="70" height="44" rx="6" fill="#111827" />
          <rect x="42" y="88" width="62" height="36" rx="4" className="fill-slate-900 animate-pulse" />
        </g>
        <rect x="25" y="112" width="18" height="48" rx="4" fill={chair} />
        <path d="M66 56 q18 -18 36 0 v10 h-36 z" fill={hair} />
        <circle cx="84" cy="68" r="20" fill="#fcd34d" />
        <g>
          <rect x="74" y="66" width="6" height="2" className="fill-slate-900 animate-[blink_4s_infinite]" />
          <rect x="92" y="66" width="6" height="2" className="fill-slate-900 animate-[blink_4s_infinite_0.2s]" />
        </g>
        <path d="M78 77 q6 5 12 0" stroke="#7c2d12" strokeWidth="2" fill="none" />
        <rect x="64" y="88" width="40" height="46" rx="10" fill={shirt} />
        <g className="origin-[84px_122px] animate-[tap_0.6s_ease-in-out_infinite]">
          <rect x="56" y="112" width="28" height="10" rx="5" fill="#fcd34d" />
        </g>
        <g className="origin-[98px_122px] animate-[tap2_0.6s_ease-in-out_infinite]">
          <rect x="84" y="112" width="28" height="10" rx="5" fill="#fcd34d" />
        </g>
        <rect x="102" y="156" width="60" height="10" rx="4" fill="#94a3b8" />
        <g>
          <rect x="168" y="156" width="14" height="10" rx="2" fill="#e5e7eb" />
          <rect x="180" y="158" width="4" height="6" rx="1" fill="#e5e7eb" />
          <path d="M172 152 q2 -6 6 0" stroke="#e5e7eb" strokeWidth="1.5" fill="none" className="animate-[steam_2.5s_ease-in-out_infinite]" />
        </g>
      </svg>
      <div className="absolute -bottom-4 inset-x-0 text-center text-xs tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
        Click your trader to continue
      </div>
      <style>{`
        @keyframes tap { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(12deg); } }
        @keyframes tap2 { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-12deg); } }
        @keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 94%, 98% { transform: scaleY(0.1); } }
        @keyframes steam { 0% { opacity: .3; transform: translateY(0); } 50% { opacity: .8; } 100% { opacity: 0; transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}
