import { expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { selectParser } from "../src/parse";
import { renderFC } from "../src/render";
import { getReadmeHtmlExample } from "./helpers";

test("Should render React.FC from detected components", async () => {
  const docs = new DocPool(
    { type: "string", data: await getReadmeHtmlExample() }
  );
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

test("Should format class names and singleton tags for tsx", async () => {
  const docs = new DocPool({ type: "file", data: "tests/webflowish.html" });
  const parser = selectParser(docs, "webflow/export");
  for (const component of await parser.getComponents()) {
    const out = renderFC(component);
    if (component.name === "Testimonial") {
      expect(out.match(/<h3 className="testimonial-main-heading">/))
        .not.toBeNull();
      expect(out.match(/<hr\/>/)).not.toBeNull();
      expect(out.match(/<img [^>]+\/>/)).not.toBeNull();
    }
  }
});
