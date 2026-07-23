import React from 'react';
import { X, Atom, Sparkles, Orbit, Compass, Eye } from 'lucide-react';

interface PhysicsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhysicsInfoModal: React.FC<PhysicsInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 text-slate-200 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/40">
            <Atom className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">General Relativity & Kerr Metric Physics</h2>
            <p className="text-xs text-cyan-400">Scientific Foundations of Gravitational Lensing around Rotating Black Holes</p>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="mt-6 space-y-6 text-xs leading-relaxed text-slate-300">
          {/* Section 1: Kerr Metric */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Orbit className="h-4 w-4 text-cyan-400" />
              1. The Kerr Metric (Rotating Black Holes)
            </h3>
            <p className="mt-2 text-slate-300">
              In 1963, mathematician Roy Kerr solved Einstein's field equations for an isolated, rotating mass. Unlike non-rotating Schwarzschild black holes, a Kerr black hole possesses mass M and angular momentum J = M a. Spacetime around a rotating hole is dragged along with its rotation.
            </p>
            <div className="mt-3 rounded-lg border border-cyan-500/20 bg-black/60 p-3 font-mono text-[11px] text-cyan-200">
              ds² = - (1 - 2Mr/ρ²) dt² - (4Mar sin²θ / ρ²) dt dφ + (ρ²/Δ) dr² + ρ² dθ² + (r² + a² + 2Ma²r sin²θ / ρ²) sin²θ dφ²
            </div>
          </div>

          {/* Section 2: Critical Radii */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <Compass className="h-4 w-4 text-amber-400" />
              2. Critical Physical Boundaries
            </h3>
            <ul className="mt-2 space-y-2 text-slate-300">
              <li>
                <strong className="text-red-400">Event Horizon (r+):</strong> Boundary of no escape r+ = M + √(M² - a²). Inside this radius, the escape velocity exceeds the speed of light c.
              </li>
              <li>
                <strong className="text-cyan-400">Ergosphere (r_ergo):</strong> Region outside r+ where spacetime frame-dragging is so intense that no object can remain stationary; everything must co-rotate with the black hole.
              </li>
              <li>
                <strong className="text-amber-400">Photon Sphere (r_ph):</strong> The radius of unstable circular light orbits. Photons grazing this sphere produce the razor-sharp <strong className="text-amber-300">Photon Ring</strong>.
              </li>
              <li>
                <strong className="text-emerald-400">ISCO (r_isco):</strong> Innermost Stable Circular Orbit. Inside r_isco, stable circular orbits for accretion disk matter become impossible, and plasma plunges into the horizon.
              </li>
            </ul>
          </div>

          {/* Section 3: Relativistic Doppler Beaming & Redshift */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              3. Relativistic Doppler Beaming & Gravitational Redshift
            </h3>
            <p className="mt-2 text-slate-300">
              As plasma orbits at near-light speeds, Special and General Relativity transform its observed brightness and spectrum:
            </p>
            <div className="mt-2 space-y-1 text-slate-300">
              <p>• <strong className="text-cyan-300">Doppler Boosting:</strong> Gas moving toward the observer appears dramatically brighter (I ∝ g⁴) and shifted toward blue/white.</p>
              <p>• <strong className="text-red-300">Gravitational Redshift:</strong> Photons climbing out of the deep gravitational potential well lose energy, shifting emitted light redder near r+.</p>
            </div>
          </div>

          {/* Section 4: Event Horizon Telescope */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-300">
              <Eye className="h-4 w-4 text-purple-400" />
              4. Event Horizon Telescope (EHT) Confirmation
            </h3>
            <p className="mt-2 text-slate-300">
              In 2019 and 2022, the Event Horizon Telescope published historical millimeter-wave radio images of M87* and Sagittarius A*, directly confirming the black hole shadow and bright asymmetric photon ring predicted by Kerr General Relativity.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-500"
          >
            Close & Return to Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
