import { beforeAll, expect, test } from "@jest/globals";
import { DocPool } from "../src/DocPool";
import { parse } from "../src/parse";
import { renderFC } from "../src/render";
import { getReadmeHtmlExample } from "./helpers";

const docs = new DocPool();

beforeAll(async () => {
  docs.add({ type: "string", data: await getReadmeHtmlExample() });
});

test("Should render React.FC from TSX component", async () => {
  for (const component of await parse(docs)) {
    const out = renderFC(component);
    console.log(out);
  }
});
