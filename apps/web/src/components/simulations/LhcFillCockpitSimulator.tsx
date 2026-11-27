'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { calculateLhcFillCycle } from '@cern-x/sim-core';
import { FidelityBadge } from '@/components/provenance/FidelityBadge';
import { Eli5Card } from '@/components/ui/Eli5Card';
import { MathFormula } from '@/components/ui/MathFormula';
import { useGlobalStore } from '@/lib/store';
import { Play, Pause, ShieldAlert, Zap, Activity } from 'lucide-react';

export const LhcFillCockpitSimulator: React.FC = () => {
  const reduceMotion = useGlobalStore((s) => s.reduceMotion);
  const [hoursElapsed, setHoursElapsed] = useState<number>(4.5);
  const [levelCapE34, setLevelCapE34] = useState<number>(2.0);
  const [bunches, setBunches] = useState<number>(2748);
  const [intensityE11, setIntensityE11] = useState<number>(1.2);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  useEffect(() => {
    if (!isStreaming || reduceMotion) return;
    const id = setInterval(() => {
      setHoursElapsed((h) => {
        const nxt = h + 0.15;
        if (nxt >= 12.2) {
          setIsStreaming(false);
          return 12.0;
        }
        return nxt;
      });
    }, 80);
    return () => clearInterval(id);
  }, [isStreaming, reduceMotion]);

  const fillState = useMemo(
    () => calculateLhcFillCycle(hoursElapsed, bunches, intensityE11, 6800, 2.35, levelCapE34, 12.0),
    [hoursElapsed, bunches, intensityE11, levelCapE34]
  );

  // Sample 12h curve points for SVG burn-off graph
  const curveSamples = useMemo(() => {
    const pts: { h: number; leveled: number; raw: number }[] = [];
    for (let h = 0; h <= 12; h += 0.25) {
      const st = calculateLhcFillCycle(h, bunches, intensityE11, 6800, 2.35, levelCapE34, 12.0);
      const rawSt = calculateLhcFillCycle(h, bunches, intensityE11, 6800, 2.35, 10.0, 12.0);
      pts.push({ h, leveled: st.instantaneousLumiE34, raw: rawSt.instantaneousLumiE34 });
    }
    return pts;
  }, [bunches, intensityE11, levelCapE34]);

  const triggerEmergencyDump = () => {
    setIsStreaming(false);
    setHoursElapsed(12.0);
  };

  return (
    <div className="space-y-5">
      <Eli5Card
        title="24-Hour Shift Inside CERN Control Centre: Injection, Ramp, Leveling & Dump!"
        analogy="Operators don't just flip an ON switch! Every LHC physics shift follows a delicate 12-hour ballet: first fill the ring at low energy (Injection), ramp magnets smoothly for 30 minutes to 6.8 TeV, squeeze beams smaller than a hair (Squeeze), harvest Stable Beams for hours—then safely fire the 362-Megajoule beam (enough to melt 500 kg of solid copper!) into a giant graphite dump block!"
        keyPoints={[
          'Luminosity Leveling: Operators deliberately cap peak brightness early so pile-up does not overwhelm detectors.',
          'Beam Dump (TDE): Fast kicker magnets extract the entire beam in 89 microseconds onto a 7-meter water-cooled carbon cylinder.',
        ]}
        whatToTry="Press 'Stream 12h Shift' to watch the Fill advance from Injection → Ramp → Stable Beams, or hit 'EMERGENCY BEAM DUMP'!"
        doi="10.1103/PhysRevAccelBeams.22.011001"
        citationLabel="LHC Run 2 & Run 3 Luminosity Leveling & Machine Protection"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5 bg-canvas-sub border-3 border-black shadow-[6px_6px_0px_#000]">
        {/* Left Controls */}
        <div className="xl:col-span-4 space-y-4 bg-canvas-surface border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="text-xs font-mono font-black uppercase text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cern-cyan" /> Shift Fill Timeline
            </h3>
            <FidelityBadge type="ANALYTIC" />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Fill Clock:</span>
              <span className="text-cern-cyan">{hoursElapsed.toFixed(1)} / 12.0 hours</span>
            </div>
            <input
              type="range"
              min={0}
              max={12.0}
              step={0.1}
              value={hoursElapsed}
              onChange={(e) => {
                setIsStreaming(false);
                setHoursElapsed(Number(e.target.value));
              }}
              className="w-full accent-cern-cyan cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Luminosity Level Cap:</span>
              <span className="text-[#FFE600]">{levelCapE34.toFixed(2)} × 10³⁴</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={2.4}
              step={0.05}
              value={levelCapE34}
              onChange={(e) => setLevelCapE34(Number(e.target.value))}
              className="w-full accent-[#FFE600] cursor-pointer"
            />
          </div>

          <div className="p-3 bg-canvas-sub border-2 border-black space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">Bunches per Beam:</span>
              <span className="text-white">{bunches}</span>
            </div>
            <input
              type="range"
              min={400}
              max={2808}
              step={100}
              value={bunches}
              onChange={(e) => setBunches(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (hoursElapsed >= 11.8) setHoursElapsed(0);
                setIsStreaming(!isStreaming);
              }}
              className="py-2.5 bg-cern-blue hover:bg-cern-accent text-white text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1"
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Shift' : 'Stream 12h Shift'}</span>
            </button>

            <button
              type="button"
              onClick={triggerEmergencyDump}
              className="py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>BEAM DUMP</span>
            </button>
          </div>

          <MathFormula
            tex="E_{\text{beam}} = k\,N_b\,E_p\,e \approx 362\text{ MJ}"
            label="Single-Beam Stored Energy:"
          />
        </div>

        {/* Right Telemetry + Burn-Off Curve */}
        <div className="xl:col-span-8 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">CCC Machine Mode</span>
              <strong
                className={`text-sm ${
                  fillState.phase === 'STABLE_BEAMS'
                    ? 'text-emerald-400'
                    : fillState.phase === 'DUMP'
                    ? 'text-red-400'
                    : 'text-[#FFE600]'
                }`}
              >
                {fillState.phase.replace('_', ' ')}
              </strong>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Stored Energy / Beam</span>
              <strong className="text-cern-magenta text-sm">{fillState.storedEnergyBeamMJ.toFixed(1)} MJ</strong>
              <span className="text-[9px] text-text-muted block">
                ≈ {fillState.copperMeltEquivalentKg.toFixed(0)} kg Cu melt
              </span>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Instant Luminosity</span>
              <strong className="text-cern-cyan text-sm">{fillState.instantaneousLumiE34.toFixed(2)} × 10³⁴</strong>
            </div>

            <div className="p-3 bg-canvas-surface border-2 border-black">
              <span className="text-[10px] text-text-muted block uppercase">Fill Integrated L</span>
              <strong className="text-[#FFE600] text-sm">{fillState.integratedLumiPbInv.toFixed(0)} pb⁻¹</strong>
            </div>
          </div>

          {/* Interactive SVG Fill Burn-off Curve */}
          <div className="bg-canvas border-2 border-black p-4 shadow-[4px_4px_0px_#000] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono border-b-2 border-black pb-2">
              <span className="font-bold text-white uppercase flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" /> 12-Hour Luminosity Leveling &amp; Burn-Off Curve
              </span>
              <span className="text-[10px] text-text-muted">Cyan: Leveled Delivery · Dashed: Unlevelled Peak</span>
            </div>

            <svg viewBox="0 0 560 220" className="w-full h-56 bg-[#050811] border border-black">
              {/* Unlevelled Dashed Reference Curve */}
              <path
                d={curveSamples
                  .map((p, idx) => {
                    const x = 35 + (p.h / 12) * 505;
                    const y = 195 - (p.raw / 2.6) * 165;
                    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#64748B"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />

              {/* Leveled Curve */}
              <path
                d={curveSamples
                  .map((p, idx) => {
                    const x = 35 + (p.h / 12) * 505;
                    const y = 195 - (p.leveled / 2.6) * 165;
                    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#00E5FF"
                strokeWidth="3"
              />

              {/* Live Time Marker Line */}
              <line
                x1={35 + (hoursElapsed / 12) * 505}
                y1={18}
                x2={35 + (hoursElapsed / 12) * 505}
                y2={195}
                stroke="#FFE600"
                strokeWidth="2"
              />
              <circle
                cx={35 + (hoursElapsed / 12) * 505}
                cy={195 - (fillState.instantaneousLumiE34 / 2.6) * 165}
                r="6"
                fill="#FF0055"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text x="40" y="212" fill="#94A3B8" fontSize="10" fontFamily="monospace">0h (Inject)</text>
              <text x="115" y="212" fill="#94A3B8" fontSize="10" fontFamily="monospace">1.3h (Stable Beams Start)</text>
              <text x="475" y="212" fill="#94A3B8" fontSize="10" fontFamily="monospace">12h (Dump)</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
