import { JSDOM } from "jsdom";

export class DomTransform {
  root: Element;
  xml: JSDOM;
  xmlRoot: Element;

  constructor(root: Element) {
    this.root = root;
    this.xml = new JSDOM("<root/>", { contentType: "text/xml" });
    this.xmlRoot = this.xml.window.document.querySelector("root")!;
  }

  element(parent: Element, element: Element) {
    const tag = this.tagName(element);
    if (tag !== null) {
      const out = parent.ownerDocument.createElement(tag);
      parent.appendChild(out);
      for (const attr of element.attributes) {
        const [name, value] = this.attribute(element, attr);
        if (name !== null && value !== null) {
          out.setAttribute(name, value);
        }
      }
      for (const node of element.childNodes) {
        if (node.nodeType === node.ELEMENT_NODE) {
          this.element(out, node as Element);
        } else if (node.nodeType === node.TEXT_NODE) {
          this.text(out, node as Text);
        } else if (node.nodeType === node.COMMENT_NODE) {
          this.comment(out, node as Comment);
        }
      }
    }
  }

  text(parent: Element, text: Text) {
    const out = parent.ownerDocument.createTextNode(text.data);
    parent.appendChild(out);
  }

  comment(parent: Element, comment: Comment) {
    const out = parent.ownerDocument.createComment(comment.data);
    parent.appendChild(out);
  }

  tagName(node: Element): string | null {
    return node.tagName.toLowerCase();
  }

  attribute(element: Element, attribute: Attr): [string | null, string | null] {
    if (!this.filterAttribute(element, attribute)) {
      return [null, null];
    }
    return [
      this.renameAttribute(element, attribute),
      this.changeAttribute(element, attribute),
    ];
  }

  filterAttribute(_element: Element, _attribute: Attr): boolean {
    return true;
  }

  renameAttribute(_element: Element, attribute: Attr): string | null {
    return attribute.name;
  }

  changeAttribute(_element: Element, attribute: Attr): string | null {
    return attribute.value;
  }
}
