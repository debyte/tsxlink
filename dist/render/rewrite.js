"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTemplateDom = rewriteTemplateDom;
exports.rewriteTemplateHtml = rewriteTemplateHtml;
const htmlAttributes_1 = require("./htmlAttributes");
const styles_1 = require("./styles");
const INTERNAL_MAP_ATTRIBUTE = "data-tsx-map";
const INTERNAL_COND_ATTRIBUTE = "data-tsx-cond";
function rewriteTemplateDom(component) {
    return {
        rootVisibilityProp: rewriteDomForProps(component),
        styles: rewriteDomForStyleAttributes(component.template),
    };
}
function rewriteDomForProps(component) {
    let rootVisibilityProp;
    for (const p of component.props) {
        if (p.target === "text" || p.target === "slot") {
            p.element.textContent = `{${p.name}}`;
        }
        else if (p.target === "replace") {
            if (p.element === component.template) {
                p.element.textContent = `{${p.name}}`;
            }
            else {
                const ph = p.element.ownerDocument.createTextNode(`{${p.name}}`);
                p.element.before(ph);
                p.element.remove();
            }
        }
        else if (p.target === "visibility") {
            if (p.element === component.template) {
                rootVisibilityProp = p.name;
            }
            else {
                const pre = p.element.ownerDocument.createElement("div");
                pre.setAttribute(INTERNAL_COND_ATTRIBUTE, p.name);
                p.element.before(pre);
                const post = p.element.ownerDocument.createElement("div");
                post.setAttribute(INTERNAL_COND_ATTRIBUTE, "");
                p.element.after(post);
            }
        }
        else if (p.target === "map") {
            p.element.setAttribute(INTERNAL_MAP_ATTRIBUTE, p.name);
        }
        else {
            p.element.setAttribute(p.target, `{tsx:${p.name}}`);
        }
    }
    return rootVisibilityProp;
}
function rewriteDomForStyleAttributes(template) {
    const styles = [];
    for (const e of template.querySelectorAll("[style]")) {
        const s = (0, styles_1.styleToObject)(e.getAttribute("style"));
        e.setAttribute("style", `{tsx:styles[${styles.length}]}`);
        styles.push(s);
    }
    return styles;
}
function rewriteTemplateHtml(template) {
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
const condStartRegExp = new RegExp(`<div ${INTERNAL_COND_ATTRIBUTE}="(\\w+)"></div>`, "gi");
const condEndRegExp = new RegExp(`<div ${INTERNAL_COND_ATTRIBUTE}=""></div>`, "gi");
const SINGLETON_TAGS = [
    "area", "base", "br", "col", "command", "embed", "hr", "img", "input",
    "keygen", "link", "meta", "param", "source", "track", "wbr",
];
const closeTagsRegexp = new RegExp(`<(${SINGLETON_TAGS.join("|")})(\\s([^>]*[^/])?)?>`, "gi");
const REWRITE_ATTRIBUTE_NAMES = [
    ["class", "className"],
    ["for", "htmlFor"],
    ["value", "defaultValue"],
    ...htmlAttributes_1.CAMEL_ATTRIBUTES.map(a => [a.toLowerCase(), a]),
    ...htmlAttributes_1.KEBAB_ATTRIBUTES.map(a => [a, (0, styles_1.toCamelCase)(a)]),
    ...htmlAttributes_1.FULLSTOP_ATTRIBUTES.map(a => [a, (0, styles_1.toCamelCase)(a.replace(":", "-"))]),
].map(([a, b]) => ([
    new RegExp(`(\\s)${a}(="[^"]*")`, "g"),
    `$1${b}$2`,
]));
const DROP_ON_EVENT_ATTRIBUTES = [/\son\w+="[^"]*"/g, ""];
const REWRITE_ATTRIBUTES = [
    ...REWRITE_ATTRIBUTE_NAMES,
    DROP_ON_EVENT_ATTRIBUTES,
];
