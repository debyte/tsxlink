import { DocPool } from "../data/DocPool";
import { wildcardRegexp } from "../data/paths";
import { Component, FileData, Prop, RuntimeConfig } from "../types";
import { safeId } from "./ids";
import { indentRows } from "./indent";
import {
  RewriteResult,
  rewriteTemplateDom,
  rewriteTemplateHtml,
} from "./rewrite";
import { StyleObject } from "./styles";

export async function renderComponent(
  config: RuntimeConfig,
  docs: DocPool,
  component: Component,
): Promise<[component: FileData, assets: FileData[]]> {
  component.name = safeId(component.name);
  for (const prop of component.props) {
    prop.name = safeId(prop.name);
  }
  // TODO add prop for class names
  const dropAttrs = config.dropAttributes.map(
    m => wildcardRegexp(m, "\\s", "=\"[^\"]*\"", "gi")
  );
  const dropStyles = dropAttrs.some(re => " style=\"\"".match(re));
  const state = rewriteTemplateDom(component, config, dropStyles);
  const jsx = renderFC(component, state, config, dropAttrs);
  return [
    { baseName: `${component.name}.tsx`, content: jsx },
    await docs.copyFiles(".", state.copyFromTo),
  ];
}

const renderFC = (
  component: Component,
  state: RewriteResult,
  config: RuntimeConfig,
  dropAttrs: RegExp[],
): string => r(
  "import React from \"react\";",
  state.hasImages && config.useNextJsImages
  && "import { Image } from \"next/image\";",
  "",
  renderProps(component),
  `${renderSignature(component)} => ${renderVisibility(state.rootVisibility)}(`,
  indentRows(rewriteTemplateHtml(
    component.template.outerHTML,
    config.useNextJsImages,
    dropAttrs,
  )),
  ");",
  "",
  renderStyles(state.styles),
  `export default ${component.name};`,
);

const renderProps = (component: Component): string | false =>
  component.props.length > 0 && r(
    `export interface ${component.name}Props {`,
    r(component.props.map(p =>
      `  ${p.name}${isOptionalProp(p) ? "?" : ""}: ${renderPropType(p)},`
    )),
    "}",
    "",
  );

const isOptionalProp = (p: Prop): boolean =>
  ["map", "visibility"].includes(p.target);

function renderPropType(p: Prop): string {
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

const renderSignature = (component: Component) =>
  `export const ${component.name}: React.FC${renderFCProps(component)}`;

const renderFCProps = (component: Component): string =>
  component.props.length > 0
    ? r(
      `<${component.name}Props> = (`,
      `  { ${component.props.map(prop => prop.name).join(", ")} }`,
      ")",
    )
    : " = ()"

const renderVisibility = (name?: string): string =>
  name !== undefined ? `${name} && ` : "";

const renderStyles = (styles: StyleObject[]): string | false =>
  styles.length > 0 && r(
    `const styles = ${JSON.stringify(styles, null, 2)};`,
    "",
  );

const r = (...rows: (string | false)[] | (string | false)[][]) =>
  rows.flatMap(r => r).filter(r => r !== false).join("\n");
