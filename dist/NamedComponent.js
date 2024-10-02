"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamedComponent = void 0;
const NamedObject_1 = require("./NamedObject");
class NamedComponent extends NamedObject_1.NamedObject {
    constructor(name, template) {
        super(name);
        this.templates = [template];
    }
    merge(other) {
        this.templates.push(...other.templates);
    }
}
exports.NamedComponent = NamedComponent;
;
