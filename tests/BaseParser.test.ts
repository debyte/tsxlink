import { beforeAll, expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { BaseParser } from "../src/parse/BaseParser";
import { getReadmeHtmlExample } from "./helpers";

const docs = new DocPool();
const parser = new BaseParser(docs);

beforeAll(async () => {
  docs.source = { type: "string", data: await getReadmeHtmlExample() };
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
  const props = parser.parsePropDesigns(component!);
  const image = props.find(({ name }) => name === "image");
  expect(image).toBeDefined();
  expect(image!.type).toEqual([]);
  expect(image!.target).toEqual(["src", "src"]);
  expect(image!.templates).toHaveLength(2);
});

test("Sould detect property targets and types from HTML template", async () => {
  const designs = await parser.parseComponentDesigns();
  for (const component of designs) {
    const props = parser.parsePropDesigns(component).map(prop => {
      const p = prop.resolveTypeAndTarget();
      return [p.name, p.type, p.target, p.elementClass];
    });
    props.sort((a, b) => a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0));
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
        ["button", "fixed", "map", "HTMLButtonElement"],
        ["code", "number", "text", "HTMLSpanElement"],
        ["image", "string", "src", "HTMLImageElement"],
        ["name", "string", "text", "HTMLHeadingElement"],
      ]);
    }
  }
});
