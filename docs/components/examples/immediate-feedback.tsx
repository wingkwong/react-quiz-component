'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function ImmediateFeedbackExample() {
  return <Quiz quiz={quiz} showInstantFeedback showCorrectAnswer />;
}
