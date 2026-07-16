/* ========================================
   PARTICLE SYSTEM
   Fuel flow, combustion, and exhaust effects
   ======================================== */

/**
 * ParticleSystem Class
 * Manages all particle effects for the engine
 * Includes: fuel flow, combustion particles, exhaust
 */
class ParticleSystem {
    /**
     * Constructor
     * @param {THREE.Scene} scene - Three.js scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // === PARTICLE SYSTEMS ===
        this.fuelFlowParticles = null;
        this.combustionParticles = null;
        this.exhaustParticles = null;
        this.heatHazeParticles = null;
        
        // === RENDER TARGETS FOR EFFECTS ===
        this.shockDiamondMesh = null;
        
        // === ANIMATION STATE ===
        this.rpm = 0;
        this.emissionRate = 0;
    }
    
    /**
     * Initialize particle systems
     */
    async initialize() {
        this.createFuelFlowSystem();
        this.createCombustionSystem();
        this.createExhaustSystem();
        this.createHeatHazeSystem();
        this.createShockDiamonds();
        
        console.log('[PARTICLES] Particle systems initialized');
    }
    
    /**
     * Create fuel flow particle system
     * Visualizes fuel injection into combustor
     */
    createFuelFlowSystem() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        
        // === POSITIONS ===
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = Math.random() * 5 - 2.5;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // === MATERIAL ===
        const material = new THREE.PointsMaterial({
            color: 0x00D9FF,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        
        this.fuelFlowParticles = new THREE.Points(geometry, material);
        this.scene.add(this.fuelFlowParticles);
        
        console.log('[FUEL] Fuel flow particles created');
    }
    
    /**
     * Create combustion particle system
     * Orange/red particles in combustor
     */
    createCombustionSystem() {
        const particleCount = 800;
        const geometry = new THREE.BufferGeometry();
        
        // === POSITIONS ===
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1.4;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.4;
            positions[i * 3 + 2] = 1.2 + Math.random() * 1.5;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // === COLORS ===
        const colors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            colors[i * 3] = 1.0;        // R
            colors[i * 3 + 1] = 0.4;    // G
            colors[i * 3 + 2] = 0.2;    // B
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // === MATERIAL ===
        const material = new THREE.PointsMaterial({
            size: 0.08,
            transparent: true,
            opacity: 0.7,
            vertexColors: true,
            sizeAttenuation: true
        });
        
        this.combustionParticles = new THREE.Points(geometry, material);
        this.scene.add(this.combustionParticles);
        
        console.log('[COMBUSTION] Combustion particles created');
    }
    
    /**
     * Create exhaust particle system
     * High-temperature gas exiting nozzle
     */
    createExhaustSystem() {
        const particleCount = 600;
        const geometry = new THREE.BufferGeometry();
        
        // === POSITIONS ===
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1.0;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.0;
            positions[i * 3 + 2] = 4.5 + Math.random() * 3;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // === MATERIAL ===
        const material = new THREE.PointsMaterial({
            color: 0xFFAA33,
            size: 0.1,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true
        });
        
        this.exhaustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.exhaustParticles);
        
        console.log('[EXHAUST] Exhaust particles created');
    }
    
    /**
     * Create heat haze particle system
     * Shimmer effect around exhaust
     */
    createHeatHazeSystem() {
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        
        // === POSITIONS ===
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1.2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
            positions[i * 3 + 2] = 4.5 + Math.random() * 2.5;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // === MATERIAL ===
        const material = new THREE.PointsMaterial({
            color: 0xFF6B35,
            size: 0.15,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true
        });
        
        this.heatHazeParticles = new THREE.Points(geometry, material);
        this.scene.add(this.heatHazeParticles);
        
        console.log('[HEAT] Heat haze particles created');
    }
    
    /**
     * Create shock diamond visualization
     * Characteristic pattern in supersonic jet exhaust
     */
    createShockDiamonds() {
        // === CREATE SHOCK DIAMOND GEOMETRY ===
        const shockGroup = new THREE.Group();
        
        for (let i = 0; i < 3; i++) {
            const diamondGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.3);
            const diamondMaterial = new THREE.MeshBasicMaterial({
                color: 0xFF6B35,
                transparent: true,
                opacity: 0.15,
                wireframe: false
            });
            
            const diamondMesh = new THREE.Mesh(diamondGeometry, diamondMaterial);
            diamondMesh.position.z = 5 + i * 0.5;
            diamondMesh.scale.set(1 - i * 0.15, 1 - i * 0.15, 1);
            
            shockGroup.add(diamondMesh);
        }
        
        this.shockDiamondMesh = shockGroup;
        this.scene.add(this.shockDiamondMesh);
        
        console.log('[SHOCK] Shock diamonds created');
    }
    
    /**
     * Update particle systems
     * Called each frame
     * @param {number} deltaTime - Delta time in seconds
     * @param {number} rpm - Current RPM
     */
    update(deltaTime, rpm) {
        this.rpm = rpm;
        const rpmNorm = rpm / 100000; // Normalize to 0-1
        
        // === UPDATE FUEL FLOW ===
        if (this.fuelFlowParticles) {
            this.updateFuelFlow(deltaTime, rpmNorm);
        }
        
        // === UPDATE COMBUSTION ===
        if (this.combustionParticles) {
            this.updateCombustion(deltaTime, rpmNorm);
        }
        
        // === UPDATE EXHAUST ===
        if (this.exhaustParticles) {
            this.updateExhaust(deltaTime, rpmNorm);
        }
        
        // === UPDATE HEAT HAZE ===
        if (this.heatHazeParticles) {
            this.updateHeatHaze(deltaTime, rpmNorm);
        }
        
        // === UPDATE SHOCK DIAMONDS ===
        if (this.shockDiamondMesh) {
            this.updateShockDiamonds(deltaTime, rpmNorm);
        }
    }
    
    /**
     * Update fuel flow particle animation
     * @param {number} deltaTime - Delta time
     * @param {number} rpmNorm - Normalized RPM (0-1)
     */
    updateFuelFlow(deltaTime, rpmNorm) {
        const positions = this.fuelFlowParticles.geometry.attributes.position.array;
        const velocity = rpmNorm * 2; // Fuel flow speed
        
        for (let i = 0; i < positions.length; i += 3) {
            // Move particles forward (Z direction)
            positions[i + 2] += velocity * deltaTime;
            
            // Reset particles that exit
            if (positions[i + 2] > 2.5) {
                positions[i + 2] = -2.5;
            }
            
            // Add some turbulence
            positions[i] += Math.sin(positions[i + 2] * 3 + Date.now() * 0.001) * 0.01;
            positions[i + 1] += Math.cos(positions[i + 2] * 3 + Date.now() * 0.001) * 0.01;
        }
        
        this.fuelFlowParticles.geometry.attributes.position.needsUpdate = true;
        
        // === UPDATE OPACITY ===
        this.fuelFlowParticles.material.opacity = 0.3 + (rpmNorm * 0.4);
    }
    
    /**
     * Update combustion particle animation
     * @param {number} deltaTime - Delta time
     * @param {number} rpmNorm - Normalized RPM (0-1)
     */
    updateCombustion(deltaTime, rpmNorm) {
        const positions = this.combustionParticles.geometry.attributes.position.array;
        const velocity = rpmNorm * 1.5;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Move particles backward (away from inlet)
            positions[i + 2] += velocity * deltaTime;
            
            // Reset particles
            if (positions[i + 2] > 3.0) {
                positions[i] = (Math.random() - 0.5) * 1.4;
                positions[i + 1] = (Math.random() - 0.5) * 1.4;
                positions[i + 2] = 1.2;
            }
            
            // Turbulent motion
            positions[i] += (Math.random() - 0.5) * 0.02;
            positions[i + 1] += (Math.random() - 0.5) * 0.02;
        }
        
        this.combustionParticles.geometry.attributes.position.needsUpdate = true;
        
        // === UPDATE OPACITY BASED ON RPM ===
        this.combustionParticles.material.opacity = 0.2 + (rpmNorm * 0.6);
    }
    
    /**
     * Update exhaust particle animation
     * @param {number} deltaTime - Delta time
     * @param {number} rpmNorm - Normalized RPM (0-1)
     */
    updateExhaust(deltaTime, rpmNorm) {
        const positions = this.exhaustParticles.geometry.attributes.position.array;
        const velocity = rpmNorm * 3; // Fast exhaust flow
        
        for (let i = 0; i < positions.length; i += 3) {
            // Move particles along Z (exhaust direction)
            positions[i + 2] += velocity * deltaTime;
            
            // Expand outward
            if (positions[i + 2] > 4.5) {
                const distance = Math.sqrt(positions[i] * positions[i] + positions[i + 1] * positions[i + 1]);
                positions[i] += (positions[i] / (distance + 0.1)) * 0.02;
                positions[i + 1] += (positions[i + 1] / (distance + 0.1)) * 0.02;
            }
            
            // Reset particles
            if (positions[i + 2] > 8) {
                positions[i] = (Math.random() - 0.5) * 1.0;
                positions[i + 1] = (Math.random() - 0.5) * 1.0;
                positions[i + 2] = 4.5;
            }
        }
        
        this.exhaustParticles.geometry.attributes.position.needsUpdate = true;
        
        // === OPACITY BASED ON RPM ===
        this.exhaustParticles.material.opacity = rpmNorm * 0.8;
    }
    
    /**
     * Update heat haze animation
     * @param {number} deltaTime - Delta time
     * @param {number} rpmNorm - Normalized RPM (0-1)
     */
    updateHeatHaze(deltaTime, rpmNorm) {
        const positions = this.heatHazeParticles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Shimmer effect
            positions[i] += Math.sin(Date.now() * 0.002 + i) * 0.01;
            positions[i + 1] += Math.cos(Date.now() * 0.003 + i) * 0.01;
            
            // Slight drift outward
            positions[i + 2] += rpmNorm * 0.5 * deltaTime;
            
            // Reset
            if (positions[i + 2] > 7) {
                positions[i] = (Math.random() - 0.5) * 1.2;
                positions[i + 1] = (Math.random() - 0.5) * 1.2;
                positions[i + 2] = 4.5;
            }
        }
        
        this.heatHazeParticles.geometry.attributes.position.needsUpdate = true;
        this.heatHazeParticles.material.opacity = rpmNorm * 0.4;
    }
    
    /**
     * Update shock diamond visibility and animation
     * @param {number} deltaTime - Delta time
     * @param {number} rpmNorm - Normalized RPM (0-1)
     */
    updateShockDiamonds(deltaTime, rpmNorm) {
        // Shock diamonds more visible at high RPM
        const targetOpacity = Math.max(0.05, rpmNorm * 0.3);
        
        this.shockDiamondMesh.children.forEach((child, index) => {
            // Pulse effect
            const pulse = Math.sin(Date.now() * 0.001 + index) * 0.05;
            child.material.opacity = targetOpacity + pulse;
            
            // Slight rotation
            child.rotation.z += 0.001 * rpmNorm;
        });
    }
    
    /**
     * Set particle visibility
     * @param {boolean} visible - Visibility state
     */
    setVisible(visible) {
        if (this.fuelFlowParticles) this.fuelFlowParticles.visible = visible;
        if (this.combustionParticles) this.combustionParticles.visible = visible;
        if (this.exhaustParticles) this.exhaustParticles.visible = visible;
        if (this.heatHazeParticles) this.heatHazeParticles.visible = visible;
        if (this.shockDiamondMesh) this.shockDiamondMesh.visible = visible;
    }
}
