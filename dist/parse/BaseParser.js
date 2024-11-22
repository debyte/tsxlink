"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
const NamedComponent_1 = require("./NamedComponent");
const NamedObject_1 = require("./NamedObject");
const NamedProp_1 = require("./NamedProp");
const COMPONENT_ATTRIBUTE = "data-tsx";
const PROPERTY_ATTRIBUTE = "data-tsx-prop";
const SLOT_ATTRIBUTE = "data-tsx-slot";
class BaseParser {
    constructor(docs) {
        this.docs = docs;
    }
    async getComponents() {
        return (await this.parseComponentDesigns()).map(c => {
            const props = this.parsePropDesigns(c);
            const [template, rootVisibility] = this.exportTemplate(c, props);
            return {
                name: c.name,
                props: props.map(p => p.resolveTypeAndTarget()),
                template,
                rootVisibility,
            };
        });
    }
    ;
    getPublicCssFiles() {
        return this.docs.filesByExtension("css");
    }
    getPublicJsFiles() {
        return this.docs.filesByExtension("js");
    }
    async parseComponentDesigns() {
        const desings = new NamedObject_1.NamedObjectSet();
        for await (const elements of await this.docs.selectElements(this.getComponentSelector())) {
            for (const element of elements) {
                const name = element.getAttribute(COMPONENT_ATTRIBUTE);
                if (name !== null) {
                    desings.merge(new NamedComponent_1.NamedComponent(name, element.cloneNode(true)));
                }
            }
        }
        return desings.all();
    }
    getComponentSelector() {
        return `[${COMPONENT_ATTRIBUTE}]`;
    }
    parsePropDesigns(design) {
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
        return `[${PROPERTY_ATTRIBUTE}],[${SLOT_ATTRIBUTE}]`;
    }
    parseProp(element) {
        const props = [];
        const propAttr = element.getAttribute(PROPERTY_ATTRIBUTE);
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
        const slotAttr = element.getAttribute(SLOT_ATTRIBUTE);
        if (slotAttr !== null) {
            props.push(new NamedProp_1.NamedProp(slotAttr, element, "slot"));
        }
        return props;
    }
    exportTemplate(component, props) {
        const template = component.templates[0];
        let rootVisibility;
        template.removeAttribute(COMPONENT_ATTRIBUTE);
        for (const p of props) {
            const { name, target } = p.resolveTypeAndTarget();
            const el = p.templates[0];
            el.removeAttribute(PROPERTY_ATTRIBUTE);
            if (target === "text") {
                el.textContent = `{${name}}`;
            }
            else if (target === "slot") {
                el.removeAttribute(SLOT_ATTRIBUTE);
                el.textContent = `{${name}}`;
            }
            else if (target === "visibility") {
                if (el === template) {
                    rootVisibility = name;
                }
                else {
                    const pre = el.ownerDocument.createElement("div");
                    pre.setAttribute("data-tsx-cond", name);
                    el.before(pre);
                    const post = el.ownerDocument.createElement("div");
                    post.setAttribute("data-tsx-cond", "");
                    el.after(post);
                }
            }
            else if (target === "map") {
                el.setAttribute("data-tsx-map", name);
            }
            else {
                el.setAttribute(target, `{tsx:${name}}`);
            }
        }
        return [template.outerHTML, rootVisibility];
    }
}
exports.BaseParser = BaseParser;
