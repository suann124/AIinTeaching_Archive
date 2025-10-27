
% ======================================================
% Solve the first-order differential equation
%       e_dot = A * e + B * v_d(t)
% for a given desired speed profile v_d(t) and multiple initial conditions.
%
% User specifies:
%   - A, B: system parameters
%   - x0_vec: list of initial error values
% ======================================================

clear; close all; clc;

% ======================================================
% User-defined parameters
% ======================================================
A = -1.0;
B = 0.1;
x0_vec = [-1.0, -0.5, 0.0, 0.5, 1.0];   % initial error values [m/s]
t_span = [0 20];                         % time interval [s]
t_eval = linspace(t_span(1), t_span(2), 500);

% ======================================================
% Desired speed profile (as a function handle)
% ======================================================
v_d = @(t) (t < 5).*40.0 + (t >= 5).*50.0;

% ======================================================
% Differential equation (as a function handle)
% ======================================================
e_dot = @(t, e) A*e + B*v_d(t);

% ======================================================
% Solve for each initial condition
% ======================================================
solutions = cell(length(x0_vec),1);
for i = 1:length(x0_vec)
    x0 = x0_vec(i);
    % Solve using ode45 (similar to solve_ivp)
    [t_sol, e_sol] = ode45(e_dot, t_span, x0);
    % Interpolate to uniform t_eval points
    e_interp = interp1(t_sol, e_sol, t_eval, 'linear');
    solutions{i} = struct('t', t_eval, 'e', e_interp, 'x0', x0);
end

% ======================================================
% Plot 1: Desired speed profile
% ======================================================
figure('Name', 'Desired Speed Profile', 'Color', 'w');
plot(t_eval, v_d(t_eval), 'k', 'LineWidth', 2);
title('Desired Speed $v\_d(t)$', 'Interpreter', 'latex');
xlabel('Time [s]', 'Interpreter', 'latex');
ylabel('Desired Speed [m/s]', 'Interpreter', 'latex');
grid on; box on;
ylim([38 52]);

% ======================================================
% Plot 2: Error trajectories
% ======================================================
figure('Name', 'Error Trajectories', 'Color', 'w');
hold on;
for i = 1:length(solutions)
    plot(solutions{i}.t, solutions{i}.e, 'LineWidth', 1.5, ...
        'DisplayName', sprintf('$e(0) = %.1f$', solutions{i}.x0));
end
title('Evolution of Speed Error $e(t)$', 'Interpreter', 'latex');
xlabel('Time [s]', 'Interpreter', 'latex');
ylabel('Error $e(t)$ [m/s]', 'Interpreter', 'latex');
grid on; box on; legend('Interpreter', 'latex', 'Location', 'best');
xlim([-1,22])
ylim([-1.2,5.5])
hold off;

