import { CopyFile } from "../types";
import { CssTransform } from "./CssTransform";
import { baseName, urlToFilePath } from "./paths";

export class CssFilterAndFixUrls extends CssTransform {
  select: (selector: string) => boolean;
  urlPath: (name: string) => string;
  copy: CopyFile[];

  static runWithCopyFiles(
    src: string,
    select: (selector: string) => boolean,
    urlPath?: (name: string) => string,
  ): [css: string, copyFromTo: CopyFile[]] {
    const tr = new CssFilterAndFixUrls(src, select, urlPath);
    const out = tr.tree(tr.root);
    return [tr.stringify(out), tr.copy];
  }

  constructor(
    src: string,
    select: (selector: string) => boolean,
    urlPath?: (name: string) => string,
  ) {
    super(src);
    this.select = select;
    this.urlPath = urlPath || (name => name);
    this.copy = [];
  }

  value(value: string | undefined): string | undefined {
    return value !== undefined ? this.fixUrl(value) : undefined;
  }

  filterSelectors(selector: string): boolean {
    return this.select(selector);
  }

  filterAtRule(atRule: string): boolean {
    return this.select(atRule);
  }

  fixUrl(value: string): string {
    let out = value;
    for (const match of value.matchAll(/url\(([^)]*)\)/gi)) {
      const oldFile = urlToFilePath(this.stripPossibleQuotes(match[1]));
      if (oldFile) {
        const newFile = baseName(oldFile);
        out = out.replace(oldFile, this.urlPath(newFile));
        this.copy.push({ from: oldFile, to: newFile });
      }
    }
    return out;
  }

  stripPossibleQuotes(val: string): string {
    if (
      (val.startsWith("\"") && val.endsWith("\""))
      || (val.startsWith("'") && val.endsWith("'"))
    ) {
      return val.slice(1, -1);
    }
    return val;
  }
}
