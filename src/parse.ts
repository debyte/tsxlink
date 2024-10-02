import { BaseParser } from "./BaseParser";
import { DocPool } from "./DocPool";
import { Component } from "./types";

export const selectParser = () => {
  // TODO Support configurable parser instances
  return new BaseParser();
};

export const parse = async (pool: DocPool): Promise<Component[]> => {
  const parser = selectParser();
  return (await parser.parseComponentDesigns(pool)).map(c => {
    const props = parser.parsePropDesigns(c);
    return {
      name: c.name,
      props: props.map(p => p.resolveTypeAndTarget()),
      template: parser.exportTemplate(c, props),
    };
  });
};
