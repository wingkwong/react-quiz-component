import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-scripts': 'ReactScripts',
};

const exampleDirectories = ['./docs/']
  .map((directory) => fileURLToPath(new URL(directory, import.meta.url)));

const extensions = ['.ts', '.tsx', '.js', '.jsx'];

export default [
  {
    input: { index: './src/lib/index.ts' },
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'named',
        format: 'cjs',
        // Keep require() callable while exposing the default and headless APIs.
        footer: (chunk) => chunk.isEntry ? 'module.exports = Object.assign(exports.default, exports);' : '',
        globals,
        sourcemap: true,
      },
      {
        dir: 'dist',
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name]-[hash].mjs',
        format: 'es',
        exports: 'named',
        globals,
        sourcemap: true,
      },
    ],
    external: (id) => id === 'react' || id.startsWith('react/') || id === 'react-dom' || id.startsWith('react-dom/'),
    plugins: [
      {
        name: 'exclude-examples-from-library',
        generateBundle(_options, bundle) {
          for (const output of Object.values(bundle)) {
            if (output.type !== 'chunk') continue;
            for (const moduleId of Object.keys(output.modules)) {
              const normalized = moduleId.replaceAll('\\', '/');
              if (exampleDirectories.some((directory) => moduleId.includes(directory))
                || /\/node_modules\/(?:@mui|@emotion|fumadocs-core|fumadocs-ui|fumadocs-mdx|@fumadocs|next)\//.test(normalized)) {
                this.error(`Example-only code must not be bundled in the library: ${path.basename(moduleId)}`);
              }
            }
          }
        },
      },
      peerDepsExternal(),
      nodeResolve({
        modulePaths: ['./src/lib/'],
        browser: true,
        preferBuiltins: true,
        jsnext: true,
        extensions,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        rootDir: './src/lib',
        filterRoot: process.cwd(),
        include: ['src/lib/**/*.ts', 'src/lib/**/*.tsx', 'src/styles.d.ts'],
        exclude: ['**/*.test.ts', '**/*.test.tsx', '**/docs/**', '**/examples/**'],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      postcss({
        plugins: [],
        minimize: true,
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions,
        inputSourceMap: false,
        presets: [
          '@babel/preset-env',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      }),
      commonjs({
        include: 'node_modules/**',
      }),
      terser(),
      {
        name: 'public-declarations',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'index.d.cts',
            source: readFileSync(new URL('./src/lib/commonjs.d.cts', import.meta.url), 'utf8'),
          });
          // ESM consumers need an ESM declaration entry for the default component export.
          this.emitFile({ type: 'asset', fileName: 'index.d.mts', source: [
            "declare const Quiz: typeof import('./quiz.js').default;",
            'export default Quiz;',
            "export * from './engine/index.js';",
            "export type { QuizProps } from './types.js';",
            '',
          ].join('\n') });
        },
      },
    ],
  },
];
