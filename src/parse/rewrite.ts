import path from "path";
import { CopyFile } from "../types";
import {
  COMPONENT_ATTRIBUTE,
  INTERNAL_COND_ATTRIBUTE,
  INTERNAL_MAP_ATTRIBUTE,
  PROPERTY_ATTRIBUTE,
  SLOT_ATTRIBUTE,
} from "./attributes";
import { CssTransform } from "./CssTransform";
import { NamedComponent } from "./NamedComponent";
import { NamedProp } from "./NamedProp";

export function rewriteTemplate(
  component: NamedComponent,
  props: NamedProp[],
): [template: string, rootVisibilityProp: string | undefined] {
  const template = component.templates[0];
  let rootVisibilityProp: string | undefined;
  template.removeAttribute(COMPONENT_ATTRIBUTE);
  for (const p of props) {
    const { name, target } = p.resolveTypeAndTarget();
    const el = p.templates[0];
    el.removeAttribute(PROPERTY_ATTRIBUTE);
    if (target === "text") {
      el.textContent = `{${name}}`;
    } else if (target === "slot") {
      el.removeAttribute(SLOT_ATTRIBUTE);
      el.textContent = `{${name}}`;
    } else if (target === "visibility") {
      if (el === template) {
        rootVisibilityProp = name;
      } else {
        const pre = el.ownerDocument.createElement("div");
        pre.setAttribute(INTERNAL_COND_ATTRIBUTE, name);
        el.before(pre);
        const post = el.ownerDocument.createElement("div");
        post.setAttribute(INTERNAL_COND_ATTRIBUTE, "");
        el.after(post);
      }
    } else if (target === "map") {
      el.setAttribute(INTERNAL_MAP_ATTRIBUTE, name);
    } else {
      el.setAttribute(target, `{tsx:${name}}`);
    }
  }
  return [template.outerHTML, rootVisibilityProp];
}

export class CssFix extends CssTransform {
  imageDir: string;
  select: (selector: string) => boolean;
  copy: CopyFile[];

  static runWithCopyFiles(
    src: string,
    imageDir: string,
    select: (selector: string) => boolean,
  ): [css: string, copyFromTo: CopyFile[]] {
    const tr = new CssFix(src, imageDir, select);
    const out = tr.tree(tr.root);
    return [tr.stringify(out), tr.copy];
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
