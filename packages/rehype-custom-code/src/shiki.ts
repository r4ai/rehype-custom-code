import type { BuiltinTheme } from "shiki";
import { getHighlighter as getShikiHighlighter } from "shiki";
import type { Meta } from "./perser.js";
import type { RehypeCustomCodeOptions } from "./plugin.js";

export const getHighlighter = <M extends Meta = Meta>(
  options: RehypeCustomCodeOptions<M>["shiki"],
) => {
  if (!options) {
    return undefined;
  }

  const themes = (
    "themes" in options ? Object.values(options.themes) : [options.theme]
  ).filter(Boolean) as BuiltinTheme[];

  return getShikiHighlighter({
    ...options.meta,
    themes,
    langs: options.langs ?? [],
  });
};
