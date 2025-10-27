% ======================================================
% Decomposition of Total Response for a First-Order System
%
%   x_dot = A*x + B*u(t)
%   Total solution: x(t) = e^(A t)*x0 - (B/A)*u_m*(1 - e^(A t))
%
% Plots:
%   (1) Free and forced components
%   (2) Complete solution
% ======================================================

clear; close all; clc;

% ---- Parameters ----
A = -1.0;     % stable system (A < 0)
B = 1.0;
x0 = 1.0;
u_m = 2.0;    % chosen so that -(B/A)*u_m = 2

% ---- Time and analytic responses ----
t = linspace(0, 5, 400);
x_free   = x0 * exp(A*t);
x_forced = -(B/A)*u_m*(1 - exp(A*t));
x_total  = x_free + x_forced;

% ---- Figure setup ----
figure('Color','w','Units','normalized','Position',[0.2 0.15 0.45 0.65]);

tiledlayout(2,1,'Padding','compact','TileSpacing','compact');

% ======================================================
% (1) Free + Forced components
% ======================================================
nexttile; hold on;
plot(t, x_free, '--', 'Color', [0 0.447 0.741], 'LineWidth', 1.5, ...
    'DisplayName', 'free response ($u\equiv0$)');
plot(t, x_forced, '--', 'Color', [0.8500 0.3250 0.0980], 'LineWidth', 1.5, ...
    'DisplayName', 'forced response ($x_0=0$)');

yline(0, 'Color', [0.5 0.5 0.5], 'LineWidth', 0.8, 'HandleVisibility','off');
yline(2, 'Color', [0.5 0.5 0.5], 'LineStyle', ':', 'LineWidth', 0.8, 'HandleVisibility','off');

title('Decomposition of the total response', 'Interpreter', 'latex');
xlabel('');
ylabel('$x(t)$', 'Interpreter', 'latex');
grid on; box on;
legend('Interpreter','latex','FontSize',10,'Location','best','Box','off');

xlim([t(1) t(end)]);
yl = [min([x_free x_forced]) max([x_free x_forced])];
dy = diff(yl);
ylim([yl(1)-0.05*dy, yl(2)+0.05*dy]);  % padding

% ======================================================
% (2) Complete solution
% ======================================================
nexttile; hold on;
plot(t, x_total, 'Color', [0.8500 0.3250 0.0980], 'LineWidth', 1.8, ...
    'DisplayName', 'complete solution');

yline(2, 'Color', [0.5 0.5 0.5], 'LineStyle', ':', 'LineWidth', 0.8, 'HandleVisibility','off');

title('Complete Solution: $x(t) = 2 - e^{A t}$', 'Interpreter', 'latex');
xlabel('Time $t$', 'Interpreter', 'latex');
ylabel('$x(t)$', 'Interpreter', 'latex');
legend('Interpreter','latex','FontSize',10,'Location','best','Box','off');
grid on; box on;

xlim([t(1) t(end)]);
yl = [min(x_total) max(x_total)];
dy = diff(yl);
ylim([yl(1)-0.05*dy, yl(2)+0.05*dy]);  % padding

hold off;
