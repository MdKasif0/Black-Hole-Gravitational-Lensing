import React, { useState } from 'react';
import type { BlackHoleParams, SimulationPreset, QualityMode } from '../types/simulator';
import { PresetSelector } from './PresetSelector';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  params: BlackHoleParams;
  onChangeParams: (newParams: Partial<BlackHoleParams>) => void;
  onSelectPreset: (preset: SimulationPreset) => void;
  onResetParams: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onChangeParams,
  onSelectPreset,
  onResetParams,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'physics' | 'disk' | 'camera' | 'render'>('presets');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`pointer-events-auto absolute top-20 right-4 z-20 flex transition-all duration-300 ${isCollapsed ? 'translate-x-[calc(100%-40px)]' : 'translate-x-0'}`}>
      {/* Collapse Toggle Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex h-10 w-10 items-center justify-center rounded-l-xl border-y border-l border-cyan-500/30 bg-slate-950/90 text-cyan-400 backdrop-blur-md hover:bg-cyan-950 hover:text-white"
        title={isCollapsed ? 'Expand Controls' : 'Collapse Controls'}
      >
        {isCollapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {/* Main Control Panel Drawer */}
      <div className="flex h-[calc(100vh-140px)] max-h-[750px] w-80 flex-col rounded-r-2xl rounded-bl-2xl border border-cyan-500/30 bg-slate-950/90 shadow-2xl backdrop-blur-xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-cyan-500/20 bg-black/40 p-1">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 rounded-lg py-2 text-[11px] font-medium transition ${activeTab === 'presets' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('physics')}
            className={`flex-1 rounded-lg py-2 text-[11px] font-medium transition ${activeTab === 'physics' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Physics
          </button>
          <button
            onClick={() => setActiveTab('disk')}
            className={`flex-1 rounded-lg py-2 text-[11px] font-medium transition ${activeTab === 'disk' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Disk
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 rounded-lg py-2 text-[11px] font-medium transition ${activeTab === 'camera' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Camera
          </button>
          <button
            onClick={() => setActiveTab('render')}
            className={`flex-1 rounded-lg py-2 text-[11px] font-medium transition ${activeTab === 'render' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Quality
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs text-slate-300">
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <PresetSelector currentParams={params} onSelectPreset={onSelectPreset} />
              
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={onResetParams}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 py-2 text-xs text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset to Default Parameters
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICS */}
          {activeTab === 'physics' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="flex justify-between text-xs font-semibold text-slate-200">
                  <span>Metric Mode</span>
                  <span className="text-cyan-400 uppercase font-mono">{params.mode}</span>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onChangeParams({ mode: 'kerr', spin: 0.9 })}
                    className={`rounded-lg border p-2 text-center text-xs transition ${params.mode === 'kerr' ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                  >
                    Kerr (Rotating)
                  </button>
                  <button
                    onClick={() => onChangeParams({ mode: 'schwarzschild', spin: 0.0 })}
                    className={`rounded-lg border p-2 text-center text-xs transition ${params.mode === 'schwarzschild' ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                  >
                    Schwarzschild
                  </button>
                </div>
              </div>

              {/* Mass Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Black Hole Mass (M)</span>
                  <span className="font-mono text-cyan-400">{params.mass.toFixed(1)} M☉</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={params.mass}
                  onChange={(e) => onChangeParams({ mass: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Spin Parameter (a) */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Kerr Spin Parameter (a)</span>
                  <span className="font-mono text-amber-400">{params.spin.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="-0.999"
                  max="0.999"
                  step="0.005"
                  value={params.spin}
                  disabled={params.mode === 'schwarzschild'}
                  onChange={(e) => onChangeParams({ spin: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 disabled:opacity-30"
                />
              </div>

              {/* Relativistic Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-cyan-300">Relativistic Effects</span>
                
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Frame Dragging (Lense-Thirring)</span>
                  <input
                    type="checkbox"
                    checked={params.frameDragging}
                    onChange={(e) => onChangeParams({ frameDragging: e.target.checked })}
                    className="accent-cyan-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Doppler Beaming (g⁴ Boost)</span>
                  <input
                    type="checkbox"
                    checked={params.dopplerBeaming}
                    onChange={(e) => onChangeParams({ dopplerBeaming: e.target.checked })}
                    className="accent-cyan-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Gravitational Redshift</span>
                  <input
                    type="checkbox"
                    checked={params.gravitationalRedshift}
                    onChange={(e) => onChangeParams({ gravitationalRedshift: e.target.checked })}
                    className="accent-cyan-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: ACCRETION DISK */}
          {activeTab === 'disk' && (
            <div className="space-y-4">
              <label className="flex items-center justify-between text-xs cursor-pointer font-semibold text-slate-200">
                <span>Accretion Disk Enabled</span>
                <input
                  type="checkbox"
                  checked={params.diskEnabled}
                  onChange={(e) => onChangeParams({ diskEnabled: e.target.checked })}
                  className="accent-cyan-500 rounded"
                />
              </label>

              {/* Disk Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Disk Temperature (Kelvin)</span>
                  <span className="font-mono text-cyan-400">{Math.round(params.diskTemperature).toLocaleString()} K</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="40000"
                  step="500"
                  value={params.diskTemperature}
                  onChange={(e) => onChangeParams({ diskTemperature: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Disk Density */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Plasma Density</span>
                  <span className="font-mono text-cyan-400">{params.diskDensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={params.diskDensity}
                  onChange={(e) => onChangeParams({ diskDensity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Disk Luminosity */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Luminosity Multiplier</span>
                  <span className="font-mono text-cyan-400">{params.diskLuminosity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={params.diskLuminosity}
                  onChange={(e) => onChangeParams({ diskLuminosity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Outer Radius */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Outer Radius (M)</span>
                  <span className="font-mono text-cyan-400">{params.diskOuterRadius.toFixed(0)} M</span>
                </div>
                <input
                  type="range"
                  min="8.0"
                  max="30.0"
                  step="1.0"
                  value={params.diskOuterRadius}
                  onChange={(e) => onChangeParams({ diskOuterRadius: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CAMERA & STARFIELD */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              {/* Camera Distance */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Camera Distance</span>
                  <span className="font-mono text-cyan-400">{params.cameraDistance.toFixed(1)} M</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="50.0"
                  step="0.5"
                  value={params.cameraDistance}
                  onChange={(e) => onChangeParams({ cameraDistance: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Camera Inclination */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Camera Inclination (θ)</span>
                  <span className="font-mono text-cyan-400">{Math.round(params.cameraInclination)}°</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="89"
                  step="1"
                  value={params.cameraInclination}
                  onChange={(e) => onChangeParams({ cameraInclination: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Auto Orbit Toggle */}
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span>Auto Orbit Camera</span>
                <input
                  type="checkbox"
                  checked={params.autoOrbit}
                  onChange={(e) => onChangeParams({ autoOrbit: e.target.checked })}
                  className="accent-cyan-500 rounded"
                />
              </label>

              {/* Star Density */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Background Star Density</span>
                  <span className="font-mono text-cyan-400">{params.starDensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={params.starDensity}
                  onChange={(e) => onChangeParams({ starDensity: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          )}

          {/* TAB 5: RENDER QUALITY */}
          {activeTab === 'render' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-200">Quality Preset</span>
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {(['low', 'medium', 'high', 'ultra'] as QualityMode[]).map((q) => (
                    <button
                      key={q}
                      onClick={() => onChangeParams({ quality: q })}
                      className={`rounded-lg border py-1.5 text-center text-xs uppercase transition ${params.quality === q ? 'border-cyan-500 bg-cyan-950 text-cyan-300' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Resolution Toggle */}
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span>Adaptive Resolution (60 FPS)</span>
                <input
                  type="checkbox"
                  checked={params.dynamicResolution}
                  onChange={(e) => onChangeParams({ dynamicResolution: e.target.checked })}
                  className="accent-cyan-500 rounded"
                />
              </label>

              {/* Bloom Strength */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Physically Based Bloom</span>
                  <span className="font-mono text-cyan-400">{params.bloomStrength.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.1"
                  value={params.bloomStrength}
                  onChange={(e) => onChangeParams({ bloomStrength: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">Camera Exposure</span>
                  <span className="font-mono text-cyan-400">{params.exposure.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.1"
                  value={params.exposure}
                  onChange={(e) => onChangeParams({ exposure: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Educational Overlay Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-cyan-300">Educational Overlays</span>
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Show Critical Radii HUD</span>
                  <input
                    type="checkbox"
                    checked={params.showCriticalRadii}
                    onChange={(e) => onChangeParams({ showCriticalRadii: e.target.checked })}
                    className="accent-cyan-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span>Show Telemetry Panel</span>
                  <input
                    type="checkbox"
                    checked={params.showTelemetry}
                    onChange={(e) => onChangeParams({ showTelemetry: e.target.checked })}
                    className="accent-cyan-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
