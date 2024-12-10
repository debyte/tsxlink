import { JSDOM } from "jsdom";
import { CopyFile } from "../types";
import { CssFilterAndEdit } from "./CssFilterAndEdit";
import { DomTransform } from "./DomTransform";
import { baseName, filePath, srcSetToFilePaths, urlToFilePath } from "./paths";

const URL_ELEMENTS = ["IMG", "SCRIPT", "LINK"];
const URL_ATTRIBUTES = ["src", "srcset", "href"];
const STYLE_ATTRIBUTE = "style";

export class DomFilterAndEdit extends DomTransform {
  dropAttributes: RegExp[];
  renameAttributes: { [name: string]: string | undefined };
  assetsPath: string;
  copy: CopyFile[];

  static runWithCopyFiles(
    root: Element,
    assetsPath: string,
    dropAttributes: RegExp[],
    renameAttributes: [from: string, to: string][],
  ): [xml: JSDOM, root: Element, copyFromTo: CopyFile[]] {
    const tr = new DomFilterAndEdit(
      root, assetsPath, dropAttributes, renameAttributes
    );
    tr.element(tr.xmlRoot, tr.root);
    return [tr.xml, tr.xmlRoot, tr.copy];
  }

  constructor(
    root: Element,
    assetsPath: string,
    dropAttributes: RegExp[],
    renameAttributes: [from: string, to: string][],
  ) {
    super(root);
    this.dropAttributes = dropAttributes;
    this.renameAttributes = Object.fromEntries(renameAttributes);
    this.assetsPath = assetsPath;
    this.copy = [];
  }

  filterAttribute(_element: Element, attribute: Attr): boolean {
    return this.dropAttributes.every(re => attribute.name.match(re) === null);
  }

  renameAttribute(_element: Element, attribute: Attr): string | null {
    const to = this.renameAttributes[attribute.name];
    return to || attribute.name;
  }

  changeAttribute(element: Element, attribute: Attr): string | null {
    if (
      URL_ELEMENTS.includes(element.tagName)
      && URL_ATTRIBUTES.includes(attribute.name)
    ) {
      return this.fixUrl(attribute.name, attribute.value);
    }
    if (attribute.name === STYLE_ATTRIBUTE) {
      return this.fixStyle(attribute.value);
    }
    return attribute.value;
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
