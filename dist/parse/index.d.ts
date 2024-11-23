import { DocPool } from "../data/DocPool";
import { RuntimeConfig } from "../types";
import { BaseParser } from "./BaseParser";
export declare function selectParser(docs: DocPool, config: RuntimeConfig): BaseParser;
