export function createQuiz(subject, difficulty, bank) {
    const pool = bank.filter((item) => item.subject === subject);
    const matching = pool.filter((item) => item.difficulty === difficulty);
    return matching.length >= 2 ? matching : pool;
}
export function describeQuestion(question) {
    const options = question.options.map((option, index) => `${String.fromCharCode(65 + index)}) ${option}`);
    return {
        agent: "quiz",
        text: `${question.prompt}\n${options.join("\n")}\nOpen the Quiz tab to answer with instant feedback.`,
    };
}
//# sourceMappingURL=quizAgent.js.map