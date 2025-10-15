---
jupytext:
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.16.1
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---

(pid)=
# Lecture 1: (PID) Control

```{admonition} What you will learn
:class: tip
- **PID controller structure** and transfer function representation
- **Closed-loop analysis** using transfer functions $G_{ry}(s)$
- Effects of **P**, **I**, **D** terms on steady-state error and transient response
- **Disturbance rejection** properties of integral action
- **Practical implementation** considerations and discrete-time forms
- **Manual tuning** strategies based on closed-loop characteristics
```

```{margin}
**Original slides**: {download}`PID lecture PDF <_static/pid.pdf>`  
The PDF is embedded below for quick reference.
```

```{raw} html
<object data="_static/pid.pdf" type="application/pdf" width="100%" height="520px">
  <p>PDF preview unavailable. <a href="_static/pid.pdf">Open the PDF.</a></p>
</object>
```

---

## 1. Proportional-Integral-Derivative (PID) Control Structure

Consider the standard unity feedback control system where we want the plant output $y(t)$ to track a reference signal $r(t)$. The **error signal** is defined as:

```{math}
e(t) = r(t) - y(t)
```

The PID controller computes the control input as:

```{math}
u(t) = k_p e(t) + k_i \int_0^t e(\tau)d\tau + k_d \frac{de(t)}{dt}
```

where:
- **Proportional term**: $k_p e(t)$ depends on the instantaneous error value
- **Integral term**: $k_i \int_0^t e(\tau)d\tau$ is based on the integral of error up to time $t$  
- **Derivative term**: $k_d \frac{de(t)}{dt}$ provides an estimate of the future error

```{figure} https://dummyimage.com/880x150/ffffff/000000.png&text=r+-->(+)+--+-->+PID+Controller+-->+Plant+P(s)+-->+y(t);+(-)+feedback
:name: fig-pid-structure
:align: center
Unity feedback system with PID controller
```

---

## 2. Transfer Function Representation

Taking the Laplace transform (assuming zero initial conditions), the **controller transfer function** from error $e$ to control input $u$ is:

```{math}
C(s) = k_p + \frac{k_i}{s} + k_d s
```

For a plant with transfer function $P(s)$, the **closed-loop transfer function** from reference $r$ to output $y$ is:

```{math}
G_{ry}(s) = \frac{P(s)C(s)}{1 + P(s)C(s)}
```

**Key insight**: The steady-state gain of a stable transfer function $H(s)$ under unit step input is $H(0)$.

---

## 3. Analysis of Proportional-Only Control

Consider **pure proportional feedback** with $k_i = 0$ and $k_d = 0$, so $C(s) = k_p$.

The steady-state output due to a unit step reference input is:

```{math}
y_{ss} = G_{ry}(0) \cdot 1 = \frac{C(0)P(0)}{1 + C(0)P(0)} = \frac{k_p P(0)}{1 + k_p P(0)}
```

**Key observations:**
- **Steady-state error exists**: $e_{ss} = 1 - y_{ss} = \frac{1}{1 + k_p P(0)}$
- **Error decreases** as $k_p$ increases, but **never reaches zero**
- **Trade-off**: Larger $k_p$ reduces steady-state error but can cause overshoot and oscillations

---

## 4. Effect of Integral Action

Now consider **PI control** with $C(s) = k_p + \frac{k_i}{s}$.

The closed-loop transfer function becomes:

```{math}
G_{ry}(s) = \frac{\left(k_p + \frac{k_i}{s}\right) P(s)}{1 + \left(k_p + \frac{k_i}{s}\right) P(s)} = \frac{(k_p s + k_i) P(s)}{s + P(s)(k_p s + k_i)}
```

For steady-state analysis with unit step reference:

```{math}
G_{ry}(0) = \frac{k_i P(0)}{k_i P(0)} = 1
```

**Key results:**
- **Perfect reference tracking**: $y_{ss} = 1$ regardless of plant parameters
- **Zero steady-state error**: Independent of plant gain $P(0)$
- **Trade-off**: Higher $k_i$ speeds convergence but increases oscillations

**Disturbance rejection**: With only integral action $C(s) = k_i/s$, the transfer function from step disturbance $d$ to output is:

```{math}
G_{dy}(s) = \frac{P(s)}{1 + P(s)C(s)} \Rightarrow G_{dy}(0) = 0
```

This gives **perfect disturbance rejection** at steady-state.

---

## 5. Effect of Derivative Action

Adding the derivative term gives full **PID control**: $C(s) = k_p + \frac{k_i}{s} + k_d s$.

**Key insight**: The derivative term acts on the rate of change of error, effectively providing a "prediction" of future error and helping to "brake" the system response.

**Damping effect**: Consider a second-order plant with natural frequency $\omega_n$ and damping ratio $\zeta$. Adding derivative control with gain $k_d$ modifies the closed-loop damping:

```{math}
\zeta_{new} = \zeta + \frac{k_d \omega_n}{2}
```

**Benefits of derivative action:**
- **Reduces overshoot** and oscillations in step response
- **Improves stability margins** and transient performance  
- **Provides faster settling** without increasing steady-state error

**Limitations:**
- **Amplifies high-frequency noise** due to differentiation
- **No effect on steady-state** behavior (since $\lim_{s \to 0} k_d s = 0$)

---

## 6. Practical Implementation Considerations

**Derivative filtering**: In practice, pure differentiation amplifies noise. Use a filtered derivative:

```{math}
C(s) = k_p + \frac{k_i}{s} + \frac{k_d s}{1 + \tau_d s}
```

where $\tau_d$ is a small time constant (typically $\tau_d = k_d/N$ with $N \in [5,20]$).

**Integral windup**: When actuators saturate, the integrator can accumulate large values leading to poor transient response. **Anti-windup schemes** prevent this by stopping integration when saturation occurs.

**Digital implementation**: For sampling time $\Delta t$, use approximations:
- **Integral**: Trapezoidal rule for better accuracy
- **Derivative**: Backward difference with filtering for noise rejection

---

## 7. Worked Example: First-Order Plant

Consider a simple first-order plant: $P(s) = \frac{1}{s+1}$ and analyze the effect of different controller structures.

**P-only control**: $C(s) = k_p$

Closed-loop transfer function: $G_{ry}(s) = \frac{k_p}{s + 1 + k_p}$

Steady-state value for unit step: $y_{ss} = \frac{k_p}{1 + k_p}$

**PI control**: $C(s) = k_p + \frac{k_i}{s}$

Closed-loop transfer function: $G_{ry}(s) = \frac{k_p s + k_i}{s^2 + (1+k_p)s + k_i}$

Steady-state value for unit step: $y_{ss} = 1$ (perfect tracking)

The poles are at $s = \frac{-(1+k_p) \pm \sqrt{(1+k_p)^2 - 4k_i}}{2}$

```{code-cell} ipython3
import numpy as np
import math

def pid_discrete(e, st, Kp=1.2, Ki=0.3, Kd=0.05, dt=0.01,
                 tau_d=0.02, umin=-5.0, umax=5.0, Taw=0.1):
    """
    One PID update with filtered D and back-calculation anti-windup.
    st = dict(integ, prev_e, d_filt)
    Returns (u, st)
    """
    integ, prev_e, d_filt = st["integ"], st["prev_e"], st["d_filt"]

    # trapezoidal integral
    integ = integ + 0.5*dt*(e + prev_e)

    # filtered derivative
    alpha = tau_d/(tau_d + dt) if tau_d > 0 else 0.0
    d_raw = (e - prev_e)/dt if dt > 0 else 0.0
    d_filt = alpha*d_filt + (1.0 - alpha)*d_raw

    u_raw = Kp*e + Ki*integ + Kd*d_filt

    # saturation and anti-windup
    u = max(umin, min(umax, u_raw))
    integ += (u - u_raw)/Taw  # back-calculation

    st = {"integ": integ, "prev_e": e, "d_filt": d_filt}
    return u, st
```

---

## 8. Interactive Simulation Example

Consider $x_{k+1} = x_k + \Delta t [a (u_k - x_k)]$  
(a leaky bucket / first-order lag with rate $a$).

```{code-cell} ipython3
import numpy as np

def simulate_pid_first_order(Kp=1.2, Ki=0.3, Kd=0.05, dt=0.01, T=5.0, a=5.0,
                             ref=1.0, tau_d=0.02, umin=-5, umax=5, Taw=0.1):
    n = int(T/dt)
    x = 0.0
    st = {"integ": 0.0, "prev_e": 0.0, "d_filt": 0.0}
    xs, us, es, ts = [], [], [], []

    for k in range(n):
        t = k*dt
        e = ref - x
        u, st = pid_discrete(e, st, Kp, Ki, Kd, dt, tau_d, umin, umax, Taw)
        # plant update
        x = x + dt*(a*(u - x))
        xs.append(x); us.append(u); es.append(e); ts.append(t)
    return np.array(ts), np.array(xs), np.array(us), np.array(es)

ts, xs, us, es = simulate_pid_first_order()
float(xs[-1]), float(us[-1])
```

```{code-cell} ipython3
# Plot (matplotlib is available in most Jupyter installs)
import matplotlib.pyplot as plt

plt.figure()
plt.plot(ts, xs, label='x (output)')
plt.plot(ts, np.ones_like(ts), '--', label='reference')
plt.xlabel('time [s]'); plt.ylabel('output')
plt.title('Step response with PID')
plt.legend(); plt.show()

plt.figure()
plt.plot(ts, us, label='u (control)')
plt.xlabel('time [s]'); plt.ylabel('u')
plt.title('Control effort (with saturation)')
plt.legend(); plt.show()
```

**Try this:** increase $K_p$ (faster but overshoot), add $K_d$ (damps overshoot), then raise $K_i$ (remove any residual bias, watch for windup).

---

## 9. Experiment: Understanding P, I, D effects on a second-order plant

Let's explore how each PID term affects system behavior using a **mass-spring-damper** system (common in mechanical control). The plant transfer function is:

```{math}
G_p(s) = \frac{\omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}
```

where $\omega_n = 2$ rad/s is the natural frequency and $\zeta = 0.1$ is the damping ratio (lightly damped).

### Step 1: Proportional-only control

First, let's see what happens with **P-only** control ($K_i = 0$, $K_d = 0$):

```{code-cell} ipython3
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal

# Plant: underdamped second-order system
wn = 2.0  # natural frequency
zeta = 0.1  # damping ratio
num_p = [wn**2]
den_p = [1, 2*zeta*wn, wn**2]
Gp = signal.TransferFunction(num_p, den_p)

# Time vector
t = np.linspace(0, 8, 800)

def multiply_tf(tf1, tf2):
    """Multiply two transfer functions manually"""
    # (n1/d1) * (n2/d2) = (n1*n2)/(d1*d2)
    num = np.polymul(tf1.num, tf2.num)
    den = np.polymul(tf1.den, tf2.den)
    return signal.TransferFunction(num, den)

def closed_loop_tf(Gc, Gp):
    """Calculate closed-loop transfer function T = GcGp/(1+GcGp)"""
    # First multiply Gc * Gp
    GcGp = multiply_tf(Gc, Gp)
    
    # T = GcGp / (1 + GcGp)
    # This means T = GcGp.num / (GcGp.den + GcGp.num)
    num_cl = GcGp.num
    den_cl = np.polyadd(GcGp.den, GcGp.num)
    
    return signal.TransferFunction(num_cl, den_cl)

# Test different Kp values
Kp_values = [0.5, 1.0, 2.0, 4.0]
plt.figure(figsize=(10, 6))

for Kp in Kp_values:
    # P-only controller
    Gc = signal.TransferFunction([Kp], [1])
    
    # Closed-loop transfer function T(s) = GcGp/(1+GcGp)
    T_cl = closed_loop_tf(Gc, Gp)
    
    # Step response
    t_step, y_step = signal.step(T_cl, T=t)
    
    plt.plot(t_step, y_step, label=f'Kp = {Kp}', linewidth=2)

plt.axhline(y=1, color='k', linestyle='--', alpha=0.5, label='Reference')
plt.xlabel('Time [s]')
plt.ylabel('Output')
plt.title('P-only Control: Effect of Increasing Kp')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xlim(0, 8)
plt.show()

# Show steady-state error for each case
print("Steady-state values (should be 1.0 for perfect tracking):")
for Kp in Kp_values:
    Gc = signal.TransferFunction([Kp], [1])
    T_cl = closed_loop_tf(Gc, Gp)
    _, y_step = signal.step(T_cl, T=t)
    ss_value = y_step[-1]
    ss_error = 1.0 - ss_value
    print(f"Kp = {Kp}: SS value = {ss_value:.3f}, SS error = {ss_error:.3f}")
```

**Observations:**
- Higher $K_p$ → faster response but more overshoot
- **Steady-state error remains** (P-only cannot eliminate it for step inputs)
- Too high $K_p$ → system becomes oscillatory/unstable

### Step 2: Adding integral action (PI control)

Now add integral action to eliminate steady-state error:

```{code-cell} ipython3
# PI Controller: Gc(s) = Kp + Ki/s
Kp = 1.0  # Fixed proportional gain
Ki_values = [0.0, 0.5, 1.0, 2.0]

plt.figure(figsize=(10, 6))

for Ki in Ki_values:
    # PI controller
    if Ki == 0:
        Gc = signal.TransferFunction([Kp], [1])
        label = f'P-only (Ki = 0)'
    else:
        # Kp + Ki/s = (Kp*s + Ki)/s
        Gc = signal.TransferFunction([Kp, Ki], [1, 0])
        label = f'PI (Ki = {Ki})'
    
    # Closed-loop
    T_cl = closed_loop_tf(Gc, Gp)
    t_step, y_step = signal.step(T_cl, T=t)
    
    plt.plot(t_step, y_step, label=label, linewidth=2)

plt.axhline(y=1, color='k', linestyle='--', alpha=0.5, label='Reference')
plt.xlabel('Time [s]')
plt.ylabel('Output')
plt.title('PI Control: Effect of Adding Integral Action')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xlim(0, 8)
plt.show()

# Check final values
print("Final values with PI control:")
for Ki in Ki_values[1:]:  # Skip Ki=0 case
    Gc = signal.TransferFunction([Kp, Ki], [1, 0])
    T_cl = closed_loop_tf(Gc, Gp)
    _, y_step = signal.step(T_cl, T=t)
    print(f"Ki = {Ki}: Final value = {y_step[-1]:.6f}")
```

**Key insight:** Integral action eliminates steady-state error but can make the response slower and more oscillatory.

### Step 3: Adding derivative action (full PID)

Finally, add derivative action to improve transient response:

```{code-cell} ipython3
# PID Controller: Gc(s) = Kp + Ki/s + Kd*s
Kp, Ki = 1.0, 1.0  # Fixed P and I gains
Kd_values = [0.0, 0.1, 0.2, 0.5]

plt.figure(figsize=(10, 6))

for Kd in Kd_values:
    if Kd == 0:
        # PI only
        Gc = signal.TransferFunction([Kp, Ki], [1, 0])
        label = f'PI (Kd = 0)'
    else:
        # Kp + Ki/s + Kd*s = (Kd*s^2 + Kp*s + Ki)/s
        Gc = signal.TransferFunction([Kd, Kp, Ki], [1, 0])
        label = f'PID (Kd = {Kd})'
    
    T_cl = closed_loop_tf(Gc, Gp)
    t_step, y_step = signal.step(T_cl, T=t)
    
    plt.plot(t_step, y_step, label=label, linewidth=2)

plt.axhline(y=1, color='k', linestyle='--', alpha=0.5, label='Reference')
plt.xlabel('Time [s]')
plt.ylabel('Output')
plt.title('PID Control: Effect of Adding Derivative Action')
plt.legend()
plt.grid(True, alpha=0.3)
plt.xlim(0, 8)
plt.show()

# Performance metrics
print("Performance comparison (overshoot, settling time):")
for Kd in Kd_values:
    if Kd == 0:
        Gc = signal.TransferFunction([Kp, Ki], [1, 0])
        controller_type = "PI"
    else:
        Gc = signal.TransferFunction([Kd, Kp, Ki], [1, 0])
        controller_type = "PID"
    
    T_cl = closed_loop_tf(Gc, Gp)
    _, y_step = signal.step(T_cl, T=t)
    
    # Find overshoot
    peak_value = np.max(y_step)
    overshoot = (peak_value - 1.0) * 100  # percentage
    
    # Find settling time (within 2% of final value)
    final_val = y_step[-1]
    settle_band = 0.02 * final_val
    settled_indices = np.where(np.abs(y_step - final_val) <= settle_band)[0]
    if len(settled_indices) > 0:
        settle_time = t[settled_indices[0]]
    else:
        settle_time = t[-1]
    
    print(f"{controller_type} (Kd={Kd}): Overshoot = {overshoot:.1f}%, Settling time = {settle_time:.2f}s")
```

**Derivative benefits:**
- Reduces overshoot and oscillation
- Improves damping and settling time
- Acts like a "brake" on fast changes

### Step 4: Frequency domain analysis

Let's examine the **closed-loop frequency response** to understand stability margins:

```{code-cell} ipython3
# Compare frequency responses
Kp, Ki, Kd = 1.0, 1.0, 0.2  # Well-tuned PID

# Controllers
Gc_P = signal.TransferFunction([Kp], [1])
Gc_PI = signal.TransferFunction([Kp, Ki], [1, 0])
Gc_PID = signal.TransferFunction([Kd, Kp, Ki], [1, 0])

controllers = [
    (Gc_P, "P-only", "blue"),
    (Gc_PI, "PI", "orange"), 
    (Gc_PID, "PID", "green")
]

# Frequency range
w = np.logspace(-1, 2, 1000)

plt.figure(figsize=(12, 5))

# Magnitude plot
plt.subplot(1, 2, 1)
for Gc, label, color in controllers:
    T_cl = closed_loop_tf(Gc, Gp)
    _, H = signal.freqresp(T_cl, w)
    plt.semilogx(w, 20*np.log10(np.abs(H)), label=label, color=color, linewidth=2)

plt.axhline(y=-3, color='k', linestyle='--', alpha=0.5, label='-3 dB')
plt.xlabel('Frequency [rad/s]')
plt.ylabel('Magnitude [dB]')
plt.title('Closed-Loop Frequency Response')
plt.legend()
plt.grid(True, alpha=0.3)

# Phase plot
plt.subplot(1, 2, 2)
for Gc, label, color in controllers:
    T_cl = closed_loop_tf(Gc, Gp)
    _, H = signal.freqresp(T_cl, w)
    plt.semilogx(w, np.angle(H)*180/np.pi, label=label, color=color, linewidth=2)

plt.xlabel('Frequency [rad/s]')
plt.ylabel('Phase [degrees]')
plt.title('Closed-Loop Phase Response')
plt.legend()
plt.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Bandwidth comparison
print("Closed-loop bandwidth (-3 dB frequency):")
for Gc, label, _ in controllers:
    T_cl = closed_loop_tf(Gc, Gp)
    _, H = signal.freqresp(T_cl, w)
    mag_db = 20*np.log10(np.abs(H))
    
    # Find -3 dB point
    idx_3db = np.where(mag_db <= -3)[0]
    if len(idx_3db) > 0:
        bw = w[idx_3db[0]]
        print(f"{label}: {bw:.2f} rad/s")
    else:
        print(f"{label}: > {w[-1]:.1f} rad/s (no -3 dB point found)")
```

**Summary of PID effects:**
1. **P**: Fast response, steady-state error, potential instability
2. **I**: Eliminates steady-state error, slower response, can cause oscillation  
3. **D**: Improves damping, reduces overshoot, increases bandwidth

---

## 10. A simple manual tuning recipe

1. **Start conservative.** Set $K_i = 0$, $K_d = 0$. Increase $K_p$ until the output responds quickly but without sustained oscillation.  
2. **Add derivative.** Increase $K_d$ to reduce overshoot/oscillation; tune $\tau_d$ so derivative is smooth (e.g., $\tau_d \approx 5\Delta t$).  
3. **Add integral.** Increase $K_i$ to eliminate steady-state error; if it oscillates or recovers slowly after saturation, reduce $K_i$ or lower $T_{\text{aw}}$.  
4. **Check saturation.** Ensure your actuator limits are realistic and anti-windup behaves (no long “stuck at limit” recovery).

**Ziegler–Nichols (classic)** (optional): set $K_i = K_d = 0$, increase $K_p$ to the **ultimate gain** $K_u$ where output sustains oscillation; note period $P_u$. Then
- P: $K_p = 0.5K_u$  
- PI: $K_p = 0.45K_u, \quad K_i = 1.2K_p/P_u$  
- PID: $K_p = 0.6K_u, \quad K_i = 2K_p/P_u, \quad K_d = K_pP_u/8$  
These are aggressive; back off for robustness.

---

## 11. Discrete PID you can paste into projects

```{code-cell} ipython3
class PID:
    def __init__(self, Kp=1.0, Ki=0.0, Kd=0.0, dt=0.01, tau_d=0.02,
                 umin=-np.inf, umax=np.inf, Taw=0.1):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.dt, self.tau_d = dt, tau_d
        self.umin, self.umax = umin, umax
        self.Taw = Taw
        self.integ = 0.0
        self.prev_e = 0.0
        self.d_filt = 0.0

    def step(self, e):
        dt = self.dt
        # integral (trapezoid)
        self.integ += 0.5*dt*(e + self.prev_e)
        # derivative (filtered)
        if self.tau_d > 0:
            alpha = self.tau_d/(self.tau_d + dt)
            d_raw = (e - self.prev_e)/dt
            self.d_filt = alpha*self.d_filt + (1-alpha)*d_raw
        else:
            self.d_filt = (e - self.prev_e)/dt
        u_raw = self.Kp*e + self.Ki*self.integ + self.Kd*self.d_filt
        # saturation + anti-windup
        u = max(self.umin, min(self.umax, u_raw))
        self.integ += (u - u_raw)/self.Taw
        self.prev_e = e
        return u
```

---

## 12. Common pitfalls (and quick fixes)

- **Noisy derivative** → add a small $\tau_d$, consider pre-filtering measurement $y$.  
- **Sluggish after saturation** → lower $K_i$, reduce $T_{\text{aw}}$, or widen limits if physically valid.  
- **Steady-state bias** → increase $K_i$ carefully or check for model/offsets; ensure sensor scale is correct.  
- **Discrete time too slow** → decrease $\Delta t$ (sample faster), retune; derivative becomes unreliable at long sample periods.