import fs from "fs/promises";
import { beforeAll, expect, test } from "@jest/globals";
import { BaseConvert } from "../src/BaseConvert";
import { DocPool } from "../src/DocPool";

const docs = new DocPool();
const convert = new BaseConvert();

beforeAll(async () => {
  const text = await fs.readFile("README.md", "utf-8");
  const match = text.match(/```html\n(.*?)\n```/s);
  expect(match).not.toBeNull();
  docs.add({ type: "string", data: match![0] });
});

test("Should detect components from HTML with TSX attributes", async () => {
  const designs = await convert.parseComponentDesigns(docs);
  const component = designs.find(({ name }) => name === "SearchResult");
  expect(component).toBeDefined();
  expect(component!.templates).toHaveLength(2);
});

test("Should detect properties from HTML with TSX attributes", async () => {
  const designs = await convert.parseComponentDesigns(docs);
  const component = designs.find(({ name }) => name === "SearchResult");
  expect(component).toBeDefined();
  const props = convert.parsePropDesigns(component!);
  const image = props.find(({ name }) => name === "image");
  expect(image).toBeDefined();
  expect(image!.type).toEqual([]);
  expect(image!.target).toEqual(["src", "src"]);
  expect(image!.templates).toHaveLength(2);
});
