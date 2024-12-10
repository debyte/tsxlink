export declare const ext: (extension?: string) => string | null;
export declare const hasExtension: (filePath: string, extension: string) => boolean;
export declare const baseName: (filePath: string) => string;
export declare function filePath(pathName: string | undefined, baseName: string, extension?: string, dirName?: string): string;
export declare function relativePath(from: string, to: string): string;
export declare function urlToFilePath(url: string | null): string | null;
export declare function srcSetToFilePaths(srcset: string | null): (string | null)[];
export declare function wildcardFileRegexp(match: string): RegExp;
export declare function fileToId(fileName: string): string;
