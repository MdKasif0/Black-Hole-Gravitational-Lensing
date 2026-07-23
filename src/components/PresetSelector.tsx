import React from 'react';
import { SIMULATION_PRESETS } from '../physics/presets';
import type { SimulationPreset, BlackHoleParams } from '../types/simulator';
import { Sparkles, Zap } from 'lucide-react';

interface PresetSelectorProps {
  currentParams: BlackHoleParams;
  onSelectPreset: (preset: SimulationPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
        <Sparkles className="h-4 w-4 text-cyan-400" />
        <span>Astrophysical Presets</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SIMULATION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className="group flex flex-col items-start rounded-lg border border-cyan-500/20 bg-slate-900/60 p-2.5 text-left transition hover:border-cyan-500/60 hover:bg-cyan-950/40"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                {preset.name}
              </span>
              <Zap className="h-3 w-3 text-cyan-500/40 transition group-hover:text-cyan-400" />
            </div>
            <span className="text-[10px] text-cyan-400/70">{preset.subtitle}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
