import { NamedObject } from "./NamedObject";

export class NamedComponent extends NamedObject {
  templates: Element[];

  constructor(name: string, template: Element) {
    super(name);
    this.templates = [template];
  }

  merge(other: NamedComponent) {
    this.templates.push(...other.templates);
  }
};
