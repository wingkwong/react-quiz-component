'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function QuestionTimerExample() {
  return <Quiz quiz={quiz} questionTimer={15} allowPauseTimer />;
}
