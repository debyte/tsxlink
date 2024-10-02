"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamedObjectSet = exports.NamedObject = void 0;
class NamedObject {
    constructor(name) {
        this.name = name;
    }
    nameIsEqual(other) {
        return this.name === other.name;
    }
}
exports.NamedObject = NamedObject;
class NamedObjectSet {
    constructor() {
        this.set = [];
    }
    merge(...others) {
        for (const other of others) {
            const i = this.set.findIndex(o => o.nameIsEqual(other));
            if (i >= 0) {
                this.set[i].merge(other);
            }
            else {
                this.set.push(other);
            }
        }
    }
    all() {
        return this.set;
    }
}
exports.NamedObjectSet = NamedObjectSet;
