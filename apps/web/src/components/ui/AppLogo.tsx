'use client';

import React, { useId } from 'react';

export type PartonLogoVariant = 'full' | 'minimal' | 'monochrome';

interface AppLogoProps {
  className?: string;
  size?: number;
  variant?: PartonLogoVariant;
}

/**
 * Generates a standalone downloadable SVG markup string for PARTON brand marks.
 */
export function buildPartonSvgMarkup(variant: PartonLogoVariant = 'full'): string {
  if (variant === 'minimal') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="partonSimpleBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D1526"/>
      <stop offset="100%" stop-color="#05080F"/>
    </linearGradient>
    <linearGradient id="partonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF"/>
      <stop offset="100%" stop-color="#0077FF"/>
    </linearGradient>
  </defs>
  <rect x="28" y="28" width="456" height="456" rx="108" fill="url(#partonSimpleBg)" stroke="#00E5FF" stroke-width="24"/>
  <circle cx="256" cy="256" r="154" fill="none" stroke="#1E293B" stroke-width="24"/>
  <circle cx="256" cy="256" r="154" fill="none" stroke="url(#partonCyan)" stroke-width="10" stroke-dasharray="620 120" stroke-linecap="round"/>
  <polygon points="256,128 367,320 145,320" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linejoin="round" stroke-opacity="0.92"/>
  <circle cx="256" cy="252" r="34" fill="#FFFFFF" stroke="#000000" stroke-width="12"/>
  <circle cx="256" cy="252" r="14" fill="#00E5FF"/>
  <circle cx="256" cy="128" r="34" fill="#00E5FF" stroke="#000000" stroke-width="12"/>
  <circle cx="367" cy="320" r="34" fill="#FFE600" stroke="#000000" stroke-width="12"/>
  <circle cx="145" cy="320" r="34" fill="#FF0055" stroke="#000000" stroke-width="12"/>
</svg>`;
  }

  if (variant === 'monochrome') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect x="28" y="28" width="456" height="456" rx="96" fill="#05080F" stroke="#FFFFFF" stroke-width="20"/>
  <circle cx="256" cy="256" r="154" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-opacity="0.45"/>
  <polygon points="256,124 370,322 142,322" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linejoin="round"/>
  <circle cx="256" cy="252" r="28" fill="#FFFFFF"/>
  <circle cx="256" cy="124" r="30" fill="#05080F" stroke="#FFFFFF" stroke-width="14"/>
  <circle cx="370" cy="322" r="30" fill="#05080F" stroke="#FFFFFF" stroke-width="14"/>
  <circle cx="142" cy="322" r="30" fill="#05080F" stroke="#FFFFFF" stroke-width="14"/>
</svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="partonCyanArc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF"/>
      <stop offset="100%" stop-color="#0055FF"/>
    </linearGradient>
    <linearGradient id="partonMagentaArc" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF0055"/>
      <stop offset="100%" stop-color="#9333EA"/>
    </linearGradient>
    <linearGradient id="partonVertexGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF700"/>
      <stop offset="100%" stop-color="#FF9500"/>
    </linearGradient>
  </defs>
  <rect x="48" y="48" width="440" height="440" rx="92" fill="#00E5FF" stroke="#000000" stroke-width="16"/>
  <rect x="24" y="24" width="440" height="440" rx="92" fill="#090E1A" stroke="#000000" stroke-width="18"/>
  <circle cx="244" cy="244" r="162" fill="#05080F" stroke="#1E293B" stroke-width="10"/>
  <circle cx="244" cy="244" r="148" fill="none" stroke="url(#partonCyanArc)" stroke-width="7" stroke-opacity="0.45"/>
  <rect x="226" y="40" width="36" height="24" rx="5" fill="#FFE600" stroke="#000000" stroke-width="7"/>
  <rect x="226" y="424" width="36" height="24" rx="5" fill="#FFE600" stroke="#000000" stroke-width="7"/>
  <rect x="40" y="226" width="24" height="36" rx="5" fill="#FFE600" stroke="#000000" stroke-width="7"/>
  <rect x="424" y="226" width="24" height="36" rx="5" fill="#FFE600" stroke="#000000" stroke-width="7"/>
  <g transform="rotate(30 244 244)">
    <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke="#000000" stroke-width="32"/>
    <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke="url(#partonCyanArc)" stroke-width="16"/>
  </g>
  <g transform="rotate(-30 244 244)">
    <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke="#000000" stroke-width="32"/>
    <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke="url(#partonMagentaArc)" stroke-width="16"/>
  </g>
  <polygon points="244,116 355,308 133,308" fill="none" stroke="#000000" stroke-width="26" stroke-linejoin="round"/>
  <polygon points="244,116 355,308 133,308" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 244 172 L 260 228 L 316 244 L 260 260 L 244 316 L 228 260 L 172 244 L 228 228 Z" fill="url(#partonVertexGold)" stroke="#000000" stroke-width="9" stroke-linejoin="round"/>
  <circle cx="244" cy="244" r="24" fill="#FFFFFF" stroke="#000000" stroke-width="9"/>
  <circle cx="244" cy="244" r="10" fill="#00E5FF"/>
  <circle cx="244" cy="116" r="26" fill="#00E5FF" stroke="#000000" stroke-width="9"/>
  <circle cx="355" cy="308" r="26" fill="#FFE600" stroke="#000000" stroke-width="9"/>
  <circle cx="133" cy="308" r="26" fill="#FF0055" stroke="#000000" stroke-width="9"/>
</svg>`;
}

/**
 * PARTON inline SVG mark supporting Full Collider Emblem, Simple App Icon, and Monochrome variants.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 36,
  variant = 'full',
}) => {
  const uid = useId().replace(/:/g, '');
  const cyanId = `partonCyanArc-${uid}`;
  const magentaId = `partonMagentaArc-${uid}`;
  const goldId = `partonVertexGold-${uid}`;
  const simpleBgId = `partonSimpleBg-${uid}`;

  if (variant === 'minimal') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 512 512" width={size} height={size} className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id={simpleBgId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D1526" />
              <stop offset="100%" stopColor="#05080F" />
            </linearGradient>
            <linearGradient id={cyanId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0077FF" />
            </linearGradient>
          </defs>
          <rect x="28" y="28" width="456" height="456" rx="108" fill={`url(#${simpleBgId})`} stroke="#00E5FF" strokeWidth="24" />
          <circle cx="256" cy="256" r="154" fill="none" stroke="#1E293B" strokeWidth="24" />
          <circle cx="256" cy="256" r="154" fill="none" stroke={`url(#${cyanId})`} strokeWidth="10" strokeDasharray="620 120" strokeLinecap="round" />
          <polygon points="256,128 367,320 145,320" fill="none" stroke="#FFFFFF" strokeWidth="20" strokeLinejoin="round" strokeOpacity="0.92" />
          <circle cx="256" cy="252" r="34" fill="#FFFFFF" stroke="#000000" strokeWidth="12" />
          <circle cx="256" cy="252" r="14" fill="#00E5FF" />
          <circle cx="256" cy="128" r="34" fill="#00E5FF" stroke="#000000" strokeWidth="12" />
          <circle cx="367" cy="320" r="34" fill="#FFE600" stroke="#000000" strokeWidth="12" />
          <circle cx="145" cy="320" r="34" fill="#FF0055" stroke="#000000" strokeWidth="12" />
        </svg>
      </div>
    );
  }

  if (variant === 'monochrome') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 512 512" width={size} height={size} className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="28" y="28" width="456" height="456" rx="96" fill="#05080F" stroke="#FFFFFF" strokeWidth="20" />
          <circle cx="256" cy="256" r="154" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeOpacity="0.45" />
          <polygon points="256,124 370,322 142,322" fill="none" stroke="#FFFFFF" strokeWidth="18" strokeLinejoin="round" />
          <circle cx="256" cy="252" r="28" fill="#FFFFFF" />
          <circle cx="256" cy="124" r="30" fill="#05080F" stroke="#FFFFFF" strokeWidth="14" />
          <circle cx="370" cy="322" r="30" fill="#05080F" stroke="#FFFFFF" strokeWidth="14" />
          <circle cx="142" cy="322" r="30" fill="#05080F" stroke="#FFFFFF" strokeWidth="14" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 512 512" width={size} height={size} className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id={cyanId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0055FF" />
          </linearGradient>
          <linearGradient id={magentaId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF0055" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF700" />
            <stop offset="100%" stopColor="#FF9500" />
          </linearGradient>
        </defs>

        <rect x="48" y="48" width="440" height="440" rx="92" fill="#00E5FF" stroke="#000000" strokeWidth="16" />
        <rect x="24" y="24" width="440" height="440" rx="92" fill="#090E1A" stroke="#000000" strokeWidth="18" />
        <circle cx="244" cy="244" r="162" fill="#05080F" stroke="#1E293B" strokeWidth="10" />
        <circle cx="244" cy="244" r="148" fill="none" stroke={`url(#${cyanId})`} strokeWidth="7" strokeOpacity="0.45" />

        <rect x="226" y="40" width="36" height="24" rx="5" fill="#FFE600" stroke="#000000" strokeWidth="7" />
        <rect x="226" y="424" width="36" height="24" rx="5" fill="#FFE600" stroke="#000000" strokeWidth="7" />
        <rect x="40" y="226" width="24" height="36" rx="5" fill="#FFE600" stroke="#000000" strokeWidth="7" />
        <rect x="424" y="226" width="24" height="36" rx="5" fill="#FFE600" stroke="#000000" strokeWidth="7" />

        <g transform="rotate(30 244 244)">
          <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke="#000000" strokeWidth="32" />
          <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke={`url(#${cyanId})`} strokeWidth="16" />
        </g>

        <g transform="rotate(-30 244 244)">
          <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke="#000000" strokeWidth="32" />
          <ellipse cx="244" cy="244" rx="154" ry="56" fill="none" stroke={`url(#${magentaId})`} strokeWidth="16" />
        </g>

        <polygon points="244,116 355,308 133,308" fill="none" stroke="#000000" strokeWidth="26" strokeLinejoin="round" />
        <polygon points="244,116 355,308 133,308" fill="none" stroke="#FFFFFF" strokeWidth="12" strokeLinejoin="round" />

        <path
          d="M 244 172 L 260 228 L 316 244 L 260 260 L 244 316 L 228 260 L 172 244 L 228 228 Z"
          fill={`url(#${goldId})`}
          stroke="#000000"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <circle cx="244" cy="244" r="24" fill="#FFFFFF" stroke="#000000" strokeWidth="9" />
        <circle cx="244" cy="244" r="10" fill="#00E5FF" />

        <circle cx="244" cy="116" r="26" fill="#00E5FF" stroke="#000000" strokeWidth="9" />
        <circle cx="355" cy="308" r="26" fill="#FFE600" stroke="#000000" strokeWidth="9" />
        <circle cx="133" cy="308" r="26" fill="#FF0055" stroke="#000000" strokeWidth="9" />
      </svg>
    </div>
  );
};
