% ======================================================
% Euler's Formula Visualization: Single ω Rotation
% ======================================================

clear; close all; clc;

% --- Parameters ---
omega = 1.0;
t_max = 2*pi;
n_frames = 200;
t_vals = linspace(0, t_max, n_frames);

% --- Figure setup ---
figure('Position', [100, 100, 1000, 500], 'Color', 'w');

% Subplot 1: Unit circle
subplot(1,2,1);
theta = linspace(0, 2*pi, 400);
plot(cos(theta), sin(theta), 'Color', [0.5 0.5 0.5], 'LineWidth', 1.5); hold on;
plot([-1.2 1.2], [0 0], 'k', 'LineWidth', 1);
plot([0 0], [-1.2 1.2], 'k', 'LineWidth', 1);
axis equal; grid on;
xlim([-1.2 1.2]); ylim([-1.2 1.2]);
text(0.75, -0.9, {'Unit Circle', '$|e^{j\omega t}|=1$'}, ...
     'Interpreter', 'latex', 'Color', [0.5 0.5 0.5], 'FontSize', 10);

% Plot handles (for dynamic update)
arrow = plot([0 1], [0 0], 'Color', [0 0.6 0], 'LineWidth', 2);
dotH = plot(1, 0, 'bo', 'MarkerFaceColor', 'b');
proj_x = plot([0 1], [0 0], 'b--', 'LineWidth', 1.2);
proj_y = plot([1 1], [0 0], 'r--', 'LineWidth', 1.2);
label_text = text(0, 1.25, '', 'Interpreter', 'latex', ...
                  'FontSize', 12, 'Color', 'blue', 'HorizontalAlignment', 'center');
xlabel('Real axis'); ylabel('Imag axis');

% Subplot 2: Sin and Cos
subplot(1,2,2);
hold on; grid on;
sin_line = animatedline('Color', 'r', 'LineWidth', 1.5);
cos_line = animatedline('Color', 'b', 'LineWidth', 1.5);
yline(0, 'k', 'LineWidth', 1);
xlim([0, t_max / omega]); ylim([-1.2, 1.2]);
xlabel('$t / \omega$', 'Interpreter', 'latex');
ylabel('Amplitude');
title(sprintf('$\\omega = %.1f$ rad/s', omega), 'Interpreter', 'latex');
legend({'$\sin(\omega t)$', '$\cos(\omega t)$'}, 'Interpreter', 'latex', ...
       'Location', 'northeast', 'FontSize', 10);

% --- Simulation loop ---
for i = 1:n_frames
    t = t_vals(i);
    x = cos(omega * t);
    y = sin(omega * t);

    % Update phasor & projections
    set(arrow, 'XData', [0 x], 'YData', [0 y]);
    set(dotH, 'XData', x, 'YData', y);
    set(proj_x, 'XData', [0 x], 'YData', [y y]);
    set(proj_y, 'XData', [x x], 'YData', [0 y]);
    set(label_text, 'String', sprintf('$e^{j%.1f t}$', omega));

    % Update sine/cosine lines
    addpoints(sin_line, t/omega, sin(omega*t));
    addpoints(cos_line, t/omega, cos(omega*t));

    drawnow;
end
