import { readConfig, removeConfig, writeConfig } from "./config";
import { createDocPool } from "./data";
import { removeMissingFiles, writeFiles } from "./data/files";
import { applyDefaults, runInteractiveInit } from "./init";
import { selectParser } from "./parse";
import { renderFC } from "./render";
import { Config, FileData } from "./types";

export const run = async () => {
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
  const docs = await createDocPool(source);
  if (docs === null) {
    pr("The provided source is not an existing path or a valid HTTP URL.");
    process.exit(0);
  }

  // Process
  pr("Parsing and synchronizing.")
  const parser = selectParser(docs, config.sourceType);
  const components = await parser.getComponents();
  const tsxFileNames = await Promise.all(
    await writeAndLogFiles(
      true,
      config.targetDir,
      components.map(component => ({
        baseName: `${component.name}.tsx`,
        content: renderFC(component),
      })),
    )
  );
  await Promise.all(
    await removeAndLogFiles(config.targetDir, tsxFileNames)
  );
  const publicFileNames = await Promise.all([
    ...await writeAndLogFiles(
      config.writeCssFiles,
      config.targetPublicDir,
      await parser.getPublicCssFiles(),
    ),
    ...await writeAndLogFiles(
      config.writeJsFiles,
      config.targetPublicDir,
      await parser.getPublicJsFiles(),
    ),
  ]);
  await Promise.all(
    await removeAndLogFiles(config.targetPublicDir, publicFileNames)
  );
  const n = tsxFileNames.length + publicFileNames.length;
  pr(`Synchronized ${n} linked files.`);
};

const writeAndLogFiles = async (
  writeFlag: boolean,
  dirPath: string,
  files: FileData[],
): Promise<Promise<string>[]> => (
  writeFlag
    ? prNamePromises(await writeFiles(dirPath, files), name => `  + ${name}`)
    : []
);

const removeAndLogFiles = async (dirPath: string, keepFileNames: string[]) =>
  prNamePromises(
    await removeMissingFiles(dirPath, keepFileNames),
    name => `  - ${name}`,
  );

const prNamePromises = (
  promises: Promise<string>[],
  format: (name: string) => string,
): Promise<string>[] =>
  promises.map(async namePromise => {
    const name = await namePromise;
    pr(format(name));
    return name;
  });

const pr = (...lines: string[]) => console.log(lines.join("\n"));
