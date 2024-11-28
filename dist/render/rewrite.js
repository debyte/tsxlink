"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTemplateDom = rewriteTemplateDom;
exports.rewriteTemplateHtml = rewriteTemplateHtml;
const paths_1 = require("../data/paths");
const htmlAttributes_1 = require("./htmlAttributes");
const styles_1 = require("./styles");
const INTERNAL_MAP_ATTRIBUTE = "data-tsx-map";
const INTERNAL_COND_ATTRIBUTE = "data-tsx-cond";
const URL_ELEMENTS = ["IMG", "SCRIPT", "LINK"];
const URL_SELECTOR = URL_ELEMENTS.join(", ").toLowerCase();
function rewriteTemplateDom(component, config, dropStyles) {
    const [rootVisibility, hasClasses] = rewriteDomProps(component);
    const [hasImages, images, copyRefs] = rewriteDomUrls(component, config);
    const [styles, copyUrls] = dropStyles
        ? [[], []] : rewriteDomStyles(component, config);
    const copyFromTo = [...copyRefs, ...copyUrls];
    return { rootVisibility, hasClasses, hasImages, images, styles, copyFromTo };
}
function rewriteDomProps(component) {
    let rootVisibilityProp;
    let hasClasses = false;
    for (const p of component.props) {
        if (p.target === "text" || p.target === "slot"
            || (p.target === "replace" && p.element === component.template)) {
            p.data = sanitizeValue(p.element.textContent);
            p.element.textContent = `{${p.name}}`;
        }
        else if (p.target === "replace") {
            p.data = sanitizeValue(p.element.textContent);
            const ph = p.element.ownerDocument.createTextNode(`{${p.name}}`);
            p.element.replaceWith(ph);
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
        else if (p.target === "class") {
            p.data = sanitizeValue(p.element.getAttribute(p.target), false);
            p.element.setAttribute(p.target, `#tsx{classResolve(${p.name}${p.data ? `, ${p.name}Defaults` : ""})}`);
            hasClasses = true;
        }
        else {
            p.data = sanitizeValue(p.element.getAttribute(p.target));
            p.element.setAttribute(p.target, `#tsx{${p.name}}`);
        }
    }
    return [rootVisibilityProp, hasClasses];
}
function sanitizeValue(value, cut) {
    let v = (value ? value.replace(/\s+/g, " ") : "").trim();
    if (v === "") {
        return undefined;
    }
    if (v.length > 30 && cut !== false) {
        v = v.substring(0, 27) + "...";
    }
    return v;
}
function rewriteDomUrls(component, config) {
    let hasImages = false;
    const images = {};
    const copyFromTo = [];
    const template = component.template;
    const elements = URL_ELEMENTS.includes(template.tagName) ? [template] : [];
    elements.push(...template.querySelectorAll(URL_SELECTOR));
    for (const element of elements) {
        hasImages = hasImages || element.tagName === "IMG";
        for (const attr of ["src", "href"]) {
            if (element.hasAttribute(attr)) {
                const oldFile = (0, paths_1.urlToFilePath)(element.getAttribute(attr));
                if (oldFile) {
                    const newFile = (0, paths_1.baseName)(oldFile);
                    copyFromTo.push({ from: oldFile, to: newFile });
                    if (config.useNextJsImages) {
                        const id = (0, paths_1.fileToId)(newFile);
                        images[id] = (0, paths_1.filePath)(config.assetsPath, newFile);
                        element.setAttribute(attr, `#tsx{${id}}`);
                    }
                    else {
                        element.setAttribute(attr, (0, paths_1.filePath)(config.assetsPath, newFile));
                    }
                }
            }
        }
        if (element.hasAttribute("srcset")) {
            if (config.useNextJsImages) {
                element.removeAttribute("srcset");
            }
            else {
                const value = element.getAttribute("srcset");
                for (const oldFile of (0, paths_1.srcSetToFilePaths)(value)) {
                    if (oldFile) {
                        const newFile = (0, paths_1.baseName)(oldFile);
                        copyFromTo.push({ from: oldFile, to: newFile });
                        value.replace(oldFile, (0, paths_1.filePath)(config.assetsPath, newFile));
                    }
                }
                element.setAttribute("srcset", value);
            }
        }
    }
    return [hasImages, images, copyFromTo];
}
function rewriteDomStyles(component, config) {
    const styles = [];
    const copyFromTo = [];
    const template = component.template;
    const elements = template.hasAttribute("style") ? [template] : [];
    elements.push(...template.querySelectorAll("[style]"));
    for (const element of elements) {
        const [style, copy] = (0, styles_1.styleToObject)(element.getAttribute("style"), config.assetsDir);
        element.setAttribute("style", `#tsx{inlineStyles[${styles.length}]}`);
        styles.push(style);
        copyFromTo.push(...copy);
    }
    return [styles, copyFromTo];
}
function rewriteTemplateHtml(template, nextImages, dropAttrs) {
    let out = template;
    for (const re of dropAttrs) {
        out = out.replace(re, "");
    }
    for (const [a, b] of REWRITE_ATTRIBUTES) {
        out = out.replace(a, b);
    }
    if (nextImages) {
        out = out.replace(/<img\s([^>]*)>/g, "<Image $1 />");
    }
    out = out
        .replace(/"#tsx{([^}"]+)}"/gi, "{$1}")
        .replace(mapRegExp, "{...$1}")
        .replace(condStartRegExp, "{$1 && (")
        .replace(condEndRegExp, ")}")
        .replace(closeTagsRegexp, "<$1$2 />");
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
    DROP_ON_EVENT_ATTRIBUTES,
    ...REWRITE_ATTRIBUTE_NAMES,
];
