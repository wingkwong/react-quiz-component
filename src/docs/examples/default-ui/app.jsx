import React, { useState } from 'react';
import Quiz from 'react-quiz-component';
import quiz from '../quiz';

export default function DefaultUiExample() {
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState(null);

  return (
    <>
      <Quiz key={attempt} quiz={quiz} showInstantFeedback enableProgressBar
        timer={120} allowPauseTimer onComplete={setSummary} />
      {summary && (
        <div className="example-completion">
          <output>Completed: {summary.correctPoints} / {summary.totalPoints} points.</output>
          <button type="button" onClick={() => {
            setSummary(null);
            setAttempt((value) => value + 1);
          }}>Try again</button>
        </div>
      )}
    </>
  );
}
