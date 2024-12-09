import { kebabToCamelCase } from "../data/strings";

export type StyleObject = { [property: string]: string };

export function styleToObject(src: string): StyleObject {
  const out: StyleObject = {};
  for (const part of src.split(";")) {
    const d = part.trim();
    if (d !== "") {
      const [property, value] = d.split(":", 2);
      out[toCamelCase(property.trimEnd())] = value.trimStart();
    }
  }
  return out;
}

export function toCamelCase(property: string): string {
  const p = property.toLowerCase();
  if (p === "float") {
    return "cssFloat";
  }
  if (p.startsWith("-ms-")) {
    return kebabToCamelCase(p.substring(1));
  }
  return kebabToCamelCase(p);
}

export type ClassNameObject = { [name: string]: boolean };

export function classNamesToObject(src: string) {
  const out: ClassNameObject = {};
  for (const name of src.split(" ")) {
    out[name.trim()] = true;
  }
  return out;
}

export function classNamesJson(src: string) {
  return JSON.stringify(classNamesToObject(src), null, 2);
}
