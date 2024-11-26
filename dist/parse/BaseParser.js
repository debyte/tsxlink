"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
const attributes_1 = require("./attributes");
const CssFilterAndFixUrls_1 = require("./CssFilterAndFixUrls");
const NamedComponent_1 = require("./NamedComponent");
const NamedObject_1 = require("./NamedObject");
const NamedProp_1 = require("./NamedProp");
class BaseParser {
    constructor(docs, config) {
        this.docs = docs;
        this.config = config;
        this.cssIgnore = config.ignoreStyles.map(i => new RegExp(`^${i.replace(/(?<!\\)\?/g, ".?").replace(/(?<!\\)\*/g, ".*")}$`));
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
    async getStyleElements() {
        const styles = [];
        for await (const elements of await this.docs.selectElements("style")) {
            for (const element of elements) {
                if (element.textContent !== null) {
                    styles.push(element.textContent);
                }
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
        for await (const elements of await this.docs.selectElements(this.getComponentSelector())) {
            for (const element of elements) {
                const name = element.getAttribute(attributes_1.COMPONENT_ATTRIBUTE);
                if (name !== null) {
                    desings.merge(new NamedComponent_1.NamedComponent(name, element.cloneNode(true)));
                }
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
        const propAttr = element.getAttribute(attributes_1.PROPERTY_ATTRIBUTE);
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
        const slotAttr = element.getAttribute(attributes_1.SLOT_ATTRIBUTE);
        if (slotAttr !== null) {
            props.push(new NamedProp_1.NamedProp(slotAttr, element, "slot"));
        }
        return props;
    }
    getComponentSelector() {
        return `[${attributes_1.COMPONENT_ATTRIBUTE}]`;
    }
    getPropertySelector() {
        return `[${attributes_1.PROPERTY_ATTRIBUTE}],[${attributes_1.SLOT_ATTRIBUTE}]`;
    }
    cleanComponentElement(c) {
        c.template.removeAttribute(attributes_1.COMPONENT_ATTRIBUTE);
        for (const p of c.props) {
            if (p.target === "slot") {
                p.element.removeAttribute(attributes_1.SLOT_ATTRIBUTE);
            }
            else {
                p.element.removeAttribute(attributes_1.PROPERTY_ATTRIBUTE);
            }
        }
    }
    async rewriteCss(data) {
        const [css, copyFromTo] = CssFilterAndFixUrls_1.CssFilterAndFixUrls.runWithCopyFiles(data.buffer !== undefined
            ? (await data.buffer).toString()
            : data.content || "", this.config.imageDir, s => this.cssIgnore.every(i => s.match(i) === null));
        return [
            { baseName: data.baseName, content: css },
            ...(await this.docs.copyFiles(data.dirName || ".", copyFromTo)),
        ];
    }
}
exports.BaseParser = BaseParser;
