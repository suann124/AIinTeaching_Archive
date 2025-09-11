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
- The standard feedback loop and what **P**, **I**, **D** terms do
- Time- and Laplace-domain forms of PID
- Closed-loop transfer functions and basic performance intuition
- Practical **derivative filtering** and **anti-windup**
- Discrete-time implementation you can run in Python
- A sane, step-by-step **manual tuning** recipe (+ Ziegler–Nichols option)
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

## 1. Feedback loop and the error signal

We regulate plant output $y(t)$ to follow a reference $r(t)$.
The **error** is

```{math}
e(t) = r(t) - y(t).
```
A controller computes the control input $u(t)$ from $e(t)$. With unity
feedback the closed-loop block diagram is:

```{figure} https://dummyimage.com/880x150/ffffff/000000.png&text=Reference+-->(+)+--+-->+Controller+-->+Plant+-->+y(t);+(-)+feedback
:name: fig-pid-block
:align: center
A standard unity-feedback loop: the controller acts on the error $e=r-y$.
```

---

## 2. PID law (time and Laplace domains)

The continuous-time PID law is

```{math}
u(t) = K_p e(t) + K_i \int_0^t e(\tau)d\tau + K_d\frac{de}{dt}(t).
```

In Laplace domain (assuming zero initial conditions):

```{math}
U(s) = \left(K_p + \frac{K_i}{s} + K_d s\right) E(s) = G_c(s)E(s),
```
with controller transfer function

```{math}
G_c(s) = K_p + \frac{K_i}{s} + K_d s.
```

**Intuition**
- **P** reacts to present error → faster response, but too large $K_p$ can cause overshoot/instability.  
- **I** removes steady-state error (adds a pole at 0) → improves tracking of steps/ramps, but can slow response and cause windup.  
- **D** predicts/"brakes" fast changes → reduces overshoot and improves damping, but is noise-sensitive.

---

## 3. Closed-loop transfer functions

For plant $G_p(s)$ and controller $G_c(s)$ with unity feedback,

```{math}
T(s) \equiv \frac{Y(s)}{R(s)} = \frac{G_c(s)G_p(s)}{1 + G_c(s)G_p(s)}, \quad
S(s) \equiv \frac{E(s)}{R(s)} = \frac{1}{1+G_c(s)G_p(s)}.
```

- $T(s)$ is the **complementary sensitivity** (reference→output).  
- $S(s)$ is the **sensitivity** (reference→error, and also output's sensitivity to plant/model errors).

---

## 4. Practical PID: derivative filtering and anti-windup

**Derivative filtering.** Use a first-order filter to avoid amplifying sensor noise:

```{math}
G_d(s) = \frac{K_d s}{1 + \tau_d s}, \quad \text{so } G_c(s) = K_p + \frac{K_i}{s} + \frac{K_d s}{1 + \tau_d s}.
```
Typical $\tau_d$ is small (e.g., $\tau_d = K_d / N$ with $N \in [5,20]$).

**Actuator saturation & integral windup.** If $u$ saturates (e.g., $|u| \le u_{\max}$), the integrator can accumulate error and cause slow recovery.
A common **back-calculation** anti-windup is

```{math}
\dot{x}_I = e + \frac{u_\text{sat}-u_\text{raw}}{T_\text{aw}},
```
where $x_I$ is the integrator state, $u_{\text{raw}}$ the unclipped control, and $u_{\text{sat}}$ the saturated control.
$T_\text{aw}$ tunes how aggressively the integrator is "unwound".

---

## 5. Discrete-time implementation (ready to run)

Let sampling time be $\Delta t$. A robust direct form uses the **trapezoidal (Tustin)** integral and a filtered derivative:

**Integral update (trapezoidal):**
```{math}
x_I[k] = x_I[k-1] + \frac{\Delta t}{2}(e[k] + e[k-1])
```

**Filtered derivative:**
```{math}
d[k] = \alpha d[k-1] + (1-\alpha)\frac{e[k]-e[k-1]}{\Delta t}, \quad \alpha=\frac{\tau_d}{\tau_d+\Delta t}
```

**PID output:**
```{math}
u_\text{raw}[k] = K_p e[k] + K_i x_I[k] + K_d d[k]
```

**Saturation:**
```{math}
u[k] = \text{clip}(u_\text{raw}[k], u_{\min}, u_{\max})
```

**Anti-windup back-calculation:**
```{math}
x_I[k] \mathrel{+}= \frac{u[k]-u_\text{raw}[k]}{T_\text{aw}}
```

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

## 6. Worked example: first-order plant (no SciPy needed)

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

## 7. A simple manual tuning recipe

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

## 8. Discrete PID you can paste into projects

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

## 9. Common pitfalls (and quick fixes)

- **Noisy derivative** → add a small $\tau_d$, consider pre-filtering measurement $y$.  
- **Sluggish after saturation** → lower $K_i$, reduce $T_{\text{aw}}$, or widen limits if physically valid.  
- **Steady-state bias** → increase $K_i$ carefully or check for model/offsets; ensure sensor scale is correct.  
- **Discrete time too slow** → decrease $\Delta t$ (sample faster), retune; derivative becomes unreliable at long sample periods.