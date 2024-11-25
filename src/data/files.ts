import fs from "fs/promises";
import path from "path";
import unzipper from "unzipper";
import { FileData, FileExistsResult } from "../types";

export async function fileExists(
  filePath: string,
): Promise<FileExistsResult> {
  try {
    const stats = await fs.stat(filePath);
    return { isDirectory: stats.isDirectory() };
  } catch {
    return null;
  }
}

export const readFile = (filePath: string): Promise<Buffer> =>
  fs.readFile(filePath);

export const writeFile = (filePath: string, content: Buffer) =>
  fs.writeFile(filePath, content);

export const readTextFile = (filePath: string): Promise<string> =>
  fs.readFile(filePath, "utf8");

export const writeTextFile = (filePath: string, content: string) =>
  fs.writeFile(filePath, content, "utf8");

export const removeFile = (filePath: string) => fs.unlink(filePath);

export const dirFiles = async (
  dirPath: string,
  select: (name: string, path: string) => boolean,
): Promise<FileData[]> => (await fs.readdir(dirPath, { recursive: true }))
  .filter(name => select(name, path.join(dirPath, name)))
  .map(name => ({
    dirName: path.dirname(name),
    baseName: path.basename(name),
    buffer: fs.readFile(path.join(dirPath, name)),
  }));

export const zipFiles = async (
  filePath: string,
  select: (name: string, path: string) => boolean,
): Promise<FileData[]> => (await unzipper.Open.file(filePath)).files
  .filter(file => select(file.path, file.path))
  .map(file => ({
    dirName: path.dirname(file.path),
    baseName: path.basename(file.path),
    buffer: file.buffer(),
  }));

export const ext = (extension?: string) =>
  extension ? `.${extension.toLowerCase()}` : null;

export const hasExtension = (filePath: string, extension: string): boolean =>
  path.extname(filePath).toLowerCase() === ext(extension);

export const wildcardRegexp = (ignore: string) => new RegExp(
  `^${wcPre(ignore)}${wcPattern(ignore)}${wcPost(ignore)}$`
);
const wcPre = (i: string) => i.includes("/") ? "" : "(.*/)?";
const wcPattern = (src: string) => src
  .replace("?", "[^/]?")
  .replace(/(?<!\*)\*(?!\*)/g, "[^/]*")
  .replace("**/", ".*");
const wcPost = (i: string) => i.endsWith("/") ? "(.*)?" : "(/.*)?";

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

export async function writeFiles(
  dirPath: string,
  files: FileData[],
): Promise<Promise<string>[]> {
  const subDirs = new Set(files.map(f => f.dirName || ""));
  for (const dirName of subDirs) {
    await fs.mkdir(path.join(dirPath, dirName), { recursive: true });
  }
  return files.map(async file => {
    const p = filePath(dirPath, file.baseName, undefined, file.dirName);
    if (file.buffer !== undefined) {
      await writeFile(p, await file.buffer);
    } else {
      await writeTextFile(p, file.content || "");
    }
    return p;
  });
};

export function copyFile(src: FileData, filePath: string): FileData {
  const dirName = path.dirname(filePath);
  const baseName = path.basename(filePath);
  return src.buffer !== undefined
    ? { baseName, buffer: src.buffer, dirName }
    : { baseName, content: src.content || "", dirName }
}

export async function removeMissingFiles(
  dirPath: string,
  keepFilePaths: string[],
): Promise<Promise<string>[]> {
  return (await dirFiles(dirPath, (_, p) => !keepFilePaths.includes(p))).map(
    async file => {
      const p = filePath(dirPath, file.baseName, undefined, file.dirName);
      await removeFile(p);
      return p;
    }
  );
}
