import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Quiz from '../src/lib';
import QuizResultFilter from '../src/lib/core-components/quiz-result-filter';
import appLocale from '../src/lib/locale';
import { singleQuiz } from './fixtures';

afterEach(() => vi.restoreAllMocks());

function Filter() {
  const [value, setValue] = useState('all');
  return <QuizResultFilter filteredValue={value} appLocale={appLocale}
    handleChange={(event) => setValue(event.target.value)} />;
}

describe('accessible quiz controls', () => {
  it('names photo choices and result images after shuffling', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const source = { ...singleQuiz, questions: [{ ...singleQuiz.questions[0],
      questionType: 'photo' as const, answers: ['/circle.png', '/square.png', '/triangle.png'],
      answerAltTexts: ['Blue circle', 'Red square', 'Green triangle'],
      questionPic: '/shapes.png', questionPicAlt: 'Three geometric shapes' }] };
    render(<Quiz quiz={source} disableSynopsis shuffleAnswer />);
    expect(screen.getByAltText('Three geometric shapes')).toBeTruthy();
    const correct = screen.getByRole('button', { name: 'Red square' });
    expect(within(correct).getByRole('img').getAttribute('src')).toBe('/square.png');
    fireEvent.click(correct);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Red square' }).className).toContain('correct');
    expect(screen.getByAltText('Blue circle').getAttribute('src')).toBe('/circle.png');
  });

  it('supports arrow keys, wrapping, Home, End, typeahead, Escape and selection focus', () => {
    render(<Filter />);
    const trigger = screen.getByRole('button', { name: 'All' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const options = screen.getAllByRole('menuitemradio');
    expect(document.activeElement).toBe(options[0]);
    expect(options[0].getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(options[0], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(options[3]);
    fireEvent.keyDown(options[3], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(options[0]);
    fireEvent.keyDown(options[0], { key: 'End' });
    expect(document.activeElement).toBe(options[3]);
    fireEvent.keyDown(options[3], { key: 'Home' });
    expect(document.activeElement).toBe(options[0]);
    fireEvent.keyDown(options[0], { key: 'i' });
    expect(document.activeElement).toBe(options[2]);
    fireEvent.keyDown(options[2], { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    const unanswered = screen.getByRole('menuitemradio', { name: 'Unanswered' });
    expect(document.activeElement).toBe(unanswered);
    fireEvent.click(unanswered);
    expect(trigger.textContent).toBe('Unanswered');
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'Unanswered' }));
    expect(document.activeElement?.getAttribute('aria-checked')).toBe('true');
  });

  it('uses distinct menu labels for multiple quizzes and closes on focus leaving', () => {
    render(<><Filter /><Filter /><button>Outside</button></>);
    const triggers = screen.getAllByRole('button', { name: 'All' });
    expect(triggers[0].id).not.toBe(triggers[1].id);
    fireEvent.click(triggers[1]);
    const menu = screen.getByRole('menu');
    expect(menu.getAttribute('aria-labelledby')).toBe(triggers[1].id);
    expect(triggers[1].getAttribute('aria-controls')).toBe(menu.id);
    fireEvent.blur(document.activeElement!, { relatedTarget: screen.getByRole('button', { name: 'Outside' }) });
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
