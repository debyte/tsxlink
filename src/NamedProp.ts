import { NamedObject } from "./NamedObject";

export class NamedProp extends NamedObject {
  type: PropType[];
  target: string[];
  templates: Element[];

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

  resolveTypeAndTarget(): [type: PropType, target: string] {
    let type: PropType | null = this.acceptType();
    let target: string | null = this.acceptTarget();
    if (type === null) {
      // TODO detect from templates
      type = "string";
    }
    if (target === null) {
      // TODO detect from templates
      target = "text";
    }
    return [type, target];
  }

  protected acceptType(): PropType | null {
    if (this.type.length > 0) {
      for (const type of PROP_TYPES) {
        if (this.type.includes(type)) {
          return type;
        }
      }
    }
    return null;
  }

  protected acceptTarget(): string | null {
    if (this.target.length > 0) {
      for (const target of PROP_TARGET_WO_ATTRS) {
        if (this.target.includes(target)) {
          return target;
        }
      }
      return this.target[0];
    }
    return null;
  }
};

export type PropType = "string" | "number" | "boolean" | "any";

export const PROP_TYPES: PropType[] = ["string", "number", "boolean", "any"];

export const isPropType = (s: string): s is PropType =>
  (PROP_TYPES as string[]).includes(s);

export const PROP_TARGET_WO_ATTRS = ["text", "visibility", "map", "slot"];
