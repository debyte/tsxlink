import fs from "fs/promises";
import { JSDOM } from "jsdom";

export class DocPool {
  paths: string[];

  constructor(paths: string[]) {
    this.paths = paths;
  }

  parseDocs() {
    return this.paths.map(async p => new JSDOM(await fs.readFile(p, "utf-8")));
  }

  selectElements(selectors: string) {
    return this.parseDocs().map(async dom => {
      return (await dom).window.document.querySelectorAll(selectors);
    });
  }
}
