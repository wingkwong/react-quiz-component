import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Question from './Question';
import "./styles.css";

class Quiz extends Component {
  constructor(props){
    super(props);
    this.state = {
      start: false,
    }
    this.start = this.start.bind(this);
  }

  start = () => {
    this.setState({start: true})
  }

  render() {
    let quiz = this.props.quiz;
    let questions = quiz.questions;
    return (
      <div className="react-quiz-container">
        {!this.state.start &&
          <div>
            <h2>{quiz.quizTitle}</h2>
            <div>{quiz.questions.length} Questions</div>
            <div className="startQuizWrapper">
              <button onClick={() => this.start()} className="startQuizBtn btn">Start Quiz</button>
            </div>
          </div>
        }

        {
          this.state.start && <Question questions={questions}/>
        }
      </div>
    );
  }
}

Quiz.propTypes = {
  quiz: PropTypes.object
};

export default Quiz;
