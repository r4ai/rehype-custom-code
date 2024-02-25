import type { ShikiTransformer } from "shiki";
import { Meta } from "../perser";
import { getPropsKey } from "../util";

/**
 * Add "highlighted-line" property to the hast node if the line is in the range.
 */
export const transformerHighlightLine = (
  meta: Meta,
  propsPrefix: string,
): ShikiTransformer => ({
  line: (hast, line) => {
    if (meta.range?.includes(line)) {
      hast.properties[getPropsKey(propsPrefix, "highlighted-line")] = true;
    }
  },
});
