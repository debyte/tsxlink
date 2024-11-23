"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDefaults = exports.DEFAULT_IMAGE_DIR = exports.DEFAULT_STYLE_FILE = exports.DEFAULT_ASSETS_DIR = exports.DEFAULT_COMPONENT_DIR = void 0;
exports.runInteractiveInit = runInteractiveInit;
const promises_1 = __importDefault(require("readline/promises"));
exports.DEFAULT_COMPONENT_DIR = "./src/components/tsxlink";
exports.DEFAULT_ASSETS_DIR = "./src/app/tsxlink";
exports.DEFAULT_STYLE_FILE = "export.css";
exports.DEFAULT_IMAGE_DIR = "images";
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
        key: "exportStyleElements",
        prompt: "Export CSS from possible style elements to assets",
        default: "yes",
    },
    {
        key: "copyCssFiles",
        prompt: "Copy separate CSS files to assets",
        default: "yes",
    },
    {
        key: "copyJsFiles",
        prompt: "Copy separate JS files to assets",
        default: "no",
    },
    {
        key: "componentDir",
        prompt: "A directory to write TSX presentation components",
        default: exports.DEFAULT_COMPONENT_DIR,
    },
    {
        key: "assetsDir",
        prompt: "A directory to write and copy CSS & JS",
        default: exports.DEFAULT_ASSETS_DIR,
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
    },
];
const applyDefaults = (config) => ({
    version: config.version || 1,
    sourceType: config.sourceType || "custom",
    source: config.source,
    exportStyleElements: config.exportStyleElements || true,
    copyCssFiles: config.copyCssFiles || true,
    copyJsFiles: config.copyJsFiles || false,
    componentDir: config.componentDir || exports.DEFAULT_COMPONENT_DIR,
    assetsDir: config.assetsDir || exports.DEFAULT_ASSETS_DIR,
    styleFile: config.styleFile || exports.DEFAULT_STYLE_FILE,
    imageDir: config.imageDir || exports.DEFAULT_IMAGE_DIR,
    ignoreFiles: config.ignoreFiles || [],
    ignoreStyles: config.ignoreStyles || [],
});
exports.applyDefaults = applyDefaults;
async function runInteractiveInit(current) {
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
        exportStyleElements: isTrue(map.get("exportStyleElements")),
        copyCssFiles: isTrue(map.get("copyCssFiles")),
        copyJsFiles: isTrue(map.get("copyJsFiles")),
        componentDir: map.get("componentDir"),
        assetsDir: map.get("assetsDir"),
        styleFile: (current === null || current === void 0 ? void 0 : current.styleFile) || exports.DEFAULT_STYLE_FILE,
        imageDir: (current === null || current === void 0 ? void 0 : current.imageDir) || exports.DEFAULT_IMAGE_DIR,
        ignoreFiles: (current === null || current === void 0 ? void 0 : current.ignoreFiles) || [],
        ignoreStyles: (current === null || current === void 0 ? void 0 : current.ignoreStyles) || [],
        configExtension: map.get("configExtension"),
    };
}
function getChoiceDefault(current, choice) {
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
        if (typeof current === "boolean") {
            return current ? "yes" : "no";
        }
        return String(current);
    }
    return choice.default || null;
}
function getPrompt(prompt, def, options) {
    const lines = [`${prompt}:`];
    if (options) {
        const padLength = Math.max(...options.map(opt => opt[0].length));
        for (const opt of options) {
            lines.push(`  * ${opt[0].padEnd(padLength)}   ${opt[1]}`);
        }
    }
    lines.push(`  (${def}) `);
    return lines.join("\n");
}
const isTrue = (val) => (val !== undefined
    && ["yes", "y", "true", "t", "1"].includes(val.toLowerCase()));
