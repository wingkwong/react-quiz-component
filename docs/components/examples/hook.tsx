'use client';

import './examples.css';
import { useQuiz } from 'react-quiz-component';
import { quiz } from './quiz';

export default function HookExample() {
  const { state, actions } = useQuiz({ quiz });
  return (
    <section className="headless-demo" aria-label="Headless quiz">
      {state.status === 'invalid' && (
        <p role="alert">{state.errors.join(' ')}</p>
      )}
      {state.status === 'idle' && (
        <>
          <h2>{quiz.quizTitle}</h2>
          <p>{quiz.quizSynopsis}</p>
          <button onClick={actions.start}>Start quiz</button>
        </>
      )}
      {state.status === 'active' && (
        <>
          <p>
            Question {state.currentQuestionIndex + 1} of{' '}
            {state.questions.length}
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
          <p aria-live="polite">
            {state.feedback === 'correct'
              ? 'Correct!'
              : state.feedback === 'incorrect'
                ? 'Incorrect.'
                : ''}
          </p>
          {state.canGoNext && (
            <button onClick={actions.nextQuestion}>Next question</button>
          )}
          {state.canSubmit && (
            <button onClick={actions.submitQuiz}>Finish quiz</button>
          )}
        </>
      )}
      {state.status === 'completed' && (
        <output>
          Score: {state.summary.correctPoints} / {state.summary.totalPoints}
        </output>
      )}
    </section>
  );
}
