import { expect } from "@jest/globals";
import { readTextFile } from "../src/files";

export const getReadmeHtmlExample = async () => {
  const text = await readTextFile("README.md");
  const match = text.match(/```html\n(.*?)\n```/s);
  expect(match).not.toBeNull();
  return match![0];
};
