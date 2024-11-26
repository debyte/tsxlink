"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TARGET_PRIORITY = exports.PROP_TARGET_WITH_FIXED_TYPE = exports.isPropType = exports.INPUT_PROP_TYPES = exports.NamedProp = void 0;
const NamedObject_1 = require("./NamedObject");
class NamedProp extends NamedObject_1.NamedObject {
    constructor(name, template, target) {
        super(name);
        this.type = [];
        this.target = target !== undefined ? [target] : [];
        this.templates = [template];
    }
    merge(other) {
        this.type.push(...other.type);
        this.target.push(...other.target);
        this.templates.push(...other.templates);
    }
    resolveTypeAndTarget() {
        if (this.prop) {
            return this.prop;
        }
        let target = this.acceptTarget();
        let type = (target && exports.PROP_TARGET_WITH_FIXED_TYPE.includes(target)) ? "fixed" : this.acceptType();
        if (target === null || type === null) {
            const templateTargets = this.templateTargets();
            if (target === null) {
                if (type === null && this.name === "visibility") {
                    target = "visibility";
                    type = "fixed";
                }
                else if (type === null && this.name === "map") {
                    target = "map";
                    type = "fixed";
                }
                else {
                    target = "text";
                    const changed = templateTargets.filter(t => t.content.some(s => s !== t.content[0]));
                    if (changed.length > 0) {
                        let idx = 0;
                        if (changed[0].name.toLowerCase() === "id" && changed.length > 1) {
                            idx = 1;
                        }
                        target = changed[idx].name;
                    }
                }
            }
            if (type === null) {
                type = "string";
                const templates = templateTargets.find(t => t.name === target);
                if (templates && templates.content.length > 0) {
                    if (templates.content.every(s => s === "")) {
                        type = "boolean";
                    }
                    else if (templates.content.every(s => !isNaN(Number(s)))) {
                        type = "number";
                    }
                }
            }
        }
        this.prop = { name: this.name, type, target, element: this.templates[0] };
        return this.prop;
    }
    acceptType() {
        if (this.type.length > 0) {
            for (const type of exports.INPUT_PROP_TYPES) {
                if (this.type.includes(type)) {
                    return type;
                }
            }
        }
        return null;
    }
    acceptTarget() {
        if (this.target.length > 0) {
            for (const target of exports.TARGET_PRIORITY) {
                if (this.target.includes(target)) {
                    return target;
                }
            }
            return this.target[0];
        }
        return null;
    }
    templateTargets() {
        const parts = new NamedObject_1.NamedObjectSet();
        for (const template of this.templates) {
            if (template.textContent) {
                parts.merge(new NamedTarget("text", template.textContent));
            }
            for (const attr of template.attributes) {
                parts.merge(new NamedTarget(attr.name, attr.value));
            }
        }
        return parts.all();
    }
}
exports.NamedProp = NamedProp;
;
exports.INPUT_PROP_TYPES = ["string", "number", "boolean"];
const isPropType = (s) => exports.INPUT_PROP_TYPES.includes(s);
exports.isPropType = isPropType;
exports.PROP_TARGET_WITH_FIXED_TYPE = ["visibility", "map", "slot"];
exports.TARGET_PRIORITY = ["text", "visibility", "map", "slot"];
class NamedTarget extends NamedObject_1.NamedObject {
    constructor(name, content) {
        super(name);
        this.content = content !== undefined ? [content] : [];
    }
    merge(other) {
        this.content.push(...other.content);
    }
}
