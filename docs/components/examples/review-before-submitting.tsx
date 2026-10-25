'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function ReviewBeforeSubmittingExample() {
  return <Quiz quiz={quiz} revealAnswerOnSubmit allowNavigation />;
}
