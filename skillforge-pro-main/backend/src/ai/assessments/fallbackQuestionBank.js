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

  "react": {
    easy: [
      {
        text: "What is JSX?",
        options: [
          "A database query language",
          "A syntax extension for JavaScript used with React",
          "A CSS framework",
          "A Java runtime",
        ],
        correctIndex: 1,
      },
      {
        text: "Which hook is used for component state?",
        options: ["useFetch", "useState", "useStore", "useClass"],
        correctIndex: 1,
      },
      {
        text: "Props in React are…",
        options: ["Mutable state", "Read-only inputs to a component", "Database records", "Only used in class components"],
        correctIndex: 1,
      },
      {
        text: "Which method renders a list in React?",
        options: ["for", "map", "reduce", "find"],
        correctIndex: 1,
      },
      {
        text: "What is the purpose of the key prop in lists?",
        options: ["To apply CSS", "To help React identify items during reconciliation", "To encrypt data", "To enable routing"],
        correctIndex: 1,
      },
    ],
    medium: [
      {
        text: "When does useEffect run by default?",
        options: ["Only once", "After every render", "Before render", "Only on unmount"],
        correctIndex: 1,
      },
      {
        text: "Which statement about controlled components is correct?",
        options: [
          "They manage form state in the DOM only",
          "Their value is driven by React state",
          "They cannot handle input events",
          "They require class components",
        ],
        correctIndex: 1,
      },
      {
        text: "What is React reconciliation?",
        options: [
          "A CSS reset",
          "Process React uses to update the DOM efficiently",
          "A build step in Webpack",
          "A database migration",
        ],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "Which is a common cause of unnecessary re-renders?",
        options: [
          "Using stable memoized callbacks",
          "Creating new object/array props on every render",
          "Using React.memo",
          "Using keys in lists",
        ],
        correctIndex: 1,
      },
      {
        text: "What does StrictMode do in development?",
        options: [
          "Enables production optimizations",
          "Runs certain lifecycle methods/effects twice to highlight side effects",
          "Disables hooks",
          "Automatically fixes bugs",
        ],
        correctIndex: 1,
      },
    ],
  },

  "node.js": {
    easy: [
      {
        text: "Node.js is built on which JavaScript engine?",
        options: ["SpiderMonkey", "V8", "JavaScriptCore", "Chakra"],
        correctIndex: 1,
      },
      {
        text: "Which module system is commonly used in Node.js (legacy)?",
        options: ["CommonJS (require)", "AMD", "SystemJS", "None"],
        correctIndex: 0,
      },
      {
        text: "What does npm stand for?",
        options: ["Node Package Manager", "New Programming Method", "Network Package Module", "Node Program Maker"],
        correctIndex: 0,
      },
      {
        text: "Which statement about Node.js is correct?",
        options: ["It is multi-threaded by default for JS code", "It uses an event-driven, non-blocking I/O model", "It is a database", "It only runs in browsers"],
        correctIndex: 1,
      },
      {
        text: "Which API is used to read environment variables?",
        options: ["process.env", "env.process", "node.env", "system.env"],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        text: "What is the purpose of the event loop in Node.js?",
        options: ["Compile TypeScript", "Handle asynchronous callbacks", "Encrypt HTTP traffic", "Manage CSS rendering"],
        correctIndex: 1,
      },
      {
        text: "Which is a best practice for handling async errors in Express?",
        options: ["Throw inside setTimeout", "Use an async handler wrapper and next(err)", "Ignore errors", "Only use try/catch in routers"],
        correctIndex: 1,
      },
      {
        text: "What does a Promise rejection represent?",
        options: ["Successful completion", "An error/failed async operation", "A sync operation", "A database row"],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "Why should CPU-heavy work be avoided on the Node.js main thread?",
        options: ["It increases memory", "It blocks the event loop and delays other requests", "It improves throughput", "It has no effect"],
        correctIndex: 1,
      },
      {
        text: "What is backpressure in Node.js streams?",
        options: ["A network firewall", "A signal to slow down writes when the consumer is overwhelmed", "A CPU throttle", "A JSON schema"],
        correctIndex: 1,
      },
    ],
  },

  "sql": {
    easy: [
      {
        text: "Which SQL clause is used to filter rows?",
        options: ["WHERE", "ORDER BY", "GROUP BY", "LIMIT"],
        correctIndex: 0,
      },
      {
        text: "Which keyword is used to sort results?",
        options: ["SORT", "ORDER BY", "GROUP", "RANK"],
        correctIndex: 1,
      },
      {
        text: "Which statement inserts a row?",
        options: ["ADD", "INSERT INTO", "PUT", "APPEND"],
        correctIndex: 1,
      },
      {
        text: "What does COUNT(*) return?",
        options: ["Sum of values", "Number of rows", "Average", "Maximum"],
        correctIndex: 1,
      },
      {
        text: "Which join returns matching rows from both tables?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        text: "What is a primary key?",
        options: ["A column that can be NULL", "A unique identifier for table rows", "A temporary index", "A stored procedure"],
        correctIndex: 1,
      },
      {
        text: "Which is true about GROUP BY?",
        options: ["It filters rows before aggregation", "It groups rows to apply aggregate functions", "It sorts automatically", "It creates a new table"],
        correctIndex: 1,
      },
      {
        text: "Which clause filters aggregated results?",
        options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "What is a transaction primarily used for?",
        options: ["Faster queries", "ACID guarantees for a sequence of operations", "Creating backups", "Rendering UI"],
        correctIndex: 1,
      },
      {
        text: "Which isolation level best prevents dirty reads?",
        options: ["READ UNCOMMITTED", "READ COMMITTED", "READ WRITE", "NOLOCK"],
        correctIndex: 1,
      },
    ],
  },

  "java": {
    easy: [
      {
        text: "Which keyword is used to define a class in Java?",
        options: ["class", "struct", "object", "define"],
        correctIndex: 0,
      },
      {
        text: "Which is the correct entry point method signature?",
        options: [
          "public static void main(String[] args)",
          "static public int main()",
          "public void main(String args)",
          "main()",
        ],
        correctIndex: 0,
      },
      {
        text: "Which type is used for whole numbers?",
        options: ["int", "float", "double", "boolean"],
        correctIndex: 0,
      },
      {
        text: "What does JVM stand for?",
        options: ["Java Virtual Machine", "Java Variable Method", "Just Verified Memory", "Java Version Manager"],
        correctIndex: 0,
      },
      {
        text: "Which access modifier makes a member visible only within the same class?",
        options: ["public", "protected", "private", "default"],
        correctIndex: 2,
      },
    ],
    medium: [
      {
        text: "What is method overloading?",
        options: [
          "Same method name with different parameters",
          "Same method name with same parameters",
          "Same class name in different packages",
          "Overriding a constructor",
        ],
        correctIndex: 0,
      },
      {
        text: "Which collection does not allow duplicates?",
        options: ["List", "Set", "ArrayList", "Queue"],
        correctIndex: 1,
      },
      {
        text: "What is an interface in Java?",
        options: ["A concrete class", "A contract of methods to implement", "A database table", "A package"],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "Which statement about Java garbage collection is true?",
        options: [
          "Developers manually free all memory",
          "The JVM automatically reclaims unreachable objects",
          "GC only runs on program exit",
          "GC is disabled by default",
        ],
        correctIndex: 1,
      },
      {
        text: "What does the 'volatile' keyword guarantee?",
        options: [
          "Atomic increments",
          "Visibility of changes across threads",
          "Faster execution",
          "Compile-time constants",
        ],
        correctIndex: 1,
      },
    ],
  },

  "typescript": {
    easy: [
      {
        text: "TypeScript is primarily a superset of which language?",
        options: ["Java", "JavaScript", "Python", "C#"],
        correctIndex: 1,
      },
      {
        text: "Which keyword declares a variable with a type annotation?",
        options: ["type", "let", "interface", "implements"],
        correctIndex: 1,
      },
      {
        text: "What does the TypeScript compiler produce?",
        options: ["Bytecode", "JavaScript", "Machine code", "CSS"],
        correctIndex: 1,
      },
      {
        text: "Which is a valid TypeScript type?",
        options: ["number", "integer", "decimal", "real"],
        correctIndex: 0,
      },
      {
        text: "Which file extension is commonly used for TypeScript React components?",
        options: [".jsx", ".ts", ".tsx", ".java"],
        correctIndex: 2,
      },
    ],
    medium: [
      {
        text: "What does the 'unknown' type represent?",
        options: [
          "A type that can be assigned to anything without checks",
          "A safer alternative to any that requires narrowing",
          "A type for null only",
          "A type for functions only",
        ],
        correctIndex: 1,
      },
      {
        text: "Which is true about interfaces and type aliases?",
        options: [
          "Interfaces cannot be extended",
          "Type aliases can represent unions/intersections",
          "Interfaces can only describe primitives",
          "Type aliases are runtime objects",
        ],
        correctIndex: 1,
      },
      {
        text: "What does 'as const' do in TypeScript?",
        options: [
          "Makes values mutable",
          "Infers the most specific literal types and readonly",
          "Converts any to unknown",
          "Turns a function into a constant",
        ],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "What is the purpose of conditional types?",
        options: [
          "They conditionally run code at runtime",
          "They select types based on a condition (extends)",
          "They improve garbage collection",
          "They replace generics",
        ],
        correctIndex: 1,
      },
      {
        text: "In generics, what does 'T extends U' mean?",
        options: [
          "T is a runtime subclass of U",
          "T is constrained to types assignable to U",
          "U is always any",
          "T must be a class",
        ],
        correctIndex: 1,
      },
    ],
  },

  "mongodb": {
    easy: [
      {
        text: "MongoDB stores data primarily as…",
        options: ["Rows", "XML", "JSON-like documents (BSON)", "CSV"],
        correctIndex: 2,
      },
      {
        text: "A MongoDB database contains…",
        options: ["Tables", "Collections", "Sheets", "Views only"],
        correctIndex: 1,
      },
      {
        text: "Which command is used to find documents in a collection?",
        options: ["SELECT", "find", "query", "scan"],
        correctIndex: 1,
      },
      {
        text: "Which field is automatically created as a primary identifier?",
        options: ["id", "_id", "pk", "uuid"],
        correctIndex: 1,
      },
      {
        text: "Which operation adds a new document?",
        options: ["insertOne", "addRow", "append", "createTable"],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        text: "What is an index used for in MongoDB?",
        options: [
          "To encrypt documents",
          "To speed up query performance",
          "To increase document size",
          "To disable scans",
        ],
        correctIndex: 1,
      },
      {
        text: "What does $match do in an aggregation pipeline?",
        options: ["Joins collections", "Filters documents", "Sorts documents", "Projects fields"],
        correctIndex: 1,
      },
      {
        text: "Which is true about ObjectId?",
        options: [
          "It is always a number",
          "It includes a timestamp component",
          "It is a UUIDv4 string",
          "It cannot be generated client-side",
        ],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "What does 'writeConcern' control?",
        options: [
          "How writes are acknowledged",
          "Which fields are returned",
          "How many queries run in parallel",
          "How indexes are built",
        ],
        correctIndex: 0,
      },
      {
        text: "In MongoDB replication, what is the primary node responsible for?",
        options: [
          "Serving only reads",
          "Accepting writes and replicating them to secondaries",
          "Storing backups only",
          "Building UI views",
        ],
        correctIndex: 1,
      },
    ],
  },

  "express": {
    easy: [
      {
        text: "Express is a framework for which runtime?",
        options: ["Deno", "Node.js", "Browser only", "JVM"],
        correctIndex: 1,
      },
      {
        text: "Which Express method defines a GET route?",
        options: ["app.fetch", "app.get", "app.read", "app.route.getOnly"],
        correctIndex: 1,
      },
      {
        text: "What does res.json() do?",
        options: ["Sends HTML", "Sends JSON response", "Parses JSON body", "Reads a JSON file"],
        correctIndex: 1,
      },
      {
        text: "What is middleware in Express?",
        options: [
          "A database",
          "Functions that run during the request/response lifecycle",
          "A UI component",
          "A Node.js version",
        ],
        correctIndex: 1,
      },
      {
        text: "Which object represents the incoming HTTP request?",
        options: ["req", "res", "next", "app"],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        text: "How do you define error-handling middleware in Express?",
        options: [
          "(req, res) => {}",
          "(err, req, res, next) => {}",
          "(req, next) => {}",
          "(app, err) => {}",
        ],
        correctIndex: 1,
      },
      {
        text: "What does next(err) do?",
        options: [
          "Stops the server",
          "Passes an error to the next error handler",
          "Retries the request",
          "Sends a 200 response",
        ],
        correctIndex: 1,
      },
      {
        text: "Which is true about express.json()?",
        options: [
          "It parses JSON request bodies",
          "It stringifies response bodies",
          "It enables CORS",
          "It validates JWTs",
        ],
        correctIndex: 0,
      },
    ],
    hard: [
      {
        text: "Why should you avoid throwing inside non-awaited async callbacks in Express?",
        options: [
          "It improves performance",
          "It can bypass Express error handling and crash the process",
          "It is required for JSON parsing",
          "It enables streaming",
        ],
        correctIndex: 1,
      },
      {
        text: "What is a common strategy to handle async route errors?",
        options: [
          "Disable promises",
          "Wrap async handlers and forward errors to next",
          "Use only callbacks",
          "Return errors as strings",
        ],
        correctIndex: 1,
      },
    ],
  },

  "html": {
    easy: [
      {
        text: "HTML stands for…",
        options: ["HyperText Markup Language", "HighText Markdown Language", "HyperTransfer Markup Link", "Home Tool Markup Language"],
        correctIndex: 0,
      },
      {
        text: "Which tag is used for the largest heading by default?",
        options: ["<head>", "<h1>", "<title>", "<header>"],
        correctIndex: 1,
      },
      {
        text: "Which attribute provides alternative text for images?",
        options: ["src", "alt", "href", "title"],
        correctIndex: 1,
      },
      {
        text: "Which tag is used to create a hyperlink?",
        options: ["<a>", "<link>", "<href>", "<url>"],
        correctIndex: 0,
      },
      {
        text: "Which element is a semantic container for navigation links?",
        options: ["<div>", "<nav>", "<span>", "<section>"],
        correctIndex: 1,
      },
    ],
    medium: [
      {
        text: "What is the purpose of the <form> element?",
        options: ["Layout only", "Collect and submit user input", "Render SVG", "Load scripts"],
        correctIndex: 1,
      },
      {
        text: "Which is true about semantic HTML?",
        options: [
          "It improves accessibility and structure",
          "It is required for CSS to work",
          "It replaces JavaScript",
          "It makes pages load instantly",
        ],
        correctIndex: 0,
      },
      {
        text: "What does the <meta charset=\"utf-8\"> tag do?",
        options: ["Sets page title", "Declares document character encoding", "Loads fonts", "Enables caching"],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "Which attribute helps associate a <label> with an input?",
        options: ["for (label) and id (input)", "name and value", "class and style", "href and src"],
        correctIndex: 0,
      },
      {
        text: "What is the main benefit of using correct heading hierarchy (h1→h6)?",
        options: ["Faster CPU", "Better accessibility/SEO structure", "Smaller images", "More CSS features"],
        correctIndex: 1,
      },
    ],
  },

  "css": {
    easy: [
      {
        text: "CSS stands for…",
        options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style System", "Colorful Style Syntax"],
        correctIndex: 1,
      },
      {
        text: "Which property changes text color?",
        options: ["font-style", "color", "text-decoration", "background"],
        correctIndex: 1,
      },
      {
        text: "Which unit is relative to the root font size?",
        options: ["px", "em", "rem", "%"],
        correctIndex: 2,
      },
      {
        text: "Which property controls spacing inside an element?",
        options: ["margin", "padding", "gap", "border"],
        correctIndex: 1,
      },
      {
        text: "Which selector targets an element by id?",
        options: [".name", "#name", "name", "*name"],
        correctIndex: 1,
      },
    ],
    medium: [
      {
        text: "What is the CSS box model?",
        options: [
          "A way to store data",
          "Content, padding, border, and margin layout model",
          "A browser engine",
          "A CSS preprocessor",
        ],
        correctIndex: 1,
      },
      {
        text: "Which is true about flexbox?",
        options: [
          "It is only for text",
          "It helps align and distribute space in a container",
          "It requires JavaScript",
          "It disables responsiveness",
        ],
        correctIndex: 1,
      },
      {
        text: "What does position: absolute do?",
        options: [
          "Keeps element in normal flow",
          "Positions element relative to nearest positioned ancestor",
          "Centers element automatically",
          "Makes element fixed to viewport",
        ],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        text: "What determines which CSS rule wins when multiple match?",
        options: ["File name", "Specificity and source order", "Element size", "Network speed"],
        correctIndex: 1,
      },
      {
        text: "What does 'display: grid' primarily enable?",
        options: ["3D rendering", "Two-dimensional layout with rows and columns", "Font loading", "HTTP caching"],
        correctIndex: 1,
      },
    ],
  },

  "mern stack": {
    easy: [
      {
        text: "What does MERN stand for?",
        options: [
          "MongoDB, Express, React, Node.js",
          "MySQL, Ember, Ruby, Next.js",
          "MongoDB, Electron, Redis, Nginx",
          "Mongoose, Express, Relay, Node",
        ],
        correctIndex: 0,
      },
      {
        text: "Which part of MERN typically runs in the browser?",
        options: ["Node.js", "Express", "React", "MongoDB"],
        correctIndex: 2,
      },
      {
        text: "Which component is the database in MERN?",
        options: ["React", "Express", "MongoDB", "Node.js"],
        correctIndex: 2,
      },
      {
        text: "In a MERN app, which is commonly used to build REST APIs?",
        options: ["React", "Express", "MongoDB", "CSS"],
        correctIndex: 1,
      },
      {
        text: "Which protocol is most commonly used between React frontend and Express backend?",
        options: ["FTP", "HTTP", "SMTP", "SSH"],
        correctIndex: 1,
      },
    ],
    medium: [
      {
        text: "What is a common pattern to avoid CORS issues in development for a MERN app?",
        options: [
          "Disable HTTP",
          "Use a frontend dev-server proxy to the backend",
          "Store tokens in query params",
          "Use only WebSockets",
        ],
        correctIndex: 1,
      },
      {
        text: "Which is a typical authentication approach for MERN APIs?",
        options: ["JWT in Authorization header", "Cookies only without HTTPS", "FTP credentials", "No auth needed"],
        correctIndex: 0,
      },
      {
        text: "What does MVC commonly refer to in an Express backend structure?",
        options: [
          "Model-View-Controller",
          "Mongo-Version-Config",
          "Module-Variable-Class",
          "Main-View-Component",
        ],
        correctIndex: 0,
      },
    ],
    hard: [
      {
        text: "Why should you avoid doing heavy CPU work inside an Express request handler?",
        options: [
          "It improves throughput",
          "It blocks the Node.js event loop and delays other requests",
          "It reduces memory",
          "It only affects MongoDB",
        ],
        correctIndex: 1,
      },
      {
        text: "In MongoDB, why might you prefer indexes for frequently queried fields?",
        options: [
          "To make documents bigger",
          "To speed up queries and reduce collection scans",
          "To enforce JSX rules",
          "To increase API latency",
        ],
        correctIndex: 1,
      },
    ],
  },
};

export function normalizeSkillName(skillName) {
  const raw = String(skillName || "");
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const compact = cleaned.replace(/[\s._-]/g, "");

  // Map common aliases/variants to the bank keys.
  const alias = {
    js: "javascript",
    javascript: "javascript",

    react: "react",
    reactjs: "react",

    node: "node.js",
    nodejs: "node.js",
    "node.js": "node.js",

    ts: "typescript",
    typescript: "typescript",

    mongo: "mongodb",
    mongodb: "mongodb",

    express: "express",
    expressjs: "express",

    html: "html",
    css: "css",

    sql: "sql",
    java: "java",

    mern: "mern stack",
    mernstack: "mern stack",
    "mern stack": "mern stack",
  };

  return alias[cleaned] || alias[compact] || cleaned;
}
