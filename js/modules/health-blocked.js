/**
 * Module: Health Blocked (Page 2)
 * Shown when red-flag answers are detected in PAR-Q screening.
 * Minimal logic – mainly a presentational page.
 */

import { resetApp } from '../utils.js';

/**
 * Called when user clicks "Quay lại thiết lập"
 */
export function onBackFromBlocked() {
    resetApp();
}

// Expose for inline onclick
window.onBackFromBlocked = onBackFromBlocked;
