export type QualityMode = 'low' | 'medium' | 'high' | 'ultra';

export interface BlackHoleParams {
  // Black Hole physics
  mass: number;             // Mass in solar masses or normalized M (e.g. 1.0 - 10.0)
  spin: number;             // Kerr dimensionless spin parameter a (-0.999 to +0.999)
  mode: 'kerr' | 'schwarzschild';
  
  // Accretion Disk
  diskEnabled: boolean;
  diskInnerRadius: number;  // Multiplier relative to r_isco
  diskOuterRadius: number;  // Radius in M
  diskThickness: number;    // Disk vertical height/scale
  diskDensity: number;      // Optical depth / density
  diskTemperature: number;  // Base temperature in Kelvin (e.g. 2000K to 50000K)
  diskLuminosity: number;   // Overall disk brightness multiplier
  diskRotationSpeed: number;// Time animation multiplier
  
  // Starfield & Background
  starDensity: number;      // Density of celestial stars
  starBrightness: number;   // Star intensity multiplier
  backgroundBrightness: number; // Nebula / dust brightness
  
  // Relativistic Effects toggles
  dopplerBeaming: boolean;
  gravitationalRedshift: boolean;
  frameDragging: boolean;
  
  // Camera & View
  cameraDistance: number;
  cameraInclination: number; // Angle in degrees (0 = pole, 90 = equator)
  cameraAzimuth: number;     // Azimuthal angle in degrees
  cameraFov: number;         // Field of view in degrees
  autoOrbit: boolean;
  autoOrbitSpeed: number;
  
  // Render & Quality settings
  quality: QualityMode;
  maxRaySteps: number;       // Max integration steps (e.g. 64 - 512)
  stepSize: number;          // Ray marching integration step size multiplier
  dynamicResolution: boolean;// Adaptive resolution scaling for 60 FPS
  bloomEnabled: boolean;
  bloomStrength: number;
  bloomRadius: number;
  exposure: number;
  gamma: number;
  
  // Educational Overlays
  showSpacetimeGrid: boolean;
  showCriticalRadii: boolean;
  showVectorPaths: boolean;
  showDopplerHeatmap: boolean;
  showTelemetry: boolean;
}

export interface SimulationPreset {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  params: Partial<BlackHoleParams>;
}

export interface TelemetryData {
  fps: number;
  frameTimeMs: number;
  resolutionScale: number;
  eventHorizonRadius: number; // r_plus
  ergosphereOuterRadius: number;
  photonSphereRadius: number; // r_ph
  iscoRadius: number;        // r_isco
  stepCount: number;
}
