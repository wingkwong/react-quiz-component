'use client';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function ImmediateStartExample() {
  return <Quiz quiz={quiz} disableSynopsis />;
}
