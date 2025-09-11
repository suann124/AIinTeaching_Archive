import React, { useEffect, useMemo, useRef, useState } from "react";

// Interactive PID visualization — Inverted Pendulum (rotary) stabilization/tracking
// State: theta (rad), omega (rad/s). Control input u = torque at the pivot.
// Dynamics: I*theta_dd = u + d - c*omega - m*g*l*sin(theta), with I ≈ m*l^2 (point mass at l)
// Features:
//  - Sliders for Kp, Ki, Kd, saturation, dt, horizon
//  - Step/sine references for desired angle
//  - Disturbance torque injection at a chosen time
//  - Anti-windup via integral clamping and angle-wrapped error
//  - Plots: reference vs angle, and PID term decomposition

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const wrapPi = (a: number) => {
  // wrap to (-pi, pi]
  let x = ((a + Math.PI) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI) - Math.PI;
  if (x <= -Math.PI) x += 2 * Math.PI;
  return x;
};

// Simple line plot using <canvas>
function LinePlot({
  series,
  width = 900,
  height = 280,
  yMin,
  yMax,
  title,
  labels,
}: {
  series: number[][]; // array of equally-long arrays
  width?: number;
  height?: number;
  yMin?: number;
  yMax?: number;
  title?: string;
  labels?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
    const xScale = (i: number) => x0 + (plotW * i) / Math.max(1, n - 1);
    const yScale = (v: number) => y0 + plotH - ((v - minY) / (maxY - minY)) * plotH;

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

    const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]; // default palette
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

  return <canvas ref={canvasRef} className="rounded-2xl shadow" style={{ width, height }} />;
}

export default function PIDInvertedPendulum() {
  // Controller params
  const [kp, setKp] = useState(20.0);
  const [ki, setKi] = useState(5.0);
  const [kd, setKd] = useState(2.0);
  const [umax, setUmax] = useState(8); // torque saturation (N·m)
  const [dt, setDt] = useState(0.002);
  const [horizon, setHorizon] = useState(8); // seconds

  const [inputType, setInputType] = useState<"step" | "sine">("step");
  const [ref, setRef] = useState(0.0); // desired angle (rad); 0 = upright
  const [amp, setAmp] = useState(0.15); // amplitude for sine (rad)
  const [freq, setFreq] = useState(0.5); // Hz

  // Pendulum params
  const [m, setM] = useState(1.0); // kg
  const [l, setL] = useState(0.5); // m (COM distance)
  const [c, setC] = useState(0.2); // viscous damping (N·m·s/rad)
  const [g, setG] = useState(9.81);

  // disturbance torque
  const [useDist, setUseDist] = useState(true);
  const [distMag, setDistMag] = useState(1.5); // N·m
  const [distTime, setDistTime] = useState(3.0);

  const N = Math.max(10, Math.floor(horizon / dt));

  const sim = useMemo(() => {
    const y: number[] = new Array(N).fill(0); // theta trajectory
    const r: number[] = new Array(N).fill(0);
    const u: number[] = new Array(N).fill(0);
    const uP: number[] = new Array(N).fill(0);
    const uI: number[] = new Array(N).fill(0);
    const uD: number[] = new Array(N).fill(0);

    // Initial conditions: small deviation from upright
    let theta = 0.05; // rad
    let omega = 0.0;  // rad/s

    let integ = 0; // integral state (torque units)

    const I = Math.max(1e-6, m * l * l); // inertia approximation

    for (let i = 0; i < N; i++) {
      const t = i * dt;
      const desired = inputType === "step" ? ref : amp * Math.sin(2 * Math.PI * freq * t);
      r[i] = desired;

      // Angle-wrapped error so the controller chooses the shortest path
      const e = wrapPi(desired - theta);

      const up = kp * e;
      integ = clamp(integ + ki * e * dt, -umax, umax); // basic anti-windup
      const ud = kd * (-omega); // derivative on measurement: d/dt of theta is omega

      let uRaw = up + integ + ud;
      const uSat = clamp(uRaw, -umax, umax);

      u[i] = uSat; uP[i] = up; uI[i] = integ; uD[i] = ud;

      // Disturbance torque
      const d = useDist && t >= distTime ? distMag : 0;

      // Nonlinear pendulum dynamics: I*theta_dd = u + d - c*omega - m*g*l*sin(theta)
      const theta_dd = (uSat + d - c * omega - m * g * l * Math.sin(theta)) / I;

      // Integrate (forward Euler for clarity)
      omega = omega + dt * theta_dd;
      theta = theta + dt * omega;

      // keep angle within [-pi, pi] for readability
      theta = wrapPi(theta);

      y[i] = theta;
    }

    return { y, r, u, uP, uI, uD };
  }, [N, dt, inputType, ref, amp, freq, kp, ki, kd, umax, useDist, distMag, distTime, m, l, c, g]);

  const Slider = ({ label, value, setValue, min, max, step }: {
    label: string; value: number; setValue: (v: number) => void; min: number; max: number; step?: number;
  }) => (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm text-gray-700">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(3)}</span>
      </div>
      <input type="range" min={min} max={max} step={step ?? (max - min) / 200} value={value}
             onChange={(e) => setValue(parseFloat(e.target.value))} className="w-full" />
    </div>
  );

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <h1 className="text-2xl font-semibold mb-1">PID Control — Inverted Pendulum</h1>
      <p className="text-gray-700 mb-4">
        Stabilize or track angles for a rotary inverted pendulum using a PID controller acting on torque.
        The controller uses angle-wrapped error to avoid 2π jumps, and a simple anti-windup clamp.
      </p>

      <div className="grid grid-cols-1 gap-6">
        <LinePlot series={[sim.r, sim.y]} labels={["reference θ_ref (rad)", "angle θ (rad)"]} title="Angle Tracking" />
        <LinePlot series={[sim.u, sim.uP, sim.uI, sim.uD]} labels={["u (N·m)", "P", "I", "D"]} title="Control Signal Decomposition" />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl shadow bg-white">
          <h2 className="font-medium mb-3">Controller</h2>
          <div className="flex flex-col gap-3">
            <Slider label="Kp" value={kp} setValue={setKp} min={0} max={200} step={0.1} />
            <Slider label="Ki" value={ki} setValue={setKi} min={0} max={80} step={0.05} />
            <Slider label="Kd" value={kd} setValue={setKd} min={0} max={20} step={0.01} />
            <Slider label="|u|max (N·m)" value={umax} setValue={setUmax} min={0.5} max={20} step={0.1} />
            <Slider label="Time step dt (s)" value={dt} setValue={setDt} min={0.001} max={0.01} step={0.001} />
            <Slider label="Horizon (s)" value={horizon} setValue={setHorizon} min={2} max={20} step={0.1} />
          </div>
        </div>

        <div className="p-4 rounded-2xl shadow bg-white">
          <h2 className="font-medium mb-3">Reference & Disturbance</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="inputType" value="step" checked={inputType === "step"} onChange={() => setInputType("step")} />
                Step
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="inputType" value="sine" checked={inputType === "sine"} onChange={() => setInputType("sine")} />
                Sine
              </label>
            </div>
            {inputType === "step" ? (
              <Slider label="θ_ref (rad)" value={ref} setValue={setRef} min={-0.5} max={0.5} step={0.005} />
            ) : (
              <>
                <Slider label="Amplitude (rad)" value={amp} setValue={setAmp} min={0} max={0.4} step={0.005} />
                <Slider label="Frequency (Hz)" value={freq} setValue={setFreq} min={0.05} max={2.0} step={0.01} />
              </>
            )}

            <div className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useDist} onChange={(e) => setUseDist(e.target.checked)} />
              <span>Inject disturbance torque</span>
            </div>
            <Slider label="Disturbance (N·m)" value={distMag} setValue={setDistMag} min={-4} max={4} step={0.05} />
            <Slider label="Disturbance time (s)" value={distTime} setValue={setDistTime} min={0} max={horizon} step={0.05} />
          </div>
        </div>

        <div className="p-4 rounded-2xl shadow bg-white">
          <h2 className="font-medium mb-3">Pendulum Parameters</h2>
          <div className="flex flex-col gap-3">
            <Slider label="Mass m (kg)" value={m} setValue={setM} min={0.1} max={3} step={0.01} />
            <Slider label="COM distance l (m)" value={l} setValue={setL} min={0.1} max={1.0} step={0.01} />
            <Slider label="Damping c (N·m·s/rad)" value={c} setValue={setC} min={0} max={1.5} step={0.01} />
            <Slider label="Gravity g (m/s²)" value={g} setValue={setG} min={0} max={15} step={0.1} />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-white shadow text-sm text-gray-700 leading-6">
        <h3 className="font-medium mb-2">Teaching Cues</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Nonlinearity:</strong> The sin(θ) term makes the plant highly sensitive near ±π; small-angle ≈ linear.</li>
          <li><strong>Angle wrapping:</strong> Error uses the shortest angular distance. Toggle a ±0.3 rad step to illustrate.</li>
          <li><strong>Kp:</strong> increases stiffness (faster rise) but too large causes oscillation or saturation.</li>
          <li><strong>Ki:</strong> removes steady-state bias (e.g., with constant disturbance) but invites windup—show with low |u|max.</li>
          <li><strong>Kd:</strong> damps motion via measured ω; reduces overshoot after adding Ki.</li>
          <li><strong>Disturbance rejection:</strong> Fire a torque at t = 3 s and compare with/without Ki.</li>
          <li><strong>Physical params:</strong> Increase l or m → larger inertia I = m l² → slower response; increase c → more damping.</li>
        </ul>
        <p className="mt-2 italic">Numerics: forward Euler; derivative term uses −ω to avoid derivative kick.</p>
      </div>
    </div>
  );
}
