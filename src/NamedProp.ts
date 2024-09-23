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
};

export type PropType = "string" | "number" | "boolean" | "any";

export const isPropType = (s: string): s is PropType => {
  return ["string", "number", "boolean", "any"].includes(s);
}
