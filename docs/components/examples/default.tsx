'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function DefaultExample() {
  return <Quiz quiz={quiz} showInstantFeedback enableProgressBar />;
}
