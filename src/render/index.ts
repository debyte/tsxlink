import { DocPool } from "../data/DocPool";
import { Component, FileData, Prop, RuntimeConfig } from "../types";
import { safeId } from "./ids";
import { indentRows } from "./indent";
import { rewriteTemplateDom, rewriteTemplateHtml } from "./rewrite";
import { StyleObject } from "./styles";

export async function renderComponent(
  config: RuntimeConfig,
  docs: DocPool,
  component: Component,
): Promise<FileData[]> {
  component.name = safeId(component.name);
  for (const prop of component.props) {
    prop.name = safeId(prop.name);
  }
  const { rootVisibilityProp, styles, copyFromTo } =
    rewriteTemplateDom(component, config);
  return [
    {
      baseName: `${component.name}.tsx`,
      content: renderFC(component, rootVisibilityProp, styles),
    },
    ...(await docs.copyFiles(".", copyFromTo))
  ];
}

const renderFC = (
  component: Component,
  rootVisibilityProp: string | undefined,
  styles: StyleObject[],
): string => r(
  "import React from \"react\";",
  renderProps(component),
  `export const ${component.name}: ${renderFCType(component)} = (`,
  `  { ${component.props.map(prop => prop.name).join(", ")} }`,
  `) => ${renderVisibility(rootVisibilityProp)}(`,
  indentRows(
    rewriteTemplateHtml(component.template.outerHTML)
  ),
  ");",
  renderStyles(styles),
  `export default ${component.name};`,
);

const renderProps = (component: Component) =>
  component.props.length > 0 ? r(
    "",
    `export interface ${component.name}Props {`,
    r(component.props.map(p =>
      `  ${p.name}${isOptionalProp(p) ? "?" : ""}: ${renderPropType(p)},`
    )),
    "}",
    "",
  ) : "";

const isOptionalProp = (p: Prop) =>
  ["map", "visibility"].includes(p.target);

function renderPropType(p: Prop) {
  const cls = p.element.constructor.name;
  if (p.type === "fixed") {
    if (p.target === "visibility") {
      return "boolean";
    }
    if (p.target === "slot" || p.target === "replace") {
      return "React.ReactNode";
    }
    if (p.target === "map") {
      const reactClass = ATTR_TYPES.get(cls) || "AllHTMLAttributes"
      return `React.${reactClass}<${cls}>`;
    }
  }
  return p.type;
}

const ATTR_TYPES = new Map<string, string>([
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

const renderFCType = (component: Component) =>
  `React.FC${component.props.length > 0 ? `<${component.name}Props>` : ""}`;

const renderVisibility = (name?: string) =>
  name !== undefined ? `${name} && ` : "";

const renderStyles = (styles: StyleObject[]) =>
  styles.length > 0 ? r(
    "",
    `const styles = ${JSON.stringify(styles, null, 2)};`,
    "",
  ) : "";

const r = (...rows: string[] | string[][]) => rows.flatMap(r => r).join("\n");
