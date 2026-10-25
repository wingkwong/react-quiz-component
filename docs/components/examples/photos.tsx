'use client';
import Quiz, { type Quiz as QuizData } from 'react-quiz-component';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const quiz: QuizData = {
  quizTitle: 'Shapes in pictures',
  quizSynopsis: 'Try a question image followed by image answer choices.',
  questions: [
    {
      question: 'Which shape is shown above the answers?',
      questionType: 'text',
      questionPic: `${basePath}/images/square.svg`,
      questionPicAlt: 'A purple square',
      answerSelectionType: 'single',
      answers: ['Circle', 'Square'],
      correctAnswer: '2',
      point: 10,
      explanation: 'The picture shows a square with four equal sides.',
    },
    {
      question: 'Which picture shows a circle?',
      questionType: 'photo',
      answerSelectionType: 'single',
      answers: [`${basePath}/images/circle.svg`, `${basePath}/images/square.svg`],
      answerAltTexts: ['Blue circle', 'Purple square'],
      correctAnswer: '1',
      point: 10,
      explanation: 'The blue shape is a circle.',
    },
  ],
};

export default function PhotosExample() {
  return <Quiz quiz={quiz} showInstantFeedback />;
}
