import path from "path";

export const ext = (extension?: string) =>
  extension ? `.${extension.toLowerCase()}` : null;

export const hasExtension = (filePath: string, extension: string): boolean =>
  path.extname(filePath).toLowerCase() === ext(extension);

export const baseName = (filePath: string): string => path.basename(filePath);

export function filePath(
  pathName: string | undefined,
  baseName: string,
  extension?: string,
  dirName?: string,
): string {
  const p = pathName || ".";
  const f = extension ? `${baseName}${ext(extension)}` : baseName
  return path.join(p, dirName || "", f);
}

export function relativePath(from: string, to: string): string {
  let p = from;
  let rStart = ".";
  while (!to.startsWith(p) && p !== ".") {
    p = path.dirname(p);
    rStart = path.join(rStart, "..");
  }
  const rEnd = p !== "." ? to.substring(p.length + 1) : to;
  return path.join(rStart, rEnd);
}

export function urlToFilePath(url: string | null): string | null {
  if (url && !url.startsWith("#") && !url.match(/^\w+:.*/)) {
    const parts = url.match(/^([^?#]+)(.*)$/);
    if (parts && parts[1]) {
      return parts[1];
    }
  }
  return null;
}

export function srcSetToFilePaths(srcset: string | null): (string | null)[] {
  const paths: (string | null)[] = [];
  if (srcset) {
    for (const entry of srcset.split(",")) {
      const [src] = entry.trim().split(" ", 2);
      paths.push(urlToFilePath(src));
    }
  }
  return paths;
}

export function wildcardFileRegexp(match: string): RegExp {

  // If no slashes, match against base name
  const b = match.includes("/") ? "" : "(.*/)?";

  // Wildcard matching
  const m = match
    .replace("?", "[^/]?")
    .replace(/(?<!\*)\*(?!\*)/g, "[^/]*")
    .replace("**/", ".*");

  // Match possible subdirs
  const e = match.endsWith("/") ? ".*" : "(/.*)?";
  return new RegExp(`^${b}${m}${e}$`);
}

export function fileToId(fileName: string): string {
  const id = fileName.replace(/[.\-@$]/g, "_");
  if (id.match(/^\d/)) {
    return `id${id}`;
  }
  return id;
}
