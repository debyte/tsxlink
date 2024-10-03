import { JSDOM } from "jsdom";
import { DocSource, FileData } from "../types";
import { dirFiles, readFile, zipFiles } from "./files";

export class DocPool {
  source?: DocSource;

  constructor(source?: DocSource) {
    this.source = source;
  }

  async parseDocs() {
    if (this.source === undefined) {
      return [];
    }
    if (["url", "zip", "dir"].includes(this.source.type)) {
      return this.parseDoms(await this.filesByExtension("html"));
    }
    if (this.source.type === "file") {
      return this.parseDoms([
        { baseName: "", buffer: readFile(this.source.data) },
      ]);
    }
    return [Promise.resolve(new JSDOM(this.source.data))];
  }

  private parseDoms(data: FileData[]) {
    return data.map(async ({ buffer }) => new JSDOM(await buffer));
  }

  async selectElements(selectors: string) {
    const docs = await this.parseDocs();
    return docs.map(async dom => {
      return (await dom).window.document.querySelectorAll(selectors);
    });
  }

  async filesByExtension(extension: string) {
    if (this.source !== undefined) {
      if (this.source.type === "url") {
        throw new Error("TODO implement url docs");
      }
      if (this.source.type === "zip") {
        return await zipFiles(this.source.data, extension);
      }
      if (this.source.type === "dir") {
        return await dirFiles(this.source.data, extension);
      }
    }
    return [];
  }
}
