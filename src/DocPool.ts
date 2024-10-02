import { JSDOM } from "jsdom";
import { dirFiles, readFile, zipFiles } from "./files";

export type DocSource = {
  type: "string" | "file" | "zip" | "dir";
  data: string;
};

export class DocPool {
  source?: DocSource;

  constructor(source?: DocSource) {
    this.source = source;
  }

  async parseDocs() {
    if (this.source === undefined) {
      return [];
    }
    if (this.source.type === "zip") {
      return this.parseDoms(await zipFiles(this.source.data, "html"));
    }
    if (this.source.type === "dir") {
      return this.parseDoms(await dirFiles(this.source.data, "html"));
    }
    if (this.source.type === "file") {
      return this.parseDoms([readFile(this.source.data)]);
    }
    return [Promise.resolve(new JSDOM(this.source.data))];
  }

  private parseDoms(buffers: Promise<Buffer>[]) {
    return buffers.map(async buf => new JSDOM(await buf));
  }

  async selectElements(selectors: string) {
    const docs = await this.parseDocs();
    return docs.map(async dom => {
      return (await dom).window.document.querySelectorAll(selectors);
    });
  }
}
