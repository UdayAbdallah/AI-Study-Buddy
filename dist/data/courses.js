const lesson = (id, title, summary, body, code) => ({
    id,
    title,
    summary,
    body,
    code,
    xp: 20,
});
export const COURSES = [
    {
        id: "html",
        title: "HTML",
        blurb: "Structure web pages",
        lessons: [
            lesson("html-1", "Page structure", "HTML describes the structure of a page using elements.", [
                "Every page has a head for metadata and a body for visible content.",
                "Use semantic elements like header, main, and footer so browsers and screen readers understand your layout.",
            ], `<main>\n  <h1>Hello</h1>\n  <p>My first page.</p>\n</main>`),
        ],
    },
    {
        id: "css",
        title: "CSS",
        blurb: "Style and layout",
        lessons: [
            lesson("css-1", "Selectors and the box model", "CSS rules choose elements and change how they look.", [
                "A rule has a selector and declarations inside curly braces.",
                "Every element is a box made of content, padding, border, and margin.",
            ], `.card {\n  padding: 16px;\n  border-radius: 12px;\n}`),
        ],
    },
    {
        id: "javascript",
        title: "JavaScript",
        blurb: "Make pages interactive",
        lessons: [
            lesson("js-1", "Variables and functions", "JavaScript stores values in variables and reuses logic in functions.", [
                "Use const for values that do not change and let for values that do.",
                "Functions take inputs and return a result.",
            ], `const add = (a, b) => a + b;\nconsole.log(add(2, 3));`),
        ],
    },
    {
        id: "typescript",
        title: "TypeScript",
        blurb: "JavaScript with types",
        lessons: [
            lesson("ts-1", "Variables and basic types", "TypeScript adds types so mistakes show up while you write code.", [
                "Add a type after a variable name with a colon.",
                "The most common basic types are string, number, boolean, and arrays like number[].",
            ], `const name: string = "Ada";\nlet age: number = 30;\nlet done: boolean = false;\nconst scores: number[] = [90, 85];`),
            lesson("ts-2", "Functions", "Functions can type their parameters and their return value.", [
                "Typed parameters stop you from passing the wrong kind of data.",
                "Add a return type after the parentheses. Use ? for an optional parameter.",
            ], `function greet(name: string, excited?: boolean): string {\n  return excited ? "Hi " + name + "!" : "Hi " + name;\n}`),
            lesson("ts-3", "Interfaces and type aliases", "Both describe the shape of an object.", [
                "An interface lists the properties an object must have.",
                "A type alias can name any type, including unions such as \"admin\" | \"user\".",
            ], `interface User {\n  id: number;\n  name: string;\n  email?: string;\n}\n\ntype Role = "admin" | "user";`),
            lesson("ts-4", "Arrays and objects", "Arrays hold lists of one type, and objects group named values.", [
                "Write Array<T> or T[] for a list of T.",
                "Object types check every property you read or write.",
            ], `const names: string[] = ["Ada", "Linus"];\nconst point: { x: number; y: number } = { x: 1, y: 2 };`),
            lesson("ts-5", "Classes", "Classes bundle data and behaviour, with access modifiers.", [
                "Use private to hide a property from code outside the class.",
                "Constructor parameter properties declare and assign fields in one step.",
            ], `class Counter {\n  private count = 0;\n  increment(): number {\n    return ++this.count;\n  }\n}`),
            lesson("ts-6", "Generics", "Generics let one function or type work with many types safely.", [
                "A type parameter like T is a placeholder that is filled in when you use it.",
                "TypeScript usually infers T from the argument you pass.",
            ], `function first<T>(items: T[]): T {\n  return items[0];\n}\n\nconst n = first([1, 2, 3]);`),
            lesson("ts-7", "Async and await", "async functions always return a Promise.", [
                "await pauses until a Promise finishes, so asynchronous code reads top to bottom.",
                "Wrap awaited calls in try/catch to handle failures.",
            ], `async function load(url: string): Promise<string> {\n  const res = await fetch(url);\n  return res.text();\n}`),
        ],
    },
    {
        id: "python",
        title: "Python",
        blurb: "Readable general-purpose coding",
        lessons: [
            lesson("py-1", "Variables and print", "Python uses indentation and needs no type keywords.", [
                "Assign a value with = and show it with print.",
                "Strings can be joined with f-strings.",
            ], `name = "Ada"\nprint(f"Hello, {name}")`),
        ],
    },
];
//# sourceMappingURL=courses.js.map