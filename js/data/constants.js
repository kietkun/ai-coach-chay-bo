/**
 * Shared constants & lookup tables
 * AI Coach Chạy Bộ
 */

export const healthQuestions = [
    "1. Bác sĩ từng chẩn đoán bạn có bệnh về tim hoặc vấn đề tim mạch?",
    "2. Bạn có cảm thấy đau ngực khi thực hiện hoạt động thể chất/vận động?",
    "3. Trong vòng tháng qua, bạn có bị đau ngực khi không vận động không?",
    "4. Bạn có bao giờ mất thăng bằng do chóng mặt hoặc từng bị ngất/xỉu?",
    "5. Gia đình bạn có tiền sử người bị đột quỵ hoặc bệnh tim đột ngột ở tuổi trẻ?",
    "6. Bạn có bị huyết áp cao đang điều trị hoặc chưa kiểm soát?",
    "7. Bạn có mắc bệnh tiểu đường (Type 1 hoặc Type 2)?",
    "8. Bạn có mắc bệnh hen suyễn hoặc bệnh phổi mạn tính?",
    "9. Bạn có mắc bệnh động kinh hoặc rối loạn thần kinh?",
    "10. Bạn đang mang thai hoặc mới sinh con trong vòng 6 tháng qua?",
    "11. Bạn đang có chấn thương cơ xương khớp cần điều trị hoặc đau mạn tính?",
    "12. Bạn đang dùng thuốc điều trị tim mạch, huyết áp hoặc tiểu đường thường xuyên?",
    "13. Bạn trên 50 tuổi và chưa từng tập thể dục cường độ cao đều đặn?"
];

export const vdotTable = [
    { min: 18, max: 20, e: "10:24–9:52", t: "8:49–8:24", i: "8:10–7:45", r: "8:00–7:35" },
    { min: 20, max: 22, e: "9:52–9:22",  t: "8:24–7:50", i: "7:45–7:21", r: "7:35–7:11" },
    { min: 22, max: 24, e: "9:22–8:54",  t: "7:50–7:27", i: "7:21–6:58", r: "7:11–6:48" },
    { min: 24, max: 26, e: "8:54–8:26",  t: "7:27–7:05", i: "6:58–6:36", r: "6:48–6:26" },
    { min: 26, max: 28, e: "8:26–8:02",  t: "7:05–6:44", i: "6:36–6:15", r: "6:26–5:55" },
    { min: 28, max: 30, e: "8:02–7:40",  t: "6:44–6:24", i: "6:15–5:55", r: "5:55–5:35" },
    { min: 30, max: 32, e: "7:40–7:18",  t: "6:24–6:05", i: "5:55–5:35", r: "5:35–5:15" },
    { min: 32, max: 34, e: "7:18–6:58",  t: "6:05–5:48", i: "5:35–5:20", r: "5:15–5:00" },
    { min: 34, max: 36, e: "6:58–6:40",  t: "5:48–5:33", i: "5:20–5:07", r: "5:00–4:40" },
    { min: 36, max: 38, e: "6:40–6:23",  t: "5:33–5:19", i: "5:07–4:54", r: "4:40–4:30" },
    { min: 38, max: 40, e: "6:23–6:08",  t: "5:19–5:06", i: "4:54–4:42", r: "4:30–4:20" },
    { min: 40, max: 42, e: "6:08–5:55",  t: "5:06–4:54", i: "4:42–4:31", r: "4:20–4:10" },
    { min: 42, max: 44, e: "5:55–5:41",  t: "4:54–4:43", i: "4:31–4:21", r: "4:10–4:00" },
    { min: 44, max: 46, e: "5:41–5:30",  t: "4:43–4:33", i: "4:21–4:12", r: "4:00–3:50" },
    { min: 46, max: 48, e: "5:30–5:19",  t: "4:33–4:24", i: "4:12–4:03", r: "3:50–3:40" },
    { min: 48, max: 50, e: "5:19–5:08",  t: "4:24–4:15", i: "4:03–3:55", r: "3:40–3:35" },
    { min: 50, max: 52, e: "5:08–4:59",  t: "4:15–4:07", i: "3:55–3:48", r: "3:35–3:30" },
    { min: 52, max: 54, e: "4:59–4:50",  t: "4:07–4:00", i: "3:48–3:41", r: "3:30–3:20" },
    { min: 54, max: 56, e: "4:50–4:41",  t: "4:00–3:53", i: "3:41–3:34", r: "3:20–3:15" },
    { min: 56, max: 58, e: "4:41–4:34",  t: "3:53–3:45", i: "3:34–3:28", r: "3:15–3:10" },
    { min: 58, max: 60, e: "4:34–4:26",  t: "3:45–3:40", i: "3:28–3:23", r: "3:10–3:05" },
    { min: 60, max: 62, e: "4:26–4:20",  t: "3:40–3:34", i: "3:23–3:17", r: "3:05–3:00" }
];

export const volumeMatrix = {
    'FM': {
        'Chung (Base)':           { 'new': [25, 35], 'exp': [35, 45], 'pro': [35, 60] },
        'Chuyên môn (Quality)':   { 'new': [30, 45], 'exp': [35, 70], 'pro': [60, 100] },
        'Giảm tải & Race':        { 'new': [30, 40], 'exp': [30, 45], 'pro': [30, 45] }
    },
    'HM': {
        'Chung (Base)':           { 'new': [20, 25], 'exp': [25, 35], 'pro': [25, 45] },
        'Chuyên môn (Quality)':   { 'new': [20, 35], 'exp': [25, 50], 'pro': [45, 75] },
        'Giảm tải & Race':        { 'new': [20, 30], 'exp': [20, 35], 'pro': [20, 35] }
    },
    '10K': {
        'Chung (Base)':           { 'new': [15, 20], 'exp': [20, 25], 'pro': [20, 35] },
        'Chuyên môn (Quality)':   { 'new': [15, 25], 'exp': [20, 40], 'pro': [35, 55] },
        'Giảm tải & Race':        { 'new': [15, 20], 'exp': [15, 25], 'pro': [15, 25] }
    },
    '5K': {
        'Chung (Base)':           { 'new': [10, 15], 'exp': [15, 20], 'pro': [15, 25] },
        'Chuyên môn (Quality)':   { 'new': [12, 20], 'exp': [15, 30], 'pro': [25, 40] },
        'Giảm tải & Race':        { 'new': [12, 15], 'exp': [12, 20], 'pro': [12, 20] }
    }
};

export const runnerTypeMap = {
    'new': 'Người mới',
    'exp': 'Có kinh nghiệm',
    'pro': 'VĐV'
};
