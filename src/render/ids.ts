export function safeId(name: string) {
  if (RESERVED_WORDS.has(name)) {
    return `prop_${name}`;
  }
  if (name.match(/^[a-zA-Z_$][\w$]*$/) === null) {
    return `prop_${name.replace(/\W/g, "")}`
  }
  return name;
}

const RESERVED_WORDS = new Map([
  "break", "case", "catch", "class", "const", "continue", "debugger", "default",
  "delete", "do", "else", "export", "extends", "false", "finally", "for",
  "function", "if", "import", "in", "instanceof", "new", "null", "return",
  "super", "switch", "this", "throw", "true", "try", "typeof", "var", "void",
  "while", "with", "let", "static", "yield", "await", "enum", "implements",
  "interface", "package", "private", "protected", "public", "abstract",
  "boolean", "byte", "char", "double", "final", "float", "goto", "int", "long",
  "native", "short", "synchronized", "throws", "transient", "volatile",
  "arguments", "async", "eval", "styles"
].map(n => [n, true]));
