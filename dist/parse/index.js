"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectParser = void 0;
const BaseParser_1 = require("./BaseParser");
const selectParser = (docs, sourceType) => {
    if (sourceType === "webflow/export") {
        // Ignore
    }
    return new BaseParser_1.BaseParser(docs);
};
exports.selectParser = selectParser;
