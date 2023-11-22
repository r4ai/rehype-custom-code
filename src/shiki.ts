import { BuiltinTheme, CodeOptionsThemes } from "shikiji";
import { RehypeCustomCodeBlockOptions, ShikiOptions } from "./plugin";
import { getHighlighter as getShikiHighlighter } from "shikiji";

export const getHighlighter = (
  options: RehypeCustomCodeBlockOptions["shiki"]
) => {
  if (!options) {
    return undefined;
  }

  const themes = (
    "themes" in options ? Object.values(options.themes) : [options.theme]
  ).filter(Boolean) as BuiltinTheme[];

  return getShikiHighlighter({
    themes,
    langs: options.langs,
  });
};
