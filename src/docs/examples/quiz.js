const quiz = {
  quizTitle: 'React essentials',
  quizSynopsis: 'Try a single-answer question and a multiple-answer question about React.',
  questions: [
    {
      question: 'Which hook adds local state to a component?',
      questionType: 'text',
      answerSelectionType: 'single',
      answers: ['useState', 'useEffect', 'useContext'],
      correctAnswer: '1',
      point: 5,
      explanation: 'useState returns the current state and a function to update it.',
    },
    {
      question: 'Which of these are React hooks?',
      questionType: 'text',
      answerSelectionType: 'multiple',
      answers: ['useEffect', 'useContext', 'createRoot'],
      correctAnswer: [1, 2],
      point: 10,
      explanation: 'useEffect and useContext are hooks. createRoot mounts an application.',
    },
  ],
};

export default quiz;
