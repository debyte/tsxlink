import { DocPool } from "./DocPool";
import { fileExists, hasExtension } from "./files";

export const createDocPool = async (
  source: string,
): Promise<DocPool | null> => {
  if (source.match(/^https?:\/\/\w+/)) {
    return new DocPool({ type: "url", data: source });
  }
  const stats = await fileExists(source);
  if (stats === null) {
    return null;
  }
  if (stats.isDirectory) {
    return new DocPool({ type: "dir", data: source });
  }
  if (hasExtension(source, "zip")) {
    return new DocPool({ type: "zip", data: source });
  }
  return new DocPool({ type: "file", data: source });
};
