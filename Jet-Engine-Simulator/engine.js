/* ========================================
   JET ENGINE GEOMETRY AND ANIMATION
   Complete 3D turbofan engine model
   All components with PBR materials
   ======================================== */

/**
 * JetEngine Class
 * Creates and manages the complete turbofan engine geometry
 * Includes: fan, compressors, combustor, turbines, nozzle
 */
class JetEngine {
    /**
     * Constructor
     * @param {THREE.Scene} scene - Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // === ENGINE COMPONENTS ===
        this.components = {};
        this.fan = null;
        this.compressors = [];
        this.combustor = null;
        this.turbines = [];
        this.nozzle = null;
        this.nacelle = null;
        this.shaft = null;
        
        // === GROUPING ===
        this.engineGroup = new THREE.Group();
        this.rotatingGroup = new THREE.Group();
        
        // === ANIMATION STATE ===
        this.rpm = 0;
        this.rotationSpeed = 0;
        this.cutawayMode = false;
        this.explodedMode = false;
        this.originalPositions = new Map();
        
        // === MATERIALS ===
        this.materials = {};
        
        // === HOTSPOTS FOR INTERACTION ===
        this.hotspots = [];
    }
    
    /**
     * Initialize engine
     * Creates all geometry and materials
     */
    async initialize() {
        // Create materials first
        this.createMaterials();
        
        // Create engine components
        this.createNacelle();
        this.createShaft();
        this.createFan();
        this.createCompressors();
        this.createCombustor();
        this.createTurbines();
        this.createNozzle();
        
        // Build scene hierarchy
        this.engineGroup.add(this.rotatingGroup);
        this.engineGroup.add(this.nacelle);
        this.scene.add(this.engineGroup);
        
        // Create hotspots for UI interaction
        this.createHotspots();
        
        console.log('[ENGINE] Engine initialized successfully');
    }
    
    /**
     * Create PBR materials for engine components
     * Metallic, brushed aluminum, titanium finishes
     */
    createMaterials() {
        // === METALLIC MATERIAL (Titanium) ===
        this.materials.titanium = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.9,
            roughness: 0.2,
            emissive: 0x000000,
            emissiveIntensity: 0
        });
        
        // === BRUSHED ALUMINUM ===
        this.materials.brushedAluminum = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.85,
            roughness: 0.4,
            emissive: 0x000000
        });
        
        // === DARK STEEL ===
        this.materials.darkSteel = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x000000
        });
        
        // === GLOWING COMBUSTOR ===
        this.materials.combustorGlow = new THREE.MeshStandardMaterial({
            color: 0xff6b35,
            metalness: 0.3,
            roughness: 0.5,
            emissive: 0xff6b35,
            emissiveIntensity: 0.2
        });
        
        // === ENGINE CASING (Semi-transparent) ===
        this.materials.casing = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.6,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9,
            emissive: 0x000000
        });
        
        console.log('[MATERIALS] PBR materials created');
    }
    
    /**
     * Create outer nacelle (engine casing)
     */
    createNacelle() {
        this.nacelle = new THREE.Group();
        
        // === OUTER CYLINDER ===
        const nacelleGeometry = new THREE.CylinderGeometry(1.2, 1.2, 8, 64, 1, false);
        const nacelleMesh = new THREE.Mesh(nacelleGeometry, this.materials.casing);
        nacelleMesh.rotation.z = Math.PI / 2;
        nacelleMesh.castShadow = true;
        nacelleMesh.receiveShadow = true;
        this.nacelle.add(nacelleMesh);
        
        // === INLET CONE ===
        const inletGeometry = new THREE.ConeGeometry(1.2, 1.5, 64);
        const inletMesh = new THREE.Mesh(inletGeometry, this.materials.brushedAluminum);
        inletMesh.position.z = -4.5;
        inletMesh.rotation.z = Math.PI;
        inletMesh.castShadow = true;
        inletMesh.receiveShadow = true;
        this.nacelle.add(inletMesh);
        
        // === EXHAUST CONE ===
        const exhaustGeometry = new THREE.ConeGeometry(0.8, 1.2, 64);
        const exhaustMesh = new THREE.Mesh(exhaustGeometry, this.materials.darkSteel);
        exhaustMesh.position.z = 4.5;
        exhaustMesh.castShadow = true;
        exhaustMesh.receiveShadow = true;
        this.nacelle.add(exhaustMesh);
        
        // === MOUNTING PYLONS (Left) ===
        this.createPylon(this.nacelle, -1.3, 0, 0);
        // Mounting pylons (Right)
        this.createPylon(this.nacelle, 1.3, 0, 0);
        
        this.components.nacelle = this.nacelle;
        console.log('[NACELLE] Nacelle created');
    }
    
    /**
     * Create mounting pylon
     * @param {THREE.Group} parent - Parent group
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {number} z - Position Z
     */
    createPylon(parent, x, y, z) {
        const pylonGeometry = new THREE.BoxGeometry(0.15, 0.1, 1.2);
        const pylonMesh = new THREE.Mesh(pylonGeometry, this.materials.titanium);
        pylonMesh.position.set(x, y, z);
        pylonMesh.castShadow = true;
        pylonMesh.receiveShadow = true;
        parent.add(pylonMesh);
    }
    
    /**
     * Create central shaft
     * Connects all rotating components
     */
    createShaft() {
        this.shaft = new THREE.Group();
        
        // === MAIN SHAFT ===
        const shaftGeometry = new THREE.CylinderGeometry(0.15, 0.15, 9, 32);
        const shaftMesh = new THREE.Mesh(shaftGeometry, this.materials.darkSteel);
        shaftMesh.rotation.z = Math.PI / 2;
        shaftMesh.castShadow = true;
        shaftMesh.receiveShadow = true;
        this.shaft.add(shaftMesh);
        
        // === BEARING JOURNALS ===
        for (let i = 0; i < 3; i++) {
            const journalGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 32);
            const journalMesh = new THREE.Mesh(journalGeometry, this.materials.titanium);
            journalMesh.position.z = -3 + i * 3;
            journalMesh.rotation.z = Math.PI / 2;
            journalMesh.castShadow = true;
            journalMesh.receiveShadow = true;
            this.shaft.add(journalMesh);
        }
        
        this.rotatingGroup.add(this.shaft);
        this.components.shaft = this.shaft;
        this.originalPositions.set(this.shaft, { position: this.shaft.position.clone() });
        
        console.log('[SHAFT] Shaft created');
    }
    
    /**
     * Create fan (first stage, low-pressure)
     * Large multi-blade rotor at engine inlet
     */
    createFan() {
        this.fan = new THREE.Group();
        
        // === FAN DISK ===
        const diskGeometry = new THREE.CylinderGeometry(1.0, 1.0, 0.3, 64);
        const diskMesh = new THREE.Mesh(diskGeometry, this.materials.titanium);
        diskMesh.position.z = -3.5;
        diskMesh.rotation.z = Math.PI / 2;
        diskMesh.castShadow = true;
        diskMesh.receiveShadow = true;
        this.fan.add(diskMesh);
        
        // === FAN BLADES ===
        const bladeCount = 24;
        for (let i = 0; i < bladeCount; i++) {
            const angle = (i / bladeCount) * Math.PI * 2;
            this.createBlade(
                this.fan,
                0.95,  // radius
                angle,
                -3.5,  // z position
                0.15,  // blade height
                0.08   // blade width
            );
        }
        
        this.rotatingGroup.add(this.fan);
        this.components.fan = this.fan;
        this.originalPositions.set(this.fan, { position: this.fan.position.clone() });
        
        console.log('[FAN] Fan created with 24 blades');
    }
    
    /**
     * Create turbine blade
     * @param {THREE.Group} parent - Parent group
     * @param {number} radius - Blade radius
     * @param {number} angle - Angular position
     * @param {number} z - Z position along shaft
     * @param {number} height - Blade height
     * @param {number} width - Blade width
     */
    createBlade(parent, radius, angle, z, height, width) {
        const bladeGeometry = new THREE.BoxGeometry(width, height, 0.05);
        const bladeMesh = new THREE.Mesh(bladeGeometry, this.materials.brushedAluminum);
        
        // Position blade
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        bladeMesh.position.set(x, y, z);
        
        // Rotate blade to point outward
        bladeMesh.rotation.z = angle;
        
        // Add slight twist (airfoil effect)
        const twistAngle = Math.atan2(y, x);
        bladeMesh.rotation.y = twistAngle * 0.3;
        
        bladeMesh.castShadow = true;
        bladeMesh.receiveShadow = true;
        parent.add(bladeMesh);
    }
    
    /**
     * Create compressors (Low-Pressure and High-Pressure)
     */
    createCompressors() {
        // === LOW-PRESSURE COMPRESSOR (LPC) ===
        const lpc = this.createCompressorStage(-2.0, 5, 'LPC');
        this.rotatingGroup.add(lpc);
        this.components.lpc = lpc;
        this.originalPositions.set(lpc, { position: lpc.position.clone() });
        this.compressors.push(lpc);
        
        // === HIGH-PRESSURE COMPRESSOR (HPC) ===
        const hpc = this.createCompressorStage(0.0, 8, 'HPC');
        this.rotatingGroup.add(hpc);
        this.components.hpc = hpc;
        this.originalPositions.set(hpc, { position: hpc.position.clone() });
        this.compressors.push(hpc);
        
        console.log('[COMPRESSORS] LPC and HPC stages created');
    }
    
    /**
     * Create single compressor stage
     * @param {number} z - Z position
     * @param {number} bladeCount - Number of blades
     * @param {string} name - Stage name
     * @returns {THREE.Group} Compressor stage group
     */
    createCompressorStage(z, bladeCount, name) {
        const stage = new THREE.Group();
        
        // === COMPRESSOR DISK ===
        const diskGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.25, 64);
        const diskMesh = new THREE.Mesh(diskGeometry, this.materials.titanium);
        diskMesh.position.z = z;
        diskMesh.rotation.z = Math.PI / 2;
        diskMesh.castShadow = true;
        diskMesh.receiveShadow = true;
        stage.add(diskMesh);
        
        // === COMPRESSOR BLADES ===
        for (let i = 0; i < bladeCount; i++) {
            const angle = (i / bladeCount) * Math.PI * 2;
            this.createBlade(
                stage,
                0.75,  // radius
                angle,
                z,
                0.12,  // blade height
                0.06   // blade width
            );
        }
        
        stage.userData = { name: name };
        return stage;
    }
    
    /**
     * Create combustor (combustion chamber)
     */
    createCombustor() {
        this.combustor = new THREE.Group();
        
        // === COMBUSTOR CASING ===
        const combustorGeometry = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 64);
        const combustorMesh = new THREE.Mesh(combustorGeometry, this.materials.combustorGlow);
        combustorMesh.position.z = 1.2;
        combustorMesh.rotation.z = Math.PI / 2;
        combustorMesh.castShadow = true;
        combustorMesh.receiveShadow = true;
        this.combustor.add(combustorMesh);
        
        // === FLAME HOLDER ===
        const flameHolderGeometry = new THREE.TorusGeometry(0.65, 0.08, 16, 100);
        const flameHolderMesh = new THREE.Mesh(flameHolderGeometry, this.materials.darkSteel);
        flameHolderMesh.position.z = 0.8;
        flameHolderMesh.rotation.y = Math.PI / 2;
        flameHolderMesh.castShadow = true;
        flameHolderMesh.receiveShadow = true;
        this.combustor.add(flameHolderMesh);
        
        // === FUEL INJECTORS ===
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const x = Math.cos(angle) * 0.6;
            const y = Math.sin(angle) * 0.6;
            
            const injectorGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16);
            const injectorMesh = new THREE.Mesh(injectorGeometry, this.materials.titanium);
            injectorMesh.position.set(x, y, 0.7);
            injectorMesh.rotation.z = angle + Math.PI / 2;
            injectorMesh.castShadow = true;
            this.combustor.add(injectorMesh);
        }
        
        // Store original position for exploded view
        this.originalPositions.set(this.combustor, { position: this.combustor.position.clone() });
        this.components.combustor = this.combustor;
        this.scene.add(this.combustor);
        
        console.log('[COMBUSTOR] Combustor created');
    }
    
    /**
     * Create turbines (High-Pressure and Low-Pressure)
     */
    createTurbines() {
        // === HIGH-PRESSURE TURBINE (HPT) ===
        const hpt = this.createTurbineStage(2.2, 6, 'HPT');
        this.rotatingGroup.add(hpt);
        this.components.hpt = hpt;
        this.originalPositions.set(hpt, { position: hpt.position.clone() });
        this.turbines.push(hpt);
        
        // === LOW-PRESSURE TURBINE (LPT) ===
        const lpt = this.createTurbineStage(3.2, 5, 'LPT');
        this.rotatingGroup.add(lpt);
        this.components.lpt = lpt;
        this.originalPositions.set(lpt, { position: lpt.position.clone() });
        this.turbines.push(lpt);
        
        console.log('[TURBINES] HPT and LPT stages created');
    }
    
    /**
     * Create single turbine stage
     * @param {number} z - Z position
     * @param {number} bladeCount - Number of blades
     * @param {string} name - Stage name
     * @returns {THREE.Group} Turbine stage group
     */
    createTurbineStage(z, bladeCount, name) {
        const stage = new THREE.Group();
        
        // === TURBINE DISK ===
        const diskGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.2, 64);
        const diskMesh = new THREE.Mesh(diskGeometry, this.materials.darkSteel);
        diskMesh.position.z = z;
        diskMesh.rotation.z = Math.PI / 2;
        diskMesh.castShadow = true;
        diskMesh.receiveShadow = true;
        stage.add(diskMesh);
        
        // === TURBINE BLADES ===
        for (let i = 0; i < bladeCount; i++) {
            const angle = (i / bladeCount) * Math.PI * 2;
            this.createBlade(
                stage,
                0.65,  // radius
                angle,
                z,
                0.10,  // blade height
                0.05   // blade width
            );
        }
        
        stage.userData = { name: name };
        return stage;
    }
    
    /**
     * Create exhaust nozzle
     */
    createNozzle() {
        this.nozzle = new THREE.Group();
        
        // === NOZZLE GUIDE VANES ===
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const vaneGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.15);
            const vaneMesh = new THREE.Mesh(vaneGeometry, this.materials.brushedAluminum);
            
            const x = Math.cos(angle) * 0.5;
            const y = Math.sin(angle) * 0.5;
            vaneMesh.position.set(x, y, 4.0);
            vaneMesh.rotation.z = angle;
            vaneMesh.castShadow = true;
            vaneMesh.receiveShadow = true;
            this.nozzle.add(vaneMesh);
        }
        
        // === EXHAUST CONE ===
        const exhaustConeGeometry = new THREE.ConeGeometry(0.5, 0.8, 64);
        const exhaustConeMesh = new THREE.Mesh(exhaustConeGeometry, this.materials.darkSteel);
        exhaustConeMesh.position.z = 4.5;
        exhaustConeMesh.castShadow = true;
        exhaustConeMesh.receiveShadow = true;
        this.nozzle.add(exhaustConeMesh);
        
        this.originalPositions.set(this.nozzle, { position: this.nozzle.position.clone() });
        this.components.nozzle = this.nozzle;
        this.scene.add(this.nozzle);
        
        console.log('[NOZZLE] Nozzle created');
    }
    
    /**
     * Create interactive hotspots for UI
     */
    createHotspots() {
        const hotspotData = [
            { name: 'Fan', component: this.components.fan, position: new THREE.Vector3(-3.5, 0, 0) },
            { name: 'LPC', component: this.components.lpc, position: new THREE.Vector3(-2.0, 0, 0) },
            { name: 'HPC', component: this.components.hpc, position: new THREE.Vector3(0.0, 0, 0) },
            { name: 'Combustor', component: this.components.combustor, position: new THREE.Vector3(1.2, 0, 0) },
            { name: 'HPT', component: this.components.hpt, position: new THREE.Vector3(2.2, 0, 0) },
            { name: 'LPT', component: this.components.lpt, position: new THREE.Vector3(3.2, 0, 0) },
            { name: 'Nozzle', component: this.components.nozzle, position: new THREE.Vector3(4.5, 0, 0) }
        ];
        
        this.hotspots = hotspotData;
        console.log('[HOTSPOTS] Created ' + hotspotData.length + ' hotspots');
    }
    
    /**
     * Update engine animation
     * Called each frame
     * @param {number} deltaTime - Delta time in seconds
     * @param {number} rpm - Current RPM
     */
    update(deltaTime, rpm) {
        this.rpm = rpm;
        
        // === CALCULATE ROTATION SPEED ===
        // RPM to radians per second: (RPM / 60) * 2π
        this.rotationSpeed = (rpm / 60) * Math.PI * 2;
        
        // === ROTATE ALL COMPONENTS ===
        this.rotatingGroup.rotation.z += this.rotationSpeed * deltaTime;
        
        // === UPDATE COMBUSTOR GLOW INTENSITY ===
        const glowIntensity = (rpm / 100000) * 0.5; // 0 to 0.5
        this.materials.combustorGlow.emissiveIntensity = glowIntensity;
    }
    
    /**
     * Show cutaway view
     * Remove portions of nacelle to see internals
     */
    showCutaway() {
        if (this.cutawayMode) return;
        
        this.cutawayMode = true;
        this.explodedMode = false;
        
        // Make nacelle semi-transparent
        gsap.to(this.materials.casing, {
            opacity: 0.3,
            duration: 0.6
        });
        
        console.log('[VIEW] Cutaway mode enabled');
    }
    
    /**
     * Show exploded view
     * Separate components along the axis
     */
    showExploded() {
        if (this.explodedMode) return;
        
        this.explodedMode = true;
        this.cutawayMode = false;
        
        // Make nacelle visible
        gsap.to(this.materials.casing, {
            opacity: 0.9,
            duration: 0.6
        });
        
        // Explode components outward along Z axis
        const explodeDistance = 3;
        
        // Animate each component
        Object.entries(this.components).forEach(([name, component]) => {
            if (!component || !this.originalPositions.has(component)) return;
            
            const original = this.originalPositions.get(component).position;
            const direction = original.z > 0 ? 1 : -1;
            
            gsap.to(component.position, {
                z: original.z + (direction * explodeDistance),
                duration: 0.8,
                ease: 'power2.out'
            });
        });
        
        console.log('[VIEW] Exploded mode enabled');
    }
    
    /**
     * Show normal view
     * Reset to initial configuration
     */
    showNormal() {
        this.cutawayMode = false;
        this.explodedMode = false;
        
        // Reset nacelle opacity
        gsap.to(this.materials.casing, {
          opacity: 0.9,
            duration: 0.6
        });
        
        // Reset component positions
        Object.entries(this.components).forEach(([name, component]) => {
            if (!component || !this.originalPositions.has(component)) return;
            
            const original = this.originalPositions.get(component).position;
            gsap.to(component.position, {
                x: original.x,
                y: original.y,
                z: original.z,
                duration: 0.8,
                ease: 'power2.out'
            });
        });
        
        console.log('[VIEW] Normal mode enabled');
    }
}
