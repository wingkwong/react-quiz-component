import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import Quiz, { useQuiz } from '../src/lib';
import { createSession, getQuizState, quizReducer } from '../src/lib/engine/engine';
import { quiz } from './fixtures';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

it.each([0, -1, NaN, Infinity])('rejects invalid question duration %s', (questionTimer) => {
  expect(createSession({ quiz, questionTimer }).status).toBe('invalid');
});

it('skips expired questions, locks them on revisit, and permits submission after remaining answers', () => {
  let session = createSession({ quiz, autoStart: true, questionTimer: 1, allowNavigation: true });
  session = quizReducer(session, { type: 'tick' }).state;
  expect(getQuizState(session)).toMatchObject({ currentQuestionIndex: 1, questionTimeRemaining: 1, timeTaken: 1, canSubmit: false });
  expect(getQuizState(session).questionStates[0]).toMatchObject({ timedOut: true, answered: false, timeRemaining: 0 });
  session = quizReducer(session, { type: 'previous' }).state;
  expect(getQuizState(session).canGoNext).toBe(true);
  expect(quizReducer(session, { type: 'select', answer: 2 }).result).toEqual({ ok: false, reason: 'disabled-answer' });
  session = quizReducer(session, { type: 'next' }).state;
  session = quizReducer(session, { type: 'select', answer: 1 }).state;
  session = quizReducer(session, { type: 'select', answer: 3 }).state;
  expect(getQuizState(session).canSubmit).toBe(true);
  session = quizReducer(session, { type: 'submit' }).state;
  expect(getQuizState(session).summary).toMatchObject({ correctPoints: 10, userInput: [undefined, [1, 3]] });
});

it.each([false, true])('commits partial expired answers once (deferred: %s)', (revealAnswerOnSubmit) => {
  const source = { ...quiz, questions: [...quiz.questions].reverse() };
  let session = createSession({ quiz: source, autoStart: true, questionTimer: 1, revealAnswerOnSubmit });
  session = quizReducer(session, { type: 'select', answer: 1 }).state;
  const expired = quizReducer(session, { type: 'tick' });
  expect(expired.submissions).toHaveLength(1);
  expect(expired.submissions[0]).toMatchObject({ userAnswer: [1], isCorrect: false });
  expect(getQuizState(expired.state).incorrect).toEqual([0]);
  const finished = quizReducer(expired.state, { type: 'tick' });
  expect(finished.completed).toBe(true);
  expect(finished.submissions).toHaveLength(0);
  expect(getQuizState(finished.state).summary.numberOfIncorrectAnswers).toBe(1);
});

it('accounts for delayed callbacks across question deadlines and stops at the final deadline', () => {
  const source = { ...quiz, questions: [quiz.questions[0], quiz.questions[0], quiz.questions[0]] };
  let session = createSession({ quiz: source, autoStart: true, questionTimer: 1, timer: 10 });
  session = quizReducer(session, { type: 'tick', elapsed: 2.5 }).state;
  expect(getQuizState(session)).toMatchObject({ currentQuestionIndex: 2, questionTimeRemaining: 1, timeTaken: 2.5, status: 'active' });
  expect(session.records[2].remaining).toBe(0.5);
  session = quizReducer(session, { type: 'tick', elapsed: 100 }).state;
  expect(getQuizState(session)).toMatchObject({ timeTaken: 3, status: 'completed', timeRemaining: 7 });
  expect(getQuizState(session).unanswered).toEqual([0, 1, 2]);
});

it('lets the overall deadline finish the quiz before a question deadline', () => {
  const session = createSession({ quiz, autoStart: true, timer: 1, questionTimer: 5 });
  const transition = quizReducer(session, { type: 'tick', elapsed: 2 });
  expect(transition.completed).toBe(true);
  expect(getQuizState(transition.state)).toMatchObject({ timeTaken: 1, timeRemaining: 0, questionTimeRemaining: 4, currentQuestionIndex: 0 });
});

it('handles simultaneous deadlines without duplicate answer submissions', () => {
  let session = createSession({ quiz, autoStart: true, timer: 1, questionTimer: 1, revealAnswerOnSubmit: true });
  session = quizReducer(session, { type: 'select', answer: 2 }).state;
  const transition = quizReducer(session, { type: 'tick' });
  expect(transition.completed).toBe(true);
  expect(transition.submissions).toHaveLength(1);
  expect(getQuizState(transition.state).questionStates[0].timedOut).toBe(true);
  expect(getQuizState(transition.state).summary.correctPoints).toBe(5);
});

it('preserves fractional question budgets across navigation and pause', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useQuiz({ quiz, autoStart: true, questionTimer: 2, allowNavigation: true, allowPauseTimer: true }));
  act(() => vi.advanceTimersByTime(750));
  act(() => result.current.actions.nextQuestion());
  act(() => vi.advanceTimersByTime(500));
  act(() => result.current.actions.previousQuestion());
  act(() => result.current.actions.pauseTimer());
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.state.timeTaken).toBeCloseTo(1.25);
  act(() => result.current.actions.resumeTimer());
  act(() => vi.advanceTimersByTime(1250));
  expect(result.current.state.currentQuestionIndex).toBe(1);
  expect(result.current.state.questionStates[0].timedOut).toBe(true);
  act(() => vi.advanceTimersByTime(1499));
  expect(result.current.state.status).toBe('active');
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.state.status).toBe('completed');
  expect(result.current.state.timeTaken).toBeCloseTo(4);
});

it.each(['selectAnswer', 'nextQuestion', 'submitQuiz'] as const)('does not apply stale %s to the next question after expiry', (action) => {
  vi.useFakeTimers();
  let now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  const { result } = renderHook(() => useQuiz({ quiz, autoStart: true, questionTimer: 1 }));
  now = 1100;
  act(() => {
    const response = action === 'selectAnswer' ? result.current.actions.selectAnswer(1) : result.current.actions[action]();
    expect(response).toEqual({ ok: false, reason: 'invalid-state' });
  });
  expect(result.current.state.currentQuestionIndex).toBe(1);
  expect(result.current.state.userInput).toEqual([undefined, undefined]);
});

it('keeps expired questions reviewable without restarting their clocks', () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useQuiz({ quiz, autoStart: true, questionTimer: 1, allowNavigation: true }));
  act(() => vi.advanceTimersByTime(1000));
  act(() => result.current.actions.previousQuestion());
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.state.currentQuestionIndex).toBe(0);
  expect(result.current.state.answers.every((answer) => answer.disabled)).toBe(true);
  act(() => result.current.actions.nextQuestion());
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.state.status).toBe('completed');
});

it('resets all budgets and delivers completion once per session', () => {
  vi.useFakeTimers();
  const onComplete = vi.fn();
  const { result, unmount } = renderHook(() => useQuiz({ quiz, autoStart: true, questionTimer: 1, onComplete }));
  act(() => vi.advanceTimersByTime(10000));
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete.mock.calls[0][0].timeTaken).toBe(2);
  act(() => result.current.actions.reset());
  expect(result.current.state.questionTimeRemaining).toBe(1);
  expect(result.current.state.questionStates.every((question) => !question.timedOut)).toBe(true);
  act(() => vi.advanceTimersByTime(2000));
  expect(onComplete).toHaveBeenCalledTimes(2);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('shows a question countdown, auto-advances, and supports pause without an overall timer', () => {
  vi.useFakeTimers();
  render(<Quiz quiz={quiz} disableSynopsis questionTimer={1} allowPauseTimer />);
  expect(screen.getByText('Question — Time Remaining:', { exact: false })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  act(() => vi.advanceTimersByTime(3000));
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByText('Pick X and Z')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByText('You scored 0 out of 15.')).toBeTruthy();
  expect(screen.getByText('00:00:02')).toBeTruthy();
});

it('keeps a callback reset safe when a question expires during an action', () => {
  vi.useFakeTimers();
  let now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  let reset = () => {};
  const { result } = renderHook(() => useQuiz({ quiz: { ...quiz, questions: [...quiz.questions].reverse() }, autoStart: true,
    questionTimer: 1, onQuestionSubmit: () => reset() }));
  reset = () => { result.current.actions.reset(); };
  act(() => result.current.actions.selectAnswer(1));
  now = 1100;
  act(() => { expect(result.current.actions.selectAnswer(2)).toEqual({ ok: false, reason: 'invalid-state' }); });
  expect(result.current.state.currentQuestionIndex).toBe(0);
  expect(result.current.state.userInput).toEqual([undefined, undefined]);
});

it('stops scheduling when an expiry callback resets to invalid quiz data', () => {
  vi.useFakeTimers();
  let reset = () => {};
  const source = { ...quiz, questions: [...quiz.questions].reverse() };
  const { result, rerender } = renderHook((data) => useQuiz({ quiz: data, autoStart: true,
    questionTimer: 1, onQuestionSubmit: () => reset() }), { initialProps: source });
  reset = () => { result.current.actions.reset(); };
  act(() => result.current.actions.selectAnswer(1));
  rerender({ ...quiz, questions: [] });
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.state.status).toBe('invalid');
  expect(vi.getTimerCount()).toBe(0);
});

it.each(['quitQuiz', 'pauseTimer'] as const)('allows session-wide %s after a question deadline', (action) => {
  vi.useFakeTimers();
  let now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  const onComplete = vi.fn();
  const { result } = renderHook(() => useQuiz({ quiz, autoStart: true, questionTimer: 1, allowPauseTimer: true, onComplete }));
  now = 1100;
  act(() => { expect(result.current.actions[action]()).toEqual({ ok: true }); });
  expect(result.current.state.status).toBe(action === 'quitQuiz' ? 'completed' : 'paused');
  expect(result.current.state.timeTaken).toBeCloseTo(1.1);
  expect(result.current.state.userInput).toEqual([undefined, undefined]);
  expect(onComplete).toHaveBeenCalledTimes(action === 'quitQuiz' ? 1 : 0);
});
