% ======================================================
% Frequency response comparison: numeric vs analytic
% ======================================================

% Define transfer function
s = tf('s');
sys_tf = 2 / (s + 1);

% Frequency grid
w = logspace(-2, 2, 800);   % rad/s
[H, wout] = freqresp(sys_tf, w);   % complex frequency response

% Extract magnitude and phase
mag = abs(squeeze(H));
phase = angle(squeeze(H));

% Target frequency
omega = 3;

% Analytical reference values
mag_ref = 2.0 / sqrt(1.0 + omega^2);
phase_ref = -atan(omega);

% Numeric interpolation (for plotting)
mag_at_3 = interp1(w, mag, omega);
phase_at_3 = interp1(w, unwrap(phase), omega);

fprintf('|G(j3)|  numeric = %.6f,  analytic = %.6f\n', mag_at_3, mag_ref);
fprintf('∠G(j3)  numeric = %.4f°,  analytic = %.4f°\n', rad2deg(phase_at_3), rad2deg(phase_ref));

% --- Plot magnitude ---
figure;
loglog(w, mag, 'b', 'LineWidth', 1.5); hold on;
scatter(omega, mag_ref, 50, 'r', 'filled');
xline(omega, '--r', 'LineWidth', 1.0);
yline(mag_ref, '--r', 'LineWidth', 1.0);
text(omega*1.05, mag_ref*1.1, sprintf('|G(j3)| ≈ %.3f', mag_ref), 'Color', 'r');

xlabel('Frequency \omega [rad/s]');
ylabel('|G(j\omega)|');
title('Bode Magnitude');
legend('|G(j\omega)|', 'Location', 'best');
grid on; grid minor;

% Add space around limits
xlim([min(w)*0.8, max(w)*1.2]);
ylim([min(mag)*0.8, max(mag)*1.2]);

% --- Plot phase ---
figure;
semilogx(w, rad2deg(phase), 'b', 'LineWidth', 1.5); hold on;
scatter(omega, rad2deg(phase_ref), 50, 'r', 'filled');
xline(omega, '--r', 'LineWidth', 1.0);
yline(rad2deg(phase_ref), '--r', 'LineWidth', 1.0);
text(omega*1.05, rad2deg(phase_ref)+5, sprintf('%.1f°', rad2deg(phase_ref)), 'Color', 'r');

xlabel('Frequency \omega [rad/s]');
ylabel('Phase [deg]');
title('Bode Phase');
legend('\angle G(j\omega)', 'Location', 'best');
grid on; grid minor;

% Add space around limits
xlim([min(w)*0.8, max(w)*1.2]);
ylim padded;
