import { DocPool } from "./DocPool";
import { NamedObjectSet } from "./NamedObject";
import { NamedComponent } from "./NamedComponent";
import { isPropType, NamedProp } from "./NamedProp";

const COMPONENT_ATTRIBUTE = "data-tsx";
const PROPERTY_ATTRIBUTE = "data-tsx-prop";
const SLOT_ATTRIBUTE = "data-tsx-slot";

export class BaseConvert {

  async parseComponentDesigns(docs: DocPool): Promise<NamedComponent[]> {
    const desings = new NamedObjectSet<NamedComponent>();
    for await (
      const elements of docs.selectElements(this.getComponentSelector())
    ) {
      for (const element of elements) {
        desings.merge(...this.parseComponent(element));
      }
    }
    return desings.all();
  }

  protected getComponentSelector() {
    return `[${COMPONENT_ATTRIBUTE}]`;
  }

  protected parseComponent(element: Element): NamedComponent[] {
    const name = element.getAttribute(COMPONENT_ATTRIBUTE);
    if (name !== null) {
      element.removeAttribute(COMPONENT_ATTRIBUTE);
      return [new NamedComponent(name, element)];
    }
    return [];
  }

  parsePropDesigns(design: NamedComponent): NamedProp[] {
    const designs = new NamedObjectSet<NamedProp>();
    for (const template of design.templates) {
      for (
        const element of template.querySelectorAll(this.getPropertySelector())
      ) {
        designs.merge(...this.parseProp(element));
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
      element.removeAttribute(PROPERTY_ATTRIBUTE);
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
      element.removeAttribute(SLOT_ATTRIBUTE);
      props.push(new NamedProp(slotAttr, element, "slot"));
    }
    return props;
  }
}
