import { Prop } from "../types";
import { BaseRender } from "./BaseRender";
import { StyleObject } from "./styles";
export declare class ReactRender extends BaseRender {
    usesLib: boolean;
    styleObjects: StyleObject[];
    getRenameAttributes(): [from: string, to: string][];
    applyClassProp(p: Prop): void;
    applyChanges(xml: Element): void;
    applyStyleObjects(xml: Element): void;
    renderImports(props: Prop[]): string;
    renderJsxImport(props: Prop[]): string;
    renderElementType(): string;
    renderMapType(p: Prop): string;
    renderConsts(props: Prop[]): string | false;
    renderComponentNameAndType(name: string, props: Prop[]): string;
    renderXml(xml: string): string;
    doesUseLib(): boolean;
}
