# Documentation development

This private pnpm workspace uses Next.js static export, Fumadocs UI, and MDX. It imports the local library through `react-quiz-component`'s public exports.

From the repository root:

```sh
pnpm install
pnpm dev                  # http://localhost:3000
pnpm build:docs           # Library build, then site export into docs/out
pnpm typecheck:docs
pnpm --filter @react-quiz/docs exec playwright install chromium
pnpm test:docs            # Serves and tests the export at /react-quiz-component/
```

Rebuild the library with `pnpm build` after changing its source; restarting `pnpm dev` also rebuilds it. MDX pages and demo components hot reload in the docs development server.

## Authoring

- Pages: `content/docs/*.mdx`, ordered by `meta.json`.
- Interactive demos: `components/examples/`; each imports from the package root.
- `ExampleSource` reads the runnable source during the build for highlighted, copyable examples.
- `ExamplePreview` mounts demos only in the browser to avoid hydration mismatches from random sessions.
- `public/images` contains local example assets. Prefix raw asset URLs with `NEXT_PUBLIC_BASE_PATH`; Next links handle `basePath` automatically.
- Search uses a build-time index and runs in the browser. It has no hosted search dependency or runtime API server.

Do not commit `.next`, generated MDX caches, `out`, or browser-test artifacts. The npm package includes only `dist`.

## GitHub Pages

The production base path is `/react-quiz-component`. The introduction is served directly at that root; documentation pages use URLs such as `/react-quiz-component/getting-started/`, without a `/docs/` prefix. The workflow checks pull requests and deploys successful `develop` builds; manual dispatch only accepts `develop`. It uses the `github-pages` environment and the Pages artifact, not committed generated HTML.

When the replacement workflow is ready on `develop`, change **Settings → Pages → Build and deployment → Source** from **Deploy from a branch** to **GitHub Actions**, then run the Documentation workflow. Preserve the existing URL and do not change DNS. Switching the setting before the replacement workflow is available would interrupt the existing publishing process.

Verify the homepage, a direct nested URL, search, images, and all three demos at https://wingkwong.github.io/react-quiz-component/ after deployment. Successful builds on `develop` publish the documentation automatically, including documentation for unreleased library changes.
