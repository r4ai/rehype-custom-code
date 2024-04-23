import type { ShikiTransformer } from "shiki";
import type { Meta } from "../perser.js";
import { getPropsKey } from "../util.js";

export const transformerLineNumbers = (
  meta: Meta,
  propsPrefix: string,
): ShikiTransformer => ({
  code: (hast) => {
    if (meta.showLineNumbers) {
      hast.properties[getPropsKey(propsPrefix, "line-numbers")] = true;
    }
  },
  line: (hast, line) => {
    if (meta.showLineNumbers) {
      const startLine = Number(meta.startLine) ?? 1;
      hast.properties[getPropsKey(propsPrefix, "line")] =
        Math.max(startLine - 1, 0) + line;
    }
  },
});
