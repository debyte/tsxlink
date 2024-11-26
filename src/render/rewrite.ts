import { Component } from "../types";
import { StyleObject, styleToObject } from "./styles";

const INTERNAL_MAP_ATTRIBUTE = "data-tsx-map";
const INTERNAL_COND_ATTRIBUTE = "data-tsx-cond";

export function rewriteTemplateDom(
  component: Component
): { rootVisibilityProp?: string, styles: StyleObject[] } {
  let rootVisibilityProp: string | undefined;
  for (const p of component.props) {
    if (p.target === "text") {
      p.element.textContent = `{${p.name}}`;
    } else if (p.target === "slot") {
      p.element.textContent = `{${p.name}}`;
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
  const styles: StyleObject[] = [];
  for (const e of component.template.querySelectorAll("[style]")) {
    const s = styleToObject(e.getAttribute("style"));
    e.setAttribute("style", `{tsx:styles[${styles.length}]}`);
    styles.push(s);
  }
  return { rootVisibilityProp, styles };
}

export function rewriteTemplateHtml(template: string) {
  return template
    .replace(/"{tsx:([\w[\]]+)}"/gi, "{$1}")
    .replace(mapRegExp, "{...$1}")
    .replace(condStartRegExp, "{$1 && (")
    .replace(condEndRegExp, ")}")
    .replace(/ class="([^"]*)"/gi, " className=\"$1\"")
    .replace(closeTagsRegexp, "<$1$2/>");
}

const mapRegExp = new RegExp(`${INTERNAL_MAP_ATTRIBUTE}="(\\w+)"`, "gi");
const condStartRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}="(\\w+)"></div>`, "gi"
);
const condEndRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}=""></div>`, "gi"
);

const singletonTags = [
  "area", "base", "br", "col", "command", "embed", "hr", "img", "input",
  "keygen", "link", "meta", "param", "source", "track", "wbr",
];
const closeTagsRegexp = new RegExp(
  `<(${singletonTags.join("|")})( ([^>]*[^/])?)?>`, "gi"
);
