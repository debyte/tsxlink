import { CopyFile } from "../types";
export type StyleObject = {
    [property: string]: string;
};
export declare function styleToObject(src: string | null, assetsPath: string): [styles: StyleObject, copy: CopyFile[]];
export declare function toCamelCase(property: string): string;
