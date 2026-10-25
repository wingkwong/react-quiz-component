'use client';
import { useState } from 'react';
import Quiz, { type QuizProps, type QuestionSummary } from 'react-quiz-component';
import { quiz } from './quiz';

type Submission = Parameters<NonNullable<QuizProps['onQuestionSubmit']>>[0];

export default function CallbacksExample() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [summary, setSummary] = useState<QuestionSummary | null>(null);

  return (
    <div>
      <Quiz
        quiz={quiz}
        showDefaultResult={false}
        onQuestionSubmit={(data) => setSubmissions((previous) => [...previous, data])}
        onComplete={setSummary}
      />
      <section aria-label="Callback payloads">
        <h2>Submitted answers ({submissions.length})</h2>
        <pre style={{ overflow: 'auto', maxHeight: 320 }}>{JSON.stringify(submissions, null, 2)}</pre>
        <h2>Completion summary</h2>
        {summary ? (
          <pre style={{ overflow: 'auto', maxHeight: 320 }}>{JSON.stringify(summary, null, 2)}</pre>
        ) : <p>Complete the quiz to see the summary.</p>}
      </section>
    </div>
  );
}
