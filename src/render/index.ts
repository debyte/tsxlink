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
): Promise<[component: FileData, assets: FileData[], usesLib: boolean]> {
  component.name = safeId(component.name);
  for (const prop of component.props) {
    prop.name = safeId(prop.name);
  }
  const dropAttrs = config.dropAttributes.map(
    m => wildcardRegexp(m, "\\s", "=\"[^\"]*\"", "gi")
  );
  const dropStyles = dropAttrs.some(re => " style=\"\"".match(re));
  const state = rewriteTemplateDom(component, config, dropStyles);
  const jsx = renderFC(component, state, config.useNextJsImages, dropAttrs);
  return [
    { baseName: `${component.name}.tsx`, content: jsx },
    await docs.copyFiles(".", state.copyFromTo),
    state.hasClasses,
  ];
}

const renderFC = (
  component: Component,
  state: RewriteResult,
  nextImages: boolean,
  dropAttrs: RegExp[],
): string => r(
  renderImports(state.hasImages && nextImages, state.hasClasses),
  renderProps(component),
  renderClassNames(component.props),
  renderStyles(state.styles),
  "",
  `${renderSignature(component)} => ${renderSwitch(state.rootVisibility)}(`,
  indentRows(
    rewriteTemplateHtml(component.template.outerHTML, nextImages, dropAttrs)
  ),
  ");",
  "",
  `export default ${component.name};`,
);

const renderImports = (useImages: boolean, useClassmap: boolean): string => r(
  "import React from \"react\";",
  useImages && "import { Image } from \"next/image\";",
  useClassmap && "import { tsxlinkClass } from \"./tsxlinkLib\";",
);

const renderProps = (component: Component): string | false =>
  component.props.length > 0 && r(
    "",
    `export interface ${component.name}Props {`,
    r(component.props.map(p =>
      `  ${p.name}${isOptionalProp(p) ? "?" : ""}: ${renderPropType(p)},`
    )),
    "}",
  );

const isOptionalProp = (p: Prop): boolean =>
  ["map", "visibility", "class"].includes(p.target);

function renderPropType(p: Prop): string {
  if (p.type === "fixed") {
    if (p.target === "visibility") {
      return "boolean";
    }
    if (p.target === "slot" || p.target === "replace") {
      return "React.ReactNode";
    }
    if (p.target === "class") {
      return "{ [cls: string]: boolean }";
    }
    if (p.target === "map") {
      const cls = p.element.constructor.name;
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
      `  { ${component.props.map(p => p.name).join(", ")} }`,
      ")",
    ) : " = ()";

const renderSwitch = (name?: string): string =>
  name !== undefined ? `${name} && ` : "";

const renderClassNames = (props: Prop[]): string => r(props.map(
  p => p.target === "class" && p.data !== undefined && r(
    "",
    `const ${p.name}Defaults = {`,
    r(p.data.split(" ").map(n => `  "${n}": true,`)),
    "};"
  )
));

const renderStyles = (styles: StyleObject[]): string | false =>
  styles.length > 0 && r(
    "",
    `const inlineStyles = ${JSON.stringify(styles, null, 2)};`,
  );

const r = (...rows: (string | false)[] | (string | false)[][]) =>
  rows.flatMap(r => r).filter(r => r !== false).join("\n");
