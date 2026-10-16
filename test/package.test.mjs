import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import React from 'react';
import { renderToString } from 'react-dom/server';

const require = createRequire(import.meta.url);
assert.equal(typeof document, 'undefined');
const root = await import('react-quiz-component');
const rootCjs = require('react-quiz-component');
for (const name of ['useQuiz', 'QuizProvider', 'useQuizContext']) {
  assert.equal(typeof root[name], 'function');
  assert.equal(typeof rootCjs[name], 'function');
}
assert.equal(typeof root.default, 'function');
assert.equal(typeof rootCjs.default, 'function');
const quiz = {
  quizTitle: 'Server quiz',
  questions: [{ question: 'Example', questionType: 'text', answerSelectionType: 'single', answers: ['Yes'], correctAnswer: '1' }],
};
for (const library of [root, rootCjs]) {
  function Consumer() {
    const { state } = library.useQuizContext();
    return React.createElement('span', null, state.status);
  }
  const html = renderToString(React.createElement(library.QuizProvider, { quiz }, React.createElement(Consumer)));
  assert.equal(html, '<span>idle</span>');
  const markdownQuiz = { ...quiz, questions: [{ ...quiz.questions[0],
    question: '**Server Markdown** [click](javascript:alert%281%29) <img src="x" onerror="alert(1)">' }] };
  const defaultHtml = renderToString(React.createElement(library.default, { quiz: markdownQuiz, disableSynopsis: true }));
  assert.match(defaultHtml, /<strong>Server Markdown<\/strong>/);
  assert.doesNotMatch(defaultHtml, /javascript:|onerror=/);
}
// Importing only the root hook API must not inject default styles into a browser document.
const browserImport = spawnSync(process.execPath, ['--input-type=module', '-e', `
  import assert from 'node:assert/strict';
  import { JSDOM } from 'jsdom';
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  const { useQuiz, QuizProvider, useQuizContext } = await import('react-quiz-component');
  assert.equal(typeof useQuiz, 'function');
  assert.equal(typeof QuizProvider, 'function');
  assert.equal(typeof useQuizContext, 'function');
  assert.equal(document.querySelectorAll('style, link[rel="stylesheet"]').length, 0);
  dom.window.close();
`], { encoding: 'utf8' });
assert.equal(browserImport.status, 0, browserImport.stdout + browserImport.stderr);

// Only the package root exposes the API; the former subpath must not resolve.
await assert.rejects(import('react-quiz-component/headless'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
assert.throws(() => require('react-quiz-component/headless'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
for (const extension of ['js', 'mjs', 'd.ts', 'd.mts']) {
  assert.equal(existsSync(`dist/headless.${extension}`), false);
}
// Check every generated source map, including lazy chunks, for example-only dependencies.
for (const filename of readdirSync('dist', { recursive: true })) {
  if (!filename.endsWith('.map')) continue;
  const map = JSON.parse(readFileSync(path.join('dist', filename), 'utf8'));
  for (const source of map.sources ?? []) {
    assert.doesNotMatch(source.replaceAll('\\', '/'), /(?:^|\/)(?:docs|examples)\/|\/node_modules\/(?:@mui|@emotion|fumadocs-core|fumadocs-ui|fumadocs-mdx|@fumadocs|next)\//);
  }
}
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
assert.deepEqual(packageJson.files, ['dist']);
for (const dependency of Object.keys(packageJson.dependencies ?? {})) {
  assert.doesNotMatch(dependency, /^(?:@(mui|emotion|fumadocs)\/|fumadocs-|next$)/);
}
const cache = mkdtempSync(path.join(tmpdir(), 'quiz-package-check-'));
try {
  const packed = spawnSync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json', '--cache', cache], { encoding: 'utf8' });
  assert.equal(packed.status, 0, packed.stdout + packed.stderr);
  const [manifest] = JSON.parse(packed.stdout);
  for (const file of manifest.files) {
    assert.doesNotMatch(file.path, /^(?:docs|src|examples|\.examples-dist)\//);
  }
} finally {
  rmSync(cache, { recursive: true, force: true });
}
for (const resolution of [[], ['--module', 'preserve', '--moduleResolution', 'bundler']]) {
  const types = spawnSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'test/tsconfig.package.json', ...resolution], { encoding: 'utf8' });
  assert.equal(types.status, 0, types.stdout + types.stderr);
}
console.log('Package checks passed: ESM, CommonJS, root-only exports, SSR, no styles on import, TypeScript declarations, and example-free bundles/package.');
