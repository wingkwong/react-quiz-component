'use client';

import './examples.css';
import {
  QuizProvider,
  useQuizContext,
  type ResultFilter,
} from 'react-quiz-component';
import { quiz } from './quiz';

function Question() {
  const { state, actions } = useQuizContext();
  if (state.status === 'invalid')
    return <p role="alert">{state.errors.join(' ')}</p>;
  if (state.status === 'idle')
    return (
      <>
        <h2>{quiz.quizTitle}</h2>
        <p>Review your answers before submitting. You have two minutes.</p>
        <button onClick={actions.start}>Start quiz</button>
      </>
    );
  if (state.status === 'paused') return <output>Quiz paused.</output>;
  if (state.status !== 'active') return null;
  return (
    <>
      <p>
        Question {state.currentQuestionIndex + 1} of {state.questions.length}
      </p>
      <h2>{state.currentQuestion?.question}</h2>
      <div className="answers">
        {state.answers.map((answer) => (
          <button
            key={answer.answerNumber}
            disabled={answer.disabled}
            aria-pressed={answer.selected}
            onClick={() => actions.selectAnswer(answer.answerNumber)}
          >
            {answer.value}
          </button>
        ))}
      </div>
    </>
  );
}

function Timer() {
  const { state, actions } = useQuizContext();
  if (state.status !== 'active' && state.status !== 'paused') return null;
  return (
    <div>
      <p>Time remaining: {state.timeRemaining}s</p>
      {state.canPause && (
        <button onClick={actions.pauseTimer}>Pause timer</button>
      )}
      {state.canResume && (
        <button onClick={actions.resumeTimer}>Resume timer</button>
      )}
    </div>
  );
}

function Navigation() {
  const { state, actions } = useQuizContext();
  return (
    <div>
      {state.canGoPrevious && (
        <button onClick={actions.previousQuestion}>Previous question</button>
      )}
      {state.canGoNext && (
        <button onClick={actions.nextQuestion}>Next question</button>
      )}
      {state.canSubmit && (
        <button onClick={actions.submitQuiz}>Finish quiz</button>
      )}
    </div>
  );
}

function Results() {
  const { state, actions } = useQuizContext();
  if (state.status !== 'completed') return null;
  return (
    <>
      <output>
        Score: {state.summary.correctPoints} / {state.summary.totalPoints}
      </output>
      <label>
        Filter results{' '}
        <select
          value={state.resultFilter}
          onChange={(event) =>
            actions.setResultFilter(event.target.value as ResultFilter)
          }
        >
          <option value="all">All</option>
          <option value="correct">Correct</option>
          <option value="incorrect">Incorrect</option>
          <option value="unanswered">Unanswered</option>
        </select>
      </label>
      <ul>
        {state.filteredResults.map((result) => (
          <li key={result.index}>
            {result.question.question}:{' '}
            {result.answered ? result.outcome : 'unanswered'}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ProviderExample() {
  return (
    <QuizProvider
      quiz={quiz}
      allowNavigation
      revealAnswerOnSubmit
      timer={120}
      allowPauseTimer
    >
      <section className="headless-demo" aria-label="Shared quiz">
        <Timer />
        <Question />
        <Results />
        <Navigation />
      </section>
    </QuizProvider>
  );
}
