"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
export type ClassSelection = { [cls: string]: boolean };

export function classResolve(
  classes?: ClassSelection,
  defaults?: ClassSelection,
): string {
  const resolved = { ...defaults || {}, ...classes || {} };
  return Object.keys(resolved).reduce(
    (className, k) => resolved[k] ? \`\${className} \${k}\` : className,
  );
}
`;
