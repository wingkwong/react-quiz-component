import React, { StrictMode } from 'react';
import { act, fireEvent, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import Quiz from '../src/lib';
import { quiz } from './fixtures';

describe.each([false, true])('shuffled hydration with disableSynopsis=%s', (disableSynopsis) => {
  it.each([
    { shuffle: true },
    { shuffleAnswer: true },
    { shuffle: true, shuffleAnswer: true },
  ])('hydrates and completes with %j despite different server/client random values', async (shuffling) => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const onRecoverableError = vi.fn();
    const onComplete = vi.fn();
    const onQuestionSubmit = vi.fn();
    const element = <StrictMode><Quiz quiz={quiz} {...shuffling} disableSynopsis={disableSynopsis}
      onComplete={onComplete} onQuestionSubmit={onQuestionSubmit} /></StrictMode>;
    const container = document.createElement('div');
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      container.innerHTML = renderToString(element);
      expect(container.innerHTML === '').toBe(disableSynopsis);
      document.body.append(container);
      random.mockReturnValue(0);
      await act(async () => { root = hydrateRoot(container, element, { onRecoverableError }); });
      const view = within(container);
      if (!disableSynopsis) fireEvent.click(view.getByRole('button', { name: 'Start Quiz' }));
      expect(view.getByText(shuffling.shuffle ? 'Pick X and Z' : 'Pick B')).toBeTruthy();
      if (shuffling.shuffleAnswer) {
        expect(container.querySelector('.answer-content')?.textContent).toBe(shuffling.shuffle ? 'Y' : 'B');
      }
      for (const multiple of shuffling.shuffle ? [true, false] : [false, true]) {
        for (const answer of multiple ? ['X', 'Z'] : ['B']) {
          fireEvent.click(view.getByRole('button', { name: answer }));
        }
        fireEvent.click(view.getByRole('button', { name: 'Next' }));
      }
      expect(view.getByText('You scored 15 out of 15.')).toBeTruthy();
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(onQuestionSubmit).toHaveBeenCalledTimes(2);
      expect(onComplete).toHaveBeenCalledTimes(1);
    } finally {
      act(() => root?.unmount());
      container.remove();
      random.mockRestore();
    }
  });
});
