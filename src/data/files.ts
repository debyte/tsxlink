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
  select: (name: string) => boolean,
): Promise<FileData[]> => (await fs.readdir(dirPath))
  .filter(name => select(name))
  .map(
    name => ({
      baseName: name,
      buffer: fs.readFile(path.join(dirPath, name)),
    })
  );

export const zipFiles = async (
  filePath: string,
  select: (name: string) => boolean,
): Promise<FileData[]> => (await unzipper.Open.file(filePath)).files
  .filter(file => select(file.path))
  .map(
    file => ({
      baseName: path.basename(file.path),
      buffer: file.buffer(),
    })
  );

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

export function absPath(
  pathName: string | undefined,
  baseName: string,
  extension?: string,
  dirName?: string,
): string {
  const p = pathName || ".";
  const f = extension ? `${baseName}${ext(extension)}` : baseName
  return path.resolve(dirName ? path.join(p, dirName, f) : path.join(p, f));
}

export async function writeFiles(
  dirPath: string,
  files: FileData[],
): Promise<Promise<string>[]> {
  await fs.mkdir(dirPath, { recursive: true });
  return files.map(async file => {
    if (file.dirName !== undefined) {
      await fs.mkdir(path.join(dirPath, file.dirName), { recursive: true });
    }
    const filePath = absPath(dirPath, file.baseName, undefined, file.dirName);
    if (file.buffer !== undefined) {
      await writeFile(filePath, await file.buffer);
    } else {
      await writeTextFile(filePath, file.content || "");
    }
    return file.baseName;
  });
};

export const copyFile = (
  src: FileData,
  baseName: string,
  dirName?: string,
): FileData => (src.buffer !== undefined
  ? { baseName, buffer: src.buffer, dirName }
  : { baseName, content: src.content || "", dirName }
);

export async function removeMissingFiles(
  dirPath: string,
  keepFileNames: string[],
): Promise<Promise<string>[]> {
  return (await dirFiles(dirPath, n => !keepFileNames.includes(n))).map(
    async file => {
      await removeFile(path.join(dirPath, file.baseName));
      return file.baseName;
    }
  );
}
