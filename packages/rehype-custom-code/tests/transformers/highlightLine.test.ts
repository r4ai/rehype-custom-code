import { dedent } from "@qnighy/dedent";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, test } from "vitest";
import { process } from "../process.js";

describe("highlight lines", () => {
  let jsdom: JSDOM;
  let parser: DOMParser;

  beforeAll(() => {
    jsdom = new JSDOM();
    parser = new jsdom.window.DOMParser();
  });

  test('highlighted lines should have "data-highlighted-line" attribute', async () => {
    const md = dedent`
      \`\`\`rust diff {2,3}
      fn main() {
          println!("Hello, World!");
          println!("Hello, Shikiji!");
      }
      \`\`\`
    `;

    const { html } = await process(md, {
      shiki: {
        theme: "github-dark",
      },
    });
    const doc = parser.parseFromString(html, "text/html");
    const pre = doc.querySelector("pre");
    const highlightedLines = pre?.querySelectorAll("[data-highlighted-line]");

    expect(highlightedLines?.length).toBe(2);
    expect(highlightedLines?.[0].textContent).toBe(
      '    println!("Hello, World!");',
    );
    expect(highlightedLines?.[1].textContent).toBe(
      '    println!("Hello, Shikiji!");',
    );
  });
});
