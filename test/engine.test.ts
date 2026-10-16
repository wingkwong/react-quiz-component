import { describe, expect, it, vi } from 'vitest';
import { createSession, getQuizState, quizReducer } from '../src/lib/engine/engine';
import type { Command, EngineState } from '../src/lib/engine/engine';
import { quiz, singleQuiz } from './fixtures';
import type { Quiz } from '../src/lib/types';

const run = (state: EngineState, ...commands: Command[]) => commands.reduce((s, command) => {
  const next = quizReducer(s, command);
  expect(next.result).toEqual({ ok: true });
  return next.state;
}, state);

describe('quiz transitions', () => {
  it('validates before preparation and rejects invalid or empty data', () => {
    for (const invalid of [undefined, {}, { questions: [] }, { ...singleQuiz, questions: [null] },
      { ...singleQuiz, nrOfQuestions: -1 },
      { ...singleQuiz, questions: [{ ...singleQuiz.questions[0], correctAnswer: '9' }] }]) {
      const state = createSession({ quiz: invalid as Quiz });
      expect(state.status).toBe('invalid');
      expect(quizReducer(state, { type: 'start' }).result).toEqual({ ok: false, reason: 'invalid-quiz' });
    }
    expect(createSession({ quiz, timer: NaN }).status).toBe('invalid');
    expect(createSession({ quiz, timer: Infinity }).status).toBe('invalid');
  });

  it('guards lifecycle, indexes, unanswered navigation, and disabled answers', () => {
    let state = createSession({ quiz });
    expect(quizReducer(state, { type: 'select', answer: 2 }).result).toEqual({ ok: false, reason: 'invalid-state' });
    state = run(state, { type: 'start' });
    expect(quizReducer(state, { type: 'next' }).result).toEqual({ ok: false, reason: 'answer-required' });
    expect(quizReducer(state, { type: 'select', answer: 0 }).result).toEqual({ ok: false, reason: 'invalid-answer' });
    expect(quizReducer(state, { type: 'go', index: 99 }).result).toEqual({ ok: false, reason: 'invalid-index' });
    expect(quizReducer(state, { type: 'go', index: 1 }).result).toEqual({ ok: false, reason: 'navigation-disabled' });
    state = run(state, { type: 'select', answer: 2 });
    expect(getQuizState(state).answers.every((answer) => answer.disabled)).toBe(true);
    expect(quizReducer(state, { type: 'select', answer: 1 }).result).toEqual({ ok: false, reason: 'disabled-answer' });
    expect(quizReducer(state, { type: 'submit' }).result).toEqual({ ok: false, reason: 'incomplete-quiz' });
  });

  it('scores first attempts while exposing subsequent successful retry feedback', () => {
    const initial = createSession({ quiz: singleQuiz, autoStart: true, continueTillCorrect: true });
    let state = run(initial, { type: 'select', answer: 1 });
    expect(getQuizState(state).canSubmit).toBe(false);
    expect(getQuizState(state).answers[1].disabled).toBe(false);
    state = run(state, { type: 'select', answer: 2 }, { type: 'submit' });
    const view = getQuizState(state);
    expect(view.feedback).toBe('correct');
    expect(view.userInput).toEqual([1]);
    expect(view.summary.correctPoints).toBe(0);
    expect(view.questionStates[0].attempts.map((attempt) => attempt.isCorrect)).toEqual([false, true]);
    expect(initial.records[0].input).toBeUndefined();
  });

  it('evaluates multiple answers once the required selection count is reached', () => {
    let state = createSession({ quiz, autoStart: true });
    state = run(state, { type: 'select', answer: 2 }, { type: 'next' }, { type: 'select', answer: 3 });
    expect(state.records[1].attempts).toHaveLength(0);
    expect(getQuizState(state).canSubmit).toBe(false);
    state = run(state, { type: 'select', answer: 1 }, { type: 'submit' });
    expect(getQuizState(state).summary).toMatchObject({ numberOfCorrectAnswers: 2, totalPoints: 15, correctPoints: 15 });
    expect(getQuizState(state).progress).toBe(100);
    expect(quizReducer(state, { type: 'submit' }).result.ok).toBe(false);
  });

  it('supports deferred selection, deselection, navigation, and commits once per revision', () => {
    let state = createSession({ quiz, autoStart: true, revealAnswerOnSubmit: true, allowNavigation: true });
    state = run(state, { type: 'select', answer: 1 }, { type: 'select', answer: 2 });
    expect(getQuizState(state).answers.every((answer) => answer.feedback === null)).toBe(true);
    const leaving = quizReducer(state, { type: 'next' });
    expect(leaving.submissions).toHaveLength(1);
    state = run(leaving.state, { type: 'previous' }, { type: 'select', answer: 2 });
    expect(quizReducer(state, { type: 'next' }).submissions).toHaveLength(0);
    state = run(state, { type: 'next' }, { type: 'select', answer: 1 }, { type: 'select', answer: 1 });
    expect(getQuizState(state).unanswered).toEqual([1]);
    expect(getQuizState(state).incorrect).toEqual([]);
    state = run(state, { type: 'select', answer: 1 }, { type: 'select', answer: 3 });
    const finished = quizReducer(state, { type: 'submit' });
    expect(finished.submissions).toHaveLength(1);
    expect(getQuizState(finished.state).summary.correctPoints).toBe(15);
  });

  it('filters correct, incorrect, and unanswered results after timeout', () => {
    let state = createSession({ quiz, autoStart: true, timer: 1 });
    state = run(state, { type: 'select', answer: 1 }, { type: 'tick' });
    expect(getQuizState(state).status).toBe('completed');
    state = run(state, { type: 'filter', filter: 'unanswered' });
    expect(getQuizState(state).filteredResults.map((result) => result.index)).toEqual([1]);
    state = run(state, { type: 'filter', filter: 'incorrect' });
    expect(getQuizState(state).filteredResults.map((result) => result.index)).toEqual([0]);
    state = run(state, { type: 'filter', filter: 'correct' });
    expect(getQuizState(state).filteredResults).toEqual([]);
  });

  it('shuffles without mutating input and remaps correct single and multiple answers', () => {
    const original = JSON.stringify(quiz);
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const state = createSession({ quiz, shuffle: true, shuffleAnswer: true });
      for (const question of state.questions) {
        const correct = Array.isArray(question.correctAnswer) ? question.correctAnswer : [Number(question.correctAnswer)];
        const values = correct.map((number) => question.answers[number - 1]).sort();
        expect(values).toEqual(question.answerSelectionType === 'single' ? ['B'] : ['X', 'Z']);
      }
      expect(state.questions[0].question).toBe(quiz.questions[1].question);
      expect(JSON.stringify(quiz)).toBe(original);
      expect(createSession({ quiz: { ...quiz, nrOfQuestions: 1 } }).questions).toHaveLength(1);
    } finally { random.mockRestore(); }
  });
});

describe('completion invariants', () => {
  it.each([false, true])('blocks partial multiple-answer submission with deferred=%s', (revealAnswerOnSubmit) => {
    let state = createSession({ quiz, autoStart: true, allowNavigation: true, revealAnswerOnSubmit });
    state = run(state, { type: 'select', answer: 2 }, { type: 'next' }, { type: 'select', answer: 1 });
    expect(getQuizState(state).canSubmit).toBe(false);
    expect(quizReducer(state, { type: 'submit' }).result).toEqual({ ok: false, reason: 'incomplete-quiz' });
    state = run(state, { type: 'previous' }, { type: 'next' }, { type: 'select', answer: 3 }, { type: 'submit' });
    expect(getQuizState(state).summary.correctPoints).toBe(15);
  });

  it.each([false, true])('classifies partial selections on timeout with deferred=%s', (revealAnswerOnSubmit) => {
    let state = createSession({ quiz, timer: 1, autoStart: true, allowNavigation: true, revealAnswerOnSubmit });
    state = run(state, { type: 'next' }, { type: 'select', answer: 1 });
    const transition = quizReducer(state, { type: 'tick' });
    const view = getQuizState(transition.state);
    expect(view.status).toBe('completed');
    expect(view.correct).toEqual([]);
    expect(view.incorrect).toEqual([1]);
    expect(view.unanswered).toEqual([0]);
    expect(view.summary.correctPoints).toBe(0);
    expect(transition.submissions).toHaveLength(1);
    expect(transition.submissions[0]).toMatchObject({ userAnswer: [1], isCorrect: false });
    expect(getQuizState(run(transition.state, { type: 'filter', filter: 'incorrect' })).filteredResults).toHaveLength(1);
  });

  it('keeps image descriptions aligned with shuffled answers and isolated from input', () => {
    const source = { ...singleQuiz, questions: [{ ...singleQuiz.questions[0],
      questionType: 'photo' as const, answerAltTexts: ['Circle', 'Square', 'Triangle'] }] };
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const view = getQuizState(createSession({ quiz: source, shuffleAnswer: true }));
      expect(view.answers.map(({ value, altText }) => [value, altText]))
        .toEqual([['B', 'Square'], ['C', 'Triangle'], ['A', 'Circle']]);
      source.questions[0].answerAltTexts[0] = 'Changed';
      expect(view.answers[2].altText).toBe('Circle');
    } finally { random.mockRestore(); }
  });

  it.each([['only one'], ['Circle', '', 'Triangle']])('rejects incomplete image descriptions: %j', (...answerAltTexts) => {
    expect(createSession({ quiz: { ...singleQuiz, questions: [{ ...singleQuiz.questions[0], answerAltTexts }] } }).status).toBe('invalid');
  });
});
