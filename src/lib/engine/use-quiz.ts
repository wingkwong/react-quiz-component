import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { createSession, getQuizState, quizReducer } from './engine';
import type { Command, EngineState } from './engine';
import type { ActionResult, QuizActions, QuizController, UseQuizOptions } from './types';

export function useQuiz(options: UseQuizOptions): QuizController {
  const latestOptions = useRef(options);
  useEffect(() => { latestOptions.current = options; }, [options]);
  const [session, publish] = useReducer((_previous: EngineState, next: EngineState) => next, options, createSession);
  // Actions also update this ref so multiple actions in one React batch see the latest transition.
  const current = useRef(session);
  const execute = useCallback((command: Command): ActionResult => {
    const transition = quizReducer(current.current, command);
    if (!transition.result.ok) return transition.result;
    current.current = transition.state;
    publish(transition.state);
    const { onQuestionSubmit, onComplete } = latestOptions.current;
    // Callback payloads are detached from the engine: consumers may retain or modify them.
    const submissions = transition.submissions.map((data) => ({
      ...data,
      question: {
        ...data.question, answers: [...data.question.answers],
        correctAnswer: Array.isArray(data.question.correctAnswer)
          ? [...data.question.correctAnswer] : data.question.correctAnswer,
      },
      userAnswer: Array.isArray(data.userAnswer) ? [...data.userAnswer] : data.userAnswer,
    }));
    const summary = transition.completed ? getQuizState(transition.state).summary : undefined;
    try {
      submissions.forEach((data) => onQuestionSubmit?.(data));
    } finally {
      if (summary) onComplete?.({
        ...summary,
        questions: summary.questions.map((question) => ({
          ...question, answers: [...question.answers],
          correctAnswer: Array.isArray(question.correctAnswer) ? [...question.correctAnswer] : question.correctAnswer,
        })),
        userInput: summary.userInput.map((answer) => Array.isArray(answer) ? [...answer] : answer),
      });
    }
    return transition.result;
  }, []);

  const actions = useMemo<QuizActions>(() => ({
    start: () => execute({ type: 'start' }),
    selectAnswer: (answer) => execute({ type: 'select', answer }),
    nextQuestion: () => execute({ type: 'next' }),
    previousQuestion: () => execute({ type: 'previous' }),
    goToQuestion: (index) => execute({ type: 'go', index }),
    submitQuiz: () => execute({ type: 'submit' }),
    pauseTimer: () => execute({ type: 'pause' }),
    resumeTimer: () => execute({ type: 'resume' }),
    setResultFilter: (filter) => execute({ type: 'filter', filter }),
    reset: () => {
      const next = createSession(latestOptions.current);
      current.current = next;
      publish(next);
      return next.status === 'invalid' ? { ok: false, reason: 'invalid-quiz' } : { ok: true };
    },
  }), [execute]);

  useEffect(() => {
    if (session.status !== 'active' || session.options.timer === undefined) return undefined;
    const interval = setInterval(() => execute({ type: 'tick' }), 1000);
    return () => clearInterval(interval);
    // The options object identifies a session, including an active-to-active reset.
  }, [execute, session.status, session.options]);

  return useMemo(() => ({ state: getQuizState(session), actions }), [session, actions]);
}
