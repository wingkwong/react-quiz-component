import React, { Component } from 'react';
import Quiz from './containers/Quiz';
import {quiz} from './quiz';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      quiz: quiz
    }
  }

  render() {
    let { quiz } = this.state;

    return (
      <div className="react-quiz-container">
          <Quiz 
            quiz={quiz}
          />
      </div>
    );
  }
}

export default App;
