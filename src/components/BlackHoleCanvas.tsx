import React, { useEffect, useRef } from 'react';
import type { BlackHoleParams, TelemetryData } from '../types/simulator';
import { BlackHoleSimulator } from '../renderer/BlackHoleSimulator';

interface BlackHoleCanvasProps {
  params: BlackHoleParams;
  onTelemetry: (telemetry: TelemetryData) => void;
}

export const BlackHoleCanvas: React.FC<BlackHoleCanvasProps> = ({
  params,
  onTelemetry,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const simulatorRef = useRef<BlackHoleSimulator | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Instantiate BlackHoleSimulator engine
    const simulator = new BlackHoleSimulator(containerRef.current, params);
    simulator.setTelemetryCallback(onTelemetry);
    simulatorRef.current = simulator;

    return () => {
      simulator.destroy();
      simulatorRef.current = null;
    };
  }, []); // Run once on mount

  // Sync parameters to active simulator on update
  useEffect(() => {
    if (simulatorRef.current) {
      simulatorRef.current.updateParams(params);
    }
  }, [params]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full bg-black cursor-grab active:cursor-grabbing"
    />
  );
};
