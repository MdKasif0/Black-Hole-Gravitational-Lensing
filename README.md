# 🌌 Black Hole Gravitational Lensing Simulator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://black-hole-gravitational-lensing.netlify.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MdKasif0/Black-Hole-Gravitational-Lensing)
[![WebGL2](https://img.shields.io/badge/WebGL2-GPU%20Raytracing-990000?style=for-the-badge&logo=webgl&logoColor=white)](https://black-hole-gravitational-lensing.netlify.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

An interactive, physically accurate WebGL2 simulation of **General Relativity gravitational lensing around rotating (Kerr) and non-rotating (Schwarzschild) black holes**. 

Built with **Three.js, React, and TypeScript**, this scientific visualization uses client-side GPU ray marching along null geodesics in curved spacetime to model light bending, photon rings, relativistic Doppler beaming, gravitational redshift, and swirling accretion disk dynamics at **60 FPS**.

---

## 🔗 Live Application & Repository

* **🚀 Live Interactive Simulator**: [https://black-hole-gravitational-lensing.netlify.app/](https://black-hole-gravitational-lensing.netlify.app/)
* **💻 GitHub Source Code**: [https://github.com/MdKasif0/Black-Hole-Gravitational-Lensing](https://github.com/MdKasif0/Black-Hole-Gravitational-Lensing)

---

## 🔬 How It Works (Astrophysics & Numerical Integration)

The simulator traces individual photon trajectories backwards from the observer's camera into curved spacetime using customized GLSL ray-marching algorithms:

1. **Curved Spacetime Metric**: Calculates null geodesics in the **Kerr metric** parameterized by mass $M$ and dimensionless spin $a = J / Mc \in [-0.999, 0.999]$.
2. **Geodesic Integration**: At each ray step, photons experience gravitational acceleration $F_{\text{grav}} = -\frac{3M h^2}{r^6} \vec{r}$ (where $h = |\vec{r} \times \vec{v}|$), along with Kerr frame-dragging forces.
3. **Critical Physical Boundaries**:
   * **Event Horizon ($r_+$)**: $r_+ = M + \sqrt{M^2 - a^2}$ — Photons crossing $r_+$ are absorbed into pitch black silhouette.
   * **Photon Sphere ($r_{\text{ph}}$)**: Radius of unstable circular photon orbits, forming the razor-sharp **Photon Ring**.
   * **Ergosphere ($r_{\text{ergo}}$)**: Outer boundary where frame-dragging forces spacetime to co-rotate with the black hole.
   * **ISCO ($r_{\text{isco}}$)**: Innermost Stable Circular Orbit defining the inner truncation edge of the accretion disk.
4. **Relativistic Radiance Effects**:
   * **Doppler Boosting**: Relativistic beaming ($I \propto g^4$) brightens plasma moving toward the camera and dims receding gas.
   * **Gravitational Redshift**: Photons climbing out of the gravitational well lose energy ($g_{\text{grav}} = \sqrt{1 - 2M/r}$).
   * **Blackbody Radiation**: Shakura-Sunyaev thermal radial profile $T(r)$ mapped to blackbody color spectrum ($1,000\text{K} - 40,000\text{K}$).

---

## ✨ Features & Interactive Control Panels

### 🎛️ 1. Astrophysical Presets
Quickly load calibrated physical parameters for iconic cosmic objects:
* **Sagittarius A***: Supermassive black hole at the center of the Milky Way ($a = 0.90$).
* **M87* Supermassive**: Asymmetrical accretion ring based on Event Horizon Telescope (EHT) imagery ($a = 0.94$).
* **Rapidly Rotating Kerr**: Extremal Kerr black hole exhibiting extreme frame dragging ($a = 0.998$).
* **Schwarzschild (a = 0)**: Non-rotating static black hole with symmetrical Einstein rings.
* **Strong Gravitational Lensing**: Deep view showcasing dramatic star distortion arcs.
* **Photon Ring Close-Up**: Telephoto view highlighting multi-orbit light rings.

### ⚙️ 2. Physics & Metric Controls
* **Metric Selector**: Toggle between **Kerr** (rotating) and **Schwarzschild** (static).
* **Mass ($M$)**: Adjust black hole mass from $0.5 \, M_\odot$ to $5.0 \, M_\odot$.
* **Spin Parameter ($a$)**: Smooth control over angular momentum from $-0.999$ to $+0.999$.
* **Relativistic Toggles**: Individually enable/disable Frame Dragging, Doppler Beaming ($g^4$), and Gravitational Redshift.

### 🌋 3. Accretion Disk Customization
* **Thermal Temperature**: Adjust peak plasma temperature ($2,000\text{K} - 40,000\text{K}$).
* **Density & Thickness**: Scale optical density and vertical geometric height of the plasma disk.
* **Luminosity & Rotation**: Real-time control over disk emission brightness and Keplerian animation speed.
* **Radii Boundaries**: Adjust inner ($r_{\text{isco}}$ multiplier) and outer disk boundaries.

### 🎥 4. Camera & Starfield Settings
* **Interactive Orbital Camera**: Mouse drag rotation, scroll zoom ($4.0M - 100M$), and smooth auto-orbit.
* **Celestial Milky Way Skybox**: Multi-tiered background featuring star dust, spectral class stars (O, B, A, F, G, K, M), emission nebulae, and cosmic dust lanes.

### 🖥️ 5. Quality & Performance Optimization
* **Ray Marching Steps**: Select between Low (64 steps), Medium (128), High (256), and Ultra (384).
* **Adaptive Dynamic Resolution**: Automatically scales framebuffer resolution (50%–100%) to maintain smooth **60 FPS**.
* **Post-Processing Glare**: Dual-Gaussian anamorphic bloom, chromatic aberration, vignette, and ACES filmic tone mapping.

### 📊 6. Educational HUD & Telemetry
* **Real-time Telemetry Bar**: Monitors live FPS, rendering resolution scale, and ray integration step counts.
* **2D Critical Radii HUD**: Toggles SVG target rings indicating $r_+$, $r_{\text{ph}}$, $r_{\text{ergo}}$, and $r_{\text{isco}}$.
* **Astrophysics Info Modal**: Interactive reference guide detailing Kerr metric mathematics and GR fundamentals.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 + TypeScript
* **3D & Shaders**: Three.js, WebGL2, Custom GLSL Null Geodesic Ray Marcher
* **Styling & UI**: Tailwind CSS v4, Glassmorphism backdrop-blur, Lucide Icons
* **Build System**: Vite 6
* **Deployment**: Netlify

---

## 🚀 Local Development Setup

Clone the repository and launch the local development server:

```bash
# Clone the repository
git clone https://github.com/MdKasif0/Black-Hole-Gravitational-Lensing.git

# Navigate into project directory
cd Black-Hole-Gravitational-Lensing

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Open `http://localhost:3000/` in your browser to interact with the simulator.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) - open for scientific, educational, and non-commercial use.
