import type { AgentResponse, Lesson } from "../types.js";

export type TeacherMode = "simple" | "example";

export function teach(lesson: Lesson, mode: TeacherMode): AgentResponse {
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
