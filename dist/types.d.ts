export type Config = {
    version?: number;
    sourceType?: SourceType;
    source?: string;
    targetDir?: string;
    targetPublicDir?: string;
    writeCssFiles?: boolean;
    writeJsFiles?: boolean;
    configExtension?: ConfigExtension;
};
export type RuntimeConfig = {
    version: number;
    sourceType: SourceType;
    source?: string;
    targetDir: string;
    targetPublicDir: string;
    writeCssFiles: boolean;
    writeJsFiles: boolean;
};
export type SourceType = "custom" | "webflow/export";
export type ConfigExtension = "mjs" | "cjs" | "js" | "json";
export type Component = {
    name: string;
    props: Prop[];
    template: string;
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
};
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
