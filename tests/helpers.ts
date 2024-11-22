import { expect } from "@jest/globals";
import { readTextFile } from "../src/data/files";
import { DocSource } from "../src/types";

export const getReadmeHtmlExample = async (): Promise<DocSource> => {
  const text = await readTextFile("README.md");
  const match = text.match(/```html\n(.*?)\n```/s);
  expect(match).not.toBeNull();
  return { type: "string", data: match![0] };
};

export const WEBFLOWISH_CODE_FILE: DocSource = {
  type: "file",
  data: "tests/webflowish.html",
};

export const ONE_ELEMENT_COMPONENT: DocSource = {
  type: "string",
  data: `<div
    data-tsx="StrangerThings"
    data-tsx-prop="visibility"
    data-tsx-slot="children"
    style="padding:1em;"
  />`,
};
