import { DocPool } from "../data/DocPool";
import { RuntimeConfig } from "../types";
import { BaseParser } from "./BaseParser";

export function selectParser(docs: DocPool, config: RuntimeConfig) {
  if (config.sourceType === "webflow/export") {
    // Ignore
  }
  return new BaseParser(docs, config);
}
