import React, { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useQuiz } from '../src/lib';
import { quiz } from './fixtures';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

it.each([false, true])('quits with partial results and ordered callbacks (deferred: %s)', (revealAnswerOnSubmit) => {
  const events: string[] = [];
  const onQuestionSubmit = vi.fn(() => events.push('answer'));
  const onComplete = vi.fn(() => events.push('complete'));
  const { result } = renderHook(() => useQuiz({ quiz, autoStart: true,
    revealAnswerOnSubmit, onQuestionSubmit, onComplete }), { wrapper: StrictMode });
  act(() => {
    result.current.actions.selectAnswer(2);
    result.current.actions.nextQuestion();
    result.current.actions.selectAnswer(1);
    expect(result.current.actions.submitQuiz()).toEqual({ ok: false, reason: 'incomplete-quiz' });
    expect(result.current.actions.quitQuiz()).toEqual({ ok: true });
    expect(result.current.actions.quitQuiz()).toEqual({ ok: false, reason: 'invalid-state' });
  });
  expect(result.current.state.canQuit).toBe(false);
  expect(result.current.state.summary).toMatchObject({
    userInput: [2, [1]], correctPoints: 5, numberOfCorrectAnswers: 1, numberOfIncorrectAnswers: 1,
  });
  expect(events).toEqual(['answer', 'answer', 'complete']);
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(result.current.state.answers.every((answer) => answer.disabled)).toBe(true);
});

it('quits an untouched quiz and permits another session after reset', () => {
  const onComplete = vi.fn();
  const onQuestionSubmit = vi.fn();
  const { result } = renderHook(() => useQuiz({ quiz, onComplete, onQuestionSubmit }));
  expect(result.current.state.canQuit).toBe(false);
  act(() => { expect(result.current.actions.quitQuiz()).toEqual({ ok: false, reason: 'invalid-state' }); });
  act(() => { result.current.actions.start(); result.current.actions.quitQuiz(); });
  expect(result.current.state.unanswered).toEqual([0, 1]);
  expect(result.current.state.summary.numberOfIncorrectAnswers).toBe(0);
  expect(onQuestionSubmit).not.toHaveBeenCalled();
  act(() => { result.current.actions.reset(); result.current.actions.start(); result.current.actions.quitQuiz(); });
  expect(onComplete).toHaveBeenCalledTimes(2);
});

it.each([false, true])('stops timing on early quit (paused: %s)', (paused) => {
  vi.useFakeTimers();
  const onComplete = vi.fn();
  const { result } = renderHook(() => useQuiz({ quiz, autoStart: true, timer: 10, allowPauseTimer: true, onComplete }));
  act(() => vi.advanceTimersByTime(750));
  if (paused) {
    act(() => result.current.actions.pauseTimer());
    act(() => vi.advanceTimersByTime(5000));
  }
  expect(result.current.state.canQuit).toBe(true);
  act(() => { expect(result.current.actions.quitQuiz()).toEqual({ ok: true }); });
  expect(result.current.state.timeTaken).toBeCloseTo(0.75);
  act(() => vi.advanceTimersByTime(20000));
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(result.current.state.timeTaken).toBeCloseTo(0.75);
  expect(vi.getTimerCount()).toBe(0);
});

it('does not quit a new session when an expired timer callback resets it', () => {
  vi.useFakeTimers();
  let now = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  let reset = () => {};
  const onComplete = vi.fn(() => reset());
  const { result } = renderHook(() => useQuiz({ quiz, autoStart: true, timer: 1, onComplete }));
  reset = () => { result.current.actions.reset(); };
  now = 1500;
  act(() => { expect(result.current.actions.quitQuiz()).toEqual({ ok: false, reason: 'invalid-state' }); });
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(result.current.state.status).toBe('active');
  expect(result.current.state.timeRemaining).toBe(1);
});
