import { expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { WEBFLOWISH_CODE } from "./helpers";

const pool = new DocPool(WEBFLOWISH_CODE);

test("Should read and parse HTML without errors", async () => {
  for (const doc of await pool.parseDocs()) {
    expect(doc.window.document.body).not.toBeNull();
  }
});

test("Should find HTML elements with selector", async () => {
  const elements = await pool.selectElements("div");
  expect(elements.length).toBeGreaterThan(1);
});
