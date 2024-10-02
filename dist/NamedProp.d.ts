import { NamedObject } from "./NamedObject";
import { Prop, PropType } from "./types";
export declare class NamedProp extends NamedObject {
    type: PropType[];
    target: string[];
    templates: Element[];
    prop?: Prop;
    constructor(name: string, template: Element, target?: string);
    merge(other: NamedProp): void;
    resolveTypeAndTarget(): Prop;
    protected acceptType(): PropType | null;
    protected acceptTarget(): string | null;
    protected templateTargets(): NamedTarget[];
}
export declare const INPUT_PROP_TYPES: PropType[];
export declare const isPropType: (s: string) => s is PropType;
export declare const PROP_TARGET_WITH_FIXED_TYPE: string[];
export declare const TARGET_PRIORITY: string[];
declare class NamedTarget extends NamedObject {
    content: string[];
    constructor(name: string, content?: string);
    merge(other: NamedTarget): void;
}
export {};
