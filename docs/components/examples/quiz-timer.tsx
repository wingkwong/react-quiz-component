'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function QuizTimerExample() {
  return <Quiz quiz={quiz} timer={60} allowPauseTimer />;
}
