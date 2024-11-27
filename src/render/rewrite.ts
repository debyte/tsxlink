import { baseName, filePath, urlToFilePath } from "../data/paths";
import { Component, CopyFile, RuntimeConfig } from "../types";
import {
  CAMEL_ATTRIBUTES,
  FULLSTOP_ATTRIBUTES,
  KEBAB_ATTRIBUTES,
} from "./htmlAttributes";
import { StyleObject, styleToObject, toCamelCase } from "./styles";

const INTERNAL_MAP_ATTRIBUTE = "data-tsx-map";
const INTERNAL_COND_ATTRIBUTE = "data-tsx-cond";

const URL_ELEMENTS = ["IMG", "SCRIPT", "LINK"];
const HREF_ELEMENTS = ["LINK"];
const URL_SELECTOR = URL_ELEMENTS.join(", ").toLowerCase();

export type RewriteResult = {
  rootVisibility?: string;
  hasImages: boolean,
  styles: StyleObject[];
  copyFromTo: CopyFile[];
};

export function rewriteTemplateDom(
  component: Component,
  config: RuntimeConfig,
  dropStyles: boolean,
): RewriteResult {
  const rootVisibility = rewriteDomProps(component);
  const [hasImages, copyRefs] = rewriteDomUrls(component.template, config);
  const [styles, copyUrls] = dropStyles
    ? [[], []] : rewriteDomStyles(component.template, config);
  const copyFromTo = [...copyRefs, ...copyUrls];
  return { rootVisibility, hasImages, styles, copyFromTo };
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
      p.element.setAttribute(p.target, `#tsx{${p.name}}`);
    }
  }
  return rootVisibilityProp;
}

function rewriteDomUrls(
  template: Element,
  config: RuntimeConfig,
): [hasImages: boolean, copyFromTo: CopyFile[]] {
  const copyFromTo: CopyFile[] = [];
  let hasImages = false;
  const elements = URL_ELEMENTS.includes(template.tagName) ? [template] : [];
  elements.push(...template.querySelectorAll(URL_SELECTOR));
  for (const element of elements) {
    hasImages = hasImages || element.tagName === "IMG";
    const attr = HREF_ELEMENTS.includes(element.tagName) ? "href" : "src";
    const oldFile = urlToFilePath(element.getAttribute(attr));
    if (oldFile) {
      const newFile = baseName(oldFile);
      copyFromTo.push({ from: oldFile, to: newFile });
      element.setAttribute(attr, filePath(config.assetsPath, newFile));
    }
  }
  return [hasImages, copyFromTo];
}

function rewriteDomStyles(
  template: Element,
  config: RuntimeConfig,
): [styles: StyleObject[], copyFromTo: CopyFile[]] {
  const styles: StyleObject[] = [];
  const copyFromTo: CopyFile[] = [];
  const elements = template.hasAttribute("style") ? [template] : [];
  elements.push(...template.querySelectorAll("[style]"));
  for (const element of elements) {
    const [style, copy] = styleToObject(
      element.getAttribute("style"),
      config.assetsDir,
    );
    element.setAttribute("style", `#tsx{styles[${styles.length}]}`);
    styles.push(style);
    copyFromTo.push(...copy);
  }
  return [styles, copyFromTo];
}

export function rewriteTemplateHtml(
  template: string,
  nextImages: boolean,
  dropAttrs: RegExp[],
): string {
  let out = template
    .replace(/"#tsx{([\w[\]]+)}"/gi, "{$1}")
    .replace(mapRegExp, "{...$1}")
    .replace(condStartRegExp, "{$1 && (")
    .replace(condEndRegExp, ")}")
    .replace(closeTagsRegexp, "<$1$2/>");
  for (const [a, b] of REWRITE_ATTRIBUTES) {
    out = out.replace(a, b);
  }
  for (const re of dropAttrs) {
    out = out.replace(re, "");
  }
  if (nextImages) {
    out = out.replace(/<img\s([^>]*)\/>/g, "<Image $1/>");
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
