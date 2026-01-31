// Fallback question bank used when no AI provider is configured.
// This keeps the feature functional in dev environments without API keys.
// NOTE: This is intentionally small; production should rely on AI generation.

export const FALLBACK_QUESTION_BANK = {
  "javascript": {
    easy: [
      {
        text: "Which keyword declares a block-scoped variable?",
        options: ["var", "let", "function", "constantly"],
        correctIndex: 1,
      },
      {
        text: "What is the result of typeof null in JavaScript?",
        options: ["null", "object", "undefined", "number"],
        correctIndex: 1,
      },
      {
        text: "Which method converts JSON string to an object?",
        options: ["JSON.parse", "JSON.stringify", "Object.toJSON", "parse.JSON"],
        correctIndex: 0,
      },
      {
        text: "Which operator checks both value and type equality?",
        options: ["==", "=", "===", "!=="],
        correctIndex: 2,
      },
      {
        text: "Which array method creates a new array with filtered elements?",
        options: ["map", "filter", "forEach", "push"],
        correctIndex: 1,
      },
    ],
    medium: [
      {
        text: "What does Array.prototype.map return?",
        options: ["The same array", "A new array", "A number", "A boolean"],
        correctIndex: 1,
      },
      {
        text: "Which statement about promises is correct?",
        options: ["Promises are always synchronous", "Promises can be pending/fulfilled/rejected", "Promises block the event loop", "Promises replace closures"],
        correctIndex: 1,
      },
      {
        text: "What is a closure?",
        options: ["A loop", "A function with access to its outer scope", "A data type", "A DOM element"],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "Which is true about the JavaScript event loop?",
        options: ["Microtasks run after macrotasks", "Microtasks run before macrotasks", "Timers always run immediately", "Promises are macrotasks"],
        correctIndex: 1,
      },
      {
        text: "What is the purpose of WeakMap?",
        options: ["Keys must be strings", "Keys are weakly referenced objects", "It is immutable", "It stores DOM nodes only"],
        correctIndex: 1,
      },
    ],
  },
};

export function normalizeSkillName(skillName) {
  return String(skillName || "")
    .trim()
    .toLowerCase();
}
