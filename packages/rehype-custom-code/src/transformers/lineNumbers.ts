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
    hast.properties[getPropsKey(propsPrefix, "line")] = line;
  },
});
