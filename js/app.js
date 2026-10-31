/**
 * Main entry point
 * AI Coach Chạy Bộ - MVP
 */

import { initHealthQuestions, initTimeMask, initSessionDayLimit, goToSubOnboard } from './modules/onboarding.js';
import './modules/health-blocked.js';   // side-effect: exposes window handlers
import './modules/dashboard.js';        // side-effect: exposes window handlers
import { resetApp } from './utils.js';

// Make resetApp available for header button & blocked screen
window.resetApp = resetApp;
window.goToSubOnboard = goToSubOnboard;

window.addEventListener('DOMContentLoaded', () => {
    // Render PAR-Q questions
    initHealthQuestions();

    // Auto-format time field to xx:xx
    initTimeMask();

    // Limit selected training days to the chosen sessions per week
    initSessionDayLimit();

    // Default race date = today + 3 months
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + 3);

    const raceDateInput = document.getElementById('input-race-date');
    raceDateInput.min = today.toISOString().split('T')[0];
    raceDateInput.value = futureDate.toISOString().split('T')[0];

    // Ensure we start on onboarding step A
    goToSubOnboard('a');
});
