"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactRender = void 0;
const strings_1 = require("../data/strings");
const BaseRender_1 = require("./BaseRender");
const html_1 = require("./html");
const styles_1 = require("./styles");
const RENAME_ATTRIBUTES = [
    ["class", "className"],
    ["for", "htmlFor"],
    ["value", "defaultValue"],
    ...html_1.CAMEL_ATTRIBUTES.map(a => [a.toLowerCase(), a]),
    ...html_1.KEBAB_ATTRIBUTES.map(a => [a, (0, strings_1.kebabToCamelCase)(a)]),
    ...html_1.FULLSTOP_ATTRIBUTES.map(a => [a, (0, strings_1.kebabToCamelCase)(a.replace(":", "-"))]),
];
class ReactRender extends BaseRender_1.BaseRender {
    constructor() {
        super(...arguments);
        this.usesLib = false;
        this.styleObjects = [];
    }
    getRenameAttributes() {
        return RENAME_ATTRIBUTES;
    }
    applyClassProp(p) {
        p.data = this.commentValue(p.element.getAttribute("class"), false);
        p.element.setAttribute("class", this.renderToAttribute(`classResolve(${this.prop(p.name)}${p.data ? `, ${p.name}Defaults` : ""})`));
        this.usesLib = true;
    }
    applyChanges(xml) {
        super.applyChanges(xml);
        this.applyStyleObjects(xml);
    }
    applyStyleObjects(xml) {
        this.styleObjects = [];
        for (const elem of xml.querySelectorAll("[style]")) {
            const value = elem.getAttribute("style");
            if (value) {
                const i = this.styleObjects.length;
                this.styleObjects.push((0, styles_1.styleToObject)(value));
                elem.setAttribute("style", this.renderToAttribute(`inlineStyles[${i}]`));
            }
        }
    }
    renderImports(props) {
        return (0, strings_1.r)(`import React${this.renderJsxImport(props)} from "react";`, this.hasImages && this.config.useNextJsImages
            && "import Image from \"next/image\";", this.usesLib && "import { classResolve } from \"./tsxlinkLib\";", super.renderImports(props));
    }
    renderJsxImport(props) {
        if (props.find(p => p.target === "map")) {
            return ", { JSX }";
        }
        return "";
    }
    renderElementType() {
        return "React.ReactNode";
    }
    renderMapType(p) {
        const tag = p.element.tagName.toLowerCase();
        return `JSX.IntrinsicElements["${tag}"]`;
    }
    renderConsts(props) {
        const cls = props.filter(p => p.target === "class" && p.data !== undefined);
        return (cls.length > 0 || this.styleObjects.length > 0) && (0, strings_1.r)(cls.map(p => (0, strings_1.r)("", `const ${p.name}Defaults = ${(0, styles_1.classNamesJson)(p.data)};`)), this.styleObjects.length > 0 && (0, strings_1.r)("", `const inlineStyles = ${JSON.stringify(this.styleObjects, null, 2)};`));
    }
    renderComponentNameAndType(name, props) {
        return `${name}: React.FC${props.length > 0 ? `<${name}Props>` : ""}`;
    }
    renderXml(xml) {
        const out = super.renderXml(xml);
        return this.config.useNextJsImages
            ? out.replace(/<img\s([^>]*)>/g, "<Image $1>") : out;
    }
    doesUseLib() {
        return this.usesLib;
    }
}
exports.ReactRender = ReactRender;
