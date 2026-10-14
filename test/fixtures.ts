import type { Quiz } from '../src/lib/types';

export const quiz: Quiz = {
  quizTitle: 'Test quiz', quizSynopsis: 'Introduction',
  questions: [
    { question: 'Pick B', questionType: 'text', answerSelectionType: 'single',
      answers: ['A', 'B', 'C'], correctAnswer: '2', point: '5' },
    { question: 'Pick X and Z', questionType: 'text', answerSelectionType: 'multiple',
      answers: ['X', 'Y', 'Z'], correctAnswer: [1, 3], point: 10 },
  ],
};
export const singleQuiz: Quiz = { ...quiz, questions: [quiz.questions[0]] };
