import type * as hast from "hast";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Meta } from "../src/perser.js";
import {
  type RehypeCustomCodeOptions,
  defaultRehypeCustomCodeOptions,
  rehypeCustomCode,
} from "../src/plugin.js";

export const process = async (
  md: string,
  options: RehypeCustomCodeOptions = defaultRehypeCustomCodeOptions(),
) => {
  let hast: hast.Node;
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(() => (tree: hast.Node) => {
        hast = tree;
        return hast;
      })
      .use(rehypeCustomCode<Meta>, options)
      .use(rehypeStringify)
      .process(md)
  ).toString();

  // @ts-expect-error: hast and mdast is assigned
  return { hast, html };
};
