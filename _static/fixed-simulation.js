// Inverted Pendulum PID Simulation - converted from React JSX
console.log('Loading inverted pendulum PID simulation...');

// Global flag to prevent multiple initializations
let pidSimulationInitialized = false;

// Utility functions
function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
}

function wrapPi(a) {
    // wrap to (-pi, pi]
    let x = ((a + Math.PI) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI) - Math.PI;
    if (x <= -Math.PI) x += 2 * Math.PI;
    return x;
}

function createFixedPIDSimulation() {
    if (pidSimulationInitialized) {
        console.log('PID simulation already initialized, skipping');
        return;
    }
    
    console.log('Creating inverted pendulum PID simulation...');
    
    const containers = document.querySelectorAll('.pid-simulation-container');
    if (containers.length === 0) {
        console.log('No simulation containers found');
        return;
    }
    
    pidSimulationInitialized = true;
    
    containers.forEach(container => {
        console.log('Setting up inverted pendulum simulation in container');
        
        // Create simulation HTML based on the JSX design
        container.innerHTML = `
            <div style="max-width: 1100px; margin: 0 auto; padding: 24px;">
                <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #1f2937;">PID Control — Inverted Pendulum</h1>
                <p style="color: #4b5563; margin-bottom: 24px;">
                    Stabilize or track angles for a rotary inverted pendulum using a PID controller acting on torque.
                    The controller uses angle-wrapped error to avoid 2π jumps, and a simple anti-windup clamp.
                </p>

                <!-- Plot containers -->
                <div style="margin-bottom: 24px;">
                    <canvas id="angle-plot" width="900" height="280" style="display: block; margin-bottom: 16px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></canvas>
                    <canvas id="control-plot" width="900" height="280" style="display: block; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></canvas>
                </div>

                <!-- Control panels -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-top: 24px;">
                    
                    <!-- Controller Panel -->
                    <div style="padding: 16px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: white;">
                        <h2 style="font-weight: 500; margin-bottom: 12px; color: #1f2937;">Controller</h2>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Kp</span>
                                    <span id="kp-display" style="font-family: monospace;">20.000</span>
                                </div>
                                <input type="range" id="kp-slider" min="0" max="200" step="0.1" value="20" style="width: 100%;">
                            </div>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Ki</span>
                                    <span id="ki-display" style="font-family: monospace;">5.000</span>
                                </div>
                                <input type="range" id="ki-slider" min="0" max="80" step="0.05" value="5" style="width: 100%;">
                            </div>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Kd</span>
                                    <span id="kd-display" style="font-family: monospace;">2.000</span>
                                </div>
                                <input type="range" id="kd-slider" min="0" max="20" step="0.01" value="2" style="width: 100%;">
                            </div>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>|u|max (N·m)</span>
                                    <span id="umax-display" style="font-family: monospace;">8.000</span>
                                </div>
                                <input type="range" id="umax-slider" min="0.5" max="20" step="0.1" value="8" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Reference & Disturbance Panel -->
                    <div style="padding: 16px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: white;">
                        <h2 style="font-weight: 500; margin-bottom: 12px; color: #1f2937;">Reference & Disturbance</h2>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; gap: 16px; font-size: 14px;">
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="radio" name="inputType" value="step" checked>
                                    Step
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px;">
                                    <input type="radio" name="inputType" value="sine">
                                    Sine
                                </label>
                            </div>
                            <div id="step-controls">
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>θ_ref (rad)</span>
                                    <span id="ref-display" style="font-family: monospace;">0.000</span>
                                </div>
                                <input type="range" id="ref-slider" min="-0.5" max="0.5" step="0.005" value="0" style="width: 100%;">
                            </div>
                            <div id="sine-controls" style="display: none;">
                                <div>
                                    <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                        <span>Amplitude (rad)</span>
                                        <span id="amp-display" style="font-family: monospace;">0.150</span>
                                    </div>
                                    <input type="range" id="amp-slider" min="0" max="0.4" step="0.005" value="0.15" style="width: 100%;">
                                </div>
                                <div>
                                    <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                        <span>Frequency (Hz)</span>
                                        <span id="freq-display" style="font-family: monospace;">0.500</span>
                                    </div>
                                    <input type="range" id="freq-slider" min="0.05" max="2.0" step="0.01" value="0.5" style="width: 100%;">
                                </div>
                            </div>
                            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                                <input type="checkbox" id="use-dist" checked>
                                Inject disturbance torque
                            </label>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Disturbance (N·m)</span>
                                    <span id="dist-mag-display" style="font-family: monospace;">1.500</span>
                                </div>
                                <input type="range" id="dist-mag-slider" min="-4" max="4" step="0.05" value="1.5" style="width: 100%;">
                            </div>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Disturbance time (s)</span>
                                    <span id="dist-time-display" style="font-family: monospace;">3.000</span>
                                </div>
                                <input type="range" id="dist-time-slider" min="0" max="8" step="0.05" value="3" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <!-- Pendulum Parameters Panel -->
                    <div style="padding: 16px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: white;">
                        <h2 style="font-weight: 500; margin-bottom: 12px; color: #1f2937;">Pendulum Parameters</h2>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Mass m (kg)</span>
                                    <span id="mass-display" style="font-family: monospace;">1.000</span>
                                </div>
                                <input type="range" id="mass-slider" min="0.1" max="3" step="0.01" value="1" style="width: 100%;">
                            </div>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>COM distance l (m)</span>
                                    <span id="length-display" style="font-family: monospace;">0.500</span>
                                </div>
                                <input type="range" id="length-slider" min="0.1" max="1.0" step="0.01" value="0.5" style="width: 100%;">
                            </div>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Damping c (N·m·s/rad)</span>
                                    <span id="damping-display" style="font-family: monospace;">0.200</span>
                                </div>
                                <input type="range" id="damping-slider" min="0" max="1.5" step="0.01" value="0.2" style="width: 100%;">
                            </div>
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563; margin-bottom: 4px;">
                                    <span>Gravity g (m/s²)</span>
                                    <span id="gravity-display" style="font-family: monospace;">9.810</span>
                                </div>
                                <input type="range" id="gravity-slider" min="0" max="15" step="0.1" value="9.81" style="width: 100%;">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Teaching Notes -->
                <div style="margin-top: 24px; padding: 16px; border-radius: 16px; background: white; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); font-size: 14px; color: #4b5563; line-height: 1.6;">
                    <h3 style="font-weight: 500; margin-bottom: 8px; color: #1f2937;">Teaching Cues</h3>
                    <ul style="list-style-type: disc; margin-left: 24px; margin-top: 0;">
                        <li><strong>Nonlinearity:</strong> The sin(θ) term makes the plant highly sensitive near ±π; small-angle ≈ linear.</li>
                        <li><strong>Angle wrapping:</strong> Error uses the shortest angular distance. Toggle a ±0.3 rad step to illustrate.</li>
                        <li><strong>Kp:</strong> increases stiffness (faster rise) but too large causes oscillation or saturation.</li>
                        <li><strong>Ki:</strong> removes steady-state bias (e.g., with constant disturbance) but invites windup—show with low |u|max.</li>
                        <li><strong>Kd:</strong> damps motion via measured ω; reduces overshoot after adding Ki.</li>
                        <li><strong>Disturbance rejection:</strong> Fire a torque at t = 3 s and compare with/without Ki.</li>
                        <li><strong>Physical params:</strong> Increase l or m → larger inertia I = m l² → slower response; increase c → more damping.</li>
                    </ul>
                    <p style="margin-top: 8px; font-style: italic;">Numerics: forward Euler; derivative term uses −ω to avoid derivative kick.</p>
                </div>
            </div>
        `;
        
        // Initialize simulation with proper timing (wait for DOM and force reflow)
        requestAnimationFrame(() => {
            // Force reflow to ensure DOM is ready
            container.offsetHeight;
            initializeInvertedPendulum(container);
        });
    });
}

function initializeInvertedPendulum(container) {
    console.log('Initializing inverted pendulum simulation for container:', container);
    
    // Prevent multiple initializations on same container
    if (container._pidSimInitialized) {
        console.log('Container already initialized, skipping');
        return;
    }
    container._pidSimInitialized = true;
    
    // Simulation state (completely separate from DOM)
    let simState = {
        kp: 20, ki: 5, kd: 2,
        setpoint: 1.0, output: 0, integral: 0, prevError: 0,
        time: 0, history: [],
        refType: 'step', amplitude: 1.0,
        isRunning: false
    };
    
    // DOM elements (scoped to container)
    const elements = {
        kpSlider: container.querySelector('#kp-slider'),
        kiSlider: container.querySelector('#ki-slider'),
        kdSlider: container.querySelector('#kd-slider'),
        amplitudeSlider: container.querySelector('#amplitude-slider'),
        canvas: container.querySelector('#response-canvas'),
        refRadios: container.querySelectorAll('input[name="ref-type"]'),
        // Display elements
        kpDisplay: container.querySelector('#kp-display'),
        kiDisplay: container.querySelector('#ki-display'),
        kdDisplay: container.querySelector('#kd-display'),
        amplitudeDisplay: container.querySelector('#amplitude-display'),
        setpointValue: container.querySelector('#setpoint-value'),
        outputValue: container.querySelector('#output-value'),
        controlValue: container.querySelector('#control-value'),
        errorValue: container.querySelector('#error-value')
    };
    
    // Debug: Check if all critical elements are found
    console.log('Element check:', {
        canvas: !!elements.canvas,
        kpSlider: !!elements.kpSlider,
        kiSlider: !!elements.kiSlider,
        kdSlider: !!elements.kdSlider,
        kpDisplay: !!elements.kpDisplay,
        kiDisplay: !!elements.kiDisplay,
        kdDisplay: !!elements.kdDisplay
    });
    
    if (!elements.canvas) {
        console.error('Canvas not found in container:', container);
        return;
    }
    
    if (!elements.kpSlider) {
        console.error('Kp slider not found in container:', container);
        return;
    }
    
    const ctx = elements.canvas.getContext('2d');
    
    // Ensure proper canvas sizing (fix common blank canvas issue)
    const canvas = elements.canvas;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 750;
    canvas.height = rect.height || 300;
    console.log('Canvas sized to:', canvas.width, 'x', canvas.height);
    
    // Event listeners (update simulation state only)
    if (elements.kpSlider) {
        elements.kpSlider.addEventListener('input', (e) => {
            simState.kp = parseFloat(e.target.value);
            // Update display immediately for responsiveness
            if (elements.kpDisplay) elements.kpDisplay.textContent = simState.kp.toFixed(1);
        });
    }
    
    if (elements.kiSlider) {
        elements.kiSlider.addEventListener('input', (e) => {
            simState.ki = parseFloat(e.target.value);
            simState.integral = 0; // Reset integral on Ki change
            // Update display immediately for responsiveness
            if (elements.kiDisplay) elements.kiDisplay.textContent = simState.ki.toFixed(1);
        });
    }
    
    if (elements.kdSlider) {
        elements.kdSlider.addEventListener('input', (e) => {
            simState.kd = parseFloat(e.target.value);
            // Update display immediately for responsiveness
            if (elements.kdDisplay) elements.kdDisplay.textContent = simState.kd.toFixed(1);
        });
    }
    
    if (elements.amplitudeSlider) {
        elements.amplitudeSlider.addEventListener('input', (e) => {
            simState.amplitude = parseFloat(e.target.value);
            // Update display immediately for responsiveness
            if (elements.amplitudeDisplay) elements.amplitudeDisplay.textContent = simState.amplitude.toFixed(1);
        });
    }
    
    // Reference type radio buttons
    elements.refRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                simState.refType = e.target.value;
            }
        });
    });
    
    // Separate DOM update function (called less frequently) with debugging
    function updateDisplay() {
        try {
            if (elements.kpDisplay) elements.kpDisplay.textContent = simState.kp.toFixed(1);
            if (elements.kiDisplay) elements.kiDisplay.textContent = simState.ki.toFixed(1);
            if (elements.kdDisplay) elements.kdDisplay.textContent = simState.kd.toFixed(1);
            if (elements.amplitudeDisplay) elements.amplitudeDisplay.textContent = simState.amplitude.toFixed(1);
            if (elements.setpointValue) elements.setpointValue.textContent = simState.setpoint.toFixed(2);
            if (elements.outputValue) elements.outputValue.textContent = simState.output.toFixed(2);
            if (elements.errorValue) elements.errorValue.textContent = (simState.setpoint - simState.output).toFixed(2);
        } catch (error) {
            console.error('Error updating display:', error);
        }
    }
    
    // Simulation physics (separate from DOM) with debugging
    function simulationStep(deltaTime) {
        if (deltaTime <= 0 || deltaTime > 0.1) {
            console.warn('Invalid deltaTime:', deltaTime);
            return;
        }
        
        // Update setpoint based on reference type
        if (simState.refType === 'step') {
            simState.setpoint = simState.amplitude;
        } else {
            simState.setpoint = simState.amplitude * Math.sin(simState.time * 0.5);
        }
        
        // PID calculation
        const error = simState.setpoint - simState.output;
        simState.integral += error * deltaTime;
        const derivative = (error - simState.prevError) / deltaTime;
        
        const control = simState.kp * error + simState.ki * simState.integral + simState.kd * derivative;
        
        // Simple plant model: first-order system
        simState.output += 2.0 * deltaTime * (control - simState.output);
        
        simState.prevError = error;
        simState.time += deltaTime;
        
        // Store history (limit to prevent memory issues)
        const dataPoint = {
            time: simState.time,
            setpoint: simState.setpoint,
            output: simState.output,
            control: control
        };
        
        simState.history.push(dataPoint);
        
        if (simState.history.length > 1000) {
            simState.history.shift();
        }
        
        // Update control display immediately
        if (elements.controlValue) {
            elements.controlValue.textContent = control.toFixed(2);
        }
        
        // Debug log every 100 steps
        if (Math.floor(simState.time * 10) % 100 === 0) {
            console.log('Simulation state:', {
                time: simState.time.toFixed(2),
                setpoint: simState.setpoint.toFixed(2),
                output: simState.output.toFixed(2),
                control: control.toFixed(2),
                error: error.toFixed(2)
            });
        }
    }
    
    // Canvas drawing (optimized) with debugging
    function drawPlot() {
        if (!ctx || !elements.canvas) {
            console.error('Canvas context not available');
            return;
        }
        
        if (simState.history.length < 2) {
            console.log('Not enough history data:', simState.history.length);
            return;
        }
        
        console.log('Drawing plot with', simState.history.length, 'data points');
        
        const canvas = elements.canvas;
        const W = canvas.width;
        const H = canvas.height;
        
        // Clear canvas properly
        ctx.clearRect(0, 0, W, H);
        
        // Set white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        
        // Draw grid
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        const gridLines = 10;
        for (let i = 0; i <= gridLines; i++) {
            const x = (i / gridLines) * W;
            const y = (i / gridLines) * H;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
        
        // Get recent history for plotting
        const recentHistory = simState.history.slice(-500);
        if (recentHistory.length < 2) return;
        
        const timeRange = Math.max(10, recentHistory[recentHistory.length - 1].time - recentHistory[0].time);
        const minTime = recentHistory[0].time; // Start from oldest time for left-to-right scrolling
        const maxTime = minTime + timeRange;
        
        // Find value ranges
        let minVal = -2, maxVal = 2;
        recentHistory.forEach(point => {
            minVal = Math.min(minVal, point.setpoint, point.output);
            maxVal = Math.max(maxVal, point.setpoint, point.output);
        });
        
        const padding = (maxVal - minVal) * 0.1;
        minVal -= padding;
        maxVal += padding;
        
        function scaleX(time) {
            return ((time - minTime) / timeRange) * W;
        }
        
        function scaleY(value) {
            return H - ((value - minVal) / (maxVal - minVal)) * H;
        }
        
        // Draw setpoint (red line)
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        recentHistory.forEach((point, i) => {
            const x = scaleX(point.time);
            const y = scaleY(point.setpoint);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Draw output (blue line)
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        recentHistory.forEach((point, i) => {
            const x = scaleX(point.time);
            const y = scaleY(point.output);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        
        // Draw legend
        ctx.fillStyle = '#2c3e50';
        ctx.font = '14px sans-serif';
        ctx.fillText('— Setpoint', 10, 25);
        ctx.fillText('— Output', 10, 45);
    }
    
    // Animation loop using requestAnimationFrame with proper timing
    let lastTime = performance.now(); // Use performance.now() for better precision
    let displayUpdateCounter = 0;
    let frameCounter = 0;
    
    function animate(currentTime) {
        if (!simState.isRunning) {
            console.log('Animation stopped - simulation not running');
            return;
        }
        
        // Calculate deltaTime properly (avoid first frame being 0)
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap at 50ms
        lastTime = currentTime;
        
        frameCounter++;
        
        // Always run simulation step (even for first frame)
        simulationStep(Math.max(deltaTime, 0.016)); // Minimum 16ms (60fps)
        drawPlot();
        
        // Update display less frequently (every 10 frames ≈ 6Hz at 60fps)
        displayUpdateCounter++;
        if (displayUpdateCounter >= 10) {
            updateDisplay();
            displayUpdateCounter = 0;
        }
        
        // Log every 60 frames (about once per second at 60fps)
        if (frameCounter % 60 === 0) {
            console.log('Animation running - Frame:', frameCounter, 'Delta:', deltaTime.toFixed(4), 'History:', simState.history.length);
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start simulation with some initial data
    simState.isRunning = true;
    
    // Add some initial history to avoid empty plot
    for (let i = 0; i < 10; i++) {
        simState.history.push({
            time: i * 0.1,
            setpoint: simState.amplitude,
            output: 0,
            control: 0
        });
    }
    
    updateDisplay(); // Initial display update
    drawPlot(); // Initial plot draw
    requestAnimationFrame(animate);
    
    console.log('Fixed PID simulation initialized successfully with', simState.history.length, 'initial data points');
}

// Initialize when DOM is ready - single reliable method
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFixedPIDSimulation);
} else {
    // DOM already loaded, initialize immediately
    createFixedPIDSimulation();
}