import { createElement } from 'react';
import Quiz, { useQuiz, QuizProvider, useQuizContext } from 'react-quiz-component';
import type { Quiz as QuizData, QuizState, QuizActions, ActionResult } from 'react-quiz-component';
import type { QuizController, UseQuizOptions } from 'react-quiz-component';

const data: QuizData = { quizTitle: 'Typed quiz', questions: [] };
const options: UseQuizOptions = { quiz: data };
const controller: QuizController = useQuiz(options);
const state: QuizState = controller.state;
const actions: QuizActions = controller.actions;
const result: ActionResult = actions.start();
void [Quiz, useQuiz, QuizProvider, useQuizContext, state, result];

createElement(Quiz, { quiz: data });
// The provider requires children in its props even when the child is null.
const providerProps = { quiz: data, children: null };
createElement(QuizProvider, providerProps);

createElement(Quiz, { quiz: data, showCorrectAnswer: true });
const revealOptions: UseQuizOptions = { quiz: data, showCorrectAnswer: true };
void revealOptions;
