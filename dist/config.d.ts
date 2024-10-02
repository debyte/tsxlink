import { Config, ConfigExtension } from "./types";
export declare const CONFIG_NAME = "tsxlink.config";
export declare const readConfig: () => Promise<Config | null>;
export declare const writeConfig: (ext: ConfigExtension, config: Config) => Promise<void>;
export declare const removeConfig: (ext: ConfigExtension) => Promise<void>;
