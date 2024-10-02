export type Config = {
    version?: number;
    sourceType?: SourceType;
    source?: string;
    targetDir?: string;
    targetPublicDir?: string;
    copyCSS?: boolean;
    copyJS?: boolean;
    configExtension?: ConfigExtension;
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
