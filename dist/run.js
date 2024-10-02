"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const config_1 = require("./config");
const config_init_1 = require("./config-init");
const run = async () => {
    console.log(",=0=0=0=0=(__    T  S  X    L  I  N  K    __)=0=0=0=0='");
    const isInit = process.argv.includes("init");
    const config = await (0, config_1.readConfig)();
    // Usage
    if (config === null && !isInit) {
        console.log([
            "Link components from HTML design systems to presentation TSX in React.",
            "Read more at https://github.com/debyte/tsxlink",
            "Usage:",
            "  Run `tsxlink init` to interactively configure the link.",
            "  Once configured, run `tsxlink [source]` to synchronize changes.",
            "(No configuration in project root: `tsxlink.config.(mjs|cjs|js|json)`)",
        ].join("\n"));
        process.exit(0);
    }
    // Configure
    if (isInit) {
        const newConfig = {
            version: 1,
            ...await (0, config_init_1.runInteractiveInit)(config || {}),
        };
        const ext = newConfig.configExtension;
        newConfig.configExtension = undefined;
        if (config && config.configExtension && ext !== config.configExtension) {
            await (0, config_1.removeConfig)(config.configExtension);
        }
        await (0, config_1.writeConfig)(ext, newConfig);
        console.log("Configuration succesfully written.");
        process.exit(0);
    }
    // Run
    if (process.argv.length < 3 && config.source === undefined) {
        console.log("Provide a source as command line argument (or in configuration).");
        process.exit(0);
    }
    // TODO parse and render
    console.log(config);
};
exports.run = run;
