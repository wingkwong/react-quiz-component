# Runnable examples

From the repository root:

```sh
pnpm install
pnpm dev
```

Open [localhost:8080](http://localhost:8080) to choose an example:

| Example | URL | Implementation |
| --- | --- | --- |
| Default UI | [default-ui.html](http://localhost:8080/default-ui.html) | `examples/default-ui/app.jsx` uses the bundled `Quiz` component with no custom hooks or provider. |
| MUI | [mui.html](http://localhost:8080/mui.html) | `examples/mui/app.jsx` uses `QuizProvider` and `useQuizContext` with Material UI components. |

Both examples import from `react-quiz-component`. The example runner resolves that package name to the local library source, so library changes reload without a separate build. A shared entry mounts the example selected by each page's `data-example` attribute. Both examples use the shared `examples/quiz.js` fixture.

The MUI page loads Material UI, Emotion, and a shared React/React DOM runtime from [esm.sh](https://esm.sh/), so it requires internet access. The local `bundle.js` contains the quiz engine and both demo interfaces. Webpack generates an import map with exact versions from the installed packages; use `pnpm install --frozen-lockfile` for reproducible CDN URLs. Development uses the CDN's development builds, and `build:docs` uses production builds. The default UI page uses bundled dependencies and does not request the MUI CDN modules.

`pnpm build:docs` generates the gallery and both runnable pages in the repository’s `docs/` directory, ready for GitHub Pages. Edit the sources here in `src/docs/`; generated files in `docs/` are replaced on each build. Relative page and asset links also work under the repository’s GitHub Pages subpath. This is separate from `pnpm build`, which builds only the library into `dist/`.

Every docs build emits one JavaScript bundle (`bundle.js`) and one stylesheet (`main.css`), alongside the HTML pages and favicon. Webpack merges lazy imports into this single bundle and removes stale generated files before writing the build. The library's own build keeps its lazy stylesheet behavior.

Examples, their output, and MUI/Emotion are excluded from the library bundles and npm package. MUI and Emotion are development dependencies used by the example runner. The library build fails if example code or these UI packages enter its module graph.

To copy the MUI example into another app, copy `examples/mui/app.jsx` and `examples/quiz.js` (adjust its relative import), then install `@mui/material`, `@emotion/react`, and `@emotion/styled` in that app. The default UI example only needs React and `react-quiz-component`.
