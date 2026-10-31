import { dayKey } from "../storage.js";
export const LEVELS = [
    { name: "Beginner", min: 0 },
    { name: "Learner", min: 100 },
    { name: "Explorer", min: 300 },
    { name: "Skilled", min: 600 },
    { name: "Expert", min: 1000 },
];
export const ACHIEVEMENTS = [
    { id: "first", title: "First Step", description: "Complete a lesson", test: (p) => p.completedLessons.length >= 1 },
    { id: "quiz", title: "Quiz Taker", description: "Finish a quiz", test: (p) => p.quizResults.length >= 1 },
    { id: "perfect", title: "Perfect Score", description: "Score 100% on a quiz", test: (p) => p.quizResults.some((r) => r.score === r.total) },
    { id: "streak", title: "On a Roll", description: "Reach a 3-day streak", test: (p) => p.streak >= 3 },
    { id: "explorer", title: "Explorer", description: "Earn 300 XP", test: (p) => p.xp >= 300 },
    { id: "ts", title: "TypeScript Graduate", description: "Finish all TypeScript lessons", test: (p) => p.completedLessons.filter((id) => id.startsWith("ts-")).length >= 7 },
];
export function levelFor(xp) {
    let index = 0;
    LEVELS.forEach((level, i) => {
        if (xp >= level.min)
            index = i;
    });
    const current = LEVELS[index];
    const next = LEVELS[index + 1];
    const percent = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;
    return { index, name: current.name, floor: current.min, ceiling: next ? next.min : null, percent };
}
export function averageScore(progress) {
    if (progress.quizResults.length === 0)
        return 0;
    const total = progress.quizResults.reduce((sum, r) => sum + r.score / r.total, 0);
    return Math.round((total / progress.quizResults.length) * 100);
}
export function activeStreak(progress) {
    if (!progress.lastStudyDate)
        return 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recent = [dayKey(new Date()), dayKey(yesterday)];
    return recent.includes(progress.lastStudyDate) ? progress.streak : 0;
}
export function subjectProgress(course, progress) {
    const done = course.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
    const total = course.lessons.length;
    return { done, total, percent: Math.round((done / total) * 100) };
}
function subjectAverage(subject, progress) {
    const results = progress.quizResults.filter((r) => r.subject === subject);
    if (results.length === 0)
        return null;
    return (results.reduce((sum, r) => sum + r.score / r.total, 0) / results.length) * 100;
}
export function recommend(progress, courses) {
    const firstOpen = (course) => course.lessons.findIndex((l) => !progress.completedLessons.includes(l.id));
    const weak = courses.find((c) => {
        const avg = subjectAverage(c.id, progress);
        return avg !== null && avg < 70 && firstOpen(c) !== -1;
    });
    if (weak) {
        return { course: weak, lessonIndex: firstOpen(weak), reason: `Your ${weak.title} quiz average is below 70%, so review this next.` };
    }
    const last = courses.find((c) => c.id === progress.lastLesson.subject) ?? courses[0];
    if (firstOpen(last) !== -1) {
        return { course: last, lessonIndex: firstOpen(last), reason: `Next unfinished lesson in ${last.title}.` };
    }
    const other = courses.find((c) => firstOpen(c) !== -1);
    if (other) {
        return { course: other, lessonIndex: firstOpen(other), reason: `You finished ${last.title}. Try ${other.title} next.` };
    }
    return { course: last, lessonIndex: 0, reason: "You completed every lesson. Review one to stay sharp." };
}
//# sourceMappingURL=progressAgent.js.map