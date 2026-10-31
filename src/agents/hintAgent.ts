import type { AgentResponse, QuizQuestion } from "../types.js";

export function nextHint(question: QuizQuestion | null, level: number): AgentResponse {
  if (!question) {
    return {
      agent: "hint",
      text: "Start a quiz question first, then ask for a hint. In a lesson, try predicting what the code does before reading the explanation.",
    };
  }
  if (level < question.hints.length) {
    return { agent: "hint", text: `Hint ${level + 1} of ${question.hints.length + 1}: ${question.hints[level]}` };
  }
  return {
    agent: "hint",
    text: "That is every hint I have. Rule out the options you know are wrong, then choose the best remaining one.",
  };
}
