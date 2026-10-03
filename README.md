# eslint-ast-explorer

[![CI](https://github.com/ntnyq/eslint-ast-explorer/workflows/CI/badge.svg)](https://github.com/ntnyq/eslint-ast-explorer/actions)
[![LICENSE](https://img.shields.io/github/license/ntnyq/eslint-ast-explorer.svg)](https://github.com/ntnyq/eslint-ast-explorer/blob/main/LICENSE)

> :apple: ESLint AST explorer.

## Commands

```bash
# install dependencies
pnpm install

# start dev server
pnpm run dev

# SSR
pnpm run build

# SSG
pnpm run generate

# local preview
pnpm run preview

# browser regression tests against the generated site
pnpm run generate
pnpm exec playwright install chromium
pnpm run test:e2e
```

The browser suite covers all seven languages and ten parsers in light and dark
mode, including invalid input recovery, rendered syntax colors, repeated
selection changes, refresh, and browser history. It also checks that late async
parse results cannot overwrite the current AST and that shared URLs cannot
automatically execute remote parser modules.

## Browser parsers

Default parsers are bundled from the lockfile and served with the application.
An explicitly selected package version uses jsDelivr; a custom module URL must
be applied manually in the parser version dialog. TypeScript-ESLint continues
to use its bundled parser and does not support version overrides.

Package versions must be valid semver versions/ranges (up to 256 characters)
or dist-tags starting with a letter (up to 64 characters). Paths, encoded
separators, query strings, fragments, and control characters are rejected before
any metadata request or module import. The same validation applies to shared
URLs, restored local state, and manual input; remote module URLs are never
restored from shared or persisted state.

Astro uses the official `@astrojs/compiler-binding-wasm32-wasi` browser binding
and Web Workers. Its shared WebAssembly memory requires a secure context and
cross-origin isolation. `vercel.json`, the development server, and the test
server set these headers:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Other static hosts must provide the same headers and serve `.wasm` files as
`application/wasm`. The binding version must match the compiler version used by
`astro-eslint-parser`. Browser parsing does not provide Node filesystem access
or resolve project files from the host machine. See the
[Astro compiler](https://github.com/withastro/compiler-rs) and
[NAPI-RS browser requirements](https://napi.rs/docs/concepts/webassembly).

## Credits

- Most of source code is copied from [ast-explorer](https://github.com/sxzz/ast-explorer)

## License

[MIT](./LICENSE) License © 2024-PRESENT [ntnyq](https://github.com/ntnyq)
