import {
  INTERNAL_COND_ATTRIBUTE,
  INTERNAL_MAP_ATTRIBUTE,
} from "./parse/attributes";
import { Component, Prop } from "./types";

export const renderFC = (c: Component) => r(
  "import React from \"react\";",
  renderProps(c),
  `export const ${c.name}: ${renderFCType(c)} = (`,
  `  { ${c.props.map(p => p.name).join(", ")} }`,
  `) => ${renderVisibility(c.rootVisibility)}(`,
  indentRows(renderDOM(c.template)),
  ");",
  "",
  `export default ${c.name};`,
);

const renderProps = (c: Component) => c.props.length > 0
  ? r(
    "",
    `export interface ${c.name}Props {`,
    r(c.props.map(p =>
      `  ${p.name}${isOptionalProp(p) ? "?" : ""}: ${renderPropType(p)},`
    )),
    "}",
    "",
  ) : "";

const isOptionalProp = (p: Prop) =>
  ["map", "visibility"].includes(p.target);

function renderPropType(p: Prop) {
  if (p.type === "fixed") {
    if (p.target === "visibility") {
      return "boolean";
    }
    if (p.target === "slot") {
      return "React.ReactNode";
    }
    if (p.target === "map") {
      const reactClass = ATTR_TYPES.get(p.elementClass) || "AllHTMLAttributes"
      return `React.${reactClass}<${p.elementClass}>`;
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

const renderFCType = (c: Component) =>
  `React.FC${c.props.length > 0 ? `<${c.name}Props>` : ""}`;

const renderVisibility = (name?: string) =>
  name !== undefined ? `${name} && ` : "";

function renderDOM(template: string) {
  return template
    .replace(/"{tsx:(\w+)}"/gi, "{$1}")
    .replace(mapRegExp, "{...$1}")
    .replace(condStartRegExp, "{$1 && (")
    .replace(condEndRegExp, ")}")
    .replace(/ class="([^"]*)"/gi, " className=\"$1\"")
    .replace(closeTagsRegexp, "<$1$2/>");
}

const mapRegExp = new RegExp(`${INTERNAL_MAP_ATTRIBUTE}="(\\w+)"`, "gi");
const condStartRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}="(\\w+)"></div>`, "gi"
);
const condEndRegExp = new RegExp(
  `<div ${INTERNAL_COND_ATTRIBUTE}=""></div>`, "gi"
);
const singletonTags = [
  "area", "base", "br", "col", "command", "embed", "hr", "img", "input",
  "keygen", "link", "meta", "param", "source", "track", "wbr",
];
const closeTagsRegexp = new RegExp(
  `<(${singletonTags.join("|")})( ([^>]*[^/])?)?>`, "gi"
);

function indentRows(src: string) {
  const rows = src.replace("\t", "  ").split("\n");
  if (rows.length > 0) {
    const ind = getIndent(rows[0]);
    if (ind > 2) {
      rows[0] = rows[0].substring(ind - 2);
    } else if (ind < 2) {
      rows[0] = addIndent(rows[0], 2 - ind);
    }
    if (rows.length > 1) {
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
    }
  }
  return r(rows);
}

function getIndent(row: string) {
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== " ") {
      return i;
    }
  }
  return row.length;
}

function addIndent(row: string, num: number) {
  const spaces = new Array(num).fill(" ").join("");
  return `${spaces}${row}`;
}

const r = (...rows: string[] | string[][]) => rows.flatMap(r => r).join("\n");
