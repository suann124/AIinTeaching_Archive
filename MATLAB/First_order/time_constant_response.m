% ======================================================
% Free Response and Time Constant Visualization
% ======================================================

clear; close all; clc;

x0 = 1.0;
t = linspace(0, 10, 400);
A_values = [-0.5, -1, -2];
colors = {'b', [0.8500 0.3250 0.0980], [0.4660 0.6740 0.1880]};

figure('Color', 'w'); hold on;

for i = 1:length(A_values)
    A = A_values(i);
    color = colors{i};
    T = -1 / A;
    x = exp(A * t) * x0;

    % --- main curve (legend entry) ---
    plot(t, x, 'Color', color, 'LineWidth', 1.5, ...
         'DisplayName', sprintf('$A = %.1f$, $T = %.2f$', A, T));

    % --- auxiliary markers (no legend entry) ---
    for k = [1, 5]
        tT = k * T;
        xT = exp(A * tT) * x0;
        plot([tT tT], ylim, '--', 'Color', color, 'LineWidth', 0.9, ...
             'HandleVisibility', 'off');
        plot(tT, xT, 'o', 'Color', color, 'MarkerFaceColor', color, ...
             'HandleVisibility', 'off');
        text(tT + 0.1, xT, sprintf('%dT', k), 'Color', color, ...
             'VerticalAlignment', 'middle', 'FontSize', 9);
    end
end

% --- horizontal reference lines (no legend entry) ---
for k = 1:3
    yref = exp(-k);
    yline(yref, ':', 'Color', 'r', 'LineWidth', 0.8, 'HandleVisibility', 'off');
    text(8.15, yref, sprintf('$e^{-%d}$', k), 'Color', 'r', ...
         'Interpreter', 'latex', 'VerticalAlignment', 'middle', 'FontSize', 9);
end

title('Free Response and Time Constant: $x(t) = e^{A t} x_0$', 'Interpreter', 'latex');
xlabel('Time $t$', 'Interpreter', 'latex');
ylabel('$x(t)$', 'Interpreter', 'latex');
grid on; box on;

legend('Interpreter', 'latex', 'Location', 'northeast'); % clean legend

% === Add manual y-axis padding ===
yl = ylim; dy = diff(yl);
ylim([yl(1) - 0.05*dy, yl(2) + 0.05*dy]);

hold off;
