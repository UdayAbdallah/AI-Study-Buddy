import type { Difficulty, QuizQuestion, SubjectId } from "../types.js";

let counter = 0;

const q = (
  subject: SubjectId,
  difficulty: Difficulty,
  prompt: string,
  options: [string, string, string, string],
  answer: number,
  explanation: string,
  hints: string[]
): QuizQuestion => ({ id: `${subject}-${++counter}`, subject, difficulty, prompt, options, answer, explanation, hints });

export const QUESTIONS: QuizQuestion[] = [
  q("typescript", "easy", "Which annotation declares a string variable?", ["let a: str", "let a: string", "let a = string", "string a"], 1,
    "Types come after the name, separated by a colon, and the type is called string.",
    ["Types go after the variable name.", "The primitive type for text is spelled out in full."]),
  q("typescript", "easy", "What does the ? in email?: string mean?", ["The value is a number", "The property is optional", "The property is private", "The value is null"], 1,
    "A question mark makes a property or parameter optional.",
    ["Think about a field the user may leave empty.", "The property does not have to be provided."]),
  q("typescript", "medium", "In function id<T>(x: T): T, what is T?", ["A class", "A type placeholder", "A constant", "A module"], 1,
    "T is a type parameter that is filled in with a real type when the function is used.",
    ["Generics are about reusing code across types.", "It stands for 'type'."]),
  q("typescript", "medium", "What does an async function return?", ["void", "A string", "A Promise", "An array"], 2,
    "An async function always wraps its result in a Promise.",
    ["await only works on one kind of value.", "The result arrives later."]),
  q("html", "easy", "Which element holds the main visible content of a page?", ["head", "body", "meta", "title"], 1,
    "The body element contains everything the user sees.", ["The head is for metadata.", "It shares its name with a part of a person."]),
  q("html", "easy", "Which tag creates the largest heading?", ["h6", "head", "h1", "header"], 2,
    "h1 is the top-level heading and h6 the smallest.", ["Heading levels count up in size.", "The number is the lowest one."]),
  q("css", "easy", "Which property adds space inside an element's border?", ["margin", "padding", "gap", "outline"], 1,
    "Padding is the space between content and border; margin is outside.", ["It is part of the box model.", "Margin is the outside one."]),
  q("css", "easy", "How do you select an element with class card?", ["#card", "card", ".card", "*card"], 2,
    "A dot selects classes and a hash selects IDs.", ["Classes and IDs use different symbols.", "It is a single punctuation mark."]),
  q("javascript", "easy", "Which keyword declares a value that cannot be reassigned?", ["var", "let", "const", "set"], 2,
    "const prevents reassignment of the variable.", ["Its name is short for 'constant'.", "let allows changes."]),
  q("javascript", "easy", "What does console.log do?", ["Saves a file", "Prints to the console", "Opens a popup", "Reloads the page"], 1,
    "It writes a message to the browser developer console.", ["Open your browser dev tools.", "It is for debugging output."]),
  q("python", "easy", "Which function shows output in Python?", ["echo", "print", "log", "show"], 1,
    "print writes values to the screen.", ["It is the same word as printing on paper.", "It is a built-in function."]),
  q("python", "easy", "How does Python mark a block of code?", ["Curly braces", "Indentation", "Semicolons", "Parentheses"], 1,
    "Python uses consistent indentation to define blocks.", ["Look at the whitespace.", "It replaces braces."]),
];
