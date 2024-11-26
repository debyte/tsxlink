import { CssFilterAndFixUrls } from "../data/CssFilterAndFixUrls";
import { DocPool } from "../data/DocPool";
import { baseName } from "../data/files";
import { urlToFilePath } from "../data/urls";
import { Component, CopyFile, FileData, RuntimeConfig } from "../types";
import { NamedComponent } from "./NamedComponent";
import { NamedObjectSet } from "./NamedObject";
import { isPropType, NamedProp } from "./NamedProp";

export const COMPONENT_ATTRIBUTE = "data-tsx";
export const PROPERTY_ATTRIBUTE = "data-tsx-prop";
export const SLOT_ATTRIBUTE = "data-tsx-slot";
export const REPLACE_ATTRIBUTE = "data-tsx-replace";
export const ASSET_ATTRIBUTE = "data-tsx-asset";

export class BaseParser {
  docs: DocPool;
  config: RuntimeConfig;
  cssIgnore: RegExp[];

  constructor(docs: DocPool, config: RuntimeConfig) {
    this.docs = docs;
    this.config = config;
    this.cssIgnore = config.dropStyles.map(i => new RegExp(
      `^${i.replace(/(?<!\\)\?/g, ".?").replace(/(?<!\\)\*/g, ".*")}$`
    ));
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

  async getStyleElements(): Promise<FileData[]> {
    const styles: string[] = [];
    for await (const elements of await this.docs.selectElements("style")) {
      for (const element of elements) {
        if (element.textContent !== null) {
          styles.push(element.textContent);
        }
      }
    }
    return this.rewriteCss(
      { baseName: this.config.styleFile, content: styles.join("\n\n") }
    );
  }

  async getAssetFiles(): Promise<FileData[]> {
    const copyFromTo: CopyFile[] = [];
    for await (
      const elements of await this.docs.selectElements(this.getAssetSelector())
    ) {
      for (const element of elements) {
        const aname = ["link", "a"].includes(element.tagName) ? "href" : "src";
        const oldFile = urlToFilePath(element.getAttribute(aname));
        if (oldFile) {
          copyFromTo.push({ from: oldFile, to: baseName(oldFile) });
        }
      }
    }
    return await this.docs.copyFiles(".", copyFromTo);
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
    for await (
      const elements of
      await this.docs.selectElements(this.getComponentSelector())
    ) {
      for (const element of elements) {
        const name = element.getAttribute(COMPONENT_ATTRIBUTE);
        if (name !== null) {
          desings.merge(
            new NamedComponent(name, element.cloneNode(true) as Element)
          );
        }
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
  }

  protected async rewriteCss(data: FileData): Promise<FileData[]> {
    const [css, copyFromTo] = CssFilterAndFixUrls.runWithCopyFiles(
      data.buffer !== undefined
        ? (await data.buffer).toString()
        : data.content || "",
      s => this.cssIgnore.every(i => s.match(i) === null),
    );
    return [
      { baseName: data.baseName, content: css },
      ...(await this.docs.copyFiles(data.dirName || ".", copyFromTo)),
    ];
  }
}
