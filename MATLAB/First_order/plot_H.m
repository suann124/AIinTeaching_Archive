% ======================================================
% Plot a complex number H on the complex plane (Python-style)
% ======================================================
function plot_H(H, show_degrees, save_path)
    if nargin < 2, show_degrees = false; end
    if nargin < 3, save_path = ''; end

    % Extract components
    a = real(H);
    b = imag(H);
    r = abs(H);
    theta = angle(H);

    % --- Figure setup ---
    figure('Position', [100, 100, 600, 600], 'Color', 'w');
    hold on; grid on;
    ax = gca;
    ax.Box = 'on';
    ax.XColor = 'k';
    ax.YColor = 'k';
    ax.LineWidth = 1.2;
    axis equal;

    % --- Plot main vector ---
    plot([0, a], [0, b], 'Color', [0, 0, 0.5], 'LineWidth', 2.5);
    scatter(a, b, 50, 'filled', 'MarkerFaceColor', [0, 0, 0.5]);

    % --- Projections ---
    plot([a, a], [0, b], 'k--', 'LineWidth', 1);
    plot([0, a], [b, b], 'k--', 'LineWidth', 1);

    % --- Labels ---
    text(a/2, -0.3, '$a$', 'Interpreter', 'latex', 'FontSize', 12, ...
         'HorizontalAlignment', 'center', 'VerticalAlignment', 'top');
    text(0.15, b/2, '$b$', 'Interpreter', 'latex', 'FontSize', 12, ...
         'HorizontalAlignment', 'left', 'VerticalAlignment', 'middle');
    text(a*0.6, b*0.55, '$r$', 'Interpreter', 'latex', 'FontSize', 12, ...
         'Color', [0, 0, 0.5]);
    text(a*1.05, b*1.05, '$H$', 'Interpreter', 'latex', 'FontSize', 14, ...
         'Color', [0, 0, 0.5]);

    % --- Angle arc ---
    arc_radius = 0.3 * max([1, abs(a), abs(b)]);
    theta_deg = rad2deg(theta);
    theta_arc = linspace(0, theta, 100);
    plot(arc_radius*cos(theta_arc), arc_radius*sin(theta_arc), ...
         'Color', [0.5 0.5 0.5], 'LineWidth', 1.5);

    label_angle = theta / 2; if label_angle == 0, label_angle = 1e-4; end
    if show_degrees
        angle_label = sprintf('$\\theta = %.1f^\\circ$', theta_deg);
    else
        angle_label = sprintf('$\\theta = %.2f\\,\\text{rad}$', theta);
    end
    text(arc_radius*1.2*cos(label_angle), arc_radius*1.2*sin(label_angle), ...
         angle_label, 'Interpreter', 'latex', 'FontSize', 12);

    % --- Axes limits ---
    lim = max([abs(a), abs(b), r]) * 1.3;
    xlim([-lim, lim]);
    ylim([-lim, lim]);

    % --- Full-length axes lines (draw *after* limits are set) ---
    plot([-lim lim], [0 0], 'k', 'LineWidth', 1.5); % x-axis
    plot([0 0], [-lim lim], 'k', 'LineWidth', 1.5); % y-axis

    % --- Axis labels (fixed placement like Python) ---
    text(0, -lim*1.1, 'Real axis', 'FontSize', 12, ...
         'HorizontalAlignment', 'center', 'VerticalAlignment', 'top');
    text(-lim*1.1, 0, 'Imag axis', 'FontSize', 12, ...
         'Rotation', 90, 'HorizontalAlignment', 'center', 'VerticalAlignment', 'bottom');

    % --- Title ---
    if show_degrees
        title(sprintf('$H = a + bj,\\; |H| = %.2f,\\; \\theta = %.2f^\\circ$', ...
              r, theta_deg), 'Interpreter', 'latex');
    else
        title(sprintf('$H = a + bj,\\; |H| = %.2f,\\; \\theta = %.2f\\,\\text{rad}$', ...
              r, theta), 'Interpreter', 'latex');
    end

    % --- Save or show ---
    if ~isempty(save_path)
        saveas(gcf, save_path);
        fprintf('Saved plot as %s\n', save_path);
    end
end

% Example usage:
plot_H(3 + 4j, true);

