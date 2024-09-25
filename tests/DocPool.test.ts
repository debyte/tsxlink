import { beforeAll, expect, test } from "@jest/globals";
import { DocPool } from "../src/DocPool";

const pool = new DocPool();

beforeAll(async () => {
  pool.add({ type: "file", data: "tests/webflowish.html" });
  pool.add({ type: "file", data: "tests/webflowish.html" });
});

test("Should read and parse HTML without errors", async () => {
  for await (const doc of pool.parseDocs()) {
    expect(doc.window.document.body).not.toBeNull();
  }
});

test("Should find HTML elements with selector", async () => {
  for await (const el of pool.selectElements("div")) {
    expect(el.length).toBeGreaterThan(1);
  }
});
