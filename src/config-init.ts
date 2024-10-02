import readline from "readline/promises";
import { Config, ConfigExtension, SourceType } from "./types";

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
    key: "targetDir",
    prompt: "A target directory for TSX presentation components",
    default: "./src/components/tsxlink",
  },
  {
    key: "targetPublicDir",
    prompt: "A target directory for public CSS/JS files",
    default: "./public/tsxlink",
  },
  {
    key: "copyCSS",
    prompt: "Copy any CSS files to public directory",
    default: "no",
  },
  {
    key: "copyJS",
    prompt: "Copy any JS files to public directory",
    default: "no",
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

export type InitChoice = {
  key: keyof Config;
  prompt: string;
  options?: InitChoiceOption[];
  default?: string;
}

export type InitChoiceOption = [
  key: string,
  description: string,
  isDefault?: boolean,
];

export const runInteractiveInit = async (
  current?: Config
): Promise<Config> => {
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
    targetDir: map.get("targetDir"),
    targetPublicDir: map.get("targetPublicDir"),
    copyCSS: isTrue(map.get("copyCSS")),
    copyJS: isTrue(map.get("copyJS")),
    configExtension: map.get("configExtension") as ConfigExtension,
  };
};

const getChoiceDefault = (
  current: string | number | boolean | undefined,
  choice: InitChoice,
) => {
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
};

const getPrompt = (
  prompt: string,
  def: string,
  options?: InitChoiceOption[],
) => {
  const lines: string[] = [`${prompt}:`];
  if (options) {
    const padLength = Math.max(...options.map(opt => opt[0].length));
    for (const opt of options) {
      lines.push(`  * ${opt[0].padEnd(padLength)}   ${opt[1]}`);
    }
  }
  lines.push(`  (${def}) `);
  return lines.join("\n");
};

const isTrue = (val: string | undefined) => (
  val !== undefined
  && ["yes", "y", "true", "t", "1"].includes(val.toLowerCase())
);
