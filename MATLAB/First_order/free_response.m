% ======================================================
% Free Response of a First-Order System
%   x_dot = A * x
%   Solution: x(t) = e^(A t) * x0
%
% For multiple initial conditions x0 and different A values.
% ======================================================

clear; close all; clc;

% === Parameters ===
x0_values = [-2, -1, 0, 1, 2];
t = linspace(0, 10, 200);
A_values = [-1, 0, 1];

% === Main loop over A values ===
for A = A_values
    figure('Color', 'w'); hold on;

    % Compute and plot responses for each initial condition
    for x0 = x0_values
        x = exp(A * t) * x0;
        plot(t, x, 'LineWidth', 1.5, 'DisplayName', sprintf('$x_0 = %.1f$', x0));
    end

    % Titles and labels
    title(sprintf('Free Response for $A = %.1f$: $x(t) = e^{A t} x_0$', A), ...
        'Interpreter', 'latex');
    xlabel('Time $t$', 'Interpreter', 'latex');
    ylabel('$x(t)$', 'Interpreter', 'latex');
    grid on; box on;

    % Legend placement depending on A
    if A > 0
        legend('Interpreter', 'latex', 'Location', 'northwest', ...
            'Box', 'on', 'Color', 'white', 'EdgeColor', [0.6 0.6 0.6]);
    else
        legend('Interpreter', 'latex', 'Location', 'northeast', ...
            'Box', 'on', 'Color', 'white', 'EdgeColor', [0.6 0.6 0.6]);
    end

    % === Add manual y-axis padding ===
    yl = ylim;
    dy = diff(yl);
    ylim([yl(1) - 0.05*dy, yl(2) + 0.05*dy]);

    hold off;
end

