"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderFC = void 0;
const renderFC = (c) => [
    "import React from \"react\";",
    "",
    `export interface ${c.name}Props {`,
    c.props.map(p => renderPropDefinition(p)).join("\n"),
    "}",
    "",
    `export const ${c.name}: React.FC<${c.name}Props> = (`,
    `  { ${c.props.map(p => p.name).join(", ")} }`,
    ") => (",
    indentRows(renderDOM(c.template)),
    ");",
    "",
    `export default ${c.name};`,
].join("\n");
exports.renderFC = renderFC;
const renderPropDefinition = (p) => `  ${p.name}${isOptionalProp(p) ? "?" : ""}: ${renderPropType(p)},`;
const isOptionalProp = (p) => ["map", "visibility"].includes(p.target);
const renderPropType = (p) => {
    if (p.type === "fixed") {
        if (p.target === "visibility") {
            return "boolean";
        }
        if (p.target === "slot") {
            return "React.ReactNode";
        }
        if (p.target === "map") {
            const reactClass = ATTR_TYPES.get(p.elementClass) || "AllHTMLAttributes";
            return `React.${reactClass}<${p.elementClass}>`;
        }
    }
    return p.type;
};
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
const renderDOM = (template) => {
    return template
        .replace(/"{tsx:(\w+)}"/g, "{$1}")
        .replace(/data-tsx-map="(\w+)"/g, "{...$1}")
        .replace(/<div data-tsx-cond="(\w+)"><\/div>/g, "{$1 && (")
        .replace(/<div data-tsx-cond=""><\/div>/g, ")}");
};
const indentRows = (src) => {
    const rows = src.replace("\t", "  ").split("\n");
    if (rows.length > 0) {
        const ind = getIndent(rows[0]);
        if (ind > 2) {
            rows[0] = rows[0].substring(ind - 2);
        }
        else if (ind < 2) {
            rows[0] = addIndent(rows[0], 2 - ind);
        }
        if (rows.length > 1) {
            const nInd = getIndent(rows[1]);
            if (nInd > 4) {
                for (let i = 1; i < rows.length; i++) {
                    rows[i] = rows[i].substring(nInd - 4);
                }
            }
            else if (nInd < 4) {
                for (let i = 1; i < rows.length; i++) {
                    rows[i] = addIndent(rows[i], 4 - nInd);
                }
            }
        }
    }
    return rows.join("\n");
};
const getIndent = (row) => {
    for (let i = 0; i < row.length; i++) {
        if (row[i] !== " ") {
            return i;
        }
    }
    return row.length;
};
const addIndent = (row, num) => {
    const spaces = new Array(num).fill(" ").join("");
    return `${spaces}${row}`;
};
