import fs from "fs/promises";
import path from "path";
import unzipper from "unzipper";
import { FileData, FileExistsResult } from "../types";
import { filePath } from "./paths";

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

export async function dirFiles(
  dirPath: string,
  select: (name: string, path: string) => boolean,
): Promise<FileData[]> {
  const files: FileData[] = [];
  for (const filePath of await fs.readdir(dirPath, { recursive: true })) {
    const p = path.join(dirPath, filePath);
    if (select(filePath, p) && (await fs.lstat(p)).isFile()) {
      files.push({
        dirName: path.dirname(filePath),
        baseName: path.basename(filePath),
        buffer: fs.readFile(p),
      });
    }
  }
  return files;
}

export async function zipFiles(
  filePath: string,
  select: (name: string, path: string) => boolean,
): Promise<FileData[]> {
  const files: FileData[] = [];
  for (const file of (await unzipper.Open.file(filePath)).files) {
    if (select(file.path, file.path)) {
      files.push({
        dirName: path.dirname(file.path),
        baseName: path.basename(file.path),
        buffer: file.buffer(),
      });
    }
  }
  return files;
}

export function emptyFiles(names: string[]): FileData[] {
  return names.map(p => ({
    dirName: path.dirname(p),
    baseName: path.basename(p),
    content: "",
  }));
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
