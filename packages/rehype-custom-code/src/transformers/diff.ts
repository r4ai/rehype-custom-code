import { Element, ElementContent, Text } from "hast";
import type { ShikijiTransformer } from "shikiji";
import type { Meta } from "../perser";

const isElement = (node: ElementContent): node is Element =>
  node.type === "element" && node.children.length > 0;

const isText = (node: ElementContent): node is Text => node.type === "text";

type Line = Element & {
  children: [
    Element & {
      children: Text[];
    },
  ];
};

const isLine = (line: ElementContent): line is Line =>
  isElement(line) &&
  isElement(line.children[0]) &&
  isText(line.children[0].children[0]);

const cleanup = (line: Line, value: string, diffIndentSize: number) => {
  // remove "+" or "-"
  line.children[0].children[0].value = value.trimStart().slice(1);

  // remove unnecessary spaces
  const secondChild =
    value.trim().length > 1 ? line.children[0] : line.children[1];
  const secondValue = secondChild.children[0].value;
  const toRemoveChars = secondValue.slice(0, Math.max(0, diffIndentSize - 1));

  for (let i = 0; i < toRemoveChars.length; i++) {
    if (toRemoveChars[i] !== " ") {
      break;
    }
    secondChild.children[0].value = secondChild.children[0].value.slice(1);
  }
};

const getDiffIndentSize = (hast: Element) => {
  let diffIndentSize = 0;
  for (const child of hast.children) {
    if (!isLine(child)) continue;

    const firstLineText = child.children
      .flatMap((child) => (child.type === "element" ? child.children : []))
      .reduce((pre, cur) => (cur.type === "text" ? pre + cur.value : pre), "");

    if (firstLineText.startsWith("+") || firstLineText.startsWith("-")) {
      const valueWithoutPrefix = firstLineText.slice(1);
      diffIndentSize =
        valueWithoutPrefix.length - valueWithoutPrefix.trimStart().length + 1;
    } else {
      diffIndentSize = firstLineText.length - firstLineText.trimStart().length;
    }
    break;
  }
  return diffIndentSize;
};

export const transformerDiff = (meta: Meta): ShikijiTransformer => ({
  code(hast) {
    if (meta.diff) {
      hast.properties["data-diff"] = true;

      const diffIndentSize = getDiffIndentSize(hast);
      meta.diffIndentSize = diffIndentSize.toString();

      for (const line of hast.children) {
        if (!isLine(line)) return;

        const value = line.children[0].children[0].value;

        // remove unnecessary spaces
        const toRemoveChars = value.slice(0, diffIndentSize);
        for (let i = 0; i < toRemoveChars.length; i++) {
          if (toRemoveChars[i] !== " ") {
            break;
          }
          line.children[0].children[0].value =
            line.children[0].children[0].value.slice(1);
        }

        switch (value.trim()[0]) {
          case "+":
            line.properties["data-diff-added"] = true;
            cleanup(line, value, diffIndentSize);
            break;
          case "-":
            line.properties["data-diff-removed"] = true;
            cleanup(line, value, diffIndentSize);
            break;
        }
      }
    }
  },
});
