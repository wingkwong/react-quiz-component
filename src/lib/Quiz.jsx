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

  shuffleQuestions = (questions) => {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
  }

  render() {
    const { quiz, shuffle } = this.props;
    if(!quiz) {
      console.error("Quiz object is required.");
      return (null);
    } 
    
    let questions = quiz.questions;
      if(shuffle) {
        questions = this.shuffleQuestions(questions);
      }
      return (
        <div className="react-quiz-container">
          {!this.state.start &&
            <div>
              <h2>{quiz.quizTitle}</h2>
              <div>{quiz.questions.length} Questions</div>
              { quiz.quizSynopsis && 
                  <div className="quiz-synopsis">
                      {quiz.quizSynopsis}
                  </div> 
              }
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
  quiz: PropTypes.object,
  shuffle: PropTypes.bool
};

export default Quiz;
