# bun-npm-package

A bun + typescript npm package template.

## Installation

```sh
# npm
npm install bun-npm-package

# pnpm
pnpm add bun-npm-package

# bun
bun add bun-npm-package
```

## Usage

```ts
import { helloWorld } from "bun-npm-package";

expect(helloWorld()).toBe("Hello, world!");
```

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
