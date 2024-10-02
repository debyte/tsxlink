import { Config, ConfigExtension } from "./types";
export declare const readConfig: (baseName: string) => Promise<Config | null>;
export declare const writeConfig: (baseName: string, ext: ConfigExtension, config: Config) => Promise<void>;
export declare const removeConfig: (baseName: string, ext: ConfigExtension) => Promise<void>;
