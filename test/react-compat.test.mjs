// Install the actual tarball in an isolated consumer to catch duplicate React.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const temporary = mkdtempSync(path.join(tmpdir(), 'quiz-react-compat-'));
const cache = path.join(temporary, 'cache');
const run = (command, args, cwd = temporary) => {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 180000 });
  assert.equal(result.status, 0, result.error?.message ?? result.stdout + result.stderr);
  return result.stdout;
};
try {
  const [packed] = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary, '--cache', cache], process.cwd()));
  for (const version of process.env.REACT_VERSION ? [process.env.REACT_VERSION] : ['18.3.1', '19.3.1']) {
    const consumer = path.join(temporary, `react-${version}`);
    mkdirSync(consumer);
    writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', '--cache', cache,
      path.join(temporary, packed.filename), `react@${version}`, `react-dom@${version}`], consumer);
    run(process.execPath, ['--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      import React from 'react';
      import { renderToString } from 'react-dom/server';
      import * as esm from 'react-quiz-component';
      const require = createRequire(import.meta.url);
      const cjs = require('react-quiz-component');
      const libraryRequire = createRequire(require.resolve('react-quiz-component'));
      assert.equal(libraryRequire.resolve('react'), require.resolve('react'));
      assert.equal(libraryRequire.resolve('react-dom'), require.resolve('react-dom'));
      const quiz = { quizTitle: 'Consumer', questions: [{ question: '**Hello**', questionType: 'text', answerSelectionType: 'single', answers: ['Yes'], correctAnswer: '1' }] };
      for (const library of [esm, cjs]) {
        function Consumer() {
          const { state } = library.useQuizContext();
          return React.createElement('span', null, state.status);
        }
        assert.equal(renderToString(React.createElement(library.QuizProvider, { quiz }, React.createElement(Consumer))), '<span>idle</span>');
        assert.match(renderToString(React.createElement(library.default, { quiz, disableSynopsis: true })), /<strong>Hello<\\/strong>/);
      }
    `], consumer);
    console.log(`Packed consumer passed with React ${version}: shared React, ESM, CJS, hooks and default UI SSR.`);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
