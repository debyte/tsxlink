export type StyleObject = {
    [property: string]: string;
};
export declare function styleToObject(src: string | null): StyleObject;
export declare function toCamelCase(property: string): string;
