import React, { createContext, useContext } from 'react';
import { useQuiz } from './use-quiz';
import type { QuizController, QuizProviderProps } from './types';

const QuizContext = createContext<QuizController | undefined>(undefined);

export function QuizProvider({ children, ...options }: QuizProviderProps) {
  const controller = useQuiz(options);
  return <QuizContext.Provider value={controller}>{children}</QuizContext.Provider>;
}

export function useQuizContext(): QuizController {
  const controller = useContext(QuizContext);
  if (!controller) throw new Error('useQuizContext must be used within a QuizProvider.');
  return controller;
}
