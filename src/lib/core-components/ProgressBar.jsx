import React from 'react';
import quiz from './../../docs/quiz';

const ProgressBar = ({ bgcolor, progress, height }) => {
  const valueofEachProgressUnit = 100 / quiz.questions.length;

  const Parentdiv = {
    height: height,
    width: '100%',
    backgroundColor: 'whitesmoke',
    borderRadius: 40,
    margin: 20,
  };

  const Childdiv = {
    height: '100%',
    width: `${valueofEachProgressUnit * progress}%`,
    backgroundColor: bgcolor,
    borderRadius: 40,
    textAlign: 'center',
  };

  const progressText = {
    padding: 10,
    color: 'black',
    fontWeight: 900,
  };

  return (
    <div style={Parentdiv}>
      <div style={Childdiv}>
        <span style={progressText}>{`${progress}`}</span>
      </div>
    </div>
  );
};

ProgressBar.defaultProps = {
  bgcolor: "#D0D4CA", // Set a default value for bgcolor
};

export default ProgressBar;
