import { DocPool } from "../data/DocPool";
import { DomFilterAndEdit } from "../data/DomFilterAndEdit";
import { baseName, fileToId } from "../data/paths";
import { r, wildcardRegexp } from "../data/strings";
import { Component, CopyFile, FileData, Prop, RuntimeConfig } from "../types";
import { safeId } from "./ids";
import { indentRows } from "./indent";

const INTERNAL_MAP_ATTRIBUTE = "data-tsx-map";
const INTERNAL_COND_ATTRIBUTE = "data-tsx-cond";

const mapRegExp = new RegExp(`${INTERNAL_MAP_ATTRIBUTE}="([\\w\\.]+)"`, "gi");

const condStartRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}="([\\w\\.]+)"/>`, "gi"
);

const condEndRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}=""/>`, "gi"
);

export class BaseRender {
  docs: DocPool;
  config: RuntimeConfig;
  dropAttrs: RegExp[];
  renameAttrs: [from: string, to: string][];

  rootVisibilityProp: string | null = null;
  hasImages: boolean = false;
  imageImports: [id: string, src: string][] = [];

  constructor(docs: DocPool, config: RuntimeConfig) {
    this.docs = docs;
    this.config = config;
    this.dropAttrs = this.getDropAttributes();
    this.renameAttrs = this.getRenameAttributes();
  }

  async render(
    component: Component,
  ): Promise<[component: FileData, assets: FileData[]]> {
    this.sanitizeNames(component);
    this.applyProps(component);
    const [xml, copy] = this.transform(component);
    this.applyChanges(xml);
    const jsx = this.renderJsx(component, xml.outerHTML);
    return [
      { baseName: `${component.name}.tsx`, content: jsx },
      await this.docs.copyFiles(".", copy),
    ];
  }

  transform(component: Component): [xml: Element, copyFromTo: CopyFile[]] {
    try {
      return DomFilterAndEdit.runWithCopyFiles(
        component.template,
        this.config.assetsPath,
        this.dropAttrs,
        this.renameAttrs,
      );
    } catch (e) {
      throw new Error(`Transform error ${component.name}: ${e}`);
    }
  }

  getDropAttributes(): RegExp[] {
    return [
      /on[A-Z]\w+/,
      ...this.config.dropAttributes.map(m => wildcardRegexp(m)),
    ];
  }

  getRenameAttributes(): [from: string, to: string][] {
    return [];
  }

  sanitizeNames(component: Component) {
    component.name = safeId(component.name);
    for (const prop of component.props) {
      prop.name = safeId(prop.name);
    }
  }

  applyProps(component: Component) {
    this.rootVisibilityProp = null;
    for (const p of component.props) {
      if (
        p.target === "text" || p.target === "slot"
        || (p.target === "replace" && p.element === component.template)
      ) {
        p.data = this.commentValue(p.element.textContent);
        p.element.textContent = this.renderToText(this.prop(p.name));
      } else if (p.target === "replace") {
        p.data = this.commentValue(p.element.textContent);
        const ph = p.element.ownerDocument.createTextNode(
          this.renderToText(this.prop(p.name))
        );
        p.element.replaceWith(ph);
      } else if (p.target === "visibility") {
        if (p.element === component.template) {
          this.rootVisibilityProp = this.prop(p.name);
        } else {
          const pre = p.element.ownerDocument.createElement("div");
          pre.setAttribute(INTERNAL_COND_ATTRIBUTE, this.prop(p.name));
          p.element.before(pre);
          const post = p.element.ownerDocument.createElement("div");
          post.setAttribute(INTERNAL_COND_ATTRIBUTE, "");
          p.element.after(post);
        }
      } else if (p.target === "map") {
        p.element.setAttribute(INTERNAL_MAP_ATTRIBUTE, this.prop(p.name));
      } else if (p.target === "class") {
        this.applyClassProp(p);
      } else {
        p.data = this.commentValue(p.element.getAttribute(p.target));
        p.element.setAttribute(
          p.target, this.renderToAttribute(this.prop(p.name))
        );
      }
    }
  }

  applyClassProp(p: Prop) {
    p.element.setAttribute(p.target, this.renderToAttribute(this.prop(p.name)));
  }

  applyChanges(xml: Element) {
    this.applyImageImports(xml);
  }

  applyImageImports(xml: Element) {
    const images = xml.parentElement!.querySelectorAll("img");
    this.hasImages = images.length > 0;
    this.imageImports = [];
    if (this.config.importImageFiles) {
      for (const img of images) {
        const src = img.getAttribute("src");
        if (src?.startsWith(this.config.assetsPath)) {
          const id = fileToId(baseName(src));
          img.setAttribute("src", this.renderToAttribute(id));
          img.removeAttribute("srcset");
          this.imageImports.push([id, src]);
        }
      }
    }
  }

  commentValue(
    value: string | null,
    cut?: boolean,
  ): string | undefined {
    let v = (value ? value.replace(/\s+/g, " ") : "").trim();
    if (v === "") {
      return undefined;
    }
    if (v.length > 30 && cut !== false) {
      v = v.substring(0, 27) + "...";
    }
    return v;
  }

  prop(id: string) {
    return `props.${id}`;
  }

  renderToText(statement: string) {
    return `{${statement}}`;
  }

  renderToAttribute(statement: string) {
    return `#tsx{${statement}}`;
  }

  renderJsx(component: Component, xml: string): string {
    return r(
      this.renderImports(),
      this.renderProps(component.name, component.props),
      this.renderConsts(component.props),
      "",
      `${this.renderSignature(component.name)} (`,
      indentRows(this.renderXml(xml)),
      ");",
      "",
      `export default ${component.name};`,
    );
  }

  renderImports(): string {
    return r(this.imageImports.map(
      ([id, src]) => `import ${id} from "${src}";`)
    );
  }

  renderProps(name: string, props: Prop[]): string | false {
    return props.length > 0 && r(
      "",
      `export interface ${name}Props {`,
      r(props.map(
        p => `  ${this.renderPropName(p)}: ${this.renderPropType(p)}`
      )),
      "}",
    );
  }

  renderPropName(p: Prop): string {
    return ["map", "visibility", "class"].includes(p.target)
      ? `${p.name}?` : p.name;
  }

  renderPropType(p: Prop): string {
    if (p.type === "fixed") {
      if (p.target === "visibility") {
        return "boolean,";
      }
      if (p.target === "slot" || p.target === "replace") {
        return `${this.renderElementType()},${p.data ? ` // ${p.data}` : ""}`;
      }
      if (p.target === "class") {
        return "{ [cls: string]: boolean },";
      }
      if (p.target === "map") {
        return `${this.renderMapType(p)},`;
      }
    }
    return `${p.type},${p.data ? ` // ${p.data}` : ""}`;
  }

  renderElementType(): string {
    return "Element";
  }

  renderMapType(_p: Prop): string {
    return "{ [k: string]: any }";
  }

  renderConsts(_props: Prop[]): string | false {
    return false;
  }

  renderSignature(name: string) {
    return [
      "export const ",
      this.renderComponentNameAndType(name),
      " = (props) =>",
      this.renderSwitch(this.rootVisibilityProp),
    ].join("");
  }

  renderComponentNameAndType(name: string) {
    return name;
  }

  renderSwitch(propName: string | null): string {
    return propName !== null ? ` ${propName} &&` : "";
  }

  renderXml(xml: string): string {
    return xml
      .replace(/"#tsx{(.+?)}"/gi, "{$1}")
      .replace(mapRegExp, "{...$1}")
      .replace(condStartRegExp, "{$1 && (")
      .replace(condEndRegExp, ")}");
  }

  doesUseLib(): boolean {
    return false;
  }
}
