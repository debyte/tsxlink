import {
  absPath,
  fileExists,
  readTextFile,
  removeFile,
  writeTextFile,
} from "./files";
import { Config, ConfigExtension } from "./types";

export const CONFIG_NAME = "tsxlink.config";

export const readConfig = () => returnFirstConfig([
  () => tryToLoadConfig(["mjs"], async (filePath: string) => {
    return eval(`import("${filePath}").then(m => m.default);`) as Config;
  }),
  () => tryToLoadConfig(["cjs", "js"], async (filePath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(filePath) as Config;
  }),
  () => tryToLoadConfig(["json"], async (filePath: string) => {
    return JSON.parse(await readTextFile(filePath)) as Config;
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

const tryToLoadConfig = async (
  extensions: ConfigExtension[],
  loader: (filePath: string) => Promise<Config>,
): Promise<Config | null> => {
  for (const ext of extensions) {
    const filePath = confPath(ext);
    if (await fileExists(filePath)) {
      const config = await loader(filePath);
      config.configExtension = ext;
      return config;
    }
  }
  return null;
};

export const writeConfig = async (ext: ConfigExtension, config: Config) => {
  const json = JSON.stringify(config, null, 2);
  if (ext === "mjs") {
    await writeTextFile(confPath(ext), `export default ${json}\n`);
  } else if (ext === "cjs" || ext === "js") {
    await writeTextFile(confPath(ext), `module.exports = ${json};\n`);
  } else if (ext === "json") {
    await writeTextFile(confPath(ext), `${json}\n`);
  }
};

export const removeConfig = async (ext: ConfigExtension) => {
  await removeFile(confPath(ext));
};

const confPath = (extension: string) => absPath([".", CONFIG_NAME], extension);
