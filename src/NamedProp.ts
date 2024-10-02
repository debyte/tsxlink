import { NamedObject, NamedObjectSet } from "./NamedObject";
import { Prop, PropType } from "./types";

export class NamedProp extends NamedObject {
  type: PropType[];
  target: string[];
  templates: Element[];
  prop?: Prop;

  constructor(name: string, template: Element, target?: string) {
    super(name);
    this.type = [];
    this.target = target !== undefined ? [target] : [];
    this.templates = [template];
  }

  merge(other: NamedProp) {
    this.type.push(...other.type);
    this.target.push(...other.target);
    this.templates.push(...other.templates);
  }

  resolveTypeAndTarget(): Prop {
    if (this.prop) {
      return this.prop;
    }
    let target: string | null = this.acceptTarget();
    let type: PropType | null = (
      target && PROP_TARGET_WITH_FIXED_TYPE.includes(target)
    ) ? "fixed" : this.acceptType();
    if (target === null || type === null) {
      const templateTargets = this.templateTargets();
      if (target === null) {
        target = "text";
        const changed = templateTargets.filter(
          t => t.content.some(s => s !== t.content[0])
        );
        if (changed.length > 0) {
          let idx = 0;
          if (changed[0].name.toLowerCase() === "id" && changed.length > 1) {
            idx = 1;
          }
          target = changed[idx].name;
        }
      }
      if (type === null) {
        type = "string";
        const templates = templateTargets.find(t => t.name === target);
        if (templates && templates.content.length > 0) {
          if (templates.content.every(s => s === "")) {
            type = "boolean";
          } else if (templates.content.every(s => !isNaN(Number(s)))) {
            type = "number";
          }
        }
      }
    }
    const elementClass = this.templates[0].constructor.name;
    this.prop = { name: this.name, type, target, elementClass };
    return this.prop;
  }

  protected acceptType(): PropType | null {
    if (this.type.length > 0) {
      for (const type of INPUT_PROP_TYPES) {
        if (this.type.includes(type)) {
          return type;
        }
      }
    }
    return null;
  }

  protected acceptTarget(): string | null {
    if (this.target.length > 0) {
      for (const target of TARGET_PRIORITY) {
        if (this.target.includes(target)) {
          return target;
        }
      }
      return this.target[0];
    }
    return null;
  }

  protected templateTargets(): NamedTarget[] {
    const parts = new NamedObjectSet<NamedTarget>();
    for (const template of this.templates) {
      if (template.textContent) {
        parts.merge(new NamedTarget("text", template.textContent));
      }
      for (const attr of template.attributes) {
        parts.merge(new NamedTarget(attr.name, attr.value));
      }
    }
    return parts.all();
  }
};

export const INPUT_PROP_TYPES: PropType[] = ["string", "number", "boolean"];

export const isPropType = (s: string): s is PropType =>
  (INPUT_PROP_TYPES as string[]).includes(s);

export const PROP_TARGET_WITH_FIXED_TYPE = ["visibility", "map", "slot"];
export const TARGET_PRIORITY = ["text", "visibility", "map", "slot"];

class NamedTarget extends NamedObject {
  content: string[];

  constructor(name: string, content?: string) {
    super(name);
    this.content = content !== undefined ? [content] : [];
  }

  merge(other: NamedTarget) {
    this.content.push(...other.content);
  }
}
