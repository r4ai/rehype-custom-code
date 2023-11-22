import { BuiltinTheme, CodeOptionsThemes } from "shikiji";
import { getHighlighter as getShikiHighlighter } from "shikiji";
import { RehypeCustomCodeOptions, ShikiOptions } from "./plugin";

export const getHighlighter = (options: RehypeCustomCodeOptions["shiki"]) => {
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
