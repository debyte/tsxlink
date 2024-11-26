import { expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { applyDefaults } from "../src/init";
import { selectParser } from "../src/parse";
import { renderComponent } from "../src/render";
import {
  getReadmeHtmlExample,
  ONE_ELEMENT_COMPONENT,
  sourceFromString,
  WEBFLOWISH_CODE,
} from "./helpers";

test("Should render React.FC from detected components", async () => {
  const docs = new DocPool(await getReadmeHtmlExample());
  const parser = selectParser(docs, applyDefaults({}));
  for (const component of await parser.getComponents()) {
    const fd = await renderComponent(parser.config, docs, component);
    expect(fd).toHaveLength(1);
    const out = fd[0].content;
    if (component.name === "Search") {
      expect(out).toContain(
        "query?: React.InputHTMLAttributes<HTMLInputElement>"
      );
      expect(out).toMatch(/<input [^>]*{...query}/);
      expect(out).toMatch(/{loading && \(.+\)}/s);
      expect(out).toMatch(/<div[^>]*>{results}<\/div>/);
    }
    if (component.name === "SearchResult") {
      expect(out).toContain("image: string");
      expect(out).toContain("code: number");
      expect(out).toMatch(/<img [^>]*src={image}/);
      expect(out).toContain("<span>{code}</span>");
    }
  }
});

test("Should format class names and singleton tags for tsx", async () => {
  const docs = new DocPool(WEBFLOWISH_CODE);
  const parser = selectParser(
    docs,
    applyDefaults({ sourceType: "webflow/export" }),
  );
  for (const component of await parser.getComponents()) {
    const fd = await renderComponent(parser.config, docs, component);
    expect(fd).toHaveLength(1);
    const out = fd[0].content;
    if (component.name === "Testimonial") {
      expect(out).toContain("<h3 className=\"testimonial-main-heading\">");
      expect(out).toContain("<hr/>");
      expect(out).toMatch(/<img [^>]+\/>/);
      expect(out).toContain("style={styles[0]}");
      expect(out).toContain("\"textTransform\": \"uppercase\"");
    }
  }
});

test("Should render one element component correctly", async () => {
  const docs = new DocPool(ONE_ELEMENT_COMPONENT);
  const parser = selectParser(docs, applyDefaults({}));
  const components = await parser.getComponents();
  expect(components).toHaveLength(1);
  const fd = await renderComponent(parser.config, docs, components[0]);
  expect(fd).toHaveLength(1);
  const out = fd[0].content;
  expect(out).toContain("=> visibility && (");
  expect(out).toMatch(/<div [^>]+>{children}<\/div>/);
});

test("Should render replace property correctly", async () => {
  const docs = new DocPool(sourceFromString(`
    <div data-tsx="Test">
      Hello <span data-tsx-replace="world">world</span>
    </div>
  `));
  const parser = selectParser(docs, applyDefaults({}));
  const components = await parser.getComponents();
  expect(components).toHaveLength(1);
  const fd = await renderComponent(parser.config, docs, components[0]);
  expect(fd).toHaveLength(1);
  const out = fd[0].content;
  expect(out).toContain("world: React.ReactNode");
  expect(out).toContain("Hello {world}");
});
