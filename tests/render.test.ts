import { expect, test } from "@jest/globals";
import { DocPool } from "../src/data/DocPool";
import { applyDefaults } from "../src/init";
import { selectParser } from "../src/parse";
import { renderComponent } from "../src/render";
import { Config, FileData } from "../src/types";
import { getReadmeHtmlExample, WEBFLOWISH_CODE } from "./helpers";

test("Should render React.FC from detected components", async () => {
  const docs = new DocPool(await getReadmeHtmlExample());
  const parser = selectParser(docs, applyDefaults({}));
  for (const component of await parser.getComponents()) {
    const [fd] = await renderComponent(parser.config, docs, component);
    const out = fd.content;
    if (component.name === "Search") {
      expect(out).toContain("Search: React.FC<SearchProps>");
      expect(out).toContain("export default Search;");
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

test("Should rewrite class names and singleton tags for tsx", async () => {
  const docs = new DocPool(WEBFLOWISH_CODE);
  const parser = selectParser(docs, applyDefaults({
    sourceType: "webflow/export",
  }));
  for (const component of await parser.getComponents()) {
    const [fd] = await renderComponent(parser.config, docs, component);
    const out = fd.content;
    if (component.name === "Testimonial") {
      expect(out).toContain("<h3 className=\"testimonial-main-heading\">");
      expect(out).toContain("<hr />");
      expect(out).toMatch(/<img [^>]+ \/>/);
    }
  }
});

test("Should render root element visibility", async () => {
  const [fd] = await renderSingleComponent(`
    <div class="strange" data-tsx="StrangerThings"
      data-tsx-prop="visibility" data-tsx-slot="children"
    />
  `);
  expect(fd.content).toContain("=> visibility && (");
  expect(fd.content).toMatch(/<div [^>]+>{children}<\/div>/);
});

test("Should render replace property correctly", async () => {
  const [fd] = await renderSingleComponent(`
    <div data-tsx="Test">
      Hello <span data-tsx-replace="world">world</span>
    </div>
  `);
  expect(fd.content).toContain("world: React.ReactNode");
  expect(fd.content).toContain("Hello {world}");
});

test("Should rewrite style attribute for tsx", async () => {
  const [fd, assets] = await renderSingleComponent(`
    <p data-tsx="Test" style="text-transform: uppercase; foo: url(README.md);">
      Test
    </p>
  `);
  expect(fd.content).toContain("style={inlineStyles[0]}");
  expect(fd.content).toContain("\"textTransform\": \"uppercase\"");
  expect(assets).toHaveLength(1);
  expect(assets[0].baseName).toEqual("README.md");
});

test("Should rewrite img attribute for tsx", async () => {
  const [fd, assets] = await renderSingleComponent(`
    <div data-tsx="Test">
      <img src="images/foo.png" width="300" height="200">
    </div>
  `);
  expect(fd.content).toContain("src=\"/tsxlink/foo.png\"");
  expect(assets).toHaveLength(1);
  expect(assets[0].baseName).toEqual("foo.png");
});

test("Should rewrite img to next/image", async () => {
  const [fd, assets] = await renderSingleComponent(`
    <div data-tsx="Test">
      <img src="images/foo.png" width="300" height="200">
    </div>
  `, {
    useNextJsImages: true,
    assetsDir: "./src/assets/tsxlink",
    assetsPath: "@",
  });
  expect(fd.content).toContain("import Image from \"next/image\"");
  expect(fd.content).toContain(
    "import foo_png from \"../../assets/tsxlink/foo.png\""
  );
  expect(fd.content).toContain(
    "<Image src={foo_png} width=\"300\" height=\"200\" />"
  );
  expect(assets).toHaveLength(1);
  expect(assets[0].baseName).toEqual("foo.png");
});

test("Should drop configured attributes", async () => {
  const [fd, assets] = await renderSingleComponent(`
    <div data-tsx="Test" fs-cc-foo="1">
      <p class="great" style="background: url('foo.png');">fs-cc-foo</p>
    </div>
  `, { dropAttributes: ["style", "fs-*"] });
  expect(fd.content).not.toContain(" style=");
  expect(fd.content).not.toContain(" fs-cc-foo=");
  expect(assets).toHaveLength(0);
});

test("Should render control for class(name) property", async () => {
  const [fd, assets, usesLib] = await renderSingleComponent(`
    <a class="my-class c2" data-tsx="Test" data-tsx-prop="className:class">
      foo
    </a>
  `);
  expect(fd.content).toContain("import { classResolve }");
  expect(fd.content).toMatch(/"my-class": true,\s+"c2": true/);
  expect(fd.content).toContain(
    "className={classResolve(className, classNameDefaults)}"
  );
  expect(assets).toHaveLength(0);
  expect(usesLib).toBeTruthy();
});

async function renderSingleComponent(
  src: string,
  opt?: Config,
): Promise<[component: FileData, assets: FileData[], usesLib: boolean]> {
  const config = applyDefaults(opt || {});
  const docs = new DocPool({ type: "string", data: src });
  const parser = selectParser(docs, config);
  const components = await parser.getComponents();
  expect(components).toHaveLength(1);
  return await renderComponent(config, docs, components[0]);
}
