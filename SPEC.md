# Spec: Water Intake Tracker

Expose a visual, interactive **Water Intake Tracker** card on the main dashboard, letting users log their daily hydration and track it against a custom target calculated from their body weight.

## Proposed Changes:
1. **Target Calculation**:
   - Hydration target formula: `Weight (kg) * 35` ml (e.g., a 70kg user needs 2450ml or ~2.5L daily).
2. **Dashboard UI Integration (`src/components/Dashboard.js`)**:
   - Add a premium **Hydration Tracker** card next to the existing task lists.
   - Include a progress indicator showing current vs target intake.
   - Add quick tap buttons: `+ 250ml (Cup)` and `+ 750ml (Bottle)`.
   - Add a `Reset` button to start fresh.
   - Persist daily water logs in LocalStorage using user-specific keys (`water_log_${userId}_${dateKey}`) to ensure session persistence in both live and offline modes.

## Verification Plan:
- Execute `npm.cmd run build` to confirm compilation success.
- Push changes to git to trigger CodeRabbit review and Vercel live deployment.
