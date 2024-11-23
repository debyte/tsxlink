export type Config = {
    version?: number;
    sourceType?: SourceType;
    source?: string;
    exportStyleElements?: boolean;
    copyCssFiles?: boolean;
    copyJsFiles?: boolean;
    componentDir?: string;
    assetsDir?: string;
    styleFile?: string;
    imageDir?: string;
    ignoreFiles?: string[];
    ignoreStyles?: string[];
    configExtension?: ConfigExtension;
};
export type RuntimeConfig = {
    version: number;
    sourceType: SourceType;
    source?: string;
    exportStyleElements: boolean;
    copyCssFiles: boolean;
    copyJsFiles: boolean;
    componentDir: string;
    assetsDir: string;
    styleFile: string;
    imageDir: string;
    ignoreFiles: string[];
    ignoreStyles: string[];
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
    template: string;
    rootVisibility?: string;
};
export type Prop = {
    name: string;
    type: PropType;
    target: string;
    elementClass: string;
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
