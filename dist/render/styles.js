"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styleToObject = styleToObject;
exports.toCamelCase = toCamelCase;
exports.classNamesToObject = classNamesToObject;
exports.classNamesJson = classNamesJson;
const strings_1 = require("../data/strings");
function styleToObject(src) {
    const out = {};
    for (const part of src.split(";")) {
        const d = part.trim();
        if (d !== "") {
            const [property, value] = d.split(":", 2);
            out[toCamelCase(property.trimEnd())] = value.trimStart();
        }
    }
    return out;
}
function toCamelCase(property) {
    const p = property.toLowerCase();
    if (p === "float") {
        return "cssFloat";
    }
    if (p.startsWith("-ms-")) {
        return (0, strings_1.kebabToCamelCase)(p.substring(1));
    }
    return (0, strings_1.kebabToCamelCase)(p);
}
function classNamesToObject(src) {
    const out = {};
    for (const name of src.split(" ")) {
        out[name.trim()] = true;
    }
    return out;
}
function classNamesJson(src) {
    return JSON.stringify(classNamesToObject(src), null, 2);
}
