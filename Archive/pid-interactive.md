# PID Control for Inverted Pendulum

<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Interactive PID Controller - Inverted Pendulum</title>
<!-- Load React and Babel for JSX transformation -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<!-- Minimal scoped CSS for the PID widget only. Namespaced to avoid interfering with the site theme. -->
<style>
  .pid-widget { max-width: 1100px; margin: 1rem auto; }
  .pid-widget .widget { background: transparent; }
  .pid-widget .equation { background:#f8fafc; padding:0.6rem; border-left:3px solid #3b82f6; border-radius:6px; font-family:monospace; }
  .pid-widget .highlight-box { background:transparent; border-left:3px solid #e5e7eb; padding:0.8rem; border-radius:6px; }
  .pid-widget canvas { width:100%; height:auto; display:block; }
  /* keep only small layout helpers used by the widget; avoid colors/shadows that override theme */
  .pid-widget .p-4{padding:1rem}
  .pid-widget .p-6{padding:1.5rem}
  .pid-widget .mt-6{margin-top:1.5rem}
  .pid-widget .rounded-2xl{border-radius:12px}
</style>
</head>
<body>

<div class="markdown-content">
    <h1>PID Control for Inverted Pendulum</h1>
    
    <p>This interactive demonstration explores <strong>PID (Proportional-Integral-Derivative) control</strong> applied to the challenging problem of stabilizing an inverted pendulum. The inverted pendulum is a classic control system benchmark that illustrates fundamental concepts in feedback control.</p>
    
    <h2>What is an Inverted Pendulum?</h2>
    
    <p>An inverted pendulum is a pendulum that has its center of mass above its pivot point. It's inherently unstable - like balancing a pencil on your finger - and requires continuous corrective action to maintain balance.</p>
    
    <h3>System Dynamics</h3>
    
    <p>The mathematical model of our rotary inverted pendulum is governed by:</p>
    
    <div class="equation">
        I·θ̈ = u + d - c·θ̇ - mgl·sin(θ)
    </div>
    
    <p>Where:</p>
    <ul>
        <li><strong>θ</strong> = angle from vertical (rad)</li>
        <li><strong>θ̇</strong> = angular velocity (rad/s)</li>
        <li><strong>θ̈</strong> = angular acceleration (rad/s²)</li>
        <li><strong>u</strong> = control torque (N·m)</li>
        <li><strong>d</strong> = disturbance torque (N·m)</li>
        <li><strong>I</strong> = moment of inertia ≈ ml² (kg·m²)</li>
        <li><strong>c</strong> = damping coefficient (N·m·s/rad)</li>
        <li><strong>m</strong> = mass (kg)</li>
        <li><strong>l</strong> = distance to center of mass (m)</li>
        <li><strong>g</strong> = gravitational acceleration (m/s²)</li>
    </ul>
    
    <h2>PID Controller Design</h2>
    
    <p>The PID controller calculates the control torque based on the error between the desired angle and actual angle:</p>
    
    <div class="equation">
        u(t) = Kp·e(t) + Ki·∫e(τ)dτ + Kd·ė(t)
    </div>
    
    <p>Where the error <span class="math">e(t)</span> is angle-wrapped to choose the shortest rotational path.</p>
    
    <div class="highlight-box">
        <h3>Key Control Concepts</h3>
        <ul>
            <li><strong>Proportional (Kp):</strong> Provides immediate response proportional to current error</li>
            <li><strong>Integral (Ki):</strong> Eliminates steady-state errors and provides disturbance rejection</li>
            <li><strong>Derivative (Kd):</strong> Provides damping by opposing rapid changes in angle</li>
            <li><strong>Angle Wrapping:</strong> Ensures controller takes shortest angular path (±π handling)</li>
            <li><strong>Anti-Windup:</strong> Prevents integral term from growing excessively during saturation</li>
        </ul>
    </div>
    
    <h2>Interactive Tuning Guide</h2>
    
    <p>Use the widget below to experiment with different PID gains and observe their effects:</p>
    
    <ol>
        <li><strong>Start with P-only:</strong> Increase Kp until you get reasonable tracking without excessive oscillation</li>
        <li><strong>Add Integral action:</strong> Increase Ki to eliminate steady-state error, especially with disturbances</li>
        <li><strong>Add Derivative action:</strong> Increase Kd to reduce overshoot and improve stability</li>
        <li><strong>Test disturbance rejection:</strong> Enable disturbance torque to see how the controller responds</li>
        <li><strong>Experiment with references:</strong> Try both step and sinusoidal reference signals</li>
    </ol>
</div>

<div class="react-widget-container">
    <div id="pid-widget-root"></div>
</div>

<div class="markdown-content" style="margin-top: 30px;">
    <h2>Educational Experiments</h2>
    
    <div class="highlight-box">
        <h3>Suggested Exercises</h3>
        <ul>
            <li><strong>Stability Margins:</strong> Gradually increase Kp until the system becomes unstable</li>
            <li><strong>Integral Windup:</strong> Set a low torque limit (|u|max = 2) with high Ki and observe saturation effects</li>
            <li><strong>Derivative Kick:</strong> Make large reference step changes and observe the derivative term response</li>
            <li><strong>Disturbance Response:</strong> Compare system response to disturbances with and without integral action</li>
            <li><strong>Physical Parameter Effects:</strong> Vary mass, length, and damping to see how they affect controller performance</li>
            <li><strong>Nonlinear Effects:</strong> Try larger reference angles (±0.3 rad) to observe nonlinear behavior</li>
        </ul>
    </div>
    
    <h2>Real-World Applications</h2>
    
    <p>Inverted pendulum control principles are fundamental to many real-world systems:</p>
    
    <ul>
        <li><strong>Rockets and Spacecraft:</strong> Attitude control and trajectory correction</li>
        <li><strong>Segway and Hoverboards:</strong> Self-balancing personal transportation</li>
        <li><strong>Humanoid Robots:</strong> Balance and walking control</li>
        <li><strong>Crane Load Control:</strong> Minimizing payload swing</li>
        <li><strong>Satellite Attitude Control:</strong> Maintaining pointing accuracy</li>
    </ul>
    
    <h2>Advanced Topics</h2>
    
    <p>This demonstration uses simplified Euler integration and basic PID control. In practice, more sophisticated techniques include:</p>
    
    <ul>
        <li><strong>State-space control:</strong> Linear Quadratic Regulator (LQR) design</li>
        <li><strong>Nonlinear control:</strong> Sliding mode, backstepping, or energy-based methods</li>
        <li><strong>Observer design:</strong> Kalman filters for state estimation from noisy sensors</li>
        <li><strong>Adaptive control:</strong> Online parameter estimation and adaptation</li>
        <li><strong>Robust control:</strong> H∞ design for uncertainty and disturbance rejection</li>
    </ul>
</div>

<script type="text/babel">
    const { useState, useEffect, useMemo, useRef } = React;

    // Utility functions
    const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
    const wrapPi = (a) => {
        let x = ((a + Math.PI) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI) - Math.PI;
        if (x <= -Math.PI) x += 2 * Math.PI;
        return x;
    };

    // Simple line plot using canvas
    function LinePlot({
        series,
        width = 900,
        height = 280,
        yMin,
        yMax,
        title,
        labels,
    }) {
        const canvasRef = useRef(null);
        const padding = { left: 48, right: 12, top: 28, bottom: 36 };

        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const W = width;
            const H = height;
            canvas.width = W;
            canvas.height = H;

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
            const plotW = W - padding.left - padding.right;
            const plotH = H - padding.top - padding.bottom;
            const xScale = (i) => x0 + (plotW * i) / Math.max(1, n - 1);
            const yScale = (v) => y0 + plotH - ((v - minY) / (maxY - minY)) * plotH;

            ctx.clearRect(0, 0, W, H);

            if (title) {
                ctx.font = "16px sans-serif";
                ctx.textAlign = "left";
                ctx.fillStyle = "#111";
                ctx.fillText(title, x0, 20);
            }

            // axes
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y0 + plotH);
            ctx.lineTo(x0 + plotW, y0 + plotH);
            ctx.stroke();

            // y ticks
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
        }, [series, width, height, yMin, yMax, title, labels]);

        return React.createElement('canvas', {
            ref: canvasRef,
            className: "rounded-2xl shadow",
            style: { width, height }
        });
    }

    function PIDInvertedPendulum() {
        // Controller params
        const [kp, setKp] = useState(20.0);
        const [ki, setKi] = useState(5.0);
        const [kd, setKd] = useState(2.0);
        const [umax, setUmax] = useState(8);
        const [dt, setDt] = useState(0.002);
        const [horizon, setHorizon] = useState(8);

        const [inputType, setInputType] = useState("step");
        const [ref, setRef] = useState(0.0);
        const [amp, setAmp] = useState(0.15);
        const [freq, setFreq] = useState(0.5);

        // Pendulum params
        const [m, setM] = useState(1.0);
        const [l, setL] = useState(0.5);
        const [c, setC] = useState(0.2);
        const [g, setG] = useState(9.81);

        // disturbance torque
        const [useDist, setUseDist] = useState(true);
        const [distMag, setDistMag] = useState(1.5);
        const [distTime, setDistTime] = useState(3.0);

        const N = Math.max(10, Math.floor(horizon / dt));

        const sim = useMemo(() => {
            const y = new Array(N).fill(0);
            const r = new Array(N).fill(0);
            const u = new Array(N).fill(0);
            const uP = new Array(N).fill(0);
            const uI = new Array(N).fill(0);
            const uD = new Array(N).fill(0);

            let theta = 0.05;
            let omega = 0.0;
            let integ = 0;

            const I = Math.max(1e-6, m * l * l);

            for (let i = 0; i < N; i++) {
                const t = i * dt;
                const desired = inputType === "step" ? ref : amp * Math.sin(2 * Math.PI * freq * t);
                r[i] = desired;

                const e = wrapPi(desired - theta);

                const up = kp * e;
                integ = clamp(integ + ki * e * dt, -umax, umax);
                const ud = kd * (-omega);

                let uRaw = up + integ + ud;
                const uSat = clamp(uRaw, -umax, umax);

                u[i] = uSat;
                uP[i] = up;
                uI[i] = integ;
                uD[i] = ud;

                const d = useDist && t >= distTime ? distMag : 0;
                const theta_dd = (uSat + d - c * omega - m * g * l * Math.sin(theta)) / I;

                omega = omega + dt * theta_dd;
                theta = theta + dt * omega;
                theta = wrapPi(theta);

                y[i] = theta;
            }

            return { y, r, u, uP, uI, uD };
        }, [N, dt, inputType, ref, amp, freq, kp, ki, kd, umax, useDist, distMag, distTime, m, l, c, g]);

        const Slider = ({ label, value, setValue, min, max, step }) => (
            React.createElement('div', { className: "flex flex-col gap-1" },
                React.createElement('div', { className: "flex justify-between text-sm text-gray-700" },
                    React.createElement('span', null, label),
                    React.createElement('span', { className: "font-mono" }, value.toFixed(3))
                ),
                React.createElement('input', {
                    type: "range",
                    min: min,
                    max: max,
                    step: step ?? (max - min) / 200,
                    value: value,
                    onChange: (e) => setValue(parseFloat(e.target.value)),
                    className: "w-full"
                })
            )
        );

        return React.createElement('div', { className: "p-6 max-w-[1100px] mx-auto" },
            React.createElement('h1', { className: "text-2xl font-semibold mb-1" }, "PID Control — Inverted Pendulum"),
            React.createElement('p', { className: "text-gray-700 mb-4" },
                "Stabilize or track angles for a rotary inverted pendulum using a PID controller acting on torque. The controller uses angle-wrapped error to avoid 2π jumps, and a simple anti-windup clamp."
            ),

            React.createElement('div', { className: "grid grid-cols-1 gap-6" },
                React.createElement(LinePlot, {
                    series: [sim.r, sim.y],
                    labels: ["reference θ_ref (rad)", "angle θ (rad)"],
                    title: "Angle Tracking"
                }),
                React.createElement(LinePlot, {
                    series: [sim.u, sim.uP, sim.uI, sim.uD],
                    labels: ["u (N·m)", "P", "I", "D"],
                    title: "Control Signal Decomposition"
                })
            ),

            React.createElement('div', { className: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-6" },
                React.createElement('div', { className: "p-4 rounded-2xl shadow bg-white" },
                    React.createElement('h2', { className: "font-medium mb-3" }, "Controller"),
                    React.createElement('div', { className: "flex flex-col gap-3" },
                        React.createElement(Slider, { label: "Kp", value: kp, setValue: setKp, min: 0, max: 200, step: 0.1 }),
                        React.createElement(Slider, { label: "Ki", value: ki, setValue: setKi, min: 0, max: 80, step: 0.05 }),
                        React.createElement(Slider, { label: "Kd", value: kd, setValue: setKd, min: 0, max: 20, step: 0.01 }),
                        React.createElement(Slider, { label: "|u|max (N·m)", value: umax, setValue: setUmax, min: 0.5, max: 20, step: 0.1 }),
                        React.createElement(Slider, { label: "Time step dt (s)", value: dt, setValue: setDt, min: 0.001, max: 0.01, step: 0.001 }),
                        React.createElement(Slider, { label: "Horizon (s)", value: horizon, setValue: setHorizon, min: 2, max: 20, step: 0.1 })
                    )
                ),

                React.createElement('div', { className: "p-4 rounded-2xl shadow bg-white" },
                    React.createElement('h2', { className: "font-medium mb-3" }, "Reference & Disturbance"),
                    React.createElement('div', { className: "flex flex-col gap-3" },
                        React.createElement('div', { className: "flex items-center gap-2 text-sm" },
                            React.createElement('label', { className: "flex items-center gap-2" },
                                React.createElement('input', {
                                    type: "radio",
                                    name: "inputType",
                                    value: "step",
                                    checked: inputType === "step",
                                    onChange: () => setInputType("step")
                                }),
                                "Step"
                            ),
                            React.createElement('label', { className: "flex items-center gap-2" },
                                React.createElement('input', {
                                    type: "radio",
                                    name: "inputType",
                                    value: "sine",
                                    checked: inputType === "sine",
                                    onChange: () => setInputType("sine")
                                }),
                                "Sine"
                            )
                        ),
                        inputType === "step" ?
                            React.createElement(Slider, { label: "θ_ref (rad)", value: ref, setValue: setRef, min: -0.5, max: 0.5, step: 0.005 }) :
                            React.createElement(React.Fragment, null,
                                React.createElement(Slider, { label: "Amplitude (rad)", value: amp, setValue: setAmp, min: 0, max: 0.4, step: 0.005 }),
                                React.createElement(Slider, { label: "Frequency (Hz)", value: freq, setValue: setFreq, min: 0.05, max: 2.0, step: 0.01 })
                            ),

                        React.createElement('div', { className: "flex items-center gap-2 text-sm" },
                            React.createElement('input', {
                                type: "checkbox",
                                checked: useDist,
                                onChange: (e) => setUseDist(e.target.checked)
                            }),
                            React.createElement('span', null, "Inject disturbance torque")
                        ),
                        React.createElement(Slider, { label: "Disturbance (N·m)", value: distMag, setValue: setDistMag, min: -4, max: 4, step: 0.05 }),
                        React.createElement(Slider, { label: "Disturbance time (s)", value: distTime, setValue: setDistTime, min: 0, max: horizon, step: 0.05 })
                    )
                ),

                React.createElement('div', { className: "p-4 rounded-2xl shadow bg-white" },
                    React.createElement('h2', { className: "font-medium mb-3" }, "Pendulum Parameters"),
                    React.createElement('div', { className: "flex flex-col gap-3" },
                        React.createElement(Slider, { label: "Mass m (kg)", value: m, setValue: setM, min: 0.1, max: 3, step: 0.01 }),
                        React.createElement(Slider, { label: "COM distance l (m)", value: l, setValue: setL, min: 0.1, max: 1.0, step: 0.01 }),
                        React.createElement(Slider, { label: "Damping c (N·m·s/rad)", value: c, setValue: setC, min: 0, max: 1.5, step: 0.01 }),
                        React.createElement(Slider, { label: "Gravity g (m/s²)", value: g, setValue: setG, min: 0, max: 15, step: 0.1 })
                    )
                )
            ),

            React.createElement('div', { className: "mt-6 p-4 rounded-2xl bg-white shadow text-sm text-gray-700 leading-6" },
                React.createElement('h3', { className: "font-medium mb-2" }, "Teaching Cues"),
                React.createElement('ul', { className: "list-disc ml-6 space-y-1" },
                    React.createElement('li', null, React.createElement('strong', null, "Nonlinearity:"), " The sin(θ) term makes the plant highly sensitive near ±π; small-angle ≈ linear."),
                    React.createElement('li', null, React.createElement('strong', null, "Angle wrapping:"), " Error uses the shortest angular distance. Toggle a ±0.3 rad step to illustrate."),
                    React.createElement('li', null, React.createElement('strong', null, "Kp:"), " increases stiffness (faster rise) but too large causes oscillation or saturation."),
                    React.createElement('li', null, React.createElement('strong', null, "Ki:"), " removes steady-state bias (e.g., with constant disturbance) but invites windup—show with low |u|max."),
                    React.createElement('li', null, React.createElement('strong', null, "Kd:"), " damps motion via measured ω; reduces overshoot after adding Ki."),
                    React.createElement('li', null, React.createElement('strong', null, "Disturbance rejection:"), " Fire a torque at t = 3 s and compare with/without Ki."),
                    React.createElement('li', null, React.createElement('strong', null, "Physical params:"), " Increase l or m → larger inertia I = m l² → slower response; increase c → more damping.")
                ),
                React.createElement('p', { className: "mt-2 italic" }, "Numerics: forward Euler; derivative term uses −ω to avoid derivative kick.")
            )
        );
    }

    // Render the React component
    ReactDOM.render(React.createElement(PIDInvertedPendulum), document.getElementById('pid-widget-root'));
</script>

</body>
</html>
