"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRender = void 0;
const DomFilterAndEdit_1 = require("../data/DomFilterAndEdit");
const paths_1 = require("../data/paths");
const strings_1 = require("../data/strings");
const html_1 = require("./html");
const ids_1 = require("./ids");
const indent_1 = require("./indent");
const INTERNAL_MAP_ATTRIBUTE = "data-tsx-map";
const INTERNAL_COND_ATTRIBUTE = "data-tsx-cond";
const mapRegExp = new RegExp(`${INTERNAL_MAP_ATTRIBUTE}="([\\w\\.]+)"`, "gi");
const condStartRegExp = new RegExp(`<div ${INTERNAL_COND_ATTRIBUTE}="([\\w\\.]+)"/>`, "gi");
const condEndRegExp = new RegExp(`<div ${INTERNAL_COND_ATTRIBUTE}=""/>`, "gi");
class BaseRender {
    constructor(docs, config) {
        this.rootVisibilityProp = null;
        this.hasImages = false;
        this.imageImports = new Map();
        this.docs = docs;
        this.config = config;
        this.dropTags = this.getDropTags();
        this.dropAttrs = this.getDropAttributes();
        this.limitAttrs = this.getLimitAttributes();
        this.renameAttrs = this.getRenameAttributes();
    }
    async render(component) {
        this.sanitizeNames(component);
        this.applyProps(component);
        const [xml, copy] = this.transform(component);
        const jsx = this.renderJsx(component, xml);
        return [
            { baseName: `${component.name}.tsx`, content: jsx },
            await this.docs.copyFiles(".", copy),
        ];
    }
    transform(component) {
        const [xml, root, copy] = DomFilterAndEdit_1.DomFilterAndEdit.runWithCopyFiles(component.template, this.config.assetsPath, this.dropTags, this.dropAttrs, this.limitAttrs, this.renameAttrs);
        this.applyChanges(root);
        const out = xml.serialize();
        const m = out.match(/<root>(.*?)<\/root>/s);
        return [m !== null ? m[1] : "", copy];
    }
    getDropTags() {
        return [/^style$/];
    }
    getDropAttributes() {
        return [
            /^on[A-Z]\w+$/,
            ...html_1.FORBIDDEN_ATTRIBUTES.map(m => (0, strings_1.wildcardRegexp)(m)),
            ...this.config.dropAttributes.map(m => (0, strings_1.wildcardRegexp)(m)),
        ];
    }
    getLimitAttributes() {
        return html_1.LIMITED_ATTRIBUTES;
    }
    getRenameAttributes() {
        return [];
    }
    sanitizeNames(component) {
        component.name = (0, ids_1.safeId)(component.name);
        for (const prop of component.props) {
            prop.name = (0, ids_1.safeId)(prop.name);
        }
    }
    applyProps(component) {
        this.rootVisibilityProp = null;
        for (const p of component.props) {
            if (p.target === "text" || p.target === "slot"
                || (p.target === "replace" && p.element === component.template)) {
                p.data = this.commentValue(p.element.textContent);
                p.element.textContent = this.renderToText(this.prop(p.name));
            }
            else if (p.target === "replace") {
                p.data = this.commentValue(p.element.textContent);
                const ph = p.element.ownerDocument.createTextNode(this.renderToText(this.prop(p.name)));
                p.element.replaceWith(ph);
            }
            else if (p.target === "visibility") {
                if (p.element === component.template) {
                    this.rootVisibilityProp = this.prop(p.name);
                }
                else {
                    const pre = p.element.ownerDocument.createElement("div");
                    pre.setAttribute(INTERNAL_COND_ATTRIBUTE, this.prop(p.name));
                    p.element.before(pre);
                    const post = p.element.ownerDocument.createElement("div");
                    post.setAttribute(INTERNAL_COND_ATTRIBUTE, "");
                    p.element.after(post);
                }
            }
            else if (p.target === "map") {
                p.element.setAttribute(INTERNAL_MAP_ATTRIBUTE, this.prop(p.name));
            }
            else if (p.target === "class") {
                this.applyClassProp(p);
            }
            else {
                p.data = this.commentValue(p.element.getAttribute(p.target));
                p.element.setAttribute(p.target, this.renderToAttribute(this.prop(p.name)));
            }
        }
    }
    applyClassProp(p) {
        p.element.setAttribute(p.target, this.renderToAttribute(this.prop(p.name)));
    }
    applyChanges(xml) {
        this.applyImageImports(xml);
    }
    applyImageImports(xml) {
        const images = xml.querySelectorAll("img");
        this.hasImages = images.length > 0;
        this.imageImports.clear();
        if (this.config.importImageFiles) {
            for (const img of images) {
                const src = img.getAttribute("src");
                if (src === null || src === void 0 ? void 0 : src.startsWith(this.config.assetsPath)) {
                    const id = (0, paths_1.fileToId)((0, paths_1.baseName)(src));
                    img.setAttribute("src", this.renderToAttribute(id));
                    img.removeAttribute("srcset");
                    this.imageImports.set(id, src);
                }
            }
        }
    }
    commentValue(value, cut) {
        let v = (value ? value.replace(/\s+/g, " ") : "").trim();
        if (v === "") {
            return undefined;
        }
        if (v.length > 30 && cut !== false) {
            v = v.substring(0, 27) + "...";
        }
        return v;
    }
    prop(id) {
        return `props.${id}`;
    }
    renderToText(statement) {
        return `{${statement}}`;
    }
    renderToAttribute(statement) {
        return `#tsx{${statement}}`;
    }
    renderJsx(component, xml) {
        return (0, strings_1.r)(this.renderImports(component.props), this.renderProps(component.name, component.props), this.renderConsts(component.props), "", `${this.renderSignature(component.name, component.props)} (`, (0, indent_1.indentRows)(this.renderXml(xml)), ");", "", `export default ${component.name};`);
    }
    renderImports(_props) {
        return this.imageImports.size > 0 && (0, strings_1.r)(Array.from(this.imageImports.entries()).map(([id, src]) => `import ${id} from "${src}";`));
    }
    renderProps(name, props) {
        return props.length > 0 && (0, strings_1.r)("", `export interface ${name}Props {`, (0, strings_1.r)(props.map(p => `  ${this.renderPropName(p)}: ${this.renderPropType(p)}`)), "}");
    }
    renderPropName(p) {
        return ["map", "visibility", "class"].includes(p.target)
            ? `${p.name}?` : p.name;
    }
    renderPropType(p) {
        if (p.type === "fixed") {
            if (p.target === "visibility") {
                return "boolean,";
            }
            if (p.target === "slot" || p.target === "replace") {
                return `${this.renderElementType()},${p.data ? ` // ${p.data}` : ""}`;
            }
            if (p.target === "class") {
                return "{ [cls: string]: boolean },";
            }
            if (p.target === "map") {
                return `${this.renderMapType(p)},`;
            }
        }
        return `${p.type},${p.data ? ` // ${p.data}` : ""}`;
    }
    renderElementType() {
        return "Element";
    }
    renderMapType(_p) {
        return "{ [k: string]: any }";
    }
    renderConsts(_props) {
        return false;
    }
    renderSignature(name, props) {
        return [
            "export const ",
            this.renderComponentNameAndType(name, props),
            ` = (${props.length > 0 ? "props" : ""}) =>`,
            this.renderSwitch(this.rootVisibilityProp),
        ].join("");
    }
    renderComponentNameAndType(name, _props) {
        return name;
    }
    renderSwitch(propName) {
        return propName !== null ? ` ${propName} &&` : "";
    }
    renderXml(xml) {
        return xml
            .replace(/"#tsx{(.+?)}"/gi, "{$1}")
            .replace(mapRegExp, "{...$1}")
            .replace(condStartRegExp, "{$1 && (")
            .replace(condEndRegExp, ")}");
    }
    doesUseLib() {
        return false;
    }
}
exports.BaseRender = BaseRender;
