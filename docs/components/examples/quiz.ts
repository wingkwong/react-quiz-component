import type { Quiz } from 'react-quiz-component';

export const quiz: Quiz = {
  quizTitle: 'React essentials',
  quizSynopsis: 'Two questions about React hooks and rendering.',
  questions: [
    {
      question: 'Which hook stores local state?',
      questionType: 'text',
      answerSelectionType: 'single',
      answers: ['useState', 'useEffect', 'useRef'],
      correctAnswer: '1',
      point: 10,
      messageForCorrectAnswer: 'Correct! useState stores component state.',
      messageForIncorrectAnswer: 'useState is the hook for local state.',
      explanation: 'useState returns the current value and a setter.',
    },
    {
      question: 'Which APIs render React content? Pick two.',
      questionType: 'text',
      answerSelectionType: 'multiple',
      answers: ['createRoot', 'renderToString', 'querySelector'],
      correctAnswer: [1, 2],
      point: 20,
      explanation:
        'createRoot renders in the browser; renderToString renders HTML on the server.',
    },
  ],
};
