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

// Line plot function
function drawLinePlot(canvas, series, labels, title, yMin, yMax) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = { left: 48, right: 12, top: 28, bottom: 36 };
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Compute bounds
    const n = series[0]?.length ?? 0;
    let minY = yMin ?? Infinity;
    let maxY = yMax ?? -Infinity;
    
    for (const s of series) {
        for (let i = 0; i < s.length; i++) {
            const v = s[i];
            if (!Number.isFinite(v)) continue;
            if (yMin === undefined) minY = Math.min(minY, v);
            if (yMax === undefined) maxY = Math.max(maxY, v);
        }
    }
    
    if (!Number.isFinite(minY) || !Number.isFinite(maxY) || minY === maxY) {
        minY = -1;
        maxY = 1;
    }
    
    const pad = 0.1 * (maxY - minY);
    minY -= pad;
    maxY += pad;

    const x0 = padding.left;
    const y0 = padding.top;
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;
    const xScale = (i) => x0 + (plotW * i) / Math.max(1, n - 1);
    const yScale = (v) => y0 + plotH - ((v - minY) / (maxY - minY)) * plotH;

    // Title
    if (title) {
        ctx.font = "16px sans-serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "#111";
        ctx.fillText(title, x0, 20);
    }

    // Axes
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y0 + plotH);
    ctx.lineTo(x0 + plotW, y0 + plotH);
    ctx.stroke();

    // Y ticks and grid
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#222";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let k = 0; k <= 5; k++) {
        const v = minY + (k * (maxY - minY)) / 5;
        const yy = yScale(v);
        ctx.strokeStyle = "#eee";
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.lineTo(x0 + plotW, yy);
        ctx.stroke();
        ctx.fillText(v.toFixed(2), x0 - 6, yy);
    }

    // Plot data
    const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
    series.forEach((s, idx) => {
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < s.length; i++) {
            const x = xScale(i);
            const y = yScale(s[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    });

    // Legend
    if (labels && labels.length === series.length) {
        let lx = x0 + 8;
        const ly = y0 + 8;
        ctx.font = "12px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        labels.forEach((lab, i) => {
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(lx, ly - 6, 12, 12);
            ctx.fillStyle = "#111";
            ctx.fillText(lab, lx + 18, ly);
            lx += ctx.measureText(lab).width + 60;
        });
    }
}

// Pendulum visualization function
function drawPendulum(canvas, theta, desired, isDisturbanceActive = false) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const pendulumLength = 80; // pixels - smaller for 240x240 canvas
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw reference angle indicator (light gray line)
    if (Math.abs(desired) > 0.01) {
        const refX = centerX + pendulumLength * Math.sin(desired);
        const refY = centerY - pendulumLength * Math.cos(desired);
        
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(refX, refY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw pendulum rod
    const pendX = centerX + pendulumLength * Math.sin(theta);
    const pendY = centerY - pendulumLength * Math.cos(theta);
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(pendX, pendY);
    ctx.stroke();
    
    // Draw pivot point (base)
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw pendulum mass
    const massColor = isDisturbanceActive ? '#e74c3c' : '#3498db';
    ctx.fillStyle = massColor;
    ctx.beginPath();
    ctx.arc(pendX, pendY, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw angle arc
    const arcRadius = 30;
    ctx.strokeStyle = theta > 0 ? '#e74c3c' : '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, arcRadius, -Math.PI/2, theta - Math.PI/2);
    ctx.stroke();
    
    // Draw angle label
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    const angleText = `θ = ${theta.toFixed(2)} rad`;
    ctx.fillText(angleText, centerX, height - 20);
    
    // Draw upright reference line
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - pendulumLength);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Add "UP" label
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UP', centerX, centerY - pendulumLength - 10);
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
        
        // Create simulation HTML with forced styling to override CSS conflicts
        container.innerHTML = `
            <div style="max-width: 1100px; margin: 0 auto; padding: 24px; background: white !important; color: #1f2937 !important;">
                <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px; color: #1f2937 !important;">PID Control — Inverted Pendulum</h1>
                <p style="color: #4b5563 !important; margin-bottom: 24px;">
                    Stabilize or track angles for a rotary inverted pendulum using a PID controller acting on torque.
                    The controller uses angle-wrapped error to avoid 2π jumps, and a simple anti-windup clamp.
                </p>

                <!-- Control panels - 3 side by side -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                    
                    <!-- Controller Panel -->
                    <div style="padding: 16px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background: white !important; color: #1f2937 !important;">
                        <h2 style="font-weight: 500; margin-bottom: 12px; color: #1f2937 !important;">Controller</h2>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div>
                                <div style="display: flex; justify-between; font-size: 14px; color: #4b5563 !important; margin-bottom: 4px;">
                                    <span style="color: #4b5563 !important;">Kp</span>
                                    <span id="kp-display" style="font-family: monospace; color: #1f2937 !important;">20.000</span>
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

                <!-- Pendulum and Plots -->
                <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-bottom: 24px; align-items: start;">
                    <!-- Pendulum Animation -->
                    <div class="pid-plot-container" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 20px;">
                        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1f2937 !important; text-align: center;">Pendulum Visualization</h3>
                        <canvas id="pendulum-viz" width="240" height="240" style="border: 1px solid #ddd; border-radius: 8px;"></canvas>
                        <div style="margin-top: 12px; font-size: 12px; text-align: center; color: #4b5563 !important;">
                            θ = <span id="current-angle">0.00</span> rad
                        </div>
                        <div style="margin-top: 8px; font-size: 11px; text-align: center; color: #6b7280 !important; line-height: 1.3;">
                            💡 Try: Change <strong>θ_ref</strong> or enable <strong>disturbance</strong> to see movement
                        </div>
                    </div>
                    
                    <!-- Plots -->
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div class="pid-plot-container">
                            <canvas id="angle-plot" width="900" height="320"></canvas>
                        </div>
                        <div class="pid-plot-container">
                            <canvas id="control-plot" width="900" height="320"></canvas>
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

    // Simulation parameters with defaults matching the JSX
    const params = {
        // Controller params
        kp: 20.0,
        ki: 5.0,
        kd: 2.0,
        umax: 8,
        dt: 0.002,
        horizon: 8,
        
        // Reference params
        inputType: 'step',
        ref: 0.0,
        amp: 0.15,
        freq: 0.5,
        
        // Pendulum params
        m: 1.0,
        l: 0.5,
        c: 0.2,
        g: 9.81,
        
        // Disturbance params
        useDist: true,
        distMag: 1.5,
        distTime: 3.0
    };

    // Get DOM elements
    const elements = {
        // Plots and visualization
        anglePlot: container.querySelector('#angle-plot'),
        controlPlot: container.querySelector('#control-plot'),
        pendulumViz: container.querySelector('#pendulum-viz'),
        currentAngle: container.querySelector('#current-angle'),
        
        // Controller sliders
        kpSlider: container.querySelector('#kp-slider'),
        kiSlider: container.querySelector('#ki-slider'),
        kdSlider: container.querySelector('#kd-slider'),
        umaxSlider: container.querySelector('#umax-slider'),
        
        // Reference controls
        inputTypeRadios: container.querySelectorAll('input[name="inputType"]'),
        stepControls: container.querySelector('#step-controls'),
        sineControls: container.querySelector('#sine-controls'),
        refSlider: container.querySelector('#ref-slider'),
        ampSlider: container.querySelector('#amp-slider'),
        freqSlider: container.querySelector('#freq-slider'),
        useDistCheck: container.querySelector('#use-dist'),
        distMagSlider: container.querySelector('#dist-mag-slider'),
        distTimeSlider: container.querySelector('#dist-time-slider'),
        
        // Pendulum parameter sliders
        massSlider: container.querySelector('#mass-slider'),
        lengthSlider: container.querySelector('#length-slider'),
        dampingSlider: container.querySelector('#damping-slider'),
        gravitySlider: container.querySelector('#gravity-slider'),
        
        // Display elements
        kpDisplay: container.querySelector('#kp-display'),
        kiDisplay: container.querySelector('#ki-display'),
        kdDisplay: container.querySelector('#kd-display'),
        umaxDisplay: container.querySelector('#umax-display'),
        refDisplay: container.querySelector('#ref-display'),
        ampDisplay: container.querySelector('#amp-display'),
        freqDisplay: container.querySelector('#freq-display'),
        distMagDisplay: container.querySelector('#dist-mag-display'),
        distTimeDisplay: container.querySelector('#dist-time-display'),
        massDisplay: container.querySelector('#mass-display'),
        lengthDisplay: container.querySelector('#length-display'),
        dampingDisplay: container.querySelector('#damping-display'),
        gravityDisplay: container.querySelector('#gravity-display')
    };

    // Simulation function
    function runSimulation() {
        const N = Math.max(10, Math.floor(params.horizon / params.dt));
        
        const y = new Array(N).fill(0); // theta trajectory
        const r = new Array(N).fill(0); // reference
        const u = new Array(N).fill(0); // control signal
        const uP = new Array(N).fill(0); // P term
        const uI = new Array(N).fill(0); // I term
        const uD = new Array(N).fill(0); // D term

        // Initial conditions: small deviation from upright
        let theta = 0.05; // rad
        let omega = 0.0;  // rad/s
        let integ = 0; // integral state

        const I = Math.max(1e-6, params.m * params.l * params.l); // inertia

        for (let i = 0; i < N; i++) {
            const t = i * params.dt;
            const desired = params.inputType === 'step' ? params.ref : params.amp * Math.sin(2 * Math.PI * params.freq * t);
            r[i] = desired;

            // Angle-wrapped error
            const e = wrapPi(desired - theta);

            const up = params.kp * e;
            integ = clamp(integ + params.ki * e * params.dt, -params.umax, params.umax);
            const ud = params.kd * (-omega); // derivative on measurement

            let uRaw = up + integ + ud;
            const uSat = clamp(uRaw, -params.umax, params.umax);

            u[i] = uSat; 
            uP[i] = up; 
            uI[i] = integ; 
            uD[i] = ud;

            // Disturbance torque
            const d = params.useDist && t >= params.distTime ? params.distMag : 0;

            // Nonlinear pendulum dynamics: I*theta_dd = u + d - c*omega - m*g*l*sin(theta)
            const theta_dd = (uSat + d - params.c * omega - params.m * params.g * params.l * Math.sin(theta)) / I;

            // Integrate (forward Euler)
            omega = omega + params.dt * theta_dd;
            theta = theta + params.dt * omega;

            // Keep angle within [-pi, pi]
            theta = wrapPi(theta);

            y[i] = theta;
        }

        return { y, r, u, uP, uI, uD };
    }

    // Update plots
    function updatePlots() {
        const sim = runSimulation();
        
        if (elements.anglePlot) {
            drawLinePlot(elements.anglePlot, [sim.r, sim.y], ["reference θ_ref (rad)", "angle θ (rad)"], "Angle Tracking");
        }
        
        if (elements.controlPlot) {
            drawLinePlot(elements.controlPlot, [sim.u, sim.uP, sim.uI, sim.uD], ["u (N·m)", "P", "I", "D"], "Control Signal Decomposition");
        }
    }

    // Update display values
    function updateDisplays() {
        if (elements.kpDisplay) elements.kpDisplay.textContent = params.kp.toFixed(3);
        if (elements.kiDisplay) elements.kiDisplay.textContent = params.ki.toFixed(3);
        if (elements.kdDisplay) elements.kdDisplay.textContent = params.kd.toFixed(3);
        if (elements.umaxDisplay) elements.umaxDisplay.textContent = params.umax.toFixed(3);
        if (elements.refDisplay) elements.refDisplay.textContent = params.ref.toFixed(3);
        if (elements.ampDisplay) elements.ampDisplay.textContent = params.amp.toFixed(3);
        if (elements.freqDisplay) elements.freqDisplay.textContent = params.freq.toFixed(3);
        if (elements.distMagDisplay) elements.distMagDisplay.textContent = params.distMag.toFixed(3);
        if (elements.distTimeDisplay) elements.distTimeDisplay.textContent = params.distTime.toFixed(3);
        if (elements.massDisplay) elements.massDisplay.textContent = params.m.toFixed(3);
        if (elements.lengthDisplay) elements.lengthDisplay.textContent = params.l.toFixed(3);
        if (elements.dampingDisplay) elements.dampingDisplay.textContent = params.c.toFixed(3);
        if (elements.gravityDisplay) elements.gravityDisplay.textContent = params.g.toFixed(3);
    }

    // Event listeners for sliders
    function setupEventListeners() {
        // Controller sliders
        if (elements.kpSlider) {
            elements.kpSlider.addEventListener('input', (e) => {
                params.kp = parseFloat(e.target.value);
                updateDisplays();
                // Reset simulation state when parameters change
                theta = 0.2; // Start with visible deviation
                omega = 0.0;
                integral = 0;
                history = [];
                currentTime = 0;
            });
        }
        
        if (elements.kiSlider) {
            elements.kiSlider.addEventListener('input', (e) => {
                params.ki = parseFloat(e.target.value);
                updateDisplays();
                // Reset simulation
                theta = 0.2; omega = 0.0; integral = 0; history = []; currentTime = 0;
            });
        }
        
        if (elements.kdSlider) {
            elements.kdSlider.addEventListener('input', (e) => {
                params.kd = parseFloat(e.target.value);
                updateDisplays();
                // Reset simulation
                theta = 0.2; omega = 0.0; integral = 0; history = []; currentTime = 0;
            });
        }
        
        if (elements.umaxSlider) {
            elements.umaxSlider.addEventListener('input', (e) => {
                params.umax = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }

        // Input type radio buttons
        elements.inputTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    params.inputType = e.target.value;
                    if (params.inputType === 'step') {
                        if (elements.stepControls) elements.stepControls.style.display = 'block';
                        if (elements.sineControls) elements.sineControls.style.display = 'none';
                    } else {
                        if (elements.stepControls) elements.stepControls.style.display = 'none';
                        if (elements.sineControls) elements.sineControls.style.display = 'block';
                    }
                    updatePlots();
                }
            });
        });

        // Reference sliders
        if (elements.refSlider) {
            elements.refSlider.addEventListener('input', (e) => {
                params.ref = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }
        
        if (elements.ampSlider) {
            elements.ampSlider.addEventListener('input', (e) => {
                params.amp = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }
        
        if (elements.freqSlider) {
            elements.freqSlider.addEventListener('input', (e) => {
                params.freq = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }

        // Disturbance controls
        if (elements.useDistCheck) {
            elements.useDistCheck.addEventListener('change', (e) => {
                params.useDist = e.target.checked;
                updatePlots();
            });
        }
        
        if (elements.distMagSlider) {
            elements.distMagSlider.addEventListener('input', (e) => {
                params.distMag = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }
        
        if (elements.distTimeSlider) {
            elements.distTimeSlider.addEventListener('input', (e) => {
                params.distTime = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }

        // Pendulum parameter sliders
        if (elements.massSlider) {
            elements.massSlider.addEventListener('input', (e) => {
                params.m = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }
        
        if (elements.lengthSlider) {
            elements.lengthSlider.addEventListener('input', (e) => {
                params.l = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }
        
        if (elements.dampingSlider) {
            elements.dampingSlider.addEventListener('input', (e) => {
                params.c = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }
        
        if (elements.gravitySlider) {
            elements.gravitySlider.addEventListener('input', (e) => {
                params.g = parseFloat(e.target.value);
                updateDisplays();
                updatePlots();
            });
        }
    }

    // Real-time animation state
    let animationRunning = false;
    let currentTime = 0;
    const dt = 0.01; // 10ms steps
    
    // Real-time simulation state - start with some deviation to show movement
    let theta = 0.2; // rad - start with visible deviation
    let omega = 0.0;  // rad/s
    let integral = 0; // integral state
    let history = [];
    
    // Add CSS override
    const style = document.createElement('style');
    style.textContent = `
        .pid-sim-override {
            background: white !important;
            overflow: hidden !important;
            position: relative !important;
        }
        .pid-sim-override * {
            color: #1f2937 !important;
        }
        .pid-sim-override .pid-label {
            color: #4b5563 !important;
        }
        .pid-sim-override canvas {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
        }
        .pid-plot-container {
            overflow: hidden !important;
            margin-bottom: 16px !important;
            background: white !important;
            border-radius: 16px !important;
            padding: 16px !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Add CSS class to container
    container.querySelector('div').classList.add('pid-sim-override');
    
    function animateSimulation() {
        if (!animationRunning) return;
        
        // Calculate reference
        const desired = params.inputType === 'step' ? params.ref : params.amp * Math.sin(2 * Math.PI * params.freq * currentTime);
        
        // PID calculation with angle wrapping
        const e = wrapPi(desired - theta);
        const up = params.kp * e;
        integral = clamp(integral + params.ki * e * dt, -params.umax, params.umax);
        const ud = params.kd * (-omega);
        
        let uRaw = up + integral + ud;
        const uSat = clamp(uRaw, -params.umax, params.umax);
        
        // Disturbance
        const d = params.useDist && currentTime >= params.distTime ? params.distMag : 0;
        
        // Physics: I*theta_dd = u + d - c*omega - m*g*l*sin(theta)
        const I = Math.max(1e-6, params.m * params.l * params.l);
        const theta_dd = (uSat + d - params.c * omega - params.m * params.g * params.l * Math.sin(theta)) / I;
        
        // Integrate
        omega = omega + dt * theta_dd;
        theta = theta + dt * omega;
        theta = wrapPi(theta);
        
        // Store history
        history.push({
            time: currentTime,
            theta: theta,
            desired: desired,
            control: uSat,
            P: up,
            I: integral,
            D: ud
        });
        
        // Keep history reasonable length
        if (history.length > 500) {
            history.shift();
        }
        
        currentTime += dt;
        
        // Update visualizations
        if (elements.pendulumViz) {
            const isDistActive = params.useDist && currentTime >= params.distTime;
            drawPendulum(elements.pendulumViz, theta, desired, isDistActive);
        }
        
        if (elements.currentAngle) {
            elements.currentAngle.textContent = theta.toFixed(2);
        }
        
        // Update plots with current history
        if (history.length > 1) {
            const r = history.map(h => h.desired);
            const y = history.map(h => h.theta);
            const u = history.map(h => h.control);
            const uP = history.map(h => h.P);
            const uI = history.map(h => h.I);
            const uD = history.map(h => h.D);
            
            if (elements.anglePlot) {
                drawLinePlot(elements.anglePlot, [r, y], ["reference θ_ref (rad)", "angle θ (rad)"], "Angle Tracking");
            }
            
            if (elements.controlPlot) {
                drawLinePlot(elements.controlPlot, [u, uP, uI, uD], ["u (N·m)", "P", "I", "D"], "Control Signal Decomposition");
            }
        }
        
        requestAnimationFrame(animateSimulation);
    }
    
    // Start animation
    animationRunning = true;
    animateSimulation();
    
    // Initialize
    setupEventListeners();
    updateDisplays();
    
    console.log('Inverted pendulum simulation initialized successfully with real-time animation!');
}

// Initialize when DOM is ready - single reliable method
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFixedPIDSimulation);
} else {
    // DOM already loaded, initialize immediately
    createFixedPIDSimulation();
}