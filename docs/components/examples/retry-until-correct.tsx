'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function RetryUntilCorrectExample() {
  return <Quiz quiz={quiz} continueTillCorrect showInstantFeedback />;
}
