'use client';

import React, { useId } from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 36,
}) => {
  const uid = useId().replace(/:/g, '');
  const cyanId = `cyanOrbit-${uid}`;
  const magentaId = `magentaOrbit-${uid}`;
  const goldId = `vertexGold-${uid}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 512 512"
        width={size}
        height={size}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={cyanId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
          <linearGradient id={magentaId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF0055" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF700" />
            <stop offset="100%" stopColor="#FF9900" />
          </linearGradient>
        </defs>

        {/* Pure-Geometry Hard Neobrutalist Offset Backing Plate */}
        <rect
          x="48"
          y="48"
          width="440"
          height="440"
          rx="92"
          fill="#00E5FF"
          stroke="#000000"
          strokeWidth="16"
        />

        {/* Main Obsidian Plate */}
        <rect
          x="24"
          y="24"
          width="440"
          height="440"
          rx="92"
          fill="#0A0F1C"
          stroke="#000000"
          strokeWidth="18"
        />

        {/* Inner Ring Field */}
        <circle cx="244" cy="244" r="158" fill="#060911" stroke="#1E293B" strokeWidth="10" />
        <circle
          cx="244"
          cy="244"
          r="144"
          fill="none"
          stroke="#00E5FF"
          strokeWidth="6"
          strokeOpacity="0.35"
        />

        {/* Quadrupole Magnet Anchors */}
        <rect x="224" y="42" width="40" height="28" rx="6" fill="#FFE600" stroke="#000000" strokeWidth="8" />
        <rect x="224" y="418" width="40" height="28" rx="6" fill="#FFE600" stroke="#000000" strokeWidth="8" />
        <rect x="42" y="224" width="28" height="40" rx="6" fill="#FFE600" stroke="#000000" strokeWidth="8" />
        <rect x="418" y="224" width="28" height="40" rx="6" fill="#FFE600" stroke="#000000" strokeWidth="8" />

        {/* Interlocking Collider Orbitals (Forming Bold Geometric X) */}
        <g transform="rotate(45 244 244)">
          <ellipse cx="244" cy="244" rx="164" ry="62" fill="none" stroke="#000000" strokeWidth="40" />
          <ellipse cx="244" cy="244" rx="164" ry="62" fill="none" stroke={`url(#${cyanId})`} strokeWidth="24" />
        </g>

        <g transform="rotate(-45 244 244)">
          <ellipse cx="244" cy="244" rx="164" ry="62" fill="none" stroke="#000000" strokeWidth="40" />
          <ellipse cx="244" cy="244" rx="164" ry="62" fill="none" stroke={`url(#${magentaId})`} strokeWidth="24" />
        </g>

        {/* Radiating Collision Spark */}
        <path
          d="M 244 152 L 266 222 L 336 244 L 266 266 L 244 336 L 222 266 L 152 244 L 222 222 Z"
          fill={`url(#${goldId})`}
          stroke="#000000"
          strokeWidth="10"
          strokeLinejoin="round"
        />

        {/* Singularity Core */}
        <circle cx="244" cy="244" r="30" fill="#FFFFFF" stroke="#000000" strokeWidth="10" />
        <circle cx="244" cy="244" r="12" fill="#00E5FF" />
      </svg>
    </div>
  );
};
