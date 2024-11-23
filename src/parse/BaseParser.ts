import { DocPool } from "../data/DocPool";
import { Component, FileData, RuntimeConfig } from "../types";
import {
  COMPONENT_ATTRIBUTE,
  PROPERTY_ATTRIBUTE,
  SLOT_ATTRIBUTE,
} from "./attributes";
import { NamedComponent } from "./NamedComponent";
import { NamedObjectSet } from "./NamedObject";
import { isPropType, NamedProp } from "./NamedProp";
import { rewriteCss, rewriteTemplate } from "./rewrite";

export class BaseParser {
  docs: DocPool;
  config: RuntimeConfig;
  cssIgnore: RegExp[];

  constructor(docs: DocPool, config: RuntimeConfig) {
    this.docs = docs;
    this.config = config;
    this.cssIgnore = config.ignoreStyles.map(i => new RegExp(
      `^${i.replace(/(?<!\\)\?/g, ".?").replace(/(?<!\\)\*/g, ".*")}$`, "g"
    ));
  }

  async getComponents(): Promise<Component[]> {
    const components: Component[] = [];
    for (const c of await this.parseComponentDesigns()) {
      const props = await this.parsePropDesigns(c);
      const [template, rootVisibility] = await this.formatTemplate(c, props);
      components.push({
        name: c.name,
        props: props.map(p => p.resolveTypeAndTarget()),
        template,
        rootVisibility,
      });
    }
    return components;
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
    return this.formatCss(
      { baseName: this.config.styleFile, content: styles.join("\n\n") }
    );
  }

  async getSeparateCssFiles(): Promise<Promise<FileData[]>[]> {
    return (await this.docs.selectFiles({ extension: "css" })).map(
      f => this.formatCss(f)
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

  protected getComponentSelector() {
    return `[${COMPONENT_ATTRIBUTE}]`;
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

  protected getPropertySelector() {
    return `[${PROPERTY_ATTRIBUTE}],[${SLOT_ATTRIBUTE}]`;
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
    return props;
  }

  protected async formatTemplate(
    component: NamedComponent,
    props: NamedProp[],
  ): Promise<[template: string, rootVisibilityProp: string | undefined]> {
    return rewriteTemplate(component, props);
  }

  protected async formatCss(data: FileData): Promise<FileData[]> {
    const [css, copyFromTo] = rewriteCss(
      data.buffer !== undefined
        ? (await data.buffer).toString()
        : data.content || "",
      this.config.imageDir,
      s => this.cssIgnore.every(i => !i.test(s)),
    );
    return [
      { baseName: data.baseName, content: css },
      ...(await this.docs.copyFiles(copyFromTo)),
    ];
  }
}
