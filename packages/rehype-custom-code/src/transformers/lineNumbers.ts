import { ShikijiTransformer } from "shikiji";
import { Meta } from "../perser";
import { getPropsKey } from "../util";

export const transformerLineNumbers = (
  meta: Meta,
  propsPrefix: string,
): ShikijiTransformer => ({
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
