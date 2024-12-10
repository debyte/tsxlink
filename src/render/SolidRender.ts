import { r } from "../data/strings";
import { Prop } from "../types";
import { BaseRender } from "./BaseRender";
import { classNamesJson } from "./styles";

export class SolidRender extends BaseRender {

  getRenameAttributes(): [from: string, to: string][] {
    return [["classlist", "classList"]];
  }

  applyClassProp(p: Prop): void {
    p.data = this.commentValue(p.element.getAttribute("class"), false);
    p.element.setAttribute("classlist", this.renderToAttribute(
      `{ ${p.data ? `...${p.name}Defaults, ` : ""}...${this.prop(p.name)} }`
    ));
    p.element.removeAttribute("class");
  }

  renderImports(): string {
    return r(
      "import { Component, JSX } from \"solid-js\";",
      super.renderImports(),
    );
  }

  renderElementType(): string {
    return "JSX.Element";
  }

  renderMapType(_p: Prop): string {
    return "{ [attr: string]: unknown }";
  }

  renderConsts(props: Prop[]): string | false {
    return r(
      props.map(p => p.target === "class" && p.data !== undefined && r(
        "",
        `const ${p.name}Defaults = ${classNamesJson(p.data)};`,
      )),
    );
  }

  renderComponentNameAndType(name: string) {
    return `${name}: Component<${name}Props>`;
  }
}
