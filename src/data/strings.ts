export const r = (...rows: (string | false | (string | false)[])[]) =>
  rows.flatMap(r => r).filter(r => r !== false).join("\n");

export function wildcardRegexp(match: string): RegExp {
  const m = match
    .replace(/(?<!\\)\?/g, ".?")
    .replace(/(?<!\\)\*/g, ".*");
  return new RegExp(`^${m}$`);
}

const kebabRegexp = /-(\w|$)/g;

export function kebabToCamelCase(src: string): string {
  return src.replace(kebabRegexp, (_, l) => l.toUpperCase());
}
