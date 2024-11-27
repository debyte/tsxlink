"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderComponent = renderComponent;
const paths_1 = require("../data/paths");
const ids_1 = require("./ids");
const indent_1 = require("./indent");
const rewrite_1 = require("./rewrite");
async function renderComponent(config, docs, component) {
    component.name = (0, ids_1.safeId)(component.name);
    for (const prop of component.props) {
        prop.name = (0, ids_1.safeId)(prop.name);
    }
    const dropAttrs = config.dropAttributes.map(m => (0, paths_1.wildcardRegexp)(m, "\\s", "=\"[^\"]*\"", "gi"));
    const dropStyles = dropAttrs.some(re => " style=\"\"".match(re));
    const state = (0, rewrite_1.rewriteTemplateDom)(component, config, dropStyles);
    const jsx = renderFC(component, state, config.useNextJsImages, dropAttrs);
    return [
        { baseName: `${component.name}.tsx`, content: jsx },
        await docs.copyFiles(".", state.copyFromTo),
        state.hasClasses,
    ];
}
const renderFC = (component, state, nextImages, dropAttrs) => r(renderImports(state.hasImages && nextImages, state.hasClasses), renderProps(component), renderClassNames(component.props), renderStyles(state.styles), "", `${renderSignature(component)} => ${renderSwitch(state.rootVisibility)}(`, (0, indent_1.indentRows)((0, rewrite_1.rewriteTemplateHtml)(component.template.outerHTML, nextImages, dropAttrs)), ");", "", `export default ${component.name};`);
const renderImports = (useImages, useClassmap) => r("import React from \"react\";", useImages && "import Image from \"next/image\";", useClassmap && "import { tsxlinkClass } from \"./tsxlinkLib\";");
const renderProps = (component) => component.props.length > 0 && r("", `export interface ${component.name}Props {`, r(component.props.map(p => `  ${p.name}${isOptionalProp(p) ? "?" : ""}: ${renderPropType(p)}`)), "}");
const isOptionalProp = (p) => ["map", "visibility", "class"].includes(p.target);
function renderPropType(p) {
    if (p.type === "fixed") {
        if (p.target === "visibility") {
            return "boolean,";
        }
        if (p.target === "slot" || p.target === "replace") {
            return `React.ReactNode,${p.data ? ` // ${p.data}` : ""}`;
        }
        if (p.target === "class") {
            return "{ [cls: string]: boolean },";
        }
        if (p.target === "map") {
            const cls = p.element.constructor.name;
            const reactClass = ATTR_TYPES.get(cls) || "AllHTMLAttributes";
            return `React.${reactClass}<${cls}>,`;
        }
    }
    return `${p.type},${p.data ? ` // ${p.data}` : ""}`;
}
const ATTR_TYPES = new Map([
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
const renderSignature = (component) => `export const ${component.name}: React.FC${renderFCProps(component)}`;
const renderFCProps = (component) => component.props.length > 0
    ? r(`<${component.name}Props> = (`, `  { ${component.props.map(p => p.name).join(", ")} }`, ")") : " = ()";
const renderSwitch = (name) => name !== undefined ? `${name} && ` : "";
const renderClassNames = (props) => props.map(p => p.target === "class" && p.data !== undefined && r("", `const ${p.name}Defaults = {`, r(p.data.split(" ").map(n => `  "${n}": true,`)), "};"));
const renderStyles = (styles) => styles.length > 0 && r("", `const inlineStyles = ${JSON.stringify(styles, null, 2)};`);
const r = (...rows) => rows.flatMap(r => r).filter(r => r !== false).join("\n");
