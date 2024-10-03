import { Config, ConfigExtension } from "./types";
export declare const CONFIG_NAME = "tsxlink.config";
export declare const readConfig: () => Promise<Config | null>;
export declare const writeConfig: (extension: ConfigExtension, config: Config) => Promise<string>;
export declare const removeConfig: (extension: ConfigExtension) => Promise<void>;
