# rehype-custom-code (WIP)

This plugin is intended to facilitate the creation of your own custom code blocks using custom components such as React by outputting metadata as Props. Therefore, this plugin is headless and only outputs Props based on the input given as metadata. Styling should be done with custom components based on these Props.

This plugin also supports syntax highlighting with shikiji by adding `options.shiki` to the plugin options.

## Features

- [ ] Metadata parsing and output as Props
  - [x] Custom Key-Value Pairs e.g. `title="Hello, World!"`, `caption=main.js`
  - [x] Numeric Range e.g. `{1-5}`, `{1,2,3,4,5}`
  - [ ] Word Range e.g. `/hello/`, `/helloworld/3-5`
- [x] Code block syntax highlighting with shikiji
- [ ] Inline code syntax highlighting with shikiji
- [ ] ANSI syntax highlighting
- [x] Line numbers
- [x] Line based diff highlighting

## Installation

```sh
# npm
npm install rehype-custom-code

# pnpm
pnpm add rehype-custom-code

# bun
bun add rehype-custom-code
```

## Usage

### Generate HTML

This is the most basic example and is usually used in conjunction with rehype-react or mdx, with the pre tag replaced by its own component. To allow customization with your own components, this plugin is designed to pass metadata information as Props; in the case of HTML output, this is output as HTML attributes.

```ts
import {
  rehypeCustomCode,
  type RehypeCustomCodeMeta,
} from "rehype-custom-code";

const md = `
  \`\`\`javascript title="Hello, World!" {1-5}
  console.log("Hello, World!");
  \`\`\`
`;

// You can define your own typescript type to the metadata.
type Meta = RehypeCustomCodeMeta & {
  someKey: string;
};

const html = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeCustomCode<Meta>, {
    shiki: {
      propsPrefix: "data", // for JSX like languages, use `propsPrefix: ""`
      themes: {
        light: "github-light",
        dark: "one-dark-pro",
      },
    },
  })
  .use(rehypeStringify)
  .process(md);

console.log(html.toString());
```

Yields:

```html
<pre
  class="shiki shiki-themes github-light one-dark-pro"
  style="
    background-color: #fff;
    --shiki-dark-bg: #282c34;
    color: #24292e;
    --shiki-dark: #abb2bf;
  "
  tabindex="0"
  data-lang="javascript"
  data-range="[1,2,3,4,5]"
  data-show-line-numbers="true"
  data-start-line="1"
  data-diff="false"
  data-title="Hello, World!"
>
  <code data-line-numbers>
    <span class="line" data-line="1"><span style="color:#24292E;--shiki-dark:#E5C07B">console</span><span style="color:#24292E;--shiki-dark:#ABB2BF">.</span><span style="color:#6F42C1;--shiki-dark:#61AFEF">log</span><span style="color:#24292E;--shiki-dark:#ABB2BF">(</span><span style="color:#032F62;--shiki-dark:#98C379">"Hello, World!"</span><span style="color:#24292E;--shiki-dark:#ABB2BF">);</span></span>
  </code>
</pre>
```

## Options

See [RehypeCustomCodeOptions](https://r4ai.github.io/rehype-custom-code/api/types/index.RehypeCustomCodeOptions.html) for available options.

## Development

### Commands

| Command                       | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `bun install`                 | Install dependencies                              |
| `bun run build`               | Build the project                                 |
| `bun run test`                | Run tests with watch mode                         |
| `bun run check`               | Lint and format                                   |
| `npm publish --dry-run`       | Check locally for products to be published to npm |
| `npm publish --access public` | Publish to npm                                    |

### Publish

1. Update version in `package.json`
2. commit with tag `vX.X.X`
3. push to GitHub
