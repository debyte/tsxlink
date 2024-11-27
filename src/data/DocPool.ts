import { JSDOM } from "jsdom";
import path from "path";
import { CopyFile, DocSource, FileData } from "../types";
import { copyFile, dirFiles, emptyFiles, readFile, zipFiles } from "./files";
import { ext, wildcardFileRegexp } from "./paths";

export class DocPool {
  source?: DocSource;
  ignore: RegExp[];

  constructor(source?: DocSource, ignore?: string[]) {
    this.source = source;
    this.ignore = ignore !== undefined
      ? ignore.map(i => wildcardFileRegexp(i))
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

  async selectFiles(
    opt: { extension?: string, names?: string[] },
  ): Promise<FileData[]> {
    if (this.source !== undefined) {
      let select: (name: string, path: string) => boolean = () => true;
      if (opt.extension) {
        const end = ext(opt.extension);
        const ign = this.ignore;
        select = n => (
          (!end || n.toLowerCase().endsWith(end))
          && ign.every(i => n.match(i) === null)
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
      if (this.source.type === "string" && opt.names) { // Tests
        return emptyFiles(opt.names);
      }
    }
    return [];
  }

  async copyFiles(relDir: string, copy: CopyFile[]): Promise<FileData[]> {
    const names = copy.map(({ from }) =>
      from.startsWith("/") ? from.slice(1) : path.join(relDir, from)
    );
    const out: FileData[] = [];
    for (const file of await this.selectFiles({ names })) {
      const i = names.findIndex(
        name => name === path.join(file.dirName || ".", file.baseName)
      );
      if (i >= 0) {
        out.push(copyFile(file, copy[i].to));
      }
    }
    return out;
  }
}
