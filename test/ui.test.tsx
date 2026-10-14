import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Quiz from '../src/lib';
import { quiz, singleQuiz } from './fixtures';
import demoQuiz from '../src/docs/quiz';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe('default UI compatibility', () => {
  it('renders and answers the actual development demo quiz', () => {
    const onQuestionSubmit = vi.fn();
    render(<Quiz quiz={demoQuiz} disableSynopsis shuffleAnswer showInstantFeedback
      timer={60} allowPauseTimer enableProgressBar onQuestionSubmit={onQuestionSubmit} />);
    expect(screen.getByText(/How can you access the state/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'this.state' }));
    expect(screen.getByText('Correct answer. Good job.')).toBeTruthy();
    expect(onQuestionSubmit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/ReactJS is developed by/)).toBeTruthy();
  });

  it('renders the introduction, feedback, progress, scores and custom locale', () => {
    const onComplete = vi.fn();
    const onQuestionSubmit = vi.fn();
    const source = { ...singleQuiz, appLocale: { startQuizBtn: 'Begin', nextQuestionBtn: 'Finish' } };
    const { container } = render(<StrictMode><Quiz quiz={source} showInstantFeedback enableProgressBar onComplete={onComplete} onQuestionSubmit={onQuestionSubmit} /></StrictMode>);
    expect(screen.getByText('Introduction')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Begin' }));
    expect(screen.getByText('0%')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(screen.getByText('You are correct. Please click Next to continue.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.getByText('You scored 5 out of 5.')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onQuestionSubmit).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.react-quiz-container .question-wrapper .card-body')).toBeTruthy();
  });

  it('keeps incomplete alerts and cancellable submission confirmation in the default UI', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onComplete = vi.fn();
    render(<Quiz quiz={singleQuiz} disableSynopsis allowNavigation revealAnswerOnSubmit onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(alert).toHaveBeenCalledWith('Quiz is incomplete');
    expect(confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('retains selected answers on navigation and supports custom results without feedback UI', () => {
    const onQuestionSubmit = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Quiz quiz={quiz} disableSynopsis allowNavigation revealAnswerOnSubmit
      showDefaultResult={false} onQuestionSubmit={onQuestionSubmit}
      customResultPage={(summary) => <p>Custom score: {summary.correctPoints}</p>} />);
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Prev' }));
    expect(screen.getByRole('button', { name: 'B' }).className).toContain('selected');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onQuestionSubmit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    fireEvent.click(screen.getByRole('button', { name: 'Z' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Custom score: 15')).toBeTruthy();
    expect(onQuestionSubmit).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('You scored 15 out of 15.')).toBeNull();
  });

  it('pauses and resumes the timer and filters unanswered results after timeout', () => {
    vi.useFakeTimers();
    render(<Quiz quiz={quiz} disableSynopsis timer={2} allowPauseTimer />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Test is paused. Clicked the Resume button to continue')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'B' })).toBeNull();
    act(() => vi.advanceTimersByTime(3000));
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Unanswered' }));
    expect(screen.queryByText(/Q1: Pick B/)).toBeNull();
    expect(screen.getByText(/Q2: Pick X and Z/)).toBeTruthy();
  });

  it('renders photo answers and returns nothing for invalid quizzes', () => {
    const { rerender, container } = render(<Quiz quiz={{ ...singleQuiz, questions: [{ ...singleQuiz.questions[0], questionType: 'photo' }] }} disableSynopsis />);
    expect(screen.getAllByAltText('answer')).toHaveLength(3);
    rerender(<Quiz key="invalid" quiz={{ quizTitle: 'Empty', questions: [] }} />);
    expect(container.innerHTML).toBe('');
  });
});
