/**
 * Calculates exact General Relativity Kerr metric critical radii in geometric units (G = C = M = 1).
 */
export function calculateKerrRadii(mass: number, spin: number) {
  // Clamp spin parameter |a| < 0.999 to prevent naked singularities in real-time simulation
  const M = mass;
  const a = Math.max(-0.999, Math.min(0.999, spin));
  const a2 = a * a;
  
  // Event Horizon r_+ = M + sqrt(M^2 - a^2)
  const rPlus = M + Math.sqrt(Math.max(0, M * M - a2));
  
  // Inner Horizon r_- = M - sqrt(M^2 - a^2)
  const rMinus = M - Math.sqrt(Math.max(0, M * M - a2));

  // Ergosphere outer boundary at equator (theta = pi/2): r_ergo = 2M
  const rErgoEquator = 2 * M;

  // Unstable Photon Sphere radius r_ph (for prograde photon orbits)
  // r_ph = 2M * (1 + cos(2/3 * acos(-a/M)))
  const clampedAM = Math.max(-1, Math.min(1, a / M));
  const rPh = 2 * M * (1 + Math.cos((2 / 3) * Math.acos(-clampedAM)));

  // Innermost Stable Circular Orbit r_isco
  const Z1 = 1 + Math.pow(1 - a2 / (M * M), 1 / 3) * 
             (Math.pow(1 + a / M, 1 / 3) + Math.pow(1 - a / M, 1 / 3));
  const Z2 = Math.sqrt(3 * (a2 / (M * M)) + Z1 * Z1);
  const iscoSign = a >= 0 ? 1 : -1;
  const rIsco = M * (3 + Z2 - iscoSign * Math.sqrt(Math.max(0, (3 - Z1) * (3 + Z1 + 2 * Z2))));

  return {
    mass: M,
    spin: a,
    rPlus,
    rMinus,
    rErgoEquator,
    rPh,
    rIsco,
  };
}

/**
 * Calculates relativistic Doppler shift factor g = sqrt(1 - v^2) / (1 - v * cos(theta))
 */
export function calculateDopplerFactor(velocityRatio: number, cosTheta: number): number {
  const v = Math.min(0.999, Math.max(0, velocityRatio));
  const gamma = 1 / Math.sqrt(1 - v * v);
  const factor = 1 / (gamma * (1 - v * cosTheta));
  return Math.max(0.01, Math.min(10.0, factor));
}

/**
 * Approximate temperature in Kelvin to RGB color for blackbody emission.
 */
export function kelvinToRGB(kelvin: number): [number, number, number] {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100;

  let red: number;
  let green: number;
  let blue: number;

  // Calculate Red
  if (temp <= 66) {
    red = 255;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    red = Math.min(255, Math.max(0, red));
  }

  // Calculate Green
  if (temp <= 66) {
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
  } else {
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
  }
  green = Math.min(255, Math.max(0, green));

  // Calculate Blue
  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
    blue = Math.min(255, Math.max(0, blue));
  }

  return [red / 255, green / 255, blue / 255];
}
