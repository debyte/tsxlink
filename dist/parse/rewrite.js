"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssFix = void 0;
exports.rewriteTemplate = rewriteTemplate;
const path_1 = __importDefault(require("path"));
const attributes_1 = require("./attributes");
const CssTransform_1 = require("./CssTransform");
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
class CssFix extends CssTransform_1.CssTransform {
    static runWithCopyFiles(src, imageDir, select) {
        const tr = new CssFix(src, imageDir, select);
        const out = tr.tree(tr.root);
        return [tr.stringify(out), tr.copy];
    }
    constructor(src, imageDir, select) {
        super(src);
        this.imageDir = imageDir;
        this.select = select;
        this.copy = [];
    }
    value(value) {
        return value !== undefined ? this.fixUrl(value) : undefined;
    }
    filterSelectors(selector) {
        return this.select(selector);
    }
    filterAtRule(atRule) {
        return this.select(atRule);
    }
    fixUrl(value) {
        let out = value;
        for (const match of value.matchAll(/url\(([^)]*)\)/gi)) {
            const url = this.stripPossibleQuotes(match[1]);
            if (!url.startsWith("#") && !url.match(/^\w+:.*/)) {
                const parts = url.match(/^([^?#]+)(.*)$/);
                const oldFile = parts && parts[1];
                if (oldFile) {
                    const newFile = path_1.default.join(this.imageDir, path_1.default.basename(oldFile));
                    out = out.replace(oldFile, newFile);
                    this.copy.push({ from: oldFile, to: newFile });
                }
            }
        }
        return out;
    }
    stripPossibleQuotes(val) {
        if ((val.startsWith("\"") && val.endsWith("\""))
            || (val.startsWith("'") && val.endsWith("'"))) {
            return val.slice(1, -1);
        }
        return val;
    }
}
exports.CssFix = CssFix;
