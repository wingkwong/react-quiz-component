import React from 'react';

function ProgressBar({
  progressBarColor, progress, height, quizLength,
}) {
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
    width: `${progressUnit * progress}%`,
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
        {`${Math.round(
          progressUnit * progress,
        )}%`}
      </span>
    </div>
  );
}

ProgressBar.defaultProps = {
  progressBarColor: '#9de1f6', // Set a default value for bgcolor
  height: '25px', // Set a default value for bar's heigth
};

export default ProgressBar;
