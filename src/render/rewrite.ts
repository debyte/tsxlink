import { Component, CopyFile, RuntimeConfig } from "../types";
import {
  CAMEL_ATTRIBUTES,
  FULLSTOP_ATTRIBUTES,
  KEBAB_ATTRIBUTES,
} from "./htmlAttributes";
import { StyleObject, styleToObject, toCamelCase } from "./styles";

const INTERNAL_MAP_ATTRIBUTE = "data-tsx-map";
const INTERNAL_COND_ATTRIBUTE = "data-tsx-cond";

type RewriteResult = {
  rootVisibilityProp?: string;
  styles: StyleObject[];
  copyFromTo: CopyFile[];
};

export function rewriteTemplateDom(
  component: Component,
  config: RuntimeConfig,
): RewriteResult {
  const rootVisibilityProp = rewriteDomProps(component);
  const [styles, copyFromTo] =
    rewriteDomStyles(component.template, config.imageDir);
  return { rootVisibilityProp, styles, copyFromTo };
}

function rewriteDomProps(component: Component): string | undefined {
  let rootVisibilityProp: string | undefined;
  for (const p of component.props) {
    if (p.target === "text" || p.target === "slot") {
      p.element.textContent = `{${p.name}}`;
    } else if (p.target === "replace") {
      if (p.element === component.template) {
        p.element.textContent = `{${p.name}}`;
      } else {
        const ph = p.element.ownerDocument.createTextNode(`{${p.name}}`);
        p.element.before(ph);
        p.element.remove();
      }
    } else if (p.target === "visibility") {
      if (p.element === component.template) {
        rootVisibilityProp = p.name;
      } else {
        const pre = p.element.ownerDocument.createElement("div");
        pre.setAttribute(INTERNAL_COND_ATTRIBUTE, p.name);
        p.element.before(pre);
        const post = p.element.ownerDocument.createElement("div");
        post.setAttribute(INTERNAL_COND_ATTRIBUTE, "");
        p.element.after(post);
      }
    } else if (p.target === "map") {
      p.element.setAttribute(INTERNAL_MAP_ATTRIBUTE, p.name);
    } else {
      p.element.setAttribute(p.target, `{tsx:${p.name}}`);
    }
  }
  return rootVisibilityProp;
}

function rewriteDomStyles(
  template: Element,
  imageDir: string,
): [styles: StyleObject[], copy: CopyFile[]] {
  const styles: StyleObject[] = [];
  const copy: CopyFile[] = [];
  for (const e of template.querySelectorAll("[style]")) {
    const [s, cp] = styleToObject(e.getAttribute("style"), imageDir);
    e.setAttribute("style", `{tsx:styles[${styles.length}]}`);
    styles.push(s);
    copy.push(...cp);
  }
  return [styles, copy];
}

export function rewriteTemplateHtml(template: string): string {
  let out = template
    .replace(/"{tsx:([\w[\]]+)}"/gi, "{$1}")
    .replace(mapRegExp, "{...$1}")
    .replace(condStartRegExp, "{$1 && (")
    .replace(condEndRegExp, ")}")
    .replace(closeTagsRegexp, "<$1$2/>");
  for (const [a, b] of REWRITE_ATTRIBUTES) {
    out = out.replace(a, b);
  }
  return out;
}

const mapRegExp = new RegExp(`${INTERNAL_MAP_ATTRIBUTE}="(\\w+)"`, "gi");
const condStartRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}="(\\w+)"></div>`, "gi"
);
const condEndRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}=""></div>`, "gi"
);

const SINGLETON_TAGS = [
  "area", "base", "br", "col", "command", "embed", "hr", "img", "input",
  "keygen", "link", "meta", "param", "source", "track", "wbr",
];
const closeTagsRegexp = new RegExp(
  `<(${SINGLETON_TAGS.join("|")})(\\s([^>]*[^/])?)?>`, "gi"
);

const REWRITE_ATTRIBUTE_NAMES = [
  ["class", "className"],
  ["for", "htmlFor"],
  ["value", "defaultValue"],
  ...CAMEL_ATTRIBUTES.map(a => [a.toLowerCase(), a]),
  ...KEBAB_ATTRIBUTES.map(a => [a, toCamelCase(a)]),
  ...FULLSTOP_ATTRIBUTES.map(a => [a, toCamelCase(a.replace(":", "-"))]),
].map(([a, b]): [a: RegExp, b: string] => ([
  new RegExp(`(\\s)${a}(="[^"]*")`, "g"),
  `$1${b}$2`,
]));

const DROP_ON_EVENT_ATTRIBUTES: [a: RegExp, b: string] =
  [/\son\w+="[^"]*"/g, ""];

const REWRITE_ATTRIBUTES = [
  ...REWRITE_ATTRIBUTE_NAMES,
  DROP_ON_EVENT_ATTRIBUTES,
];
