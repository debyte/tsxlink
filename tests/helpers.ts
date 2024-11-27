import { expect } from "@jest/globals";
import { readTextFile } from "../src/data/files";
import { DocSource } from "../src/types";

export const getReadmeHtmlExample = async (): Promise<DocSource> => {
  const text = await readTextFile("README.md");
  const match = text.match(/```html\n(.*?)\n```/s);
  expect(match).not.toBeNull();
  return { type: "string", data: match![0] };
};

export const WEBFLOWISH_CODE: DocSource = {
  type: "dir",
  data: "tests/",
};
