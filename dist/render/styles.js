"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styleToObject = styleToObject;
exports.toCamelCase = toCamelCase;
const CssFilterAndFixUrls_1 = require("../data/CssFilterAndFixUrls");
const paths_1 = require("../data/paths");
function styleToObject(src, assetsPath) {
    const out = {};
    const copy = [];
    const css = new CssFilterAndFixUrls_1.CssFilterAndFixUrls("", () => true, name => (0, paths_1.filePath)(assetsPath, name));
    for (const part of (src || "").split(";")) {
        const d = part.trim();
        if (d !== "") {
            const [property, rawValue] = d.split(":", 2);
            css.copy = [];
            out[toCamelCase(property.trimEnd())] = css.value(rawValue.trimStart());
            copy.push(...css.copy);
        }
    }
    return [out, copy];
}
const dashRegexp = /-(\w|$)/g;
function toCamelCase(property) {
    const p = property.toLowerCase();
    if (p === "float") {
        return "cssFloat";
    }
    if (p.startsWith("-ms-")) {
        return p.substring(1).replace(dashRegexp, (_, l) => l.toUpperCase());
    }
    return p.replace(dashRegexp, (_, l) => l.toUpperCase());
}
