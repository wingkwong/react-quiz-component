import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Question from './Question';
import Answer from './Answer';

class Result extends Component {
  constructor(props){
    super(props);
    this.state = {
      score : 0
    }
  }

  componentDidMount(){
    const {score} = this.state;
    const {correctAns, answers} = this.props;
    let tmpScore = score;
    answers.map((answer,index)=>{
        if(answer == correctAns[index]){
          tmpScore = tmpScore + 1;
        }
        return this.setState({
          score: tmpScore
        })
    })

  }

  render() {
    const {score} = this.state;
    const {questions, answers, correctAns} = this.props;
    const renderQuestion =
      questions.map((question, index)=>{
            return (<div className="result-question" key={index}>
                <Question currentQuestion={question}/>
                <Answer questionType={question.questionType} answers={question.answers} userAnswers={answers} renderInResult={true} correctAns={correctAns} qIdx={index}/>
            </div>)
          })

    const renderResult =
          <div>
           <h1> Your score: {score}/{questions.length}</h1>
          </div>
        
    return (
      <div className="result-container">
          {renderResult}
          {renderQuestion}
      </div>
    );
  }
}

Result.propTypes = {
  correctAns: PropTypes.array,
  answers: PropTypes.array,
  questions: PropTypes.array,
};

export default Result;
