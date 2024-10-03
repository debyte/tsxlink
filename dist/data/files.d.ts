import { FileData, FileExistsResult } from "../types";
export declare const fileExists: (filePath: string) => Promise<FileExistsResult>;
export declare const readFile: (filePath: string) => Promise<Buffer>;
export declare const writeFile: (filePath: string, content: Buffer) => Promise<void>;
export declare const readTextFile: (filePath: string) => Promise<string>;
export declare const writeTextFile: (filePath: string, content: string) => Promise<void>;
export declare const removeFile: (filePath: string) => Promise<void>;
export declare const dirFiles: (dirPath: string, onlyExtension?: string) => Promise<FileData[]>;
export declare const zipFiles: (filePath: string, onlyExtension?: string) => Promise<FileData[]>;
export declare const hasExtension: (filePath: string, extension: string) => boolean;
export declare const absPath: (pathName: string | undefined, baseName: string, extension?: string) => string;
export declare const writeFiles: (dirPath: string, files: FileData[]) => Promise<Promise<string>[]>;
export declare const removeMissingFiles: (dirPath: string, keepFileNames: string[]) => Promise<Promise<string>[]>;
