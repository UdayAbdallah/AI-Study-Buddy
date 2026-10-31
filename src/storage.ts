import type { AppSettings, UserProgress } from "./types.js";

const PROGRESS_KEY = "asb-progress";
const SETTINGS_KEY = "asb-settings";

export const defaultProgress = (): UserProgress => ({
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  completedLessons: [],
  quizResults: [],
  activity: [],
  lastLesson: { subject: "typescript", index: 0 },
});

export const defaultSettings = (): AppSettings => ({
  name: "Student",
  theme: "dark",
  dailyGoal: 2,
  sound: false,
});

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export const todayKey = (): string => dayKey(new Date());

function read<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: object): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export const loadProgress = (): UserProgress => read(PROGRESS_KEY, defaultProgress());
export const saveProgress = (progress: UserProgress): void => write(PROGRESS_KEY, progress);
export const loadSettings = (): AppSettings => read(SETTINGS_KEY, defaultSettings());
export const saveSettings = (settings: AppSettings): void => write(SETTINGS_KEY, settings);

export function clearAll(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    return;
  }
}
