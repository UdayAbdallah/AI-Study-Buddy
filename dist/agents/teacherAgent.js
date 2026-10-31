export function teach(lesson, mode) {
    if (mode === "example") {
        return {
            agent: "teacher",
            text: `Here is an example from "${lesson.title}". Read it line by line, then try changing a value.`,
            code: lesson.code,
        };
    }
    return {
        agent: "teacher",
        text: `${lesson.title}, in simple words: ${lesson.summary} ${lesson.body.join(" ")}`,
    };
}
//# sourceMappingURL=teacherAgent.js.map