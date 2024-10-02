import fs from "fs/promises";
import path from "path";
import unzipper from "unzipper";

export const fileExists = async (filePath: string) => {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
};

export const readFile = (filePath: string) => fs.readFile(filePath);

export const readTextFile = (filePath: string) =>
  fs.readFile(filePath, "utf8");

export const writeTextFile = (filePath: string, content: string) =>
  fs.writeFile(filePath, content, "utf8");

export const removeFile = (filePath: string) => fs.unlink(filePath);

export const dirFiles = async (dirPath: string, onlyExtension?: string) => {
  const files = await fs.readdir(dirPath);
  const end = extensionEnding(onlyExtension);
  return files
    .filter(name => !end || name.endsWith(end))
    .map(name => fs.readFile(path.join(dirPath, name)));
};

export const zipFiles = async (filePath: string, onlyExtension?: string) => {
  const dir = await unzipper.Open.file(filePath);
  const end = extensionEnding(onlyExtension);
  return dir.files
    .filter(({ path }) => !end || path.endsWith(end))
    .map(file => file.buffer());
};

export const findFirstFile = async (filePaths: string[]) => {
  for (const filePath of filePaths) {
    if (await fileExists(filePath)) {
      return filePath;
    }
  }
  return null;
};

const extensionEnding = (extension?: string) =>
  extension ? `.${extension}` : null;

export const absPath = (parts: string[], extension?: string) =>
  parts.length > 0
    ? path.resolve(path.join(
      ...parts.slice(0, -1),
      extension ? `${parts.at(-1)!}.${extension}` : parts.at(-1)!,
    )) : "";
