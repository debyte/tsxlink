import { expect, test } from "@jest/globals";
import { BaseConvert } from "../src/BaseConvert";
import { DocPool } from "../src/DocPool";

const loadDesings = async () => {
  const docs = new DocPool(["tests/webflowish.html"]);
  const convert = new BaseConvert();
  return await convert.parseComponentDesigns(docs);
};

test("Should detect components from HTML with TSX attributes", async () => {
  const designs = await loadDesings();
  const component = designs.find(({ name }) => name === "Testimonial");
  expect(component).toBeDefined();
  expect(component!.templates.length).toBeGreaterThan(1);
});

test("Should detect properties from HTML with TSX attributes", async () => {
  const convert = new BaseConvert();
  const designs = await loadDesings();
  const component = designs.find(({ name }) => name === "Testimonial");
  expect(component).toBeDefined();
  const props = convert.parsePropDesigns(component!);
  console.log(props);
});
