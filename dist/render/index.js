"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFC = renderFC;
const ids_1 = require("./ids");
const indent_1 = require("./indent");
const rewrite_1 = require("./rewrite");
function renderFC(component) {
    component.name = (0, ids_1.safeId)(component.name);
    for (const prop of component.props) {
        prop.name = (0, ids_1.safeId)(prop.name);
    }
    const { rootVisibilityProp, styles } = (0, rewrite_1.rewriteTemplateDom)(component);
    return r("import React from \"react\";", renderProps(component), `export const ${component.name}: ${renderFCType(component)} = (`, `  { ${component.props.map(prop => prop.name).join(", ")} }`, `) => ${renderVisibility(rootVisibilityProp)}(`, (0, indent_1.indentRows)((0, rewrite_1.rewriteTemplateHtml)(component.template.outerHTML)), ");", renderStyles(styles), `export default ${component.name};`);
}
const renderProps = (component) => component.props.length > 0 ? r("", `export interface ${component.name}Props {`, r(component.props.map(p => `  ${p.name}${isOptionalProp(p) ? "?" : ""}: ${renderPropType(p)},`)), "}", "") : "";
const isOptionalProp = (p) => ["map", "visibility"].includes(p.target);
function renderPropType(p) {
    const cls = p.element.constructor.name;
    if (p.type === "fixed") {
        if (p.target === "visibility") {
            return "boolean";
        }
        if (p.target === "slot") {
            return "React.ReactNode";
        }
        if (p.target === "map") {
            const reactClass = ATTR_TYPES.get(cls) || "AllHTMLAttributes";
            return `React.${reactClass}<${cls}>`;
        }
    }
    return p.type;
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
const renderFCType = (component) => `React.FC${component.props.length > 0 ? `<${component.name}Props>` : ""}`;
const renderVisibility = (name) => name !== undefined ? `${name} && ` : "";
const renderStyles = (styles) => styles.length > 0 ? r("", `const styles = ${JSON.stringify(styles, null, 2)};`, "") : "";
const r = (...rows) => rows.flatMap(r => r).join("\n");
