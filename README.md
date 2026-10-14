# react-quiz-component

:orange_book: React Quiz Component

react-quiz-component is a ReactJS component that renders a quiz from a JSON object. It supports text and photo answers, single and multiple answer selection, scoring, timers, shuffling, progress display, custom locale text, and result callbacks.

[![NPM version](https://img.shields.io/npm/v/react-quiz-component.svg)](https://www.npmjs.com/package/react-quiz-component) [![License](https://img.shields.io/npm/l/react-quiz-component.svg)](https://github.com/wingkwong/react-quiz-component/blob/master/LICENSE) [![Total NPM Download](https://img.shields.io/npm/dt/react-quiz-component.svg)](https://www.npmjs.com/package/react-quiz-component)


## Features

- JSON-based quiz source
- Quiz landing page with title, synopsis, and number of questions
- Input validation for quiz data
- Text and photo answer choices
- Single-answer and multiple-answer questions
- Question markdown support
- Optional question images
- Per-question explanations and answer messages
- Scoring with total and correct points
- Question segments and selection tags
- Question and answer shuffling
- Instant feedback
- Retry-until-correct mode
- Reveal-answer-on-submit mode
- Previous and next navigation
- Default result page with all, correct, incorrect, and unanswered filters
- Custom result page support
- Quiz completion and per-question callbacks
- Timer support with optional pause and resume
- Optional progress bar

## Installation

```sh
npm i react-quiz-component
```

## Quick Start

```jsx
import Quiz from 'react-quiz-component';

const quiz = {
  quizTitle: 'React Quiz Component Demo',
  quizSynopsis: 'A short quiz about React basics.',
  nrOfQuestions: 3,
  progressBarColor: '#9de1f6',
  questions: [
    {
      question: 'Which hook lets a function component store local state?',
      questionType: 'text',
      questionPic: 'https://dummyimage.com/600x240/9de1f6/000000&text=React+Hooks',
      answerSelectionType: 'single',
      answers: ['useMemo', 'useState', 'useEffect', 'useRef'],
      correctAnswer: '2',
      messageForCorrectAnswer: 'Correct. useState stores local component state.',
      messageForIncorrectAnswer: 'Not quite. Look for the hook that stores state.',
      explanation: 'useState returns a state value and a setter function.',
      point: 10,
      segment: 'React Hooks',
    },
    {
      question: 'Select the React rendering methods.',
      questionType: 'text',
      answerSelectionType: 'multiple',
      answers: ['createRoot', 'renderToString', 'setTimeout', 'querySelector'],
      correctAnswer: [1, 2],
      messageForCorrectAnswer: 'Correct. React supports client and server rendering APIs.',
      messageForIncorrectAnswer: 'Incorrect. Select only React rendering APIs.',
      explanation: 'createRoot is used for client rendering. renderToString is used for server rendering.',
      point: 20,
      segment: 'Rendering',
    },
    {
      question: 'Which image shows the React logo?',
      questionType: 'photo',
      answerSelectionType: 'single',
      answers: [
        'https://dummyimage.com/300x180/61dafb/000000&text=React',
        'https://dummyimage.com/300x180/f7df1e/000000&text=JS',
        'https://dummyimage.com/300x180/3178c6/ffffff&text=TS',
      ],
      correctAnswer: '1',
      messageForCorrectAnswer: 'Correct.',
      messageForIncorrectAnswer: 'Incorrect.',
      explanation: 'The React logo is commonly shown with a light blue atom-like mark.',
      point: 10,
      segment: 'Logos',
    },
  ],
};

export default function App() {
  return <Quiz quiz={quiz} />;
}
```

You can also import the quiz source from another file:

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function App() {
  return <Quiz quiz={quiz} />;
}
```

### Quiz Fields

| Name | Type | Required | Description |
| :-- | :-- | :--: | :-- |
| `quizTitle` | `string` | Y | Title shown on the landing page. |
| `quizSynopsis` | `string` | N | Introductory text shown before the quiz starts. |
| `nrOfQuestions` | `number` | N | Number of questions to use from `questions`. If omitted, all questions are used. |
| `questions` | `Question[]` | Y | Question definitions. |
| `appLocale` | `Partial<AppLocale>` | N | Locale text overrides. |
| `progressBarColor` | `string` | N | Hex color used by the progress bar. Defaults to the theme’s blue accent (`#2563eb` in light mode). |

### Question Fields

| Name | Type | Required | Description |
| :-- | :-- | :--: | :-- |
| `question` | `string` | Y | Question text. Markdown is supported. |
| `questionType` | `'text' \| 'photo'` | Y | Use `text` for text answers or `photo` for image answer URLs. |
| `questionPic` | `string` | N | Image URL displayed with the question. |
| `answerSelectionType` | `'single' \| 'multiple'` | Y | Whether the user selects one answer or multiple answers. |
| `answers` | `string[]` | Y | Text answers or image URLs, depending on `questionType`. |
| `correctAnswer` | `string \| number[]` | Y | Correct answer index or indexes. See answer indexing below. |
| `messageForCorrectAnswer` | `string` | N | Message shown for a correct answer when instant feedback is enabled. |
| `messageForIncorrectAnswer` | `string` | N | Message shown for an incorrect answer when instant feedback is enabled. |
| `explanation` | `string` | N | Explanation shown after answering and on the result page. |
| `point` | `string \| number` | N | Points assigned to the question. |
| `segment` | `string` | N | Label shown with the question tags. |

### Answer Indexing

Answer indexes are 1-based.

For a single-answer question, `correctAnswer` is a string:

```js
{
  answerSelectionType: 'single',
  answers: ['First', 'Second', 'Third'],
  correctAnswer: '2',
}
```

For a multiple-answer question, `correctAnswer` is an array of numbers:

```js
{
  answerSelectionType: 'multiple',
  answers: ['First', 'Second', 'Third'],
  correctAnswer: [1, 3],
}
```

## Headless quizzes and custom UI

Use `react-quiz-component` when you want to supply every component yourself, including MUI, Chakra, or your own design system. The hooks and provider render no wrapper elements or browser dialogs. Default UI styles load only when you render the default `Quiz` component. The existing default `Quiz` component uses the same engine and retains its props and styles.

```jsx
import { useQuiz } from 'react-quiz-component';

function CustomQuiz({ quiz }) {
  const { state, actions } = useQuiz({ quiz });
  if (state.status === 'invalid') return <p>{state.errors.join(' ')}</p>;
  if (state.status === 'idle') return <button onClick={actions.start}>Start</button>;
  if (state.status === 'completed') return (
    <div>
      <p>Score: {state.summary.correctPoints} / {state.summary.totalPoints}</p>
      <button onClick={actions.reset}>Try again</button>
    </div>
  );
  return (
    <section>
      <h2>{state.currentQuestion.question}</h2>
      {state.answers.map((answer) => (
        <button key={answer.answerNumber} disabled={answer.disabled}
          aria-pressed={answer.selected}
          onClick={() => actions.selectAnswer(answer.answerNumber)}>
          {answer.value}
        </button>
      ))}
      <p aria-live="polite">{state.feedback}</p>
      {state.canGoNext && <button onClick={actions.nextQuestion}>Next</button>}
      {state.canSubmit && <button onClick={actions.submitQuiz}>Finish</button>}
    </section>
  );
}
```

For separate question, timer, navigation, and result components, share a session through context:

```jsx
import { QuizProvider, useQuizContext } from 'react-quiz-component';

function StartButton() {
  const { state, actions } = useQuizContext();
  return state.canStart ? <button onClick={actions.start}>Start</button> : null;
}

function App({ quiz }) {
  return <QuizProvider quiz={quiz}><StartButton /></QuizProvider>;
}
```

`QuizProvider` accepts the same options as `useQuiz` and adds no DOM element. Each provider or standalone hook owns an independent session. `useQuizContext()` requires an ancestor provider. Calling `useQuiz()` inside a provider creates a **new** session; use `useQuizContext()` to access the shared one. Import the hooks, provider, and their TypeScript types directly from `react-quiz-component`; no subpath is required.

### Headless options

`UseQuizOptions` accepts `quiz`, `shuffle`, `shuffleAnswer`, `continueTillCorrect`, `revealAnswerOnSubmit`, `allowNavigation`, `timer`, `allowPauseTimer`, `onQuestionSubmit`, `onComplete`, and `autoStart`. Boolean options default to `false`; the timer is off unless supplied. `autoStart` replaces the default UI's `disableSynopsis` prop. Presentation props such as `showInstantFeedback`, `showDefaultResult`, `customResultPage`, and `enableProgressBar` belong to your renderer.

Quiz data and behavior options are captured at session creation. Rerendering with a new object does not restart or reshuffle the quiz. `reset()` creates a session from the latest options, reshuffles if enabled, clears answers and results, resets the timer, and honors `autoStart`. Callback references update without resetting. To switch datasets immediately, remount your component/provider using a new React `key`.

### State and actions

Treat state as read-only; use actions to change it. Question indexes are **zero-based** and answer numbers are **one-based**, matching the existing callback format.

| State | Meaning |
| --- | --- |
| `status`, `errors` | `idle`, `active`, `paused`, `completed`, or `invalid`; invalid data produces errors rather than crashing. |
| `quiz`, `questions`, `appLocale` | Session metadata, prepared questions, and merged locale strings. |
| `currentQuestionIndex`, `currentQuestion`, `currentQuestionState` | Current question and its state; undefined question values are possible for invalid quizzes. |
| `questionStates`, `userInput` | Recorded answers, per-question evaluated attempts, scoring outcomes, and feedback. |
| `answers` | Current answer options with `answerNumber`, `value`, `selected`, `disabled`, and `feedback` (`correct`, `incorrect`, or `null`). |
| `feedback` | Most recent immediate evaluation for the current question. Deferred mode hides correctness feedback until results. |
| `correct`, `incorrect`, `unanswered` | Question index lists. Single-answer retries retain first-attempt scoring and recorded input even after correct feedback. |
| `canStart`, `canGoNext`, `canGoPrevious`, `canSubmit`, `canPause`, `canResume` | Whether each action is currently allowed. `allowNavigation` reports the session setting. |
| `timer`, `timeRemaining`, `timeTaken` | Seconds; timing starts with the quiz, stops while paused, and expiry completes even with unanswered questions. Untimed quizzes have `timeTaken: 0`. |
| `progress` | Existing position-based percentage: zero on the first question and 100 on completion. |
| `summary` | Existing `QuestionSummary` payload, available throughout the session. |
| `resultFilter`, `filteredResults` | `all`, `correct`, `incorrect`, or `unanswered`, and the matching question states. |

Actions return `{ ok: true }` or `{ ok: false, reason }`; invalid actions do not change state. `reason` is a typed `BlockedReason` such as `invalid-state`, `disabled-answer`, or `incomplete-quiz`.

| Action | Behavior |
| --- | --- |
| `start()` | Starts an idle session. |
| `selectAnswer(answerNumber)` | Evaluates immediate answers, or edits deferred answers; multiple deferred selections toggle. |
| `nextQuestion()` | Advances when allowed; never submits on the final question. |
| `previousQuestion()`, `goToQuestion(index)` | Navigate when `allowNavigation` is enabled. |
| `submitQuiz()` | Completes an active quiz when `canSubmit` is true. No browser dialog is opened. |
| `pauseTimer()`, `resumeTimer()` | Pause/resume a timed session when enabled. Selection and navigation are blocked while paused. |
| `setResultFilter(filter)` | Sets the result filter without changing quiz answers. |
| `reset()` | Rebuilds the session from the latest options. Invalid latest options return `invalid-quiz` and expose validation errors. |

Immediate multiple-answer questions are evaluated when the required selection count is reached. `continueTillCorrect` applies to immediate single-answer questions. In deferred mode, correctness is tracked for scoring but no correctness feedback is shown during selection.

### Callback behavior

Callbacks now belong to the engine and work without rendering feedback components. `onComplete` runs once per completed session, including timeout. `onQuestionSubmit` runs once per evaluated immediate attempt, with that attempt's actual answer. In deferred mode it runs when leaving an answered question or completing the quiz (including timeout), once per changed answer revision. Revisiting an unchanged question, rerendering, or changing callback identity does not deliver duplicate events. Payload shapes remain unchanged. Callbacks run synchronously after the engine accepts the action; use their payloads rather than a render's captured state.

### Runnable examples

The [docs showcase](src/docs/README.md) contains two runnable applications:

- [Default UI](src/docs/examples/default-ui/app.jsx): the bundled `Quiz` component with no custom hooks or provider.
- [MUI](src/docs/examples/mui/app.jsx): a custom Material UI interface using `QuizProvider` and `useQuizContext`, including feedback, timer/pause, submission dialog, filtered results, and restart.

From the repository root:

```sh
pnpm install
pnpm dev
```

Open [localhost:8080](http://localhost:8080) to choose an example. Both applications import from `react-quiz-component` and reload against the local library source.

The docs build emits one shared `docs/bundle.js` and `docs/main.css` for all example pages. The MUI example loads its UI dependencies and shared React runtime from [esm.sh](https://esm.sh/) with pinned versions. It requires internet access. The default UI example uses bundled dependencies without requesting MUI's CDN modules.

`pnpm build` builds only the library into `dist/`. Example code, MUI, and Emotion never enter those bundles; the build rejects accidental imports. Examples are also excluded from the published npm package. Use `pnpm build:docs` to build the showcase into `docs/` for GitHub Pages.

To copy the MUI example into your app, copy [its component](src/docs/examples/mui/app.jsx) and [sample data](src/docs/examples/quiz.js), adjust the data import, and install `@mui/material`, `@emotion/react`, and `@emotion/styled` in your app. These packages are development dependencies here, not runtime dependencies of `react-quiz-component`.

## Examples

### Shuffle Questions

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} shuffle />;
```

### Shuffle Answers

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} shuffleAnswer />;
```

### Instant Feedback

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} showInstantFeedback />;
```

### Retry Until Correct

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} continueTillCorrect />;
```

### Reveal Answer On Submit

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} revealAnswerOnSubmit />;
```

### Previous And Next Navigation

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} allowNavigation />;
```

### Timer

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} timer={60} />;
```

### Pause And Resume Timer

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} timer={60} allowPauseTimer />;
```

### Progress Bar

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

const quizWithProgressColor = {
  ...quiz,
  progressBarColor: '#34d399',
};

<Quiz quiz={quizWithProgressColor} enableProgressBar />;
```

### Disable Landing Synopsis

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

<Quiz quiz={quiz} disableSynopsis />;
```

### Completion Callback

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

const handleComplete = (summary) => {
  console.log(summary);
};

<Quiz quiz={quiz} onComplete={handleComplete} />;
```

### Question Submit Callback

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

const handleQuestionSubmit = ({ question, userAnswer, isCorrect }) => {
  console.log(question, userAnswer, isCorrect);
};

<Quiz quiz={quiz} onQuestionSubmit={handleQuestionSubmit} />;
```

### Custom Result Page

Set `showDefaultResult` to `false` when using `customResultPage`.

```jsx
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

const renderCustomResultPage = (summary) => {
  return (
    <div>
      <h2>Custom result page</h2>
      <p>
        You scored {summary.correctPoints} out of {summary.totalPoints}.
      </p>
    </div>
  );
};

<Quiz
  quiz={quiz}
  showDefaultResult={false}
  customResultPage={renderCustomResultPage}
/>;
```

## Props

| Name | Type | Default | Required | Description |
| :-- | :-- | :-- | :--: | :-- |
| `quiz` | `Quiz` | `null` | Y | Quiz source object. |
| `shuffle` | `boolean` | `false` | N | Shuffle questions before rendering. |
| `shuffleAnswer` | `boolean` | `false` | N | Shuffle answer choices before rendering. |
| `showDefaultResult` | `boolean` | `true` | N | Show the built-in result page when the quiz ends. |
| `onComplete` | `(summary: QuestionSummary) => void` | `undefined` | N | Called once when the quiz completes. |
| `customResultPage` | `(summary: QuestionSummary) => React.ReactElement` | `undefined` | N | Render a custom result page. Use with `showDefaultResult={false}`. |
| `showInstantFeedback` | `boolean` | `false` | N | Show correct or incorrect messages after answers are submitted. |
| `continueTillCorrect` | `boolean` | `false` | N | For single-answer questions, let the user keep trying until the correct answer is selected. |
| `revealAnswerOnSubmit` | `boolean` | `false` | N | Let the user select an answer before submitting and revealing correctness. |
| `allowNavigation` | `boolean` | `false` | N | Show previous and next controls so users can move between questions. |
| `onQuestionSubmit` | `(data: QuestionSubmitData) => void` | `undefined` | N | Called when a question answer is submitted with the question, user answer, and correctness. |
| `disableSynopsis` | `boolean` | `false` | N | Skip the landing page and start the quiz immediately. |
| `timer` | `number` | `undefined` | N | Quiz duration in seconds. Must be greater than `0`. |
| `allowPauseTimer` | `boolean` | `false` | N | Allow pausing and resuming when `timer` is set. |
| `enableProgressBar` | `boolean` | `false` | N | Show a progress bar above the quiz. |

## Locale Customization

Add `appLocale` to the quiz source to override any default text. Placeholders such as `<questionLength>`, `<correctIndexLength>`, `<correctPoints>`, `<totalPoints>`, `<numberOfSelection>`, and `<marks>` are replaced dynamically.

```js
const quiz = {
  quizTitle: 'React Quiz Component Demo',
  questions: [],
  appLocale: {
    landingHeaderText: '<questionLength> Questions',
    question: 'Question',
    startQuizBtn: 'Start Quiz',
    resultFilterAll: 'All',
    resultFilterCorrect: 'Correct',
    resultFilterIncorrect: 'Incorrect',
    resultFilterUnanswered: 'Unanswered',
    nextQuestionBtn: 'Next',
    prevQuestionBtn: 'Prev',
    resultPageHeaderText: 'You have completed the quiz. You got <correctIndexLength> out of <questionLength> questions.',
    resultPagePoint: 'You scored <correctPoints> out of <totalPoints>.',
    pauseScreenDisplay: 'Test is paused. Clicked the Resume button to continue',
    timerTimeRemaining: 'Time Remaining',
    timerTimeTaken: 'Time Taken',
    pauseScreenPause: 'Pause',
    pauseScreenResume: 'Resume',
    singleSelectionTagText: 'Single Selection',
    multipleSelectionTagText: 'Multiple Selection',
    pickNumberOfSelection: 'Pick <numberOfSelection>',
    marksOfQuestion: '(<marks> marks)',
  },
};
```

## Callback Payloads

`onComplete(summary)` and `customResultPage(summary)` receive a `QuestionSummary` object:

```ts
type QuestionSummary = {
  numberOfQuestions: number;
  numberOfCorrectAnswers: number;
  numberOfIncorrectAnswers: number;
  questions: Question[];
  userInput: (number | number[] | undefined)[];
  totalPoints: number;
  correctPoints: number;
  timeTaken: number;
};
```

`onQuestionSubmit(data)` receives the submitted question result:

```ts
type QuestionSubmitData = {
  question: Question;
  userAnswer: number | number[] | undefined;
  isCorrect: boolean;
};
```

For `userInput` and `userAnswer`, single-answer questions use a 1-based number such as `2`, multiple-answer questions use a 1-based number array such as `[1, 3]`, and unanswered questions can be `undefined`.

## Development And Contribution

- Clone the repository
- Run `npm install`
- Run `npm run dev`
- Run `npm run typecheck`, `npm test`, and `npm run build`
- Run `npm run test:package` after building to verify package exports and types
- Run `npm exec -- oxlint src test --react-plugin --jsx-a11y-plugin --import-plugin` for a non-mutating lint check
- Run `npm run lint` to apply lint fixes
- Make a PR to `develop` and describe the changes

## Demo

The demo is available at https://wingkwong.github.io/react-quiz-component/

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
