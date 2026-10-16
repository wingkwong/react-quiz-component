import React, { StrictMode } from 'react';
import { act, render, renderHook, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuizProvider, useQuiz, useQuizContext } from '../src/lib';
import type { UseQuizOptions } from '../src/lib';
import { quiz, singleQuiz } from './fixtures';

afterEach(() => vi.useRealTimers());

describe('useQuiz', () => {
  it('uses latest callbacks, delivers once in StrictMode, and supports batched actions', () => {
    const oldCallback = vi.fn();
    const onQuestionSubmit = vi.fn();
    const onComplete = vi.fn();
    const { result, rerender } = renderHook((options: UseQuizOptions) => useQuiz(options), {
      initialProps: { quiz: singleQuiz, onQuestionSubmit: oldCallback, onComplete }, wrapper: StrictMode,
    });
    rerender({ quiz: singleQuiz, onQuestionSubmit, onComplete });
    act(() => {
      result.current.actions.start();
      result.current.actions.selectAnswer(2);
      result.current.actions.submitQuiz();
      result.current.actions.submitQuiz();
    });
    expect(onQuestionSubmit).toHaveBeenCalledTimes(1);
    expect(oldCallback).not.toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ correctPoints: 5, userInput: [2] });
    rerender({ quiz: singleQuiz, onQuestionSubmit, onComplete });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('reports each immediate retry with its actual answer independently of UI', () => {
    const onQuestionSubmit = vi.fn();
    const { result } = renderHook(() => useQuiz({ quiz: singleQuiz, autoStart: true, continueTillCorrect: true, onQuestionSubmit }));
    act(() => {
      result.current.actions.selectAnswer(1);
      result.current.actions.selectAnswer(3);
      result.current.actions.selectAnswer(2);
    });
    expect(onQuestionSubmit.mock.calls.map(([event]) => [event.userAnswer, event.isCorrect]))
      .toEqual([[1, false], [3, false], [2, true]]);
  });

  it('commits deferred answers only on leaving/submitting, including changed revisits', () => {
    const onQuestionSubmit = vi.fn();
    const { result } = renderHook(() => useQuiz({ quiz, autoStart: true, revealAnswerOnSubmit: true, allowNavigation: true, onQuestionSubmit }));
    act(() => result.current.actions.selectAnswer(1));
    expect(onQuestionSubmit).not.toHaveBeenCalled();
    act(() => {
      result.current.actions.nextQuestion();
      result.current.actions.previousQuestion();
      result.current.actions.nextQuestion();
      result.current.actions.previousQuestion();
    });
    expect(onQuestionSubmit).toHaveBeenCalledTimes(1);
    act(() => {
      result.current.actions.selectAnswer(2);
      result.current.actions.nextQuestion();
      result.current.actions.selectAnswer(1);
      result.current.actions.selectAnswer(3);
      result.current.actions.submitQuiz();
    });
    expect(onQuestionSubmit).toHaveBeenCalledTimes(3);
    expect(result.current.state.summary.correctPoints).toBe(15);
  });

  it('starts timing only when active, pauses, expires once and cleans up', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { result, unmount } = renderHook(() => useQuiz({ quiz, timer: 3, allowPauseTimer: true, onComplete }), { wrapper: StrictMode });
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.state.timeRemaining).toBe(3);
    act(() => result.current.actions.start());
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.actions.pauseTimer());
    act(() => {
      expect(result.current.actions.selectAnswer(2)).toEqual({ ok: false, reason: 'invalid-state' });
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.state.timeRemaining).toBe(2);
    act(() => result.current.actions.resumeTimer());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.state.status).toBe('completed');
    expect(result.current.state.unanswered).toEqual([0, 1]);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0].timeTaken).toBe(3);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('commits a partial deferred answer when the timer expires', () => {
    vi.useFakeTimers();
    const onQuestionSubmit = vi.fn();
    const { result } = renderHook(() => useQuiz({ quiz, timer: 1, autoStart: true, revealAnswerOnSubmit: true, onQuestionSubmit }));
    act(() => result.current.actions.selectAnswer(2));
    act(() => vi.advanceTimersByTime(1000));
    expect(onQuestionSubmit).toHaveBeenCalledTimes(1);
    expect(result.current.state.summary.correctPoints).toBe(5);
  });

  it('snapshots options until reset and resets an active timer and completion guard', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { result, rerender } = renderHook((options: UseQuizOptions) => useQuiz(options), {
      initialProps: { quiz: singleQuiz, timer: 2, autoStart: true, onComplete },
    });
    act(() => vi.advanceTimersByTime(1500));
    rerender({ quiz, timer: 4, autoStart: true, onComplete });
    expect(result.current.state.questions).toHaveLength(1);
    expect(result.current.state.timer).toBe(2);
    act(() => result.current.actions.reset());
    expect(result.current.state.questions).toHaveLength(2);
    expect(result.current.state.timeRemaining).toBe(4);
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.state.timeRemaining).toBe(4);
    act(() => vi.advanceTimersByTime(3500));
    expect(onComplete).toHaveBeenCalledTimes(1);
    act(() => result.current.actions.reset());
    act(() => vi.advanceTimersByTime(4000));
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it('protects engine data from callback payload mutations', () => {
    const { result } = renderHook(() => useQuiz({ quiz: singleQuiz, autoStart: true,
      onQuestionSubmit: (data) => { data.question.answers[0] = 'Changed'; },
      onComplete: (summary) => { summary.userInput[0] = 3; },
    }));
    act(() => { result.current.actions.selectAnswer(2); result.current.actions.submitQuiz(); });
    expect(result.current.state.questions[0].answers[0]).toBe('A');
    expect(result.current.state.userInput).toEqual([2]);
  });
});

describe('provider', () => {
  function Consumer({ name }: { name: string }) {
    const { state, actions } = useQuizContext();
    return <button onClick={actions.start}>{name}: {state.status}</button>;
  }
  it('shares one instance with descendants and isolates providers without wrapper DOM', () => {
    const { container } = render(<>
      <QuizProvider quiz={quiz}><Consumer name="A" /><Consumer name="B" /></QuizProvider>
      <QuizProvider quiz={quiz}><Consumer name="C" /></QuizProvider>
    </>);
    expect(container.children).toHaveLength(3);
    fireEvent.click(screen.getByText('A: idle'));
    expect(screen.getByText('B: active')).toBeTruthy();
    expect(screen.getByText('C: idle')).toBeTruthy();
  });
  it('explains missing provider errors', () => {
    expect(() => renderHook(useQuizContext)).toThrow('useQuizContext must be used within a QuizProvider');
  });
});
