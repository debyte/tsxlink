import { DocPool } from "../data/DocPool";
import { SourceType } from "../types";
import { BaseParser } from "./BaseParser";
export declare const selectParser: (docs: DocPool, sourceType: SourceType) => BaseParser;
