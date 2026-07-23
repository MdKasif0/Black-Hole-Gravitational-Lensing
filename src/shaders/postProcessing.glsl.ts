export const postProcessVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const postProcessFragmentShader = `
  precision highp float;

  uniform sampler2D uSceneTexture;
  uniform vec2 uResolution;
  uniform float uBloomStrength;
  uniform float uBloomRadius;
  uniform float uExposure;
  uniform float uGamma;
  uniform bool uBloomEnabled;

  varying vec2 vUv;

  // Filmic ACES Tone Mapping Curve (Stephen Hill Narkowicz ACES fit)
  vec3 toneMapACES(vec3 color) {
    color *= 0.65;
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
  }

  // Dual-Gaussian Anamorphic Bloom Sampling
  vec3 sampleBloom(vec2 uv, vec2 texelSize, float radius) {
    vec3 bloom = vec3(0.0);
    float weights[5];
    weights[0] = 0.227027;
    weights[1] = 0.194594;
    weights[2] = 0.121621;
    weights[3] = 0.054054;
    weights[4] = 0.016216;

    // Horizontal + Vertical Gaussian Blurs
    for (int i = 1; i < 5; i++) {
      vec2 offset = vec2(float(i) * radius) * texelSize;
      bloom += texture2D(uSceneTexture, uv + vec2(offset.x, 0.0)).rgb * weights[i];
      bloom += texture2D(uSceneTexture, uv - vec2(offset.x, 0.0)).rgb * weights[i];
      bloom += texture2D(uSceneTexture, uv + vec2(0.0, offset.y)).rgb * weights[i];
      bloom += texture2D(uSceneTexture, uv - vec2(0.0, offset.y)).rgb * weights[i];
    }
    return bloom;
  }

  // Subtle Chromatic Aberration near screen edges
  vec3 sampleChromaticAberration(vec2 uv, float strength) {
    vec2 dist = uv - 0.5;
    vec2 offset = dist * strength * 0.015;
    
    float r = texture2D(uSceneTexture, uv + offset).r;
    float g = texture2D(uSceneTexture, uv).g;
    float b = texture2D(uSceneTexture, uv - offset).b;
    
    return vec3(r, g, b);
  }

  void main() {
    vec2 texelSize = 1.0 / uResolution;
    
    // 1. Sample Scene Color with subtle Chromatic Aberration
    vec3 sceneColor = sampleChromaticAberration(vUv, 0.4);

    // 2. Camera Exposure
    sceneColor *= uExposure;

    // 3. Dual-Gaussian Anamorphic Bloom Glare
    if (uBloomEnabled && uBloomStrength > 0.001) {
      vec3 bloomColor = sampleBloom(vUv, texelSize, uBloomRadius);
      float brightness = max(sceneColor.r, max(sceneColor.g, sceneColor.b));
      
      // Soft threshold curve for glowing highlights
      float bloomFactor = smoothstep(0.7, 1.5, brightness);
      sceneColor += bloomColor * uBloomStrength * (0.4 + 1.2 * bloomFactor);
    }

    // 4. Subtle Vignette for cinematic focus
    vec2 uvVignette = vUv * (1.0 - vUv.yx);
    float vignette = uvVignette.x * uvVignette.y * 15.0;
    vignette = pow(vignette, 0.25);
    sceneColor *= vignette;

    // 5. ACES Filmic Tone Mapping
    vec3 mappedColor = toneMapACES(sceneColor);

    // 6. Gamma Correction
    mappedColor = pow(mappedColor, vec3(1.0 / uGamma));

    gl_FragColor = vec4(mappedColor, 1.0);
  }
`;
