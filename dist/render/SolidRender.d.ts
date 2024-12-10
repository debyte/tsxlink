import { Prop } from "../types";
import { BaseRender } from "./BaseRender";
export declare class SolidRender extends BaseRender {
    getRenameAttributes(): [from: string, to: string][];
    applyClassProp(p: Prop): void;
    renderImports(props: Prop[]): string;
    renderElementImport(props: Prop[]): string;
    renderElementType(): string;
    renderMapType(_p: Prop): string;
    renderConsts(props: Prop[]): string | false;
    renderComponentNameAndType(name: string, props: Prop[]): string;
}
