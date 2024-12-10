"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = exports.DROP_ATTRIBUTE = exports.ASSET_ATTRIBUTE = exports.REPLACE_ATTRIBUTE = exports.SLOT_ATTRIBUTE = exports.PROPERTY_ATTRIBUTE = exports.COMPONENT_ATTRIBUTE = void 0;
const CssFilterAndEdit_1 = require("../data/CssFilterAndEdit");
const paths_1 = require("../data/paths");
const strings_1 = require("../data/strings");
const NamedComponent_1 = require("./NamedComponent");
const NamedObject_1 = require("./NamedObject");
const NamedProp_1 = require("./NamedProp");
exports.COMPONENT_ATTRIBUTE = "data-tsx";
exports.PROPERTY_ATTRIBUTE = "data-tsx-prop";
exports.SLOT_ATTRIBUTE = "data-tsx-slot";
exports.REPLACE_ATTRIBUTE = "data-tsx-replace";
exports.ASSET_ATTRIBUTE = "data-tsx-asset";
exports.DROP_ATTRIBUTE = "data-tsx-drop";
class BaseParser {
    constructor(docs, config) {
        this.docs = docs;
        this.config = config;
        this.dropCss = config.dropStyles.map(m => (0, strings_1.wildcardRegexp)(m));
    }
    async getComponents() {
        const out = [];
        for (const design of await this.parseComponentDesigns()) {
            const props = await this.parsePropDesigns(design);
            const component = {
                name: design.name,
                props: props.map(p => p.resolveTypeAndTarget()),
                template: design.templates[0],
            };
            this.cleanComponentElement(component);
            out.push(component);
        }
        return out;
    }
    ;
    async getAssetFiles() {
        const copyFromTo = [];
        for (const element of await this.docs.selectElements(this.getAssetSelector())) {
            for (const oldFile of [
                (0, paths_1.urlToFilePath)(element.getAttribute("src")),
                (0, paths_1.urlToFilePath)(element.getAttribute("href")),
                ...(0, paths_1.srcSetToFilePaths)(element.getAttribute("srcset")),
            ]) {
                if (oldFile) {
                    copyFromTo.push({ from: oldFile, to: (0, paths_1.baseName)(oldFile) });
                }
            }
        }
        return await this.docs.copyFiles(".", copyFromTo);
    }
    async dropElements() {
        for (const element of await this.docs.selectElements(this.getDropSelector())) {
            element.remove();
        }
    }
    async getStyleElements() {
        const styles = [];
        for (const element of await this.docs.selectElements("style")) {
            if (element.textContent !== null) {
                styles.push(element.textContent);
            }
        }
        return this.rewriteCss({ baseName: this.config.styleFile, content: styles.join("\n\n") });
    }
    async getSeparateCssFiles() {
        return (await this.docs.selectFiles({ extension: "css" })).map(f => this.rewriteCss(f));
    }
    async getSeparateJsFiles() {
        return this.docs.selectFiles({ extension: "js" });
    }
    async parseComponentDesigns() {
        const desings = new NamedObject_1.NamedObjectSet();
        for (const element of await this.docs.selectElements(this.getComponentSelector())) {
            const name = element.getAttribute(exports.COMPONENT_ATTRIBUTE);
            if (name !== null) {
                desings.merge(new NamedComponent_1.NamedComponent(name, element.cloneNode(true)));
            }
        }
        return desings.all();
    }
    async parsePropDesigns(design) {
        const designs = new NamedObject_1.NamedObjectSet();
        for (const template of design.templates) {
            designs.merge(...this.parseProp(template));
            for (const element of template.querySelectorAll(this.getPropertySelector())) {
                const containing = element.closest(this.getComponentSelector());
                if (containing === template || containing === null) {
                    designs.merge(...this.parseProp(element));
                }
            }
        }
        return designs.all();
    }
    parseProp(element) {
        const props = [];
        const propAttr = element.getAttribute(exports.PROPERTY_ATTRIBUTE);
        if (propAttr !== null) {
            for (const prop of propAttr.split(",")) {
                const [name, ...tags] = prop.split(":").map(t => t.trim());
                const p = new NamedProp_1.NamedProp(name, element);
                if (tags.length > 0) {
                    if ((0, NamedProp_1.isPropType)(tags[0])) {
                        p.type.push(tags[0]);
                        if (tags.length > 1 && tags[1] !== "") {
                            p.target.push(tags[1]);
                        }
                    }
                    else {
                        if (tags[0] !== "") {
                            p.target.push(tags[0]);
                        }
                        if (tags.length > 1 && (0, NamedProp_1.isPropType)(tags[1])) {
                            p.type.push(tags[1]);
                        }
                    }
                }
                props.push(p);
            }
        }
        const slotAttr = element.getAttribute(exports.SLOT_ATTRIBUTE);
        if (slotAttr !== null) {
            props.push(new NamedProp_1.NamedProp(slotAttr, element, "slot"));
        }
        const replaceAttr = element.getAttribute(exports.REPLACE_ATTRIBUTE);
        if (replaceAttr !== null) {
            props.push(new NamedProp_1.NamedProp(replaceAttr, element, "replace"));
        }
        return props;
    }
    getComponentSelector() {
        return `[${exports.COMPONENT_ATTRIBUTE}]`;
    }
    getPropertySelector() {
        return `[${exports.PROPERTY_ATTRIBUTE}],[${exports.SLOT_ATTRIBUTE}],[${exports.REPLACE_ATTRIBUTE}]`;
    }
    getAssetSelector() {
        return `[${exports.ASSET_ATTRIBUTE}]`;
    }
    getDropSelector() {
        return `[${exports.DROP_ATTRIBUTE}]`;
    }
    cleanComponentElement(c) {
        c.template.removeAttribute(exports.COMPONENT_ATTRIBUTE);
        for (const p of c.props) {
            if (p.target === "slot") {
                p.element.removeAttribute(exports.SLOT_ATTRIBUTE);
            }
            else if (p.target === "replace") {
                p.element.removeAttribute(exports.REPLACE_ATTRIBUTE);
            }
            else {
                p.element.removeAttribute(exports.PROPERTY_ATTRIBUTE);
            }
        }
        for (const el of c.template.querySelectorAll(this.getAssetSelector())) {
            el.removeAttribute(exports.ASSET_ATTRIBUTE);
        }
    }
    async rewriteCss(data) {
        const [css, copyFromTo] = CssFilterAndEdit_1.CssFilterAndEdit.runWithCopyFiles(data.buffer !== undefined
            ? (await data.buffer).toString()
            : data.content || "", s => this.dropCss.every(re => s.match(re) === null));
        return [
            { baseName: data.baseName, content: css },
            ...(await this.docs.copyFiles(data.dirName || ".", copyFromTo)),
        ];
    }
}
exports.BaseParser = BaseParser;
