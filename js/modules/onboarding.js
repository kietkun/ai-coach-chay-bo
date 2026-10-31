/**
 * Module: Onboarding (Page 1)
 * Handles sub-steps A/B/C, health questionnaire, form collection
 */

import { healthQuestions } from '../data/constants.js';
import { switchTab } from '../utils.js';
import { generatePlan } from './dashboard.js';

/**
 * Auto-format time input to xx:xx (mm:ss)
 * - Only digits allowed
 * - Auto-insert ":" after 2 digits
 * - Max 4 digits → "25:00"
 * - Seconds clamped to 00–59
 */
function formatTimeInput(value) {
    // Keep only digits
    let digits = value.replace(/\D/g, '').slice(0, 4);

    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;

    let mm = digits.slice(0, 2);
    let ss = digits.slice(2);

    // Clamp seconds to 0–59
    if (ss.length === 2) {
        const sec = parseInt(ss, 10);
        if (sec > 59) ss = '59';
    }

    return mm + ':' + ss;
}

function formatGoalTimeInput(value) {
    let digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length === 0) return '';

    let hours;
    let minutes;

    if (digits.length <= 2) {
        return digits;
    }
    if (digits.length === 3) {
        hours = digits.slice(0, 1);
        minutes = digits.slice(1);
        hours = hours.padStart(2, '0');
    } else {
        hours = digits.slice(0, 2);
        minutes = digits.slice(2);
    }

    if (minutes.length === 2) {
        const minuteValue = parseInt(minutes, 10);
        if (minuteValue > 59) minutes = '59';
    }

    return hours + ':' + minutes;
}

/**
 * Attach live mask to #input-recent-time
 */
export function initTimeMask() {
    const input = document.getElementById('input-recent-time');
    const goalInput = document.getElementById('input-goal-time');
    if (input) {
        input.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            const oldLen = e.target.value.length;
            const formatted = formatTimeInput(e.target.value);
            e.target.value = formatted;

            const newLen = formatted.length;
            const diff = newLen - oldLen;
            const newPos = Math.max(0, cursorPos + diff);
            e.target.setSelectionRange(newPos, newPos);
        });

        input.addEventListener('blur', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length === 0) {
                e.target.value = '25:00';
                return;
            }
            if (v.length === 1) v = '0' + v + '00';
            else if (v.length === 2) v = v + '00';
            else if (v.length === 3) v = v.slice(0, 2) + '0' + v.slice(2);
            e.target.value = formatTimeInput(v);
        });

        input.addEventListener('keydown', (e) => {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey || e.metaKey) return;
            if (!/^\d$/.test(e.key) && e.key !== ':') e.preventDefault();
        });
    }

    if (goalInput) {
        goalInput.addEventListener('input', (e) => {
            const cursorPos = e.target.selectionStart;
            const oldLen = e.target.value.length;
            const formatted = formatGoalTimeInput(e.target.value);
            e.target.value = formatted;

            const newLen = formatted.length;
            const diff = newLen - oldLen;
            e.target.setSelectionRange(Math.max(0, cursorPos + diff), Math.max(0, cursorPos + diff));
        });

        goalInput.addEventListener('blur', (e) => {
            let digits = e.target.value.replace(/\D/g, '');
            if (digits.length === 0) return;
            if (digits.length === 1) digits = '0' + digits + '00';
            else if (digits.length === 2) digits = digits + '00';
            else if (digits.length === 3) digits = '0' + digits;
            e.target.value = formatGoalTimeInput(digits);
        });

        goalInput.addEventListener('keydown', (e) => {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey || e.metaKey) return;
            if (!/^\d$/.test(e.key) && e.key !== ':') e.preventDefault();
        });
    }
}

/**
 * Render the 13 PAR-Q health questions into the container
 */
export function initHealthQuestions() {
    const container = document.getElementById('health-questions-container');
    container.innerHTML = healthQuestions.map((q, idx) => `
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col space-y-2">
            <span class="font-medium text-slate-700">${q}</span>
            <div class="flex space-x-4">
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="hq_${idx}" value="yes" class="text-indigo-600">
                    <span class="font-semibold text-red-600">Có</span>
                </label>
                <label class="flex items-center space-x-1 cursor-pointer">
                    <input type="radio" name="hq_${idx}" value="no" checked class="text-indigo-600">
                    <span class="text-slate-600">Không</span>
                </label>
            </div>
        </div>
    `).join('');
}

/**
 * Navigate between onboarding sub-steps (a / b / c)
 */
export function goToSubOnboard(sub) {
    document.getElementById('sub-onboard-a').classList.add('hidden');
    document.getElementById('sub-onboard-b').classList.add('hidden');
    document.getElementById('sub-onboard-c').classList.add('hidden');

    document.getElementById(`sub-onboard-${sub}`).classList.remove('hidden');
    document.getElementById('onboarding-step-indicator').innerText =
        `Bước ${sub === 'a' ? '1/3' : sub === 'b' ? '2/3' : '3/3'}`;
}

/**
 * Show / hide age field when training school changes
 */
export function toggleAgeField() {
    const school = document.getElementById('input-school').value;
    const ageGroup = document.getElementById('age-group');
    if (school === 'hr') {
        ageGroup.classList.remove('hidden');
    } else {
        ageGroup.classList.add('hidden');
    }
}

/**
 * Show / hide recent time field when user selects "Chưa từng thi đấu"
 */
export function saveOnboardingDraft() {
    const healthAnswers = {};
    for (let i = 0; i < 13; i++) {
        const checked = document.querySelector(`input[name="hq_${i}"]:checked`);
        healthAnswers[`hq_${i}`] = checked ? checked.value : 'no';
    }

    const draft = {
        name: document.getElementById('input-name')?.value || '',
        recentDist: document.getElementById('input-recent-dist')?.value || '5000',
        recentTime: document.getElementById('input-recent-time')?.value || '25:00',
        goalDist: document.getElementById('input-goal-dist')?.value || '42',
        goalTime: document.getElementById('input-goal-time')?.value || '',
        sessions: document.getElementById('input-sessions')?.value || '4',
        exp: document.getElementById('input-exp')?.value || 'exp',
        raceDate: document.getElementById('input-race-date')?.value || '',
        school: document.getElementById('input-school')?.value || 'pace',
        age: document.getElementById('input-age')?.value || '30',
        freeDays: Array.from(document.querySelectorAll('input[name="days"]:checked')).map(cb => cb.value),
        healthAnswers
    };

    localStorage.setItem('aiCoachDraft', JSON.stringify(draft));
}

export function restoreOnboardingDraft() {
    const rawDraft = localStorage.getItem('aiCoachDraft');
    if (!rawDraft) return false;

    try {
        const draft = JSON.parse(rawDraft);
        const fields = {
            'input-name': draft.name,
            'input-recent-dist': draft.recentDist,
            'input-recent-time': draft.recentTime,
            'input-goal-dist': draft.goalDist,
            'input-goal-time': draft.goalTime,
            'input-sessions': draft.sessions,
            'input-exp': draft.exp,
            'input-race-date': draft.raceDate,
            'input-school': draft.school,
            'input-age': draft.age
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value !== undefined && value !== null) element.value = value;
        });

        document.querySelectorAll('input[name="days"]').forEach((checkbox) => {
            checkbox.checked = Array.isArray(draft.freeDays) && draft.freeDays.includes(checkbox.value);
        });

        Object.entries(draft.healthAnswers || {}).forEach(([name, value]) => {
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) radio.checked = true;
        });

        toggleRecentTimeField();
        toggleAgeField();
        return true;
    } catch {
        localStorage.removeItem('aiCoachDraft');
        return false;
    }
}

export function initOnboardingDraftPersistence() {
    document.addEventListener('input', saveOnboardingDraft);
    document.addEventListener('change', saveOnboardingDraft);
}

export function initSessionDayLimit() {
    const sessionsSelect = document.getElementById('input-sessions');
    const dayCheckboxes = Array.from(document.querySelectorAll('input[name="days"]'));
    if (!sessionsSelect || dayCheckboxes.length === 0) return;

    const updateDayLimit = () => {
        const maxDays = parseInt(sessionsSelect.value, 10);
        const checked = dayCheckboxes.filter((checkbox) => checkbox.checked);

        while (checked.length > maxDays) {
            checked.pop().checked = false;
        }

        const selectedCount = dayCheckboxes.filter((checkbox) => checkbox.checked).length;
        dayCheckboxes.forEach((checkbox) => {
            checkbox.disabled = !checkbox.checked && selectedCount >= maxDays;
        });
    };

    sessionsSelect.addEventListener('change', updateDayLimit);
    dayCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', updateDayLimit);
    });

    updateDayLimit();
}

export function toggleRecentTimeField() {
    const dist = document.getElementById('input-recent-dist').value;
    const timeGroup = document.getElementById('recent-time-group');
    const hint = document.getElementById('no-race-hint');
    const timeInput = document.getElementById('input-recent-time');

    if (dist === 'none') {
        timeGroup.classList.add('hidden');
        hint.classList.remove('hidden');
        timeInput.removeAttribute('required');
        // Auto-set experience to "Người mới" for consistency
        const expSelect = document.getElementById('input-exp');
        if (expSelect) expSelect.value = 'new';
    } else {
        timeGroup.classList.remove('hidden');
        hint.classList.add('hidden');
        timeInput.setAttribute('required', '');
    }
}

/**
 * Collect all form values + health flags and hand off to plan generator
 */
export function collectOnboardingData() {
    // Health screening flags
    let redFlag = false;
    let yellowFlag = false;

    for (let i = 0; i < 13; i++) {
        const radios = document.getElementsByName(`hq_${i}`);
        let val = 'no';
        for (const r of radios) {
            if (r.checked) val = r.value;
        }
        if (val === 'yes') {
            if (i < 5) redFlag = true;   // first 5 questions = red flag
            else yellowFlag = true;       // remaining = yellow flag
        }
    }

    if (redFlag) {
        switchTab('step-health-blocked');
        return null;
    }

    const dayCheckboxes = document.querySelectorAll('input[name="days"]:checked');
    let freeDays = Array.from(dayCheckboxes).map(cb => cb.value);
    if (freeDays.length === 0) freeDays = ['T3', 'T5', 'T7', 'CN'];

    const distRaw = document.getElementById('input-recent-dist').value;
    const noRaceHistory = distRaw === 'none';

    return {
        name: document.getElementById('input-name').value.trim(),
        // When no race history: use placeholder 5K / 40:00 → safe beginner VDOT ≈ 28
        recentDist: noRaceHistory ? 5000 : parseFloat(distRaw),
        recentTimeStr: noRaceHistory ? '40:00' : document.getElementById('input-recent-time').value,
        noRaceHistory,
        goalDistKm: parseInt(document.getElementById('input-goal-dist').value, 10),
        goalTime: document.getElementById('input-goal-time').value.trim(),
        sessionsPerWeek: parseInt(document.getElementById('input-sessions').value, 10),
        exp: noRaceHistory ? 'new' : document.getElementById('input-exp').value,
        raceDateStr: document.getElementById('input-race-date').value,
        school: document.getElementById('input-school').value,
        age: parseInt(document.getElementById('input-age').value, 10) || 30,
        freeDays,
        yellowFlag
    };
}

/**
 * Entry point when user clicks "Tạo Giáo Án AI"
 */
export function onGeneratePlanClick() {
    const data = collectOnboardingData();
    if (data) {
        generatePlan(data);
    }
}

// Expose for inline onclick handlers (kept for simplicity)
window.goToSubOnboard = goToSubOnboard;
window.toggleAgeField = toggleAgeField;
window.toggleRecentTimeField = toggleRecentTimeField;
window.onGeneratePlanClick = onGeneratePlanClick;
