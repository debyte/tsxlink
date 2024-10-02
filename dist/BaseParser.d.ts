import { DocPool } from "./DocPool";
import { NamedComponent } from "./NamedComponent";
import { NamedProp } from "./NamedProp";
export declare class BaseParser {
    parseComponentDesigns(docs: DocPool): Promise<NamedComponent[]>;
    protected getComponentSelector(): string;
    protected parseComponent(element: Element): NamedComponent[];
    parsePropDesigns(design: NamedComponent): NamedProp[];
    protected getPropertySelector(): string;
    protected parseProp(element: Element): NamedProp[];
    exportTemplate(component: NamedComponent, props: NamedProp[]): string;
}
