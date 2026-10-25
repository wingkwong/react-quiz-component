'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function SubmitAndQuitExample() {
  return <Quiz quiz={quiz} timer={60} allowPauseTimer allowQuit />;
}
