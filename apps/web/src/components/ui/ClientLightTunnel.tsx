'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { LightTunnelProps } from './LightTunnel';

const DynamicLightTunnel = dynamic(
  () => import('./LightTunnel').then((mod) => mod.LightTunnel),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full flex items-center justify-center bg-canvas"
        style={{
          background:
            'radial-gradient(circle at center, rgba(0, 229, 255, 0.08) 0%, rgba(0, 51, 160, 0.15) 40%, rgba(6, 10, 18, 0.95) 80%, #060a12 100%)',
        }}
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas-surface/80 border border-cern-cyan/30 text-cern-cyan text-xs font-mono shadow-lg backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cern-cyan animate-pulse" />
          <span>INITIALIZING BEAMLINE OPTICS...</span>
        </div>
      </div>
    ),
  }
);

export const ClientLightTunnel: React.FC<LightTunnelProps> = (props) => {
  return <DynamicLightTunnel {...props} />;
};

export default ClientLightTunnel;
