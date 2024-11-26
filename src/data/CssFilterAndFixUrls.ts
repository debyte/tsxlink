import path from "path";
import { CopyFile } from "../types";
import { CssTransform } from "./CssTransform";

export class CssFilterAndFixUrls extends CssTransform {
  imageDir: string;
  select: (selector: string) => boolean;
  copy: CopyFile[];

  static runWithCopyFiles(
    src: string,
    imageDir: string,
    select: (selector: string) => boolean,
  ): [css: string, copyFromTo: CopyFile[]] {
    const tr = new CssFilterAndFixUrls(src, imageDir, select);
    const out = tr.tree(tr.root);
    return [tr.stringify(out), tr.copy];
  }

  static runValue(
    value: string,
    imageDir: string,
  ): [value: string, copyFromTo: CopyFile[]] {
    const tr = new CssFilterAndFixUrls("", imageDir, () => true);
    const out = tr.value(value);
    return [out || "", tr.copy];
  }

  constructor(
    src: string,
    imageDir: string,
    select: (selector: string) => boolean,
  ) {
    super(src);
    this.imageDir = imageDir;
    this.select = select;
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
      const url = this.stripPossibleQuotes(match[1]);
      if (!url.startsWith("#") && !url.match(/^\w+:.*/)) {
        const parts = url.match(/^([^?#]+)(.*)$/);
        const oldFile = parts && parts[1];
        if (oldFile) {
          const newFile = path.join(this.imageDir, path.basename(oldFile));
          out = out.replace(oldFile, newFile);
          this.copy.push({ from: oldFile, to: newFile });
        }
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
