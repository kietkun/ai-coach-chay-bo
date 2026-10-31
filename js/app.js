/**
 * Main entry point
 * AI Coach Chạy Bộ - MVP
 */

import {
    initHealthQuestions,
    initTimeMask,
    initSessionDayLimit,
    restoreOnboardingDraft,
    initOnboardingDraftPersistence,
    goToSubOnboard
} from './modules/onboarding.js';
import './modules/health-blocked.js';   // side-effect: exposes window handlers
import { generatePlan } from './modules/dashboard.js';
import { resetApp } from './utils.js';

// Make resetApp available for header button & blocked screen
window.resetApp = resetApp;
window.goToSubOnboard = goToSubOnboard;

window.addEventListener('DOMContentLoaded', () => {
    // Render PAR-Q questions
    initHealthQuestions();

    // Auto-format time field to xx:xx
    initTimeMask();

    const draftRestored = restoreOnboardingDraft();

    // Limit selected training days to the chosen sessions per week
    initSessionDayLimit();

    // Default race date = today + 3 months when there is no saved draft
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + 3);

    const raceDateInput = document.getElementById('input-race-date');
    raceDateInput.min = today.toISOString().split('T')[0];
    if (!draftRestored && !raceDateInput.value) {
        raceDateInput.value = futureDate.toISOString().split('T')[0];
    }

    initOnboardingDraftPersistence();

    const savedPlanRaw = localStorage.getItem('aiCoachSavedPlan');
    if (savedPlanRaw) {
        try {
            const savedPlan = JSON.parse(savedPlanRaw);
            if (savedPlan?.data) generatePlan(savedPlan.data);
            else localStorage.removeItem('aiCoachSavedPlan');
        } catch {
            localStorage.removeItem('aiCoachSavedPlan');
            goToSubOnboard('a');
        }
    } else {
        goToSubOnboard('a');
    }
});
