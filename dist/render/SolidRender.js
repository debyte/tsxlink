"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolidRender = void 0;
const strings_1 = require("../data/strings");
const BaseRender_1 = require("./BaseRender");
const styles_1 = require("./styles");
class SolidRender extends BaseRender_1.BaseRender {
    getRenameAttributes() {
        return [["classlist", "classList"]];
    }
    applyClassProp(p) {
        p.data = this.commentValue(p.element.getAttribute("class"), false);
        p.element.setAttribute("classlist", this.renderToAttribute(`{ ${p.data ? `...${p.name}Defaults, ` : ""}...${this.prop(p.name)} }`));
        p.element.removeAttribute("class");
    }
    renderImports(props) {
        return (0, strings_1.r)(`import { Component${this.renderJsxImport(props)} } from "solid-js";`, super.renderImports(props));
    }
    renderJsxImport(props) {
        if (props.find(p => ["slot", "replace", "map"].includes(p.target))) {
            return ", JSX";
        }
        return "";
    }
    renderElementType() {
        return "JSX.Element";
    }
    renderMapType(p) {
        const tag = p.element.tagName.toLowerCase();
        return `JSX.IntrinsicElements["${tag}"]`;
    }
    renderConsts(props) {
        const cls = props.filter(p => p.target === "class" && p.data !== undefined);
        return cls.length > 0 && (0, strings_1.r)(cls.map(p => (0, strings_1.r)("", `const ${p.name}Defaults = ${(0, styles_1.classNamesJson)(p.data)};`)));
    }
    renderComponentNameAndType(name, props) {
        return `${name}: Component${props.length > 0 ? `<${name}Props>` : ""}`;
    }
}
exports.SolidRender = SolidRender;
