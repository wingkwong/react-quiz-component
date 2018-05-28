import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Answer extends Component {
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render() {
    const {userAnswers, answers, questionType, renderInResult, correctAns, qIdx } = this.props;
    const answerKey = ["A", "B", "C", "D"];
    const renderAnswer = 
      answers.map((answer, index)=>{
        let value = answerKey[(index)] + ". " + answer
        return (
          ( questionType=='text' && (<button className="btn-large" key={index} data-value={answer} onClick={() => this.props.handleClick(index)}>{value}</button>) ) ||
          ( questionType=='photo' && (<button><img key={index} alt="" src={answer} onClick={() => this.props.handleClick(index)}/></button>) )
        )
      })
    const renderAnswerInResult = 
    renderInResult &&
      answers.map((answer, index)=>{
        let c = ""
        if( ((index+1) == correctAns[qIdx]) ){
          c = "btn-success"
        }else if( ((index+1) == userAnswers[qIdx]) && (correctAns[qIdx] != userAnswers[qIdx]) ){
          c = "btn-danger"
        }
         let value = answerKey[(index)] + ". " + answer
        return (
          ( questionType=='text' && (<button className={`${c} btn-large`} key={index} data-value={answer}>{value}</button>) ) ||
          ( questionType=='photo' && (<button className={`${c} img-answer`}><img key={index} alt="" src={answer}/></button>) )
        )
      })

    return (
      <div className="answer-container">
         {renderInResult == true? (<div className="result-answer">{renderAnswerInResult}</div>) : (<div>{renderAnswer}</div>) }
      </div>
    );
  }
}

Answer.propTypes = {
  userAnswers: PropTypes.array,
  answers: PropTypes.array,
  questionType: PropTypes.string,
  renderInResult: PropTypes.bool,
  correctAns: PropTypes.array,
  qIdx: PropTypes.number,
  handleClick: PropTypes.func
};

export default Answer;
