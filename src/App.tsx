import { useState, useCallback } from 'react';
import type { BlackHoleParams, TelemetryData, SimulationPreset } from './types/simulator';
import { DEFAULT_BLACK_HOLE_PARAMS } from './physics/presets';
import { BlackHoleCanvas } from './components/BlackHoleCanvas';
import { EducationalOverlay } from './components/EducationalOverlay';
import { ControlPanel } from './components/ControlPanel';
import { PhysicsInfoModal } from './components/PhysicsInfoModal';

export function App() {
  const [params, setParams] = useState<BlackHoleParams>(DEFAULT_BLACK_HOLE_PARAMS);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isPhysicsModalOpen, setIsPhysicsModalOpen] = useState(false);

  const handleParamsChange = useCallback((newParams: Partial<BlackHoleParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const handleSelectPreset = useCallback((preset: SimulationPreset) => {
    setParams((prev) => ({
      ...prev,
      ...preset.params,
    }));
  }, []);

  const handleResetParams = useCallback(() => {
    setParams(DEFAULT_BLACK_HOLE_PARAMS);
  }, []);

  const handleTelemetry = useCallback((data: TelemetryData) => {
    setTelemetry(data);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans select-none">
      {/* 1. Fullscreen WebGL2 GPU Raymarcher Canvas */}
      <BlackHoleCanvas params={params} onTelemetry={handleTelemetry} />

      {/* 2. Educational Telemetry & HUD Overlay */}
      <EducationalOverlay
        params={params}
        telemetry={telemetry}
        onOpenPhysicsModal={() => setIsPhysicsModalOpen(true)}
      />

      {/* 3. Sci-Fi Glassmorphism Controls & Presets Panel */}
      <ControlPanel
        params={params}
        onChangeParams={handleParamsChange}
        onSelectPreset={handleSelectPreset}
        onResetParams={handleResetParams}
      />

      {/* 4. Astrophysics & General Relativity Info Modal */}
      <PhysicsInfoModal
        isOpen={isPhysicsModalOpen}
        onClose={() => setIsPhysicsModalOpen(false)}
      />
    </div>
  );
}

export default App;
