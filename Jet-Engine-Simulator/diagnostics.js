/* ========================================
   DIAGNOSTICS SYSTEM
   Automated engine testing and analysis
   ======================================== */

/**
 * DiagnosticsSystem Class
 * Performs automated tests and analysis on the engine
 * Provides system health monitoring
 */
class DiagnosticsSystem {
    /**
     * Constructor
     * @param {JetEngineSimulator} simulator - Main simulator instance
     */
    constructor(simulator) {
        this.simulator = simulator;
        
        // === TEST STATE ===
        this.isRunning = false;
        this.currentTest = 0;
        this.testResults = [];
        this.diagnosticPanel = null;
        
        // === TEST SEQUENCE ===
        this.tests = [
            { name: 'System Initialization', duration: 2, description: 'Checking system components' },
            { name: 'Fan Blade Inspection', duration: 2, description: 'Verifying fan blade geometry' },
            { name: 'Compressor Stage Check', duration: 2, description: 'Testing compressor stages' },
            { name: 'Combustor Diagnostics', duration: 2, description: 'Analyzing combustor performance' },
            { name: 'Turbine Health Check', duration: 2, description: 'Inspecting turbine stages' },
            { name: 'Nozzle Verification', duration: 2, description: 'Validating nozzle geometry' },
            { name: 'Fuel System Analysis', duration: 2, description: 'Testing fuel injection system' },
            { name: 'Temperature Monitoring', duration: 2, description: 'Checking thermal conditions' },
            { name: 'Vibration Analysis', duration: 2, description: 'Measuring engine vibration' },
            { name: 'Performance Metrics', duration: 2, description: 'Calculating efficiency' }
        ];
    }
    
    /**
     * Initialize diagnostics system
     */
    async initialize() {
        console.log('[DIAGNOSTICS] System initialized');
    }
    
    /**
     * Start diagnostic sequence
     */
    async runDiagnostics() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.testResults = [];
        this.currentTest = 0;
        
        // === CREATE DIAGNOSTICS MODAL ===
        this.createDiagnosticsPanel();
        
        // === RUN EACH TEST ===
        for (let i = 0; i < this.tests.length; i++) {
            this.currentTest = i;
            await this.runTest(this.tests[i]);
            
            // Update progress
            const progress = ((i + 1) / this.tests.length) * 100;
            this.updateDiagnosticsProgress(progress);
        }
        
        // === FINALIZE ===
        this.isRunning = false;
        this.completeDiagnostics();
    }
    
    /**
     * Create diagnostics display panel
     */
    createDiagnosticsPanel() {
        // === CREATE MODAL ===
        const modal = document.createElement('div');
        modal.id = 'diagnosticsModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.minWidth = '500px';
        
        // === HEADER ===
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h2>SYSTEM DIAGNOSTICS</h2>
            <span style="color: #00D9FF; font-size: 12px;">Running automated tests...</span>
        `;
        
        // === BODY ===
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = `
            <div id="testName" style="font-size: 16px; color: #00D9FF; margin-bottom: 10px;">Initializing...</div>
            <div id="testDescription" style="font-size: 12px; color: #A8A8A8; margin-bottom: 20px;">System Initialization</div>
            
            <div class="progress-bar" style="margin-bottom: 20px;">
                <div class="progress-fill" id="diagnosticProgress" style="width: 0%;"></div>
            </div>
            
            <div id="testResults" style="
                max-height: 300px;
                overflow-y: auto;
                font-size: 11px;
                color: #E8E8E8;
                line-height: 1.8;
            "></div>
        `;
        
        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // === ANIMATION ===
        gsap.from(content, { scale: 0.8, opacity: 0, duration: 0.3 });
        
        this.diagnosticPanel = modal;
    }
    
    /**
     * Run individual test
     * @param {Object} test - Test configuration
     */
    async runTest(test) {
        return new Promise((resolve) => {
            // === UPDATE UI ===
            const testNameEl = document.getElementById('testName');
            const testDescEl = document.getElementById('testDescription');
            const resultsEl = document.getElementById('testResults');
            
            testNameEl.textContent = test.name;
            testDescEl.textContent = test.description;
            
            // === SIMULATE TEST EXECUTION ===
            const startTime = Date.now();
            const testDuration = test.duration * 1000;
            
            const testInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = (elapsed / testDuration) * 100;
                
                if (progress >= 100) {
                    clearInterval(testInterval);
                    
                    // === TEST PASSED ===
                    const result = {
                        name: test.name,
                        status: 'PASS',
                        timestamp: new Date().toLocaleTimeString()
                    };
                    
                    this.testResults.push(result);
                    
                    // === UPDATE RESULTS DISPLAY ===
                    const resultLine = document.createElement('div');
                    resultLine.style.padding = '8px';
                    resultLine.style.borderBottom = '1px solid rgba(0, 217, 255, 0.1)';
                    resultLine.innerHTML = `
                        <span style="color: #00FF88;">✓ PASS</span>
                        <span style="color: #A8A8A8;"> - ${result.name}</span>
                        <span style="color: #707070; font-size: 10px;"> @ ${result.timestamp}</span>
                    `;
                    resultsEl.appendChild(resultLine);
                    resultsEl.scrollTop = resultsEl.scrollHeight;
                    
                    resolve();
                }
            }, 100);
        });
    }
    
    /**
     * Update diagnostics progress bar
     * @param {number} percent - Progress percentage
     */
    updateDiagnosticsProgress(percent) {
        const progressEl = document.getElementById('diagnosticProgress');
        if (progressEl) {
            gsap.to(progressEl, {
                width: percent + '%',
                duration: 0.3
            });
        }
    }
    
    /**
     * Complete diagnostics and show summary
     */
    completeDiagnostics() {
        const testNameEl = document.getElementById('testName');
        const testDescEl = document.getElementById('testDescription');
        
        testNameEl.textContent = 'DIAGNOSTICS COMPLETE';
        testNameEl.style.color = '#00FF88';
        testDescEl.textContent = 'All systems operational';
        
        // === AUTO-CLOSE AFTER 5 SECONDS ===
        setTimeout(() => {
            gsap.to(this.diagnosticPanel, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    this.diagnosticPanel.remove();
                }
            });
        }, 5000);
        
        console.log('[DIAGNOSTICS] Complete - ' + this.testResults.length + ' tests passed');
    }
    
    /**
     * Get system health status
     * @returns {string} Health status: 'HEALTHY', 'WARNING', 'CRITICAL'
     */
    getSystemHealth() {
        if (this.testResults.length === this.tests.length) {
            return 'HEALTHY';
        } else if (this.testResults.length > this.tests.length * 0.7) {
            return 'WARNING';
        }
        return 'CRITICAL';
    }
    
    /**
     * Generate diagnostic report
     * @returns {Object} Diagnostic report data
     */
    generateReport() {
        const health = this.getSystemHealth();
        
        return {
            timestamp: new Date().toISOString(),
            health: health,
            testsRun: this.testResults.length,
            testsTotal: this.tests.length,
            passRate: (this.testResults.length / this.tests.length) * 100,
            results: this.testResults
        };
    }
          }
