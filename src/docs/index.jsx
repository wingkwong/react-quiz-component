import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import Quiz from "../../lib/Quiz";
import { quiz } from './quiz';

function App() {
  const [quizResult, setQuizResult] = useState(undefined)

  useEffect(() => {
    console.log('quizResult', quizResult);
  }, [quizResult])

  return (
    <div>
      <Quiz 
        quiz={quiz}
        shuffle={true}
        showInstantFeedback={true}
        continueTillCorrect={true}
        onComplete={setQuizResult}
      />
    </div>
  );
}

render(<App />, document.getElementById("app"));
