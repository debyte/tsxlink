import { NamedObject } from "./NamedObject";
export declare class NamedComponent extends NamedObject {
    templates: Element[];
    constructor(name: string, template: Element);
    merge(other: NamedComponent): void;
}
