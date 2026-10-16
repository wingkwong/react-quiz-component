import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { createSession, getQuizState, quizReducer } from './engine';
import type { Command, EngineState, Transition } from './engine';
import type { ActionResult, QuizActions, QuizController, UseQuizOptions } from './types';

export function useQuiz(options: UseQuizOptions): QuizController {
  const latestOptions = useRef(options);
  useEffect(() => { latestOptions.current = options; }, [options]);
  const [session, publish] = useReducer((_previous: EngineState, next: EngineState) => next, options, createSession);
  // Actions also update this ref so multiple actions in one React batch see the latest transition.
  const current = useRef(session);
  const lastTick = useRef<number | null>(null);
  const applyTransition = useCallback((transition: Transition): ActionResult => {
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

  const execute = useCallback((command: Command): ActionResult => {
    const now = performance.now();
    // Reconcile time before every action as well as scheduled updates, so a
    // throttled callback cannot allow answers or a pause after the deadline.
    if (current.current.status === 'active' && current.current.remaining !== undefined) {
      const elapsed = lastTick.current === null ? 0 : Math.max(0, now - lastTick.current) / 1000;
      lastTick.current = now;
      const timed = quizReducer(current.current, { type: 'tick', elapsed });
      applyTransition(timed);
      // A completion callback may reset the session. Do not apply the expired
      // interaction to that new session.
      if (timed.completed && command.type !== 'tick') return { ok: false, reason: 'invalid-state' };
    }
    if (command.type === 'tick') return { ok: true };
    const transition = quizReducer(current.current, command);
    if (transition.result.ok && (command.type === 'start' || command.type === 'resume')) {
      lastTick.current = now;
    }
    return applyTransition(transition);
  }, [applyTransition]);

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
      lastTick.current = next.status === 'active' ? performance.now() : null;
      publish(next);
      return next.status === 'invalid' ? { ok: false, reason: 'invalid-quiz' } : { ok: true };
    },
  }), [execute]);

  useEffect(() => {
    if (session.status !== 'active' || session.options.timer === undefined) return undefined;
    if (lastTick.current === null) lastTick.current = performance.now();
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const remaining = current.current.remaining;
      if (current.current.status !== 'active' || remaining === undefined) return;
      // Schedule the next display boundary, including fractional time retained
      // across pauses, and catch up in one transition if the callback is late.
      const delay = (remaining - Math.ceil(remaining) + 1) * 1000;
      timeout = setTimeout(() => { execute({ type: 'tick' }); schedule(); }, Math.max(1, delay));
    };
    schedule();
    return () => clearTimeout(timeout);
    // The options object identifies a session, including an active-to-active reset.
  }, [execute, session.status, session.options]);

  return useMemo(() => ({ state: getQuizState(session), actions }), [session, actions]);
}
