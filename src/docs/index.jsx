import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import Quiz from '../lib/Quiz';
import quiz from './quiz';

const App = function () {
  const [quizResult, setQuizResult] = useState();

  useEffect(() => {
    if (quizResult) {
    }
  }, [quizResult]);

  return (
    <Quiz
      quiz={quiz}
      shuffle
      // showInstantFeedback
      // continueTillCorrect
      onComplete={setQuizResult}
      revealAnswerOnSubmit
      allowNavigation
    />
  );
};

render(<App />, document.getElementById('app'));
