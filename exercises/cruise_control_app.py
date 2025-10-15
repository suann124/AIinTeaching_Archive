import streamlit as st
import numpy as np
import matplotlib.pyplot as plt

st.set_page_config(page_title="First-Order System: Cruise Control", layout="wide")
# st.title("🚗 First-Order System Analysis — Cruise Control")

# st.markdown("""
# This app demonstrates **first-order system concepts** using a simplified cruise control model:
# - **System equation**: $\dot{v} = -\frac{b}{m}v + \frac{k_u}{m}u$
# - **Time constant**: $T = \frac{m}{b}$
# - **Free response**: $v(t) = v_0 e^{-t/T}$ (when $u = 0$)
# - **Forced response**: $v(t) = \frac{k_u u_0}{b}(1 - e^{-t/T})$ (for step input $u_0$)
# """)

# --- Sidebar Parameters ---
st.sidebar.header("First-Order System Parameters")

# Core first-order system parameters
m = st.sidebar.slider("Vehicle mass [kg]", 800, 3000, 1600, 100)
b = st.sidebar.slider("Drag coefficient [N⋅s/m]", 100, 500, 300, 10)
k_u = st.sidebar.slider("Force conversion [N per throttle unit]", 20, 100, 50, 5)

# Calculate first-order system parameters
A = -b / m
B = k_u / m
T = m / b

st.sidebar.markdown("---")
st.sidebar.markdown("**System Parameters:**")
st.sidebar.markdown(f"A = {A:.4f}")
st.sidebar.markdown(f"B = {B:.4f}")
st.sidebar.markdown(f"Time constant T = {T:.2f} s")
st.sidebar.markdown(f"Stability: {'Stable' if A < 0 else 'Unstable'}")

# Simulation settings
st.sidebar.header("Simulation Settings")
T_sim = st.sidebar.slider("Simulation time [s]", 10, 50, 25, 5)
dt = 0.01
v0 = st.sidebar.number_input("Initial velocity [m/s]", 0.0, 30.0, 20.0, 1.0)
u_step = st.sidebar.number_input("Step input (throttle)", 0.0, 1.0, 0.5, 0.1)
t_step = st.sidebar.number_input("Step input time [s]", 1.0, 20.0, 5.0, 1.0)


# --- First-Order System Analysis ---
def free_response(t, v0, A):
    """Free response: v(t) = v0 * exp(A*t)"""
    return v0 * np.exp(A * t)


def forced_response(t, u0, A, B):
    """Forced response: v(t) = (B*u0/(-A)) * (1 - exp(A*t))"""
    v_steady = (B * u0) / (-A)
    return v_steady * (1 - np.exp(A * t))


def step_input(t, t_step, u0):
    """Step input function"""
    return u0 * (t >= t_step)


def u_torque(t_scalar):
    """
    Torque profile [N·m]:
    - Step up to 100 N·m at 2 s
    - Add 60 N·m at 15 s
    - Reduce 40 N·m at 28 s
    """
    val = 0.0
    if t_scalar >= 2.0:
        val += 100.0
    if t_scalar >= 15.0:
        val += 60.0
    if t_scalar >= 28.0:
        val -= 40.0
    return val


def theta_slope(t_scalar):
    """
    Road slope [radians]:
    - Uphill (+2°) from 10 s to 22 s
    - Downhill (-1.5°) from 28 s to 34 s
    """
    if 10.0 <= t_scalar < 22.0:
        return 2.0 * np.pi / 180.0
    if 28.0 <= t_scalar < 34.0:
        return -1.5 * np.pi / 180.0
    return 0.0


def w_disturbance(t_scalar):
    """
    External disturbance [N]:
    Two gusts of wind at 18 s and 30 s.
    """
    w1 = 400.0 * np.exp(-0.5 * ((t_scalar - 18.0) / 1.0) ** 2)
    w2 = 250.0 * np.exp(-0.5 * ((t_scalar - 30.0) / 0.6) ** 2)
    return w1 + w2


# --- First-Order System Analysis ---
if st.sidebar.button("Run Analysis"):
    # Create time vector
    t = np.linspace(0, T_sim, int(T_sim / dt))

    # Calculate responses
    v_free = free_response(t, v0, A)
    v_forced = forced_response(t, u_step, A, B)
    # u_input = step_input(t, t_step, u_step)
    u_input = np.array([u_torque(ti) for ti in t])

    theta_signal = np.array([theta_slope(ti) for ti in t])
    w_disturbance = np.array([w_disturbance(ti) for ti in t])

    # Complete response (free + forced)
    v_complete = v_free + v_forced * (t >= t_step)

    # Steady-state values
    v_steady = (B * u_step) / (-A) if A != 0 else 0

    # --- Key System Metrics ---
    st.markdown("## 📊 Key System Metrics")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Time Constant T", f"{T:.2f} s", help="Time for response to reach 63% of final value")

    with col2:
        st.metric("Steady-State Velocity", f"{v_steady:.2f} m/s", help="Final velocity with constant throttle")

    with col3:
        settling_time = 5 * T  # 5 time constants for settling
        st.metric("Settling Time (5T)", f"{settling_time:.1f} s", help="Time to reach 99% of final value")

    # Add disturbance simulation
    disturbance_strength = 0.1  # 10% grade
    disturbance_start = T_sim * 0.3
    disturbance_end = T_sim * 0.7

    # Create disturbance signal
    w_disturbance = np.zeros_like(t)
    w_disturbance[(t >= disturbance_start) & (t <= disturbance_end)] = disturbance_strength

    # Calculate response with disturbance
    # Simplified: disturbance acts like additional drag
    b_effective = b + w_disturbance * m * 9.81  # Add gravitational component
    A_disturbed = -b_effective / m
    v_disturbed = np.zeros_like(t)
    v_disturbed[0] = v0

    # Simple integration for disturbed system
    for i in range(1, len(t)):
        dt_step = t[i] - t[i - 1]
        v_disturbed[i] = v_disturbed[i - 1] + (A_disturbed[i - 1] * v_disturbed[i - 1] + B * u_input[i - 1]) * dt_step

    fig3, (ax3a, ax3b, ax3c, ax3d) = plt.subplots(4, 1, figsize=(10, 8))

    # Torque input
    ax3a.plot(t, u_input, "r-", linewidth=2, label="Throttle input u(t)")
    ax3a.set_ylabel("Input u(t)")
    ax3a.set_title("Torque Input")
    ax3a.grid(True, alpha=0.3)
    ax3a.legend()
    # ax3a.set_ylim([0, 1.1])

    # road slope
    ax3b.plot(t, theta_signal, "green", linewidth=2, label="Road slope theta(t)")
    ax3b.set_ylabel("Road slope w(t)")
    ax3b.set_title("Road Slope")
    ax3b.grid(True, alpha=0.3)
    ax3b.legend()

    # Disturbance force
    ax3c.plot(t, w_disturbance, "orange", linewidth=2, label="Disturbance w(t)")
    ax3c.axvspan(disturbance_start, disturbance_end, alpha=0.3, color="orange", label="Disturbance period")
    ax3c.set_ylabel("Disturbance w(t)")
    ax3c.set_title("External Disturbance (Road Slope)")
    ax3c.grid(True, alpha=0.3)
    ax3c.legend()

    # Output comparison
    ax3d.plot(t, v_complete, "b-", linewidth=2, label="Without disturbance")
    ax3d.plot(t, v_disturbed, "r--", linewidth=2, label="With disturbance")
    ax3d.axvspan(disturbance_start, disturbance_end, alpha=0.2, color="orange", label="Disturbance period")
    ax3d.set_xlabel("Time [s]")
    ax3d.set_ylabel("Velocity v(t) [m/s]")
    ax3d.set_title("Output Response: Effect of Disturbances")
    ax3d.grid(True, alpha=0.3)
    ax3d.legend()

    plt.tight_layout()
    st.pyplot(fig3)


else:
    st.info("👈 Adjust parameters and click 'Run Analysis' to start the first-order system analysis.")
