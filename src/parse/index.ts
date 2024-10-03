import { DocPool } from "../data/DocPool";
import { SourceType } from "../types";
import { BaseParser } from "./BaseParser";

export const selectParser = (docs: DocPool, sourceType: SourceType) => {
  if (sourceType === "webflow/export") {
    // Ignore
  }
  return new BaseParser(docs);
};
