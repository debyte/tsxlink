import { expect, test } from "@jest/globals";
import { relativePath, wildcardFileRegexp } from "../src/data/paths";

test("Should generate regexp for wildcard paths", () => {
  const wildcards = ["test-*", "tmp/*.html", "**/tmp"];
  const ignore = wildcards.map(i => wildcardFileRegexp(i));
  const paths = [
    "foo.html",
    "test-foo.html",
    "tmp/test-bar.html",
    "tmp/bar.css",
    "zyx/tmp/foo.html",
  ];
  expect(paths.filter(p => p.match(ignore[0]) === null)).toEqual([
    paths[0], paths[3], paths[4]
  ]);
  expect(paths.filter(p => p.match(ignore[1]) === null)).toEqual([
    paths[0], paths[1], paths[3], paths[4]
  ]);
  expect(paths.filter(p => p.match(ignore[2]) === null)).toEqual([
    paths[0], paths[1]
  ]);
});

test("Should create relative paths between directories", () => {
  let p = relativePath("src/components/tsxlink", "src/assets/tsxlink");
  expect(p).toEqual("../../assets/tsxlink");
  p = relativePath("src/components/tsxlink", "public/tsxlink");
  expect(p).toEqual("../../../public/tsxlink");
});
