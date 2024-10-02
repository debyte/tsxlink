import fs from "fs/promises";
import path from "path";
import { Config, ConfigExtension } from "./types";

export const readConfig = (baseName: string) => returnFirstConfig([
  () => findFiles(baseName, ["mjs"], async (filePath: string) => {
    return eval(`import("${filePath}").then(m => m.default);`) as Config;
  }),
  () => findFiles(baseName, ["cjs", "js"], async (filePath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(filePath) as Config;
  }),
  () => findFiles(baseName, ["json"], async (filePath: string) => {
    return JSON.parse(await fs.readFile(filePath, "utf-8")) as Config;
  }),
]);

const returnFirstConfig = async (
  attempts: Array<() => Promise<Config | null>>
) => {
  for (const attempt of attempts) {
    const config = await attempt();
    if (config !== null) {
      return config;
    }
  }
  return null;
};

const findFiles = async (
  baseName: string,
  extensions: ConfigExtension[],
  loader: (filePath: string) => Promise<Config>,
): Promise<Config | null> => {
  for (const ext of extensions) {
    const p = absPath(baseName, ext);
    if (await fileExists(p)) {
      const config = await loader(p);
      config.configExtension = ext;
      return config;
    }
  }
  return null;
};

const fileExists = async (filePath: string) => {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
};

export const writeConfig = async (
  baseName: string,
  ext: ConfigExtension,
  config: Config,
) => {
  const json = JSON.stringify(config, null, 2);
  if (ext === "mjs") {
    await writeFile(baseName, ext, `export default ${json}\n`)
  } else if (ext === "cjs" || ext === "js") {
    await writeFile(baseName, ext, `module.exports = ${json};\n`);
  } else if (ext === "json") {
    await writeFile(baseName, ext, `${json}\n`);
  }
};

const writeFile = async (
  baseName: string,
  ext: ConfigExtension,
  content: string,
) => {
  await fs.writeFile(absPath(baseName, ext), content, "utf-8");
};

export const removeConfig = async (baseName: string, ext: ConfigExtension) => {
  await fs.unlink(absPath(baseName, ext));
};

const absPath = (baseName: string, ext: ConfigExtension) =>
  path.resolve(`./${baseName}.${ext}`);
