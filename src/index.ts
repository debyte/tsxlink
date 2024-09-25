#!/usr/bin/env node

import { HEADER, USAGE } from "./assets";
import { BaseConvert } from "./BaseConvert";
import { DocPool } from "./DocPool";

console.log(HEADER);
console.log(USAGE);

export const parse = async (pool: DocPool): Promise<void> => {
  // TODO: use source flavor to select converter
  const convert = new BaseConvert();
  const components = await convert.parseComponentDesigns(pool);
  for (const component of components) {
    for (const prop of convert.parsePropDesigns(component)) {
      const [type, target] = prop.resolveTypeAndTarget();
      
    }
  }
};
