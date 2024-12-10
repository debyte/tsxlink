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
    renderImports() {
        return (0, strings_1.r)("import { Component, JSX } from \"solid-js\";", super.renderImports());
    }
    renderElementType() {
        return "JSX.Element";
    }
    renderMapType(_p) {
        return "{ [attr: string]: unknown }";
    }
    renderConsts(props) {
        return (0, strings_1.r)(props.map(p => p.target === "class" && p.data !== undefined && (0, strings_1.r)("", `const ${p.name}Defaults = ${(0, styles_1.classNamesJson)(p.data)};`)));
    }
    renderComponentNameAndType(name) {
        return `${name}: Component<${name}Props>`;
    }
}
exports.SolidRender = SolidRender;
