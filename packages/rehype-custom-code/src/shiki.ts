import { BuiltinTheme } from "shiki";
import { getHighlighter as getShikiHighlighter } from "shiki";
import { Meta } from "./perser";
import { RehypeCustomCodeOptions } from "./plugin";

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
