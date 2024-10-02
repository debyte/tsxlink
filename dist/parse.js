"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.selectParser = void 0;
const BaseParser_1 = require("./BaseParser");
const selectParser = () => {
    // TODO Support configurable parser instances
    return new BaseParser_1.BaseParser();
};
exports.selectParser = selectParser;
const parse = async (pool) => {
    const parser = (0, exports.selectParser)();
    return (await parser.parseComponentDesigns(pool)).map(c => {
        const props = parser.parsePropDesigns(c);
        return {
            name: c.name,
            props: props.map(p => p.resolveTypeAndTarget()),
            template: parser.exportTemplate(c, props),
        };
    });
};
exports.parse = parse;
