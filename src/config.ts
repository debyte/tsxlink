import path from "path";
import {
  fileExists,
  readTextFile,
  removeFile,
  writeTextFile,
} from "./data/files";
import { filePath } from "./data/paths";
import { Config, ConfigExtension } from "./types";

export const CONFIG_NAME = "tsxlink.config";

export const readConfig = () => returnFirstConfig([
  [["mjs"], async (filePath: string) => {
    const p = path.resolve(filePath);
    return eval(`import("${p}").then(m => m.default);`) as Config;
  }],
  [["cjs", "js"], async (filePath: string) => {
    const p = path.resolve(filePath);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(p) as Config;
  }],
  [["json"], async (filePath: string) => {
    return JSON.parse(await readTextFile(filePath)) as Config;
  }],
]);

async function returnFirstConfig(
  attempts: Array<[
    extensions: ConfigExtension[],
    loader: (filePath: string) => Promise<Config>,
  ]>
): Promise<Config | null> {
  for (const [extensions, loader] of attempts) {
    for (const ext of extensions) {
      const filePath = confPath(ext);
      if (await fileExists(filePath)) {
        const config = await loader(filePath);
        config.configExtension = ext;
        return config;
      }
    }
  }
  return null;
}

export async function writeConfig(
  extension: ConfigExtension,
  config: Config,
): Promise<string> {
  const filePath = confPath(extension);
  const json = JSON.stringify(config, null, 2);
  if (extension === "mjs") {
    await writeTextFile(
      filePath,
      `const tsxlinkConfig = ${json};\n\nexport default tsxlinkConfig;\n`
    );
  } else if (extension === "cjs" || extension === "js") {
    await writeTextFile(filePath, `module.exports = ${json};\n`);
  } else if (extension === "json") {
    await writeTextFile(filePath, `${json}\n`);
  }
  return filePath;
}

export async function removeConfig(extension: ConfigExtension) {
  await removeFile(confPath(extension));
}

const confPath = (extension: string) => filePath(".", CONFIG_NAME, extension);
