export type ClassSelection = {
    [cls: string]: boolean;
};
export declare function classResolve(classes: ClassSelection, defaults?: ClassSelection): string;
