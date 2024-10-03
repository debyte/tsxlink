import { DocPool } from "../data/DocPool";
import { Component, FileData } from "../types";
import { NamedComponent } from "./NamedComponent";
import { NamedObjectSet } from "./NamedObject";
import { isPropType, NamedProp } from "./NamedProp";

const COMPONENT_ATTRIBUTE = "data-tsx";
const PROPERTY_ATTRIBUTE = "data-tsx-prop";
const SLOT_ATTRIBUTE = "data-tsx-slot";

export class BaseParser {
  docs: DocPool;

  constructor(docs: DocPool) {
    this.docs = docs;
  }

  async getComponents(): Promise<Component[]> {
    return (await this.parseComponentDesigns()).map(c => {
      const props = this.parsePropDesigns(c);
      return {
        name: c.name,
        props: props.map(p => p.resolveTypeAndTarget()),
        template: this.exportTemplate(c, props),
      };
    });
  };

  getPublicCSSFiles(): Promise<FileData[]> {
    return this.docs.filesByExtension("css");
  }

  getPublicJSFiles(): Promise<FileData[]> {
    return this.docs.filesByExtension("js");
  }

  async parseComponentDesigns(): Promise<NamedComponent[]> {
    const desings = new NamedObjectSet<NamedComponent>();
    for await (
      const elements of
      await this.docs.selectElements(this.getComponentSelector())
    ) {
      for (const element of elements) {
        const name = element.getAttribute(COMPONENT_ATTRIBUTE);
        if (name !== null) {
          desings.merge(
            new NamedComponent(name, element.cloneNode(true) as Element)
          );
        }
      }
    }
    return desings.all();
  }

  protected getComponentSelector() {
    return `[${COMPONENT_ATTRIBUTE}]`;
  }

  parsePropDesigns(design: NamedComponent): NamedProp[] {
    const designs = new NamedObjectSet<NamedProp>();
    for (const template of design.templates) {
      for (
        const element of template.querySelectorAll(this.getPropertySelector())
      ) {
        const containing = element.closest(this.getComponentSelector());
        if (containing === template || containing === null) {
          designs.merge(...this.parseProp(element));
        }
      }
    }
    return designs.all();
  }

  protected getPropertySelector() {
    return `[${PROPERTY_ATTRIBUTE}],[${SLOT_ATTRIBUTE}]`;
  }

  protected parseProp(element: Element): NamedProp[] {
    const props: NamedProp[] = [];
    const propAttr = element.getAttribute(PROPERTY_ATTRIBUTE);
    if (propAttr !== null) {
      for (const prop of propAttr.split(",")) {
        const [name, ...tags] = prop.split(":").map(t => t.trim());
        const p = new NamedProp(name, element);
        if (tags.length > 0) {
          if (isPropType(tags[0])) {
            p.type.push(tags[0]);
            if (tags.length > 1 && tags[1] !== "") {
              p.target.push(tags[1]);
            }
          } else {
            if (tags[0] !== "") {
              p.target.push(tags[0]);
            }
            if (tags.length > 1 && isPropType(tags[1])) {
              p.type.push(tags[1]);
            }
          }
        }
        props.push(p);
      }
    }
    const slotAttr = element.getAttribute(SLOT_ATTRIBUTE);
    if (slotAttr !== null) {
      props.push(new NamedProp(slotAttr, element, "slot"));
    }
    return props;
  }

  exportTemplate(component: NamedComponent, props: NamedProp[]) {
    const template = component.templates[0];
    template.removeAttribute(COMPONENT_ATTRIBUTE);
    for (const p of props) {
      const { name, target } = p.resolveTypeAndTarget();
      const el = p.templates[0];
      el.removeAttribute(PROPERTY_ATTRIBUTE);
      if (target === "text") {
        el.textContent = `{${name}}`;
      } else if (target === "slot") {
        el.removeAttribute(SLOT_ATTRIBUTE);
        el.textContent = `{${name}}`;
      } else if (target === "visibility") {
        const pre = el.ownerDocument.createElement("div");
        pre.setAttribute("data-tsx-cond", name);
        el.before(pre);
        const post = el.ownerDocument.createElement("div");
        post.setAttribute("data-tsx-cond", "");
        el.after(post);
      } else if (target === "map") {
        el.setAttribute("data-tsx-map", name);
      } else {
        el.setAttribute(target, `{tsx:${name}}`);
      }
    }
    return template.outerHTML;
  }
}
