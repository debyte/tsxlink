import fs from "fs/promises";
import path from "path";
import unzipper from "unzipper";
import { FileData, FileExistsResult } from "../types";

export const fileExists = async (
  filePath: string,
): Promise<FileExistsResult> => {
  try {
    const stats = await fs.stat(filePath);
    return { isDirectory: stats.isDirectory() };
  } catch {
    return null;
  }
};

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
  ignore: RegExp[],
  onlyExtension?: string,
): Promise<FileData[]> => {
  const end = extensionEnding(onlyExtension);
  return (
    await fs.readdir(dirPath)
  ).filter(
    name => (!end || name.toLowerCase().endsWith(end))
      && ignore.every(r => !r.test(name))
  ).map(
    name => ({
      baseName: name,
      buffer: fs.readFile(path.join(dirPath, name)),
    })
  );
};

export const zipFiles = async (
  filePath: string,
  ignore: RegExp[],
  onlyExtension?: string,
): Promise<FileData[]> => {
  const end = extensionEnding(onlyExtension);
  return (
    await unzipper.Open.file(filePath)
  ).files.filter(
    file => (!end || file.path.toLowerCase().endsWith(end))
      && ignore.every(r => !r.test(file.path))
  ).map(
    file => ({
      baseName: path.basename(file.path),
      buffer: file.buffer(),
    })
  );
};

const extensionEnding = (extension?: string) =>
  extension ? `.${extension.toLowerCase()}` : null;

export const hasExtension = (filePath: string, extension: string): boolean =>
  path.extname(filePath).toLowerCase() === `.${extension.toLowerCase()}`;

export const wildcardRegexp = (ignore: string) => new RegExp(
  ignore.includes("/")
    ? `^${starsAndQuestionMarks(ignore)}(.*)?$`
    : `^(.*/)?${starsAndQuestionMarks(ignore)}$`
);

const starsAndQuestionMarks = (src: string) => src
  .replace("?", "[^/]?")
  .replace(/(?<!\*)\*(?!\*)/g, "[^/]*")
  .replace("**/", ".*");

export const absPath = (
  pathName: string | undefined,
  baseName: string,
  extension?: string,
) => path.resolve(
  path.join(
    pathName || ".",
    extension ? `${baseName}.${extension.toLowerCase()}` : baseName,
  )
);

export const writeFiles = async (
  dirPath: string,
  files: FileData[],
): Promise<Promise<string>[]> => {
  await fs.mkdir(dirPath, { recursive: true });
  return files.map(async file => {
    const path = absPath(dirPath, file.baseName);
    if (file.buffer !== undefined) {
      await writeFile(path, await file.buffer);
    } else {
      await writeTextFile(path, file.content || "");
    }
    return file.baseName;
  });
};

export const removeMissingFiles = async (
  dirPath: string,
  keepFileNames: string[],
): Promise<Promise<string>[]> =>
  (await dirFiles(dirPath, [])).filter(
    file => !keepFileNames.includes(file.baseName)
  ).map(
    async file => {
      await removeFile(path.join(dirPath, file.baseName));
      return file.baseName;
    }
  );
