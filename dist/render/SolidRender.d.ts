import { Prop } from "../types";
import { BaseRender } from "./BaseRender";
export declare class SolidRender extends BaseRender {
    getRenameAttributes(): [from: string, to: string][];
    applyClassProp(p: Prop): void;
    renderImports(props: Prop[]): string;
    renderJsxImport(props: Prop[]): string;
    renderElementType(): string;
    renderMapType(p: Prop): string;
    renderConsts(props: Prop[]): string | false;
    renderComponentNameAndType(name: string, props: Prop[]): string;
}
