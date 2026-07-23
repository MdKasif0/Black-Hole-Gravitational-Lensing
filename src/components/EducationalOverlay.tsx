import React from 'react';
import type { BlackHoleParams, TelemetryData } from '../types/simulator';
import { calculateKerrRadii } from '../physics/kerrMetric';
import { Info, Gauge, Activity, Cpu, Layers, Disc, CircleDot, Orbit, Radio } from 'lucide-react';

interface EducationalOverlayProps {
  params: BlackHoleParams;
  telemetry: TelemetryData | null;
  onOpenPhysicsModal: () => void;
}

export const EducationalOverlay: React.FC<EducationalOverlayProps> = ({
  params,
  telemetry,
  onOpenPhysicsModal,
}) => {
  const radii = calculateKerrRadii(params.mass, params.spin);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-5 font-mono text-xs text-cyan-300 select-none">
      {/* Top Header Bar: Telemetry & Astrophysics Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl glass-panel p-3.5 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-950/60 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse-glow">
            <Orbit className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-widest text-slate-100 uppercase text-glow-cyan">
                Kerr Gravitational Lensing Simulator
              </h1>
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 text-[9px] font-semibold text-emerald-400">
                <Radio className="h-2.5 w-2.5 animate-pulse" /> GR Engine Active
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80">
              General Relativity • Null Geodesic Ray Marching • {params.mode === 'kerr' ? `Kerr (a = ${params.spin.toFixed(3)})` : 'Schwarzschild (a = 0)'}
            </p>
          </div>
        </div>

        {/* Real-time Performance Telemetry */}
        {params.showTelemetry && telemetry && (
          <div className="pointer-events-auto flex items-center gap-4 rounded-xl border border-cyan-500/30 bg-slate-950/60 px-3.5 py-1.5 text-[11px] backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>FPS: <strong className="text-emerald-400 text-glow-cyan">{telemetry.fps}</strong></span>
            </div>
            <div className="h-3.5 w-px bg-cyan-500/30" />
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>Scale: <strong className="text-cyan-300">{Math.round(telemetry.resolutionScale * 100)}%</strong></span>
            </div>
            <div className="h-3.5 w-px bg-cyan-500/30" />
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>Steps: <strong className="text-amber-300 text-glow-amber">{telemetry.stepCount}</strong></span>
            </div>
          </div>
        )}

        <button
          onClick={onOpenPhysicsModal}
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3.5 py-2 text-xs font-semibold text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-900/60 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          <Info className="h-4 w-4 text-cyan-400" />
          <span>GR Physics Guide</span>
        </button>
      </div>

      {/* Center 2D Critical Radii HUD Rings Overlay */}
      {params.showCriticalRadii && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="h-[520px] w-[520px] opacity-80 overflow-visible">
            {/* Event Horizon Circle */}
            <circle
              cx="260"
              cy="260"
              r={radii.rPlus * 21}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.8"
              strokeDasharray="4 2"
              className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />
            {/* Photon Sphere Circle */}
            <circle
              cx="260"
              cy="260"
              r={radii.rPh * 21}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.8"
              className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            />
            {/* Ergosphere Circle */}
            <circle
              cx="260"
              cy="260"
              r={radii.rErgoEquator * 21}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="6 4"
              className="drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]"
            />
            {/* ISCO Circle */}
            <circle
              cx="260"
              cy="260"
              r={radii.rIsco * 21}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            />

            {/* Labels */}
            <text x={265 + radii.rPlus * 21} y="255" fill="#ef4444" fontSize="10" fontWeight="bold">
              r+ Horizon ({radii.rPlus.toFixed(2)}M)
            </text>
            <text x={265 + radii.rPh * 21} y="240" fill="#f59e0b" fontSize="10" fontWeight="bold">
              r_ph Photon Ring ({radii.rPh.toFixed(2)}M)
            </text>
            <text x={265 + radii.rIsco * 21} y="270" fill="#10b981" fontSize="10" fontWeight="bold">
              r_isco ISCO ({radii.rIsco.toFixed(2)}M)
            </text>
          </svg>
        </div>
      )}

      {/* Bottom Telemetry & Critical Radii Readout Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl glass-panel p-3.5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-5 text-[11px]">
          <div className="flex items-center gap-1.5 text-red-400" title="Event Horizon radius r_plus = M + sqrt(M^2 - a^2)">
            <CircleDot className="h-3.5 w-3.5" />
            <span>r+ Horizon: <strong className="text-red-300">{radii.rPlus.toFixed(3)} M</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400" title="Photon sphere radius where light orbits unstable circular geodesics">
            <Orbit className="h-3.5 w-3.5" />
            <span>r_ph Photon Ring: <strong className="text-amber-300">{radii.rPh.toFixed(3)} M</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400" title="Innermost Stable Circular Orbit for accretion disk inner boundary">
            <Disc className="h-3.5 w-3.5" />
            <span>r_isco ISCO: <strong className="text-emerald-300">{radii.rIsco.toFixed(3)} M</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400" title="Ergosphere boundary where frame-dragging forces light to co-rotate">
            <Gauge className="h-3.5 w-3.5" />
            <span>r_ergo Ergosphere: <strong className="text-cyan-300">{radii.rErgoEquator.toFixed(3)} M</strong></span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 tracking-wide">
          Left Drag: Orbit View • Scroll: Smooth Zoom • Double Click: Reset View
        </div>
      </div>
    </div>
  );
};
