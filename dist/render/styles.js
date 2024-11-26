"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styleToObject = styleToObject;
function styleToObject(src) {
    const out = {};
    for (const part of (src || "").split(";")) {
        const d = part.trim();
        if (d !== "") {
            const [property, value] = d.split(":", 2);
            out[toCamelCase(property.trimEnd())] = value.trimStart();
        }
    }
    return out;
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
