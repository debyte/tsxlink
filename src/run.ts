import { readConfig, removeConfig, writeConfig } from "./config";
import { createDocPool } from "./data";
import { removeMissingFiles, writeFiles } from "./data/files";
import { applyDefaults, runInteractiveInit } from "./init";
import { selectParser } from "./parse";
import { BaseParser } from "./parse/BaseParser";
import { renderFC } from "./render";
import { Config, FileData, RuntimeConfig } from "./types";

export async function run() {
  pr(",=0=0=0=0=(__    T  S  X    L  I  N  K    __)=0=0=0=0='");
  const isUsage = ["help", "--help", "-h"].some(
    arg => process.argv.includes(arg)
  );
  const isInit = process.argv.includes("init");
  const storedConfig = isUsage ? null : await readConfig();

  // Usage
  if (isUsage || (storedConfig === null && !isInit)) {
    pr(
      "Link components from HTML design systems to presentation TSX in React.",
      "Read more at https://github.com/debyte/tsxlink",
      "Usage:",
      "  Run `tsxlink help` to show this usage.",
      "  Run `tsxlink init` to interactively configure the link.",
      "  Once configured, run `tsxlink [source]` to synchronize changes.",
    );
    if (!isUsage && storedConfig === null) {
      pr("No configuration found at `tsxlink.config.(mjs|cjs|js|json)`.");
    }
    process.exit(0);
  }

  // Configure
  if (isInit) {
    const newConfig: Config = {
      version: 1,
      ...await runInteractiveInit(storedConfig || {}),
    };
    const ext = newConfig.configExtension!;
    newConfig.configExtension = undefined;
    if (storedConfig?.configExtension && ext !== storedConfig.configExtension) {
      await removeConfig(storedConfig.configExtension);
    }
    const filePath = await writeConfig(ext, newConfig);
    pr(`Configuration succesfully written to ${filePath}`);
    process.exit(0);
  }
  const config = applyDefaults(storedConfig!);

  // Check source
  const source = process.argv.length > 2 ? process.argv[2] : config.source;
  if (source === undefined) {
    pr("Provide data source as a command line argument (or in configuration).");
    process.exit(0);
  }
  const docs = await createDocPool(source, config.ignoreFiles);
  if (docs === null) {
    pr("The provided source is not an existing path or a valid HTTP URL.");
    process.exit(0);
  }

  // Process
  pr("Parsing and synchronizing.")
  const parser = selectParser(docs, config);
  const tsxFiles = await syncComponents(parser, config);
  const assetsFiles = await syncAssets(parser, config);
  pr(`Synchronized ${tsxFiles.length + assetsFiles.length} linked files.`);
}

async function syncComponents(
  parser: BaseParser,
  config: RuntimeConfig,
): Promise<string[]> {
  const components = await parser.getComponents();
  const fileNames = await Promise.all(
    await writeAndLogFiles(
      config.componentDir,
      components.map(component => {
        const content = renderFC(component);
        return { baseName: `${component.name}.tsx`, content };
      }),
    )
  );
  await Promise.all(await removeAndLogFiles(config.componentDir, fileNames));
  return fileNames;
}

async function syncAssets(
  parser: BaseParser,
  config: RuntimeConfig,
): Promise<string[]> {
  const fileNamePromises: Promise<string>[] = [];
  if (config.exportStyleElements) {
    fileNamePromises.push(...await writeAndLogFiles(
      config.assetsDir, await parser.getStyleElements(),
    ));
  }
  if (config.copyCssFiles) {
    for (const writeAndCopy of await parser.getSeparateCssFiles()) {
      fileNamePromises.push(...await writeAndLogFiles(
        config.assetsDir, await writeAndCopy,
      ));
    }
  }
  if (config.copyJsFiles) {
    fileNamePromises.push(...await writeAndLogFiles(
      config.assetsDir, await parser.getSeparateJsFiles(),
    ));
  }
  const fileNames = await Promise.all(fileNamePromises);
  await Promise.all(await removeAndLogFiles(
    config.assetsDir, [...fileNames, config.imageDir]
  ));
  return fileNames;
}

async function writeAndLogFiles(dirPath: string, files: FileData[]) {
  return prNamePromises(
    await writeFiles(dirPath, files),
    name => ` + ${name}`,
  );
}

async function removeAndLogFiles(dirPath: string, keepFileNames: string[]) {
  return prNamePromises(
    await removeMissingFiles(dirPath, keepFileNames),
    name => `  - ${name}`,
  );
}

function prNamePromises(
  promises: Promise<string>[],
  format: (name: string) => string,
): Promise<string>[] {
  return promises.map(async namePromise => {
    const name = await namePromise;
    pr(format(name));
    return name;
  });
}

const pr = (...lines: string[]) => console.log(lines.join("\n"));
