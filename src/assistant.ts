import type { AgentResponse, AssistantContext, Course, QuizQuestion, StudyAssistant } from "./types.js";
import { teach } from "./agents/teacherAgent.js";
import { createQuiz, describeQuestion } from "./agents/quizAgent.js";
import { nextHint } from "./agents/hintAgent.js";
import { averageScore, recommend } from "./agents/progressAgent.js";

const delay = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

export class LocalAssistant implements StudyAssistant {
  constructor(
    private readonly courses: readonly Course[],
    private readonly questions: readonly QuizQuestion[]
  ) {}

  async respond(input: string, context: AssistantContext): Promise<AgentResponse> {
    await delay(500);
    const text = input.toLowerCase();

    if (text.includes("mistake")) return this.explainMistake(context);
    if (text.includes("hint")) return nextHint(context.question, context.hintLevel);
    if (text.includes("quiz")) {
      const items = createQuiz(context.course.id, "easy", this.questions);
      const first = items[0];
      return first ? describeQuestion(first) : { agent: "quiz", text: "No questions exist for this subject yet." };
    }
    if (text.includes("example")) return teach(context.lesson, "example");
    if (text.includes("progress") || text.includes("next") || text.includes("recommend")) {
      const pick = recommend(context.progress, this.courses);
      const lesson = pick.course.lessons[pick.lessonIndex];
      return {
        agent: "progress",
        text: `Study "${lesson.title}" in ${pick.course.title}. ${pick.reason} Your quiz average is ${averageScore(context.progress)}%.`,
      };
    }
    if (text.includes("explain") || text.includes("simple") || text.includes("topic")) return teach(context.lesson, "simple");

    return {
      agent: "system",
      text: "I am a local demo assistant that answers from the built-in lessons. Try: explain this topic, give me an example, quiz me, give me a hint, or explain my mistake.",
    };
  }

  private explainMistake(context: AssistantContext): AgentResponse {
    if (!context.mistake) return { agent: "teacher", text: "You have no wrong answers to review right now. Nice work." };
    const { question, chosen } = context.mistake;
    return {
      agent: "teacher",
      text: `You chose "${question.options[chosen]}", but the correct answer is "${question.options[question.answer]}". ${question.explanation}`,
    };
  }
}
