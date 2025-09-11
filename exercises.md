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

(exercises)=
# Exercises

 1. **First‑order plant.** Using `simulate_pid_first_order`, compare responses for:
    - (a) $K_p=0.8, K_i=0, K_d=0$
    - (b) $K_p=1.0, K_i=0.2, K_d=0$
    - (c) $K_p=1.0, K_i=0.2, K_d=0.05$ with $\tau_d=0.02$
    Measure rise time, overshoot, and settling time.

```{code-cell} ipython3
# Exercise 1: First-order plant comparison
# Copy the PID functions from the main lecture, then experiment with different gains!

import numpy as np
import matplotlib.pyplot as plt

# TODO: Copy the pid_discrete and simulate_pid_first_order functions from the main lecture
# TODO: Test the three configurations and compare their performance
# TODO: Calculate rise time, overshoot, and settling time for each

```

 2. **Windup experiment.** Set $u_{\max}=0.5$ and step to 2.0. Compare behavior with and without anti‑windup
    (set `Taw=1e9` to effectively disable back‑calculation). Explain the difference.

```{code-cell} ipython3
# Exercise 2: Windup experiment
# Experiment with saturated control and anti-windup

import numpy as np
import matplotlib.pyplot as plt

# TODO: Set up a simulation with umax=0.5 and reference=2.0
# TODO: Compare two cases: with anti-windup (Taw=0.1) and without (Taw=1e9)
# TODO: Plot both responses and control signals
# TODO: Explain why anti-windup helps

```

 3. **Load disturbance.** At $t=2$s add a disturbance $d$ to the plant, e.g., $x_{k+1}=x_k+\Delta t(a(u-x)+0.5)$.
    Retune $K_i$ so steady‑state error is minimized without oscillation.

```{code-cell} ipython3
# Exercise 3: Load disturbance rejection
# Experiment with different Ki values for disturbance rejection

import numpy as np
import matplotlib.pyplot as plt

# TODO: Modify the plant simulation to add a disturbance at t=2s
# TODO: Test different Ki values and see how they affect steady-state error
# TODO: Find the best Ki that minimizes error without causing oscillations

```

 4. **Ziegler–Nichols.** Find $K_u,P_u$ by increasing $K_p$ with $K_i=K_d=0$ until sustained oscillations appear.
    Use the Z–N table to propose PID gains and compare to your manual‑tuned set.

```{code-cell} ipython3
# Exercise 4: Ziegler-Nichols auto-tuning
# Find the ultimate gain and apply Z-N tuning rules

import numpy as np
import matplotlib.pyplot as plt

# TODO: Gradually increase Kp (with Ki=Kd=0) until you get sustained oscillations
# TODO: Measure the ultimate gain Ku and period Pu
# TODO: Apply Ziegler-Nichols tuning rules:
#   P:   Kp = 0.5*Ku
#   PI:  Kp = 0.45*Ku, Ki = 1.2*Kp/Pu  
#   PID: Kp = 0.6*Ku,  Ki = 2*Kp/Pu, Kd = Kp*Pu/8
# TODO: Compare with your manual tuning

```

 5. **Derivative filtering.** Sweep $\tau_d\in\{0, 0.005, 0.02, 0.1\}$ while adding measurement noise to $y$.
    Quantify the noise in $u$ (e.g., standard deviation) and discuss the trade‑off.

```{code-cell} ipython3
# Exercise 5: Derivative filtering vs noise
# Explore the trade-off between filtering and noise amplification

import numpy as np
import matplotlib.pyplot as plt

# TODO: Add measurement noise to your simulation
# TODO: Test different tau_d values: [0, 0.005, 0.02, 0.1]
# TODO: Measure control signal noise (standard deviation) for each case
# TODO: Plot the trade-off: more filtering = less noise, but slower D-action
# TODO: Which tau_d gives the best compromise?

```