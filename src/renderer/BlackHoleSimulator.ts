import * as THREE from 'three';
import type { BlackHoleParams, TelemetryData } from '../types/simulator';
import { calculateKerrRadii } from '../physics/kerrMetric';
import { blackHoleVertexShader, blackHoleFragmentShader } from '../shaders/blackHoleRaymarcher.glsl';
import { postProcessVertexShader, postProcessFragmentShader } from '../shaders/postProcessing.glsl';

export class BlackHoleSimulator {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private postScene: THREE.Scene;
  private postCamera: THREE.OrthographicCamera;
  
  private renderTarget: THREE.WebGLRenderTarget;
  private raymarchMaterial: THREE.ShaderMaterial;
  private postMaterial: THREE.ShaderMaterial;
  
  private raymarchMesh: THREE.Mesh;
  private postMesh: THREE.Mesh;

  private params: BlackHoleParams;
  private animationFrameId: number | null = null;
  private onTelemetryCallback?: (data: TelemetryData) => void;

  // Performance & Dynamic Resolution Scaling
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimeMs = 16.6;
  private resolutionScale = 1.0;
  private renderWidth = 1920;
  private renderHeight = 1080;

  // Camera Spherical Orbital Angles
  private cameraDistance = 20.0;
  private cameraTheta = Math.PI / 3; // Inclination (radians)
  private cameraPhi = Math.PI / 4;   // Azimuth (radians)
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };

  constructor(container: HTMLElement, initialParams: BlackHoleParams) {
    this.container = container;
    this.params = { ...initialParams };

    // 1. Initialize WebGL2 Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      precision: 'highp',
      antialias: false,
      depth: false,
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(
      this.params.cameraFov,
      container.clientWidth / container.clientHeight,
      0.1,
      1000.0
    );
    this.updateCameraPosition();

    // 3. Float Framebuffer Render Target (RGBA16F / HalfFloatType)
    this.renderWidth = Math.floor(container.clientWidth * this.resolutionScale);
    this.renderHeight = Math.floor(container.clientHeight * this.resolutionScale);
    
    this.renderTarget = new THREE.WebGLRenderTarget(this.renderWidth, this.renderHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType, // High Precision HDR buffer
    });

    // 4. Main Raymarching Scene & Quad Mesh
    this.scene = new THREE.Scene();
    const quadGeo = new THREE.PlaneGeometry(2, 2);

    this.raymarchMaterial = new THREE.ShaderMaterial({
      vertexShader: blackHoleVertexShader,
      fragmentShader: blackHoleFragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(this.renderWidth, this.renderHeight) },
        uTime: { value: 0 },
        uCameraMatrix: { value: new THREE.Matrix4() },
        uInverseProjectionMatrix: { value: new THREE.Matrix4() },
        uMass: { value: this.params.mass },
        uSpin: { value: this.params.spin },
        uMode: { value: this.params.mode === 'schwarzschild' ? 1 : 0 },
        uDiskEnabled: { value: this.params.diskEnabled },
        uDiskInnerRadius: { value: this.params.diskInnerRadius },
        uDiskOuterRadius: { value: this.params.diskOuterRadius },
        uDiskThickness: { value: this.params.diskThickness },
        uDiskDensity: { value: this.params.diskDensity },
        uDiskTemperature: { value: this.params.diskTemperature },
        uDiskLuminosity: { value: this.params.diskLuminosity },
        uDiskRotationSpeed: { value: this.params.diskRotationSpeed },
        uStarDensity: { value: this.params.starDensity },
        uStarBrightness: { value: this.params.starBrightness },
        uBackgroundBrightness: { value: this.params.backgroundBrightness },
        uDopplerBeaming: { value: this.params.dopplerBeaming },
        uGravitationalRedshift: { value: this.params.gravitationalRedshift },
        uFrameDragging: { value: this.params.frameDragging },
        uMaxRaySteps: { value: this.getQualityRaySteps(this.params.quality) },
        uStepSize: { value: this.params.stepSize },
      },
      depthWrite: false,
      depthTest: false,
    });

    this.raymarchMesh = new THREE.Mesh(quadGeo, this.raymarchMaterial);
    this.scene.add(this.raymarchMesh);

    // 5. Postprocessing Scene & Quad Mesh
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.postMaterial = new THREE.ShaderMaterial({
      vertexShader: postProcessVertexShader,
      fragmentShader: postProcessFragmentShader,
      uniforms: {
        uSceneTexture: { value: this.renderTarget.texture },
        uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
        uBloomStrength: { value: this.params.bloomStrength },
        uBloomRadius: { value: this.params.bloomRadius },
        uExposure: { value: this.params.exposure },
        uGamma: { value: this.params.gamma },
        uBloomEnabled: { value: this.params.bloomEnabled },
      },
      depthWrite: false,
      depthTest: false,
    });

    this.postMesh = new THREE.Mesh(quadGeo, this.postMaterial);
    this.postScene.add(this.postMesh);

    // 6. Interactive Camera Controls
    this.setupCameraMouseControls();

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize);

    // 8. Start Main Animation Loop
    this.animate();
  }

  public setTelemetryCallback(cb: (data: TelemetryData) => void) {
    this.onTelemetryCallback = cb;
  }

  public updateParams(newParams: Partial<BlackHoleParams>) {
    this.params = { ...this.params, ...newParams };
    const u = this.raymarchMaterial.uniforms;

    if (newParams.mass !== undefined) u.uMass.value = this.params.mass;
    if (newParams.spin !== undefined) u.uSpin.value = this.params.spin;
    if (newParams.mode !== undefined) u.uMode.value = this.params.mode === 'schwarzschild' ? 1 : 0;
    if (newParams.diskEnabled !== undefined) u.uDiskEnabled.value = this.params.diskEnabled;
    if (newParams.diskInnerRadius !== undefined) u.uDiskInnerRadius.value = this.params.diskInnerRadius;
    if (newParams.diskOuterRadius !== undefined) u.uDiskOuterRadius.value = this.params.diskOuterRadius;
    if (newParams.diskThickness !== undefined) u.uDiskThickness.value = this.params.diskThickness;
    if (newParams.diskDensity !== undefined) u.uDiskDensity.value = this.params.diskDensity;
    if (newParams.diskTemperature !== undefined) u.uDiskTemperature.value = this.params.diskTemperature;
    if (newParams.diskLuminosity !== undefined) u.uDiskLuminosity.value = this.params.diskLuminosity;
    if (newParams.diskRotationSpeed !== undefined) u.uDiskRotationSpeed.value = this.params.diskRotationSpeed;
    if (newParams.starDensity !== undefined) u.uStarDensity.value = this.params.starDensity;
    if (newParams.starBrightness !== undefined) u.uStarBrightness.value = this.params.starBrightness;
    if (newParams.backgroundBrightness !== undefined) u.uBackgroundBrightness.value = this.params.backgroundBrightness;
    if (newParams.dopplerBeaming !== undefined) u.uDopplerBeaming.value = this.params.dopplerBeaming;
    if (newParams.gravitationalRedshift !== undefined) u.uGravitationalRedshift.value = this.params.gravitationalRedshift;
    if (newParams.frameDragging !== undefined) u.uFrameDragging.value = this.params.frameDragging;
    if (newParams.stepSize !== undefined) u.uStepSize.value = this.params.stepSize;

    if (newParams.quality !== undefined) {
      u.uMaxRaySteps.value = this.getQualityRaySteps(this.params.quality);
    }

    if (newParams.cameraDistance !== undefined) {
      this.cameraDistance = this.params.cameraDistance;
      this.updateCameraPosition();
    }

    if (newParams.cameraInclination !== undefined) {
      this.cameraTheta = (this.params.cameraInclination * Math.PI) / 180;
      this.updateCameraPosition();
    }

    if (newParams.cameraFov !== undefined) {
      this.camera.fov = this.params.cameraFov;
      this.camera.updateProjectionMatrix();
    }

    // Postprocessing uniforms
    const pu = this.postMaterial.uniforms;
    if (newParams.bloomStrength !== undefined) pu.uBloomStrength.value = this.params.bloomStrength;
    if (newParams.bloomRadius !== undefined) pu.uBloomRadius.value = this.params.bloomRadius;
    if (newParams.exposure !== undefined) pu.uExposure.value = this.params.exposure;
    if (newParams.gamma !== undefined) pu.uGamma.value = this.params.gamma;
    if (newParams.bloomEnabled !== undefined) pu.uBloomEnabled.value = this.params.bloomEnabled;
  }

  private getQualityRaySteps(quality: string): number {
    switch (quality) {
      case 'low': return 64;
      case 'medium': return 128;
      case 'high': return 256;
      case 'ultra': return 384;
      default: return 128;
    }
  }

  private updateCameraPosition() {
    // Convert Spherical Coordinates (r, theta, phi) to Cartesian (x, y, z)
    const sinTheta = Math.sin(this.cameraTheta);
    const cosTheta = Math.cos(this.cameraTheta);
    const sinPhi = Math.sin(this.cameraPhi);
    const cosPhi = Math.cos(this.cameraPhi);

    this.camera.position.x = this.cameraDistance * sinTheta * cosPhi;
    this.camera.position.y = this.cameraDistance * cosTheta;
    this.camera.position.z = this.cameraDistance * sinTheta * sinPhi;

    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld();

    // Sync camera inclination back to params
    this.params.cameraInclination = (this.cameraTheta * 180) / Math.PI;
    this.params.cameraDistance = this.cameraDistance;
  }

  private setupCameraMouseControls() {
    const dom = this.renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      // Rotate camera angles
      this.cameraPhi += deltaX * 0.005;
      this.cameraTheta = Math.max(0.01, Math.min(Math.PI - 0.01, this.cameraTheta - deltaY * 0.005));

      this.updateCameraPosition();
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.cameraDistance = Math.max(4.0, Math.min(100.0, this.cameraDistance + e.deltaY * 0.02));
      this.updateCameraPosition();
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
  }

  private onResize = () => {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.updateRenderTargetSize(w, h);
    this.postMaterial.uniforms.uResolution.value.set(w, h);
  };

  private updateRenderTargetSize(width: number, height: number) {
    this.renderWidth = Math.max(320, Math.floor(width * this.resolutionScale));
    this.renderHeight = Math.max(240, Math.floor(height * this.resolutionScale));

    this.renderTarget.setSize(this.renderWidth, this.renderHeight);
    this.raymarchMaterial.uniforms.uResolution.value.set(this.renderWidth, this.renderHeight);
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const deltaMs = now - this.lastTime;
    this.lastTime = now;
    this.frameCount++;

    // Auto-Orbit camera if enabled
    if (this.params.autoOrbit && !this.isDragging) {
      this.cameraPhi += 0.002 * this.params.autoOrbitSpeed;
      this.updateCameraPosition();
    }

    // Pass Matrices and Time Uniforms to GLSL Raymarcher
    const u = this.raymarchMaterial.uniforms;
    u.uTime.value = now * 0.001;

    // Calculate Inverse Projection and Camera Matrix for Ray Generation
    const inverseProj = this.camera.projectionMatrixInverse;
    const cameraWorld = this.camera.matrixWorld;

    u.uInverseProjectionMatrix.value.copy(inverseProj);
    u.uCameraMatrix.value.copy(cameraWorld);

    // 1. Pass 1: Raymarch Black Hole to HDR Render Target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // 2. Pass 2: Postprocessing Tone Mapping & Bloom to Screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);

    // Adaptive Resolution Scaling (Dynamic quality for smooth 60 FPS)
    if (this.params.dynamicResolution && this.frameCount % 30 === 0) {
      this.fps = Math.round(1000 / deltaMs);
      this.frameTimeMs = deltaMs;

      if (deltaMs > 20.0 && this.resolutionScale > 0.5) {
        this.resolutionScale = Math.max(0.5, this.resolutionScale - 0.1);
        this.updateRenderTargetSize(this.container.clientWidth, this.container.clientHeight);
      } else if (deltaMs < 14.0 && this.resolutionScale < 1.0) {
        this.resolutionScale = Math.min(1.0, this.resolutionScale + 0.1);
        this.updateRenderTargetSize(this.container.clientWidth, this.container.clientHeight);
      }

      // Telemetry Data Update
      if (this.onTelemetryCallback) {
        const radii = calculateKerrRadii(this.params.mass, this.params.spin);
        this.onTelemetryCallback({
          fps: Math.min(60, this.fps),
          frameTimeMs: parseFloat(this.frameTimeMs.toFixed(1)),
          resolutionScale: parseFloat(this.resolutionScale.toFixed(2)),
          eventHorizonRadius: parseFloat(radii.rPlus.toFixed(3)),
          ergosphereOuterRadius: parseFloat(radii.rErgoEquator.toFixed(3)),
          photonSphereRadius: parseFloat(radii.rPh.toFixed(3)),
          iscoRadius: parseFloat(radii.rIsco.toFixed(3)),
          stepCount: this.getQualityRaySteps(this.params.quality),
        });
      }
    }
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.renderTarget.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
