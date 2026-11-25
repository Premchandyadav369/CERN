'use client';

import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 36,
  glow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-[2px_2px_0px_#000]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="logoCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.4"/>
            <stop offset="50%" stop-color="#7C3AED" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#0B0F17" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="logoBeamCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00E5FF"/>
            <stop offset="100%" stop-color="#0053A0"/>
          </linearGradient>
          <linearGradient id="logoBeamMagenta" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#F43F5E"/>
            <stop offset="100%" stop-color="#A855F7"/>
          </linearGradient>
          <linearGradient id="logoGoldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF500"/>
            <stop offset="100%" stop-color="#FF9900"/>
          </linearGradient>
        </defs>

        {/* Outer Square Shield */}
        <rect
          x="32"
          y="32"
          width="448"
          height="448"
          rx="88"
          fill="#0D111A"
          stroke="#000000"
          strokeWidth="20"
        />

        {/* Glow */}
        {glow && <circle cx="256" cy="256" r="190" fill="url(#logoCoreGlow)" />}

        {/* Outer Detector Tracks */}
        <circle
          cx="256"
          cy="256"
          r="170"
          fill="none"
          stroke="#2A374A"
          strokeWidth="7"
          strokeDasharray="14 10"
        />

        {/* Magnets */}
        <rect x="236" y="52" width="40" height="32" rx="6" fill="#FFE500" stroke="#000000" strokeWidth="8"/>
        <rect x="236" y="428" width="40" height="32" rx="6" fill="#FFE500" stroke="#000000" strokeWidth="8"/>
        <rect x="52" y="236" width="32" height="40" rx="6" fill="#FFE500" stroke="#000000" strokeWidth="8"/>
        <rect x="428" y="236" width="32" height="40" rx="6" fill="#FFE500" stroke="#000000" strokeWidth="8"/>

        {/* Particle Beams */}
        <path
          d="M 136 256 A 120 120 0 1 1 376 256"
          fill="none"
          stroke="url(#logoBeamCyan)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M 376 256 A 120 120 0 1 1 136 256"
          fill="none"
          stroke="url(#logoBeamMagenta)"
          strokeWidth="22"
          strokeLinecap="round"
        />

        {/* Inner Pixel Ring */}
        <circle
          cx="256"
          cy="256"
          r="82"
          fill="#080C14"
          stroke="#00E5FF"
          strokeWidth="6"
          strokeDasharray="8 6"
        />

        {/* Collision Jet Tracks */}
        <line x1="256" y1="256" x2="390" y2="122" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" strokeDasharray="16 8"/>
        <circle cx="390" cy="122" r="8" fill="#00E5FF" stroke="#000000" strokeWidth="4"/>

        <line x1="256" y1="256" x2="122" y2="390" stroke="#A855F7" strokeWidth="8" strokeLinecap="round" strokeDasharray="16 8"/>
        <circle cx="122" cy="390" r="8" fill="#A855F7" stroke="#000000" strokeWidth="4"/>

        <line x1="256" y1="256" x2="380" y2="350" stroke="#FFE500" strokeWidth="7" strokeLinecap="round"/>
        <line x1="256" y1="256" x2="135" y2="135" stroke="#F43F5E" strokeWidth="7" strokeLinecap="round" strokeDasharray="8 6"/>

        {/* Collision Vertex Flash */}
        <path
          d="M 256 196 L 268 244 L 316 256 L 268 268 L 256 316 L 244 268 L 196 256 L 244 244 Z"
          fill="url(#logoGoldGlow)"
          stroke="#000000"
          strokeWidth="6"
        />
        <circle cx="256" cy="256" r="22" fill="#FFFFFF" stroke="#000000" strokeWidth="6"/>
        <circle cx="256" cy="256" r="10" fill="#FFE500"/>

        {/* Crosshair accents */}
        <path d="M 72 92 L 92 92 M 92 72 L 92 92" stroke="#00E5FF" strokeWidth="5" strokeLinecap="square"/>
        <path d="M 440 92 L 420 92 M 420 72 L 420 92" stroke="#00E5FF" strokeWidth="5" strokeLinecap="square"/>
        <path d="M 72 420 L 92 420 M 92 440 L 92 420" stroke="#00E5FF" strokeWidth="5" strokeLinecap="square"/>
        <path d="M 440 420 L 420 420 M 420 440 L 420 420" stroke="#00E5FF" strokeWidth="5" strokeLinecap="square"/>
      </svg>
    </div>
  );
};
