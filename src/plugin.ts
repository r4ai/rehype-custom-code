import merge from "deepmerge";
import type { Element, Root } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import type {
  BuiltinLanguage,
  BuiltinTheme,
  CodeOptionsThemes,
  LanguageInput,
} from "shikiji";
import { bundledLanguages } from "shikiji";
import { getHighlighter } from "./shiki";
import { type Plugin } from "unified";
import { visit } from "unist-util-visit";
import { getLangFromClassNames } from "./lang";
import { getMeta, isCodeElement, isPreElement } from "./elements";
import { kebabCase } from "scule";
import JSON5 from "json5";

export type ShikiOptions = {
  /**
   * Language names to include.
   *
   * @default Object.keys(bundledLanguages)
   */
  langs?: Array<LanguageInput | BuiltinLanguage>;

  /**
   * Extra meta data to pass to the highlighter
   */
  meta?: Record<string, unknown>;
};

export type RehypeCustomCodeBlockOptions = {
  langAssociations?: Record<string, string>;
  ignoreLangs?: string[];
  shiki: (ShikiOptions & CodeOptionsThemes<BuiltinTheme>) | undefined;
};

export const defaultRehypeCustomCodeBlockOptions: Required<RehypeCustomCodeBlockOptions> =
  {
    shiki: undefined,
    langAssociations: {},
    ignoreLangs: [],
  };

const defaultShikiOptions: Required<ShikiOptions> = {
  langs: Object.keys(bundledLanguages) as BuiltinLanguage[],
  meta: {},
};

/**
 * convert pre element to highlighted pre element using shiki
 * @param options options
 * @param options.highlighter shiki highlighter
 * @returns unified plugin
 *
 * @example
 * const mdText = `
 * \`\`\`js
 * console.log("Hello, World!");
 * \`\`\`
 * `;
 *
 * const html = await unified()
 *   .use(remarkParse)
 *   .use(remarkRehype)
 *   .use(rehypeShiki, {
 *     highlighter: await getHighlighter({
 *       theme: "material-theme-darker",
 *     }),
 *   })
 *   .use(rehypeStringify)
 *   .process(mdText);
 *
 * console.log(html.toString());
 * // >>> <pre class="shiki material-theme-darker" style="background-color: #212121" tabindex="0"><code><span class="line"><span style="color: #EEFFFF">console</span><span style="color: #89DDFF">.</span><span style="color: #82AAFF">log</span><span style="color: #EEFFFF">(</span><span style="color: #89DDFF">"</span><span style="color: #C3E88D">Hello, World!</span><span style="color: #89DDFF">"</span><span style="color: #EEFFFF">)</span><span style="color: #89DDFF">;</span></span><span class="line"><span style="color: #82AAFF">main</span><span style="color: #EEFFFF">()</span><span style="color: #89DDFF">;</span></span><span class="line"></span></code></pre>
 */
export const rehypeCustomCodeBlock: Plugin<
  [RehypeCustomCodeBlockOptions],
  Root
> = (_options) => {
  const options: Required<RehypeCustomCodeBlockOptions> = {
    ...defaultRehypeCustomCodeBlockOptions,
    ..._options,
    shiki: _options.shiki
      ? {
          ...defaultShikiOptions,
          ..._options.shiki,
        }
      : undefined,
  } as const;

  const gettingHighlighter = getHighlighter(options.shiki);

  return async (tree, file) => {
    const highlighter = await gettingHighlighter;

    visit(tree, "element", (preNode, index, parent) => {
      // check if the current node is a block code element
      if (!parent || index == null || !isPreElement(preNode)) return;

      // check if the current pre node has a code element as its child
      const codeNode = preNode.children[0];
      if (!isCodeElement(codeNode) || !codeNode.properties) return;
      const codeText = hastToString(codeNode.children[0]);

      // detect language from class names
      const lang = getLangFromClassNames(
        codeNode.properties.className as string[],
        options.langAssociations
      );

      // if the language is unknown or ignored, skip
      if (!lang || options.ignoreLangs.includes(lang)) return;

      // get meta data
      const meta = getMeta(codeNode);

      // get new highlighted pre node if `options.shiki` is given, otherwise use the current pre node
      const newPreNode = (() => {
        try {
          if (options.shiki) {
            const fragment = highlighter?.codeToHast(codeText, {
              ...options.shiki,
              lang:
                lang && highlighter.getLoadedLanguages().includes(lang)
                  ? lang
                  : "plaintext",
            });
            return fragment?.children[0] as Element | undefined;
          }
          return preNode;
        } catch {
          file.fail(`failed to highlight code block: ${codeText}`);
          return undefined;
        }
      })();
      if (!isPreElement(newPreNode)) return;

      // merge the current pre node with the new highlighted pre node
      newPreNode.data = merge(preNode.data ?? {}, newPreNode.data ?? {});
      newPreNode.position = preNode.position;
      newPreNode.properties = merge(
        preNode.properties ?? {},
        newPreNode.properties ?? {}
      );

      // set meta data
      newPreNode.properties.dataLang = lang;
      for (const [key, value] of Object.entries(meta)) {
        if (Array.isArray(value) || typeof value === "object") {
          newPreNode.properties[`data-${kebabCase(key)}`] =
            JSON5.stringify(value);
        } else {
          newPreNode.properties[`data-${kebabCase(key)}`] = String(value);
        }
      }

      // replace the current pre node with the highlighted pre node which is generated by shiki
      parent.children.splice(index, 1, newPreNode as Element);
    });
  };
};

export default rehypeCustomCodeBlock;
