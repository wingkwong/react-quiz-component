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
- Examples use collapsible sidebar groups whose metadata references the flat example pages with `../page-name`, preserving public URLs. Keep every `QuizProps` entry in the component reference linked to a runnable example.
- Interactive demos: `components/examples/`; each imports from the package root.
- `ExampleSource` reads the runnable source during the build for highlighted, copyable examples.
- `ExamplePreview` mounts demos only in the browser to avoid hydration mismatches from random sessions.
- `public/images` contains local example assets. Prefix raw asset URLs with `NEXT_PUBLIC_BASE_PATH`; Next links handle `basePath` automatically.
- Search uses a build-time index and runs in the browser. It has no hosted search dependency or runtime API server.

Do not commit `.next`, generated MDX caches, `out`, or browser-test artifacts. The npm package includes only `dist`.
