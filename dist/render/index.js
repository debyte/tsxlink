"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectRender = selectRender;
const BaseRender_1 = require("./BaseRender");
const ReactRender_1 = require("./ReactRender");
const SolidRender_1 = require("./SolidRender");
function selectRender(docs, config) {
    if (config.targetType === "solid") {
        return new SolidRender_1.SolidRender(docs, config);
    }
    if (config.targetType === "react") {
        return new ReactRender_1.ReactRender(docs, config);
    }
    return new BaseRender_1.BaseRender(docs, config);
}
