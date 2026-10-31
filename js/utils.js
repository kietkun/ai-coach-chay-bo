/**
 * Shared utility functions
 * AI Coach Chạy Bộ
 */

/**
 * Calculate VDOT from distance (meters) and time (minutes)
 * Based on Daniels' Running Formula approximation
 */
export function calculateVDOT(distMeters, timeMinutes) {
    const v = distMeters / timeMinutes;
    const t = timeMinutes;
    const exp1 = Math.exp(-0.012778 * t);
    const exp2 = Math.exp(-0.1932605 * t);
    const numerator = -4.60 + 0.182258 * v + 0.000104 * (v * v);
    const denominator = 0.8 + 0.1894393 * exp1 + 0.2989558 * exp2;
    return Math.round((numerator / denominator) * 10) / 10;
}

/**
 * Parse "mm:ss" time string to total minutes (float)
 */
export function parseTimeToMinutes(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 25;
    return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
}

/**
 * Switch active tab/page
 * @param {string} tabId - element id of the section to show
 */
export function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    const headerActions = document.getElementById('header-actions');
    if (tabId !== 'step-onboarding') {
        headerActions.classList.remove('hidden');
    } else {
        headerActions.classList.add('hidden');
    }
}

/**
 * Reset app back to onboarding step 1
 */
export function resetApp() {
    localStorage.removeItem('aiCoachDraft');
    localStorage.removeItem('aiCoachSavedPlan');
    switchTab('step-onboarding');
    // Re-export goToSubOnboard from onboarding module will be called externally
    if (window.goToSubOnboard) {
        window.goToSubOnboard('a');
    }
}
