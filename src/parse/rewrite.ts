import css from "css";
import { CopyFile } from "../types";
import {
  COMPONENT_ATTRIBUTE,
  INTERNAL_COND_ATTRIBUTE,
  INTERNAL_MAP_ATTRIBUTE,
  PROPERTY_ATTRIBUTE,
  SLOT_ATTRIBUTE,
} from "./attributes";
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

export function rewriteCss(
  src: string,
  imageDir: string,
  select: (selector: string) => boolean,
): [code: string, copyFiles: CopyFile[]] {
  const [styles, copy] = editCssNodes(css.parse(src), imageDir, select);
  return [styles ? css.stringify(styles) : "", copy];
}

function editCssNodes<T extends css.Node | css.KeyFrame>(
  node: T,
  imageDir: string,
  select: (selector: string) => boolean,
): [node: T | false, copy: CopyFile[]] {
  if (node.type === "stylesheet") {
    if (node.stylesheet !== undefined) {
      const [stylesheet, copy] =
        editCssRules(node.stylesheet, imageDir, select);
      return [{ ...node, stylesheet }, copy];
    }
    return [node, []];
  }
  if (node.type === "rule") {
    const selectors = (node.selectors || []).filter(s => select(s));
    if (selectors.length === 0) {
      return [false, []];
    }
    const [n, copy] = editCssDeclarations(node, imageDir, select);
    return [{ ...n, selectors }, copy];
  }
  if (node.type === "comment") {
    return [node, []];
  }
  if (node.type === "charset") {
    return [select("@charset " + node.charset || "") && node, []];
  }
  if (node.type === "custom-media") {
    return [select("@ustom-media " + node.name || "") && node, []];
  }
  if (node.type === "document") {
    if (select("@document " + node.document || "")) {
      return editCssRules(node, imageDir, select);
    }
    return [false, []];
  }
  if (node.type === "font-face") {
    if (select("@font-face")) {
      return editCssDeclarations(node, imageDir, select);
    }
    return [false, []];
  }
  if (node.type === "host") {
    if (select("@host")) {
      return editCssRules(node, imageDir, select);
    }
    return [false, []];
  }
  if (node.type === "import") {
    return [select("@import " + node.import || "") && node, []];
  }
  if (node.type === "keyframes") {
    if (select("@keyframes " + node.name || "")) {
      return editCssKeyframes(node, imageDir, select);
    }
    return [false, []];
  }
  if (node.type === "keyframe") {
    return editCssDeclarations(node, imageDir, select);
  }
  if (node.type === "media") {
    if (select("@media " + node.media || "")) {
      return editCssRules(node, imageDir, select);
    }
    return [false, []];
  }
  if (node.type === "namespace") {
    return [select("@namespace " + node.namespace || "") && node, []];
  }
  if (node.type === "page") {
    if (select("@page " + node.selectors?.join(", "))) {
      return editCssDeclarations(node, imageDir, select);
    }
    return [false, []];
  }
  if (node.type === "supports") {
    if (select("@supports " + node.supports || "")) {
      return editCssRules(node, imageDir, select);
    }
    return [false, []];
  }
  return [node, []];
}

function editCssRules<T extends css.Node | css.KeyFrame | css.StyleRules>(
  node: T,
  imageDir: string,
  select: (selector: string) => boolean,
): [node: T, copy: CopyFile[]] {
  const n = node as CssRules;
  const [rules, copy] = editCssNodeList(n.rules, imageDir, select);
  return [{ ...node, rules }, copy];
}

function editCssDeclarations<T extends css.Node | css.KeyFrame>(
  node: T,
  imageDir: string,
  sel: (selector: string) => boolean,
): [node: T, copy: CopyFile[]] {
  const n = node as CssDeclarations;
  const [declarations, copy] = editCssNodeList(n.declarations, imageDir, sel);
  return [{ ...node, declarations }, copy];
}

function editCssKeyframes<T extends css.Node | css.KeyFrame>(
  node: T,
  imageDir: string,
  select: (selector: string) => boolean,
): [node: T, copy: CopyFile[]] {
  const n = node as css.KeyFrames;
  const [keyframes, copy] = editCssNodeList(n.keyframes, imageDir, select);
  return [{ ...node, keyframes }, copy];
}

function editCssNodeList<T extends css.Node | css.KeyFrame>(
  nodes: T[] | undefined,
  imageDir: string,
  select: (selector: string) => boolean,
): [nodes: T[] | undefined, copy: CopyFile[]] {
  if (nodes === undefined) {
    return [undefined, []];
  }
  const edited: T[] = [];
  const copy: CopyFile[] = [];
  for (const node of nodes) {
    const [n, c] = editCssNodes(node, imageDir, select);
    if (n !== false) {
      edited.push(n);
      copy.push(...c);
    }
  }
  return [edited, copy];
}

type CssRules = css.StyleRules | css.Document | css.Host | css.Media;
type CssDeclarations = css.Rule | css.FontFace | css.KeyFrame | css.Page;
