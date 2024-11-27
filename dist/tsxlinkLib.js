"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classResolve = classResolve;
function classResolve(classes, defaults) {
    const resolved = { ...defaults || {}, ...classes };
    return Object.keys(resolved).reduce((className, k) => resolved[k] ? `${className} ${k}` : className);
}
