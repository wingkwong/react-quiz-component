import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import Quiz from '../src/lib';
import { createSession, getQuizState, quizReducer } from '../src/lib/engine/engine';
import { quiz, singleQuiz } from './fixtures';

it.each([false, true])('only reveals unselected correct answers when opted in (%s)', (showCorrectAnswer) => {
  let session = createSession({ quiz: singleQuiz, autoStart: true, showCorrectAnswer });
  expect(getQuizState(session).answers.every((answer) => answer.feedback === null)).toBe(true);
  session = quizReducer(session, { type: 'select', answer: 1 }).state;
  expect(getQuizState(session).answers.map((answer) => answer.feedback))
    .toEqual(['incorrect', showCorrectAnswer ? 'correct' : null, null]);
  expect(getQuizState(session).summary.correctPoints).toBe(0);
  expect(getQuizState(session).answers[1].selected).toBe(false);
});

it('reveals multiple correct choices only after the required selection count', () => {
  let session = createSession({ quiz: { ...quiz, questions: [quiz.questions[1]] }, autoStart: true, showCorrectAnswer: true });
  session = quizReducer(session, { type: 'select', answer: 2 }).state;
  expect(getQuizState(session).answers.map((answer) => answer.feedback)).toEqual([null, 'incorrect', null]);
  session = quizReducer(session, { type: 'select', answer: 1 }).state;
  expect(getQuizState(session).answers.map((answer) => answer.feedback)).toEqual(['correct', 'incorrect', 'correct']);
  expect(getQuizState(session).answers.every((answer) => answer.disabled)).toBe(true);
  expect(getQuizState(session).summary.correctPoints).toBe(0);
});

it('keeps deferred feedback hidden until completion even when revelation is enabled', () => {
  let session = createSession({ quiz: singleQuiz, autoStart: true, showCorrectAnswer: true, revealAnswerOnSubmit: true });
  session = quizReducer(session, { type: 'select', answer: 1 }).state;
  expect(getQuizState(session).answers.every((answer) => answer.feedback === null)).toBe(true);
  session = quizReducer(session, { type: 'submit' }).state;
  expect(getQuizState(session).answers.map((answer) => answer.feedback)).toEqual(['incorrect', 'correct', null]);
});

it('preserves retry availability and first-attempt scoring after revealing the answer', () => {
  let session = createSession({ quiz: singleQuiz, autoStart: true, showCorrectAnswer: true, continueTillCorrect: true });
  session = quizReducer(session, { type: 'select', answer: 1 }).state;
  expect(getQuizState(session).answers[1]).toMatchObject({ feedback: 'correct', disabled: false, selected: false });
  expect(getQuizState(session).canSubmit).toBe(false);
  session = quizReducer(session, { type: 'select', answer: 2 }).state;
  expect(getQuizState(session).canSubmit).toBe(true);
  expect(getQuizState(session).summary).toMatchObject({ correctPoints: 0, userInput: [1] });
});

it('keeps revelation scoped to evaluated questions on navigation', () => {
  let session = createSession({ quiz, autoStart: true, allowNavigation: true, showCorrectAnswer: true });
  session = quizReducer(session, { type: 'select', answer: 1 }).state;
  session = quizReducer(session, { type: 'next' }).state;
  expect(getQuizState(session).answers.every((answer) => answer.feedback === null)).toBe(true);
  session = quizReducer(session, { type: 'previous' }).state;
  expect(getQuizState(session).answers[1].feedback).toBe('correct');
});

it('reveals the correct shuffled choice in the default UI without marking it selected', () => {
  render(<Quiz quiz={singleQuiz} disableSynopsis showCorrectAnswer shuffleAnswer />);
  expect(screen.getByRole('button', { name: 'B' }).className).not.toContain('correct');
  fireEvent.click(screen.getByRole('button', { name: 'A' }));
  const correct = screen.getByRole('button', { name: 'B' });
  expect(correct.classList.contains('correct')).toBe(true);
  expect(correct.getAttribute('aria-pressed')).toBe('false');
  expect(screen.getByRole('button', { name: 'A' }).classList.contains('incorrect')).toBe(true);
});
