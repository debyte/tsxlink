"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.r = void 0;
exports.wildcardRegexp = wildcardRegexp;
exports.kebabToCamelCase = kebabToCamelCase;
const r = (...rows) => rows.flatMap(r => r).filter(r => r !== false).join("\n");
exports.r = r;
function wildcardRegexp(match) {
    const m = match
        .replace(/(?<!\\)\?/g, ".?")
        .replace(/(?<!\\)\*/g, ".*");
    return new RegExp(`^${m}$`);
}
const kebabRegexp = /-(\w|$)/g;
function kebabToCamelCase(src) {
    return src.replace(kebabRegexp, (_, l) => l.toUpperCase());
}
