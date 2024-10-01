import { Component, Prop } from "./types";

const from = (...rows: string[]) => rows.join("\n");

export const renderFC = (c: Component) => from(
  "import React from \"react\";",
  "",
  `export interface ${c.name}Props {`,
  from(...c.props.map(p => renderPropDefinition(p, c.elementClass))),
  "}",
  "",
  `export const ${c.name}: React.FC<${c.name}Props> = (`,
  `  { ${c.props.map(p => p.name).join(", ")} }`,
  ") => (",
  indentRows(renderDOM(c.template)),
  ");",
  "",
  `export default ${c.name};`,
);

const renderPropDefinition = (p: Prop, cls: string) =>
  `  ${p.name}${isOptional(p) ? "?" : ""}: ${renderPropType(p, cls)},`;

const isOptional = (p: Prop) =>
  ["map", "visibility"].includes(p.target);

const renderPropType = (p: Prop, cls: string) => {
  if (p.type === "fixed") {
    if (p.target === "visibility") {
      return "boolean";
    }
    if (p.target === "slot") {
      return "React.ReactNode";
    }
    if (p.target === "map") {
      return `React.${ATTRIBUTE_TYPES.get(cls) || "AllHTMLAttributes"}<${cls}>`;
    }
  }
  return p.type;
};

const ATTRIBUTE_TYPES = new Map<string, string>([
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

const renderDOM = (template: string) => {
  return template
    .replace(/"{tsx:(\w+)}"/g, "{$1}")
    .replace(/data-tsx-map="(\w+)"/g, "{...$1}")
    .replace(/<div data-tsx-cond="(\w+)"><\/div>/g, "{$1 && (")
    .replace(/<div data-tsx-cond=""><\/div>/g, ")}")
};

const indentRows = (src: string) => {
  const rows = src.replace("\t", "  ").split("\n");
  const ind = getIndent(rows[0]);
  if (ind > 2) {
    rows[0] = rows[0].substring(ind - 2);
  } else if (ind < 2) {
    rows[0] = addIndent(rows[0], 2 - ind);
  }
  const nInd = getIndent(rows[1]);
  if (nInd > 4) {
    for (let i = 1; i < rows.length; i++) {
      rows[i] = rows[i].substring(nInd - 4);
    }
  } else if (nInd < 4) {
    for (let i = 1; i < rows.length; i++) {
      rows[i] = addIndent(rows[i], 4 - nInd);
    }
  }
  return rows.join("\n");
};

const getIndent = (row: string) => {
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== " ") {
      return i;
    }
  }
  return row.length;
};

const addIndent = (row: string, num: number) => {
  const spaces = new Array(num).fill(" ").join("");
  return `${spaces}${row}`;
};
