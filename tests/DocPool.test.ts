import { expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { wildcardRegexp } from "../src/data/files";

const pool = new DocPool({ type: "file", data: "tests/webflowish.html" });

test("Should read and parse HTML without errors", async () => {
  for await (const doc of await pool.parseDocs()) {
    expect(doc.window.document.body).not.toBeNull();
  }
});

test("Should find HTML elements with selector", async () => {
  for await (const el of await pool.selectElements("div")) {
    expect(el.length).toBeGreaterThan(1);
  }
});

test("Should ignore using wildcard paths", () => {
  const wildcards = ["test-*", "tmp/*.html", "**/tmp"];
  const ignore = wildcards.map(i => wildcardRegexp(i));
  const paths = [
    "foo.html",
    "test-foo.html",
    "tmp/test-bar.html",
    "tmp/bar.css",
    "zyx/tmp/foo.html",
  ];
  expect(paths.filter(p => !ignore[0].test(p))).toEqual([
    paths[0], paths[3], paths[4]
  ]);
  expect(paths.filter(p => !ignore[1].test(p))).toEqual([
    paths[0], paths[1], paths[3], paths[4]
  ]);
  expect(paths.filter(p => !ignore[2].test(p))).toEqual([
    paths[0], paths[1]
  ]);
});
