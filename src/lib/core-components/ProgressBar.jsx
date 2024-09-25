import React from 'react';

function ProgressBar({
  progressBarColor = '#9de1f6', progress, height = '25px', quizLength, isEndQuiz,
}) {
  const fixedProgress = progress - 1;
  const progressUnit = 100 / quizLength;

  const progressBarContainer = {
    width: '100%',
    backgroundColor: '#D0D4CA',
    height,
    borderRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  };

  const progressBar = {
    width: isEndQuiz ? '100%' : `${progressUnit * fixedProgress}%`,
    height: '100%',
    backgroundColor: progressBarColor,
    transition: 'width 0.3s ease',
  };

  const progressBarLabel = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    lineHeigth: '20px',
    fontSize: '16px',
    color: '#000',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  };

  return (
    <div style={progressBarContainer}>
      <div style={progressBar} />
      <span style={progressBarLabel}>
        {isEndQuiz ? '100%' : `${Math.round(progressUnit * fixedProgress)}%`}
      </span>
    </div>
  );
}

export default ProgressBar;
