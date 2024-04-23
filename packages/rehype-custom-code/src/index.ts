import { rehypeCustomCode } from "./plugin.js";

export {
  rehypeCustomCode,
  type RehypeCustomCodeOptions,
  defaultRehypeCustomCodeOptions,
} from "./plugin.js";

export type { Meta as RehypeCustomCodeMeta } from "./perser.js";

export default rehypeCustomCode;

export * from "./transformers/index.js";
