import { Config, RuntimeConfig } from "./types";
export declare const DEFAULT_COMPONENT_DIR = "./src/components/tsxlink";
export declare const DEFAULT_ASSETS_DIR = "./public/tsxlink";
export declare const DEFAULT_ASSETS_PATH = "/tsxlink";
export declare const DEFAULT_STYLE_FILE = "export.css";
export declare function applyDefaults(config: Config): RuntimeConfig;
export declare function runInteractiveInit(current?: Config): Promise<Config>;
