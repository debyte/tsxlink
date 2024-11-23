import { CopyFile } from "../types";
import { NamedComponent } from "./NamedComponent";
import { NamedProp } from "./NamedProp";
export declare function rewriteTemplate(component: NamedComponent, props: NamedProp[]): [template: string, rootVisibilityProp: string | undefined];
export declare function rewriteCss(src: string, imageDir: string, select: (selector: string) => boolean): [code: string, copyFiles: CopyFile[]];
