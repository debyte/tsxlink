import { DocPool } from "../data/DocPool";
import { RuntimeConfig } from "../types";
import { BaseRender } from "./BaseRender";
import { ReactRender } from "./ReactRender";
import { SolidRender } from "./SolidRender";

export function selectRender(docs: DocPool, config: RuntimeConfig): BaseRender {
  if (config.targetType === "solid") {
    return new SolidRender(docs, config);
  }
  if (config.targetType === "react") {
    return new ReactRender(docs, config);
  }
  return new BaseRender(docs, config);
}
