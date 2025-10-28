% ======================================================
% Step Response of a First-Order System for Multiple B Values
%   System: x_dot = A*x + B*u(t)
%   Step input: u(t) = u_m for t >= 0
%
% Consistent notation:
%   x(t) = -(B/A) * u_m * (1 - e^{A t})
%
% Shows input step (t<0) and outputs for several B values.
% ======================================================

clear; close all; clc;

% === User parameters ===
A = -1.0;
B_values = [0.5, 1.0, 2.0];
u_m = 1.0;
t_pre = 2.0;
t_end = 6.0;
n_pts = 1200;

if A >= 0
    error('Use A < 0 for a stable first-order system.');
end
if isempty(B_values)
    error('Provide at least one value in B_values.');
end

% === Time setup ===
t_full = linspace(-t_pre, t_end, n_pts);
t = linspace(0, t_end, n_pts);
u = zeros(size(t_full));
u(t_full >= 0) = u_m;
T = 1 / abs(A); % time constant

% ======================================================
% Figure setup — wider layout
% ======================================================
figure('Color','w','Units','normalized','Position',[0.05 0.1 0.85 0.45]);
tiledlayout(1,2,'Padding','compact','TileSpacing','loose');

% ======================================================
% LEFT: Step input u(t)
% ======================================================
nexttile; hold on;
plot(t_full, u, 'LineWidth', 2, 'Color', [0 0.447 0.741], ...
    'DisplayName', sprintf('Step input $u_m=%.1f$', u_m));
yline(0,'k-','LineWidth',0.8,'HandleVisibility','off');
xline(0,'k-','LineWidth',0.8,'HandleVisibility','off');
xline(T,'--','LineWidth',1,'Color','k','HandleVisibility','off');
text(T, u_m*0.1, '$t=T$', 'Interpreter','latex', ...
    'HorizontalAlignment','center', 'VerticalAlignment','bottom');

xlim([-t_pre t_end]);
ylim([-0.2*u_m 1.2*u_m]);
title('Input step $u(t)$ (showing $t<0$ region)', 'Interpreter','latex');
xlabel('Time $t$', 'Interpreter','latex');
ylabel('$u(t)$', 'Interpreter','latex');
grid on; box on;
legend('Interpreter','latex','FontSize',9,'Location','best');

% --- Add y-axis padding ---
yl = ylim; dy = diff(yl);
ylim([yl(1) - 0.05*dy, yl(2) + 0.05*dy]);

% ======================================================
% RIGHT: Outputs x(t) for multiple B values
% ======================================================
nexttile; hold on;
cmap = lines(numel(B_values));

for i = 1:length(B_values)
    B = B_values(i);
    color = cmap(i,:);
    x_ss = -(B/A)*u_m;
    x = x_ss * (1 - exp(A*t));
    plot(t, x, 'Color', color, 'LineWidth', 2, ...
        'DisplayName', sprintf('$B=%.1f,\\ x_{ss}=%.1f$', B, x_ss));
    yline(x_ss, ':', 'LineWidth',1, 'Color', color, ...
        'HandleVisibility','off');
end

% 63.2% marker for first curve (no legend entry)
B0 = B_values(1);
xss0 = -(B0/A)*u_m;
plot(T, xss0*(1 - exp(-1)), 'o', 'MarkerSize',5, ...
    'MarkerFaceColor', cmap(1,:), 'Color', cmap(1,:), ...
    'HandleVisibility','off');
text(T*1.05, xss0*(1 - exp(-1)), '$63.2\%$ of $x_{ss}$ at $t=T$', ...
    'Interpreter','latex', 'HorizontalAlignment','left', ...
    'VerticalAlignment','middle', 'FontSize',9, 'Color', cmap(1,:));

yline(0,'k-','LineWidth',0.8,'HandleVisibility','off');
xline(T,'--','LineWidth',1,'Color','k','HandleVisibility','off');

title('Outputs $x(t)$ for different $B$ values', 'Interpreter','latex');
xlabel('Time $t$', 'Interpreter','latex');
ylabel('$x(t)$', 'Interpreter','latex');
grid on; box on;
legend('Interpreter','latex','FontSize',9,'Location','best');

% --- Add y-axis padding ---
yl = ylim; dy = diff(yl);
ylim([yl(1) - 0.05*dy, yl(2) + 0.05*dy]);

hold off;
