% ======================================================
% Demonstrate the impact of time constant (T = 1/(-A))
% and steady-state gain (-B/A) on the first-order error model:
%
%     e_dot = A * e + B * v_d(t)
%
% Desired speed:
%     v_d(t) = 40 for t < 5
%            = 50 for t >= 5
% ======================================================

clear; close all; clc;

% ======================================================
% Simulation parameters
% ======================================================
t_span = [0, 40];
t_eval = linspace(t_span(1), t_span(2), 1200);
x0_vec = 0.0;           % single IC to isolate parameter effects

A_list = [-0.25, -0.5, -1.0, -2.0];   % affects time constant T = 1/(-A)
B_list = [0.05, 0.1, 0.2, 0.4];       % affects steady-state gain -B/A

A_fixed = -1.0;
B_fixed = 0.1;

% ======================================================
% Desired speed profile
% ======================================================
v_d = @(t) (t < 5)*40 + (t >= 5)*50;

% ======================================================
% Helper: ODE for given A, B
% ======================================================
make_e_dot = @(A, B) @(t, e) A*e + B*v_d(t);

% ======================================================
% (1) Plot v_d(t)
% ======================================================
figure('Color','w','Units','normalized','Position',[0.25 0.4 0.45 0.35]);
plot(t_eval, v_d(t_eval), 'k', 'LineWidth', 2);
xline(5.0, '--', 'Color', 'k', 'LineWidth', 1);
text(5.0, 41, 'step @ 5 s', 'HorizontalAlignment','left', ...
    'VerticalAlignment','bottom', 'FontSize', 10);
title('Desired Speed $v_d(t)$', 'Interpreter','latex');
xlabel('Time [s]', 'Interpreter','latex');
ylabel('Desired Speed [m/s]', 'Interpreter','latex');
grid on; box on;
ax = gca; ax.GridAlpha = 0.35;
yl = ylim; dy = diff(yl);
ylim([yl(1)-0.05*dy, yl(2)+0.05*dy]);  % padding

% ======================================================
% (2) Vary A (time constant effect), B fixed
% ======================================================
figure('Color','w','Units','normalized','Position',[0.15 0.3 0.65 0.45]);
cmap = lines(numel(A_list));

for i = 1:length(A_list)
    A = A_list(i);
    if A >= 0
        error('Use A < 0 for stability.');
    end
    T = 1 / (-A);
    color = cmap(i,:);
    e_dot = make_e_dot(A, B_fixed);
    [t_sol, e_sol] = ode45(e_dot, t_span, x0_vec);
    e_interp = interp1(t_sol, e_sol, t_eval, 'linear');
    label = sprintf('$A=%.2f\\ (T=1/(-A)=%.2f\\,\\mathrm{s})$', A, T);
    plot(t_eval, e_interp, 'Color', color, 'LineWidth', 1.8, ...
        'DisplayName', label); hold on;
end

title('Error $e(t)$ for different $A$ (time constant effect), $B$ fixed', ...
    'Interpreter','latex');
xlabel('Time [s]', 'Interpreter','latex');
ylabel('$e(t)$ [m/s]', 'Interpreter','latex');
grid on; box on;
ax = gca; ax.GridAlpha = 0.35;
legend('Interpreter','latex','FontSize',9,'Location','eastoutside');
yl = ylim; dy = diff(yl);
ylim([yl(1)-0.05*dy, yl(2)+0.05*dy]);  % padding

% ======================================================
% (3) Vary B (steady-state gain effect), A fixed
% ======================================================
figure('Color','w','Units','normalized','Position',[0.15 0.3 0.65 0.45]);
cmap = lines(numel(B_list));

for i = 1:length(B_list)
    B = B_list(i);
    color = cmap(i,:);
    e_dot = make_e_dot(A_fixed, B);
    [t_sol, e_sol] = ode45(e_dot, t_span, x0_vec);
    e_interp = interp1(t_sol, e_sol, t_eval, 'linear');
    label = sprintf('$B=%.2f,\\ -B/A=%.2f$', B, -B/A_fixed);
    plot(t_eval, e_interp, 'Color', color, 'LineWidth', 1.8, ...
        'DisplayName', label); hold on;

    % steady-state level (v_d → 50)
    e_ss = -(B / A_fixed) * 50.0;
    yline(e_ss, ':', 'Color', color, 'LineWidth', 1, ...
        'HandleVisibility','off');
end

title('Error $e(t)$ for different $B$ (steady-state gain effect), $A$ fixed', ...
    'Interpreter','latex');
xlabel('Time [s]', 'Interpreter','latex');
ylabel('$e(t)$ [m/s]', 'Interpreter','latex');
grid on; box on;
ax = gca; ax.GridAlpha = 0.35;
legend('Interpreter','latex','FontSize',9,'Location','eastoutside');
yl = ylim; dy = diff(yl);
ylim([yl(1)-0.05*dy, yl(2)+0.05*dy]);  % padding

hold off;
