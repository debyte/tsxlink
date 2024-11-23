import readline from "readline/promises";
import {
  Config,
  ConfigExtension,
  InitChoice,
  InitChoiceOption,
  RuntimeConfig,
  SourceType,
} from "./types";

export const DEFAULT_COMPONENT_DIR = "./src/components/tsxlink";
export const DEFAULT_ASSETS_DIR = "./src/app/tsxlink";
export const DEFAULT_STYLE_FILE = "export.css";
export const DEFAULT_IMAGE_DIR = "images";

const INIT_CHOICES: InitChoice[] = [
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
    default: DEFAULT_COMPONENT_DIR,
  },
  {
    key: "assetsDir",
    prompt: "A directory to write and copy CSS & JS",
    default: DEFAULT_ASSETS_DIR,
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

export const applyDefaults = (config: Config): RuntimeConfig => ({
  version: config.version || 1,
  sourceType: config.sourceType || "custom",
  source: config.source,
  exportStyleElements: config.exportStyleElements || true,
  copyCssFiles: config.copyCssFiles || true,
  copyJsFiles: config.copyJsFiles || false,
  componentDir: config.componentDir || DEFAULT_COMPONENT_DIR,
  assetsDir: config.assetsDir || DEFAULT_ASSETS_DIR,
  styleFile: config.styleFile || DEFAULT_STYLE_FILE,
  imageDir: config.imageDir || DEFAULT_IMAGE_DIR,
  ignoreFiles: config.ignoreFiles || [],
  ignoreStyles: config.ignoreStyles || [],
});

export async function runInteractiveInit(
  current?: Config
): Promise<Config> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const map = new Map<string, string>();
  for (const choice of INIT_CHOICES) {
    const def = getChoiceDefault(
      current ? current[choice.key] : undefined,
      choice,
    );
    if (choice.options) {
      let key: string | undefined = undefined;
      let input: string | undefined = undefined;
      while (!key) {
        input = (await rl.question(input === undefined
          ? getPrompt(choice.prompt, def || "", choice.options)
          : getPrompt("Unknown key, insert one listed above", def || "")
        )).trim();
        if (def && input === "") {
          key = def;
        } else {
          const opt = choice.options.find(opt => opt[0] === input);
          key = opt && opt[0];
        }
      }
      map.set(choice.key, key);
    } else {
      const input = (await rl.question(
        getPrompt(choice.prompt, def || "")
      )).trim();
      if (input === "") {
        if (def !== null) {
          map.set(choice.key, def);
        }
      } else {
        map.set(choice.key, input);
      }
    }
  }
  return {
    sourceType: map.get("sourceType") as SourceType,
    source: map.get("source"),
    exportStyleElements: isTrue(map.get("exportStyleElements")),
    copyCssFiles: isTrue(map.get("copyCssFiles")),
    copyJsFiles: isTrue(map.get("copyJsFiles")),
    componentDir: map.get("componentDir"),
    assetsDir: map.get("assetsDir"),
    styleFile: current?.styleFile || DEFAULT_STYLE_FILE,
    imageDir: current?.imageDir || DEFAULT_IMAGE_DIR,
    ignoreFiles: current?.ignoreFiles || [],
    ignoreStyles: current?.ignoreStyles || [],
    configExtension: map.get("configExtension") as ConfigExtension,
  };
}

function getChoiceDefault(
  current: string | number | boolean | string[] | undefined,
  choice: InitChoice,
) {
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

function getPrompt(
  prompt: string,
  def: string,
  options?: InitChoiceOption[],
) {
  const lines: string[] = [`${prompt}:`];
  if (options) {
    const padLength = Math.max(...options.map(opt => opt[0].length));
    for (const opt of options) {
      lines.push(`  * ${opt[0].padEnd(padLength)}   ${opt[1]}`);
    }
  }
  lines.push(`  (${def}) `);
  return lines.join("\n");
}

const isTrue = (val: string | undefined) => (
  val !== undefined
  && ["yes", "y", "true", "t", "1"].includes(val.toLowerCase())
);
