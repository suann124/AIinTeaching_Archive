% --- Parameters ---
m = 1000;        % kg
c = 850;         % N·s/m
g = 9.81;        % m/s^2
v_d = 50;        % m/s

% --- Piecewise slope (degrees) ---
theta_deg = @(t) ...
    (t < 0.3) * 0 + ...
    (t >= 0.3 & t < 0.8) * 5 + ...
    (t >= 0.8 & t < 1.4) * 2 + ...
    (t >= 1.4 & t < 1.8) * (-3) + ...
    (t >= 1.8) * (-3);

theta_rad = @(t) deg2rad(theta_deg(t));

% --- Error dynamics: e' = (k - c/m)e - g*theta ---
k = c/m - 10*g;    % feedback gain (example)
edot = @(t,e) (k - (c/m)) * e - g * theta_rad(t);

% --- Integrate ODE ---
tspan = [0 2];
e0 = 0;
[t, e] = ode45(edot, tspan, e0);

% --- Compute outputs ---
v = v_d + e;
theta_vals_deg = arrayfun(theta_deg, t);

% --- Plot results ---
figure('Position',[200 200 700 450]);

subplot(2,1,1)
plot(t, theta_vals_deg, 'LineWidth', 2)
ylabel('\theta [deg]')
title('the slope of the road')
grid on
xlim([0 2])

subplot(2,1,2)
plot(t, v, 'LineWidth', 2)
xlabel('t [s]')
ylabel('v [m/s]')
title('velocity')
grid on
xlim([0 2])
