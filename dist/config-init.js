"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInteractiveInit = void 0;
const promises_1 = __importDefault(require("readline/promises"));
const INIT_CHOICES = [
    {
        key: "sourceType",
        prompt: "The type of source HTML",
        options: [
            ["custom", "Custom HTML relying on data-tsx* attributes.", true],
            ["webflow/export", "HTML exported from a Webflow.com site."],
        ],
    },
    {
        key: "source",
        prompt: "Source file, directory, or URL, unless provided on command line",
    },
    {
        key: "targetDir",
        prompt: "A target directory for writing TSX presentation components",
        default: "./src/components/presentation",
    },
    {
        key: "configExtension",
        prompt: "A type of config file `tsxlink.config.*` to create",
        options: [
            ["mjs", "ES module, i.e., export default {...}", true],
            ["cjs", "CommonJS module, i.e., module.exports = {...}"],
            ["js", "CommonJS module (using .js file extension)"],
            ["json", "JSON file"],
        ],
    }
];
const runInteractiveInit = async (current) => {
    const rl = promises_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const map = new Map();
    for (const choice of INIT_CHOICES) {
        const def = getChoiceDefault(current ? current[choice.key] : undefined, choice);
        if (choice.options) {
            let key = undefined;
            let input = undefined;
            while (!key) {
                input = (await rl.question(input === undefined
                    ? getPrompt(choice.prompt, def || "", choice.options)
                    : getPrompt("Unknown key, insert one listed above", def || ""))).trim();
                if (def && input === "") {
                    key = def;
                }
                else {
                    const opt = choice.options.find(opt => opt[0] === input);
                    key = opt && opt[0];
                }
            }
            map.set(choice.key, key);
        }
        else {
            const input = (await rl.question(getPrompt(choice.prompt, def || ""))).trim();
            if (input === "") {
                if (def !== null) {
                    map.set(choice.key, def);
                }
            }
            else {
                map.set(choice.key, input);
            }
        }
    }
    return {
        sourceType: map.get("sourceType"),
        source: map.get("source"),
        targetDir: map.get("targetDir"),
        configExtension: map.get("configExtension"),
    };
};
exports.runInteractiveInit = runInteractiveInit;
const getChoiceDefault = (current, choice) => {
    if (choice.options) {
        let opt = current
            ? choice.options.find(opt => opt[0] === current)
            : undefined;
        if (opt) {
            return opt[0];
        }
        opt = choice.options.find(opt => opt[2]);
        if (opt) {
            return opt[0];
        }
        return choice.default || null;
    }
    if (current !== undefined) {
        return String(current);
    }
    return choice.default || null;
};
const getPrompt = (prompt, def, options) => {
    const lines = [`${prompt}:`];
    if (options) {
        const padLength = Math.max(...options.map(opt => opt[0].length));
        for (const opt of options) {
            lines.push(`  * ${opt[0].padEnd(padLength)}   ${opt[1]}`);
        }
    }
    lines.push(`  (${def}) `);
    return lines.join("\n");
};
