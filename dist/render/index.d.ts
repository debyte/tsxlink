import { DocPool } from "../data/DocPool";
import { Component, FileData, RuntimeConfig } from "../types";
export declare function renderComponent(config: RuntimeConfig, docs: DocPool, component: Component): Promise<[component: FileData, assets: FileData[], usesLib: boolean]>;
