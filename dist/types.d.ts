export type Config = {
    version?: number;
    sourceType?: SourceType;
    source?: string;
    copyCssFiles?: boolean;
    copyJsFiles?: boolean;
    exportStyleElements?: boolean;
    useNextJsImages?: boolean;
    componentDir?: string;
    assetsDir?: string;
    assetsPath?: string;
    styleFile?: string;
    ignoreFiles?: string[];
    dropStyles?: string[];
    dropAttributes?: string[];
    configExtension?: ConfigExtension;
};
export type RuntimeConfig = {
    version: number;
    sourceType: SourceType;
    source?: string;
    copyCssFiles: boolean;
    copyJsFiles: boolean;
    exportStyleElements: boolean;
    useNextJsImages: boolean;
    componentDir: string;
    assetsDir: string;
    assetsPath: string;
    styleFile: string;
    ignoreFiles: string[];
    dropStyles: string[];
    dropAttributes: string[];
};
export type SourceType = "custom" | "webflow/export";
export type ConfigExtension = "mjs" | "cjs" | "js" | "json";
export type InitChoice = {
    key: keyof Config;
    prompt: string;
    options?: InitChoiceOption[];
    default?: string;
};
export type InitChoiceOption = [
    key: string,
    description: string,
    isDefault?: boolean
];
export type Component = {
    name: string;
    props: Prop[];
    template: Element;
};
export type Prop = {
    name: string;
    type: PropType;
    target: string;
    element: Element;
    data?: string;
};
export type PropType = "string" | "number" | "boolean" | "fixed";
export type DocSource = {
    type: "string" | "file" | "zip" | "dir" | "url";
    data: string;
};
export type FileExistsResult = {
    isDirectory: boolean;
} | null;
export type FileData = {
    baseName: string;
    buffer?: Promise<Buffer>;
    content?: string;
    dirName?: string;
};
export type CopyFile = {
    from: string;
    to: string;
};
