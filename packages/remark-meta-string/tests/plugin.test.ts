import { dedent } from "@qnighy/dedent";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { describe, expect, test } from "vitest";
import { remarkMetaString } from "../src/plugin";

describe("remark-meta-string", () => {
  test("check meta string", () => {
    const md = dedent`
        \`\`\`js title=hello
        console.log("hello world");
        \`\`\`
      `;

    const processor = unified()
      .use(remarkParse)
      .use(remarkMetaString)
      .use(remarkRehype);
    const hast = processor.runSync(processor.parse(md));

    // @ts-ignore
    expect(hast.children[0].children[0].properties.metaString).toBe(
      "title=hello",
    );
  });
});
