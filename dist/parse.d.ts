import { BaseParser } from "./BaseParser";
import { DocPool } from "./DocPool";
import { Component } from "./types";
export declare const selectParser: () => BaseParser;
export declare const parse: (pool: DocPool) => Promise<Component[]>;
