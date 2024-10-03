import { beforeAll, expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { selectParser } from "../src/parse";
import { renderFC } from "../src/render";
import { getReadmeHtmlExample } from "./helpers";

const docs = new DocPool();

beforeAll(async () => {
  docs.source = { type: "string", data: await getReadmeHtmlExample() };
});

test("Should render React.FC from detected components", async () => {
  const parser = selectParser(docs, "custom");
  for (const component of await parser.getComponents()) {
    const out = renderFC(component);
    if (component.name === "Search") {
      expect(out.match(
        /query\?: React\.InputHTMLAttributes<HTMLInputElement>/
      )).not.toBeNull();
      expect(/<input [^>]*{...query}/).not.toBeNull();
      expect(/{loading && \(.+\)}/s).not.toBeNull();
      expect(/<div[^>]*>{results}<\/div>/).not.toBeNull();
    }
    if (component.name === "SearchResult") {
      expect(out.match(/image: string/)).not.toBeNull();
      expect(out.match(/code: number/)).not.toBeNull();
      expect(out.match(/<img [^>]*src={image}/)).not.toBeNull();
      expect(out.match(/<span>{code}<\/span>/)).not.toBeNull();
    }
  }
});
