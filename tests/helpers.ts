import { expect } from "@jest/globals";
import fs from "fs/promises";

export const getReadmeHtmlExample = async () => {
  const text = await fs.readFile("README.md", "utf-8");
  const match = text.match(/```html\n(.*?)\n```/s);
  expect(match).not.toBeNull();
  return match![0];
};
