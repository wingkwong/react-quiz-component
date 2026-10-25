'use client';

import { useState } from 'react';
import { useQuiz } from 'react-quiz-component';
import { quiz } from './quiz';
import './examples.css';

export default function AllQuestionsExample() {
  const { state, actions } = useQuiz({ quiz, allowNavigation: true, revealAnswerOnSubmit: true });
  const [pageSize, setPageSize] = useState(quiz.questions.length);
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(state.questions.length / pageSize);

  return (
    <section className="headless-demo" aria-label="Reviewable quiz">
      {state.status === 'invalid' && <p role="alert">{state.errors.join(' ')}</p>}
      {state.status === 'idle' && <>
        <h2>{quiz.quizTitle}</h2>
        <p>Answer the questions, review your choices, then submit.</p>
        <button onClick={actions.start}>Start quiz</button>
      </>}
      {state.status === 'active' && <>
        <label>Questions per page{' '}
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }}>
            <option value={state.questions.length}>All questions</option>
            {state.questions.slice(1).map((_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
          </select>
        </label>
        {state.questionStates.slice(page * pageSize, (page + 1) * pageSize).map(({ question, index, answers }) => (
          <fieldset key={index} className="question-group">
            <legend>{index + 1}. {question.question}</legend>
            <p>Select {Array.isArray(question.correctAnswer) ? question.correctAnswer.length : 1} answer(s).</p>
            <div className="answers">
              {answers.map((answer) => <button key={answer.answerNumber}
                disabled={answer.disabled} aria-pressed={answer.selected}
                onClick={() => {
                  // Actions share the latest session even within one React event.
                  if (actions.goToQuestion(index).ok) actions.selectAnswer(answer.answerNumber);
                }}>
                {answer.value}
              </button>)}
            </div>
          </fieldset>
        ))}
        {pageCount > 1 && <nav aria-label="Question pages">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous page</button>
          <span>Page {page + 1} of {pageCount}</span>
          <button disabled={page + 1 === pageCount} onClick={() => setPage(page + 1)}>Next page</button>
        </nav>}
        <p role="status">{state.canSubmit ? 'Review your answers, then submit.' : 'Select the requested number of answers for every question.'}</p>
        <button disabled={!state.canSubmit} onClick={actions.submitQuiz}>Submit quiz</button>
      </>}
      {state.status === 'completed' && <>
        <output>Score: {state.summary.correctPoints} / {state.summary.totalPoints}</output>
        <ol>
          {state.questionStates.map(({ question, index, answers, outcome }) => <li key={index}>
            <strong>{question.question}</strong>
            <p>Your answers: {answers.filter((answer) => answer.selected).map((answer) => answer.value).join(', ')} — {outcome}</p>
          </li>)}
        </ol>
        <button onClick={() => { actions.reset(); setPage(0); }}>Try again</button>
      </>}
    </section>
  );
}
