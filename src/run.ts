import { readConfig, removeConfig, writeConfig } from "./config";
import { runInteractiveInit } from "./config-init";
import { Config } from "./types";

const CONFIG_BASE = "tsxlink.config";

export const run = async () => {
  console.log(",=0=0=0=0=(__    T  S  X    L  I  N  K    __)=0=0=0=0='");
  const isInit = process.argv.includes("init");
  const config = await readConfig(CONFIG_BASE);

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
    const newConfig: Config = {
      version: 1,
      ...await runInteractiveInit(config || {}),
    };
    const ext = newConfig.configExtension!;
    newConfig.configExtension = undefined;
    if (config && config.configExtension && ext !== config.configExtension) {
      await removeConfig(CONFIG_BASE, config.configExtension);
    }
    await writeConfig(CONFIG_BASE, ext, newConfig);
    console.log("Configuration succesfully written.");
    process.exit(0);
  }

  // Run
  if (process.argv.length < 3 && config!.source === undefined) {
    console.log(
      "Provide a source as command line argument (or in configuration)."
    );
    process.exit(0);
  }

  // TODO parse and render
  console.log(config);
};
