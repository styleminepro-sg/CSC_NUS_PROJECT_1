/* ========================================
   AUDIO MANAGEMENT
   Engine sounds and acoustic effects
   ======================================== */

/**
 * AudioManager Class
 * Manages jet engine audio effects
 */
class AudioManager {
    /**
     * Constructor
     */
    constructor() {
        this.audioContext = null;
        this.oscillators = [];
        this.gainNodes = [];
        this.masterGain = null;
        this.currentRPM = 0;
        this.enabled = true;
        this.volume = 0.5;
    }
    
    /**
     * Initialize audio system
     */
    async initialize() {
        try {
            // === CREATE AUDIO CONTEXT ===
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // === CREATE MASTER GAIN ===
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            
            console.log('[AUDIO] Audio system initialized');
        } catch (error) {
            console.warn('[AUDIO] Audio system not available:', error);
        }
    }
    
    /**
     * Update audio based on RPM
     * @param {number} rpm - Current RPM
     * @param {number} throttle - Throttle percentage
     */
    update(rpm, throttle) {
        if (!this.audioContext || !this.enabled) return;
        
        this.currentRPM = rpm;
        
        // === STOP ALL OSCILLATORS ===
        this.oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.oscillators = [];
        
        // === IDLE SOUND ===
        if (rpm < 20000) {
            this.playIdleSound(rpm);
        }
        // === SPOOL UP SOUND ===
        else if (rpm < 60000) {
            this.playSpoolUpSound(rpm);
        }
        // === CRUISE SOUND ===
        else {
            this.playCruiseSound(rpm);
        }
    }
    
    /**
     * Play idle engine sound
     * @param {number} rpm - Current RPM
     */
    playIdleSound(rpm) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // === BASE FREQUENCY ===
        const frequency = 50 + (rpm / 20000) * 100;
        
        // === CREATE OSCILLATOR ===
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        // === CREATE GAIN FOR ENVELOPE ===
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        
        // === CONNECT ===
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
        
        this.oscillators.push(osc);
    }
    
    /**
     * Play spool-up sound
     * @param {number} rpm - Current RPM
     */
    playSpoolUpSound(rpm) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // === FREQUENCY SWEEP ===
        const frequency = 100 + (rpm / 60000) * 300;
        
        // === CREATE OSCILLATOR ===
        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = frequency;
        
        // === CREATE GAIN ===
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        
        // === CONNECT ===
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
        
        this.oscillators.push(osc);
    }
    
    /**
     * Play cruise/high-RPM sound
     * @param {number} rpm - Current RPM
     */
    playCruiseSound(rpm) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // === HIGH FREQUENCY TONE ===
        const frequency = 200 + (rpm / 100000) * 500;
        
        // === CREATE OSCILLATOR ===
        const osc = this.audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = frequency;
        
        // === CREATE GAIN ===
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        
        // === CONNECT ===
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
        
        this.oscillators.push(osc);
    }
    
    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
    
    /**
     * Enable/disable audio
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && this.masterGain) {
            this.masterGain.gain.value = 0;
        } else if (enabled && this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
    
    /**
     * Stop all audio
     */
    stopAll() {
        this.oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        this.oscillators = [];
    }
    
    /**
     * Pause audio
     */
    pauseAll() {
        this.setEnabled(false);
    }
    
    /**
     * Resume audio
     */
    resumeAll() {
        this.setEnabled(true);
    }
  }
