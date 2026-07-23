export const blackHoleVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const blackHoleFragmentShader = `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform mat4 uCameraMatrix;
  uniform mat4 uInverseProjectionMatrix;
  
  // Black Hole & Physics Parameters
  uniform float uMass;
  uniform float uSpin;             // Kerr spin parameter a (-0.999 to 0.999)
  uniform int uMode;               // 0: Kerr, 1: Schwarzschild
  
  // Accretion Disk Parameters
  uniform bool uDiskEnabled;
  uniform float uDiskInnerRadius;  // Multiplier for r_isco
  uniform float uDiskOuterRadius;  // Outer radius in M
  uniform float uDiskThickness;    // Vertical disk thickness
  uniform float uDiskDensity;      // Optical density
  uniform float uDiskTemperature;  // Peak temp in K (e.g., 12000K)
  uniform float uDiskLuminosity;   // Brightness multiplier
  uniform float uDiskRotationSpeed;// Animation speed
  
  // Starfield & Background
  uniform float uStarDensity;
  uniform float uStarBrightness;
  uniform float uBackgroundBrightness;
  
  // Relativistic Effects toggles
  uniform bool uDopplerBeaming;
  uniform bool uGravitationalRedshift;
  uniform bool uFrameDragging;
  
  // Ray Marching Quality & Steps
  uniform int uMaxRaySteps;        // e.g. 64 to 512
  uniform float uStepSize;
  
  varying vec2 vUv;

  // Constants
  const float PI = 3.14159265359;
  const float TWO_PI = 6.28318530718;

  // Calculate Kerr Critical Radii
  void getKerrRadii(float M, float a, out float rPlus, out float rPh, out float rIsco) {
    float a2 = a * a;
    rPlus = M + sqrt(max(0.0001, M * M - a2));
    
    float clampedA = clamp(a / M, -0.999, 0.999);
    rPh = 2.0 * M * (1.0 + cos((2.0 / 3.0) * acos(-clampedA)));

    float Z1 = 1.0 + pow(1.0 - a2 / (M * M), 1.0 / 3.0) * 
               (pow(1.0 + clampedA, 1.0 / 3.0) + pow(1.0 - clampedA, 1.0 / 3.0));
    float Z2 = sqrt(3.0 * (a2 / (M * M)) + Z1 * Z1);
    float iscoSign = clampedA >= 0.0 ? 1.0 : -1.0;
    rIsco = M * (3.0 + Z2 - iscoSign * sqrt(max(0.0, (3.0 - Z1) * (3.0 + Z1 + 2.0 * Z2))));
  }

  // 3D Simplex & Fractional Brownian Motion (FBM) for Plasma Turbulence
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // 3-Octave Fractional Brownian Motion for volumetric plasma clouds
  float fbm(vec3 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 3; i++) {
      val += amp * snoise(p * freq);
      freq *= 2.17;
      amp *= 0.48;
    }
    return val;
  }

  // Physically Accurate Blackbody Spectrum RGB Conversion
  vec3 blackbodySpectrum(float tempK) {
    float t = clamp(tempK, 800.0, 45000.0) / 100.0;
    vec3 color;

    // Red
    if (t <= 66.0) {
      color.r = 1.0;
    } else {
      color.r = t - 60.0;
      color.r = 329.698727446 * pow(color.r, -0.1332047592);
      color.r = clamp(color.r / 255.0, 0.0, 1.0);
    }

    // Green
    if (t <= 66.0) {
      color.g = t;
      color.g = 99.4708025861 * log(color.g) - 161.1195681661;
    } else {
      color.g = t - 60.0;
      color.g = 288.1221695283 * pow(color.g, -0.0755148492);
    }
    color.g = clamp(color.g / 255.0, 0.0, 1.0);

    // Blue
    if (t >= 66.0) {
      color.b = 1.0;
    } else if (t <= 19.0) {
      color.b = 0.0;
    } else {
      color.b = t - 10.0;
      color.b = 138.5177312231 * log(color.b) - 305.0447927307;
      color.b = clamp(color.b / 255.0, 0.0, 1.0);
    }

    // Enhance vibrance of ultra-hot plasma (blue-shifted electric highlights)
    if (tempK > 25000.0) {
      color = mix(color, vec3(0.5, 0.85, 1.2), (tempK - 25000.0) / 20000.0);
    }

    return color;
  }

  // Deep Celestial Milky Way Galaxy Background with Stars & Lensed Nebulae
  vec3 sampleBackgroundSky(vec3 dir) {
    vec3 nDir = normalize(dir);
    
    float galacticLat = abs(nDir.y);
    float galacticGlow = exp(-galacticLat * 5.0) * uBackgroundBrightness;
    float coreGlow = exp(-galacticLat * 12.0 - length(nDir.xz - vec2(0.3, -0.2)) * 3.0);
    
    // Galactic Dust absorption lanes
    float dustNoise = fbm(nDir * 3.5 + vec3(1.7, 2.4, 4.1));
    float dustAbs = smoothstep(-0.25, 0.45, dustNoise) * exp(-galacticLat * 8.0);
    
    // Multi-color Nebulae Emission
    float nebNoise1 = fbm(nDir * 2.2 + vec3(0.5, 1.2, 3.4));
    float nebNoise2 = fbm(nDir * 4.0 - vec3(2.1, 0.8, 1.5));
    vec3 nebColor1 = vec3(0.4, 0.15, 0.7) * max(0.0, nebNoise1) * exp(-galacticLat * 4.0);
    vec3 nebColor2 = vec3(0.1, 0.5, 0.9) * max(0.0, nebNoise2) * exp(-galacticLat * 6.0);
    
    vec3 galaxyBase = vec3(0.03, 0.06, 0.18) * galacticGlow;
    vec3 galaxyCore = vec3(1.2, 0.85, 0.5) * coreGlow;
    vec3 backgroundSky = (galaxyBase + galaxyCore + nebColor1 + nebColor2) * (1.0 - dustAbs * 0.85);
    
    // Multi-tier Star Field
    vec3 starGrid = nDir * (120.0 * uStarDensity);
    vec3 iStar = floor(starGrid);
    vec3 fStar = fract(starGrid);
    
    float starHash = fract(sin(dot(iStar, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    
    vec3 starColor = vec3(0.0);
    if (starHash > 0.92 - (0.05 * uStarDensity)) {
      float starSize = smoothstep(0.92, 1.0, starHash);
      float distToCenter = length(fStar - vec2(0.5).xyx);
      float starBrightness = smoothstep(0.25, 0.0, distToCenter) * starSize * uStarBrightness;
      
      float tempSeed = fract(starHash * 73.0);
      vec3 sColor;
      if (tempSeed < 0.2) sColor = vec3(0.6, 0.85, 1.0);       // O/B Blue Supergiant
      else if (tempSeed < 0.5) sColor = vec3(1.0, 1.0, 1.0);  // A/F White Star
      else if (tempSeed < 0.8) sColor = vec3(1.0, 0.85, 0.4);  // G/K Yellow-Orange
      else sColor = vec3(1.0, 0.4, 0.25);                    // M Red Giant
      
      starColor = sColor * starBrightness * 4.0;
    }

    return backgroundSky + starColor;
  }

  void main() {
    // Correct Standard Normalized Clip Space [-1.0, 1.0] (Prevents oval stretching)
    vec2 clipSpace = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;

    // Compute Camera Ray in World Space
    vec4 rayClip = vec4(clipSpace.x, clipSpace.y, -1.0, 1.0);
    vec4 rayEye = uInverseProjectionMatrix * rayClip;
    rayEye = vec4(rayEye.xy, -1.0, 0.0);
    vec3 rayDir = normalize((uCameraMatrix * rayEye).xyz);
    vec3 cameraPos = (uCameraMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

    float M = uMass;
    float a = (uMode == 1) ? 0.0 : clamp(uSpin, -0.999, 0.999);

    float rPlus, rPh, rIsco;
    getKerrRadii(M, a, rPlus, rPh, rIsco);

    // Dynamic Accretion Disk Radii Boundaries
    float diskRIn = rIsco * uDiskInnerRadius;
    float diskROut = M * uDiskOuterRadius;

    // Integration Setup
    vec3 pos = cameraPos;
    vec3 vel = rayDir;
    
    vec3 accumulatedDiskColor = vec3(0.0);
    float diskAlpha = 0.0;
    
    bool hitHorizon = false;
    float stepMult = uStepSize;
    float closestApproachToPh = 1e5;

    // Numerical Integration Loop
    for (int step = 0; step < 512; step++) {
      if (step >= uMaxRaySteps) break;

      float r = length(pos);
      closestApproachToPh = min(closestApproachToPh, abs(r - rPh));

      // 1. Event Horizon Capture Check
      if (r <= rPlus * 1.015) {
        hitHorizon = true;
        break;
      }

      // 2. Escape to Infinity Check
      if (r > 60.0 * M && dot(pos, vel) > 0.0) {
        break;
      }

      // Adaptive Integration Step Size
      float stepSize = max(0.035 * M, (r - rPlus) * 0.075) * stepMult;

      // Correct General Relativity Null Geodesic Deflection Acceleration:
      // F_grav = - (3M * h^2 / r^6) * pos where h = |pos x vel|
      vec3 angularMom = cross(pos, vel);
      float h2 = dot(angularMom, angularMom);
      vec3 accel = - (3.0 * M * h2 / max(0.0001, pow(r, 6.0))) * pos;

      // Kerr Frame-Dragging Drag Force
      if (uFrameDragging && abs(a) > 0.001) {
        vec3 spinAxis = vec3(0.0, 0.0, 1.0);
        vec3 dragAccel = (2.2 * M * a / max(0.0001, pow(r, 4.0))) * cross(spinAxis, vel);
        accel += dragAccel;
      }

      // Update Photon Position & Velocity Vector
      vel += accel * stepSize;
      vel = normalize(vel);
      
      vec3 oldPos = pos;
      pos += vel * stepSize;

      // 3. Volumetric Accretion Disk Intersection & Emission Sampling
      if (uDiskEnabled && (oldPos.z * pos.z <= 0.0 || abs(pos.z) <= uDiskThickness * M)) {
        float rDisk = length(pos.xy);

        if (rDisk >= diskRIn && rDisk <= diskROut) {
          // Keplerian Rotation Speed
          float phiDisk = atan(pos.y, pos.x);
          float vKepler = sqrt(M / max(0.1, rDisk)) / (1.0 + a * sqrt(M / max(0.1, pow(rDisk, 3.0))));
          vec3 vDisk = vec3(-sin(phiDisk), cos(phiDisk), 0.0) * vKepler;

          // Relativistic Doppler Factor: g = sqrt(1-v^2) / (1 - v * cos(theta))
          float cosThetaObs = dot(vDisk, vel);
          float gDoppler = 1.0;
          if (uDopplerBeaming) {
            float gammaDisk = 1.0 / sqrt(max(0.01, 1.0 - vKepler * vKepler));
            gDoppler = 1.0 / (gammaDisk * (1.0 - vKepler * cosThetaObs));
            gDoppler = clamp(gDoppler, 0.15, 6.0);
          }

          // Gravitational Redshift Factor: g_grav = sqrt(1 - 2M/r)
          float gGrav = 1.0;
          if (uGravitationalRedshift) {
            gGrav = sqrt(max(0.01, 1.0 - (2.0 * M / rDisk)));
          }

          float gTotal = gDoppler * gGrav;

          // Swirling Domain Warped Plasma Noise
          vec3 turbulencePos = vec3(
            rDisk * 0.4 - uTime * uDiskRotationSpeed * 0.4,
            phiDisk * 4.0 + sin(rDisk * 0.8),
            pos.z * 2.0
          );
          float plasmaTurbulence = fbm(turbulencePos) * 0.5 + 0.5;
          float spiralArms = sin(phiDisk * 2.0 - rDisk * 0.6 + uTime * uDiskRotationSpeed * 0.3) * 0.5 + 0.5;

          // Radial & Vertical Exponential Density Profile
          float radialDensity = smoothstep(diskRIn, diskRIn + 0.6 * M, rDisk) * 
                                (1.0 - smoothstep(diskROut - 3.0 * M, diskROut, rDisk));
          float verticalDensity = exp(-pow(pos.z / (uDiskThickness * M), 2.0));
          
          float density = radialDensity * verticalDensity * (0.5 + 0.5 * plasmaTurbulence * spiralArms) * uDiskDensity;

          // Shakura-Sunyaev Temperature Profile T(r) = T_peak * (r_in / r)^0.75 * (1 - sqrt(r_in / r))^0.25
          float rRatio = diskRIn / rDisk;
          float tempFactor = pow(rRatio, 0.75) * pow(max(0.0, 1.0 - sqrt(rRatio)), 0.25) * 4.2;
          float emittedTempK = uDiskTemperature * tempFactor;
          float observedTempK = emittedTempK * gTotal;

          // Blackbody Emission Base Spectrum Color
          vec3 baseColor = blackbodySpectrum(observedTempK);

          // Relativistic Luminosity Beaming (Intensity scales as g^4)
          float beamingIntensity = uDopplerBeaming ? pow(gTotal, 4.0) : 1.0;
          vec3 emission = baseColor * uDiskLuminosity * beamingIntensity * density;

          // Correct Volumetric Accumulation (Multiplied by sampleAlpha to prevent over-saturation)
          float sampleAlpha = clamp(density * 0.35 * stepSize, 0.0, 1.0);
          accumulatedDiskColor += (1.0 - diskAlpha) * emission * sampleAlpha;
          diskAlpha += (1.0 - diskAlpha) * sampleAlpha;

          if (diskAlpha >= 0.98) {
            diskAlpha = 1.0;
            break;
          }
        }
      }
    }

    // 4. Photon Ring Razor-Sharp Relativistic Sub-Ring Glow
    float photonRingGlow = exp(-closestApproachToPh * 4.5 / M) * 0.8;
    vec3 photonRingColor = vec3(1.2, 0.9, 0.5) * photonRingGlow;

    // Final Color Synthesis
    vec3 finalColor = vec3(0.0);

    if (hitHorizon) {
      // Event Horizon: Pitch Black Silhouette
      finalColor = accumulatedDiskColor + photonRingColor * diskAlpha;
    } else {
      // Escaping Photon: Sample Lensed Milky Way Sky
      vec3 bgSky = sampleBackgroundSky(vel);
      finalColor = accumulatedDiskColor + (1.0 - diskAlpha) * bgSky + photonRingColor * (1.0 - diskAlpha * 0.5);
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
