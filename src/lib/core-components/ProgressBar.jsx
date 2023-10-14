import React from 'react';


const ProgressBar = ({ currentQuestion, totalQuestions }) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const remainingQuestions = totalQuestions - currentQuestion;

  // Inline styles for the progress bar
  const progressBarContainerStyles = {
    position: 'relative',
    marginBottom:'20px'
  };

  const progressBarStyles = {
    backgroundColor: 'white',
    height: '20px',
    width: '100%',
    maxWidth: '4xl',
    borderRadius: '50px',
    position: 'relative',
  };

  const fillStyles = {
    backgroundColor: 'red',
    height: '20px',
    borderRadius: '50px',
    width: `${progress}%`,
    transition: 'width 1s ease-in-out',
  };

  const textStyles = {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
  };

  // Inline styles for question count


  return (
    <div style={progressBarContainerStyles}>
      <div style={progressBarStyles}>
        <div style={fillStyles}>
          <span style={textStyles}>{progress}%</span>
        </div>
      </div>
  
    </div>
  );
};

export default ProgressBar;
