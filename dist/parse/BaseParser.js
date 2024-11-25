"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
const attributes_1 = require("./attributes");
const NamedComponent_1 = require("./NamedComponent");
const NamedObject_1 = require("./NamedObject");
const NamedProp_1 = require("./NamedProp");
const rewrite_1 = require("./rewrite");
class BaseParser {
    constructor(docs, config) {
        this.docs = docs;
        this.config = config;
        this.cssIgnore = config.ignoreStyles.map(i => new RegExp(`^${i.replace(/(?<!\\)\?/g, ".?").replace(/(?<!\\)\*/g, ".*")}$`));
    }
    async getComponents() {
        const components = [];
        for (const c of await this.parseComponentDesigns()) {
            const props = await this.parsePropDesigns(c);
            const [template, rootVisibility] = await this.formatTemplate(c, props);
            components.push({
                name: c.name,
                props: props.map(p => p.resolveTypeAndTarget()),
                template,
                rootVisibility,
            });
        }
        return components;
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
        return this.formatCss({ baseName: this.config.styleFile, content: styles.join("\n\n") });
    }
    async getSeparateCssFiles() {
        return (await this.docs.selectFiles({ extension: "css" })).map(f => this.formatCss(f));
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
    getComponentSelector() {
        return `[${attributes_1.COMPONENT_ATTRIBUTE}]`;
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
    getPropertySelector() {
        return `[${attributes_1.PROPERTY_ATTRIBUTE}],[${attributes_1.SLOT_ATTRIBUTE}]`;
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
    async formatTemplate(component, props) {
        return (0, rewrite_1.rewriteTemplate)(component, props);
    }
    async formatCss(data) {
        const [css, copyFromTo] = rewrite_1.CssFix.runWithCopyFiles(data.buffer !== undefined
            ? (await data.buffer).toString()
            : data.content || "", this.config.imageDir, s => this.cssIgnore.every(i => s.match(i) === null));
        return [
            { baseName: data.baseName, content: css },
            ...(await this.docs.copyFiles(data.dirName || ".", copyFromTo)),
        ];
    }
}
exports.BaseParser = BaseParser;
