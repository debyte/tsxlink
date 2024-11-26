import { CssFilterAndFixUrls } from "../data/CssFilterAndFixUrls";
import { CopyFile } from "../types";

export type StyleObject = { [property: string]: string };

export function styleToObject(
  src: string | null,
  imageDir: string,
): [styles: StyleObject, copy: CopyFile[]] {
  const out: StyleObject = {};
  const copy: CopyFile[] = [];
  for (const part of (src || "").split(";")) {
    const d = part.trim();
    if (d !== "") {
      const [property, rawValue] = d.split(":", 2);
      const [value, cp] = CssFilterAndFixUrls.runValue(
        rawValue.trimStart(), imageDir
      );
      out[toCamelCase(property.trimEnd())] = value;
      copy.push(...cp);
    }
  }
  return [out, copy];
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
