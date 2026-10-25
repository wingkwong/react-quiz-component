import library = require('react-quiz-component');
import Quiz, { useQuiz, QuizProvider } from 'react-quiz-component';
import type { Quiz as QuizData, QuizProps, QuizController } from 'react-quiz-component';
import { createElement } from 'react';

const data: QuizData = { quizTitle: 'Typed CommonJS quiz', questions: [] };
const props: QuizProps = { quiz: data, allowQuit: true };
const options: library.UseQuizOptions = { quiz: data };
const hook: typeof library.useQuiz = library.useQuiz;
const controller: () => QuizController = () => useQuiz(options);
createElement(library, props);
createElement(library.default, props);
createElement(Quiz, props);
createElement(QuizProvider, { quiz: data, children: null });
// @ts-expect-error The callable CommonJS export still requires quiz data.
createElement(library, {});
void [hook, controller];
