import React from "react";
import { render } from "react-dom";
import Quiz from "../../lib/Quiz";
import {quiz} from './quiz';
import "./styles.css";

function App() {
  return (
    <div>
      <Quiz quiz={quiz}/>
    </div>
  );
}

render(<App />, document.getElementById("app"));
