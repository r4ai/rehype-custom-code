import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const remarkMetaString: Plugin<[{}?], Root> = () => {
  return (tree) => {
    visit(tree, "code", (node) => {
      node.data = {
        ...node.data,
        hProperties: {
          // @ts-expect-error
          ...node.data?.hProperties,
          metaString: node.meta,
        },
      };
    });
  };
};
