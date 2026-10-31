import { COURSES } from "./data/courses.js";
import { QUESTIONS } from "./data/questions.js";
import { clear, el, query } from "./dom.js";
import { clearAll, defaultProgress, defaultSettings, loadProgress, loadSettings, saveProgress, saveSettings, todayKey, dayKey } from "./storage.js";
import { applyTheme, toggleTheme } from "./theme.js";
import { initNavigation } from "./navigation.js";
import { LocalAssistant } from "./assistant.js";
import { createQuiz } from "./agents/quizAgent.js";
import { nextHint } from "./agents/hintAgent.js";
import { ACHIEVEMENTS, activeStreak, averageScore, levelFor, recommend, subjectProgress } from "./agents/progressAgent.js";
const SUGGESTIONS = ["Explain this topic simply", "Give me an example", "Quiz me", "Give me a hint", "Explain my mistake"];
const DIFFICULTIES = ["easy", "medium", "hard"];
let progress = loadProgress();
let settings = loadSettings();
let currentView = "dashboard";
let subject = progress.lastLesson.subject;
let lessonIndex = progress.lastLesson.index;
let quiz = null;
let quizSubject = "typescript";
let quizDifficulty = "easy";
let hintLevel = 0;
let hintText = "";
let mistake = null;
let chatBusy = false;
const assistant = new LocalAssistant(COURSES, QUESTIONS);
const chatLog = query("#chat-log");
const chatInput = query("#chat-input");
const resetDialog = query("#reset-dialog");
const course = (id) => COURSES.find((c) => c.id === id) ?? COURSES[0];
const currentLesson = () => course(subject).lessons[lessonIndex] ?? course(subject).lessons[0];
const currentQuestion = () => quiz && !quiz.finished && quiz.chosen === null ? quiz.questions[quiz.index] : null;
const todayLessons = () => progress.activity.filter((a) => a.kind === "lesson" && a.date === todayKey()).length;
function toast(message) {
    const box = query("#toasts");
    const node = el("div", { class: "toast", text: message });
    box.append(node);
    window.setTimeout(() => node.remove(), 3800);
    if (settings.sound)
        beep();
}
function beep() {
    try {
        const audio = new AudioContext();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.frequency.value = 660;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start();
        osc.stop(audio.currentTime + 0.12);
        osc.onended = () => void audio.close();
    }
    catch {
        return;
    }
}
function touchStreak() {
    const today = todayKey();
    if (progress.lastStudyDate === today)
        return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    progress.streak = progress.lastStudyDate === dayKey(yesterday) ? progress.streak + 1 : 1;
    progress.lastStudyDate = today;
}
function award(xp, item) {
    const levelBefore = levelFor(progress.xp).index;
    const unlockedBefore = ACHIEVEMENTS.filter((a) => a.test(progress)).map((a) => a.id);
    progress.xp += xp;
    touchStreak();
    progress.activity = [item, ...progress.activity].slice(0, 30);
    saveProgress(progress);
    toast(`+${xp} XP · ${item.label}`);
    const after = levelFor(progress.xp);
    if (after.index > levelBefore)
        toast(`Level up! You are now ${after.name}.`);
    for (const a of ACHIEVEMENTS) {
        if (a.test(progress) && !unlockedBefore.includes(a.id))
            toast(`Achievement unlocked: ${a.title}`);
    }
    render();
}
function bar(percent, label) {
    const fill = el("span", { class: "bar-fill" });
    fill.style.width = `${percent}%`;
    return el("div", { class: "bar", attrs: { role: "progressbar", "aria-label": label, "aria-valuenow": String(percent), "aria-valuemin": "0", "aria-valuemax": "100" } }, [fill]);
}
const statCard = (label, value, hint) => el("div", { class: "card stat" }, [
    el("span", { class: "muted", text: label }),
    el("strong", { class: "stat-value", text: value }),
    el("span", { class: "muted small", text: hint }),
]);
const button = (text, onClick, variant = "") => el("button", { class: `btn ${variant}`.trim(), text, attrs: { type: "button" }, on: { click: onClick } });
function statGrid() {
    const level = levelFor(progress.xp);
    return el("div", { class: "grid stats" }, [
        statCard("Study streak", `${activeStreak(progress)} days`, "Study daily to keep it"),
        statCard("Total XP", String(progress.xp), `Level: ${level.name}`),
        statCard("Lessons completed", String(progress.completedLessons.length), `of ${COURSES.reduce((n, c) => n + c.lessons.length, 0)}`),
        statCard("Average quiz score", `${averageScore(progress)}%`, `${progress.quizResults.length} quizzes taken`),
    ]);
}
function openLesson(id, index) {
    subject = id;
    lessonIndex = index;
    progress.lastLesson = { subject: id, index };
    saveProgress(progress);
    show("study");
}
function renderDashboard(root) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const rec = recommend(progress, COURSES);
    const resume = course(progress.lastLesson.subject);
    const resumeLesson = resume.lessons[progress.lastLesson.index] ?? resume.lessons[0];
    const recLesson = rec.course.lessons[rec.lessonIndex];
    root.append(el("section", { class: "card hero" }, [
        el("div", {}, [
            el("p", { class: "eyebrow", text: greeting }),
            el("h1", { text: `Welcome back, ${settings.name}` }),
            el("p", { class: "muted", text: `${todayLessons()} of ${settings.dailyGoal} lessons done today.` }),
        ]),
        button("Start Studying", () => openLesson(resume.id, progress.lastLesson.index), "primary"),
    ]), statGrid(), el("div", { class: "grid two" }, [
        el("section", { class: "card" }, [
            el("h2", { text: "Continue learning" }),
            el("p", { text: `${resume.title}: ${resumeLesson.title}` }),
            el("p", { class: "muted", text: resumeLesson.summary }),
            button("Continue", () => openLesson(resume.id, progress.lastLesson.index)),
        ]),
        el("section", { class: "card" }, [
            el("h2", { text: "Recommended for you" }),
            el("p", { text: `${rec.course.title}: ${recLesson.title}` }),
            el("p", { class: "muted", text: rec.reason }),
            button("Open lesson", () => openLesson(rec.course.id, rec.lessonIndex)),
        ]),
    ]), el("h2", { text: "Subjects" }), el("div", { class: "grid subjects" }, COURSES.map((c) => {
        const sp = subjectProgress(c, progress);
        const open = el("button", { class: "card subject", attrs: { type: "button" }, on: { click: () => openLesson(c.id, Math.max(0, c.lessons.findIndex((l) => !progress.completedLessons.includes(l.id)))) } }, [
            el("strong", { text: c.title }),
            el("span", { class: "muted small", text: c.blurb }),
            bar(sp.percent, `${c.title} progress`),
            el("span", { class: "muted small", text: `${sp.done}/${sp.total} lessons` }),
        ]);
        return open;
    })));
}
function renderStudy(root) {
    const c = course(subject);
    const lesson = currentLesson();
    const done = progress.completedLessons.includes(lesson.id);
    const tabs = el("div", { class: "tabs", attrs: { role: "group", "aria-label": "Subject" } }, COURSES.map((item) => el("button", {
        class: "tab",
        text: item.title,
        attrs: { type: "button", "aria-pressed": String(item.id === subject) },
        on: { click: () => openLesson(item.id, 0) },
    })));
    const complete = button(done ? "Completed" : "Mark as Completed", () => {
        if (progress.completedLessons.includes(lesson.id))
            return;
        progress.completedLessons.push(lesson.id);
        award(lesson.xp, { kind: "lesson", label: `Completed ${lesson.title}`, date: todayKey() });
    }, "primary");
    complete.disabled = done;
    const prev = button("Previous", () => openLesson(subject, lessonIndex - 1));
    prev.disabled = lessonIndex === 0;
    const next = button("Next", () => openLesson(subject, lessonIndex + 1));
    next.disabled = lessonIndex >= c.lessons.length - 1;
    root.append(el("h1", { text: "Study room" }), tabs, el("article", { class: "card lesson" }, [
        el("p", { class: "eyebrow", text: `${c.title} · Lesson ${lessonIndex + 1} of ${c.lessons.length}` }),
        el("h2", { text: lesson.title }),
        el("p", { class: "lead", text: lesson.summary }),
        ...lesson.body.map((text) => el("p", { text })),
        el("pre", { class: "code" }, [el("code", { text: lesson.code })]),
        el("div", { class: "row" }, [
            prev,
            next,
            complete,
            button("Ask AI", () => {
                setChat(true);
                void send("Explain this topic simply");
            }),
            button("Take quiz", () => {
                quizSubject = subject;
                quiz = null;
                show("quiz");
            }),
        ]),
    ]));
}
function choice(label, values, selected, onPick) {
    const select = el("select", { attrs: { id: `pick-${label}` } }, values.map((v) => el("option", { text: v, attrs: v === selected ? { value: v, selected: "" } : { value: v } })));
    select.addEventListener("change", () => {
        const match = values.find((v) => v === select.value);
        if (match)
            onPick(match);
    });
    return el("label", { class: "field" }, [el("span", { text: label }), select]);
}
function startQuiz() {
    const questions = createQuiz(quizSubject, quizDifficulty, QUESTIONS);
    quiz = { subject: quizSubject, questions, index: 0, correct: 0, chosen: null, finished: false, rewarded: false };
    hintLevel = 0;
    hintText = "";
    render();
}
function answer(choiceIndex) {
    if (!quiz || quiz.chosen !== null || quiz.finished)
        return;
    const question = quiz.questions[quiz.index];
    quiz.chosen = choiceIndex;
    if (choiceIndex === question.answer)
        quiz.correct++;
    else
        mistake = { question, chosen: choiceIndex };
    render();
}
function advance() {
    if (!quiz || quiz.chosen === null || quiz.finished)
        return;
    hintLevel = 0;
    hintText = "";
    if (quiz.index + 1 < quiz.questions.length) {
        quiz.index++;
        quiz.chosen = null;
        render();
        return;
    }
    quiz.finished = true;
    if (!quiz.rewarded) {
        quiz.rewarded = true;
        progress.quizResults.push({ subject: quiz.subject, score: quiz.correct, total: quiz.questions.length, date: todayKey() });
        const bonus = quiz.correct === quiz.questions.length ? 20 : 0;
        award(quiz.correct * 10 + bonus, { kind: "quiz", label: `Quiz: ${course(quiz.subject).title} ${quiz.correct}/${quiz.questions.length}`, date: todayKey() });
        return;
    }
    render();
}
function renderQuiz(root) {
    root.append(el("h1", { text: "Quiz" }));
    if (!quiz) {
        root.append(el("section", { class: "card" }, [
            el("h2", { text: "Choose a quiz" }),
            el("div", { class: "row" }, [
                choice("Subject", COURSES.map((c) => c.id), quizSubject, (v) => { quizSubject = v; }),
                choice("Difficulty", DIFFICULTIES, quizDifficulty, (v) => { quizDifficulty = v; }),
            ]),
            button("Start Quiz", startQuiz, "primary"),
        ]));
        return;
    }
    const total = quiz.questions.length;
    if (quiz.finished) {
        const percent = Math.round((quiz.correct / total) * 100);
        root.append(el("section", { class: "card result" }, [
            el("h2", { text: "Quiz complete" }),
            el("p", { class: "big", text: `${quiz.correct} / ${total}` }),
            el("p", { class: "muted", text: `${percent}% correct. XP was added to your total once.` }),
            button("Retry Quiz", startQuiz, "primary"),
            button("Back to dashboard", () => { quiz = null; show("dashboard"); }),
        ]));
        return;
    }
    const question = quiz.questions[quiz.index];
    const answered = quiz.chosen !== null;
    const options = question.options.map((text, i) => {
        const state = !answered ? "" : i === question.answer ? "correct" : i === quiz?.chosen ? "wrong" : "";
        const option = el("button", { class: `option ${state}`.trim(), text: `${String.fromCharCode(65 + i)}. ${text}`, attrs: { type: "button" }, on: { click: () => answer(i) } });
        option.disabled = answered;
        return option;
    });
    const feedback = answered
        ? el("div", { class: `card feedback ${quiz.chosen === question.answer ? "ok" : "bad"}` }, [
            el("strong", { text: quiz.chosen === question.answer ? "Correct!" : "Not quite." }),
            el("p", { text: question.explanation }),
            button(quiz.index + 1 < total ? "Next Question" : "See results", advance, "primary"),
        ])
        : el("div", { class: "row" }, [
            button("Get a hint", () => {
                hintText = nextHint(question, hintLevel).text;
                hintLevel++;
                render();
            }),
            hintText ? el("p", { class: "hint", text: hintText }) : el("span"),
        ]);
    root.append(el("section", { class: "card" }, [
        el("div", { class: "row between" }, [
            el("span", { class: "eyebrow", text: `Question ${quiz.index + 1} of ${total}` }),
            el("span", { class: "muted", text: `${course(quiz.subject).title}` }),
        ]),
        bar(Math.round((quiz.index / total) * 100), "Quiz progress"),
        el("h2", { text: question.prompt }),
        el("div", { class: "options" }, options),
        feedback,
    ]));
}
function renderProgress(root) {
    const level = levelFor(progress.xp);
    const rec = recommend(progress, COURSES);
    const xpText = level.ceiling === null ? `${progress.xp} XP · max level` : `${progress.xp} / ${level.ceiling} XP`;
    root.append(el("h1", { text: "Your progress" }), statGrid(), el("section", { class: "card" }, [
        el("h2", { text: `Level: ${level.name}` }),
        bar(level.percent, "Progress to next level"),
        el("p", { class: "muted", text: xpText }),
    ]), el("div", { class: "grid two" }, [
        el("section", { class: "card" }, [
            el("h2", { text: "Subject progress" }),
            ...COURSES.map((c) => {
                const sp = subjectProgress(c, progress);
                return el("div", { class: "subject-row" }, [el("span", { text: `${c.title} (${sp.done}/${sp.total})` }), bar(sp.percent, `${c.title} progress`)]);
            }),
        ]),
        el("section", { class: "card" }, [
            el("h2", { text: "Recent activity" }),
            progress.activity.length === 0
                ? el("p", { class: "muted", text: "Complete a lesson or quiz to see activity here." })
                : el("ul", { class: "activity" }, progress.activity.slice(0, 6).map((a) => el("li", { text: `${a.date} · ${a.label}` }))),
        ]),
    ]), el("section", { class: "card" }, [
        el("h2", { text: "Recommended next lesson" }),
        el("p", { text: `${rec.course.title}: ${rec.course.lessons[rec.lessonIndex].title}` }),
        el("p", { class: "muted", text: rec.reason }),
        button("Open lesson", () => openLesson(rec.course.id, rec.lessonIndex)),
    ]), el("h2", { text: "Achievements" }), el("div", { class: "grid subjects" }, ACHIEVEMENTS.map((a) => {
        const unlocked = a.test(progress);
        return el("div", { class: `card badge ${unlocked ? "unlocked" : ""}`.trim() }, [
            el("strong", { text: a.title }),
            el("span", { class: "muted small", text: a.description }),
            el("span", { class: "small", text: unlocked ? "Unlocked" : "Locked" }),
        ]);
    })));
}
function renderSettings(root) {
    const name = el("input", { attrs: { id: "set-name", type: "text", maxlength: "30", value: settings.name } });
    name.addEventListener("change", () => {
        settings.name = name.value.trim() || "Student";
        saveSettings(settings);
        render();
    });
    const goal = el("input", { attrs: { id: "set-goal", type: "number", min: "1", max: "10", value: String(settings.dailyGoal) } });
    goal.addEventListener("change", () => {
        const value = Math.min(10, Math.max(1, Math.round(Number(goal.value)) || 1));
        settings.dailyGoal = value;
        saveSettings(settings);
        render();
    });
    const sound = el("input", { attrs: settings.sound ? { id: "set-sound", type: "checkbox", checked: "" } : { id: "set-sound", type: "checkbox" } });
    sound.addEventListener("change", () => {
        settings.sound = sound.checked;
        saveSettings(settings);
    });
    root.append(el("h1", { text: "Settings" }), el("section", { class: "card settings" }, [
        el("div", { class: "setting" }, [
            el("span", { text: `Theme: ${settings.theme}` }),
            button(`Switch to ${toggleTheme(settings.theme)} mode`, () => {
                settings.theme = toggleTheme(settings.theme);
                applyTheme(settings.theme);
                saveSettings(settings);
                render();
            }),
        ]),
        el("label", { class: "setting", attrs: { for: "set-name" } }, [el("span", { text: "Student name" }), name]),
        el("label", { class: "setting", attrs: { for: "set-goal" } }, [el("span", { text: "Daily goal (lessons)" }), goal]),
        el("label", { class: "setting", attrs: { for: "set-sound" } }, [el("span", { text: "Sound effects" }), sound]),
        el("div", { class: "setting" }, [el("span", { text: "Reset all progress and settings" }), button("Reset progress", () => resetDialog.showModal(), "danger")]),
    ]));
}
function render() {
    const root = query(`#view-${currentView}`);
    clear(root);
    switch (currentView) {
        case "dashboard":
            renderDashboard(root);
            break;
        case "study":
            renderStudy(root);
            break;
        case "quiz":
            renderQuiz(root);
            break;
        case "progress":
            renderProgress(root);
            break;
        case "settings":
            renderSettings(root);
            break;
    }
    const level = levelFor(progress.xp);
    const side = query("#side-level");
    clear(side);
    side.append(el("strong", { text: `${level.name} · ${progress.xp} XP` }), bar(level.percent, "Progress to next level"));
}
function setChat(open) {
    document.body.classList.toggle("chat-open", open);
    query("#chat-toggle").setAttribute("aria-expanded", String(open));
    if (open)
        chatInput.focus();
}
function typeInto(node, text) {
    return new Promise((resolve) => {
        let count = 0;
        const timer = window.setInterval(() => {
            count += 2;
            node.textContent = text.slice(0, count);
            chatLog.scrollTop = chatLog.scrollHeight;
            if (count >= text.length) {
                window.clearInterval(timer);
                resolve();
            }
        }, 16);
    });
}
async function addMessage(message, animate) {
    const text = el("p", { class: "msg-text" });
    const box = el("div", { class: `msg ${message.role}` }, [text]);
    chatLog.append(box);
    if (animate)
        await typeInto(text, message.text);
    else
        text.textContent = message.text;
    if (message.code)
        box.append(el("pre", { class: "code" }, [el("code", { text: message.code })]));
    chatLog.scrollTop = chatLog.scrollHeight;
}
function greet() {
    void addMessage({ role: "assistant", text: "Hi! I am a local demo assistant. I answer from the built-in lessons, not from a real AI model. Pick a suggestion or type a question." }, false);
}
function chatContext() {
    return { course: course(subject), lesson: currentLesson(), question: currentQuestion(), hintLevel, mistake, progress };
}
async function send(raw) {
    const text = raw.trim();
    if (!text || chatBusy)
        return;
    chatBusy = true;
    await addMessage({ role: "user", text }, false);
    const loading = el("div", { class: "msg assistant loading", attrs: { "aria-label": "Assistant is thinking" } }, [el("span"), el("span"), el("span")]);
    chatLog.append(loading);
    chatLog.scrollTop = chatLog.scrollHeight;
    try {
        const reply = await assistant.respond(text, chatContext());
        loading.remove();
        if (reply.agent === "hint" && currentQuestion())
            hintLevel++;
        await addMessage({ role: "assistant", text: reply.text, code: reply.code }, true);
    }
    catch (error) {
        loading.remove();
        await addMessage({ role: "assistant", text: error instanceof Error ? `Something went wrong: ${error.message}` : "Something went wrong. Please try again." }, false);
    }
    finally {
        chatBusy = false;
    }
}
function resetAll() {
    clearAll();
    progress = defaultProgress();
    settings = defaultSettings();
    quiz = null;
    mistake = null;
    hintLevel = 0;
    hintText = "";
    subject = progress.lastLesson.subject;
    lessonIndex = 0;
    applyTheme(settings.theme);
    show("dashboard");
    toast("Progress has been reset.");
}
const show = initNavigation((view) => {
    currentView = view;
    setChat(false);
    render();
});
applyTheme(settings.theme);
query("#chat-suggestions").append(...SUGGESTIONS.map((text) => button(text, () => void send(text), "chip")));
query("#chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const value = chatInput.value;
    chatInput.value = "";
    void send(value);
});
query("#chat-clear").addEventListener("click", () => {
    clear(chatLog);
    greet();
});
query("#chat-toggle").addEventListener("click", () => setChat(!document.body.classList.contains("chat-open")));
query("#reset-cancel").addEventListener("click", () => resetDialog.close());
query("#reset-confirm").addEventListener("click", () => {
    resetDialog.close();
    resetAll();
});
greet();
show("dashboard");
//# sourceMappingURL=main.js.map