import { JSDOM } from "jsdom";
import { CopyFile, DocSource, FileData } from "../types";
import { dirFiles, ext, readFile, wildcardRegexp, zipFiles } from "./files";

export class DocPool {
  source?: DocSource;
  ignore: RegExp[];

  constructor(source?: DocSource, ignore?: string[]) {
    this.source = source;
    this.ignore = ignore !== undefined
      ? ignore.map(i => wildcardRegexp(i))
      : [];
  }

  async parseDocs() {
    if (this.source === undefined) {
      return [];
    }
    if (["url", "zip", "dir"].includes(this.source.type)) {
      return this.parseDoms(await this.selectFiles({ extension: "html" }));
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

  async selectFiles(opt: { extension?: string, names?: string[] }) {
    if (this.source !== undefined) {
      let select: (name: string) => boolean = () => true;
      if (opt.extension) {
        const end = ext(opt.extension);
        const ign = this.ignore;
        select = n => (
          (!end || n.toLowerCase().endsWith(end)) && ign.every(i => !i.test(n))
        );
      } else if (opt.names) {
        const names = opt.names;
        select = n => names.includes(n);
      }
      if (this.source.type === "url") {
        throw new Error("TODO implement url docs");
      }
      if (this.source.type === "zip") {
        return await zipFiles(this.source.data, select);
      }
      if (this.source.type === "dir") {
        return await dirFiles(this.source.data, select);
      }
    }
    return [];
  }

  async copyFiles(copy: CopyFile[], dirName?: string): Promise<FileData[]> {
    const files = await this.selectFiles({ names: copy.map(cp => cp.from) });
    return copy.map(cp => {
      const from = files.find(f => f.baseName === cp.from);
      return {
        baseName: cp.to,
        buffer: from?.buffer,
        content: from?.content,
        dirName
      };
    });
  }
}
