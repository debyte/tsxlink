import { FileData, FileExistsResult } from "../types";
export declare function fileExists(filePath: string): Promise<FileExistsResult>;
export declare const readFile: (filePath: string) => Promise<Buffer>;
export declare const writeFile: (filePath: string, content: Buffer) => Promise<void>;
export declare const readTextFile: (filePath: string) => Promise<string>;
export declare const writeTextFile: (filePath: string, content: string) => Promise<void>;
export declare const removeFile: (filePath: string) => Promise<void>;
export declare const dirFiles: (dirPath: string, select: (name: string) => boolean) => Promise<FileData[]>;
export declare const zipFiles: (filePath: string, select: (name: string) => boolean) => Promise<FileData[]>;
export declare const ext: (extension?: string) => string | null;
export declare const hasExtension: (filePath: string, extension: string) => boolean;
export declare const wildcardRegexp: (ignore: string) => RegExp;
export declare function absPath(pathName: string | undefined, baseName: string, extension?: string, dirName?: string): string;
export declare function writeFiles(dirPath: string, files: FileData[]): Promise<Promise<string>[]>;
export declare const copyFile: (src: FileData, baseName: string, dirName?: string) => FileData;
export declare function removeMissingFiles(dirPath: string, keepFileNames: string[]): Promise<Promise<string>[]>;
