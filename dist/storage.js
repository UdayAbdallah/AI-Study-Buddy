const PROGRESS_KEY = "asb-progress";
const SETTINGS_KEY = "asb-settings";
export const defaultProgress = () => ({
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    completedLessons: [],
    quizResults: [],
    activity: [],
    lastLesson: { subject: "typescript", index: 0 },
});
export const defaultSettings = () => ({
    name: "Student",
    theme: "dark",
    dailyGoal: 2,
    sound: false,
});
export function dayKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}
export const todayKey = () => dayKey(new Date());
function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return fallback;
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? { ...fallback, ...parsed } : fallback;
    }
    catch {
        return fallback;
    }
}
function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch {
        return;
    }
}
export const loadProgress = () => read(PROGRESS_KEY, defaultProgress());
export const saveProgress = (progress) => write(PROGRESS_KEY, progress);
export const loadSettings = () => read(SETTINGS_KEY, defaultSettings());
export const saveSettings = (settings) => write(SETTINGS_KEY, settings);
export function clearAll() {
    try {
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.removeItem(SETTINGS_KEY);
    }
    catch {
        return;
    }
}
//# sourceMappingURL=storage.js.map