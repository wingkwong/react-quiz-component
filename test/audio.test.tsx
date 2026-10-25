import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Quiz from '../src/lib';
import { createSession, getQuizState } from '../src/lib/engine/engine';
import { quiz, singleQuiz } from './fixtures';

const audioQuiz = { ...singleQuiz, questions: [{ ...singleQuiz.questions[0],
  questionAudio: '/questions/one.mp3', questionAudioLabel: 'Listen to the first question',
  questionAudioTranscript: 'The speaker says: choose B.',
}] };

beforeEach(() => vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {}));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('renders a labeled native MP3 player and transcript without autoplay', () => {
  render(<Quiz quiz={audioQuiz} disableSynopsis />);
  const audio = screen.getByLabelText('Listen to the first question') as HTMLAudioElement;
  expect(audio.tagName).toBe('AUDIO');
  expect(audio.getAttribute('src')).toBe('/questions/one.mp3');
  expect(audio.controls).toBe(true);
  expect(audio.preload).toBe('none');
  expect(audio.autoplay).toBe(false);
  expect(document.getElementById(audio.getAttribute('aria-describedby')!)?.textContent)
    .toBe('The speaker says: choose B.');
});

it('stops playback on pause, completion and unmount, and includes audio in results', () => {
  const { unmount } = render(<Quiz quiz={audioQuiz} disableSynopsis timer={60} allowPauseTimer />);
  const activeAudio = screen.getByLabelText('Listen to the first question') as HTMLAudioElement;
  const pause = vi.fn();
  activeAudio.pause = pause;
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  expect(pause).toHaveBeenCalledTimes(1);
  expect(screen.queryByLabelText('Listen to the first question')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  const resumedAudio = screen.getByLabelText('Listen to the first question');
  const stop = vi.fn();
  (resumedAudio as HTMLAudioElement).pause = stop;
  fireEvent.click(screen.getByRole('button', { name: 'B' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(stop).toHaveBeenCalledTimes(1);
  const resultAudio = screen.getByLabelText('Listen to the first question');
  expect(resultAudio).not.toBe(resumedAudio);
  const resultStop = vi.fn();
  (resultAudio as HTMLAudioElement).pause = resultStop;
  unmount();
  expect(resultStop).toHaveBeenCalledTimes(1);
});

it('uses a fresh player and stops the previous clip when navigating', () => {
  const source = { ...quiz, questions: [audioQuiz.questions[0], { ...quiz.questions[1], questionAudio: '/questions/two.mp3' }] };
  render(<Quiz quiz={source} disableSynopsis allowNavigation />);
  const first = screen.getByLabelText('Listen to the first question') as HTMLAudioElement;
  const pause = vi.fn();
  first.pause = pause;
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  expect(pause).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Question audio').getAttribute('src')).toBe('/questions/two.mp3');
  fireEvent.click(screen.getByRole('button', { name: 'Prev' }));
  expect(screen.getByLabelText('Listen to the first question')).not.toBe(first);
});

it('leaves existing quizzes unchanged and preserves audio metadata for headless consumers', () => {
  const { container } = render(<Quiz quiz={singleQuiz} disableSynopsis />);
  expect(container.querySelector('audio')).toBeNull();
  const state = getQuizState(createSession({ quiz: audioQuiz, shuffle: true, shuffleAnswer: true }));
  expect(state.currentQuestion).toMatchObject({ questionAudio: '/questions/one.mp3',
    questionAudioTranscript: 'The speaker says: choose B.', questionAudioLabel: 'Listen to the first question' });
});

it.each([{ questionAudio: '' }, { questionAudio: 42 }, { questionAudioLabel: {} }, { questionAudioTranscript: [] }])
  ('rejects invalid audio data: %j', (fields) => {
    const source = { ...audioQuiz, questions: [{ ...audioQuiz.questions[0], ...fields }] };
    expect(createSession({ quiz: source as unknown as typeof audioQuiz }).status).toBe('invalid');
  });
