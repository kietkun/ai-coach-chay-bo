/**
 * Module: Dashboard & Plan Generator (Page 3)
 * Calculates VDOT, builds weekly plan, renders calendar & modal
 */

import { vdotTable, volumeMatrix, runnerTypeMap } from '../data/constants.js';
import { calculateVDOT, parseTimeToMinutes, switchTab } from '../utils.js';

function roundToHalf(value) {
    return Math.ceil(value * 2) / 2;
}

/**
 * Main plan generation – receives collected onboarding data
 */
export function generatePlan(data) {
    const {
        recentDist,
        recentTimeStr,
        goalDistKm,
        sessionsPerWeek,
        exp,
        raceDateStr,
        school,
        age,
        freeDays,
        yellowFlag,
        noRaceHistory
    } = data;

    // ---- Timeline calculation ----
    let totalWeeks = 12;
    if (raceDateStr) {
        const diffTime = new Date(raceDateStr) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalWeeks = Math.max(4, Math.floor(diffDays / 7));
    }

    const minWeeksRequired =
        goalDistKm === 42 ? 12 :
        goalDistKm === 21 ? 8 :
        goalDistKm === 10 ? 6 : 4;

    const timelineWarning = document.getElementById('timeline-warning');
    if (totalWeeks < minWeeksRequired) {
        timelineWarning.classList.remove('hidden');
    } else {
        timelineWarning.classList.add('hidden');
    }

    // ---- VDOT & pace bands ----
    // noRaceHistory → default 5K 40:00 (VDOT ≈ 28), safe beginner baseline
    const timeMin = parseTimeToMinutes(recentTimeStr);
    const vdot = calculateVDOT(recentDist, timeMin);
    const runnerType = noRaceHistory
        ? 'Người mới (chưa thi đấu)'
        : runnerTypeMap[exp];

    let paceInfo = vdotTable.find(item => vdot >= item.min && vdot < item.max)
        || (vdot < 18 ? vdotTable[0] : vdotTable[vdotTable.length - 1]);

    document.getElementById('res-vdot').innerText = vdot.toFixed(1);
    document.getElementById('res-runner-type').innerText = runnerType;
    document.getElementById('res-goal-str').innerText = `${goalDistKm} km`;

    const hrMax = 208 - 0.7 * age;
    document.getElementById('pace-e').innerText =
        school === 'hr'
            ? `Z2 (${Math.round(hrMax * 0.60)}-${Math.round(hrMax * 0.70)} bpm)`
            : paceInfo.e;
    document.getElementById('pace-t').innerText =
        school === 'hr'
            ? `Z4 (${Math.round(hrMax * 0.80)}-${Math.round(hrMax * 0.88)} bpm)`
            : paceInfo.t;
    document.getElementById('pace-i').innerText =
        school === 'hr'
            ? `Z5 (> ${Math.round(hrMax * 0.90)} bpm)`
            : paceInfo.i;
    document.getElementById('pace-r').innerText = paceInfo.r;

    // Yellow flag banner
    const yellowEl = document.getElementById('yellow-warning');
    if (yellowFlag) {
        yellowEl.classList.remove('hidden');
    } else {
        yellowEl.classList.add('hidden');
    }

    // ---- Phase breakdown ----
    const racePhaseWeeks = 3;
    const remainingWeeks = Math.max(1, totalWeeks - racePhaseWeeks);
    const qualityPhaseWeeks = Math.round(0.55 * remainingWeeks);
    const basePhaseWeeks = Math.max(3, remainingWeeks - qualityPhaseWeeks);

    const weeksContainer = document.getElementById('calendar-weeks-container');
    weeksContainer.innerHTML = '';

    const goalKey =
        goalDistKm === 42 ? 'FM' :
        goalDistKm === 21 ? 'HM' :
        goalDistKm === 10 ? '10K' : '5K';
    const matrix = volumeMatrix[goalKey];

    let hasHeavyWarning = false;

    // ---- Build each week ----
    for (let w = 1; w <= totalWeeks; w++) {
        let phase = 'Chung (Base)';
        let volRange = matrix['Chung (Base)'][exp];

        if (w > basePhaseWeeks && w <= basePhaseWeeks + qualityPhaseWeeks) {
            phase = 'Chuyên môn (Quality)';
            volRange = matrix['Chuyên môn (Quality)'][exp];
        } else if (w > basePhaseWeeks + qualityPhaseWeeks) {
            phase = 'Giảm tải & Race';
            volRange = matrix['Giảm tải & Race'][exp];
        }

        let baseVol = volRange[0] + ((volRange[1] - volRange[0]) / totalWeeks) * w;

        // Deload weeks
        const deloadInterval = exp === 'new' ? 3 : 4;
        if (w % deloadInterval === 0 && w < totalWeeks) {
            baseVol *= 0.8;
        }

        let weeklyKm = roundToHalf(baseVol);
        if (yellowFlag) {
            weeklyKm = roundToHalf(weeklyKm * 0.88);
        }

        // Initialise all days as rest
        const allWeekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        let workouts = allWeekDays.map(d => ({
            day: d,
            type: 'Nghỉ ngơi / Chéo',
            km: 0,
            desc: 'Nghỉ ngơi hoặc giãn cơ hồi phục nhẹ nhàng.'
        }));

        const activeDays = freeDays.slice(0, Math.min(sessionsPerWeek, freeDays.length));
        const longRunDay = activeDays.includes('CN')
            ? 'CN'
            : activeDays.includes('T7')
                ? 'T7'
                : activeDays[activeDays.length - 1];
        const intervalDay = activeDays.length > 1 ? activeDays[0] : longRunDay;

        // Pass 1: Long Run + Interval
        let assignedKm = 0;
        let heavyKmTotal = 0;

        workouts.forEach(wObj => {
            if (!activeDays.includes(wObj.day)) return;

            if (wObj.day === longRunDay) {
                wObj.type = 'Long Run (Chạy dài)';
                wObj.km = roundToHalf(weeklyKm * 0.38);
                assignedKm += wObj.km;
                wObj.desc = `Chạy ổn định duy trì ở vùng Pace E (${paceInfo.e}). Xây dựng sức bền hiếu khí.`;
                wObj.target = `Pace E: ${paceInfo.e}`;
                wObj.rationale = 'Tăng cường mật độ ti thể và sức chịu đựng cơ xương khớp.';
            } else if (
                wObj.day === intervalDay &&
                phase.includes('Chuyên môn') &&
                exp !== 'new' &&
                activeDays.length > 1
            ) {
                wObj.type = 'Interval / Tempo';
                wObj.km = roundToHalf(weeklyKm * 0.18);
                heavyKmTotal += wObj.km;
                assignedKm += wObj.km;
                wObj.desc = `Khởi động 2km -> Chạy biến tốc ngưỡng Interval (${paceInfo.i}) -> Thả lỏng 2km.`;
                wObj.target = `Pace I: ${paceInfo.i}`;
                wObj.rationale = 'Nâng cao ngưỡng chịu đựng lactate và cải thiện tốc độ tối đa.';
            }
        });

        // Safety: heavy volume ≤ 20 %
        if (heavyKmTotal / weeklyKm > 0.20) {
            hasHeavyWarning = true;
            const scaleFactor = (0.20 * weeklyKm) / heavyKmTotal;
            workouts.forEach(wObj => {
                if (wObj.type.includes('Interval')) {
                    assignedKm -= wObj.km;
                    wObj.km = roundToHalf(wObj.km * scaleFactor);
                    assignedKm += wObj.km;
                }
            });
        }

        // Pass 2: distribute remaining km to Easy days
        const remainingDays = workouts.filter(
            wObj => activeDays.includes(wObj.day) && wObj.km === 0
        );
        let remainingKm = Math.max(0, roundToHalf(weeklyKm - assignedKm));

        if (remainingDays.length > 0) {
            let kmPerEasy = roundToHalf(remainingKm / remainingDays.length);
            remainingDays.forEach((wObj, idx) => {
                wObj.type = 'Easy Run + Strides';
                wObj.km = idx === remainingDays.length - 1 ? remainingKm : kmPerEasy;
                remainingKm -= wObj.km;
                wObj.desc = `Chạy thả lỏng phục hồi ở Pace E (${paceInfo.e}), kết hợp vài nhịp tăng tốc ngắn.`;
                wObj.target = `Pace E: ${paceInfo.e}`;
                wObj.rationale = 'Thúc đẩy lưu lượng máu phục hồi cơ bắp.';
            });
        }

        // Render week card
        const weekCard = document.createElement('div');
        weekCard.className = 'bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2';
        weekCard.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-bold text-sm text-slate-800">
                    Tuần ${w}
                    <span class="text-xs font-normal text-slate-500">(${phase})</span>
                </span>
                <span class="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                    Tổng: ~${weeklyKm} km
                </span>
            </div>
            <div class="grid grid-cols-7 gap-1 pt-1 text-center text-xs">
                ${workouts.map(wo => `
                    <div onclick='openWorkoutModal(${JSON.stringify(wo)}, ${w})'
                         class="p-1.5 rounded-lg border ${
                             wo.km > 0
                                 ? 'bg-indigo-50/50 border-indigo-200 cursor-pointer hover:bg-indigo-100 font-semibold text-indigo-700'
                                 : 'bg-slate-50 text-slate-400'
                         }">
                        <div>${wo.day}</div>
                        <div class="text-[10px] mt-0.5">${wo.km > 0 ? wo.km + 'k' : '-'}</div>
                    </div>
                `).join('')}
            </div>
        `;
        weeksContainer.appendChild(weekCard);
    }

    // Heavy warning banner
    const heavyEl = document.getElementById('heavy-warning');
    if (hasHeavyWarning) {
        heavyEl.classList.remove('hidden');
    } else {
        heavyEl.classList.add('hidden');
    }

    document.getElementById('total-weeks-label').innerText = `${totalWeeks} tuần`;
    switchTab('step-dashboard');
}

/**
 * Open workout detail modal
 */
export function openWorkoutModal(wo, weekNum) {
    document.getElementById('modal-day-badge').innerText = `Tuần ${weekNum} - ${wo.day}`;
    document.getElementById('modal-title').innerText = wo.type;
    document.getElementById('modal-structure').innerHTML = `
        <div><strong>Khối lượng:</strong> ${wo.km} km</div>
        <div><strong>Mô tả chi tiết:</strong> ${wo.desc}</div>
    `;
    document.getElementById('modal-target').innerText = wo.target || 'Pace E (Thoải mái)';
    document.getElementById('modal-rationale').innerText =
        wo.rationale || 'Giúp hồi phục và tích lũy thể lực nền tảng.';

    const warningBox = document.getElementById('modal-warning-box');
    if (wo.km > 15) {
        warningBox.classList.remove('hidden');
        document.getElementById('modal-warning-text').innerText =
            'Quãng đường dài, hãy mang theo nước điện giải và gel năng lượng đầy đủ.';
    } else {
        warningBox.classList.add('hidden');
    }

    document.getElementById('workout-modal').classList.remove('hidden');
}

/**
 * Close workout modal
 */
export function closeModal() {
    document.getElementById('workout-modal').classList.add('hidden');
}

// Expose for inline handlers
window.openWorkoutModal = openWorkoutModal;
window.closeModal = closeModal;
window.generatePlan = generatePlan;
