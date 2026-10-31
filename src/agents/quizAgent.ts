import type { AgentResponse, Difficulty, QuizQuestion, SubjectId } from "../types.js";

export function createQuiz(subject: SubjectId, difficulty: Difficulty, bank: readonly QuizQuestion[]): QuizQuestion[] {
  const pool = bank.filter((item) => item.subject === subject);
  const matching = pool.filter((item) => item.difficulty === difficulty);
  return matching.length >= 2 ? matching : pool;
}

export function describeQuestion(question: QuizQuestion): AgentResponse {
  const options = question.options.map((option, index) => `${String.fromCharCode(65 + index)}) ${option}`);
  return {
    agent: "quiz",
    text: `${question.prompt}\n${options.join("\n")}\nOpen the Quiz tab to answer with instant feedback.`,
  };
}
