/* ========================================
   PROFESSIONAL JET ENGINE SIMULATOR
   Main Application Controller
   Orchestrates scene, UI, and interactions
   ======================================== */

/**
 * JetEngineSimulator Class
 * Core application manager for the 3D turbofan engine simulator
 * Handles initialization, animation loop, and system state
 */
class JetEngineSimulator {
    /**
     * Constructor - Initialize the simulator
     */
    constructor() {
        // === APPLICATION STATE ===
        this.isInitialized = false;
        this.isRunning = false;
        this.currentRPM = 0;
        this.targetRPM = 0;
        this.throttle = 0;
        
        // === SCENE COMPONENTS ===
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        this.engine = null;
        this.particles = null;
        this.audioManager = null;
        this.diagnostics = null;
        
        // === DISPLAY MODES ===
        this.viewMode = 'normal'; // normal, cutaway, exploded
        this.showParticles = true;
        this.showFlame = true;
        this.showLabels = true;
        
        // === PERFORMANCE METRICS ===
        this.frameCount = 0;
        this.lastFrameTime = Date.now();
        this.fps = 60;
        this.deltaTime = 0;
        
        // === TELEMETRY DATA ===
        this.telemetry = {
            rpm: 0,
            egt: 0,           // Exhaust Gas Temperature
            fuelFlow: 0,
            thrust: 0,
            fanSpeed: 0,
            turbineSpeed: 0
        };
        
        // === WINDOW AND DOM ===
        this.container = document.getElementById('canvas-container');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.enterButton = document.getElementById('enterButton');
        this.progressFill = document.getElementById('progressFill');
        this.loadingText = document.getElementById('loadingText');
        this.statusValue = document.getElementById('statusValue');
        
        // === BIND METHODS ===
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onEnterClick = this.onEnterClick.bind(this);
        
        // === EVENT LISTENERS ===
        window.addEventListener('resize', this.onWindowResize);
        this.enterButton.addEventListener('click', this.onEnterClick);
    }
    
    /**
     * Initialize the complete application
     * Called on page load
     */
    async initialize() {
        try {
           
            ErrorHandler.setup();
           
            this.updateProgress(5, 'Initializing renderer...');
            await this.initializeRenderer();
            
            this.updateProgress(15, 'Setting up scene...');
            await this.initializeScene();
            
            this.updateProgress(25, 'Configuring camera...');
            await this.initializeCamera();
            
            this.updateProgress(35, 'Creating lighting...');
            await this.initializeLighting();
            
            this.updateProgress(45, 'Loading engine geometry...');
            await this.initializeEngine();
            
            this.updateProgress(55, 'Initializing particle systems...');
            await this.initializeParticles();
            
            this.updateProgress(65, 'Setting up audio...');
            await this.initializeAudio();
            
            this.updateProgress(75, 'Initializing UI...');
            await this.initializeUI();
            
            this.updateProgress(85, 'Configuring diagnostics...');
            await this.initializeDiagnostics();
            
            this.updateProgress(95, 'Final setup...');
            await this.finalSetup();
            
            this.updateProgress(100, 'Ready to start');
            this.statusValue.textContent = 'READY';
            
            this.isInitialized = true;
            
            // Enable enter button after slight delay for dramatic effect
            setTimeout(() => {
                this.enterButton.disabled = false;
                gsap.to(this.enterButton, { opacity: 1, duration: 0.6 });
            }, 500);
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.statusValue.textContent = 'ERROR';
            this.loadingText.textContent = 'Initialization failed. Check console.';
        }
    }
    
    /**
     * Update progress bar and loading text
     * @param {number} percent - Progress percentage (0-100)
     * @param {string} text - Loading status text
     */
    updateProgress(percent, text) {
        this.progressFill.style.width = percent + '%';
        this.loadingText.textContent = text;
        console.log(`[INIT] ${percent}% - ${text}`);
    }
    
    /**
     * Initialize Three.js renderer
     * Sets up WebGL context, post-processing, and rendering pipeline
     */
    async initializeRenderer() {
        // === CREATE RENDERER ===
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            precision: 'highp',
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x050812, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // === APPEND TO CONTAINER ===
        this.container.appendChild(this.renderer.domElement);
        
        // === POST-PROCESSING SETUP ===
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Render Pass - Standard rendering
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom Pass - Cyan glow effects
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,    // strength
            0.4,    // radius
            0.85    // threshold
        );
        this.composer.addPass(bloomPass);
        
        console.log('[RENDERER] WebGL context initialized');
    }
    
    /**
     * Initialize the Three.js scene
     * Sets up the 3D environment
     */
    async initializeScene() {
        // === CREATE SCENE ===
        this.scene = new THREE.Scene();
        
        // === FOG (OPTIONAL) ===
        // this.scene.fog = new THREE.Fog(0x050812, 1000, 5000);
        
        // === BACKGROUND ===
        this.scene.background = new THREE.Color(0x050812);
        
        console.log('[SCENE] Scene created and configured');
    }
    
    /**
     * Initialize camera
     * Sets up perspective and initial position
     */
    async initializeCamera() {
        // === CREATE CAMERA ===
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;
        
        this.camera = new THREE.PerspectiveCamera(
            75,           // FOV
            aspect,       // Aspect ratio
            0.1,          // Near plane
            10000         // Far plane
        );
        
        // === INITIAL POSITION ===
        // Position camera to view the engine from a good angle
        this.camera.position.set(3, 2, 3);
        this.camera.lookAt(0, 0, 0);
        
        // === ORBIT CONTROLS ===
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 2;
        
        // === CONTROL CONSTRAINTS ===
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;
        
        console.log('[CAMERA] Camera and controls initialized');
    }
    
    /**
     * Initialize scene lighting
     * Sets up HDR-style professional lighting
     */
    async initializeLighting() {
        // === AMBIENT LIGHT ===
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // === DIRECTIONAL LIGHT (Main) ===
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 20;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // === FILL LIGHT ===
        const fillLight = new THREE.DirectionalLight(0x0099ff, 0.3);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);
        
        // === ACCENT LIGHT (Cyan) ===
        const accentLight = new THREE.PointLight(0x00D9FF, 0.4);
        accentLight.position.set(0, 2, -5);
        this.scene.add(accentLight);
        
        // === BACK LIGHT ===
        const backLight = new THREE.DirectionalLight(0xff6b35, 0.2);
        backLight.position.set(0, -2, -5);
        this.scene.add(backLight);
        
        console.log('[LIGHTING] Lighting setup complete');
    }
    
    /**
     * Initialize engine geometry
     * Creates the 3D turbofan engine model
     * Delegate to engine.js
     */
    async initializeEngine() {
        if (typeof JetEngine === 'undefined') {
            throw new Error('JetEngine class not loaded');
        }
        
        this.engine = new JetEngine(this.scene);
        await this.engine.initialize();
        
        console.log('[ENGINE] Engine geometry created');
    }
    
    /**
     * Initialize particle system
     * Sets up fuel flow, combustion, and exhaust particles
     */
    async initializeParticles() {
        if (typeof ParticleSystem === 'undefined') {
            throw new Error('ParticleSystem class not loaded');
        }
        
        this.particles = new ParticleSystem(this.scene);
        await this.particles.initialize();
        
        console.log('[PARTICLES] Particle system initialized');
    }
    
    /**
     * Initialize audio system
     * Sets up engine sounds
     */
    async initializeAudio() {
        if (typeof AudioManager === 'undefined') {
            throw new Error('AudioManager class not loaded');
        }
        
        this.audioManager = new AudioManager();
        await this.audioManager.initialize();
        
        console.log('[AUDIO] Audio system initialized');
    }
    
    /**
     * Initialize UI system
     * Sets up interactive controls
     */
    async initializeUI() {
        if (typeof UIManager === 'undefined') {
            throw new Error('UIManager class not loaded');
        }
        
        // Create UI manager
        window.uiManager = new UIManager(this);
        await window.uiManager.initialize();
        
        console.log('[UI] UI system initialized');
    }
    
    /**
     * Initialize diagnostics system
     * Sets up automated testing and analysis
     */
    async initializeDiagnostics() {
        if (typeof DiagnosticsSystem === 'undefined') {
            throw new Error('DiagnosticsSystem class not loaded');
        }
        
        this.diagnostics = new DiagnosticsSystem(this);
        await this.diagnostics.initialize();
        
        console.log('[DIAGNOSTICS] Diagnostics system initialized');
    }
    
    /**
     * Final setup and validation
     */
    async finalSetup() {
        // === START ANIMATION LOOP ===
        this.isRunning = true;
        this.animate();
        
        // === ENABLE WINDOW RESIZE HANDLING ===
        window.addEventListener('resize', this.onWindowResize);
        
        console.log('[SETUP] Final setup complete, animation loop started');
    }
    
    /**
     * Window resize handler
     * Updates camera and renderer on window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Update camera
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
        
        console.log(`[RESIZE] Window resized to ${width}x${height}`);
    }
    
    /**
     * Enter button click handler
     * Transition from welcome screen to main application
     */
    onEnterClick() {
        if (!this.isInitialized) return;
        
        // Animate out welcome screen
        gsap.to(this.welcomeScreen, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                this.welcomeScreen.style.display = 'none';
            }
        });
        
        // Animate in header
        gsap.to('#mainHeader', {
            opacity: 1,
            duration: 0.6,
            delay: 0.2
        });
        
        // Animate in dashboard
        gsap.to('#dashboardContainer', {
            opacity: 1,
            duration: 0.8,
            delay: 0.3
        });
        
        console.log('[UI] Application initialized and visible');
    }
    
    /**
     * Main animation loop
     * Called every frame
     */
    animate() {
        requestAnimationFrame(this.animate);
       if (MobileSupport.isMobile()) {
     MobileSupport.adaptForMobile();
     PerformanceOptimization.optimizeParticles(this);
     PerformanceOptimization.optimizeTextures(this);
       }
       PerformanceOptimization.monitorPerformance(this);
        
        // === CALCULATE DELTA TIME ===
        const now = Date.now();
        this.deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // === FPS CALCULATION ===
        this.frameCount++;
        this.fps = Math.round(1 / this.deltaTime);
        
        // === UPDATE CONTROLS ===
        if (this.controls) {
            this.controls.update();
        }
        
        // === UPDATE ENGINE ===
        if (this.engine && this.isInitialized) {
            this.engine.update(this.deltaTime, this.currentRPM);
        }
        
        // === UPDATE PARTICLES ===
        if (this.particles && this.isInitialized) {
            this.particles.update(this.deltaTime, this.currentRPM);
        }
        
        // === UPDATE AUDIO ===
        if (this.audioManager && this.isInitialized) {
            this.audioManager.update(this.currentRPM, this.throttle);
        }
        
        // === RENDER SCENE ===
        if (this.composer) {
            this.composer.render();
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * Set engine RPM
     * @param {number} rpm - Target RPM
     */
    setRPM(rpm) {
        this.targetRPM = Math.max(0, Math.min(100000, rpm));
        
        // Smooth RPM transition
        gsap.to(this, {
            currentRPM: this.targetRPM,
            duration: 0.5,
            ease: 'power1.inOut'
        });
    }
    
    /**
     * Set throttle position
     * @param {number} throttle - Throttle percentage (0-100)
     */
    setThrottle(throttle) {
        this.throttle = Math.max(0, Math.min(100, throttle));
        this.setRPM(this.throttle * 1000); // Scale throttle to RPM
    }
    
    /**
     * Update telemetry values
     * Calculate derived metrics from RPM
     */
    updateTelemetry() {
        const rpmPercent = this.currentRPM / 100000;
        
        this.telemetry.rpm = Math.round(this.currentRPM);
        this.telemetry.egt = Math.round(300 + rpmPercent * 1000); // 300-1300°C
        this.telemetry.fuelFlow = Math.round(rpmPercent * 5000);   // 0-5000 kg/h
        this.telemetry.thrust = Math.round(rpmPercent * 100);      // 0-100 kN
        this.telemetry.fanSpeed = rpmPercent * 10000;
        this.telemetry.turbineSpeed = rpmPercent * 20000;
    }
    
    /**
     * Switch view mode
     * @param {string} mode - 'normal', 'cutaway', or 'exploded'
     */
    setViewMode(mode) {
        this.viewMode = mode;
        
        if (this.engine) {
            switch(mode) {
                case 'cutaway':
                    this.engine.showCutaway();
                    break;
                case 'exploded':
                    this.engine.showExploded();
                    break;
                default:
                    this.engine.showNormal();
            }
        }
        
        console.log(`[VIEW] Switched to ${mode} mode`);
    }
}

/**
 * Application Entry Point
 * Initialize simulator on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('='.repeat(50));
    console.log('PROFESSIONAL JET ENGINE SIMULATOR');
    console.log('Version 1.0.0');
    console.log('='.repeat(50));
    
    // Create and initialize simulator
    window.simulator = new JetEngineSimulator();
    window.simulator.initialize();
});

/**
 * Handle page visibility changes
 * Pause/resume animation when tab loses/gains focus
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('[APP] Application paused (tab hidden)');
        if (window.simulator && window.simulator.audioManager) {
            window.simulator.audioManager.pauseAll();
        }
    } else {
        console.log('[APP] Application resumed (tab visible)');
        if (window.simulator && window.simulator.audioManager) {
            window.simulator.audioManager.resumeAll();
        }
    }
});

/**
 * Handle page unload
 * Cleanup resources
 */
window.addEventListener('beforeunload', () => {
    if (window.simulator) {
        window.simulator.isRunning = false;
        if (window.simulator.audioManager) {
            window.simulator.audioManager.stopAll();
        }
    }
});
