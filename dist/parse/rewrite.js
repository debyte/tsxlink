"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTemplate = rewriteTemplate;
exports.rewriteCss = rewriteCss;
const css_1 = __importDefault(require("css"));
const attributes_1 = require("./attributes");
function rewriteTemplate(component, props) {
    const template = component.templates[0];
    let rootVisibilityProp;
    template.removeAttribute(attributes_1.COMPONENT_ATTRIBUTE);
    for (const p of props) {
        const { name, target } = p.resolveTypeAndTarget();
        const el = p.templates[0];
        el.removeAttribute(attributes_1.PROPERTY_ATTRIBUTE);
        if (target === "text") {
            el.textContent = `{${name}}`;
        }
        else if (target === "slot") {
            el.removeAttribute(attributes_1.SLOT_ATTRIBUTE);
            el.textContent = `{${name}}`;
        }
        else if (target === "visibility") {
            if (el === template) {
                rootVisibilityProp = name;
            }
            else {
                const pre = el.ownerDocument.createElement("div");
                pre.setAttribute(attributes_1.INTERNAL_COND_ATTRIBUTE, name);
                el.before(pre);
                const post = el.ownerDocument.createElement("div");
                post.setAttribute(attributes_1.INTERNAL_COND_ATTRIBUTE, "");
                el.after(post);
            }
        }
        else if (target === "map") {
            el.setAttribute(attributes_1.INTERNAL_MAP_ATTRIBUTE, name);
        }
        else {
            el.setAttribute(target, `{tsx:${name}}`);
        }
    }
    return [template.outerHTML, rootVisibilityProp];
}
function rewriteCss(src, imageDir, select) {
    const [styles, copy] = editCssNodes(css_1.default.parse(src), imageDir, select);
    return [styles ? css_1.default.stringify(styles) : "", copy];
}
function editCssNodes(node, imageDir, select) {
    var _a;
    if (node.type === "stylesheet") {
        if (node.stylesheet !== undefined) {
            const [stylesheet, copy] = editCssRules(node.stylesheet, imageDir, select);
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
        if (select("@page " + ((_a = node.selectors) === null || _a === void 0 ? void 0 : _a.join(", ")))) {
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
function editCssRules(node, imageDir, select) {
    const n = node;
    const [rules, copy] = editCssNodeList(n.rules, imageDir, select);
    return [{ ...node, rules }, copy];
}
function editCssDeclarations(node, imageDir, sel) {
    const n = node;
    const [declarations, copy] = editCssNodeList(n.declarations, imageDir, sel);
    return [{ ...node, declarations }, copy];
}
function editCssKeyframes(node, imageDir, select) {
    const n = node;
    const [keyframes, copy] = editCssNodeList(n.keyframes, imageDir, select);
    return [{ ...node, keyframes }, copy];
}
function editCssNodeList(nodes, imageDir, select) {
    if (nodes === undefined) {
        return [undefined, []];
    }
    const edited = [];
    const copy = [];
    for (const node of nodes) {
        const [n, c] = editCssNodes(node, imageDir, select);
        if (n !== false) {
            edited.push(n);
            copy.push(...c);
        }
    }
    return [edited, copy];
}
