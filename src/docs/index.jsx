import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import Quiz from '../lib/Quiz';
import quiz from './quiz';

function App() {
  const [quizResult, setQuizResult] = useState();

  return (
    <Quiz
      quiz={quiz}
      shuffle
      // showInstantFeedback
      // continueTillCorrect
      onComplete={setQuizResult}
      onQuestionSubmit={(obj) => console.log('user question results:', obj)}
      disableSynopsis
      // revealAnswerOnSubmit
      // allowNavigation
    />
  );
}

render(<App />, document.getElementById('app'));
