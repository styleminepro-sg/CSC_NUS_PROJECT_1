# Turbofan Engine Simulator

A professional, engineering-grade interactive 3D web application that visualizes
the internal operation of a modern high-bypass turbofan jet engine, in the style
of visualization tools built by Rolls-Royce, GE Aerospace, Pratt & Whitney,
Safran, Airbus, Boeing, and NASA.

---

## Overview

This simulator renders a fully modeled turbofan engine — fan, low- and
high-pressure compressors, combustor, high- and low-pressure turbines, and
exhaust nozzle — with physically-informed rotation speeds, particle-based
fuel flow and combustion effects, exhaust plume and shock-diamond
visualization, and a live engineering telemetry dashboard.

It is built entirely with vanilla HTML5, CSS3, and ES6+ JavaScript on top of
Three.js, with no build step required.

---

## Project Structure

Jet-Engine-Simulator/
├── index.html          Main HTML structure, layout, and CDN imports
├── style.css           Aerospace-themed dark UI, glassmorphism panels
├── main.js              Application controller, render/animation loop
├── engine.js            3D engine geometry, materials, view modes
├── ui.js                Dashboard controls, gauges, hotspots, modals
├── diagnostics.js        Automated test sequence system
├── particles.js         Fuel flow, combustion, exhaust, shock diamonds
├── audio.js             Procedural engine sound synthesis
├── utils.js             Math helpers, telemetry formulas, adaptive quality
├── README.md             This file
└── assets/
├── sounds/          Reserved for sampled audio (optional)
└── textures/        Reserved for PBR texture maps (optional)

---

## Getting Started

No build tools, package managers, or servers with special configuration are
required.

1. Download or clone the `Jet-Engine-Simulator/` folder.
2. Open `index.html` directly in a modern desktop or mobile browser
   (Chrome, Edge, Firefox, or Safari — all recent versions).
3. Wait for the welcome screen's loading sequence to complete.
4. Click **INITIALIZE SIMULATOR** to enter the main dashboard.

> Note: because the app fetches Three.js, GSAP, and related libraries from
> CDN, an internet connection is required on first load.

---

## Controls

| Action | Control |
|---|---|
| Rotate camera | Left-click + drag |
| Zoom | Scroll wheel |
| Pan | Right-click + drag |
| Engine RPM | RPM slider (left panel) |
| Throttle | Throttle slider (left panel) |
| View mode | Normal / Cutaway / Exploded buttons |
| Auto camera tour | "AUTO CAMERA" button |
| Run diagnostics | "RUN DIAGNOSTICS" button |
| Component info | Click any hotspot label in the viewport |

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Toggle between idle and cruise RPM |
| `C` | Cycle view mode (Normal → Cutaway → Exploded) |
| `D` | Run diagnostics sequence |
| `A` | Start auto-camera tour |
| `F` | Toggle fullscreen |
| `R` | Reset engine to idle |
| `?` | Open help panel |
| `Ctrl+Shift+D` | Toggle developer debug overlay |

---

## Features

- **Full turbofan cutaway model** — fan, LPC, HPC, combustor, HPT, LPT,
  mixer, nozzle, shaft, and outer nacelle, each independently animated.
- **Physically-motivated rotation** — RPM input drives shaft angular
  velocity and derived telemetry (EGT, fuel flow, thrust).
- **Particle-based effects** — fuel injection, combustion glow, exhaust
  plume, heat haze, and shock diamonds, all RPM-reactive.
- **Three view modes** — Normal, semi-transparent Cutaway, and axially
  separated Exploded view, each with smooth GSAP transitions.
- **Engineering dashboard** — analog-style RPM gauge, EGT/fuel/thrust
  readouts, and component status LEDs.
- **Automated diagnostics** — a ten-step simulated test sequence with
  live pass/fail reporting.
- **Interactive hotspots** — screen-space labels tied to 3D component
  positions, each opening a detailed information panel on click.
- **Procedural engine audio** — Web Audio API oscillators generate
  idle, spool-up, and cruise tones that track RPM in real time.
- **Adaptive performance** — a background quality controller monitors
  sustained FPS and automatically scales bloom and shadow quality up
  or down, with manual override in Settings.
- **Responsive layout** — dashboard reflows into a stacked layout on
  tablets and phones.
- **Accessibility** — ARIA labels on all interactive controls.
- **Developer tools** — an optional debug overlay (`?debug=true` or
  `Ctrl+Shift+D`) reporting FPS, RPM, memory, and scene statistics.

---

## Architecture Notes

The application follows an object-oriented, modular structure. Each file
exposes one or more classes with a single responsibility:

- `JetEngineSimulator` (`main.js`) owns the render loop and coordinates
  every other subsystem.
- `JetEngine` (`engine.js`) owns all engine geometry, materials, and
  view-mode transitions.
- `ParticleSystem` (`particles.js`) owns all `THREE.Points`-based effects.
- `AudioManager` (`audio.js`) owns Web Audio API synthesis.
- `UIManager` (`ui.js`) owns DOM event wiring, gauges, and modals.
- `DiagnosticsSystem` (`diagnostics.js`) owns the automated test sequence.
- `AdaptiveQuality`, `DebugTools`, `ErrorHandler`, `MobileSupport`, and
  `Telemetry` (`utils.js`) provide cross-cutting support services.

Subsystems communicate through the shared `simulator` instance rather
than global state, with the exception of `window.uiManager`, which is
intentionally exposed for cross-module UI callbacks.

---

## Known Limitations

- Audio is fully synthesized (no sampled `.mp3` assets are bundled by
  default); the `assets/sounds/` folder is provided for anyone wanting
  to swap in recorded engine audio.
- Textures in `assets/textures/` are referenced as an extension point
  for PBR maps but are not required for the current material setup,
  which uses procedural `MeshStandardMaterial` properties.
- This is a real-time educational/demonstration visualization, not a
  certified engineering simulation tool — telemetry values are derived
  from simplified formulas for visual and pedagogical clarity.

---

## Browser Support

Tested on current versions of Chrome, Edge, Firefox, and Safari, on
both desktop and mobile. WebGL2 support is required; the app will not
run in browsers without WebGL.

---

## License

Provided as a demonstration project. Adapt and extend freely for
educational, portfolio, or internal engineering-visualization use.
