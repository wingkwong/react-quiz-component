# react-quiz-component

[![NPM version](https://img.shields.io/npm/v/react-quiz-component.svg)](https://www.npmjs.com/package/react-quiz-component) [![License](https://img.shields.io/npm/l/react-quiz-component.svg)](https://github.com/wingkwong/react-quiz-component/blob/master/LICENSE) [![Total NPM Download](https://img.shields.io/npm/dt/react-quiz-component.svg)](https://www.npmjs.com/package/react-quiz-component)

JSON-powered React quizzes with scoring, timers, feedback, images, multiple-choice answers, and customizable results. Use the ready-made `Quiz` component or build your own UI with headless hooks.

## Installation

```sh
npm install react-quiz-component
```

React and React DOM 18 or 19 are required as peer dependencies.

## Quick start

```tsx
'use client'; // Required in a Next.js App Router client boundary.
import Quiz, { type Quiz as QuizData } from 'react-quiz-component';

const quiz: QuizData = {
  quizTitle: 'Your first quiz',
  questions: [
    {
      question: 'Which hook stores local state?',
      questionType: 'text',
      answerSelectionType: 'single',
      answers: ['useState', 'useEffect'],
      correctAnswer: '1',
      point: 10,
    },
  ],
};

export default function App() {
  return <Quiz quiz={quiz} showInstantFeedback enableProgressBar />;
}
```

Headless APIs are available as named exports: `useQuiz`, `QuizProvider`, and `useQuizContext`. See the [headless guide](https://wingkwong.github.io/react-quiz-component/headless/).

## Documentation

Read the [documentation](https://wingkwong.github.io/react-quiz-component/) for guides and the full API reference, or explore the [interactive examples](https://wingkwong.github.io/react-quiz-component/examples/default/) with runnable previews and source code.

## Development

```sh
pnpm install
pnpm dev               # Builds the local library, then starts docs on localhost:3000
pnpm typecheck
pnpm test
pnpm build
pnpm test:package
pnpm test:react        # Installs packed consumers to verify React 18 and 19 (requires registry access)
pnpm build:docs        # Static site in docs/out
pnpm typecheck:docs
pnpm test:docs         # Browser checks against the static export
```

Install the test browser once with `pnpm --filter @react-quiz/docs exec playwright install chromium`.
After changing library source, rebuild with `pnpm build` (or restart `pnpm dev`) so the docs use the updated package. Documentation and demo source live in [docs](docs/README.md).

Submit contributions to `develop`.

## License

[MIT](LICENSE)
