export type StyleObject = {
    [property: string]: string;
};
export declare function styleToObject(src: string): StyleObject;
export declare function toCamelCase(property: string): string;
export type ClassNameObject = {
    [name: string]: boolean;
};
export declare function classNamesToObject(src: string): ClassNameObject;
export declare function classNamesJson(src: string): string;
