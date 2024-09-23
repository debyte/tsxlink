import { expect, test } from "@jest/globals";
import { DocPool } from "../src/DocPool";

test("Should read and parse HTML without errors", async () => {
  const dp = new DocPool(["tests/webflowish.html"]);
  for await (const doc of dp.parseDocs()) {
    expect(doc.window.document.body).not.toBeNull();
  }
});

test("Should find HTML elements with selector", async () => {
  const dp = new DocPool(["tests/webflowish.html"]);
  for await (const el of dp.selectElements("div")) {
    expect(el.length).toBeGreaterThan(1);
  }
});
