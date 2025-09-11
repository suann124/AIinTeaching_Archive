---
jupytext:
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.13
    jupytext_version: 1.16.1
---

# Interactive PID Simulation

```{admonition} 🎯 Learning Objectives
:class: tip
After using this simulation, you should be able to:
- **Observe** how P, I, D terms affect system response in real-time
- **Experiment** with different parameter combinations and see immediate results
- **Understand** the trade-offs between response speed, stability, and robustness
- **Apply** PID tuning intuition to a realistic nonlinear system
```

## Inverted Pendulum Control

The simulation below lets you control a **rotary inverted pendulum** - a classic control challenge where you balance a pendulum in the upright position using torque at the base.

**Key Features:**
- **Real-time visualization** of angle tracking and control signals
- **Interactive sliders** for all PID parameters (Kp, Ki, Kd)
- **Multiple reference types**: step changes and sine wave tracking
- **Disturbance testing** to evaluate robustness
- **Physical parameter tuning** (mass, length, damping, gravity)

```{raw} html
<div class="pid-simulation-container" style="margin: 20px 0;">
    <div style="text-align: center; padding: 40px; color: #666;">
        <p>🔄 Loading interactive PID simulation...</p>
        <p style="font-size: 14px; margin-top: 10px;">
            This may take a few seconds to initialize...
        </p>
    </div>
</div>

<style>
.slider-range {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    background: #e5e7eb;
    outline: none;
}

.slider-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
}

.slider-range::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
}
</style>
```

## How to Use the Simulation

### 1. **Start Simple** 
Begin with Kp-only control:
- Set `Ki = 0`, `Kd = 0`
- Increase `Kp` from 0 until you get reasonable tracking
- Notice when oscillations start to appear

### 2. **Add Damping**
- Gradually increase `Kd` to reduce overshoot
- Observe how derivative action smooths the response

### 3. **Eliminate Steady-State Error**
- Add small amounts of `Ki` to remove any remaining offset
- Watch for integral windup when saturation occurs

### 4. **Test Robustness**
- Enable disturbance torque at t = 3 seconds
- Try different physical parameters (mass, length)
- Switch to sine wave tracking for dynamic performance

## Understanding the Physics

The inverted pendulum follows the nonlinear dynamics:

```{math}
I\ddot{\theta} = u + d - c\dot{\theta} - mgl\sin(\theta)
```

Where:
- $I = ml^2$ is the rotational inertia  
- $u$ is the control torque (PID output)
- $d$ is the disturbance torque
- $c$ is viscous damping
- $mgl\sin(\theta)$ is the gravitational restoring torque

The **nonlinearity** from $\sin(\theta)$ makes this much more challenging than linear systems - small changes in parameters can have dramatic effects!

## Experimental Exercises

```{admonition} 🧪 Try These Experiments
:class: note

**Experiment 1: PID Tuning**
1. Start with Kp=10, Ki=0, Kd=0
2. Increase Kp until you see oscillations
3. Add Kd=2 and see the improvement
4. Add Ki=1 and observe steady-state performance

**Experiment 2: Saturation Effects** 
1. Set low torque limit (|u|max = 2 N·m)
2. Try large step changes (θ_ref = 0.3 rad)
3. Watch how integral windup affects recovery

**Experiment 3: Nonlinear Behavior**
1. Try large angle disturbances near ±π
2. Compare response to small vs large reference steps
3. Change gravity to see how nonlinearity scales
```

## Teaching Notes

This simulation demonstrates several key control concepts:

- **P-I-D Trade-offs**: Speed vs stability vs steady-state accuracy
- **Saturation & Anti-windup**: How actuator limits affect performance  
- **Nonlinear Effects**: Why linear design techniques have limitations
- **Disturbance Rejection**: The value of integral action
- **Physical Intuition**: How plant parameters affect control difficulty

The pendulum is an excellent teaching example because:
- Students can **visualize** the physics (balancing a stick)
- **Nonlinearity** is obvious and dramatic  
- **Parameter effects** are immediately visible
- It bridges theory with **real robotics applications**

---

**Next**: Try implementing this PID controller in the [Python exercises](pid.md) and compare simulated vs theoretical performance!