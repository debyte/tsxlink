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
        const [name, value] = this.attribute(element, tag, attr);
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

  tagName(element: Element): string | null {
    const tag = element.tagName.toLowerCase();
    if (!this.filterElement(element, tag)) {
      return null;
    }
    return tag;
  }

  filterElement(_elem: Element, _tag: string): boolean {
    return true;
  }

  attribute(
    element: Element,
    tag: string,
    attribute: Attr,
  ): [string | null, string | null] {
    if (!this.filterAttribute(element, tag, attribute)) {
      return [null, null];
    }
    return [
      this.renameAttribute(element, tag, attribute),
      this.changeAttribute(element, tag, attribute),
    ];
  }

  filterAttribute(_elem: Element, _tag: string, _attr: Attr): boolean {
    return true;
  }

  renameAttribute(_elem: Element, _tag: string, attr: Attr): string | null {
    return attr.name;
  }

  changeAttribute(_elem: Element, _tag: string, attr: Attr): string | null {
    return attr.value;
  }
}
