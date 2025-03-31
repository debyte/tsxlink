"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomFilterAndEdit = void 0;
const CssFilterAndEdit_1 = require("./CssFilterAndEdit");
const DomTransform_1 = require("./DomTransform");
const paths_1 = require("./paths");
const URL_ELEMENTS = ["img", "script", "link"];
const URL_ATTRIBUTES = ["src", "srcset", "href"];
const STYLE_ATTRIBUTE = "style";
class DomFilterAndEdit extends DomTransform_1.DomTransform {
    static runWithCopyFiles(root, assetsPath, dropTags, dropAttr, limitAttr, renameAttr) {
        const tr = new DomFilterAndEdit(root, assetsPath, dropTags, dropAttr, limitAttr, renameAttr);
        tr.element(tr.xmlRoot, tr.root);
        return [tr.xml, tr.xmlRoot, tr.copy];
    }
    constructor(root, assetsPath, dropTags, dropAttr, limitAttr, renameAttr) {
        super(root);
        this.dropTags = dropTags;
        this.dropAttributes = dropAttr;
        this.limitAttributes = limitAttr;
        this.renameAttributes = Object.fromEntries(renameAttr);
        this.assetsPath = assetsPath;
        this.copy = [];
    }
    filterElement(_elem, tag) {
        return this.dropTags.every(re => tag.match(re) === null);
    }
    filterAttribute(_elem, tag, attr) {
        if (this.dropAttributes.some(re => attr.name.match(re) !== null)) {
            return false;
        }
        const limitTags = this.limitAttributes[attr.name];
        return limitTags === undefined || limitTags.includes(tag);
    }
    renameAttribute(_elem, _tag, attr) {
        const to = this.renameAttributes[attr.name];
        return to || attr.name;
    }
    changeAttribute(_elem, tag, attr) {
        if (URL_ELEMENTS.includes(tag)
            && URL_ATTRIBUTES.includes(attr.name)) {
            return this.fixUrl(attr.name, attr.value);
        }
        if (attr.name === STYLE_ATTRIBUTE) {
            return this.fixStyle(attr.value);
        }
        return attr.value;
    }
    fixUrl(attr, value) {
        if (attr === "srcset" && value !== null) {
            let out = value;
            for (const url of (0, paths_1.srcSetToFilePaths)(value)) {
                const changed = this.rewritePossibleUrl(url);
                if (url && changed) {
                    out = out.replace(url, changed);
                }
            }
            return out;
        }
        const changed = this.rewritePossibleUrl((0, paths_1.urlToFilePath)(value));
        return changed !== null ? changed : value;
    }
    rewritePossibleUrl(url) {
        if (url) {
            const fileName = (0, paths_1.baseName)(url);
            this.copy.push({ from: url, to: fileName });
            return (0, paths_1.filePath)(this.assetsPath, fileName);
        }
        return null;
    }
    fixStyle(value) {
        const [out, copy] = CssFilterAndEdit_1.CssFilterAndEdit.runSingleValue(value, name => (0, paths_1.filePath)(this.assetsPath, name));
        this.copy.push(...copy);
        return out;
    }
}
exports.DomFilterAndEdit = DomFilterAndEdit;
