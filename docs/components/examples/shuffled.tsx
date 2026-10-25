'use client';
import { useState } from 'react';
import Quiz from 'react-quiz-component';
import { quiz } from './quiz';

export default function ShuffledExample() {
  const [session, setSession] = useState(0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setSession((current) => current + 1)}
        style={{ border: '1px solid currentColor', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}
      >
        Restart quiz
      </button>
      <Quiz key={session} quiz={quiz} shuffle shuffleAnswer />
    </div>
  );
}
