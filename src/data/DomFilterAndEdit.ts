import { JSDOM } from "jsdom";
import { CopyFile } from "../types";
import { CssFilterAndEdit } from "./CssFilterAndEdit";
import { DomTransform } from "./DomTransform";
import { baseName, filePath, srcSetToFilePaths, urlToFilePath } from "./paths";

const URL_ELEMENTS = ["img", "script", "link"];
const URL_ATTRIBUTES = ["src", "srcset", "href"];
const STYLE_ATTRIBUTE = "style";

export class DomFilterAndEdit extends DomTransform {
  dropTags: RegExp[];
  dropAttributes: RegExp[];
  limitAttributes: { [name: string]: string[] | undefined };
  renameAttributes: { [name: string]: string | undefined };
  assetsPath: string;
  copy: CopyFile[];

  static runWithCopyFiles(
    root: Element,
    assetsPath: string,
    dropTags: RegExp[],
    dropAttr: RegExp[],
    limitAttr: { [attr: string]: string[] },
    renameAttr: [from: string, to: string][],
  ): [xml: JSDOM, root: Element, copyFromTo: CopyFile[]] {
    const tr = new DomFilterAndEdit(
      root, assetsPath, dropTags, dropAttr, limitAttr, renameAttr
    );
    tr.element(tr.xmlRoot, tr.root);
    return [tr.xml, tr.xmlRoot, tr.copy];
  }

  constructor(
    root: Element,
    assetsPath: string,
    dropTags: RegExp[],
    dropAttr: RegExp[],
    limitAttr: { [attr: string]: string[] },
    renameAttr: [from: string, to: string][],
  ) {
    super(root);
    this.dropTags = dropTags;
    this.dropAttributes = dropAttr;
    this.limitAttributes = limitAttr;
    this.renameAttributes = Object.fromEntries(renameAttr);
    this.assetsPath = assetsPath;
    this.copy = [];
  }

  filterElement(_elem: Element, tag: string): boolean {
    return this.dropTags.every(re => tag.match(re) === null);
  }

  filterAttribute(_elem: Element, tag: string, attr: Attr): boolean {
    if (this.dropAttributes.some(re => attr.name.match(re) !== null)) {
      return false;
    }
    const limitTags = this.limitAttributes[attr.name];
    return limitTags === undefined || limitTags.includes(tag);
  }

  renameAttribute(_elem: Element, _tag: string, attr: Attr): string | null {
    const to = this.renameAttributes[attr.name];
    return to || attr.name;
  }

  changeAttribute(_elem: Element, tag: string, attr: Attr): string | null {
    if (
      URL_ELEMENTS.includes(tag)
      && URL_ATTRIBUTES.includes(attr.name)
    ) {
      return this.fixUrl(attr.name, attr.value);
    }
    if (attr.name === STYLE_ATTRIBUTE) {
      return this.fixStyle(attr.value);
    }
    return attr.value;
  }

  fixUrl(attr: string, value: string): string {
    if (attr === "srcset" && value !== null) {
      let out = value;
      for (const url of srcSetToFilePaths(value)) {
        const changed = this.rewritePossibleUrl(url);
        if (url && changed) {
          out = out.replace(url, changed);
        }
      }
      return out;
    }
    const changed = this.rewritePossibleUrl(urlToFilePath(value));
    return changed !== null ? changed : value;
  }

  rewritePossibleUrl(url: string | null): string | null {
    if (url) {
      const fileName = baseName(url);
      this.copy.push({ from: url, to: fileName });
      return filePath(this.assetsPath, fileName);
    }
    return null;
  }

  fixStyle(value: string): string {
    const [out, copy] = CssFilterAndEdit.runSingleValue(
      value, name => filePath(this.assetsPath, name)
    );
    this.copy.push(...copy);
    return out;
  }
}
