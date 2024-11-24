"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssTransform = void 0;
const css_1 = __importDefault(require("css"));
class CssTransform {
    static run(src) {
        const tr = new CssTransform(src);
        const out = tr.tree(tr.root);
        return tr.stringify(out);
    }
    constructor(src) {
        this.root = css_1.default.parse(src);
    }
    stringify(root) {
        return root ? css_1.default.stringify(root) : "";
    }
    tree(node) {
        switch (node.type) {
            case "stylesheet":
                return this.stylesheet(node);
            case "comment":
                return this.comment(node);
            case "rule":
                return this.rule(node);
            case "declaration":
                return this.declaration(node);
            case "import":
                return this.import(node);
            case "charset":
                return this.charset(node);
            case "font-face":
                return this.fontFace(node);
            case "keyframes":
                return this.keyframes(node);
            case "keyframe":
                return this.keyframe(node);
            case "media":
                return this.media(node);
            case "custom-media":
                return this.customMedia(node);
            case "supports":
                return this.supports(node);
            case "namespace":
                return this.namespace(node);
            case "host":
                return this.host(node);
            case "page":
                return this.page(node);
            case "document":
                return this.document(node);
        }
    }
    stylesheet(node) {
        if (node.stylesheet !== undefined) {
            const rules = this.nodeList(node.stylesheet.rules) || [];
            return { ...node, stylesheet: { ...node.stylesheet, rules } };
        }
        return node;
    }
    comment(node) {
        return node;
    }
    rule(node) {
        var _a;
        const selectors = (_a = node.selectors) === null || _a === void 0 ? void 0 : _a.filter(s => this.filterSelectors(s));
        if (selectors && selectors.length > 0) {
            return {
                ...node,
                declarations: this.nodeList(node.declarations),
                selectors,
            };
        }
        return false;
    }
    declaration(node) {
        return { ...node, value: this.value(node.value) };
    }
    import(node) {
        if (this.filterAtRule("@import " + node.import || "")) {
            return { ...node, import: this.value(node.import) };
        }
        return false;
    }
    charset(node) {
        return this.filterAtRule("@charset " + node.charset || "") && node;
    }
    fontFace(node) {
        if (this.filterAtRule("@font-face")) {
            return { ...node, declarations: this.nodeList(node.declarations) };
        }
        return false;
    }
    keyframes(node) {
        if (this.filterAtRule("@keyframes " + node.name || "")) {
            return { ...node, keyframes: this.nodeList(node.keyframes) };
        }
        return false;
    }
    keyframe(node) {
        return { ...node, declarations: this.nodeList(node.declarations) };
    }
    media(node) {
        if (this.filterAtRule("@media " + node.media || "")) {
            return { ...node, rules: this.nodeList(node.rules) };
        }
        return false;
    }
    customMedia(node) {
        return this.filterAtRule("@custom-media " + node.name || "") && node;
    }
    supports(node) {
        if (this.filterAtRule("@supports " + node.supports || "")) {
            return { ...node, rules: this.nodeList(node.rules) };
        }
        return false;
    }
    namespace(node) {
        return this.filterAtRule("@namespace " + node.namespace || "") && node;
    }
    host(node) {
        if (this.filterAtRule("@host")) {
            return { ...node, rules: this.nodeList(node.rules) };
        }
        return false;
    }
    page(node) {
        var _a;
        if (this.filterAtRule("@page " + ((_a = node.selectors) === null || _a === void 0 ? void 0 : _a.join(", ")))) {
            return { ...node, declarations: this.nodeList(node.declarations) };
        }
        return false;
    }
    document(node) {
        if (this.filterAtRule("@document " + node.document || "")) {
            return { ...node, rules: this.nodeList(node.rules) };
        }
        return false;
    }
    value(value) {
        return value;
    }
    nodeList(nodes) {
        if (nodes === undefined) {
            return undefined;
        }
        const out = [];
        for (const node of nodes) {
            const n = this.tree(node);
            if (n !== false) {
                out.push(n);
            }
        }
        return out;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filterSelectors(selector) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filterAtRule(atRule) {
        return true;
    }
}
exports.CssTransform = CssTransform;
