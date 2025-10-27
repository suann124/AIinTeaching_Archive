% ======================================================
% Time-domain response to sinusoidal input (matches Python output)
% ======================================================

% Define state-space system
A = -1;
B = 1;
C = 2;
D = 0;
sys_ss = ss(A, B, C, D);

% Simulation parameters
omega = 3.0;
t = linspace(0.0, 20.0, 1000);
u = sin(omega * t);
x0 = 3.0;  % initial condition on the state

% Simulate
[y, t_out, x] = lsim(sys_ss, u, t, x0);

% --- Plot ---
figure;
plot(t_out, u, 'b', 'LineWidth', 1.2); hold on;
plot(t_out, y, 'r', 'LineWidth', 1.5);
xlabel('Time [s]');
ylabel('Amplitude');
title('Input and Output');
legend('u(t) = sin(3t)', 'y(t)', 'Location', 'best');
grid on;

% Add space around limits
xlim([min(t)*0.95, max(t)*1.05]);
ylim padded;
