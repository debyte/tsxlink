"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomTransform = void 0;
const jsdom_1 = require("jsdom");
class DomTransform {
    constructor(root) {
        this.root = root;
        this.xml = new jsdom_1.JSDOM("<root/>", { contentType: "text/xml" });
        this.xmlRoot = this.xml.window.document.querySelector("root");
    }
    element(parent, element) {
        const tag = this.tagName(element);
        if (tag !== null) {
            const out = parent.ownerDocument.createElement(tag);
            parent.appendChild(out);
            for (const attr of element.attributes) {
                const [name, value] = this.attribute(element, tag, attr);
                if (name !== null && value !== null) {
                    out.setAttribute(name, value);
                }
            }
            for (const node of element.childNodes) {
                if (node.nodeType === node.ELEMENT_NODE) {
                    this.element(out, node);
                }
                else if (node.nodeType === node.TEXT_NODE) {
                    this.text(out, node);
                }
                else if (node.nodeType === node.COMMENT_NODE) {
                    this.comment(out, node);
                }
            }
        }
    }
    text(parent, text) {
        const out = parent.ownerDocument.createTextNode(text.data);
        parent.appendChild(out);
    }
    comment(parent, comment) {
        const out = parent.ownerDocument.createComment(comment.data);
        parent.appendChild(out);
    }
    tagName(element) {
        const tag = element.tagName.toLowerCase();
        if (!this.filterElement(element, tag)) {
            return null;
        }
        return tag;
    }
    filterElement(_elem, _tag) {
        return true;
    }
    attribute(element, tag, attribute) {
        if (!this.filterAttribute(element, tag, attribute)) {
            return [null, null];
        }
        return [
            this.renameAttribute(element, tag, attribute),
            this.changeAttribute(element, tag, attribute),
        ];
    }
    filterAttribute(_elem, _tag, _attr) {
        return true;
    }
    renameAttribute(_elem, _tag, attr) {
        return attr.name;
    }
    changeAttribute(_elem, _tag, attr) {
        return attr.value;
    }
}
exports.DomTransform = DomTransform;
