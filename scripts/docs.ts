import * as fs from "node:fs/promises";

console.log("Generating api docs");
Bun.spawnSync(["bun", "run", "--cwd", "packages/rehype-custom-code", "docs"]);

console.log("Coping packages/rehype-custom-code/docs to ./docs/api");
await fs.cp("packages/rehype-custom-code/docs", "./docs/api", {
  recursive: true,
  force: true,
});
