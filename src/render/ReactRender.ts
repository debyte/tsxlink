import { kebabToCamelCase, r } from "../data/strings";
import { Prop } from "../types";
import { BaseRender } from "./BaseRender";
import {
  CAMEL_ATTRIBUTES,
  FULLSTOP_ATTRIBUTES,
  KEBAB_ATTRIBUTES,
} from "./html";
import {
  classNamesJson,
  StyleObject,
  styleToObject
} from "./styles";

const RENAME_ATTRIBUTES: [from: string, to: string][] = [
  ["class", "className"],
  ["for", "htmlFor"],
  ["value", "defaultValue"],
  ...CAMEL_ATTRIBUTES.map(
    a => [a.toLowerCase(), a] as [a: string, b: string]
  ),
  ...KEBAB_ATTRIBUTES.map(
    a => [a, kebabToCamelCase(a)] as [a: string, b: string]
  ),
  ...FULLSTOP_ATTRIBUTES.map(
    a => [a, kebabToCamelCase(a.replace(":", "-"))] as [a: string, b: string]
  ),
];

const ATTRIBUTE_TYPES = new Map<string, string>([
  ["HTMLAnchorElement", "AnchorHTMLAttributes"],
  ["HTMLAudioElement", "AudioHTMLAttributes"],
  ["HTMLButtonElement", "ButtonHTMLAttributes"],
  ["HTMLFormElement", "FormHTMLAttributes"],
  ["HTMLIFrameElement", "IframeHTMLAttributes"],
  ["HTMLImageElement", "ImgHTMLAttributes"],
  ["HTMLInputElement", "InputHTMLAttributes"],
  ["HTMLLabelElement", "LabelHTMLAttributes"],
  ["HTMLLinkElement", "LinkHTMLAttributes"],
  ["HTMLMediaElement", "MediaHTMLAttributes"],
  ["HTMLObjectElement", "ObjectHTMLAttributes"],
  ["HTMLOptionElement", "OptionHTMLAttributes"],
  ["HTMLScriptElement", "ScriptHTMLAttributes"],
  ["HTMLSelectElement", "SelectHTMLAttributes"],
  ["HTMLSourceElement", "SourceHTMLAttributes"],
  ["HTMLTableElement", "TableHTMLAttributes"],
  ["HTMLTextAreaElement", "TextareaHTMLAttributes"],
  ["HTMLVideoElement", "VideoHTMLAttributes"],
]);

export class ReactRender extends BaseRender {
  usesLib: boolean = false;
  styleObjects: StyleObject[] = [];

  getRenameAttributes(): [from: string, to: string][] {
    return RENAME_ATTRIBUTES;
  }

  applyClassProp(p: Prop): void {
    p.data = this.commentValue(p.element.getAttribute("class"), false);
    p.element.setAttribute("class", this.renderToAttribute(
      `classResolve(${this.prop(p.name)}${p.data ? `, ${p.name}Defaults` : ""})`
    ));
    this.usesLib = true;
  }

  applyChanges(xml: Element) {
    super.applyChanges(xml);
    this.applyStyleObjects(xml);
  }

  applyStyleObjects(xml: Element) {
    this.styleObjects = [];
    for (const elem of xml.parentElement!.querySelectorAll("[style]")) {
      const value = elem.getAttribute("style");
      if (value) {
        const i = this.styleObjects.length;
        this.styleObjects.push(styleToObject(value));
        elem.setAttribute(
          "style", this.renderToAttribute(`inlineStyles[${i}]`)
        );
      }
    }
  }

  renderImports(): string {
    return r(
      "import React from \"react\";",
      this.hasImages && this.config.useNextJsImages
      && "import Image from \"next/image\";",
      this.usesLib && "import { classResolve } from \"./tsxlinkLib\";",
      super.renderImports(),
    );
  }

  renderElementType(): string {
    return "React.ReactNode";
  }

  renderMapType(p: Prop): string {
    const cls = p.element.constructor.name;
    const reactClass = ATTRIBUTE_TYPES.get(cls) || "AllHTMLAttributes"
    return `React.${reactClass}<${cls}>`;
  }

  renderConsts(props: Prop[]): string | false {
    return r(
      props.map(p => p.target === "class" && p.data !== undefined && r(
        "",
        `const ${p.name}Defaults = ${classNamesJson(p.data)};`,
      )),
      this.styleObjects.length > 0 && r(
        "",
        `const inlineStyles = ${JSON.stringify(this.styleObjects, null, 2)};`,
      ),
    );
  }

  renderComponentNameAndType(name: string) {
    return `${name}: React.FC<${name}Props>`;
  }

  renderXml(xml: string): string {
    const out = super.renderXml(xml);
    return this.config.useNextJsImages
      ? out.replace(/<img\s([^>]*)>/g, "<Image $1>") : out;
  }

  doesUseLib(): boolean {
    return this.usesLib;
  }
}
