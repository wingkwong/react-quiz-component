'use client';
import Quiz, { type QuestionSummary } from 'react-quiz-component';
import { quiz } from './quiz';

function renderResults(summary: QuestionSummary) {
  return (
    <section aria-label="Custom quiz results">
      <h2>Your results</h2>
      <p>Score: {summary.correctPoints} / {summary.totalPoints}</p>
      <p>Correct answers: {summary.numberOfCorrectAnswers} / {summary.numberOfQuestions}</p>
    </section>
  );
}

export default function CustomResultsExample() {
  return <Quiz quiz={quiz} showDefaultResult={false} customResultPage={renderResults} />;
}
