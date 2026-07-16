/* ========================================
   UTILITY FUNCTIONS
   Helper methods for the simulator
   ======================================== */

/**
 * Utility namespace
 * Collection of helper functions
 */
const Utils = {
    /**
     * Map a value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input minimum
     * @param {number} inMax - Input maximum
     * @param {number} outMin - Output minimum
     * @param {number} outMax - Output maximum
     * @returns {number} Mapped value
     */
    map: function(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    
    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Time factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp: function(start, end, t) {
        return start + (end - start) * t;
    },
    
    /**
     * Ease-out cubic interpolation
     * @param {number} t - Time factor (0-1)
     * @returns {number} Eased value
     */
    easeOutCubic: function(t) {
        return 1 - Math.pow(1 - t, 3);
    },
    
    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    /**
     * Format RPM value
     * @param {number} rpm - RPM value
     * @returns {string} Formatted RPM
     */
    formatRPM: function(rpm) {
        if (rpm < 1000) {
            return Math.round(rpm) + ' RPM';
        } else if (rpm < 1000000) {
            return (rpm / 1000).toFixed(1) + 'K RPM';
        }
        return (rpm / 1000000).toFixed(2) + 'M RPM';
    },
    
    /**
     * Get color from temperature
     * @param {number} temp - Temperature in Celsius
     * @returns {string} Hex color
     */
    getColorFromTemperature: function(temp) {
        if (temp < 500) return '#0099FF';   // Cool blue
        if (temp < 700) return '#00FF00';   // Green
        if (temp < 1000) return '#FFFF00';  // Yellow
        if (temp < 1300) return '#FF6600';  // Orange
        return '#FF0000';                    // Red
    },
    
    /**
     * Validate if value is within expected range
     * @param {number} value - Value to check
     * @param {number} min - Minimum acceptable
     * @param {number} max - Maximum acceptable
     * @returns {boolean} Is valid
     */
    isValid: function(value, min, max) {
        return !isNaN(value) && value >= min && value <= max;
    },
    
    /**
     * Create a random color
     * @returns {string} Hex color
     */
    randomColor: function() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    },
    
    /**
     * Debounce function
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {function} Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    
    /**
     * Throttle function
     * @param {function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {function} Throttled function
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Get distance between two 3D points
     * @param {THREE.Vector3} p1 - Point 1
     * @param {THREE.Vector3} p2 - Point 2
     * @returns {number} Distance
     */
    distance3D: function(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    /**
     * Convert degrees to radians
     * @param {number} degrees - Angle in degrees
     * @returns {number} Angle in radians
     */
    toRadians: function(degrees) {
        return degrees * Math.PI / 180;
    },
    
    /**
     * Convert radians to degrees
     * @param {number} radians - Angle in radians
     * @returns {number} Angle in degrees
     */
    toDegrees: function(radians) {
        return radians * 180 / Math.PI;
    },
    
    /**
     * Calculate health status from RPM
     * @param {number} rpm - Current RPM
     * @param {number} maxRPM - Maximum RPM
     * @returns {string} Status: 'GREEN', 'YELLOW', 'RED'
     */
    getHealthStatus: function(rpm, maxRPM) {
        const percent = rpm / maxRPM;
        if (percent < 0.5) return 'GREEN';
        if (percent < 0.85) return 'YELLOW';
        return 'RED';
    },
    
    /**
     * Log message with timestamp
     * @param {string} message - Message to log
     * @param {string} level - Log level
     */
    log: function(message, level = 'INFO') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${level}] ${message}`);
    }
};

/**
 * Configuration constants
 */
const CONFIG = {
    // === ENGINE PARAMETERS ===
    MAX_RPM: 100000,
    IDLE_RPM: 1000,
    MAX_EGT: 1300,  // °C
    MAX_THRUST: 100, // kN
    
    // === DISPLAY SETTINGS ===
    GAUGE_UPDATE_RATE: 60, // Hz
    PARTICLE_COUNT: 2000,
    BLOOM_STRENGTH: 1.5,
    BLOOM_RADIUS: 0.4,
    BLOOM_THRESHOLD: 0.85,
    
    // === INTERACTION ===
    CAMERA_SPEED: 1.0,
    CONTROL_SENSITIVITY: 0.01,
    
    // === ANIMATION ===
    TRANSITION_DURATION: 0.6,
    EXPLOSION_DISTANCE: 3,
    
    // === AUDIO ===
    DEFAULT_VOLUME: 0.5,
    ENGINE_FREQUENCY_MIN: 50,
    ENGINE_FREQUENCY_MAX: 1000
};

/**
 * Engine telemetry calculations
 */
const Telemetry = {
    /**
     * Calculate exhaust gas temperature from RPM
     * @param {number} rpm - Current RPM
     * @returns {number} EGT in Celsius
     */
    calculateEGT: function(rpm) {
        return Math.round(300 + (rpm / 100000) * 1000);
    },
    
    /**
     * Calculate fuel flow from RPM
     * @param {number} rpm - Current RPM
     * @returns {number} Fuel flow in kg/h
     */
    calculateFuelFlow: function(rpm) {
        return Math.round((rpm / 100000) * 5000);
    },
    
    /**
     * Calculate thrust from RPM
     * @param {number} rpm - Current RPM
     * @returns {number} Thrust in kN
     */
    calculateThrust: function(rpm) {
        return Math.round((rpm / 100000) * 100);
    },
    
    /**
     * Calculate fan speed from RPM
     * @param {number} rpm - Current RPM
     * @returns {number} Fan speed in RPM
     */
    calculateFanSpeed: function(rpm) {
        return rpm * 0.1; // Fan operates at 10% of high-pressure rotor
    },
    
    /**
     * Calculate turbine speed from RPM
     * @param {number} rpm - Current RPM
     * @returns {number} Turbine speed in RPM
     */
    calculateTurbineSpeed: function(rpm) {
        return rpm * 0.2; // Turbine operates at 20% of high-pressure rotor
    },
    
    /**
     * Calculate efficiency percentage
     * @param {number} rpm - Current RPM
     * @returns {number} Efficiency (0-100%)
     */
    calculateEfficiency: function(rpm) {
        const rpmPercent = rpm / CONFIG.MAX_RPM;
        // Peak efficiency around 75% RPM
        return Math.max(0, 100 * (1 - Math.pow(rpmPercent - 0.75, 2) / 0.5625));
    }
};
