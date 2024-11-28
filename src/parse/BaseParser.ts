import { CssFilterAndFixUrls } from "../data/CssFilterAndFixUrls";
import { DocPool } from "../data/DocPool";
import {
  baseName,
  srcSetToFilePaths,
  urlToFilePath,
  wildcardRegexp,
} from "../data/paths";
import { Component, CopyFile, FileData, RuntimeConfig } from "../types";
import { NamedComponent } from "./NamedComponent";
import { NamedObjectSet } from "./NamedObject";
import { isPropType, NamedProp } from "./NamedProp";

export const COMPONENT_ATTRIBUTE = "data-tsx";
export const PROPERTY_ATTRIBUTE = "data-tsx-prop";
export const SLOT_ATTRIBUTE = "data-tsx-slot";
export const REPLACE_ATTRIBUTE = "data-tsx-replace";
export const ASSET_ATTRIBUTE = "data-tsx-asset";
export const DROP_ATTRIBUTE = "data-tsx-drop";

export class BaseParser {
  docs: DocPool;
  config: RuntimeConfig;
  dropCss: RegExp[];

  constructor(docs: DocPool, config: RuntimeConfig) {
    this.docs = docs;
    this.config = config;
    this.dropCss = config.dropStyles.map(m => wildcardRegexp(m));
  }

  async getComponents(): Promise<Component[]> {
    const out: Component[] = [];
    for (const design of await this.parseComponentDesigns()) {
      const props = await this.parsePropDesigns(design);
      const component = {
        name: design.name,
        props: props.map(p => p.resolveTypeAndTarget()),
        template: design.templates[0],
      };
      this.cleanComponentElement(component);
      out.push(component);
    }
    return out;
  };

  async getAssetFiles(): Promise<FileData[]> {
    const copyFromTo: CopyFile[] = [];
    for (const element of await this.docs.selectElements(
      this.getAssetSelector()
    )) {
      for (const oldFile of [
        urlToFilePath(element.getAttribute("src")),
        urlToFilePath(element.getAttribute("href")),
        ...srcSetToFilePaths(element.getAttribute("srcset")),
      ]) {
        if (oldFile) {
          copyFromTo.push({ from: oldFile, to: baseName(oldFile) });
        }
      }
    }
    return await this.docs.copyFiles(".", copyFromTo);
  }

  async dropElements(): Promise<void> {
    for (const element of await this.docs.selectElements(
      this.getDropSelector()
    )) {
      element.remove();
    }
  }

  async getStyleElements(): Promise<FileData[]> {
    const styles: string[] = [];
    for (const element of await this.docs.selectElements("style")) {
      if (element.textContent !== null) {
        styles.push(element.textContent);
      }
    }
    return this.rewriteCss(
      { baseName: this.config.styleFile, content: styles.join("\n\n") }
    );
  }

  async getSeparateCssFiles(): Promise<Promise<FileData[]>[]> {
    return (await this.docs.selectFiles({ extension: "css" })).map(
      f => this.rewriteCss(f)
    );
  }

  async getSeparateJsFiles(): Promise<FileData[]> {
    return this.docs.selectFiles({ extension: "js" });
  }

  async parseComponentDesigns(): Promise<NamedComponent[]> {
    const desings = new NamedObjectSet<NamedComponent>();
    for (const element of await this.docs.selectElements(
      this.getComponentSelector()
    )) {
      const name = element.getAttribute(COMPONENT_ATTRIBUTE);
      if (name !== null) {
        desings.merge(
          new NamedComponent(name, element.cloneNode(true) as Element)
        );
      }
    }
    return desings.all();
  }

  async parsePropDesigns(design: NamedComponent): Promise<NamedProp[]> {
    const designs = new NamedObjectSet<NamedProp>();
    for (const template of design.templates) {
      designs.merge(...this.parseProp(template));
      for (
        const element of template.querySelectorAll(this.getPropertySelector())
      ) {
        const containing = element.closest(this.getComponentSelector());
        if (containing === template || containing === null) {
          designs.merge(...this.parseProp(element));
        }
      }
    }
    return designs.all();
  }

  protected parseProp(element: Element): NamedProp[] {
    const props: NamedProp[] = [];
    const propAttr = element.getAttribute(PROPERTY_ATTRIBUTE);
    if (propAttr !== null) {
      for (const prop of propAttr.split(",")) {
        const [name, ...tags] = prop.split(":").map(t => t.trim());
        const p = new NamedProp(name, element);
        if (tags.length > 0) {
          if (isPropType(tags[0])) {
            p.type.push(tags[0]);
            if (tags.length > 1 && tags[1] !== "") {
              p.target.push(tags[1]);
            }
          } else {
            if (tags[0] !== "") {
              p.target.push(tags[0]);
            }
            if (tags.length > 1 && isPropType(tags[1])) {
              p.type.push(tags[1]);
            }
          }
        }
        props.push(p);
      }
    }
    const slotAttr = element.getAttribute(SLOT_ATTRIBUTE);
    if (slotAttr !== null) {
      props.push(new NamedProp(slotAttr, element, "slot"));
    }
    const replaceAttr = element.getAttribute(REPLACE_ATTRIBUTE);
    if (replaceAttr !== null) {
      props.push(new NamedProp(replaceAttr, element, "replace"));
    }
    return props;
  }

  protected getComponentSelector(): string {
    return `[${COMPONENT_ATTRIBUTE}]`;
  }

  protected getPropertySelector(): string {
    return `[${PROPERTY_ATTRIBUTE}],[${SLOT_ATTRIBUTE}],[${REPLACE_ATTRIBUTE}]`;
  }

  protected getAssetSelector(): string {
    return `[${ASSET_ATTRIBUTE}]`;
  }

  protected getDropSelector(): string {
    return `[${DROP_ATTRIBUTE}]`;
  }

  cleanComponentElement(c: Component): void {
    c.template.removeAttribute(COMPONENT_ATTRIBUTE);
    for (const p of c.props) {
      if (p.target === "slot") {
        p.element.removeAttribute(SLOT_ATTRIBUTE);
      } else if (p.target === "replace") {
        p.element.removeAttribute(REPLACE_ATTRIBUTE);
      } else {
        p.element.removeAttribute(PROPERTY_ATTRIBUTE);
      }
    }
    for (const el of c.template.querySelectorAll(this.getAssetSelector())) {
      el.removeAttribute(ASSET_ATTRIBUTE);
    }
  }

  protected async rewriteCss(data: FileData): Promise<FileData[]> {
    const [css, copyFromTo] = CssFilterAndFixUrls.runWithCopyFiles(
      data.buffer !== undefined
        ? (await data.buffer).toString()
        : data.content || "",
      s => this.dropCss.every(re => s.match(re) === null),
    );
    return [
      { baseName: data.baseName, content: css },
      ...(await this.docs.copyFiles(data.dirName || ".", copyFromTo)),
    ];
  }
}
