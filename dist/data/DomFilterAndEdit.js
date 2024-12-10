"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomFilterAndEdit = void 0;
const CssFilterAndEdit_1 = require("./CssFilterAndEdit");
const DomTransform_1 = require("./DomTransform");
const paths_1 = require("./paths");
const URL_ELEMENTS = ["IMG", "SCRIPT", "LINK"];
const URL_ATTRIBUTES = ["src", "srcset", "href"];
const STYLE_ATTRIBUTE = "style";
class DomFilterAndEdit extends DomTransform_1.DomTransform {
    static runWithCopyFiles(root, assetsPath, dropAttributes, renameAttributes) {
        const tr = new DomFilterAndEdit(root, assetsPath, dropAttributes, renameAttributes);
        tr.element(tr.xmlRoot, tr.root);
        const out = tr.xmlRoot.children.item(0);
        if (out === null) {
            throw new Error("XML root is missing after transform");
        }
        return [out, tr.copy];
    }
    constructor(root, assetsPath, dropAttributes, renameAttributes) {
        super(root);
        this.dropAttributes = dropAttributes;
        this.renameAttributes = Object.fromEntries(renameAttributes);
        this.assetsPath = assetsPath;
        this.copy = [];
    }
    filterAttribute(_element, attribute) {
        return this.dropAttributes.every(re => attribute.name.match(re) === null);
    }
    renameAttribute(_element, attribute) {
        const to = this.renameAttributes[attribute.name];
        return to || attribute.name;
    }
    changeAttribute(element, attribute) {
        if (URL_ELEMENTS.includes(element.tagName)
            && URL_ATTRIBUTES.includes(attribute.name)) {
            return this.fixUrl(attribute.name, attribute.value);
        }
        if (attribute.name === STYLE_ATTRIBUTE) {
            return this.fixStyle(attribute.value);
        }
        return attribute.value;
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
