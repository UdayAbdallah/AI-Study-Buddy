export type Theme = "dark" | "light";
export type View = "dashboard" | "study" | "quiz" | "progress" | "settings";
export type SubjectId = "html" | "css" | "javascript" | "typescript" | "python";
export type Difficulty = "easy" | "medium" | "hard";
export type AgentName = "teacher" | "quiz" | "hint" | "progress" | "system";

export interface Student {
  name: string;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  body: string[];
  code: string;
  xp: number;
}

export interface Course {
  id: SubjectId;
  title: string;
  blurb: string;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  subject: SubjectId;
  difficulty: Difficulty;
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
  hints: string[];
}

export interface QuizResult {
  subject: SubjectId;
  score: number;
  total: number;
  date: string;
}

export interface ActivityItem {
  kind: "lesson" | "quiz";
  label: string;
  date: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  code?: string;
}

export interface AgentResponse {
  agent: AgentName;
  text: string;
  code?: string;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  completedLessons: string[];
  quizResults: QuizResult[];
  activity: ActivityItem[];
  lastLesson: { subject: SubjectId; index: number };
}

export interface AppSettings extends Student {
  theme: Theme;
  dailyGoal: number;
  sound: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  test: (progress: UserProgress) => boolean;
}

export interface Mistake {
  question: QuizQuestion;
  chosen: number;
}

export interface AssistantContext {
  course: Course;
  lesson: Lesson;
  question: QuizQuestion | null;
  hintLevel: number;
  mistake: Mistake | null;
  progress: UserProgress;
}

export interface StudyAssistant {
  respond(input: string, context: AssistantContext): Promise<AgentResponse>;
}
