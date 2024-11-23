import { DocPool } from "./DocPool";
import { fileExists, hasExtension } from "./files";

export async function createDocPool(
  source: string,
  ignore: string[],
): Promise<DocPool | null> {
  if (source.match(/^https?:\/\/\w+/)) {
    return new DocPool({ type: "url", data: source }, ignore);
  }
  const stats = await fileExists(source);
  if (stats === null) {
    return null;
  }
  if (stats.isDirectory) {
    return new DocPool({ type: "dir", data: source }, ignore);
  }
  if (hasExtension(source, "zip")) {
    return new DocPool({ type: "zip", data: source }, ignore);
  }
  return new DocPool({ type: "file", data: source }, ignore);
};
