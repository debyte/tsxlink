"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STYLE_FILE = exports.DEFAULT_ASSETS_PATH = exports.DEFAULT_ASSETS_DIR = exports.DEFAULT_COMPONENT_DIR = void 0;
exports.applyDefaults = applyDefaults;
exports.runInteractiveInit = runInteractiveInit;
const promises_1 = __importDefault(require("readline/promises"));
const paths_1 = require("./data/paths");
exports.DEFAULT_COMPONENT_DIR = "./src/components/tsxlink";
exports.DEFAULT_ASSETS_DIR = "./public/tsxlink";
exports.DEFAULT_ASSETS_PATH = "/tsxlink";
exports.DEFAULT_STYLE_FILE = "export.css";
const INIT_CHOICES = [
    {
        key: "targetType",
        prompt: "The type of created TSX files",
        options: [
            ["react", "React (https://react.dev/)"],
            ["solid", "SolidJS (https://www.solidjs.com/)"],
        ],
    },
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
        key: "copyCssFiles",
        prompt: "Copy any separate CSS files to assets",
        default: "yes",
    },
    {
        key: "copyJsFiles",
        prompt: "Copy any separate JS files to assets",
        default: "no",
    },
    {
        key: "exportStyleElements",
        prompt: "Export CSS from possible style elements to assets",
        default: "yes",
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
        key: "assetsPath",
        prompt: [
            "Either an URL path to assets directory as served over network or a",
            "relative path for use with Next.js <Image> components and style",
            "imports. (\"@\" can be used to construct a relative path automatically)",
        ].join("\n"),
        default: exports.DEFAULT_ASSETS_PATH,
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
function applyDefaults(config) {
    const rt = {
        version: config.version || 1,
        targetType: config.targetType || "solid",
        sourceType: config.sourceType || "custom",
        source: config.source,
        copyCssFiles: config.copyCssFiles || true,
        copyJsFiles: config.copyJsFiles || false,
        exportStyleElements: config.exportStyleElements || true,
        componentDir: config.componentDir || exports.DEFAULT_COMPONENT_DIR,
        assetsDir: config.assetsDir || exports.DEFAULT_ASSETS_DIR,
        assetsPath: config.assetsPath || exports.DEFAULT_ASSETS_PATH,
        styleFile: config.styleFile || exports.DEFAULT_STYLE_FILE,
        ignoreFiles: config.ignoreFiles || [],
        dropStyles: config.dropStyles || [],
        dropAttributes: config.dropAttributes || [],
        importImageFiles: config.importImageFiles || false,
        useNextJsImages: config.useNextJsImages || false,
    };
    if (rt.assetsPath === "@") {
        rt.assetsPath = (0, paths_1.relativePath)(rt.componentDir, rt.assetsDir);
    }
    return rt;
}
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
        targetType: map.get("targetType"),
        sourceType: map.get("sourceType"),
        source: map.get("source"),
        copyCssFiles: isTrue(map.get("copyCssFiles")),
        copyJsFiles: isTrue(map.get("copyJsFiles")),
        exportStyleElements: isTrue(map.get("exportStyleElements")),
        componentDir: map.get("componentDir"),
        assetsDir: map.get("assetsDir"),
        assetsPath: map.get("assetsPath"),
        styleFile: (current === null || current === void 0 ? void 0 : current.styleFile) || exports.DEFAULT_STYLE_FILE,
        ignoreFiles: (current === null || current === void 0 ? void 0 : current.ignoreFiles) || [],
        dropStyles: (current === null || current === void 0 ? void 0 : current.dropStyles) || [],
        dropAttributes: (current === null || current === void 0 ? void 0 : current.dropAttributes) || [],
        importImageFiles: (current === null || current === void 0 ? void 0 : current.importImageFiles) || false,
        useNextJsImages: (current === null || current === void 0 ? void 0 : current.useNextJsImages) || false,
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
