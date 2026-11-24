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
        <div className="flex items-center gap-2.5 px-4 py-2 border-3 border-black bg-black text-cern-cyan text-xs font-mono font-bold shadow-[4px_4px_0px_#00E5FF] uppercase tracking-wider">
          <span className="w-2.5 h-2.5 bg-cern-cyan animate-pulse border border-black shadow-[1px_1px_0px_#000]" />
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
