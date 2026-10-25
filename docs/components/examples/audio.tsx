'use client';
import Quiz, { type Quiz as QuizData } from 'react-quiz-component';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const quiz: QuizData = {
  quizTitle: 'Listen and count',
  quizSynopsis: 'Play the short clip or read its text alternative, then answer.',
  questions: [
    {
      question: 'How many tones are in the clip?',
      questionType: 'text',
      answerSelectionType: 'single',
      questionAudio: `${basePath}/audio/two-tones.wav`,
      questionAudioLabel: 'Listen to the tone sequence',
      questionAudioTranscript: 'Two short tones of the same pitch, separated by silence.',
      answers: ['One tone', 'Two tones', 'Three tones'],
      correctAnswer: '2',
      point: 10,
      explanation: 'The clip plays two tones with a short pause between them.',
    },
  ],
};

export default function AudioExample() {
  return <Quiz quiz={quiz} showInstantFeedback />;
}
