"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssFilterAndFixUrls = void 0;
const path_1 = __importDefault(require("path"));
const CssTransform_1 = require("./CssTransform");
class CssFilterAndFixUrls extends CssTransform_1.CssTransform {
    static runWithCopyFiles(src, imageDir, select) {
        const tr = new CssFilterAndFixUrls(src, imageDir, select);
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
exports.CssFilterAndFixUrls = CssFilterAndFixUrls;
