/* ========================================
   USER INTERFACE MANAGER
   All UI controls, interactions, and displays
   ======================================== */

/**
 * UIManager Class
 * Manages all user interface elements and interactions
 */
class UIManager {
    /**
     * Constructor
     * @param {JetEngineSimulator} simulator - Main simulator instance
     */
    constructor(simulator) {
        this.simulator = simulator;
        
        // === DOM REFERENCES ===
        this.rpmSlider = document.getElementById('rpmSlider');
        this.throttleSlider = document.getElementById('throttleSlider');
        this.rpmDisplay = document.getElementById('rpmDisplay');
        this.throttleDisplay = document.getElementById('throttleDisplay');
        
        this.modeButtons = document.querySelectorAll('.mode-button');
        this.autoCameraButton = document.getElementById('autoCameraButton');
        this.diagnosticsButton = document.getElementById('diagnosticsButton');
        
        this.showParticlesCheckbox = document.getElementById('showParticles');
        this.showFlameCheckbox = document.getElementById('showFlame');
        this.showLabelsCheckbox = document.getElementById('showLabels');
        
        this.rpmNeedle = document.getElementById('rpmNeedle');
        this.rpmDisplay2 = document.getElementById('rpmDisplay');
        this.egtValue = document.getElementById('egtValue');
        this.fuelFlowValue = document.getElementById('fuelFlowValue');
        this.thrustValue = document.getElementById('thrustValue');
        
        this.fanLED = document.getElementById('fanLED');
        this.combustorLED = document.getElementById('combustorLED');
        this.turbineLED = document.getElementById('turbineLED');
        this.systemHealthLED = document.getElementById('systemHealthLED');
        
        this.settingsButton = document.getElementById('settingsButton');
        this.helpButton = document.getElementById('helpButton');
        this.fullscreenButton = document.getElementById('fullscreenButton');
        
        this.settingsModal = document.getElementById('settingsModal');
        this.infoModal = document.getElementById('infoModal');
        this.modalClose = document.querySelectorAll('.modal-close');
        
        this.hotspotContainer = document.getElementById('hotspotContainer');
        this.tooltip = document.getElementById('tooltip');
        
        // === STATE ===
        this.activeHotspot = null;
        this.labelOffset = 120; // pixels from world position
        
        // === BIND METHODS ===
        this.onRPMChange = this.onRPMChange.bind(this);
        this.onThrottleChange = this.onThrottleChange.bind(this);
        this.onModeChange = this.onModeChange.bind(this);
        this.onCheckboxChange = this.onCheckboxChange.bind(this);
        this.updateGauges = this.updateGauges.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
    }
    
    /**
     * Initialize UI system
     */
    async initialize() {
        this.attachEventListeners();
        this.createHotspotLabels();
        this.startGaugeUpdates();
        
        console.log('[UI] UI system initialized');
    }
    
    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // === RPM AND THROTTLE SLIDERS ===
        this.rpmSlider.addEventListener('input', this.onRPMChange);
        this.throttleSlider.addEventListener('input', this.onThrottleChange);
        
        // === MODE BUTTONS ===
        this.modeButtons.forEach(button => {
            button.addEventListener('click', this.onModeChange);
        });
        
        // === AUTO CAMERA ===
        this.autoCameraButton.addEventListener('click', () => this.startAutoCamera());
        
        // === DIAGNOSTICS ===
        this.diagnosticsButton.addEventListener('click', () => {
            this.simulator.diagnostics.runDiagnostics();
        });
        
        // === CHECKBOXES ===
        this.showParticlesCheckbox.addEventListener('change', this.onCheckboxChange);
        this.showFlameCheckbox.addEventListener('change', this.onCheckboxChange);
        this.showLabelsCheckbox.addEventListener('change', this.onCheckboxChange);
        
        // === HEADER BUTTONS ===
        this.settingsButton.addEventListener('click', () => this.showSettings());
        this.helpButton.addEventListener('click', () => this.showHelp());
        this.fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
        
        // === MODAL CLOSE ===
        this.modalClose.forEach(button => {
            button.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // === WINDOW RESIZE ===
        window.addEventListener('resize', this.onWindowResize);
        
        console.log('[UI] Event listeners attached');
    }
    
    /**
     * Handle RPM slider change
     * @param {Event} event - Change event
     */
    onRPMChange(event) {
        const value = parseFloat(event.target.value);
        const rpm = Utils.map(value, 0, 100, 0, CONFIG.MAX_RPM);
        
        this.simulator.setRPM(rpm);
        this.rpmDisplay.textContent = Utils.formatRPM(rpm);
        
        // === UPDATE THROTTLE SLIDER TO MATCH ===
        this.throttleSlider.value = value;
        this.throttleDisplay.textContent = Math.round(value) + '%';
    }
    
    /**
     * Handle throttle slider change
     * @param {Event} event - Change event
     */
    onThrottleChange(event) {
        const value = parseFloat(event.target.value);
        const rpm = Utils.map(value, 0, 100, 0, CONFIG.MAX_RPM);
        
        this.simulator.setThrottle(value);
        this.throttleDisplay.textContent = Math.round(value) + '%';
        
        // === UPDATE RPM SLIDER TO MATCH ===
        this.rpmSlider.value = value;
        const displayRPM = Utils.map(value, 0, 100, 0, CONFIG.MAX_RPM);
        this.rpmDisplay.textContent = Utils.formatRPM(displayRPM);
    }
    
    /**
     * Handle view mode button changes
     * @param {Event} event - Click event
     */
    onModeChange(event) {
        const button = event.target;
        const mode = button.dataset.mode;
        
        // === UPDATE ACTIVE BUTTON ===
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // === SWITCH VIEW MODE ===
        this.simulator.setViewMode(mode);
    }
    
    /**
     * Handle visualization checkbox changes
     * @param {Event} event - Change event
     */
    onCheckboxChange(event) {
        const checkbox = event.target;
        
        if (checkbox.id === 'showParticles') {
            this.simulator.showParticles = checkbox.checked;
            if (this.simulator.particles) {
                this.simulator.particles.setVisible(checkbox.checked);
            }
        } else if (checkbox.id === 'showFlame') {
            this.simulator.showFlame = checkbox.checked;
            if (this.simulator.particles && this.simulator.particles.combustionParticles) {
                this.simulator.particles.combustionParticles.visible = checkbox.checked;
            }
        } else if (checkbox.id === 'showLabels') {
            this.simulator.showLabels = checkbox.checked;
            this.hotspotContainer.style.display = checkbox.checked ? 'block' : 'none';
        }
    }
    
    /**
     * Create hotspot labels for engine components
     */
    createHotspotLabels() {
        if (!this.simulator.engine || !this.simulator.engine.hotspots) return;
        
        this.simulator.engine.hotspots.forEach(hotspot => {
            const label = document.createElement('div');
            label.className = 'hotspot-label';
            label.textContent = hotspot.name;
            label.dataset.component = hotspot.name;
            label.style.cssText = `
                position: absolute;
                padding: 8px 12px;
                background: rgba(0, 217, 255, 0.1);
                border: 1px solid rgba(0, 217, 255, 0.3);
                border-radius: 4px;
                color: #00D9FF;
                font-size: 11px;
                font-weight: bold;
                letter-spacing: 1px;
                cursor: pointer;
                white-space: nowrap;
                user-select: none;
                transition: all 0.2s ease;
                display: ${this.simulator.showLabels ? 'block' : 'none'};
            `;
            
            // === HOVER EFFECTS ===
            label.addEventListener('mouseenter', (e) => {
                label.style.background = 'rgba(0, 217, 255, 0.3)';
                label.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.5)';
                this.showComponentInfo(hotspot.name);
            });
            
            label.addEventListener('mouseleave', () => {
                label.style.background = 'rgba(0, 217, 255, 0.1)';
                label.style.boxShadow = 'none';
            });
            
            // === CLICK TO SHOW INFO ===
            label.addEventListener('click', () => {
                this.showComponentInfo(hotspot.name);
            });
            
            this.hotspotContainer.appendChild(label);
        });
        
        // === UPDATE POSITIONS EACH FRAME ===
        this.updateHotspotPositions();
    }
    
    /**
     * Update hotspot label positions
     * Project 3D positions to 2D screen coordinates
     */
    updateHotspotPositions() {
        if (!this.simulator.engine || !this.simulator.engine.hotspots) return;
        
        const labels = this.hotspotContainer.querySelectorAll('.hotspot-label');
        const camera = this.simulator.camera;
        const renderer = this.simulator.renderer;
        
        this.simulator.engine.hotspots.forEach((hotspot, index) => {
            if (!labels[index]) return;
            
            const label = labels[index];
            
            // === PROJECT 3D POSITION TO SCREEN ===
            const vector = hotspot.position.clone();
            vector.project(camera);
            
            const widthHalf = renderer.domElement.clientWidth / 2;
            const heightHalf = renderer.domElement.clientHeight / 2;
            
            vector.x = (vector.x * widthHalf) + widthHalf;
            vector.y = -(vector.y * heightHalf) + heightHalf;
            
            // === POSITION LABEL ===
            label.style.left = vector.x + 'px';
            label.style.top = vector.y + 'px';
            label.style.transform = 'translate(-50%, -120%)';
            
            // === HIDE IF BEHIND CAMERA ===
            if (vector.z < 0) {
                label.style.display = 'none';
            } else {
                label.style.display = this.simulator.showLabels ? 'block' : 'none';
            }
        });
        
        // === SCHEDULE NEXT UPDATE ===
        requestAnimationFrame(() => this.updateHotspotPositions());
    }
    
    /**
     * Show component information popup
     * @param {string} componentName - Component name
     */
    showComponentInfo(componentName) {
        const infoData = {
            'Fan': {
                title: 'Fan (Low-Pressure Rotor)',
                description: 'The first stage of the engine. The fan compresses air and splits it into two streams: one through the engine core and one bypassed around the engine (bypass air).',
                specs: [
                    'Blade Count: 24',
                    'Diameter: 2.0 m',
                    'Tip Speed: 450 m/s',
                    'Pressure Ratio: 1.5:1'
                ]
            },
            'LPC': {
                title: 'Low-Pressure Compressor (LPC)',
                description: 'The second stage compressor that further pressurizes the core airflow before it enters the high-pressure compressor.',
                specs: [
                    'Stages: 5',
                    'Blade Count: 5 per stage',
                    'Pressure Ratio: 3.0:1',
                    'Operating Temperature: 400°C'
                ]
            },
            'HPC': {
                title: 'High-Pressure Compressor (HPC)',
                description: 'Compresses air to high pressure for improved combustion efficiency and better overall engine performance.',
                specs: [
                    'Stages: 8',
                    'Blade Count: 8 per stage',
                    'Pressure Ratio: 10.0:1',
                    'Discharge Temperature: 650°C'
                ]
            },
            'Combustor': {
                title: 'Combustor (Combustion Chamber)',
                description: 'Where fuel is injected and mixed with compressed air, then ignited. The resulting hot, high-pressure gases expand and drive the turbines.',
                specs: [
                    'Fuel Injectors: 12',
                    'Combustion Efficiency: 99.5%',
                    'Temperature: 1300°C',
                    'Residence Time: 5-10 ms'
                ]
            },
            'HPT': {
                title: 'High-Pressure Turbine (HPT)',
                description: 'Extracts energy from the hot exhaust gases to drive the high-pressure compressor.',
                specs: [
                    'Stages: 2',
                    'Blade Count: 6 per stage',
                    'Inlet Temperature: 1300°C',
                    'Speed: 20,000 RPM'
                ]
            },
            'LPT': {
                title: 'Low-Pressure Turbine (LPT)',
                description: 'Extracts remaining energy from exhaust gases to drive the fan and low-pressure compressor.',
                specs: [
                    'Stages: 5',
                    'Blade Count: 5 per stage',
                    'Inlet Temperature: 800°C',
                    'Speed: 10,000 RPM'
                ]
            },
            'Nozzle': {
                title: 'Exhaust Nozzle',
                description: 'Accelerates the exhaust gases to high velocity, providing thrust. The convergent-divergent design optimizes flow for supersonic operation.',
                specs: [
                    'Throat Diameter: 0.8 m',
                    'Exit Diameter: 0.9 m',
                    'Exit Velocity: 600 m/s',
                    'Thrust Coefficient: 0.98'
                ]
            }
        };
        
        const info = infoData[componentName];
        if (!info) return;
        
        // === UPDATE MODAL ===
        document.getElementById('modalTitle').textContent = info.title;
        document.getElementById('modalText').textContent = info.description;
        
        const detailsDiv = document.getElementById('modalDetails');
        detailsDiv.innerHTML = info.specs.map(spec => 
            `<div style="padding: 4px 0; border-bottom: 1px solid rgba(0, 217, 255, 0.1);">
                ${spec}
            </div>`
        ).join('');
        
        // === SHOW MODAL ===
        this.infoModal.style.display = 'flex';
        gsap.from(this.infoModal.querySelector('.modal-content'), {
            scale: 0.8,
            opacity: 0,
            duration: 0.3
        });
    }
    
    /**
     * Start automatic camera flight
     * Showcase engine from different angles
     */
    startAutoCamera() {
        const positions = [
            { x: 4, y: 2, z: 4, label: 'Front-Right' },
            { x: -4, y: 2, z: 0, label: 'Side' },
            { x: 0, y: 4, z: 0, label: 'Top' },
            { x: 4, y: 1, z: -4, label: 'Rear-Right' }
        ];
        
        let currentPos = 0;
        const duration = 4; // seconds per position
        
        const flyToNext = () => {
            if (!this.simulator.isRunning) return;
            
            const target = positions[currentPos % positions.length];
            
            gsap.to(this.simulator.camera.position, {
                x: target.x,
                y: target.y,
                z: target.z,
                duration: duration,
                ease: 'sine.inOut',
                onComplete: () => {
                    currentPos++;
                    // Continue flying if still running
                    if (this.simulator.isRunning) {
                        setTimeout(flyToNext, 1000);
                    }
                }
            });
            
            // === UPDATE LOOK-AT ===
            gsap.to(this.simulator.controls.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: duration,
                ease: 'sine.inOut'
            });
        };
        
        flyToNext();
        console.log('[UI] Auto-camera started');
    }
    
    /**
     * Update gauge displays
     * Called periodically to refresh telemetry display
     */
    updateGauges() {
        if (!this.simulator || !this.simulator.isInitialized) {
            setTimeout(() => this.updateGauges(), 100);
            return;
        }
        
        // === UPDATE TELEMETRY ===
        this.simulator.updateTelemetry();
        
        const tel = this.simulator.telemetry;
        
        // === RPM NEEDLE ANIMATION ===
        const rpmPercent = (tel.rpm / CONFIG.MAX_RPM) * 100;
        const needleRotation = Utils.map(rpmPercent, 0, 100, -135, 135);
        
        this.rpmNeedle.style.transform = `rotate(${needleRotation}deg)`;
        
        // === UPDATE VALUE DISPLAYS ===
        this.egtValue.textContent = tel.egt + '°C';
        this.fuelFlowValue.textContent = Utils.formatNumber(tel.fuelFlow) + ' kg/h';
        this.thrustValue.textContent = tel.thrust + ' kN';
        
        // === UPDATE STATUS LEDS ===
        const rpmPercent2 = tel.rpm / CONFIG.MAX_RPM;
        
        // Fan LED
        this.fanLED.style.background = rpmPercent2 > 0.1 ? '#00FF88' : '#707070';
        this.fanLED.style.boxShadow = rpmPercent2 > 0.1 ? '0 0 10px #00FF88' : '0 0 5px #707070';
        
        // Combustor LED
        this.combustorLED.style.background = rpmPercent2 > 0.3 ? '#FFB800' : '#707070';
        this.combustorLED.style.boxShadow = rpmPercent2 > 0.3 ? '0 0 10px #FFB800' : '0 0 5px #707070';
        
        // Turbine LED
        this.turbineLED.style.background = rpmPercent2 > 0.5 ? '#00FF88' : '#707070';
        this.turbineLED.style.boxShadow = rpmPercent2 > 0.5 ? '0 0 10px #00FF88' : '0 0 5px #707070';
        
        // System Health LED
        const health = Utils.getHealthStatus(tel.rpm, CONFIG.MAX_RPM);
        let healthColor = '#00FF88';
        if (health === 'YELLOW') healthColor = '#FFB800';
        if (health === 'RED') healthColor = '#FF3B3B';
        
        this.systemHealthLED.style.background = healthColor;
        this.systemHealthLED.style.boxShadow = `0 0 10px ${healthColor}`;
        
        // === SCHEDULE NEXT UPDATE ===
        setTimeout(() => this.updateGauges(), 100);
    }
    
    /**
     * Start gauge update loop
     */
    startGaugeUpdates() {
        setTimeout(() => this.updateGauges(), 100);
    }
    
    /**
     * Show settings modal
     */
    showSettings() {
        this.settingsModal.style.display = 'flex';
        gsap.from(this.settingsModal.querySelector('.modal-content'), {
            scale: 0.8,
            opacity: 0,
            duration: 0.3
        });
        
        // === ATTACH SETTINGS HANDLERS ===
        const qualitySelect = document.getElementById('qualitySelect');
        const volumeSlider = document.getElementById('volumeSlider');
        const soundCheckbox = document.getElementById('enableSound');
        const particlesCheckbox = document.getElementById('enableParticles');
        
        if (soundCheckbox) {
            soundCheckbox.addEventListener('change', (e) => {
                if (this.simulator.audioManager) {
                    this.simulator.audioManager.setEnabled(e.target.checked);
                }
            });
        }
       if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value) / 100;
                if (this.simulator.audioManager) {
                    this.simulator.audioManager.setVolume(volume);
                }
            });
        }
        
        if (qualitySelect) {
            qualitySelect.addEventListener('change', (e) => {
                this.setGraphicsQuality(e.target.value);
            });
        }
    }
    
    /**
     * Set graphics quality level
     * @param {string} quality - Quality level: low, medium, high, ultra
     */
    setGraphicsQuality(quality) {
        let bloomStrength, bloomRadius, bloomThreshold;
        
        switch(quality) {
            case 'low':
                bloomStrength = 0.8;
                bloomRadius = 0.2;
                bloomThreshold = 0.9;
                break;
            case 'high':
                bloomStrength = 2.0;
                bloomRadius = 0.6;
                bloomThreshold = 0.7;
                break;
            case 'ultra':
                bloomStrength = 2.5;
                bloomRadius = 0.8;
                bloomThreshold = 0.6;
                break;
            default: // medium
                bloomStrength = 1.5;
                bloomRadius = 0.4;
                bloomThreshold = 0.85;
        }
        
        // Apply bloom settings
        if (this.simulator.composer && this.simulator.composer.passes.length > 1) {
            const bloomPass = this.simulator.composer.passes[1];
            if (bloomPass) {
                bloomPass.strength = bloomStrength;
                bloomPass.radius = bloomRadius;
                bloomPass.threshold = bloomThreshold;
            }
        }
        
        console.log(`[UI] Graphics quality set to: ${quality}`);
    }
    
    /**
     * Show help information
     */
    showHelp() {
        const helpContent = `
            <strong>JET ENGINE SIMULATOR - USER GUIDE</strong><br><br>
            
            <strong>Controls:</strong><br>
            • Drag to rotate view<br>
            • Scroll to zoom<br>
            • Right-click drag to pan<br><br>
            
            <strong>Sliders:</strong><br>
            • RPM: Control engine speed (0-100,000 RPM)<br>
            • Throttle: Control throttle position (0-100%)<br><br>
            
            <strong>View Modes:</strong><br>
            • Normal: Standard 3D view<br>
            • Cutaway: Semi-transparent nacelle<br>
            • Exploded: Components separated along axis<br><br>
            
            <strong>Features:</strong><br>
            • Auto Camera: Automated camera flight<br>
            • Diagnostics: Run automated system tests<br>
            • Real-time telemetry display<br>
            • Interactive component information<br>
            • Professional aerospace-grade visualization<br>
        `;
        
        document.getElementById('modalTitle').textContent = 'HELP';
        document.getElementById('modalText').innerHTML = helpContent;
        document.getElementById('modalDetails').innerHTML = '';
        
        this.infoModal.style.display = 'flex';
        gsap.from(this.infoModal.querySelector('.modal-content'), {
            scale: 0.8,
            opacity: 0,
            duration: 0.3
        });
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Fullscreen request failed:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        // Reposition hotspots on resize
        this.updateHotspotPositions();
    }
    } 
     
