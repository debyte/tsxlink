import { Config } from "./types";
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
export declare const runInteractiveInit: (current?: Config) => Promise<Config>;
