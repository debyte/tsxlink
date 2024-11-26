export type StyleObject = { [property: string]: string };

export function styleToObject(src: string | null): StyleObject {
  const out: StyleObject = {};
  for (const part of (src || "").split(";")) {
    const d = part.trim();
    if (d !== "") {
      const [property, value] = d.split(":", 2);
      out[toCamelCase(property.trimEnd())] = value.trimStart();
    }
  }
  return out;
}

const dashRegexp = /-(\w|$)/g;

export function toCamelCase(property: string): string {
  const p = property.toLowerCase();
  if (p === "float") {
    return "cssFloat";
  }
  if (p.startsWith("-ms-")) {
    return p.substring(1).replace(dashRegexp, (_, l) => l.toUpperCase());
  }
  return p.replace(dashRegexp, (_, l) => l.toUpperCase());
}
