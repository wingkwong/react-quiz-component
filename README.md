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
| `progressBarColor` | `string` | N | Hex color used by the progress bar. Defaults to `#9de1f6`. |

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
- Run `npm run lint`
- Make a PR to `develop` and describe the changes

## Demo

The demo is available at https://wingkwong.github.io/react-quiz-component/

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
