import { beforeAll, expect, test } from "@jest/globals";
import { BaseParser } from "../src/BaseParser";
import { DocPool } from "../src/DocPool";
import { getReadmeHtmlExample } from "./helpers";

const docs = new DocPool();
const parser = new BaseParser();

beforeAll(async () => {
  docs.add({ type: "string", data: await getReadmeHtmlExample() });
});

test("Should detect components from HTML with TSX attributes", async () => {
  const designs = await parser.parseComponentDesigns(docs);
  const component = designs.find(({ name }) => name === "SearchResult");
  expect(component).toBeDefined();
  expect(component!.templates).toHaveLength(2);
});

test("Should detect properties from HTML with TSX attributes", async () => {
  const designs = await parser.parseComponentDesigns(docs);
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
  const designs = await parser.parseComponentDesigns(docs);
  for (const component of designs) {
    const props = parser.parsePropDesigns(component).map(
      prop => prop.resolveTypeAndTarget()
    );
    props.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
    expect(props).toEqual(expectedProps(component.name));
  }
});

const expectedProps = (componentName: string) => {
  if (componentName === "Search") {
    return [
      { name: "button", type: "fixed", target: "map" },
      { name: "loading", type: "fixed", target: "visibility" },
      { name: "query", type: "fixed", target: "map" },
      { name: "results", type: "fixed", target: "slot" },
    ];
  }
  if (componentName === "SearchResult") {
    return [
      { name: "action", type: "string", target: "text" },
      { name: "button", type: "fixed", target: "map" },
      { name: "code", type: "number", target: "text" },
      { name: "image", type: "string", target: "src" },
      { name: "name", type: "string", target: "text" },
    ];
  }
  return [];
};
