import { Config, RuntimeConfig } from "./types";
export declare const DEFAULT_TARGET_DIR = "./src/components/tsxlink";
export declare const DEFAULT_TARGET_PUBLIC_DIR = "./public/tsxlink";
export declare const applyDefaults: (config: Config) => RuntimeConfig;
export declare const runInteractiveInit: (current?: Config) => Promise<Config>;
