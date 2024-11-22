import { Config, RuntimeConfig } from "./types";
export declare const DEFAULT_COMPONENT_DIR = "./src/components/tsxlink";
export declare const DEFAULT_ASSETS_DIR = "./src/app/tsxlink";
export declare const DEFAULT_STYLE_FILE = "export.css";
export declare const DEFAULT_IMAGE_DIR = "images";
export declare const applyDefaults: (config: Config) => RuntimeConfig;
export declare const runInteractiveInit: (current?: Config) => Promise<Config>;
