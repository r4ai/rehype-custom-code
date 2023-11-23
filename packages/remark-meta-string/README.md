# remark-code-meta-string

Pass the meta string of the Code block as a metaString to hast's properties.

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

See: [test code](./tests/plugin.test.ts)

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
