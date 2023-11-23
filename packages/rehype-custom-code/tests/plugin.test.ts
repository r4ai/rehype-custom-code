import { dedent } from "@qnighy/dedent";
import { JSDOM } from "jsdom";
import JSON5 from "json5";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { beforeAll, describe, expect, test } from "vitest";
import {
  RehypeCustomCodeOptions,
  defaultRehypeCustomCodeOptions,
  rehypeCustomCode,
} from "../src/plugin";

const md2html = async (
  mdText: string,
  options: RehypeCustomCodeOptions = defaultRehypeCustomCodeOptions(),
) => {
  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeCustomCode, options)
    .use(rehypeStringify)
    .process(mdText);
  return html.toString();
};

describe("rehypeShikiji", () => {
  let jsdom: JSDOM;
  let parser: DOMParser;

  beforeAll(() => {
    jsdom = new JSDOM();
    parser = new jsdom.window.DOMParser();
  });

  test("strict check", async () => {
    const md = dedent`
      \`\`\`javascript title="Hello, World!" {1-5}
      console.log("Hello, World!");
      \`\`\`
    `;
    const actualHtml = await md2html(md, {
      shiki: {
        themes: {
          light: "github-light",
          dark: "one-dark-pro",
        },
      },
    });
    const expectedHtml = dedent`
      <pre class="shiki shiki-themes github-light one-dark-pro" style="background-color:#fff;--shiki-dark-bg:#282c34;color:#24292e;--shiki-dark:#abb2bf" tabindex="0" data-lang="javascript" data-range="[1,2,3,4,5]" data-show-line-numbers="false" data-title="Hello, World!"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E5C07B">console</span><span style="color:#24292E;--shiki-dark:#ABB2BF">.</span><span style="color:#6F42C1;--shiki-dark:#61AFEF">log</span><span style="color:#24292E;--shiki-dark:#ABB2BF">(</span><span style="color:#032F62;--shiki-dark:#98C379">"Hello, World!"</span><span style="color:#24292E;--shiki-dark:#ABB2BF">);</span></span>
      <span class="line"></span></code></pre>
    `
      .split("\n")
      .filter((line) => line.length > 0)
      .join("\n");
    expect(actualHtml).toBe(expectedHtml);
  });

  test("check meta data", async () => {
    const md = dedent`
      \`\`\`rust title=hellworld.rs {2} showLineNumbers someKey=someValue someArrayKey=[1,2,3] someObjectKey={a:1,b:2,c:3}
      fn main() {
          println!("Hello, World!");
      }
      \`\`\`
    `;
    const html = await md2html(md);
    const doc = parser.parseFromString(html, "text/html");
    const pre = doc.querySelector("pre");
    expect(pre).not.toBeNull();

    const code = pre?.getAttribute("data-code");
    expect(code).toBe('fn main() {\n    println!("Hello, World!");\n}\n');

    const lang = pre?.getAttribute("data-lang");
    expect(lang).toBe("rust");

    const range = pre?.getAttribute("data-range") ?? "";
    expect(JSON5.parse(range)).toEqual([2]);

    const title = pre?.getAttribute("data-title") ?? "";
    expect(title).toBe("hellworld.rs");

    const showLineNumbers = pre?.getAttribute("data-show-line-numbers") ?? "";
    expect(showLineNumbers).toBe("true");

    const someKey = pre?.getAttribute("data-some-key") ?? "";
    expect(someKey).toBe("someValue");

    const someArrayKey = pre?.getAttribute("data-some-array-key") ?? "";
    expect(JSON5.parse(someArrayKey)).toEqual([1, 2, 3]);

    const someObjectKey = pre?.getAttribute("data-some-object-key") ?? "";
    expect(JSON5.parse(someObjectKey)).toEqual({ a: 1, b: 2, c: 3 });
  });

  test("check langAssociations option", async () => {
    const md = dedent`mermaid
      \`\`\`mermaid title="Hello, World!" {1-5}
      console.log("Hello, World!");
      \`\`\`
    `;
    const html = await md2html(md, {
      langAssociations: {
        mermaid: "diagram",
      },
    });
    const doc = parser.parseFromString(html, "text/html");
    const pre = doc.querySelector("pre");
    expect(pre).not.toBeNull();

    const lang = pre?.getAttribute("data-lang");
    expect(lang).toBe("diagram");
  });

  test("check ignoreLangs option", async () => {
    const md = dedent`
      \`\`\`mermaid title="Hello, World!" {1-5}
      console.log("Hello, World!");
      \`\`\`
    `;
    const html = await md2html(md, {
      ignoreLangs: ["mermaid"],
    });
    expect(html).toBe(
      [
        '<pre><code class="language-mermaid">console.log("Hello, World!");',
        "</code></pre>",
      ].join("\n"),
    );
  });

  test("check propsPrefix option", async () => {
    const md = dedent`
      \`\`\`javascript title="Hello, World!" {1-5} showLineNumbers someKey=someValue someArrayKey=[1,2,3] someObjectKey={a:1,b:2,c:3}
      console.log("Hello, World!");
      \`\`\`
    `;
    const prefixes = ["prefix-", "Data", "PRE", ""];
    const getKey = (prefix: string, key: string) =>
      prefix.length > 0 ? `${prefix}-${key}` : key;
    for (const prefix of prefixes) {
      const html = await md2html(md, {
        propsPrefix: prefix,
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre).not.toBeNull();

      const code = pre?.getAttribute(getKey(prefix, "code"));
      expect(code).toBe('console.log("Hello, World!");\n');

      const lang = pre?.getAttribute(getKey(prefix, "lang"));
      expect(lang).toBe("javascript");

      const range = pre?.getAttribute(getKey(prefix, "range")) ?? "";
      expect(JSON5.parse(range)).toEqual([1, 2, 3, 4, 5]);

      const title = pre?.getAttribute(getKey(prefix, "title")) ?? "";
      expect(title).toBe("Hello, World!");

      const showLineNumbers =
        pre?.getAttribute(getKey(prefix, "show-line-numbers")) ?? "";
      expect(showLineNumbers).toBe("true");

      const someKey = pre?.getAttribute(getKey(prefix, "some-key")) ?? "";
      expect(someKey).toBe("someValue");

      const someArrayKey =
        pre?.getAttribute(getKey(prefix, "some-array-key")) ?? "";
      expect(JSON5.parse(someArrayKey)).toEqual([1, 2, 3]);

      const someObjectKey =
        pre?.getAttribute(getKey(prefix, "some-object-key")) ?? "";
      expect(JSON5.parse(someObjectKey)).toEqual({ a: 1, b: 2, c: 3 });
    }
  });

  test("check shouldExportCodeAsProps option", async () => {
    const md = dedent`
      \`\`\`javascript
      console.log("Hello, World!");
      \`\`\`
    `;

    {
      const html = await md2html(md, {
        shouldExportCodeAsProps: false,
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre).not.toBeNull();

      const code = pre?.getAttribute("data-code");
      expect(code).toBeNull();
    }

    {
      const html = await md2html(md, {
        shouldExportCodeAsProps: true,
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre).not.toBeNull();

      const code = pre?.getAttribute("data-code");
      expect(code).toBe('console.log("Hello, World!");\n');
    }

    {
      const html = await md2html(md, {
        shiki: {
          themes: {
            light: "github-light",
            dark: "one-dark-pro",
          },
        },
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre).not.toBeNull();

      const code = pre?.getAttribute("data-code");
      expect(code).toBeNull();
    }

    {
      const html = await md2html(md, {
        shiki: {
          themes: {
            light: "github-light",
            dark: "one-dark-pro",
          },
        },
        shouldExportCodeAsProps: true,
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre).not.toBeNull();

      const code = pre?.getAttribute("data-code");
      expect(code).toBe('console.log("Hello, World!");\n');
    }

    {
      const html = await md2html(md, {
        shiki: {
          themes: {
            light: "github-light",
            dark: "one-dark-pro",
          },
        },
        shouldExportCodeAsProps: false,
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre).not.toBeNull();

      const code = pre?.getAttribute("data-code");
      expect(code).toBeNull();
    }
  });

  test("check metaStringPreprocess option", async () => {
    const md = dedent`
      \`\`\`javascript :"Hello, World!" {1-5}
      console.log("Hello, World!");
      \`\`\`
    `;
    const html = await md2html(md, {
      metaStringPreprocess: (metaString) => {
        const regex = /^:"(.*?)"(.*)$|^:'(.*?)'(.*)$|^:(.*?)(?:$|\s)(.*)$/;
        const match = metaString.match(regex);
        const title = match?.[1];
        const remains = match?.[2];
        if (title != null) {
          return `title="${title}" ${remains ?? ""}`;
        }
        return metaString;
      },
    });
    const doc = parser.parseFromString(html, "text/html");
    const pre = doc.querySelector("pre");
    expect(pre).not.toBeNull();

    const title = pre?.getAttribute("data-title") ?? "";
    expect(title).toBe("Hello, World!");
  });

  test("check metaDataTransform option", async () => {
    const md = dedent`
      \`\`\`javascript {1-5}
      console.log("Hello, World!");
      \`\`\`
    `;
    const html = await md2html(md, {
      metaDataTransform: (meta) => {
        const newMeta = { ...meta };
        newMeta.range = undefined;
        newMeta.highlightLines = meta.range;
        return newMeta;
      },
    });
    const doc = parser.parseFromString(html, "text/html");
    const pre = doc.querySelector("pre");
    expect(pre).not.toBeNull();

    const highlightLines = pre?.getAttribute("data-highlight-lines") ?? "";
    expect(JSON5.parse(highlightLines)).toEqual([1, 2, 3, 4, 5]);

    const range = pre?.getAttribute("data-range");
    expect(range).toBeNull();
  });

  test("check shiki option", async () => {
    const md = dedent`
      \`\`\`javascript title="Hello, World!"
      console.log("Hello, World!");
      \`\`\`
    `;

    {
      const html = await md2html(md, {
        shiki: {
          themes: {
            light: "github-light",
            dark: "one-dark-pro",
          },
        },
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre?.classList.contains("shiki")).toBe(true);
    }

    {
      const html = await md2html(md, {
        shiki: false,
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre?.classList.contains("shiki")).toBe(false);
    }

    {
      const html = await md2html(md);
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre?.classList.contains("shiki")).toBe(false);
    }

    {
      const html = await md2html(md, {
        shiki: undefined,
      });
      const doc = parser.parseFromString(html, "text/html");
      const pre = doc.querySelector("pre");
      expect(pre?.classList.contains("shiki")).toBe(false);
    }
  });

  test("check shiki transform option", async () => {
    const md = dedent`
      \`\`\`rust title=hellworld.rs {2}
      fn main() {
          println!("Hello, World!");
      }
      \`\`\`
    `;
    const html = await md2html(md, {
      shiki: {
        themes: {
          light: "github-light",
          dark: "one-dark-pro",
        },
        transformers(meta) {
          return [
            {
              line(hast, line) {
                if (meta.range?.includes(line)) {
                  hast.properties["data-highlight-line"] = true;
                }
              },
            },
          ];
        },
      },
    });
    const doc = parser.parseFromString(html, "text/html");
    const pre = doc.querySelector("pre");
    expect(pre).not.toBeNull();

    const highlightLine = pre?.querySelectorAll("span[data-highlight-line]");
    expect(highlightLine?.length).toBe(1);
  });
});
