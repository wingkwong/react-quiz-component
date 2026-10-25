import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import Quiz from '../src/lib';
import { createSession, getQuizState, quizReducer } from '../src/lib/engine/engine';
import { quiz } from './fixtures';

afterEach(() => { vi.useRealTimers(); });

it.each([false, true])('retains answer-based progress on timeout (deferred: %s)', (revealAnswerOnSubmit) => {
  let session = createSession({ quiz, autoStart: true, timer: 1, allowNavigation: true, revealAnswerOnSubmit });
  const command = (action: Parameters<typeof quizReducer>[1]) => {
    const transition = quizReducer(session, action);
    expect(transition.result.ok).toBe(true);
    session = transition.state;
  };
  command({ type: 'next' });
  expect(getQuizState(session).progress).toBe(0);
  command({ type: 'previous' });
  command({ type: 'select', answer: 1 }); // Incorrect still counts as answered.
  expect(getQuizState(session).progress).toBe(50);
  command({ type: 'next' });
  command({ type: 'select', answer: 1 }); // A partial multiple selection does not.
  expect(getQuizState(session).progress).toBe(50);
  command({ type: 'tick' });
  expect(getQuizState(session).status).toBe('completed');
  expect(getQuizState(session).progress).toBe(50);
});

it('updates progress when deferred answers are completed, deselected, or over-selected', () => {
  let session = createSession({ quiz, autoStart: true, allowNavigation: true, revealAnswerOnSubmit: true });
  for (const answer of [1, 3, 2, 2, 3]) {
    session = quizReducer(session, { type: 'go', index: 1 }).state;
    session = quizReducer(session, { type: 'select', answer }).state;
    const count = (getQuizState(session).userInput[1] as number[]).length;
    expect(getQuizState(session).progress).toBe(count === 2 ? 50 : 0);
  }
});

it.each([false, true])('renders actual progress after timeout (answered: %s)', (answered) => {
  vi.useFakeTimers();
  render(<Quiz quiz={quiz} disableSynopsis enableProgressBar timer={1} />);
  if (answered) fireEvent.click(screen.getByRole('button', { name: 'B' }));
  act(() => vi.advanceTimersByTime(1000));
  const percentage = answered ? '50' : '0';
  expect(screen.getByRole('progressbar').getAttribute('value')).toBe(percentage);
  expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe(`${percentage}%`);
  expect(screen.getByText(`${percentage}%`)).toBeTruthy();
});
