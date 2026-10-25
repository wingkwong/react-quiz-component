import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import Quiz from '../src/lib';
import { quiz } from './fixtures';

afterEach(() => vi.restoreAllMocks());

it('keeps early quit opt-in and unavailable before the quiz starts', () => {
  const { rerender } = render(<Quiz quiz={quiz} disableSynopsis />);
  expect(screen.queryByRole('button', { name: 'Submit and quit' })).toBeNull();
  rerender(<Quiz key="idle" quiz={quiz} allowQuit />);
  expect(screen.queryByRole('button', { name: 'Submit and quit' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));
  expect(screen.getByRole('button', { name: 'Submit and quit' })).toBeTruthy();
});

it('supports localized confirmation, cancellation and partial default results', () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  const onComplete = vi.fn();
  render(<Quiz quiz={{ ...quiz, appLocale: { quitQuizBtn: 'Finish early', quitQuizConfirm: 'Finish now?' } }}
    disableSynopsis allowQuit onComplete={onComplete} />);
  fireEvent.click(screen.getByRole('button', { name: 'B' }));
  fireEvent.click(screen.getByRole('button', { name: 'Finish early' }));
  expect(confirm).toHaveBeenCalledWith('Finish now?');
  expect(onComplete).not.toHaveBeenCalled();
  confirm.mockReturnValue(true);
  fireEvent.click(screen.getByRole('button', { name: 'Finish early' }));
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete.mock.calls[0][0].userInput).toEqual([2, undefined]);
  expect(screen.getByText('You scored 5 out of 15.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Finish early' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'All' }));
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'Unanswered' }));
  expect(screen.getByText(/Q2: Pick X and Z/)).toBeTruthy();
});

it('supports quitting while paused and rendering custom results', () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  render(<Quiz quiz={quiz} disableSynopsis allowQuit timer={60} allowPauseTimer showDefaultResult={false}
    customResultPage={(summary) => <p>Saved {summary.userInput.filter(Boolean).length} answers</p>} />);
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  fireEvent.click(screen.getByRole('button', { name: 'Submit and quit' }));
  expect(screen.getByText('Saved 0 answers')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Resume' })).toBeNull();
});
