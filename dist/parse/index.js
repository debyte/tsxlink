"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectParser = selectParser;
const BaseParser_1 = require("./BaseParser");
function selectParser(docs, config) {
    if (config.sourceType === "webflow/export") {
        // Ignore
    }
    return new BaseParser_1.BaseParser(docs, config);
}
