import React, { CSSProperties } from 'react';
import { ProgressBarProps } from '../types';

function ProgressBar({
  progressBarColor = '#9de1f6',
  progress,
  height = '25px',
  quizLength,
  isEndQuiz,
}: ProgressBarProps) {
  const fixedProgress = progress - 1;
  const progressUnit = 100 / quizLength;

  const progressBarContainer: CSSProperties = {
    width: '100%',
    backgroundColor: 'var(--color-progress-track)',
    height,
    borderRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  };

  const progressBar: CSSProperties = {
    width: isEndQuiz ? '100%' : `${progressUnit * fixedProgress}%`,
    height: '100%',
    backgroundColor: progressBarColor,
    transition: 'width 0.3s ease',
  };

  const progressBarLabel: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    lineHeight: '20px',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  };

  return (
    <div className="quiz-progress" style={progressBarContainer}>
      <div className="quiz-progress__bar" style={progressBar} />
      <span className="quiz-progress__label" style={progressBarLabel}>
        {isEndQuiz ? '100%' : `${Math.round(progressUnit * fixedProgress)}%`}
      </span>
    </div>
  );
}

export default ProgressBar;
