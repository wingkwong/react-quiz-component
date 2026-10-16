import React from 'react';
import type { CSSProperties } from 'react';
import type { ProgressBarProps } from '../types';

function ProgressBar({
  progressBarColor = 'var(--color-primary)',
  progress,
  height = '6px',
  quizLength,
  isEndQuiz,
}: ProgressBarProps) {
  const percentage = isEndQuiz ? 100 : quizLength > 0 ? Math.min(100, Math.max(0, (progress - 1) * 100 / quizLength)) : 0;

  return (
    <div className="quiz-progress-wrapper">
      <progress className="quiz-progress" aria-label={`${Math.round(percentage)}%`}
        max={100} value={percentage}
        style={{ height, '--quiz-progress-color': progressBarColor } as CSSProperties} />
      <span className="quiz-progress-label" aria-hidden="true">{Math.round(percentage)}%</span>
    </div>
  );
}

export default ProgressBar;
