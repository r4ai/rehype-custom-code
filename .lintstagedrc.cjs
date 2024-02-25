// @ts-check

/** @type {import("lint-staged").Config} */
module.exports = {
  "*.{js,cjs,mjs,ts}": ["bun x @biomejs/biome check --apply"],
};
