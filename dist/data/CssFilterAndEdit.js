"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssFilterAndEdit = void 0;
const CssTransform_1 = require("./CssTransform");
const paths_1 = require("./paths");
class CssFilterAndEdit extends CssTransform_1.CssTransform {
    static runWithCopyFiles(src, select, urlPath) {
        const tr = new CssFilterAndEdit(src, select, urlPath);
        const out = tr.tree(tr.root);
        return [tr.stringify(out), tr.copy];
    }
    static runSingleValue(value, urlPath) {
        const tr = new CssFilterAndEdit("", () => true, urlPath);
        const url = tr.value(value);
        return [url || value, tr.copy];
    }
    constructor(src, select, urlPath) {
        super(src);
        this.select = select;
        this.urlPath = urlPath || (name => name);
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
            const oldFile = (0, paths_1.urlToFilePath)(this.stripPossibleQuotes(match[1]));
            if (oldFile) {
                const newFile = (0, paths_1.baseName)(oldFile);
                out = out.replace(oldFile, this.urlPath(newFile));
                this.copy.push({ from: oldFile, to: newFile });
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
exports.CssFilterAndEdit = CssFilterAndEdit;
