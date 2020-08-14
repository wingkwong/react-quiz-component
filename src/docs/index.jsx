import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import Quiz from "../../lib/Quiz";
import { quiz } from './quiz';

function App() {
  const [quizResult, setQuizResult] = useState()

  useEffect(() => {
      if(quizResult) {
          console.log('quizResult', quizResult);
      }
  }, [quizResult])

  return (
    <>
      <Quiz
        quiz={quiz}
        shuffle={false}
        showInstantFeedback={false}
        continueTillCorrect={false}
        onComplete={setQuizResult}
      />
    </>
  );
}

render(<App />, document.getElementById("app"));
