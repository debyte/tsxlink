import { beforeAll, expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { applyDefaults } from "../src/init";
import { BaseParser } from "../src/parse/BaseParser";
import { NamedProp } from "../src/parse/NamedProp";
import {
  getReadmeHtmlExample,
  ONE_ELEMENT_COMPONENT,
  WEBFLOWISH_CODE,
} from "./helpers";

const docs = new DocPool();
const parser = new BaseParser(docs, applyDefaults({}));

beforeAll(async () => {
  docs.source = await getReadmeHtmlExample();
});

test("Should detect components from HTML with TSX attributes", async () => {
  const designs = await parser.parseComponentDesigns();
  const component = designs.find(({ name }) => name === "SearchResult");
  expect(component).toBeDefined();
  expect(component!.templates).toHaveLength(2);
});

test("Should detect properties from HTML with TSX attributes", async () => {
  const designs = await parser.parseComponentDesigns();
  const component = designs.find(({ name }) => name === "SearchResult");
  expect(component).toBeDefined();
  const props = await parser.parsePropDesigns(component!);
  const image = props.find(({ name }) => name === "image");
  expect(image).toBeDefined();
  expect(image!.type).toEqual([]);
  expect(image!.target).toEqual(["src", "src"]);
  expect(image!.templates).toHaveLength(2);
});

test("Sould detect property targets and types from HTML template", async () => {
  const designs = await parser.parseComponentDesigns();
  for (const component of designs) {
    const props = sortedPropsValues(await parser.parsePropDesigns(component));
    if (component.name === "Search") {
      expect(props).toEqual([
        ["button", "fixed", "map", "HTMLButtonElement"],
        ["loading", "fixed", "visibility", "HTMLDivElement"],
        ["query", "fixed", "map", "HTMLInputElement"],
        ["results", "fixed", "slot", "HTMLDivElement"],
      ]);
    }
    if (component.name === "SearchResult") {
      expect(props).toEqual([
        ["action", "string", "text", "HTMLButtonElement"],
        ["code", "number", "text", "HTMLSpanElement"],
        ["image", "string", "src", "HTMLImageElement"],
        ["map", "fixed", "map", "HTMLButtonElement"],
        ["name", "string", "text", "HTMLHeadingElement"],
      ]);
    }
  }
});

test("Should parse properties and slots from component element", async () => {
  const parser = new BaseParser(
    new DocPool(ONE_ELEMENT_COMPONENT), applyDefaults({})
  );
  const designs = await parser.parseComponentDesigns();
  expect(designs).toHaveLength(1);
  expect(designs[0].name).toEqual("StrangerThings");
  const props = sortedPropsValues(await parser.parsePropDesigns(designs[0]));
  props.sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0));
  expect(props).toEqual([
    ["children", "fixed", "slot", "HTMLDivElement"],
    ["visibility", "fixed", "visibility", "HTMLDivElement"],
  ]);
});

function sortedPropsValues(props: NamedProp[]): string[][] {
  return props.map(prop => {
    const p = prop.resolveTypeAndTarget();
    return [p.name, p.type, p.target, p.elementClass];
  }).sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0));
}

test("Should ignore named CSS blocks and rewrite all images", async () => {
  const parser = new BaseParser(
    new DocPool(WEBFLOWISH_CODE), applyDefaults({
      ignoreStyles: ["bo*", "@media \\*"],
    })
  );
  const files = await parser.getStyleElements();
  expect(files).toHaveLength(2);
  expect(files[0].content).not.toContain("body {");
  expect(files[0].content).toContain("@media ");
  expect(files[0].content).toContain("url('images/helpers.ts')");
  expect(files[1].baseName).toEqual("helpers.ts");
  expect(files[1].dirName).toEqual("images");
});
