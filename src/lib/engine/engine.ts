import defaultLocale from '../locale';
import type { Question } from '../types';
import { prepareQuestions, validateOptions } from './prepare';
import type {
  ActionResult, AnswerFeedback, BlockedReason, QuestionAttempt, QuestionState,
  QuestionSubmitData, QuizState, QuizStatus, ResultFilter, UseQuizOptions, UserAnswer,
} from './types';

interface AnswerRecord {
  input: UserAnswer;
  selected: number[];
  attempts: QuestionAttempt[];
  outcome: AnswerFeedback;
  feedback: AnswerFeedback;
  revision: number;
  submittedRevision: number;
  finished: boolean;
  timedOut: boolean;
  remaining: number | undefined;
}
export interface EngineState {
  options: UseQuizOptions;
  questions: Question[];
  errors: string[];
  status: QuizStatus;
  index: number;
  records: AnswerRecord[];
  remaining: number | undefined;
  filter: ResultFilter;
  elapsed: number;
}
export type Command = { type: 'start' | 'next' | 'previous' | 'submit' | 'quit' | 'pause' | 'resume' }
  | { type: 'tick'; elapsed?: number }
  | { type: 'select'; answer: number }
  | { type: 'go'; index: number }
  | { type: 'filter'; filter: ResultFilter };
export interface Transition {
  state: EngineState;
  result: ActionResult;
  submissions: QuestionSubmitData[];
  completed: boolean;
}
export const isAnswered = (answer: UserAnswer): boolean => answer !== undefined
  && (!Array.isArray(answer) || answer.length > 0);
const matches = (question: Question, answer: UserAnswer): boolean => (
  Array.isArray(question.correctAnswer)
    ? Array.isArray(answer) && answer.length === question.correctAnswer.length
      && answer.every((value) => (question.correctAnswer as number[]).includes(value))
    : answer === Number(question.correctAnswer)
);
const copyAnswer = (answer: UserAnswer): UserAnswer => Array.isArray(answer) ? [...answer] : answer;

export function createSession(options: UseQuizOptions): EngineState {
  const errors = validateOptions(options);
  const questions = errors.length ? [] : prepareQuestions(options);
  const quiz = options.quiz ? {
    ...options.quiz,
    questions,
    appLocale: { ...options.quiz.appLocale },
  } : { quizTitle: '', questions };
  return {
    options: { ...options, quiz, onComplete: undefined, onQuestionSubmit: undefined },
    questions,
    errors,
    status: errors.length ? 'invalid' : options.autoStart ? 'active' : 'idle',
    index: 0,
    records: questions.map(() => ({
      input: undefined, selected: [], attempts: [], outcome: null, feedback: null,
      revision: 0, submittedRevision: 0, finished: false,
      timedOut: false, remaining: options.questionTimer,
    })),
    remaining: options.timer,
    filter: 'all',
    elapsed: 0,
  };
}

export function getQuizState(session: EngineState): QuizState {
  const { options, questions, records, status, index } = session;
  const active = status === 'active';
  const completed = status === 'completed';
  const questionStates: QuestionState[] = questions.map((question, questionIndex) => {
    const record = records[questionIndex];
    const deferred = options.revealAnswerOnSubmit;
    const revealCorrect = completed || (!deferred && options.showCorrectAnswer && record.feedback !== null);
    return {
      question, index: questionIndex, userAnswer: record.input,
      attempts: record.attempts, outcome: record.outcome, feedback: record.feedback,
      answered: isAnswered(record.input),
      timedOut: record.timedOut,
      timeRemaining: record.remaining === undefined ? undefined : Math.ceil(record.remaining),
      answers: question.answers.map((value, answerIndex) => {
        const answerNumber = answerIndex + 1;
        const selected = record.selected.includes(answerNumber);
        const correct = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.includes(answerNumber)
          : Number(question.correctAnswer) === answerNumber;
        return {
          answerNumber, value, selected,
          altText: question.answerAltTexts?.[answerIndex] ?? `Answer ${answerNumber}`,
          disabled: !active || record.timedOut || (!deferred && (record.finished || selected)),
          feedback: revealCorrect ? (correct ? 'correct' : selected ? 'incorrect' : null)
            : !deferred && selected ? (correct ? 'correct' : 'incorrect') : null,
        };
      }),
    };
  });
  const correct = records.flatMap((record, i) => record.outcome === 'correct' ? [i] : []);
  const incorrect = records.flatMap((record, i) => record.outcome === 'incorrect' ? [i] : []);
  const unanswered = records.flatMap((record, i) => isAnswered(record.input) ? [] : [i]);
  const isComplete = (record: AnswerRecord, questionIndex: number) => record.timedOut || (record.finished
    && (!Array.isArray(record.input)
      || record.input.length === (questions[questionIndex].correctAnswer as number[]).length));
  const ready = !!records[index] && isComplete(records[index], index);
  const answeredCount = records.filter((record, questionIndex) => isAnswered(record.input)
    && (!Array.isArray(record.input)
      || record.input.length === (questions[questionIndex].correctAnswer as number[]).length)).length;
  const points = questions.map((question) => typeof question.point === 'string'
    ? parseInt(question.point || '0', 10) : question.point || 0);
  const timeTaken = session.elapsed;
  const userInput = records.map((record) => record.input);
  const summary = {
    numberOfQuestions: questions.length, numberOfCorrectAnswers: correct.length,
    numberOfIncorrectAnswers: incorrect.length, questions, userInput,
    totalPoints: points.reduce((total, point) => total + point, 0),
    correctPoints: correct.reduce((total, i) => total + points[i], 0), timeTaken,
  };
  return {
    status, errors: session.errors, quiz: options.quiz, questions,
    currentQuestionIndex: index, currentQuestion: questions[index],
    currentQuestionState: questionStates[index], questionStates, userInput,
    answers: questionStates[index]?.answers ?? [], feedback: records[index]?.feedback ?? null,
    correct, incorrect, unanswered,
    canStart: status === 'idle',
    canGoNext: active && index < questions.length - 1 && (!!options.allowNavigation || ready),
    canGoPrevious: active && !!options.allowNavigation && index > 0,
    canSubmit: active && records.every(isComplete),
    canQuit: active || status === 'paused',
    canPause: active && !!(options.timer || options.questionTimer) && !!options.allowPauseTimer,
    canResume: status === 'paused', allowNavigation: !!options.allowNavigation,
    progress: questions.length ? answeredCount / questions.length * 100 : 0,
    timer: options.timer, timeRemaining: session.remaining === undefined ? undefined : Math.ceil(session.remaining), timeTaken, summary,
    questionTimer: options.questionTimer, questionTimeRemaining: questionStates[index]?.timeRemaining,
    appLocale: { ...defaultLocale, ...options.quiz.appLocale }, resultFilter: session.filter,
    filteredResults: questionStates.filter((question) => session.filter === 'all'
      || (session.filter === 'unanswered' ? !question.answered : question.outcome === session.filter)),
  };
}

/** Pure, atomic transitions. Effects are delivered by useQuiz, never by the reducer. */
export function quizReducer(previous: EngineState, command: Command): Transition {
  const blocked = (reason: BlockedReason): Transition => ({
    state: previous, result: { ok: false, reason }, submissions: [], completed: false,
  });
  if (previous.status === 'invalid') return blocked('invalid-quiz');
  const state: EngineState = { ...previous, records: [...previous.records] };
  const submissions: QuestionSubmitData[] = [];
  let completed = false;
  const success = (): Transition => ({ state, result: { ok: true }, submissions, completed });
  const commit = (index: number) => {
    const record = state.records[index];
    if (!state.options.revealAnswerOnSubmit || !isAnswered(record.input)
      || record.revision === record.submittedRevision) return;
    const attempt = { userAnswer: copyAnswer(record.input), isCorrect: record.outcome === 'correct' };
    state.records[index] = {
      ...record, submittedRevision: record.revision, attempts: [...record.attempts, attempt],
    };
    submissions.push({ question: state.questions[index], ...attempt });
  };
  const finalizeAnswer = (index: number) => {
    // Timeout or early quit can leave a multiple-answer selection unevaluated.
    // Preserve it as an incorrect attempt; untouched questions stay unanswered.
    const record = state.records[index];
    if (isAnswered(record.input) && record.outcome === null) {
      const attempt = { userAnswer: copyAnswer(record.input), isCorrect: false };
      state.records[index] = { ...record, outcome: 'incorrect', feedback: 'incorrect',
        finished: true, attempts: [...record.attempts, attempt] };
      submissions.push({ question: state.questions[index], ...attempt });
    }
    commit(index);
  };
  const finish = () => {
    state.records.forEach((_, index) => finalizeAnswer(index));
    state.status = 'completed';
    completed = true;
  };
  if (command.type === 'filter') {
    if (!['all', 'correct', 'incorrect', 'unanswered'].includes(command.filter)) return blocked('invalid-filter');
    state.filter = command.filter;
    return success();
  }
  if (command.type === 'start') {
    if (state.status !== 'idle') return blocked('invalid-state');
    state.status = 'active';
    return success();
  }
  if (command.type === 'resume') {
    if (state.status !== 'paused') return blocked('invalid-state');
    state.status = 'active';
    return success();
  }
  if (command.type === 'quit') {
    if (!getQuizState(state).canQuit) return blocked('invalid-state');
    finish();
    return success();
  }
  if (state.status !== 'active') return blocked('invalid-state');
  if (command.type === 'pause' || command.type === 'tick') {
    if ((state.remaining === undefined && state.options.questionTimer === undefined)
      || (command.type === 'pause' && !state.options.allowPauseTimer)) {
      return blocked('timer-disabled');
    }
    if (command.type === 'pause') state.status = 'paused';
    else if (command.type === 'tick') {
      let elapsed = command.elapsed ?? 1;
      while (elapsed > 0 && state.status === 'active') {
        const record = state.records[state.index];
        const duration = Math.min(elapsed, state.remaining ?? Infinity,
          record.timedOut ? Infinity : record.remaining ?? Infinity);
        elapsed -= duration;
        state.elapsed += duration;
        if (state.remaining !== undefined) state.remaining = Math.max(0, state.remaining - duration);
        if (record.remaining !== undefined && !record.timedOut) {
          state.records[state.index] = { ...record, remaining: Math.max(0, record.remaining - duration) };
        }
        const questionExpired = !record.timedOut && state.records[state.index].remaining === 0;
        if (questionExpired) {
          finalizeAnswer(state.index);
          state.records[state.index] = { ...state.records[state.index], timedOut: true };
        }
        if (state.remaining === 0) {
          finish();
        } else if (questionExpired) {
          const next = state.records.findIndex((candidate, index) => index > state.index && !candidate.timedOut);
          if (next === -1) finish();
          else state.index = next;
        }
      }
    }
    return success();
  }
  if (command.type === 'submit') {
    if (!getQuizState(state).canSubmit) return blocked('incomplete-quiz');
    finish();
    return success();
  }
  if (command.type === 'next' || command.type === 'previous' || command.type === 'go') {
    const target = command.type === 'go' ? command.index : state.index + (command.type === 'next' ? 1 : -1);
    if (!Number.isInteger(target) || target < 0 || target >= state.questions.length) return blocked('invalid-index');
    if (command.type !== 'next' && !state.options.allowNavigation) return blocked('navigation-disabled');
    if (target === state.index) return success();
    if (command.type === 'next' && !getQuizState(state).canGoNext) return blocked('answer-required');
    commit(state.index);
    state.index = target;
    return success();
  }
  if (command.type !== 'select') return blocked('invalid-state');
  const { answer } = command;
  const question = state.questions[state.index];
  if (!Number.isInteger(answer) || answer < 1 || answer > question.answers.length) return blocked('invalid-answer');
  if (getQuizState(state).answers[answer - 1].disabled) return blocked('disabled-answer');
  const oldRecord = state.records[state.index];
  if (state.options.revealAnswerOnSubmit && oldRecord.input === answer) return success();
  const record = { ...oldRecord, revision: oldRecord.revision + 1 };
  const multiple = question.answerSelectionType === 'multiple';
  if (state.options.revealAnswerOnSubmit) {
    record.selected = multiple ? (record.selected.includes(answer)
      ? record.selected.filter((value) => value !== answer) : [...record.selected, answer]) : [answer];
    record.input = multiple ? [...record.selected] : answer;
    record.outcome = !isAnswered(record.input) ? null : matches(question, record.input) ? 'correct' : 'incorrect';
    record.finished = isAnswered(record.input);
  } else {
    record.selected = [...record.selected, answer];
    record.input = multiple ? [...record.selected] : oldRecord.input ?? answer;
    const evaluated = !multiple || record.selected.length === (question.correctAnswer as number[]).length;
    if (evaluated) {
      const attempt = {
        userAnswer: multiple ? [...record.selected] : answer,
        isCorrect: matches(question, multiple ? record.selected : answer),
      };
      record.feedback = attempt.isCorrect ? 'correct' : 'incorrect';
      record.outcome = oldRecord.outcome ?? record.feedback;
      record.finished = multiple || attempt.isCorrect || !state.options.continueTillCorrect;
      record.attempts = [...oldRecord.attempts, attempt];
      submissions.push({ question, ...attempt });
    }
  }
  state.records[state.index] = record;
  return success();
}
