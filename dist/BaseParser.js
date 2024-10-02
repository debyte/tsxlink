"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseParser = void 0;
const NamedObject_1 = require("./NamedObject");
const NamedComponent_1 = require("./NamedComponent");
const NamedProp_1 = require("./NamedProp");
const COMPONENT_ATTRIBUTE = "data-tsx";
const PROPERTY_ATTRIBUTE = "data-tsx-prop";
const SLOT_ATTRIBUTE = "data-tsx-slot";
class BaseParser {
    async parseComponentDesigns(docs) {
        const desings = new NamedObject_1.NamedObjectSet();
        for await (const elements of await docs.selectElements(this.getComponentSelector())) {
            for (const element of elements) {
                desings.merge(...this.parseComponent(element));
            }
        }
        return desings.all();
    }
    getComponentSelector() {
        return `[${COMPONENT_ATTRIBUTE}]`;
    }
    parseComponent(element) {
        const name = element.getAttribute(COMPONENT_ATTRIBUTE);
        if (name !== null) {
            return [new NamedComponent_1.NamedComponent(name, element.cloneNode(true))];
        }
        return [];
    }
    parsePropDesigns(design) {
        const designs = new NamedObject_1.NamedObjectSet();
        for (const template of design.templates) {
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
                const pre = el.ownerDocument.createElement("div");
                pre.setAttribute("data-tsx-cond", name);
                el.before(pre);
                const post = el.ownerDocument.createElement("div");
                post.setAttribute("data-tsx-cond", "");
                el.after(post);
            }
            else if (target === "map") {
                el.setAttribute("data-tsx-map", name);
            }
            else {
                el.setAttribute(target, `{tsx:${name}}`);
            }
        }
        return template.outerHTML;
    }
}
exports.BaseParser = BaseParser;
