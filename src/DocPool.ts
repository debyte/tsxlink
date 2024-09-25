import fs from "fs/promises";
import { JSDOM } from "jsdom";

export type DocSource = {
  type: "string" | "file";
  data: string;
};

export class DocPool {
  sources: DocSource[];

  constructor(sources?: DocSource[]) {
    this.sources = sources || [];
  }

  add(source: DocSource) {
    this.sources.push(source);
  }

  parseDocs() {
    return this.sources.map(async definition => {
      let src = definition.data;
      if (definition.type === "file") {
        src = await fs.readFile(definition.data, "utf-8");
      }
      return new JSDOM(src);
    });
  }

  selectElements(selectors: string) {
    return this.parseDocs().map(async dom => {
      return (await dom).window.document.querySelectorAll(selectors);
    });
  }
}
