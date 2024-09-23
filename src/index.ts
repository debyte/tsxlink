#!/usr/bin/env node

import { HEADER, USAGE } from "./assets";
import { BaseConvert } from "./BaseConvert";
import { DocPool } from "./DocPool";

console.log(HEADER);
console.log(USAGE);

export const parseFiles = async (paths: string[]): Promise<void> => {
  const convert = new BaseConvert();
  const docs = new DocPool(paths);
  const components = await convert.parseComponentDesigns(docs);
  for (const component of components) {
    const props = convert.parsePropDesigns(component);
    console.log(props);
  }
};
