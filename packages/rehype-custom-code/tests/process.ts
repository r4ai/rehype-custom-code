import type * as hast from "hast";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import {
  RehypeCustomCodeOptions,
  defaultRehypeCustomCodeOptions,
  rehypeCustomCode,
} from "../src/plugin";

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
      .use(rehypeCustomCode, options)
      .use(rehypeStringify)
      .process(md)
  ).toString();

  // @ts-expect-error: hast and mdast is assigned
  return { hast, html };
};
